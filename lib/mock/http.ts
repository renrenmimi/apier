// Stateless HTTP helpers shared by every mock runtime (Service Worker, local
// dev server, tests). Nothing here reads or writes a store; anything that needs
// visitor state lives in engine.ts and receives the store explicitly.

/** Fake tokens used throughout the course. Values are fixed and public. */
export const DEMO_TOKEN = "apier-demo-token";
/** Authenticates fine but may not write, so it demonstrates 403 rather than 401. */
export const READONLY_TOKEN = "apier-readonly-token";

const BASE_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, If-None-Match, Idempotency-Key",
  "Access-Control-Expose-Headers":
    "ETag, Location, Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Mock-Latency, X-Resolver-Calls, X-Mock-Scope",
};

// Header values must be ASCII (ByteString). A stray em dash in a teaching note
// used to throw a 500, so every exit point is normalised here instead.
function ascii(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = /[^\x20-\x7E]/.test(v) ? v.replace(/[^\x20-\x7E]/g, "-") : v;
  }
  return out;
}

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

export function noContent(headers: Record<string, string> = {}) {
  return new Response(null, { status: 204, headers: ascii({ ...BASE_HEADERS, ...headers }) });
}

export function notModified(headers: Record<string, string> = {}) {
  return new Response(null, { status: 304, headers: ascii({ ...BASE_HEADERS, ...headers }) });
}

/** RFC 9457 Problem Details, the error shape chapter 04 designs. */
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

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** CORS preflight, used by the OPTIONS demo in chapter 06. */
export function preflight() {
  return new Response(null, {
    status: 204,
    headers: ascii({ ...BASE_HEADERS, "Access-Control-Max-Age": "600" }),
  });
}

/** Weak content fingerprint. Good enough to teach ETag; not cryptographic. */
export function etagOf(data: unknown): string {
  const s = JSON.stringify(data);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `"${(h >>> 0).toString(16)}"`;
}

/** Artificial latency so the inspector's timing panel has something to show. */
export async function delay(url: URL, fallback = 60): Promise<number> {
  const q = Number(url.searchParams.get("delay"));
  const ms = Number.isFinite(q) && q > 0 ? Math.min(q, 3000) : fallback;
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  return ms;
}

export type Auth = { kind: "anonymous" } | { kind: "user"; canWrite: boolean };

/** Pure: derives identity from the request alone. */
export function readAuth(req: Request): Auth {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  if (!m) return { kind: "anonymous" };
  const token = m[1].trim();
  if (token === DEMO_TOKEN) return { kind: "user", canWrite: true };
  if (token === READONLY_TOKEN) return { kind: "user", canWrite: false };
  return { kind: "anonymous" };
}

export function unauthorized() {
  return problem({
    status: 401,
    title: "Unauthorized",
    detail: `这个端点要求认证。带上 Authorization: Bearer ${DEMO_TOKEN} 再试一次 —— 401 的意思是「你是谁?」`,
    headers: { "WWW-Authenticate": `Bearer realm="apier", error="invalid_token"` },
  });
}

export function forbidden() {
  return problem({
    status: 403,
    title: "Forbidden",
    detail:
      "凭证有效,但这枚 token 只有读权限 —— 403 的意思是「认识你,但这事不归你管」,换个账号也不解决,得换权限。",
  });
}

export interface ListQuery {
  page: number;
  perPage: number;
  sort: { field: string; desc: boolean } | null;
  fields: string[] | null;
  filters: Record<string, string>;
}

const RESERVED = new Set(["page", "per_page", "sort", "fields", "delay", "limit", "after", "embed", "dataloader"]);

export function parseListQuery(url: URL): ListQuery {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get("per_page")) || 10));

  const rawSort = url.searchParams.get("sort");
  const sort = rawSort ? { field: rawSort.replace(/^-/, ""), desc: rawSort.startsWith("-") } : null;

  const rawFields = url.searchParams.get("fields");
  const fields = rawFields ? rawFields.split(",").map((f) => f.trim()).filter(Boolean) : null;

  const filters: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    if (!RESERVED.has(k)) filters[k] = v;
  });

  return { page, perPage, sort, fields, filters };
}

/** Sparse fieldsets: ?fields=id,title (chapter 05). */
export function pick<T extends Record<string, unknown>>(row: T, fields: string[] | null) {
  if (!fields) return row;
  const out: Record<string, unknown> = {};
  for (const f of fields) if (f in row) out[f] = row[f];
  return out;
}
