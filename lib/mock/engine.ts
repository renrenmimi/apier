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
//
// Human-readable text (problem details, field messages, the index document,
// GraphQL errors) follows Accept-Language: English by default, Chinese for zh.
// Stored data and every other byte on the wire are the same in both languages.

import {
  commentsOfPost,
  createSeedStore,
  findPost,
  findUser,
  postsOfUser,
  type Comment,
  type MockStore,
  type Post,
  type PostStatus,
} from "./seed";
import { executeGraphQL, printSchema } from "./graphql";
import {
  DEMO_TOKEN,
  READONLY_TOKEN,
  delay,
  etagOf,
  ifNoneMatchHits,
  json,
  langOf,
  languageHeaders,
  list,
  noContent,
  notModified,
  parseListQuery,
  pick,
  positiveInteger,
  preflight,
  problem,
  readAuth,
  tr,
  writeGate,
  type Lang,
  type ListQuery,
  type ListSpec,
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

/* ---------- routes ---------- */

const IMPLEMENTED = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

/**
 * The methods each resource supports. A known path with another method gets
 * 405 plus this list in Allow, not a misleading 404 (RFC 9110 §15.5.6); OPTIONS
 * answers with the same list.
 */
function allowedMethods(path: string): string[] | null {
  if (path === "/") return ["GET", "HEAD"];
  if (path === "/reset") return ["POST"];
  if (path === "/graphql") return ["GET", "HEAD", "POST"];
  if (path === "/users" || /^\/users\/[^/]+$/.test(path)) return ["GET", "HEAD"];
  if (path === "/posts") return ["GET", "HEAD", "POST"];
  if (/^\/posts\/[^/]+$/.test(path)) return ["GET", "HEAD", "PUT", "PATCH", "DELETE"];
  if (/^\/posts\/[^/]+\/comments$/.test(path)) return ["GET", "HEAD", "POST"];
  if (/^\/posts\/[^/]+\/comments\/[^/]+$/.test(path)) return ["GET", "HEAD"];
  return null;
}

const allowHeader = (methods: string[]) => [...methods, "OPTIONS"].join(", ");

const POST_FIELDS = ["id", "title", "body", "authorId", "status", "createdAt"] as const;
const STATUSES: PostStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const POST_LIST: ListSpec = {
  fields: POST_FIELDS,
  sortable: POST_FIELDS,
  filters: {
    status: {
      test: (v) => (STATUSES as string[]).includes(v),
      expect: [`one of ${list("en", STATUSES)}`, `${list("zh", STATUSES)} 之一`],
    },
    authorId: positiveInteger,
  },
};
const USER_LIST: ListSpec = { fields: ["id", "name", "email"] };

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

function tooManyRequests(store: MockStore, lang: Lang, now: number) {
  const retry = Math.max(1, Math.ceil((store.rate.windowStart + WINDOW_MS - now) / 1000));
  return problem({
    status: 429,
    title: "Too Many Requests",
    lang,
    detail: tr(
      lang,
      `This window's quota is used up. Try again in ${retry} seconds; real APIs answer the same way. See the Retry-After header.`,
      `本窗口配额已用完,请 ${retry} 秒后再试。真实 API 也是这么回答的 —— 看 Retry-After 头。`,
    ),
    headers: { "Retry-After": String(retry) },
  });
}

/* ---------- stateless answers ---------- */

const notFoundPost = (id: string, lang: Lang) =>
  problem({
    status: 404,
    title: "Post Not Found",
    lang,
    detail: tr(
      lang,
      `There is no post with id ${id}. It may never have existed, or it may just have been deleted; the server answers 404 in both cases.`,
      `没有 id 为 ${id} 的文章。也许它从来不存在,也许刚被 DELETE 掉了 —— 两种情况服务器都回 404。`,
    ),
  });

const noSuchEndpoint = (method: string, pathname: string, basePath: string, lang: Lang) =>
  problem({
    status: 404,
    title: "No Such Endpoint",
    lang,
    detail: tr(
      lang,
      `${method} ${pathname} is not an endpoint of this mock API. GET ${basePath} lists every endpoint.`,
      `${method} ${pathname} 不是这个 Mock API 的端点。GET ${basePath} 可以看到全部端点。`,
    ),
  });

const methodNotAllowed = (method: string, pathname: string, allow: string, lang: Lang) =>
  problem({
    status: 405,
    title: "Method Not Allowed",
    lang,
    detail: tr(
      lang,
      `${pathname} exists but does not support ${method}. The Allow header lists the methods it does support: ${allow}.`,
      `${pathname} 存在,但不支持 ${method}。Allow 头列出了它支持的方法:${allow}。`,
    ),
    headers: { Allow: allow },
  });

const notImplemented = (method: string, lang: Lang) =>
  problem({
    status: 501,
    title: "Not Implemented",
    lang,
    detail: tr(
      lang,
      `This mock does not implement the ${method} method. It supports ${list("en", IMPLEMENTED)}.`,
      `这个 mock 没有实现 ${method} 方法。它支持 ${list("zh", IMPLEMENTED)}。`,
    ),
  });

const malformed = (lang: Lang) =>
  problem({
    status: 400,
    title: "Malformed JSON",
    lang,
    detail: tr(
      lang,
      "The request body is not a valid JSON object. Check the quotes and commas: a 400 means the server could not even read the request.",
      "请求体不是合法的 JSON 对象。检查一下引号和逗号 —— 400 说的是「这句话我根本没读懂」。",
    ),
  });

type FieldErrors = { field: string; message: string }[];

const validationFailed = (errors: FieldErrors, lang: Lang) =>
  problem({
    status: 422,
    title: "Validation Failed",
    lang,
    detail: tr(
      lang,
      "The request is well-formed, but its content fails validation. That is the line between 422 and 400.",
      "请求格式没问题,但内容通不过校验 —— 这正是 422 与 400 的分界。",
    ),
    errors,
  });

/** Only a JSON object is a usable payload; `[]`, `5` or `null` are read as malformed. */
async function readJson(req: Request): Promise<{ ok: true; value: Record<string, unknown> } | { ok: false }> {
  try {
    const value: unknown = await req.json();
    if (value === null || typeof value !== "object" || Array.isArray(value)) return { ok: false };
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

/** Order-independent fingerprint of a payload, for Idempotency-Key reuse checks. */
function fingerprintOf(value: unknown): string {
  const canonical = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(canonical)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, canonical((v as Record<string, unknown>)[k])]),
          )
        : v;
  return etagOf(canonical(value));
}

