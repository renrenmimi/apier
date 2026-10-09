import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MOCK_BASE } from "../../lib/mock/engine";
import { delay } from "../../lib/mock/http";
import { createSeedStore } from "../../lib/mock/seed";
import { call, JSON_H, READONLY, WRITE } from "./call";

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
  // Writable fields that were left out go back to their defaults.
  expect(put.json.body).toBe("");
  expect(put.json.status).toBe("DRAFT");
  // Server-owned fields survive a replacement, the author included.
  expect(put.json.id).toBe(7);
  expect(put.json.createdAt).toBe(before.createdAt);
  expect(put.json.authorId).toBe(before.authorId);
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

/* ---------- language ---------- */

const CJK = /[　-〿㐀-鿿＀-￯]/;

test("messages follow Accept-Language, and English is the default", async () => {
  const store = createSeedStore();
  const en = await call(store, "GET", "/posts/9999");
  expect(en.json.detail).toContain("There is no post with id 9999");
  expect(en.text).not.toMatch(CJK);
  expect(en.response.headers.get("content-language")).toBe("en");
  expect(en.response.headers.get("vary")).toBe("Accept-Language");

  const zh = await call(store, "GET", "/posts/9999", { headers: { "Accept-Language": "zh-CN" } });
  expect(zh.json.detail).toContain("没有 id 为 9999 的文章");
  expect(zh.response.headers.get("content-language")).toBe("zh-CN");
  // The title is a stable identifier, so it does not change with the language.
  expect(zh.json.title).toBe(en.json.title);

  // Negotiation by q-value: no French here, so the next best language wins.
  const ranked = await call(store, "GET", "/posts/9999", { headers: { "Accept-Language": "fr;q=1, zh;q=0.5" } });
  expect(ranked.response.headers.get("content-language")).toBe("zh-CN");
  const other = await call(store, "GET", "/posts/9999", { headers: { "Accept-Language": "de-DE" } });
  expect(other.response.headers.get("content-language")).toBe("en");

  const invalid = await call(store, "POST", "/posts", {
    headers: { ...WRITE, ...JSON_H, "Accept-Language": "zh" },
    body: { title: "", body: "" },
  });
  expect(invalid.json.errors[0].message).toBe("标题不能为空");
  expect((await call(store, "GET", "/")).text).not.toMatch(CJK);
});

test("stored data is English for every visitor", async () => {
  expect(JSON.stringify(createSeedStore())).not.toMatch(CJK);
});

test("the ETag quoted in chapter 05 matches the seed", async () => {
  const etag = (await call(createSeedStore(), "GET", "/posts/42")).response.headers.get("etag")!;
  const chapter = readFileSync(path.join(__dirname, "../../app/rest-advanced/page.tsx"), "utf8");
  expect(chapter).toContain(`"If-None-Match": '${etag}'`);
});

/* ---------- validation ---------- */

test("PATCH and POST validate types, enum values and authors", async () => {
  const store = createSeedStore();
  const before = JSON.stringify(store.posts.find((p) => p.id === 7));
  const patch = await call(store, "PATCH", "/posts/7", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: 123, status: "FOO" },
  });
  expect(patch.response.status).toBe(422);
  expect(patch.json.errors.map((e: { field: string }) => e.field)).toEqual(["title", "status"]);
  expect(JSON.stringify(store.posts.find((p) => p.id === 7))).toBe(before);

  const ghost = await call(store, "POST", "/posts", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "t", body: "b", authorId: 99 },
  });
  expect(ghost.response.status).toBe(422);
  expect(ghost.json.errors).toEqual([{ field: "authorId", message: "author 99 does not exist" }]);

  // Once the post exists, its author belongs to the server.
  const reassign = await call(store, "PATCH", "/posts/7", { headers: { ...WRITE, ...JSON_H }, body: { authorId: 99 } });
  expect(reassign.response.status).toBe(200);
  expect(reassign.json.authorId).toBe(JSON.parse(before).authorId);
});

/* ---------- rate limit and reset ---------- */

test("reset is answered even when the rate limit is exhausted", async () => {
  const store = createSeedStore();
  let last = await call(store, "GET", "/posts/1");
  for (let i = 0; i < 61; i++) last = await call(store, "GET", "/posts/1");
  expect(last.response.status).toBe(429);

  expect((await call(store, "POST", "/reset")).response.status).toBe(200);
  const after = await call(store, "GET", "/posts/1");
  expect(after.response.status).toBe(200);
  expect(after.response.headers.get("x-ratelimit-remaining")).toBe("59");
});

/* ---------- HTTP semantics ---------- */

test("HEAD answers like GET without a body", async () => {
  const store = createSeedStore();
  const get = await call(store, "GET", "/posts/42");
  const head = await call(store, "HEAD", "/posts/42");
  expect(head.response.status).toBe(200);
  expect(head.text).toBe("");
  expect(head.response.headers.get("etag")).toBe(get.response.headers.get("etag"));
  expect((await call(store, "HEAD", "/posts/9999")).response.status).toBe(404);
});

