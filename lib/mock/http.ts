// Stateless HTTP helpers shared by every mock runtime (Service Worker, local
// dev server, tests). Nothing here reads or writes a store; anything that needs
// visitor state lives in engine.ts and receives the store explicitly.

/** Language of the human-readable text in a response. Stored data is not translated. */
export type Lang = "en" | "zh";

/**
 * Picks the message language from Accept-Language, highest q first. The
 * inspector sends the visitor's interface language; anything that is not
 * Chinese gets English, which is also the default when the header is absent.
 */
export function langOf(req: Request): Lang {
  const header = req.headers.get("accept-language");
  if (!header) return "en";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.slice(2)) : 1 };
    })
    .filter((t) => t.tag && t.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    if (tag === "zh" || tag.startsWith("zh-")) return "zh";
    if (tag === "en" || tag.startsWith("en-") || tag === "*") return "en";
  }
  return "en";
}

/** One message in both languages; a response never mixes the two. */
export const tr = (lang: Lang, en: string, zh: string) => (lang === "zh" ? zh : en);

/** Joins a list the way each language writes one. */
export const list = (lang: Lang, items: readonly string[]) => items.join(lang === "zh" ? "、" : ", ");

/** Headers for a response whose text depends on Accept-Language. */
export const languageHeaders = (lang: Lang): Record<string, string> => ({
  "Content-Language": lang === "zh" ? "zh-CN" : "en",
  Vary: "Accept-Language",
});

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

/** HEAD answers exactly like GET, minus the body (RFC 9110 §9.3.2). */
export function withoutBody(res: Response) {
  return new Response(null, { status: res.status, statusText: res.statusText, headers: res.headers });
}

/** RFC 9457 Problem Details, the error shape chapter 04 designs. */
export function problem(opts: {
  status: number;
  /** Short and stable, so it stays in English; `detail` follows the request language. */
  title: string;
  detail: string;
  lang: Lang;
  type?: string;
  errors?: { field: string; message: string }[];
  headers?: Record<string, string>;
}) {
  const { status, title, detail, lang, type, errors, headers = {} } = opts;
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
      ...languageHeaders(lang),
      ...headers,
    }),
  });
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * OPTIONS. `Allow` is the HTTP answer to "which methods does this resource
 * support" (RFC 9110 §9.3.7); the Access-Control-* headers are the separate
 * CORS answer a browser reads during a preflight (chapter 06).
 */
export function preflight(allow?: string) {
  return new Response(null, {
    status: 204,
    headers: ascii({
      ...BASE_HEADERS,
      "Access-Control-Max-Age": "600",
      ...(allow ? { Allow: allow } : {}),
    }),
  });
}

/** Weak content fingerprint. Good enough to teach ETag; not cryptographic. */
export function etagOf(data: unknown): string {
  const s = JSON.stringify(data);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `"${(h >>> 0).toString(16)}"`;
}

/**
 * If-None-Match evaluation (RFC 9110 §13.1.2): a list of entity tags compared
 * weakly, so W/"x" matches "x", and "*" matches any current representation.
 */
