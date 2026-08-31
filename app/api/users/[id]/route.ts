// GET /api/users/:id —— 单个用户,?embed=posts 可带上他的文章。

import { findUser, postsOfUser } from "@/lib/mock/db";
import { delay, etagOf, json, preflight, problem, rateLimit, tooManyRequests } from "@/lib/mock/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return preflight();
}

export async function GET(req: Request, { params }: Ctx) {
  const rl = rateLimit();
  if (!rl.ok) return tooManyRequests(rl.headers);
  const { id } = await params;
  const ms = await delay(req);

  const user = findUser(Number(id));
  if (!user) {
    return problem({ status: 404, title: "User Not Found", detail: `没有 id 为 ${id} 的用户。` });
  }

  const body: Record<string, unknown> = { ...user };
  if (new URL(req.url).searchParams.get("embed") === "posts") body.posts = postsOfUser(user.id);

  const etag = etagOf(body);
  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: { ...rl.headers, ETag: etag, "Access-Control-Allow-Origin": "*" },
    });
  }

  return json(body, {
    headers: { ...rl.headers, ETag: etag, "Cache-Control": "public, max-age=60", "X-Mock-Latency": `${ms}ms` },
  });
}
