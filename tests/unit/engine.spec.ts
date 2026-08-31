import { test, expect } from "@playwright/test";
import { handleMockRequest, MOCK_BASE } from "../../lib/mock/engine";
import { createSeedStore, type MockStore } from "../../lib/mock/seed";

const WRITE = { Authorization: "Bearer apier-demo-token" };
const READONLY = { Authorization: "Bearer apier-readonly-token" };
const JSON_H = { "Content-Type": "application/json" };

/** Drives the engine the way a runtime would, with no ambient state. */
async function call(
  store: MockStore,
  method: string,
  path: string,
  init: { body?: unknown; headers?: Record<string, string> } = {},
) {
  const req = new Request(`https://example.test${MOCK_BASE}${path}`, {
    method,
    headers: init.headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  // delay=0 keeps the suite fast; the engine's timing knob is exercised in e2e.
  const url = new URL(req.url);
  url.searchParams.set("delay", "0");
  const { response, mutated } = await handleMockRequest(
    store,
    new Request(url, { method, headers: init.headers, body: req.body ? await req.text() : undefined }),
    { basePath: MOCK_BASE },
  );
  const text = await response.text();
  // Parsed API payloads are dynamic by nature; assertions below read them
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

test("PUT replaces the resource and drops omitted fields", async () => {
  const store = createSeedStore();
  const before = (await call(store, "GET", "/posts/7")).json;
  expect(before.body.length).toBeGreaterThan(0);
  expect(before.authorId).toBeGreaterThan(0);

  const put = await call(store, "PUT", "/posts/7", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "only the title" },
  });

  expect(put.response.status).toBe(200);
  expect(put.json.title).toBe("only the title");
  expect(put.json.body).toBe("");
  expect(put.json.authorId).toBe(0);
  // Server-owned fields survive a replacement.
  expect(put.json.id).toBe(7);
  expect(put.json.createdAt).toBe(before.createdAt);
});

test("PATCH merges and preserves omitted fields", async () => {
  const store = createSeedStore();
  const before = (await call(store, "GET", "/posts/7")).json;

  const patch = await call(store, "PATCH", "/posts/7", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "only the title" },
  });

  expect(patch.response.status).toBe(200);
  expect(patch.json.title).toBe("only the title");
  expect(patch.json.body).toBe(before.body);
  expect(patch.json.authorId).toBe(before.authorId);
  expect(patch.json.status).toBe(before.status);
});

test("a repeated Idempotency-Key replays the first response", async () => {
  const store = createSeedStore();
  const headers = { ...WRITE, ...JSON_H, "Idempotency-Key": "charge-001" };
  const body = { title: "Charge", body: "once only" };

  const first = await call(store, "POST", "/posts", { headers, body });
  const second = await call(store, "POST", "/posts", { headers, body });

  expect(first.response.status).toBe(201);
  expect(second.json.id).toBe(first.json.id);
  expect(second.response.headers.get("x-idempotent-replay")).toBe("true");
  expect(store.posts.filter((p) => p.title === "Charge")).toHaveLength(1);
});

test("POST answers 201 with a Location header", async () => {
  const store = createSeedStore();
  const res = await call(store, "POST", "/posts", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "New", body: "text", authorId: 2 },
  });
  expect(res.response.status).toBe(201);
  expect(res.response.headers.get("location")).toBe(`${MOCK_BASE}/posts/${res.json.id}`);
});

test("DELETE answers 204, then 404, and stays idempotent in effect", async () => {
  const store = createSeedStore();
  const first = await call(store, "DELETE", "/posts/9", { headers: WRITE });
  const second = await call(store, "DELETE", "/posts/9", { headers: WRITE });

  expect(first.response.status).toBe(204);
  expect(first.text).toBe("");
  expect(second.response.status).toBe(404);
  // Idempotency is about the final state, not about matching status codes.
  expect(store.posts.some((p) => p.id === 9)).toBe(false);
});

test("401 without credentials, 403 with a read-only token", async () => {
  const store = createSeedStore();
  const anon = await call(store, "POST", "/posts", {
    headers: JSON_H,
    body: { title: "x", body: "y" },
  });
  const readonly = await call(store, "POST", "/posts", {
    headers: { ...READONLY, ...JSON_H },
    body: { title: "x", body: "y" },
  });

  expect(anon.response.status).toBe(401);
  expect(anon.response.headers.get("www-authenticate")).toContain("Bearer");
  expect(readonly.response.status).toBe(403);
});

