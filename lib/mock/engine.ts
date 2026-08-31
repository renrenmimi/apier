// The mock API engine.
//
// One pure function turns (store, Request) into a Response. It never reaches
// for ambient state, which is what lets the exact same code run in three very
// different places while staying isolated per visitor:
//
//   - a Service Worker, backed by that browser's IndexedDB (what visitors use)
//   - the local dev server, backed by one process-wide store (for curl)
//   - unit tests, backed by a store literal
//
// The previous implementation kept a store on globalThis. On a serverless host
// that store is shared by every visitor on a warm instance and vanishes when a
// new instance answers, so mutations leaked between people and reset was not
// reliable. Passing the store in removes that whole class of bug.

import {
  commentsOfPost,
  createSeedStore,
  findPost,
  findUser,
  postsOfUser,
  type MockStore,
  type Post,
  type PostStatus,
} from "./seed";
import { executeGraphQL } from "./graphql";
import {
  DEMO_TOKEN,
  READONLY_TOKEN,
  delay,
  etagOf,
  forbidden,
  json,
  noContent,
  notModified,
  parseListQuery,
  pick,
  preflight,
  problem,
  readAuth,
  unauthorized,
} from "./http";

/** Path the Service Worker owns. Reserved: no Next.js route may claim it. */
export const MOCK_BASE = "/mock-api";

/** Requests per fixed window, per visitor. Same order of magnitude as GitHub's anonymous quota. */
const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;

export interface HandleOptions {
  /** Path prefix to strip before routing, e.g. "/mock-api" or "/api". */
  basePath?: string;
  /** Identifies which runtime answered; surfaced as X-Mock-Scope. */
  scope?: string;
}

export interface HandleResult {
  response: Response;
  /** True when the store changed and the caller must persist it. */
  mutated: boolean;
}

/* ---------- stateful helpers (all store-scoped) ---------- */

function rateLimit(store: MockStore, now: number) {
  if (now - store.rate.windowStart > WINDOW_MS) {
    store.rate = { windowStart: now, used: 0 };
  }
  store.rate.used++;
  const remaining = Math.max(0, RATE_LIMIT - store.rate.used);
  return {
    ok: store.rate.used <= RATE_LIMIT,
    headers: {
      "X-RateLimit-Limit": String(RATE_LIMIT),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.ceil((store.rate.windowStart + WINDOW_MS) / 1000)),
    },
  };
}

function tooManyRequests(store: MockStore, headers: Record<string, string>, now: number) {
  const retry = Math.max(1, Math.ceil((store.rate.windowStart + WINDOW_MS - now) / 1000));
  return problem({
    status: 429,
    title: "Too Many Requests",
    detail: `本窗口配额已用完,请 ${retry} 秒后再试。真实 API 也是这么回答的 —— 看 Retry-After 头。`,
    headers: { ...headers, "Retry-After": String(retry) },
  });
}

function notFoundPost(id: string) {
  return problem({
    status: 404,
    title: "Post Not Found",
    detail: `没有 id 为 ${id} 的文章。也许它从来不存在,也许刚被 DELETE 掉了 —— 两种情况服务器都回 404。`,
  });
}

