# The mock API

The course lets you fire real HTTP requests at a real API and inspect what comes
back. That API is not a third-party service and, on the deployed site, it is not
a server either: it runs inside your own browser.

## Why it is not a server

The first implementation kept the mock data in a module-level variable on the
server. That works on one developer's laptop and breaks in production:

- visitors served by the same warm serverless instance share one dataset, so one
  person's `PUT` rewrites what everybody else sees;
- when a different instance answers, the data silently reverts;
- `POST /api/reset` resets whichever instance happens to receive it.

An interactive lesson cannot rest on mutable process memory, so the state moved
to where it belongs: the visitor.

## Architecture

```
browser tab ──fetch('/mock-api/...')──▶ Service Worker ──▶ IndexedDB
                                              │
                                              └── lib/mock/engine.ts
```

- **`/mock-api/**`** is owned by a Service Worker (`sw/mock-sw.ts`). Nothing on
  the server answers that path.
- Each browser seeds its own database on first visit and stores it in IndexedDB,
  so the data survives a refresh until the visitor resets it.
- `lib/mock/engine.ts` is one pure function, `handleMockRequest(store, request)`.
  It reads no ambient state, so the worker, the local dev server and the test
  suite all run the identical implementation against different stores.

Because the store is per browser, so is everything built on it: mutations,
`Idempotency-Key` records, and the rate-limit window.

## Readiness

A Service Worker does not control the page the instant it is registered. Until
it does, a request to `/mock-api` would reach the network and return a 404 HTML
page — a wrong answer dressed up as a lesson.

So readiness is proven, not assumed. The client first waits until the worker
controls the page. On a first visit that happens through `clients.claim()`
during activation. A hard reload (Shift+Reload) loads the page without a
controller while the worker is already active, so the client asks that worker
to claim the page. Only then does it probe `/mock-api/__ready`, so the probe
never reaches the network, and it requires the worker's own
`X-Mock-Scope: browser-local` header before enabling **Send**. Until then, and whenever the worker cannot start at all, the inspector
disables its controls and says why. It never falls back to the server.

If IndexedDB is unavailable (a private window, blocked storage), the worker
still serves requests from memory and the UI states that changes will not
survive a refresh.

## What curl can and cannot do

`curl` is a separate process. It has no access to your browser's Service Worker,
so **no terminal command can reach the interactive mock**, on any host.

What a terminal can drive is the same engine running on a *local clone*:

```bash
npm run dev                                   # http://localhost:3300
curl -i http://localhost:3300/api             # the endpoint index
curl -i http://localhost:3300/api/posts/42    # ETag, Cache-Control, rate limits
```

That server-side mock lives at `/api`, keeps one store per server process, and
is **disabled on shared hosting** (it detects `VERCEL`, or an explicit
`APIER_DISABLE_SERVER_MOCK=1`). On the deployed site `/api` returns a short
explanation pointing at `/mock-api` instead of serving shared state.

The inspector's curl tab reflects this exactly: it is labelled *Run against a
local clone*, targets `http://localhost:3300/api/...`, and says in both
languages that it cannot reach the request shown above it.

## Offline

Once the worker is installed the mock itself needs no network at all. The site's
pages and assets are not precached, so loading the site still requires a
connection — the mock is independent of the network, the site is not.

## Teaching behaviour

Everything the chapters demonstrate is implemented for real:

| Behaviour | Where |
|---|---|
| `201` + `Location` | `POST /mock-api/posts` |
| `PUT` replaces, omitted fields disappear | `PUT /mock-api/posts/:id` |
| `PATCH` merges only what was sent | `PATCH /mock-api/posts/:id` |
| `204`, then `404` on a second delete | `DELETE /mock-api/posts/:id` |
| RFC 9457 `problem+json`, incl. field-level `422` | any error |
| `ETag` / `If-None-Match` → empty `304` | `GET /mock-api/posts/:id` |
| `Idempotency-Key` replays the first response | `POST /mock-api/posts` |
| `401` vs `403` | write endpoints, by token |
| `429` + `Retry-After` + `X-RateLimit-*` | 60 requests per minute, per visitor |
| GraphQL query, mutation, N+1 counter | `POST /mock-api/graphql` |
| Deterministic reset | `POST /mock-api/reset` |

Teaching knobs: `?delay=800` slows the response so timings are visible,
`?dataloader=1` batches GraphQL loads so `extensions.dbCalls` drops from 11 to 2.
Tokens are `apier-demo-token` (may write) and `apier-readonly-token` (403 on
write).

## Working on it

`sw/mock-sw.ts` is bundled to `public/mock-sw.js` by `scripts/build-sw.mjs`,
which runs automatically before `npm run dev` and `npm run build`. The generated
file is not committed. If you edit anything under `lib/mock/` or `sw/`, re-run
`npm run build:sw` (or just restart the dev server) and hard-reload the page so
the browser picks up the new worker.

```bash
npm run typecheck
npm run lint
npm run test:unit    # engine behaviour, no browser
npm run test:e2e     # real Chromium: isolation, persistence, the inspector
```