export function ifNoneMatchHits(header: string | null, etag: string): boolean {
  if (!header) return false;
  if (header.trim() === "*") return true;
  const opaque = (tag: string) => tag.trim().replace(/^W\//, "");
  const current = opaque(etag);
  return header.split(",").some((tag) => opaque(tag) === current);
}

/**
 * Artificial latency so the inspector's timing panel has something to show.
 * An explicit ?delay=0 means no delay at all; the fallback applies only when
 * the parameter is absent or unreadable.
 */
export async function delay(url: URL, fallback = 60): Promise<number> {
  const raw = url.searchParams.get("delay");
  const q = raw === null || raw.trim() === "" ? NaN : Number(raw);
  const ms = Number.isFinite(q) && q >= 0 ? Math.min(q, 3000) : fallback;
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  return ms;
}

/** Who is asking. A missing credential and a wrong one are different answers (RFC 6750 §3.1). */
export type Auth = { kind: "anonymous" } | { kind: "invalid" } | { kind: "user"; canWrite: boolean };

/** Pure: derives identity from the request alone. */
export function readAuth(req: Request): Auth {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  // No bearer credential at all, including another scheme such as Basic.
  if (!m) return { kind: "anonymous" };
  const token = m[1].trim();
  if (token === DEMO_TOKEN) return { kind: "user", canWrite: true };
  if (token === READONLY_TOKEN) return { kind: "user", canWrite: false };
  return { kind: "invalid" };
}

/**
 * 401. RFC 6750 §3.1: a request that carried no credential gets the challenge
 * without an error code; only a token that was sent and rejected gets
 * error="invalid_token".
 */
export function unauthorized(lang: Lang, invalidToken = false) {
  return problem({
    status: 401,
    title: "Unauthorized",
    lang,
    detail: invalidToken
      ? tr(
          lang,
          `The token in the Authorization header is not valid. Send Authorization: Bearer ${DEMO_TOKEN} and try again.`,
          `Authorization 头里的 token 无效。带上 Authorization: Bearer ${DEMO_TOKEN} 再试一次。`,
        )
      : tr(
          lang,
          `This endpoint requires authentication. Send Authorization: Bearer ${DEMO_TOKEN} and try again. A 401 asks: who are you?`,
          `这个端点要求认证。带上 Authorization: Bearer ${DEMO_TOKEN} 再试一次。401 问的是「你是谁」。`,
        ),
    headers: {
      "WWW-Authenticate": invalidToken
        ? `Bearer realm="apier", error="invalid_token"`
        : `Bearer realm="apier"`,
    },
  });
}

/** 403 with the RFC 6750 error code for a token that is valid but lacks permission. */
export function forbidden(lang: Lang) {
  return problem({
    status: 403,
    title: "Forbidden",
    lang,
    detail: tr(
      lang,
      "The credential is valid, but this token may only read. A 403 means the server knows who you are and you do not have this permission. Logging in again as the same identity will not help; you need a credential that may write.",
      "凭证有效,但这枚 token 只有读权限。403 的意思是「知道你是谁,但你没有这个权限」:用同一个身份重新登录没有用,需要一枚有写权限的凭证。",
    ),
    headers: { "WWW-Authenticate": `Bearer realm="apier", error="insufficient_scope"` },
  });
}

/** The 401/403 gate in front of every write; null means the caller may write. */
export function writeGate(auth: Auth, lang: Lang): Response | null {
  if (auth.kind === "anonymous") return unauthorized(lang);
  if (auth.kind === "invalid") return unauthorized(lang, true);
  return auth.canWrite ? null : forbidden(lang);
}

/* ---------- list queries ---------- */

export interface ListQuery {
  /** page/per_page (GitHub style) or limit/offset; both resolve to a window. */
  mode: "page" | "offset";
  page: number;
  perPage: number;
  limit: number;
  offset: number;
  sort: { field: string; desc: boolean } | null;
  fields: string[] | null;
  filters: Record<string, string>;
}

export interface FilterSpec {
  test: (value: string) => boolean;
  /** What a valid value looks like, in both languages. */
  expect: [en: string, zh: string];
}

export interface ListSpec {
  /** Field names a client may request with ?fields= or sort by. */
  fields: readonly string[];
  sortable?: readonly string[];
  filters?: Record<string, FilterSpec>;
}

const POSITIVE: [string, string] = ["a positive integer", "正整数"];
const UP_TO_100: [string, string] = ["an integer from 1 to 100", "1 到 100 之间的整数"];
const NON_NEGATIVE: [string, string] = ["a non-negative integer", "非负整数"];
const isPositive = (v: string) => /^[1-9]\d*$/.test(v);
const isUpTo100 = (v: string) => isPositive(v) && Number(v) <= 100;
const isNonNegative = (v: string) => /^\d+$/.test(v);

export const positiveInteger: FilterSpec = { test: isPositive, expect: POSITIVE };

/** Parameters that belong to cursor pagination, which the mock does not implement. */
const CURSOR_PARAMS = new Set(["cursor", "after", "before", "starting_after", "ending_before"]);

function badQuery(lang: Lang, detail: string) {
  return problem({ status: 400, title: "Invalid Query Parameter", lang, detail });
}

/**
 * Reads and validates a collection query. Unknown parameters are refused with
 * the list of accepted ones: a silently ignored ?offset= or a typo treated as
 * a filter used to return an empty page with no explanation.
 */
export function parseListQuery(
  url: URL,
  spec: ListSpec,
  lang: Lang,
): { ok: true; query: ListQuery } | { ok: false; response: Response } {
  const params = url.searchParams;
  const filters = spec.filters ?? {};
  const accepted = [
    "page",
    "per_page",
    "limit",
    "offset",
    ...(spec.sortable?.length ? ["sort"] : []),
    "fields",
    ...Object.keys(filters),
    "delay",
  ];
  const fail = (detail: string) => ({ ok: false as const, response: badQuery(lang, detail) });
  const invalid = (name: string, value: string, [en, zh]: [string, string]) =>
    fail(
      tr(
        lang,
        `Query parameter "${name}" must be ${en}; got "${value}".`,
        // Chinese text keeps a space before Latin letters and digits.
        `查询参数 "${name}" 应为${/^[\x21-\x7e]/.test(zh) ? " " : ""}${zh},实际是 "${value}"。`,
      ),
    );

  for (const name of new Set(params.keys())) {
    if (accepted.includes(name)) continue;
    const cursorHint = CURSOR_PARAMS.has(name)
      ? tr(
          lang,
          " Cursor pagination is explained in chapter 05, but this mock does not implement it; use page and per_page, or limit and offset.",
          "cursor 分页在第 05 章讲解,但这个 mock 没有实现它;请用 page 与 per_page,或 limit 与 offset。",
        )
      : "";
    return fail(
      tr(
        lang,
        `Unknown query parameter "${name}". This endpoint accepts: ${list(lang, accepted)}.${cursorHint}`,
        `未知的查询参数 "${name}"。这个端点接受:${list(lang, accepted)}。${cursorHint}`,
      ),
    );
  }

  const get = (name: string) => params.get(name);
  const usesPage = get("page") !== null || get("per_page") !== null;
  const usesOffset = get("limit") !== null || get("offset") !== null;
  if (usesPage && usesOffset) {
    return fail(
      tr(
        lang,
        "Use either page and per_page, or limit and offset, not both.",
        "分页参数只能二选一:page 与 per_page,或 limit 与 offset。",
      ),
    );
  }

  const checks: [string, (v: string) => boolean, [string, string]][] = [
    ["page", isPositive, POSITIVE],
    ["per_page", isUpTo100, UP_TO_100],
    ["limit", isUpTo100, UP_TO_100],
    ["offset", isNonNegative, NON_NEGATIVE],
  ];
  for (const [name, ok, expect] of checks) {
    const v = get(name);
    if (v !== null && !ok(v)) return invalid(name, v, expect);
  }

  const page = Number(get("page") ?? 1);
  const perPage = Number(get("per_page") ?? 10);
  const limit = usesOffset ? Number(get("limit") ?? 10) : perPage;
  const offset = usesOffset ? Number(get("offset") ?? 0) : (page - 1) * perPage;

  let sort: ListQuery["sort"] = null;
  const rawSort = get("sort");
  if (rawSort !== null) {
    const field = rawSort.replace(/^-/, "");
    if (!spec.sortable?.includes(field)) {
      return invalid("sort", rawSort, [
        `a field name, optionally prefixed with "-": ${list("en", spec.sortable ?? [])}`,
        `字段名,可加前缀 "-" 表示倒序:${list("zh", spec.sortable ?? [])}`,
      ]);
    }
    sort = { field, desc: rawSort.startsWith("-") };
  }

  let fields: string[] | null = null;
  const rawFields = get("fields");
  if (rawFields !== null) {
    fields = rawFields.split(",").map((f) => f.trim()).filter(Boolean);
    const unknown = fields.find((f) => !spec.fields.includes(f));
    if (unknown) {
      return fail(
        tr(
          lang,
          `Unknown field "${unknown}" in fields. Available: ${list(lang, spec.fields)}.`,
          `fields 里的字段 "${unknown}" 不存在。可用的字段:${list(lang, spec.fields)}。`,
        ),
      );
    }
  }

  const chosen: Record<string, string> = {};
  for (const [name, filter] of Object.entries(filters)) {
    const v = get(name);
    if (v === null) continue;
    if (!filter.test(v)) return invalid(name, v, filter.expect);
    chosen[name] = v;
  }

  return {
    ok: true,
    query: { mode: usesOffset ? "offset" : "page", page, perPage, limit, offset, sort, fields, filters: chosen },
  };
}

/** Sparse fieldsets: ?fields=id,title (chapter 05). */
export function pick<T extends Record<string, unknown>>(row: T, fields: string[] | null) {
  if (!fields) return row;
  const out: Record<string, unknown> = {};
  for (const f of fields) if (f in row) out[f] = row[f];
  return out;
}
