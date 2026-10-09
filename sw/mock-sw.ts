/// <reference lib="webworker" />

// The visitor's mock API.
//
// This Service Worker owns /mock-api/** for one browser. Each visitor gets
// their own seeded database in IndexedDB, so POST/PUT/PATCH/DELETE, idempotency
// keys, rate limits and reset all operate on state nobody else can observe.
// Refreshing keeps that state; reset restores the deterministic seed.
//
// Only same-origin requests under MOCK_BASE are intercepted. Everything else --
// pages, assets, third-party calls the course demonstrates -- passes straight
// through untouched.

import { handleMockRequest, MOCK_BASE } from "../lib/mock/engine";
import { createSeedStore, SEED_VERSION, type MockStore } from "../lib/mock/seed";
import { loadStore, saveStore } from "../lib/mock/idb";

declare const self: ServiceWorkerGlobalScope;

/** Take over immediately so the first visit does not need a manual reload. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Take over a page that loaded without a controller.
 *
 * A hard reload (Shift+Reload) deliberately bypasses the worker, so the page
 * comes up uncontrolled. The worker is already active and never sees
 * `activate` again, so nothing would ever claim that page and /mock-api would
 * fall through to the network. The client asks for a claim instead.
 */
self.addEventListener("message", (event) => {
  const data = event.data as { type?: unknown } | null;
  if (data && data.type === "claim") event.waitUntil(self.clients.claim());
});

/**
 * In-memory mirror of the visitor's store.
 *
 * A Service Worker can be stopped at any moment, so IndexedDB remains the
 * source of truth; this is only a cache that avoids a read per request.
 */
let cached: MockStore | undefined;
/** False once IndexedDB has failed, so the UI can say state will not survive. */
let durable = true;

async function getStore(): Promise<MockStore> {
  if (cached) return cached;
  try {
    const stored = await loadStore();
    // A store written by an older seed is replaced, not migrated: its text,
    // its shape, or data an older engine allowed (a post whose author does
    // not exist) would otherwise outlive the deploy that fixed them.
    if (stored && stored.version === SEED_VERSION) {
      cached = stored;
      return cached;
    }
    // First visit for this browser, or a new seed version: seed and persist.
    const fresh = createSeedStore();
    cached = fresh;
    await saveStore(fresh);
    return fresh;
  } catch {
    // Storage is unavailable (private mode, blocked, quota). Stay usable for
    // this session and report the reduced guarantee through /__ready.
    durable = false;
    cached ??= createSeedStore();
    return cached;
  }
}

async function persist(store: MockStore): Promise<void> {
  if (!durable) return;
  try {
    await saveStore(store);
  } catch {
    durable = false;
  }
}

/**
 * Requests are serialised.
 *
 * Two overlapping mutations would otherwise read the same store, mutate their
 * own copy and race to persist, losing one of the writes. The mock is not a
 * throughput exercise, so a queue is the right trade.
 */
let queue: Promise<unknown> = Promise.resolve();
function serialise<T>(job: () => Promise<T>): Promise<T> {
  const next = queue.then(job, job);
  queue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function respond(request: Request): Promise<Response> {
  const store = await getStore();
  const { response, mutated } = await handleMockRequest(store, request, {
    basePath: MOCK_BASE,
    scope: "browser-local",
  });
  if (mutated) await persist(store);

  // The readiness probe additionally reports whether state is durable.
  const url = new URL(request.url);
  if (url.pathname === `${MOCK_BASE}/__ready`) {
    const body = await response.clone().json();
    return new Response(JSON.stringify({ ...body, durable }, null, 2), {
      status: response.status,
      headers: response.headers,
    });
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname !== MOCK_BASE && !url.pathname.startsWith(`${MOCK_BASE}/`)) return;

  event.respondWith(
    serialise(() => respond(event.request)).catch(
      (err: unknown) =>
        new Response(
          JSON.stringify(
            {
              type: "https://apier.dev/problems/mock-worker-failure",
              title: "Mock Worker Failure",
              status: 500,
              detail: String(err instanceof Error ? err.message : err),
            },
            null,
            2,
          ),
          {
            status: 500,
            headers: {
              "Content-Type": "application/problem+json; charset=utf-8",
              "X-Mock-Scope": "browser-local",
            },
          },
        ),
    ),
  );
});
