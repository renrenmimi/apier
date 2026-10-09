import { test, expect } from "@playwright/test";
import { createSeedStore } from "../../lib/mock/seed";
import { call, gql, JSON_H, READONLY, WRITE } from "./call";

const N_PLUS_ONE = "{ posts(limit: 10) { title author { name } } }";

test("GraphQL reads the same store as REST, and counts N+1", async () => {
  const store = createSeedStore();
  await call(store, "PATCH", "/posts/1", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "changed via REST" },
  });

  const one = await gql(store, "{ post(id: 1) { title } }");
  expect(one.json.data.post.title).toBe("changed via REST");

  const naive = await gql(store, N_PLUS_ONE);
  expect(naive.json.extensions.dbCalls).toBe(11);
  expect(naive.response.headers.get("x-resolver-calls")).toBe("11");
});

test("GraphQL mutations write to the caller's store only", async () => {
  const alice = createSeedStore();
  const bob = createSeedStore();

  const created = await gql(alice, "mutation($i: CreatePostInput!) { createPost(input: $i) { id title } }", {
    variables: { i: { title: "alice only", body: "text", authorId: 1 } },
    headers: WRITE,
  });
  expect(created.json.data.createPost.title).toBe("alice only");
  expect(alice.posts).toHaveLength(51);
  expect(bob.posts).toHaveLength(50);
});

test("a PUT in chapter 04 no longer breaks the chapter 10 N+1 experiment", async () => {
  const store = createSeedStore();
  await call(store, "PUT", "/posts/7", {
    headers: { ...WRITE, ...JSON_H },
    body: { title: "Just changing the title" },
  });

  const naive = await gql(store, N_PLUS_ONE);
  expect(naive.json.errors).toBeUndefined();
  expect(naive.json.data.posts).toHaveLength(10);
  expect(naive.json.extensions.dbCalls).toBe(11);
  const batched = await gql(store, N_PLUS_ONE, { path: "/graphql?dataloader=1" });
  expect(batched.json.extensions.dbCalls).toBe(2);
});

test("the whole document is validated before anything runs", async () => {
  const store = createSeedStore();
  const typo = await gql(store, "{ post(id: 42) { titel } }");
  expect(typo.json).not.toHaveProperty("data");
  expect(typo.json.errors[0].message).toBe('Cannot query field "titel" on type "Post". Did you mean "title"?');
  expect(typo.json.extensions.dbCalls).toBe(0);

  const zh = await gql(store, "{ post(id: 42) { titel } }", { headers: { "Accept-Language": "zh-CN" } });
  expect(zh.json.errors[0].message).toBe('"Post" 类型上没有字段 "titel"。你是不是想写 "title"?');

  for (const query of [
    "{ posts { title { length } } }", // a leaf with a selection
    "{ post(id: 1) { author } }", // an object without one
    "{ post { title } }", // a required argument missing
    "{ posts(first: 3) { title } }", // an unknown argument
    '{ posts(status: "DRAFT") { title } }', // an enum value written as a string
    "query ($id: ID!) { post(id: 1) { title } }", // an unused variable
    "{ ...Missing }", // an unknown fragment
  ]) {
    const res = await gql(store, query);
    expect(res.json, query).not.toHaveProperty("data");
    expect(res.json.errors.length, query).toBeGreaterThan(0);
  }
});

test("introspection follows the selection set and reports real kinds", async () => {
  const store = createSeedStore();
  const schema = await gql(store, "{ __schema { types { name kind } } }");
  expect(Object.keys(schema.json.data.__schema)).toEqual(["types"]);
  const kinds = Object.fromEntries(
    schema.json.data.__schema.types.map((t: { name: string; kind: string }) => [t.name, t.kind]),
  );
  expect(kinds).toMatchObject({
    Post: "OBJECT",
    PostStatus: "ENUM",
    CreatePostInput: "INPUT_OBJECT",
    String: "SCALAR",
    __Schema: "OBJECT",
  });

  const post = await gql(store, '{ __type(name: "Post") { kind fields { name type { kind ofType { name } } } } }');
  const author = post.json.data.__type.fields.find((f: { name: string }) => f.name === "author");
  expect(author.type).toEqual({ kind: "NON_NULL", ofType: { name: "User" } });

  // ID is serialised as a string, as the chapters show.
  expect((await gql(store, "{ post(id: 42) { id } }")).json.data.post.id).toBe("42");
});