test("an unsupported method gets 405 with Allow, and OPTIONS lists the same methods", async () => {
  const store = createSeedStore();
  const del = await call(store, "DELETE", "/posts", { headers: WRITE });
  expect(del.response.status).toBe(405);
  expect(del.response.headers.get("allow")).toBe("GET, HEAD, POST, OPTIONS");
  const put = await call(store, "PUT", "/users/1", { headers: { ...WRITE, ...JSON_H }, body: {} });
  expect(put.response.status).toBe(405);

  const options = await call(store, "OPTIONS", "/posts/42");
  expect(options.response.status).toBe(204);
  expect(options.response.headers.get("allow")).toBe("GET, HEAD, PUT, PATCH, DELETE, OPTIONS");

  expect((await call(store, "OPTIONS", "/nowhere")).response.status).toBe(404);
  expect((await call(store, "PURGE", "/posts/42")).response.status).toBe(501);
});

test("If-None-Match compares weakly, accepts lists and *, and covers collections", async () => {
  const store = createSeedStore();
  const first = await call(store, "GET", "/posts/42");
  const etag = first.response.headers.get("etag")!;
  for (const header of [`W/${etag}`, `"other", ${etag}`, "*"]) {
    const res = await call(store, "GET", "/posts/42", { headers: { "If-None-Match": header } });
    expect(res.response.status, header).toBe(304);
    // A 304 repeats what the 200 said about caching (RFC 9110 §15.4.5).
    expect(res.response.headers.get("cache-control")).toBe(first.response.headers.get("cache-control"));
    expect(res.response.headers.get("etag")).toBe(etag);
  }
  for (const target of ["/posts?page=2", "/users", "/posts/1/comments"]) {
    const list = await call(store, "GET", target);
    const again = await call(store, "GET", target, { headers: { "If-None-Match": list.response.headers.get("etag")! } });
    expect(again.response.status, target).toBe(304);
  }
});

test("an Idempotency-Key replay keeps Location, and a reused key with another body is refused", async () => {
  const store = createSeedStore();
  const headers = { ...WRITE, ...JSON_H, "Idempotency-Key": "order-7" };
  const first = await call(store, "POST", "/posts", { headers, body: { title: "Order", body: "once" } });
  // Same payload, keys in another order: still the same request.
  const replay = await call(store, "POST", "/posts", { headers, body: { body: "once", title: "Order" } });
  expect(replay.response.status).toBe(201);
  expect(replay.response.headers.get("location")).toBe(first.response.headers.get("location"));

  const reused = await call(store, "POST", "/posts", { headers, body: { title: "Another", body: "twice" } });
  expect(reused.response.status).toBe(422);
  expect(store.posts.filter((p) => p.title === "Order")).toHaveLength(1);
});

test("WWW-Authenticate carries an error code only when a token was sent", async () => {
  const store = createSeedStore();
  const post = (headers: Record<string, string>) =>
    call(store, "POST", "/posts", { headers: { ...JSON_H, ...headers }, body: { title: "x", body: "y" } });

  expect((await post({})).response.headers.get("www-authenticate")).toBe('Bearer realm="apier"');
  const wrong = await post({ Authorization: "Bearer not-a-token" });
  expect(wrong.response.status).toBe(401);
  expect(wrong.response.headers.get("www-authenticate")).toContain('error="invalid_token"');
  const readonly = await post(READONLY);
  expect(readonly.response.status).toBe(403);
  expect(readonly.response.headers.get("www-authenticate")).toContain('error="insufficient_scope"');
});

test("a new comment's Location points at the comment, which can be read back", async () => {
  const store = createSeedStore();
  const created = await call(store, "POST", "/posts/1/comments", {
    headers: { ...WRITE, ...JSON_H },
    body: { body: "Nice." },
  });
  expect(created.response.status).toBe(201);
  const location = created.response.headers.get("location")!;
  expect(location).toBe(`${MOCK_BASE}/posts/1/comments/${created.json.id}`);
  expect((await call(store, "GET", location.slice(MOCK_BASE.length))).json).toEqual(created.json);

  const ghost = await call(store, "POST", "/posts/1/comments", {
    headers: { ...WRITE, ...JSON_H },
    body: { body: "Hi", authorId: 99 },
  });
  expect(ghost.response.status).toBe(422);
  // Every counted response, errors included, reports the remaining quota.
  expect(ghost.response.headers.get("x-ratelimit-remaining")).not.toBeNull();
});

test("list parameters are validated instead of silently becoming filters", async () => {
  const store = createSeedStore();
  const window = await call(store, "GET", "/posts?limit=5&offset=10");
  expect(window.json.data.map((p: { id: number }) => p.id)).toEqual([11, 12, 13, 14, 15]);
  expect(window.json).toMatchObject({ limit: 5, offset: 10, total: 50 });
  expect(window.response.headers.get("link")).toContain("offset=15");

  const drafts = await call(store, "GET", "/posts?status=DRAFT&per_page=100");
  expect(drafts.json.data.length).toBeGreaterThan(0);
  expect(drafts.json.data.every((p: { status: string }) => p.status === "DRAFT")).toBe(true);

  for (const query of ["cursor=abc", "titel=x", "page=1.5", "status=FOO", "fields=titel", "sort=nope", "page=2&limit=5"]) {
    expect((await call(store, "GET", `/posts?${query}`)).response.status, query).toBe(400);
  }
  expect((await call(store, "GET", "/posts?cursor=abc")).json.detail).toContain("limit and offset");
});

test("?delay=0 means no delay at all", async () => {
  expect(await delay(new URL("https://example.test/?delay=0"))).toBe(0);
  expect(await delay(new URL("https://example.test/"), 5)).toBe(5);
});