test("errors use RFC 9457 problem+json", async () => {
  const store = createSeedStore();
  const missing = await call(store, "GET", "/posts/9999");
  expect(missing.response.status).toBe(404);
  expect(missing.response.headers.get("content-type")).toContain("application/problem+json");
  expect(missing.json).toMatchObject({ type: expect.any(String), title: expect.any(String), status: 404 });

  const invalid = await call(store, "POST", "/posts", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "", body: "" },
  });
  expect(invalid.response.status).toBe(422);
  expect(invalid.json.errors.map((e: { field: string }) => e.field)).toEqual(["title", "body"]);
});

test("ETag plus If-None-Match yields an empty 304", async () => {
  const store = createSeedStore();
  const first = await call(store, "GET", "/posts/42");
  const etag = first.response.headers.get("etag")!;
  expect(etag).toBeTruthy();

  const revalidated = await call(store, "GET", "/posts/42", { headers: { "If-None-Match": etag } });
  expect(revalidated.response.status).toBe(304);
  expect(revalidated.text).toBe("");

  const stale = await call(store, "GET", "/posts/42", { headers: { "If-None-Match": '"stale"' } });
  expect(stale.response.status).toBe(200);
});

test("rate limiting is per store, and 429 carries Retry-After", async () => {
  const busy = createSeedStore();
  const quiet = createSeedStore();

  let last = await call(busy, "GET", "/posts/1");
  for (let i = 0; i < 61; i++) last = await call(busy, "GET", "/posts/1");

  expect(last.response.status).toBe(429);
  expect(Number(last.response.headers.get("retry-after"))).toBeGreaterThan(0);

  // A second visitor's budget is untouched by the first one's spending.
  const fresh = await call(quiet, "GET", "/posts/1");
  expect(fresh.response.status).toBe(200);
  expect(fresh.response.headers.get("x-ratelimit-remaining")).toBe("59");
});

test("two stores never observe each other's mutations", async () => {
  const alice = createSeedStore();
  const bob = createSeedStore();

  await call(alice, "PUT", "/posts/7", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "ALICE WAS HERE" },
  });

  const bobsCopy = (await call(bob, "GET", "/posts/7")).json;
  expect(bobsCopy.title).not.toBe("ALICE WAS HERE");
  expect(bobsCopy.body.length).toBeGreaterThan(0);
});

test("reset restores the deterministic seed", async () => {
  const store = createSeedStore();
  const pristine = JSON.stringify(createSeedStore().posts);

  await call(store, "DELETE", "/posts/3", { headers: WRITE });
  await call(store, "PUT", "/posts/7", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "scribbled" },
  });
  expect(JSON.stringify(store.posts)).not.toBe(pristine);

  const reset = await call(store, "POST", "/reset");
  expect(reset.response.status).toBe(200);
  expect(JSON.stringify(store.posts)).toBe(pristine);
  expect(store.idempotency).toEqual({});
});

test("GraphQL reads the same store as REST, and counts N+1", async () => {
  const store = createSeedStore();
  await call(store, "PATCH", "/posts/1", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "changed via REST" },
  });

  const gql = await call(store, "POST", "/graphql", {
    headers: JSON_H,
    body: { query: "{ post(id: 1) { title } }" },
  });
  expect(gql.json.data.post.title).toBe("changed via REST");

  const naive = await call(store, "POST", "/graphql", {
    headers: JSON_H,
    body: { query: "{ posts(limit: 10) { title author { name } } }" },
  });
  expect(naive.json.extensions.dbCalls).toBe(11);
  expect(naive.response.headers.get("x-resolver-calls")).toBe("11");
});

test("GraphQL mutations write to the caller's store only", async () => {
  const alice = createSeedStore();
  const bob = createSeedStore();

  const created = await call(alice, "POST", "/graphql", {
    headers: JSON_H,
    body: {
      query: "mutation($i: CreatePostInput!) { createPost(input: $i) { id title } }",
      variables: { i: { title: "alice only", body: "text", authorId: 1 } },
    },
  });
  expect(created.json.data.createPost.title).toBe("alice only");
  expect(alice.posts).toHaveLength(51);
  expect(bob.posts).toHaveLength(50);
});
