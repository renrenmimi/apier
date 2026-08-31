// Mock API 的 HTTP 语义层 —— 课程里讲过的规矩,这里逐条真的兑现。
//  - RFC 9457 problem+json 错误体(第 04 章)
//  - ETag / If-None-Match → 304(第 05 章)
//  - Idempotency-Key 去重(第 05 章)
//  - 限流 429 + Retry-After + X-RateLimit-*(第 05 章)
//  - Bearer token → 401 / 403(第 06 章)
//  - 可控延迟,让检查器的 timing 有东西可看
// 所有响应都带宽松 CORS 头:同源本来就不需要,但学习者用 curl / 别的端口试也不会被拦。

import { db } from "./db";

/** 教学用的假 token —— 课程里到处引用,值固定不变 */
export const DEMO_TOKEN = "apier-demo-token";
/** 只有这个 token 的持有者有写权限;下面那个是「认证通过但权限不够」的演示 */
export const READONLY_TOKEN = "apier-readonly-token";

const BASE_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, If-None-Match, Idempotency-Key",
  "Access-Control-Expose-Headers":
    "ETag, Location, Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Mock-Latency, X-Resolver-Calls",
  "X-Powered-By": "APIer Mock API",
};

// HTTP 头的值只能是 ASCII(ByteString)。教学注释里手滑写个中文破折号就会 500,
// 所以统一在出口处兜底:非 ASCII 字符替换掉,别让响应头拖垮整个响应。
function ascii(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = /[^\x20-\x7E]/.test(v) ? v.replace(/[^\x20-\x7E]/g, "-") : v;
  }
  return out;
}

/** 统一出口:带上教学用的公共响应头 */
export function json(
  data: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
) {
  const { status = 200, headers = {} } = init;
  return new Response(status === 204 ? null : JSON.stringify(data, null, 2), {
    status,
    headers: ascii({
      ...BASE_HEADERS,
      ...(status === 204 ? {} : { "Content-Type": "application/json; charset=utf-8" }),
      ...headers,
    }),
  });
}

/** 204 之类的空响应 */
export function noContent(headers: Record<string, string> = {}) {
  return new Response(null, { status: 204, headers: ascii({ ...BASE_HEADERS, ...headers }) });
}

/** RFC 9457 Problem Details —— 第 04 章讲的「错误也要好好说话」 */
export function problem(opts: {
  status: number;
  title: string;
  detail: string;
  type?: string;
  errors?: { field: string; message: string }[];
  headers?: Record<string, string>;
}) {
  const { status, title, detail, type, errors, headers = {} } = opts;
  const body: Record<string, unknown> = {
    type: type ?? `https://apier.dev/problems/${slug(title)}`,
    title,
    status,
    detail,
  };
  if (errors) body.errors = errors;
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: ascii({
      ...BASE_HEADERS,
      "Content-Type": "application/problem+json; charset=utf-8",
      ...headers,
    }),
  });
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** CORS 预检 —— 第 06 章的 OPTIONS 演示 */
export function preflight() {
  return new Response(null, {
    status: 204,
    headers: { ...BASE_HEADERS, "Access-Control-Max-Age": "600" },
  });
}

/** 弱 ETag:内容变了指纹就变(教学够用,不追求密码学强度) */
export function etagOf(data: unknown): string {
  const s = JSON.stringify(data);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `"${(h >>> 0).toString(16)}"`;
}

/** 人为延迟,让检查器的 timing 不是 0ms;?delay=800 可自定义(上限 3s) */
export async function delay(req: Request, fallback = 60): Promise<number> {
  const q = Number(new URL(req.url).searchParams.get("delay"));
  const ms = Number.isFinite(q) && q > 0 ? Math.min(q, 3000) : fallback;
  await new Promise((r) => setTimeout(r, ms));
  return ms;
}

/* ---------- 限流(第 05 章)---------- */

const RATE_LIMIT = 60; // 每窗口 60 次,与 GitHub 匿名配额同数量级
const WINDOW_MS = 60_000;

