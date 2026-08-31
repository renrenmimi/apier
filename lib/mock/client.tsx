"use client";

// Registers the mock Service Worker and exposes an honest readiness state.
//
// The inspector must never quietly fall through to the network: if the worker
// is not in control, a request to /mock-api would hit the server and return a
// 404 HTML page, which would teach the learner something false. So readiness is
// proven, not assumed -- we probe /mock-api/__ready and require the response to
// carry the worker's own marker before Send is enabled.
//
// This file holds no user-facing copy; the inspector renders the state
// bilingually so both languages stay in one place.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_BASE } from "./engine";

export type MockPhase =
  /** Registering or waiting for the worker to take control. */
  | "starting"
  /** The worker answered the readiness probe; requests are browser-local. */
  | "ready"
  /** No Service Worker support, or an insecure context. */
  | "unsupported"
  /** Registration or the readiness probe failed. */
  | "failed";

export interface MockState {
  phase: MockPhase;
  /** False when IndexedDB is unavailable: usable now, but lost on refresh. */
  durable: boolean;
  /** Diagnostic detail for the failed phase. */
  reason?: string;
}

const MockContext = createContext<MockState>({ phase: "starting", durable: true });

const READY_URL = `${MOCK_BASE}/__ready`;
const PROBE_ATTEMPTS = 20;
const PROBE_INTERVAL_MS = 250;

/** Resolves only if the response genuinely came from our worker. */
async function probe(): Promise<{ ok: boolean; durable: boolean }> {
  try {
    const res = await fetch(READY_URL, { cache: "no-store" });
    if (!res.ok) return { ok: false, durable: true };
    // A network fall-through cannot set this header.
    if (res.headers.get("x-mock-scope") !== "browser-local") return { ok: false, durable: true };
    const body = (await res.json()) as { ready?: boolean; durable?: boolean };
    return { ok: body.ready === true, durable: body.durable !== false };
  } catch {
    return { ok: false, durable: true };
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function MockApiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MockState>({ phase: "starting", durable: true });

  useEffect(() => {
    let cancelled = false;
    const fail = (reason: string) => {
      if (!cancelled) setState({ phase: "failed", durable: true, reason });
    };

    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      setState({ phase: "unsupported", durable: true });
      return;
    }
    // Service Workers only run in secure contexts; localhost counts as secure.
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setState({
        phase: "unsupported",
        durable: true,
        reason: "insecure context",
      });
      return;
    }

    (async () => {
      try {
        await navigator.serviceWorker.register("/mock-sw.js", { scope: "/" });
      } catch (err) {
        fail(err instanceof Error ? err.message : "registration failed");
        return;
      }

      // Poll rather than trust `controller`: skipWaiting + clients.claim make
      // control arrive shortly after activation, and the probe is the only
      // thing that proves the worker is actually answering /mock-api.
      for (let i = 0; i < PROBE_ATTEMPTS && !cancelled; i++) {
        const { ok, durable } = await probe();
        if (cancelled) return;
        if (ok) {
          setState({ phase: "ready", durable });
          return;
        }
        await sleep(PROBE_INTERVAL_MS);
      }
      fail("the mock worker did not take control in time");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <MockContext.Provider value={state}>{children}</MockContext.Provider>;
}

export const useMockApi = () => useContext(MockContext);
