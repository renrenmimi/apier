// GET  /api/posts   列表:分页 / 过滤 / 排序 / 字段裁剪(第 04、05 章)
// POST /api/posts   创建:201 + Location,支持 Idempotency-Key(第 04、05 章)

import { db } from "@/lib/mock/db";
import {
  delay,
  etagOf,
  idempotentHit,
  idempotentSave,
  json,
  parseListQuery,
  pick,
  preflight,
  problem,
  rateLimit,
  readAuth,
  tooManyRequests,
  unauthorized,
  forbidden,
} from "@/lib/mock/http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const rl = rateLimit();
  if (!rl.ok) return tooManyRequests(rl.headers);
  const ms = await delay(req);

  const url = new URL(req.url);
  const q = parseListQuery(url);

  let rows = [...db.posts];

  // 过滤:?status=PUBLISHED、?authorId=3
  for (const [k, v] of Object.entries(q.filters)) {
    rows = rows.filter((p) => String((p as unknown as Record<string, unknown>)[k]) === v);
  }

  // 排序:?sort=-createdAt(减号 = 倒序,JSON:API 惯例)
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

  // Link 头 —— GitHub 就是这么给分页导航的
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

  return json(body, {
    headers: {
      ...rl.headers,
      Link: links.join(", "),
      ETag: etagOf(body),
      "Cache-Control": "public, max-age=30",
      "X-Total-Count": String(total),
      "X-Mock-Latency": `${ms}ms`,
    },
  });
}

export async function POST(req: Request) {
  const rl = rateLimit();
  if (!rl.ok) return tooManyRequests(rl.headers);

  // 写操作要认证 —— 401 与 403 的分界在这里(第 06 章)
  const auth = readAuth(req);
  if (auth.kind === "anonymous") return unauthorized();
  if (!auth.canWrite) return forbidden();

  // 幂等键命中:直接回放第一次的结果,不重复创建(第 05 章)
  const hit = idempotentHit(req);
  if (hit) {
    return json(hit.body, {
      status: hit.status,
      headers: { ...rl.headers, "X-Idempotent-Replay": "true" },
    });
  }

  const ms = await delay(req);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return problem({
      status: 400,
      title: "Malformed JSON",
      detail: "请求体不是合法 JSON。检查一下引号和逗号 —— 400 说的是「这句话我根本没读懂」。",
      headers: rl.headers,
    });
  }

  // 语义校验 → 422(格式对但内容不合法,区别于 400)
  const errors: { field: string; message: string }[] = [];
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  if (!title) errors.push({ field: "title", message: "标题不能为空" });
  if (title.length > 120) errors.push({ field: "title", message: "标题不能超过 120 字" });
  if (!body) errors.push({ field: "body", message: "正文不能为空" });
  const authorId = Number(payload.authorId ?? 1);
  if (!db.users.some((u) => u.id === authorId))
    errors.push({ field: "authorId", message: `作者 ${authorId} 不存在` });

  if (errors.length) {
    return problem({
      status: 422,
      title: "Validation Failed",
      detail: "请求格式没问题,但内容通不过校验 —— 这正是 422 与 400 的分界。",
      errors,
      headers: rl.headers,
    });
  }

  const post = {
    id: db.nextPostId++,
    title,
    body,
    authorId,
    status: (payload.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT",
    createdAt: new Date().toISOString(),
  };
  db.posts.push(post);
  idempotentSave(req, 201, post);

  return json(post, {
    status: 201,
    headers: {
      ...rl.headers,
      // 201 必配 Location:告诉客户端「新东西在这个地址」
      Location: `/api/posts/${post.id}`,
      "X-Mock-Latency": `${ms}ms`,
    },
  });
}