export function rateLimit(): { ok: boolean; headers: Record<string, string> } {
  const now = Date.now();
  if (now - db.rate.windowStart > WINDOW_MS) {
    db.rate = { windowStart: now, used: 0 };
  }
  db.rate.used++;
  const remaining = Math.max(0, RATE_LIMIT - db.rate.used);
  const resetAt = Math.ceil((db.rate.windowStart + WINDOW_MS) / 1000);
  const headers = {
    "X-RateLimit-Limit": String(RATE_LIMIT),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetAt),
  };
  return { ok: db.rate.used <= RATE_LIMIT, headers };
}

export function tooManyRequests(headers: Record<string, string>) {
  const retry = Math.max(1, Math.ceil((db.rate.windowStart + WINDOW_MS - Date.now()) / 1000));
  return problem({
    status: 429,
    title: "Too Many Requests",
    detail: `本窗口配额已用完,请 ${retry} 秒后再试。真实 API 也是这么回答的 —— 看 Retry-After 头。`,
    headers: { ...headers, "Retry-After": String(retry) },
  });
}

/* ---------- 认证(第 06 章)---------- */

export type Auth =
  | { kind: "anonymous" }
  | { kind: "user"; canWrite: boolean };

export function readAuth(req: Request): Auth {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  if (!m) return { kind: "anonymous" };
  const token = m[1].trim();
  if (token === DEMO_TOKEN) return { kind: "user", canWrite: true };
  if (token === READONLY_TOKEN) return { kind: "user", canWrite: false };
  return { kind: "anonymous" };
}

/** 401:没带/带错凭证。故意带上 WWW-Authenticate,规范要求 */
export function unauthorized() {
  return problem({
    status: 401,
    title: "Unauthorized",
    detail: `这个端点要求认证。带上 Authorization: Bearer ${DEMO_TOKEN} 再试一次 —— 401 的意思是「你是谁?」`,
    headers: { "WWW-Authenticate": `Bearer realm="apier", error="invalid_token"` },
  });
}

/** 403:认识你,但不许你干这个 */
export function forbidden() {
  return problem({
    status: 403,
    title: "Forbidden",
    detail:
      "凭证有效,但这枚 token 只有读权限 —— 403 的意思是「认识你,但这事不归你管」,换个账号也不解决,得换权限。",
  });
}

/* ---------- 幂等键(第 05 章)---------- */

export function idempotentHit(req: Request): { status: number; body: unknown } | null {
  const key = req.headers.get("idempotency-key");
  if (!key) return null;
  return db.idempotency.get(key) ?? null;
}

export function idempotentSave(req: Request, status: number, body: unknown) {
  const key = req.headers.get("idempotency-key");
  if (key) db.idempotency.set(key, { status, body });
}

/* ---------- 查询参数解析 ---------- */

export interface ListQuery {
  page: number;
  perPage: number;
  sort: { field: string; desc: boolean } | null;
  fields: string[] | null;
  filters: Record<string, string>;
}

const RESERVED = new Set(["page", "per_page", "sort", "fields", "delay", "limit", "after"]);

export function parseListQuery(url: URL): ListQuery {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get("per_page")) || 10));

  const rawSort = url.searchParams.get("sort");
  const sort = rawSort
    ? { field: rawSort.replace(/^-/, ""), desc: rawSort.startsWith("-") }
    : null;

  const rawFields = url.searchParams.get("fields");
  const fields = rawFields ? rawFields.split(",").map((f) => f.trim()).filter(Boolean) : null;

  const filters: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    if (!RESERVED.has(k)) filters[k] = v;
  });

  return { page, perPage, sort, fields, filters };
}

/** 字段裁剪 ?fields=id,title —— 第 05 章 */
export function pick<T extends Record<string, unknown>>(row: T, fields: string[] | null) {
  if (!fields) return row;
  const out: Record<string, unknown> = {};
  for (const f of fields) if (f in row) out[f] = row[f];
  return out;
}