async function readJson(req: Request): Promise<{ ok: true; value: Record<string, unknown> } | { ok: false }> {
  try {
    return { ok: true, value: (await req.json()) as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

const malformed = () =>
  problem({
    status: 400,
    title: "Malformed JSON",
    detail: "请求体不是合法 JSON。检查一下引号和逗号 —— 400 说的是「这句话我根本没读懂」。",
  });

/* ---------- the router ---------- */

export async function handleMockRequest(
  store: MockStore,
  req: Request,
  opts: HandleOptions = {},
): Promise<HandleResult> {
  const { basePath = MOCK_BASE, scope = "browser-local" } = opts;
  const url = new URL(req.url);
  const method = req.method.toUpperCase();

  let path = url.pathname;
  if (basePath && path.startsWith(basePath)) path = path.slice(basePath.length);
  path = path.replace(/\/+$/, "") || "/";

  const stamp = (r: Response) => {
    // Response headers are immutable, so rebuild rather than mutate.
    const h = new Headers(r.headers);
    h.set("X-Mock-Scope", scope);
    return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
  };
  const done = (response: Response, mutated = false): HandleResult => ({
    response: stamp(response),
    mutated,
  });

  if (method === "OPTIONS") return done(preflight());

  // Readiness handshake. The client uses this to prove the Service Worker is
  // actually in control before it enables Send; a network fall-through would
  // 404 here instead of answering.
  if (path === "/__ready") {
    return done(json({ ready: true, scope, base: basePath, posts: store.posts.length }));
  }

  const now = Date.now();
  const rl = rateLimit(store, now);
  if (!rl.ok) return done(tooManyRequests(store, rl.headers, now), true);
  // The counter moved, so even a rejected request is a store mutation.
  const rlMutated = true;

  /* ----- index ----- */
  if (path === "/" && method === "GET") {
    await delay(url, 0);
    return done(json(indexDocument(store, basePath, scope), { headers: rl.headers }), rlMutated);
  }

  /* ----- reset ----- */
  if (path === "/reset" && method === "POST") {
    const fresh = createSeedStore(Date.now());
    store.users = fresh.users;
    store.posts = fresh.posts;
    store.comments = fresh.comments;
    store.nextPostId = fresh.nextPostId;
    store.nextCommentId = fresh.nextCommentId;
    store.idempotency = {};
    store.rate = fresh.rate;
    return done(
      json({
        ok: true,
        message: "Mock 数据已恢复出厂设置。",
        counts: {
          users: store.users.length,
          posts: store.posts.length,
          comments: store.comments.length,
        },
      }),
      true,
    );
  }

  /* ----- GraphQL ----- */
  if (path === "/graphql") {
    return handleGraphQL(store, req, url, method, rl.headers, done);
  }

  /* ----- users ----- */
  if (path === "/users" && method === "GET") {
    const ms = await delay(url);
    const q = parseListQuery(url);
    const start = (q.page - 1) * q.perPage;
    const slice = store.users.slice(start, start + q.perPage).map((u) => pick({ ...u }, q.fields));
    const body = { data: slice, page: q.page, perPage: q.perPage, total: store.users.length };
    return done(
      json(body, {
        headers: {
          ...rl.headers,
          ETag: etagOf(body),
          "Cache-Control": "public, max-age=60",
          "X-Mock-Latency": `${ms}ms`,
        },
      }),
      rlMutated,
    );
  }

  const userMatch = /^\/users\/([^/]+)$/.exec(path);
  if (userMatch && method === "GET") {
    const ms = await delay(url);
    const user = findUser(store, Number(userMatch[1]));
    if (!user) {
      return done(
        problem({ status: 404, title: "User Not Found", detail: `没有 id 为 ${userMatch[1]} 的用户。` }),
        rlMutated,
      );
    }
    const body: Record<string, unknown> = { ...user };
    if (url.searchParams.get("embed") === "posts") body.posts = postsOfUser(store, user.id);
    const etag = etagOf(body);
    if (req.headers.get("if-none-match") === etag) {
      return done(notModified({ ...rl.headers, ETag: etag, "X-Mock-Latency": `${ms}ms` }), rlMutated);
    }
    return done(
      json(body, {
        headers: {
          ...rl.headers,
          ETag: etag,
          "Cache-Control": "public, max-age=60",
          "X-Mock-Latency": `${ms}ms`,
        },
      }),
      rlMutated,
    );
  }

  /* ----- posts collection ----- */
  if (path === "/posts" && method === "GET") {
    const ms = await delay(url);
    const q = parseListQuery(url);
    let rows = [...store.posts];

    for (const [k, v] of Object.entries(q.filters)) {
      rows = rows.filter((p) => String((p as unknown as Record<string, unknown>)[k]) === v);
    }
    if (q.sort) {
      const { field, desc } = q.sort;
      rows.sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[field];
        const bv = (b as unknown as Record<string, unknown>)[field];
        const r = av === bv ? 0 : (av as number) > (bv as number) ? 1 : -1;
        return desc ? -r : r;
      });
    }

    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / q.perPage));
    const start = (q.page - 1) * q.perPage;
    const slice = rows.slice(start, start + q.perPage).map((p) => pick({ ...p }, q.fields));

    // Link header, the way GitHub paginates.
    const link = (page: number, rel: string) => {
      const u = new URL(url.toString());
      u.searchParams.set("page", String(page));
      u.searchParams.set("per_page", String(q.perPage));
      return `<${u.pathname}${u.search}>; rel="${rel}"`;
    };
    const links = [link(1, "first"), link(totalPages, "last")];
    if (q.page < totalPages) links.unshift(link(q.page + 1, "next"));
    if (q.page > 1) links.unshift(link(q.page - 1, "prev"));

    const body = { data: slice, page: q.page, perPage: q.perPage, total, totalPages };
    return done(
      json(body, {
        headers: {
          ...rl.headers,
          Link: links.join(", "),
          ETag: etagOf(body),
          "Cache-Control": "public, max-age=30",
          "X-Total-Count": String(total),
          "X-Mock-Latency": `${ms}ms`,
        },
      }),
      rlMutated,
    );
  }

  if (path === "/posts" && method === "POST") {
    const auth = readAuth(req);
    if (auth.kind === "anonymous") return done(unauthorized(), rlMutated);
    if (!auth.canWrite) return done(forbidden(), rlMutated);

    // A repeated Idempotency-Key replays the first response instead of
    // creating a second post (chapter 05).
    const key = req.headers.get("idempotency-key");
    if (key && store.idempotency[key]) {
      const hit = store.idempotency[key];
      return done(
        json(hit.body, {
          status: hit.status,
          headers: { ...rl.headers, "X-Idempotent-Replay": "true" },
        }),
        rlMutated,
      );
    }

    const ms = await delay(url);
    const parsed = await readJson(req);
    if (!parsed.ok) return done(malformed(), rlMutated);
    const payload = parsed.value;

    const errors: { field: string; message: string }[] = [];
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    const bodyText = typeof payload.body === "string" ? payload.body.trim() : "";
    if (!title) errors.push({ field: "title", message: "标题不能为空" });
    if (title.length > 120) errors.push({ field: "title", message: "标题不能超过 120 字" });
    if (!bodyText) errors.push({ field: "body", message: "正文不能为空" });
    const authorId = Number(payload.authorId ?? 1);
    if (!store.users.some((u) => u.id === authorId)) {
      errors.push({ field: "authorId", message: `作者 ${authorId} 不存在` });
    }
    if (errors.length) {
      return done(
        problem({
          status: 422,
          title: "Validation Failed",
          detail: "请求格式没问题,但内容通不过校验 —— 这正是 422 与 400 的分界。",
          errors,
          headers: rl.headers,
        }),
        rlMutated,
      );
    }

    const post: Post = {
      id: store.nextPostId++,
      title,
      body: bodyText,
      authorId,
      status: (payload.status as PostStatus) ?? "DRAFT",
      createdAt: new Date().toISOString(),
    };
    store.posts.push(post);
    if (key) store.idempotency[key] = { status: 201, body: post };

    return done(
      json(post, {
        status: 201,
        headers: {
          ...rl.headers,
          // 201 always points at the thing it just made.
          Location: `${basePath}/posts/${post.id}`,
          "X-Mock-Latency": `${ms}ms`,
        },
      }),
      true,
    );
  }

  /* ----- nested comments ----- */
  const commentsMatch = /^\/posts\/([^/]+)\/comments$/.exec(path);
  if (commentsMatch) {
    const postId = Number(commentsMatch[1]);
    if (method === "GET") {
      const ms = await delay(url);
      if (!findPost(store, postId)) {
        return done(
          problem({
            status: 404,
            title: "Post Not Found",
            detail: `文章 ${commentsMatch[1]} 不存在,自然也就没有它的评论。`,
          }),
          rlMutated,
        );
      }
      const embedAuthor = url.searchParams.get("embed") === "author";
      const rows = commentsOfPost(store, postId).map((c) =>
        embedAuthor ? { ...c, author: findUser(store, c.authorId) ?? null } : c,
      );
      return done(
        json(
          { data: rows, total: rows.length },
          { headers: { ...rl.headers, ETag: etagOf(rows), "X-Mock-Latency": `${ms}ms` } },
        ),
        rlMutated,
      );
    }
    if (method === "POST") {
      const auth = readAuth(req);
      if (auth.kind === "anonymous") return done(unauthorized(), rlMutated);
      if (!auth.canWrite) return done(forbidden(), rlMutated);
      const ms = await delay(url);
      const post = findPost(store, postId);
      if (!post) {
        return done(
          problem({
            status: 404,
            title: "Post Not Found",
            detail: `不能给不存在的文章 ${commentsMatch[1]} 写评论。`,
          }),
          rlMutated,
        );
      }
      const parsed = await readJson(req);
      if (!parsed.ok) return done(malformed(), rlMutated);
      const text = typeof parsed.value.body === "string" ? parsed.value.body.trim() : "";
      if (!text) {
        return done(
          problem({
            status: 422,
            title: "Validation Failed",
            detail: "评论内容不能为空。",
            errors: [{ field: "body", message: "评论内容不能为空" }],
          }),
          rlMutated,
        );
      }
      const comment = {
        id: store.nextCommentId++,
        postId: post.id,
        authorId: Number(parsed.value.authorId ?? 1),
        body: text,
        createdAt: new Date().toISOString(),
      };
      store.comments.push(comment);
      return done(
        json(comment, {
          status: 201,
          headers: {
            ...rl.headers,
            Location: `${basePath}/posts/${post.id}/comments`,
            "X-Mock-Latency": `${ms}ms`,
          },
        }),
        true,
      );
    }
  }

  /* ----- single post ----- */
  const postMatch = /^\/posts\/([^/]+)$/.exec(path);
  if (postMatch) {
    const rawId = postMatch[1];
    const id = Number(rawId);

    if (method === "GET") {
      const ms = await delay(url);
      const post = findPost(store, id);
      if (!post) return done(notFoundPost(rawId), rlMutated);

      const embed = (url.searchParams.get("embed") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      const body: Record<string, unknown> = { ...post };
      if (embed.includes("author")) body.author = findUser(store, post.authorId) ?? null;
      if (embed.includes("comments")) body.comments = commentsOfPost(store, post.id);

      const etag = etagOf(body);
      if (req.headers.get("if-none-match") === etag) {
        return done(notModified({ ...rl.headers, ETag: etag, "X-Mock-Latency": `${ms}ms` }), rlMutated);
      }
      return done(
        json(body, {
          headers: {
            ...rl.headers,
            ETag: etag,
            "Cache-Control": "public, max-age=30",
            "X-Mock-Latency": `${ms}ms`,
          },
        }),
        rlMutated,
      );
    }

    if (method === "PUT" || method === "PATCH") {
      const auth = readAuth(req);
      if (auth.kind === "anonymous") return done(unauthorized(), rlMutated);
      if (!auth.canWrite) return done(forbidden(), rlMutated);
      const post = findPost(store, id);
      if (!post) return done(notFoundPost(rawId), rlMutated);
      const parsed = await readJson(req);
      if (!parsed.ok) return done(malformed(), rlMutated);
      const ms = await delay(url);
      const payload = parsed.value;
      const idx = store.posts.findIndex((p) => p.id === post.id);

      if (method === "PUT") {
        // PUT replaces the whole resource. Anything the client leaves out is
        // genuinely gone afterwards; id and createdAt stay because they belong
        // to the server. This is the field-loss demo in chapter 04.
        const replaced: Post = {
          id: post.id,
          createdAt: post.createdAt,
          title: typeof payload.title === "string" ? payload.title : "",
          body: typeof payload.body === "string" ? payload.body : "",
          authorId: Number(payload.authorId ?? 0),
          status: (payload.status as PostStatus) ?? "DRAFT",
        };
        store.posts[idx] = replaced;
        return done(
          json(replaced, {
            headers: {
              ...rl.headers,
              ETag: etagOf(replaced),
              "X-Mock-Latency": `${ms}ms`,
              "X-Teaching-Note": "PUT replaced the whole resource; omitted fields are gone.",
            },
          }),
          true,
        );
      }

      // PATCH merges only the keys that were sent.
      const patched: Post = { ...post };
      for (const k of ["title", "body", "authorId", "status"] as const) {
        if (k in payload) {
          (patched as unknown as Record<string, unknown>)[k] =
            k === "authorId" ? Number(payload[k]) : payload[k];
        }
      }
      store.posts[idx] = patched;
      return done(
        json(patched, {
          headers: {
            ...rl.headers,
            ETag: etagOf(patched),
            "X-Mock-Latency": `${ms}ms`,
            "X-Teaching-Note": "PATCH merged only the fields you sent.",
          },
        }),
        true,
      );
    }

    if (method === "DELETE") {
      const auth = readAuth(req);
      if (auth.kind === "anonymous") return done(unauthorized(), rlMutated);
      if (!auth.canWrite) return done(forbidden(), rlMutated);
      const ms = await delay(url);
      const idx = store.posts.findIndex((p) => p.id === id);
      // Deleting twice answers 404, yet DELETE is still idempotent: idempotency
      // is about the server's final state, not about matching status codes.
      if (idx === -1) return done(notFoundPost(rawId), rlMutated);
      store.posts.splice(idx, 1);
      store.comments = store.comments.filter((c) => c.postId !== id);
      return done(noContent({ ...rl.headers, "X-Mock-Latency": `${ms}ms` }), true);
    }
  }

  return done(
    problem({
      status: 404,
      title: "No Such Endpoint",
      detail: `${method} ${url.pathname} 不是这个 Mock API 的端点。GET ${basePath} 可以看到全部端点。`,
      headers: rl.headers,
    }),
    rlMutated,
  );
}

