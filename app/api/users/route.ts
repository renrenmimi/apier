// GET /api/users —— 用户列表(第 03 章「资源是名词」的最小示范)。

import { db } from "@/lib/mock/db";
import { delay, etagOf, json, parseListQuery, pick, preflight, rateLimit, tooManyRequests } from "@/lib/mock/http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const rl = rateLimit();
  if (!rl.ok) return tooManyRequests(rl.headers);
  const ms = await delay(req);

  const q = parseListQuery(new URL(req.url));
  const start = (q.page - 1) * q.perPage;
  const slice = db.users.slice(start, start + q.perPage).map((u) => pick({ ...u }, q.fields));
  const body = { data: slice, page: q.page, perPage: q.perPage, total: db.users.length };

  return json(body, {
    headers: { ...rl.headers, ETag: etagOf(body), "Cache-Control": "public, max-age=60", "X-Mock-Latency": `${ms}ms` },
  });
}