test("request errors carry no data, and a null in a non-null position propagates", async () => {
  const store = createSeedStore();
  expect((await gql(store, "{ posts { title }")).json).not.toHaveProperty("data");
  expect((await gql(store, "query ($id: ID!) { post(id: $id) { title } }")).json).not.toHaveProperty("data");

  // A dangling reference, made by hand: the engine itself no longer creates one.
  store.posts[0].authorId = 999;
  const list = await gql(store, "{ posts(limit: 2) { title author { name } } }");
  // author is User!, each item is Post!, and posts is [Post!]!, so the null reaches data.
  expect(list.json.data).toBeNull();
  expect(list.json.errors).toHaveLength(1);
  expect(list.json.errors[0].path).toEqual(["posts", 0, "author"]);

  // Query.post is nullable, so there the propagation stops.
  const single = await gql(store, "{ post(id: 1) { title author { name } } }");
  expect(single.json.data).toEqual({ post: null });
});

test("operationName must name an existing operation when the document has several", async () => {
  const store = createSeedStore();
  const doc = "query A { post(id: 1) { title } } query B { post(id: 2) { title } }";
  expect((await gql(store, doc)).json).not.toHaveProperty("data");
  expect((await gql(store, doc, { operationName: "C" })).json).not.toHaveProperty("data");
  const b = await gql(store, doc, { operationName: "B" });
  expect(b.json.data.post.title).toBe(store.posts[1].title);
});

test("a subscription is refused with an explanation", async () => {
  const res = await gql(createSeedStore(), "subscription { posts { id } }");
  expect(res.json).not.toHaveProperty("data");
  expect(res.json.errors[0].message).toContain("WebSocket");
});

test("mutations need a write token, never run over GET, and deletePost removes comments", async () => {
  const store = createSeedStore();
  const create = 'mutation { createPost(input: { title: "t", body: "b" }) { id } }';
  const anon = await gql(store, create);
  expect(anon.json.data).toBeNull();
  expect(anon.json.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  expect((await gql(store, create, { headers: READONLY })).json.errors[0].extensions.code).toBe("FORBIDDEN");
  expect(store.posts).toHaveLength(50);

  const ghost = await gql(store, 'mutation { createPost(input: { title: "t", body: "b", authorId: 99 }) { id } }', {
    headers: WRITE,
  });
  expect(ghost.json.errors[0].extensions.code).toBe("BAD_USER_INPUT");

  const viaGet = await call(store, "GET", `/graphql?query=${encodeURIComponent("mutation { deletePost(id: 1) }")}`, {
    headers: WRITE,
  });
  expect(viaGet.response.status).toBe(405);
  expect(viaGet.response.headers.get("allow")).toBe("POST");
  expect(store.posts.some((p) => p.id === 1)).toBe(true);

  const postId = store.comments[0].postId;
  const deleted = await gql(store, `mutation { deletePost(id: ${postId}) }`, { headers: WRITE });
  expect(deleted.json.data.deletePost).toBe(true);
  expect(store.comments.some((c) => c.postId === postId)).toBe(false);
});

test("the N+1 hint appears only when authors were loaded one by one", async () => {
  const store = createSeedStore();
  expect((await gql(store, "{ posts { id } }")).json.extensions).not.toHaveProperty("hint");
  expect((await gql(store, N_PLUS_ONE)).json.extensions.hint).toContain("N+1");
  const batched = await gql(store, N_PLUS_ONE, { path: "/graphql?dataloader=1" });
  expect(batched.json.extensions.hint).toContain("DataLoader");
});