/* ---------- GraphQL ---------- */

async function handleGraphQL(
  store: MockStore,
  req: Request,
  url: URL,
  method: string,
  rlHeaders: Record<string, string>,
  done: (r: Response, m?: boolean) => HandleResult,
): Promise<HandleResult> {
  const dataloader = url.searchParams.get("dataloader") === "1";

  const run = (query: string, variables: Record<string, unknown>, operationName?: string, ms = 0) => {
    const before = store.posts.length;
    const result = executeGraphQL(store, query, variables, operationName, { dataloader });
    const mutated = store.posts.length !== before;
    // GraphQL traditionally answers 200 even when fields fail, so res.ok cannot
    // tell you whether it worked -- you must read body.errors (chapter 09).
    return done(
      json(result, {
        headers: {
          ...rlHeaders,
          "X-Resolver-Calls": String((result.extensions?.dbCalls as number) ?? 0),
          "X-Mock-Latency": `${ms}ms`,
          "X-Teaching-Note": "GraphQL returns 200 even on field errors - check body.errors, not res.ok.",
        },
      }),
      mutated,
    );
  };

  if (method === "POST") {
    const ms = await delay(url, 40);
    const parsed = await readJson(req);
    if (!parsed.ok) {
      return done(
        problem({
          status: 400,
          title: "Malformed JSON",
          detail: 'GraphQL 请求体应该是 {"query":"...","variables":{}} 这样的 JSON。',
        }),
        true,
      );
    }
    const payload = parsed.value as { query?: string; variables?: Record<string, unknown>; operationName?: string };
    if (!payload.query || typeof payload.query !== "string") {
      return done(
        problem({
          status: 400,
          title: "Missing query",
          detail: "请求体里必须有 query 字段 —— GraphQL 的一切都从这段查询文本开始。",
        }),
        true,
      );
    }
    return run(payload.query, payload.variables ?? {}, payload.operationName, ms);
  }

  if (method === "GET") {
    const query = url.searchParams.get("query");
    if (!query) return done(json(graphqlSchemaDocument()), true);
    const ms = await delay(url, 40);
    const rawVars = url.searchParams.get("variables");
    let variables: Record<string, unknown> = {};
    if (rawVars) {
      try {
        variables = JSON.parse(rawVars);
      } catch {
        return done(
          problem({ status: 400, title: "Bad variables", detail: "variables 不是合法 JSON。" }),
          true,
        );
      }
    }
    return run(query, variables, url.searchParams.get("operationName") ?? undefined, ms);
  }

  return done(
    problem({
      status: 405,
      title: "Method Not Allowed",
      detail: "GraphQL 端点只接受 GET 和 POST。",
      headers: { Allow: "GET, POST, OPTIONS" },
    }),
    true,
  );
}

