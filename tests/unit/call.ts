import { handleMockRequest, MOCK_BASE } from "../../lib/mock/engine";
import type { MockStore } from "../../lib/mock/seed";

export const WRITE = { Authorization: "Bearer apier-demo-token" };
export const READONLY = { Authorization: "Bearer apier-readonly-token" };
export const JSON_H = { "Content-Type": "application/json" };

/** Drives the engine the way a runtime would, with no ambient state. */
export async function call(
  store: MockStore,
  method: string,
  path: string,
  init: { body?: unknown; headers?: Record<string, string> } = {},
) {
  // delay=0 keeps the suite fast; the engine's timing knob is exercised in e2e.
  const url = new URL(`https://example.test${MOCK_BASE}${path}`);
  url.searchParams.set("delay", "0");
  const { response, mutated } = await handleMockRequest(
    store,
    new Request(url, {
      method,
      headers: init.headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    }),
    { basePath: MOCK_BASE },
  );
  const text = await response.text();
  // Parsed API payloads are dynamic by nature; assertions read them
  // structurally, which is exactly what `any` is for in a test helper.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body, e.g. 204 */
  }
  return { response, json, text, mutated };
}

/** POST /graphql as the inspector would send it. */
export function gql(
  store: MockStore,
  query: string,
  opts: { variables?: Record<string, unknown>; operationName?: string; headers?: Record<string, string>; path?: string } = {},
) {
  return call(store, "POST", opts.path ?? "/graphql", {
    headers: { ...JSON_H, ...opts.headers },
    body: { query, variables: opts.variables, operationName: opts.operationName },
  });
}