/** `?embed=a,b`, checked against what this resource can embed. */
function parseEmbed(url: URL, allowed: string[], lang: Lang): { ok: true; embed: string[] } | { ok: false; response: Response } {
  const embed = (url.searchParams.get("embed") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const unknown = embed.find((e) => !allowed.includes(e));
  if (!unknown) return { ok: true, embed };
  return {
    ok: false,
    response: problem({
      status: 400,
      title: "Invalid Query Parameter",
      lang,
      detail: tr(
        lang,
        `Unknown embed "${unknown}". This resource can embed: ${list("en", allowed)}.`,
        `无法嵌入 "${unknown}"。这个资源可以嵌入:${list("zh", allowed)}。`,
      ),
    }),
  };
}

/**
 * A cacheable GET answer. If-None-Match is evaluated against the ETag of the
 * body, and a 304 repeats the validators and Cache-Control the 200 would have
 * carried (RFC 9110 §15.4.5).
 */
function cacheable(req: Request, body: unknown, headers: Record<string, string>) {
  const etag = etagOf(body);
  if (ifNoneMatchHits(req.headers.get("if-none-match"), etag)) {
    const keep: Record<string, string> = { ETag: etag };
    for (const k of ["Cache-Control", "X-Mock-Latency"]) if (headers[k]) keep[k] = headers[k];
    return notModified(keep);
  }
  return json(body, { headers: { ...headers, ETag: etag } });
}

/** One window of a collection, with Link headers in the style the query used. */
function listPage<T>(rows: T[], q: ListQuery, url: URL) {
  const total = rows.length;
  const data = rows.slice(q.offset, q.offset + q.limit);
  const link = (params: Record<string, number>, rel: string) => {
    const u = new URL(url.toString());
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
    return `<${u.pathname}${u.search}>; rel="${rel}"`;
  };
  const links: string[] = [];
  let body: Record<string, unknown>;
  if (q.mode === "page") {
    const totalPages = Math.max(1, Math.ceil(total / q.perPage));
    const at = (page: number) => ({ page, per_page: q.perPage });
    if (q.page > 1) links.push(link(at(q.page - 1), "prev"));
    if (q.page < totalPages) links.push(link(at(q.page + 1), "next"));
    links.push(link(at(1), "first"), link(at(totalPages), "last"));
    body = { data, page: q.page, perPage: q.perPage, total, totalPages };
  } else {
    const at = (offset: number) => ({ limit: q.limit, offset });
    if (q.offset > 0) links.push(link(at(Math.max(0, q.offset - q.limit)), "prev"));
    if (q.offset + q.limit < total) links.push(link(at(q.offset + q.limit), "next"));
    links.push(link(at(0), "first"), link(at(Math.max(0, Math.ceil(total / q.limit) - 1) * q.limit), "last"));
    body = { data, limit: q.limit, offset: q.offset, total };
  }
  return { body, headers: { Link: links.join(", "), "X-Total-Count": String(total) } };
}

/* ---------- post validation ---------- */

/**
 * What a client may write. `id`, `createdAt` and `authorId` belong to the
 * server: POST may name an existing author, but PUT and PATCH leave all three
 * as they are, so neither can leave a post pointing at a user that does not
 * exist (which used to break the chapter 10 N+1 experiment).
 */
function validatePost(
  store: MockStore,
  payload: Record<string, unknown>,
  mode: "create" | "replace" | "merge",
  lang: Lang,
): { errors: FieldErrors; values: Partial<Post> } {
  const errors: FieldErrors = [];
  const values: Partial<Post> = {};
  const fail = (field: string, en: string, zh: string) => errors.push({ field, message: tr(lang, en, zh) });

  if ("title" in payload || mode !== "merge") {
    const t = payload.title;
    if (typeof t === "string" && t.trim()) {
      if (t.trim().length > 120) fail("title", "title must be at most 120 characters", "标题不能超过 120 个字符");
      else values.title = t.trim();
    } else if (t === undefined || t === null || typeof t === "string") {
      fail("title", "title is required", "标题不能为空");
    } else {
      fail("title", "title must be a string", "title 必须是字符串");
    }
  }

  if ("body" in payload || mode !== "merge") {
    const b = payload.body;
    if (b !== undefined && b !== null && typeof b !== "string") {
      fail("body", "body must be a string", "body 必须是字符串");
    } else if (mode === "create" && !(typeof b === "string" && b.trim())) {
      fail("body", "body is required", "正文不能为空");
    } else {
      // PUT replaces the representation: a body left out does not keep its old value.
      values.body = typeof b === "string" ? b.trim() : "";
    }
  }

  if ("status" in payload) {
    const s = payload.status;
    if (typeof s !== "string" || !(STATUSES as string[]).includes(s)) {
      fail(
        "status",
        `status must be one of ${list("en", STATUSES)}`,
        `status 必须是 ${list("zh", STATUSES)} 之一`,
      );
    } else values.status = s as PostStatus;
  } else if (mode !== "merge") {
    values.status = "DRAFT";
  }

  if (mode === "create") {
    const a = payload.authorId ?? 1;
    if (typeof a !== "number" || !Number.isInteger(a)) {
      fail("authorId", "authorId must be an integer", "authorId 必须是整数");
    } else if (!findUser(store, a)) {
      fail("authorId", `author ${a} does not exist`, `作者 ${a} 不存在`);
    } else values.authorId = a;
  }

  return { errors, values };
}

const SERVER_OWNED = ["id", "createdAt", "authorId"];

/* ---------- the router ---------- */

export async function handleMockRequest(
  store: MockStore,
  req: Request,
  opts: HandleOptions = {},
): Promise<HandleResult> {
  const { basePath = MOCK_BASE, scope = "browser-local" } = opts;
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  const lang = langOf(req);

  let path = url.pathname;
  if (basePath && path.startsWith(basePath)) path = path.slice(basePath.length);
  path = path.replace(/\/+$/, "") || "/";

  // Rate-limit headers, once the request has been counted; every later answer carries them.
  let quota: Record<string, string> = {};
  const stamp = (r: Response) => {
    // Response headers are immutable, so rebuild rather than mutate.
    const h = new Headers(r.headers);
    for (const [k, v] of Object.entries(quota)) if (!h.has(k)) h.set(k, v);
    h.set("X-Mock-Scope", scope);
    // HEAD is GET without the body (RFC 9110 §9.3.2).
    return new Response(method === "HEAD" ? null : r.body, { status: r.status, statusText: r.statusText, headers: h });
  };
  const done = (response: Response, mutated = false): HandleResult => ({
    response: stamp(response),
    mutated,
  });

  // Readiness handshake. The client uses this to prove the Service Worker is
  // actually in control before it enables Send; a network fall-through would
  // 404 here instead of answering.
  if (path === "/__ready") {
    return done(json({ ready: true, scope, base: basePath, posts: store.posts.length }));
  }

  const allowed = allowedMethods(path);

  if (method === "OPTIONS") {
    return done(allowed ? preflight(allowHeader(allowed)) : noSuchEndpoint(method, url.pathname, basePath, lang));
  }
  if (!IMPLEMENTED.includes(method)) return done(notImplemented(method, lang));

  /* ----- reset ----- */
  // Before the rate limiter: reset restores the rate window too, so a visitor
  // who has exhausted the quota can still undo their changes.
  if (path === "/reset" && method === "POST") {
    Object.assign(store, createSeedStore(Date.now()));
    return done(
      json(
        {
          ok: true,
          message: tr(lang, "The mock data has been restored to its initial state.", "Mock 数据已恢复出厂设置。"),
          counts: {
            users: store.users.length,
            posts: store.posts.length,
            comments: store.comments.length,
          },
        },
        { headers: languageHeaders(lang) },
      ),
      true,
    );
  }

  const now = Date.now();
  const rl = rateLimit(store, now);
  quota = rl.headers;
  // From here on the counter has moved, so every answer is a store mutation.
  const reply = (response: Response) => done(response, true);
  if (!rl.ok) return reply(tooManyRequests(store, lang, now));

  if (!allowed) return reply(noSuchEndpoint(method, url.pathname, basePath, lang));
  if (!allowed.includes(method)) return reply(methodNotAllowed(method, url.pathname, allowHeader(allowed), lang));

  // HEAD runs the GET handler; stamp() drops the body.
  const verb = method === "HEAD" ? "GET" : method;

  /* ----- index ----- */
  if (path === "/") {
    await delay(url, 0);
    return reply(json(indexDocument(store, basePath, scope, lang), { headers: languageHeaders(lang) }));
  }

  /* ----- GraphQL ----- */
  if (path === "/graphql") return handleGraphQL(store, req, url, verb, basePath, lang, reply);

  /* ----- users ----- */
  if (path === "/users") {
    const ms = await delay(url);
    const parsed = parseListQuery(url, USER_LIST, lang);
    if (!parsed.ok) return reply(parsed.response);
    const page = listPage(store.users, parsed.query, url);
    page.body.data = (page.body.data as typeof store.users).map((u) => pick({ ...u }, parsed.query.fields));
    return reply(
      cacheable(req, page.body, {
        ...page.headers,
        "Cache-Control": "public, max-age=60",
        "X-Mock-Latency": `${ms}ms`,
      }),
    );
  }

  const userMatch = /^\/users\/([^/]+)$/.exec(path);
  if (userMatch) {
    const ms = await delay(url);
    const user = findUser(store, Number(userMatch[1]));
    if (!user) {
      return reply(
        problem({
          status: 404,
          title: "User Not Found",
          lang,
          detail: tr(lang, `There is no user with id ${userMatch[1]}.`, `没有 id 为 ${userMatch[1]} 的用户。`),
        }),
      );
    }
    const embed = parseEmbed(url, ["posts"], lang);
    if (!embed.ok) return reply(embed.response);
    const body: Record<string, unknown> = { ...user };
    if (embed.embed.includes("posts")) body.posts = postsOfUser(store, user.id);
    return reply(cacheable(req, body, { "Cache-Control": "public, max-age=60", "X-Mock-Latency": `${ms}ms` }));
  }

  /* ----- posts collection ----- */
  if (path === "/posts" && verb === "GET") {
    const ms = await delay(url);
    const parsed = parseListQuery(url, POST_LIST, lang);
    if (!parsed.ok) return reply(parsed.response);
    const q = parsed.query;
    let rows = [...store.posts];
    if (q.filters.status) rows = rows.filter((p) => p.status === q.filters.status);
    if (q.filters.authorId) rows = rows.filter((p) => p.authorId === Number(q.filters.authorId));
    if (q.sort) {
      const { field, desc } = q.sort;
      rows.sort((a, b) => {
        const av = (a as unknown as Record<string, string | number>)[field];
        const bv = (b as unknown as Record<string, string | number>)[field];
        const r = av === bv ? 0 : av > bv ? 1 : -1;
        return desc ? -r : r;
      });
    }
    // Link header, the way GitHub paginates.
    const page = listPage(rows, q, url);
    page.body.data = (page.body.data as Post[]).map((p) => pick({ ...p }, q.fields));
    return reply(
      cacheable(req, page.body, {
        ...page.headers,
        "Cache-Control": "public, max-age=30",
        "X-Mock-Latency": `${ms}ms`,
      }),
    );
  }

  if (path === "/posts" && verb === "POST") {
    const gate = writeGate(readAuth(req), lang);
    if (gate) return reply(gate);

    const parsed = await readJson(req);
    if (!parsed.ok) return reply(malformed(lang));
    const payload = parsed.value;

    // A repeated Idempotency-Key replays the first response instead of
    // creating a second post (chapter 05). The same key with a different
    // body is a client error, not a replay.
    const key = req.headers.get("idempotency-key");
    const fingerprint = fingerprintOf(payload);
    const hit = key ? store.idempotency[key] : undefined;
    if (key && hit) {
      if (hit.fingerprint !== fingerprint) {
        return reply(
          problem({
            status: 422,
            title: "Idempotency Key Reused",
            lang,
            detail: tr(
              lang,
              `The Idempotency-Key "${key}" was already used with a different request body. A new request needs a new key.`,
              `Idempotency-Key "${key}" 已经用在了一个不同的请求体上。新的请求需要一个新的 key。`,
            ),
          }),
        );
      }
      return reply(
        json(hit.body, {
          status: hit.status,
          headers: { ...(hit.location ? { Location: hit.location } : {}), "X-Idempotent-Replay": "true" },
        }),
      );
    }

    const ms = await delay(url);
    const { errors, values } = validatePost(store, payload, "create", lang);
    if (errors.length) return reply(validationFailed(errors, lang));

    const post: Post = {
      id: store.nextPostId++,
      title: values.title!,
      body: values.body!,
      authorId: values.authorId!,
      status: values.status!,
      createdAt: new Date().toISOString(),
    };
    store.posts.push(post);
    // 201 always points at the thing it just made, replayed or not.
    const location = `${basePath}/posts/${post.id}`;
    if (key) store.idempotency[key] = { status: 201, body: post, fingerprint, location };

    return reply(json(post, { status: 201, headers: { Location: location, "X-Mock-Latency": `${ms}ms` } }));
  }

  /* ----- nested comments ----- */
  const commentsMatch = /^\/posts\/([^/]+)\/comments(?:\/([^/]+))?$/.exec(path);
  if (commentsMatch) {
    const [, rawPostId, rawCommentId] = commentsMatch;
    const postId = Number(rawPostId);

    if (verb === "GET") {
      const ms = await delay(url);
      if (!findPost(store, postId)) {
        return reply(
          problem({
            status: 404,
            title: "Post Not Found",
            lang,
            detail: tr(
              lang,
              `Post ${rawPostId} does not exist, so it has no comments either.`,
              `文章 ${rawPostId} 不存在,自然也就没有它的评论。`,
            ),
          }),
        );
      }
      const embed = parseEmbed(url, ["author"], lang);
      if (!embed.ok) return reply(embed.response);
      const shape = (c: Comment) =>
        embed.embed.includes("author") ? { ...c, author: findUser(store, c.authorId) ?? null } : c;
      const headers = { "Cache-Control": "public, max-age=30", "X-Mock-Latency": `${ms}ms` };

      if (rawCommentId !== undefined) {
        const comment = commentsOfPost(store, postId).find((c) => c.id === Number(rawCommentId));
        if (!comment) {
          return reply(
            problem({
              status: 404,
              title: "Comment Not Found",
              lang,
              detail: tr(
                lang,
                `Post ${rawPostId} has no comment with id ${rawCommentId}.`,
                `文章 ${rawPostId} 下没有 id 为 ${rawCommentId} 的评论。`,
              ),
            }),
          );
        }
        return reply(cacheable(req, shape(comment), headers));
      }

      const rows = commentsOfPost(store, postId).map(shape);
      return reply(cacheable(req, { data: rows, total: rows.length }, headers));
    }

    // POST on the collection (the only other method allowedMethods() admits).
    const gate = writeGate(readAuth(req), lang);
    if (gate) return reply(gate);
    const ms = await delay(url);
    const post = findPost(store, postId);
    if (!post) {
      return reply(
        problem({
          status: 404,
          title: "Post Not Found",
          lang,
          detail: tr(
            lang,
            `Post ${rawPostId} does not exist, so it cannot be commented on.`,
            `不能给不存在的文章 ${rawPostId} 写评论。`,
          ),
        }),
      );
    }
    const parsed = await readJson(req);
    if (!parsed.ok) return reply(malformed(lang));
    const errors: FieldErrors = [];
    const text = typeof parsed.value.body === "string" ? parsed.value.body.trim() : "";
    if (!text) errors.push({ field: "body", message: tr(lang, "body is required", "评论内容不能为空") });
    const authorId = parsed.value.authorId ?? 1;
    if (typeof authorId !== "number" || !Number.isInteger(authorId)) {
      errors.push({ field: "authorId", message: tr(lang, "authorId must be an integer", "authorId 必须是整数") });
    } else if (!findUser(store, authorId)) {
      errors.push({ field: "authorId", message: tr(lang, `author ${authorId} does not exist`, `作者 ${authorId} 不存在`) });
    }
    if (errors.length) return reply(validationFailed(errors, lang));

    const comment: Comment = {
      id: store.nextCommentId++,
      postId: post.id,
      authorId: authorId as number,
      body: text,
      createdAt: new Date().toISOString(),
    };
    store.comments.push(comment);
    return reply(
      json(comment, {
        status: 201,
        headers: {
          Location: `${basePath}/posts/${post.id}/comments/${comment.id}`,
          "X-Mock-Latency": `${ms}ms`,
        },
      }),
    );
  }

  /* ----- single post ----- */
  const postMatch = /^\/posts\/([^/]+)$/.exec(path);
  if (postMatch) {
    const rawId = postMatch[1];
    const id = Number(rawId);

    if (verb === "GET") {
      const ms = await delay(url);
      const post = findPost(store, id);
      if (!post) return reply(notFoundPost(rawId, lang));
      const embed = parseEmbed(url, ["author", "comments"], lang);
      if (!embed.ok) return reply(embed.response);
      const body: Record<string, unknown> = { ...post };
      if (embed.embed.includes("author")) body.author = findUser(store, post.authorId) ?? null;
      if (embed.embed.includes("comments")) body.comments = commentsOfPost(store, post.id);
      return reply(cacheable(req, body, { "Cache-Control": "public, max-age=30", "X-Mock-Latency": `${ms}ms` }));
    }

    const gate = writeGate(readAuth(req), lang);
    if (gate) return reply(gate);

    if (verb === "PUT" || verb === "PATCH") {
      const post = findPost(store, id);
      if (!post) return reply(notFoundPost(rawId, lang));
      const parsed = await readJson(req);
      if (!parsed.ok) return reply(malformed(lang));
      const ms = await delay(url);
      const payload = parsed.value;
      const { errors, values } = validatePost(store, payload, verb === "PUT" ? "replace" : "merge", lang);
      if (errors.length) return reply(validationFailed(errors, lang));
      const sentServerOwned = SERVER_OWNED.some((k) => k in payload);

      // PUT replaces every writable field: whatever the client leaves out goes
      // back to its default (body "", status DRAFT). This is the field-loss
      // demo in chapter 04. PATCH merges only the keys that were sent.
      const updated: Post = { ...post, ...values };
      store.posts[store.posts.findIndex((p) => p.id === post.id)] = updated;
      const note =
        verb === "PUT"
          ? "PUT replaced title, body and status; anything omitted went back to its default. id, createdAt and authorId belong to the server."
          : `PATCH merged only the fields you sent.${sentServerOwned ? " id, createdAt and authorId belong to the server and were left as they were." : ""}`;
      return reply(
        json(updated, {
          headers: { ETag: etagOf(updated), "X-Mock-Latency": `${ms}ms`, "X-Teaching-Note": note },
        }),
      );
    }

    // DELETE
    const ms = await delay(url);
    const idx = store.posts.findIndex((p) => p.id === id);
    // Deleting twice answers 404, yet DELETE is still idempotent: idempotency
    // is about the server's final state, not about matching status codes.
    if (idx === -1) return reply(notFoundPost(rawId, lang));
    store.posts.splice(idx, 1);
    store.comments = store.comments.filter((c) => c.postId !== id);
    return reply(noContent({ "X-Mock-Latency": `${ms}ms` }));
  }

  // allowedMethods() and the handlers above cover the same paths.
  return reply(noSuchEndpoint(method, url.pathname, basePath, lang));
}

/* ---------- GraphQL ---------- */

async function handleGraphQL(
  store: MockStore,
  req: Request,
  url: URL,
  verb: string,
  basePath: string,
  lang: Lang,
  reply: (r: Response) => HandleResult,
): Promise<HandleResult> {
  const dataloader = url.searchParams.get("dataloader") === "1";
  const badRequest = (title: string, en: string, zh: string) =>
    reply(problem({ status: 400, title, lang, detail: tr(lang, en, zh) }));

  const run = (query: string, variables: Record<string, unknown>, operationName: string | undefined, ms: number) => {
    const outcome = executeGraphQL(store, query, variables, operationName, {
      dataloader,
      lang,
      auth: readAuth(req),
      readOnly: verb === "GET",
    });
    if (outcome.kind === "mutation-over-get") {
      // GraphQL over HTTP: a GET must never change state.
      return reply(
        problem({
          status: 405,
          title: "Method Not Allowed",
          lang,
          detail: tr(
            lang,
            "A mutation cannot be sent with GET, because GET must never change anything on the server. Send it with POST.",
            "mutation 不能用 GET 发送:GET 不应改变服务器上的任何东西。请改用 POST。",
          ),
          headers: { Allow: "POST" },
        }),
      );
    }
    const { result } = outcome;
    // GraphQL traditionally answers 200 even when fields fail, so res.ok cannot
    // tell you whether it worked -- you must read body.errors (chapter 09).
    return reply(
      json(result, {
        headers: {
          ...languageHeaders(lang),
          "X-Resolver-Calls": String((result.extensions?.dbCalls as number) ?? 0),
          "X-Mock-Latency": `${ms}ms`,
          "X-Teaching-Note": "GraphQL returns 200 even on field errors - check body.errors, not res.ok.",
        },
      }),
    );
  };

  if (verb === "POST") {
    const ms = await delay(url, 40);
    const parsed = await readJson(req);
    if (!parsed.ok) {
      return badRequest(
        "Malformed JSON",
        'A GraphQL request body is a JSON object such as {"query":"...","variables":{}}.',
        'GraphQL 请求体应该是 {"query":"...","variables":{}} 这样的 JSON 对象。',
      );
    }
    const { query, variables, operationName } = parsed.value;
    if (typeof query !== "string" || !query.trim()) {
      return badRequest(
        "Missing query",
        "The request body needs a query field: everything in GraphQL starts from that query text.",
        "请求体里必须有 query 字段 —— GraphQL 的一切都从这段查询文本开始。",
      );
    }
    if (variables != null && (typeof variables !== "object" || Array.isArray(variables))) {
      return badRequest("Bad variables", "variables must be a JSON object.", "variables 必须是 JSON 对象。");
    }
    if (operationName != null && typeof operationName !== "string") {
      return badRequest("Bad operationName", "operationName must be a string.", "operationName 必须是字符串。");
    }
    return run(
      query,
      (variables as Record<string, unknown> | null | undefined) ?? {},
      typeof operationName === "string" ? operationName : undefined,
      ms,
    );
  }

  // GET (and HEAD, which stamp() strips)
  const query = url.searchParams.get("query");
  if (!query) {
    return reply(json(graphqlSchemaDocument(basePath, lang), { headers: languageHeaders(lang) }));
  }
  const ms = await delay(url, 40);
  const rawVars = url.searchParams.get("variables");
  let variables: Record<string, unknown> = {};
  if (rawVars) {
    let parsedVars: unknown;
    try {
      parsedVars = JSON.parse(rawVars);
    } catch {
      parsedVars = undefined;
    }
    if (parsedVars === undefined || (parsedVars !== null && (typeof parsedVars !== "object" || Array.isArray(parsedVars)))) {
      return badRequest("Bad variables", "variables must be a JSON object.", "variables 必须是 JSON 对象。");
    }
    variables = (parsedVars as Record<string, unknown>) ?? {};
  }
  return run(query, variables, url.searchParams.get("operationName") ?? undefined, ms);
}

/* ---------- self-documentation ---------- */

function graphqlSchemaDocument(basePath: string, lang: Lang) {
  const t = (en: string, zh: string) => tr(lang, en, zh);
  return {
    message: t("APIer local GraphQL endpoint", "APIer 本地 GraphQL 端点"),
    usage: {
      post: `POST ${basePath}/graphql  body: {"query":"{ posts(limit: 3) { title } }"}`,
      get: `GET ${basePath}/graphql?query={posts(limit:3){title}}`,
      mutations: t(
        `Mutations run only over POST and need Authorization: Bearer ${DEMO_TOKEN}.`,
        `mutation 只能用 POST 发送,并且需要 Authorization: Bearer ${DEMO_TOKEN}。`,
      ),
      dataloader: t(
        "Add ?dataloader=1 to either form to compare the N+1 query counts",
        "任一形式加 ?dataloader=1,可以对比 N+1 的查询次数",
      ),
      introspection: '{ __schema { types { name kind } } }   { __type(name: "Post") { fields { name } } }',
    },
    schema: printSchema(),
  };
}

function indexDocument(store: MockStore, basePath: string, scope: string, lang: Lang) {
  const t = (en: string, zh: string) => tr(lang, en, zh);
  return {
    name: "APIer Mock API",
    scope,
    why:
      scope === "browser-local"
        ? t(
            "This mock API runs inside your own browser (Service Worker + IndexedDB): the data belongs to you alone, nobody else can see or change it, it survives a refresh, and you can reset it at any time.",
            "这套 Mock API 跑在你自己的浏览器里(Service Worker + IndexedDB):数据只属于你,别人看不到也改不了,刷新还在,随时可以重置。",
          )
        : t(
            "The mock API on the local development server, for curl and other terminal tools; its data belongs to this process alone.",
            "本地开发服务器上的 Mock API,供 curl 等终端工具使用;它的数据是这个进程独有的。",
          ),
    language: t(
      "Messages follow Accept-Language (en or zh-CN; English when absent). The stored data is the same in both languages.",
      "提示文字跟随 Accept-Language(en 或 zh-CN,缺省为英文)。存储的数据在两种语言下完全相同。",
    ),
    data: {
      users: store.users.length,
      posts: store.posts.length,
      comments: store.comments.length,
      note: t(
        `Writes really take effect; POST ${basePath}/reset restores the initial data.`,
        `写操作会真的生效;POST ${basePath}/reset 可恢复出厂设置。`,
      ),
    },
    auth: {
      write: `Authorization: Bearer ${DEMO_TOKEN}`,
      readOnly: `Authorization: Bearer ${READONLY_TOKEN}  ${t("(writing with it answers 403)", "(拿它去写会得到 403)")}`,
      none: t("Writing without a credential answers 401", "不带凭证去写会得到 401"),
    },
    rest: {
      [`GET    ${basePath}/posts`]: t(
        "List. ?page= &per_page= (or ?limit= &offset=), ?status= &authorId=, ?sort=-createdAt, ?fields=id,title",
        "列表。支持 ?page= &per_page=(或 ?limit= &offset=)、?status= &authorId=、?sort=-createdAt、?fields=id,title",
      ),
      [`POST   ${basePath}/posts`]: t(
        "Create → 201 + Location. Idempotency-Key prevents duplicates",
        "创建 → 201 + Location。支持 Idempotency-Key 去重",
      ),
      [`GET    ${basePath}/posts/:id`]: t(
        "One post, with an ETag; ?embed=author,comments returns related data in the same response",
        "单篇。带 ETag;?embed=author,comments 可以在同一个响应里带回关联数据",
      ),
      [`PUT    ${basePath}/posts/:id`]: t(
        "Replace: writable fields you leave out go back to their defaults",
        "整体替换 —— 没发的可写字段回到默认值",
      ),
      [`PATCH  ${basePath}/posts/:id`]: t("Partial update: only the fields you send change", "部分修改 —— 只动你发的字段"),
      [`DELETE ${basePath}/posts/:id`]: t("Delete → 204; deleting again → 404", "删除 → 204;再删一次 → 404"),
      [`GET    ${basePath}/posts/:id/comments`]: t("Nested resource; ?embed=author", "嵌套资源;?embed=author"),
      [`POST   ${basePath}/posts/:id/comments`]: t("Add a comment → 201 + Location", "发表评论 → 201 + Location"),
      [`GET    ${basePath}/posts/:id/comments/:commentId`]: t("One comment", "单条评论"),
      [`GET    ${basePath}/users`]: t("User list; the same paging parameters as posts", "用户列表;分页参数与文章列表相同"),
      [`GET    ${basePath}/users/:id`]: t("One user; ?embed=posts", "单个用户;?embed=posts"),
      [`POST   ${basePath}/reset`]: t("Restore the initial data", "恢复出厂设置"),
    },
    http: t(
      "Every resource answers HEAD like GET without a body, and OPTIONS with an Allow header; a method it does not support gets 405 plus Allow.",
      "每个资源都支持 HEAD(与 GET 相同,只是没有正文)和 OPTIONS(用 Allow 头列出支持的方法);不支持的方法得到 405 和 Allow 头。",
    ),
    graphql: {
      endpoint: `POST ${basePath}/graphql`,
      playground: `GET ${basePath}/graphql  ${t("(without a query it returns the schema; GET runs queries only)", "(不带 query 时返回 schema;GET 只执行查询)")}`,
      sameData: t(
        "Shares its data with the REST endpoints above, so the comparison in the final chapter can be done by hand",
        "和上面的 REST 端点共用同一份数据 —— 终章的对比可以亲手做",
      ),
      nPlusOne: t(
        "Add ?dataloader=1 and extensions.dbCalls drops from 11 to 2",
        "加 ?dataloader=1,extensions.dbCalls 会从 11 降到 2",
      ),
      auth: t(
        `Mutations need Authorization: Bearer ${DEMO_TOKEN}, as REST writes do`,
        `mutation 与 REST 的写操作一样,需要 Authorization: Bearer ${DEMO_TOKEN}`,
      ),
    },
    knobs: {
      "?delay=800": t(
        "Adds artificial server time (at most 3000 ms; 0 for none) so the timing is easier to see",
        "人为增加服务器耗时(上限 3000ms,0 表示不加),让 timing 看得更清楚",
      ),
      "If-None-Match": t("Send the ETag you received → an empty 304", "带上上次拿到的 ETag → 304 空响应"),
      "Idempotency-Key": t(
        "Repeating a POST with the same key creates the post only once; the same key with a different body → 422",
        "同一个 key 重复 POST 只会创建一次;同一个 key 换了请求体 → 422",
      ),
      "Accept-Language": t("en or zh-CN selects the language of the messages", "en 或 zh-CN 选择提示文字的语言"),
      rateLimit: t(
        `${RATE_LIMIT} requests per minute; beyond that, 429 + Retry-After`,
        `每分钟 ${RATE_LIMIT} 次;超出后返回 429 和 Retry-After`,
      ),
    },
  };
}