/* ---------- self-documentation ---------- */

function graphqlSchemaDocument() {
  return {
    message: "APIer 本地 GraphQL 端点",
    usage: {
      post: `POST ${MOCK_BASE}/graphql  body: {"query":"{ posts(limit:3){ title } }"}`,
      get: `GET ${MOCK_BASE}/graphql?query={posts(limit:3){title}}`,
      dataloader: "任一形式加 ?dataloader=1 可对比 N+1 的消除效果",
    },
    schema: `type Query {
  post(id: ID!): Post
  posts(limit: Int = 10, status: PostStatus): [Post!]!
  user(id: ID!): User
  users: [User!]!
}
type Mutation {
  createPost(input: CreatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}
type Post { id: ID!  title: String!  body: String!  createdAt: String!
            status: PostStatus!  author: User!  comments(first: Int): [Comment!]! }
type User { id: ID!  name: String!  email: String!  posts: [Post!]! }
type Comment { id: ID!  body: String!  createdAt: String!  author: User! }
enum PostStatus { DRAFT PUBLISHED ARCHIVED }`,
  };
}

function indexDocument(store: MockStore, basePath: string, scope: string) {
  return {
    name: "APIer Mock API",
    scope,
    why:
      scope === "browser-local"
        ? "这套 Mock API 跑在你自己的浏览器里(Service Worker + IndexedDB):数据只属于你,别人看不到也改不了,刷新还在,随时可以重置。"
        : "本地开发服务器上的 Mock API,供 curl 等终端工具使用;它的数据是这个进程独有的。",
    data: {
      users: store.users.length,
      posts: store.posts.length,
      comments: store.comments.length,
      note: `写操作会真的生效;POST ${basePath}/reset 可恢复出厂设置。`,
    },
    auth: {
      write: `Authorization: Bearer ${DEMO_TOKEN}`,
      readOnly: `Authorization: Bearer ${READONLY_TOKEN}  (拿它去写会得到 403)`,
      none: "不带凭证去写会得到 401",
    },
    rest: {
      [`GET    ${basePath}/posts`]: "列表。支持 ?page= &per_page= &status= &sort=-createdAt &fields=id,title",
      [`POST   ${basePath}/posts`]: "创建 → 201 + Location。支持 Idempotency-Key 去重",
      [`GET    ${basePath}/posts/:id`]: "单篇。带 ETag;?embed=author,comments 可一次多拿",
      [`PUT    ${basePath}/posts/:id`]: "整体替换 —— 没发的字段会消失",
      [`PATCH  ${basePath}/posts/:id`]: "部分修改 —— 只动你发的字段",
      [`DELETE ${basePath}/posts/:id`]: "删除 → 204;再删一次 → 404",
      [`GET    ${basePath}/posts/:id/comments`]: "嵌套资源",
      [`GET    ${basePath}/users`]: "用户列表",
      [`GET    ${basePath}/users/:id`]: "单个用户;?embed=posts",
      [`POST   ${basePath}/reset`]: "恢复出厂设置",
    },
    graphql: {
      endpoint: `POST ${basePath}/graphql`,
      playground: `GET ${basePath}/graphql  (不带 query 时返回 schema)`,
      sameData: "和上面的 REST 端点共用同一份数据 —— 终章的对比可以亲手做",
      nPlusOne: "加 ?dataloader=1 看 extensions.dbCalls 从 11 掉到 2",
    },
    knobs: {
      "?delay=800": "人为增加服务器耗时(上限 3000ms),让 timing 看得更清楚",
      "If-None-Match": "带上上次拿到的 ETag → 304 空响应",
      "Idempotency-Key": "同一个 key 重复 POST 只会创建一次",
      rateLimit: `每分钟 ${RATE_LIMIT} 次,超了给 429 + Retry-After`,
    },
  };
}
