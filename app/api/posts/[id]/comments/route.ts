// 嵌套资源:/api/posts/42/comments —— 第 04 章「嵌套层级 ≤ 2 层」的正面示范。

import { db, findPost, commentsOfPost, findUser } from "@/lib/mock/db";
import {
  delay,
  etagOf,
  forbidden,
  json,
  preflight,
  problem,
  rateLimit,
  readAuth,
  tooManyRequests,
  unauthorized,
} from "@/lib/mock/http";

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

  if (!findPost(Number(id))) {
    return problem({
      status: 404,
      title: "Post Not Found",
      detail: `文章 ${id} 不存在,自然也就没有它的评论。`,
    });
  }

  const embedAuthor = new URL(req.url).searchParams.get("embed") === "author";
  const rows = commentsOfPost(Number(id)).map((c) =>
    embedAuthor ? { ...c, author: findUser(c.authorId) ?? null } : c,
  );

  return json(
    { data: rows, total: rows.length },
    { headers: { ...rl.headers, ETag: etagOf(rows), "X-Mock-Latency": `${ms}ms` } },
  );
}

export async function POST(req: Request, { params }: Ctx) {
  const rl = rateLimit();
  if (!rl.ok) return tooManyRequests(rl.headers);
  const auth = readAuth(req);
  if (auth.kind === "anonymous") return unauthorized();
  if (!auth.canWrite) return forbidden();

  const { id } = await params;
  const ms = await delay(req);
  const post = findPost(Number(id));
  if (!post) {
    return problem({
      status: 404,
      title: "Post Not Found",
      detail: `不能给不存在的文章 ${id} 写评论。`,
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return problem({ status: 400, title: "Malformed JSON", detail: "请求体不是合法 JSON。" });
  }

  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  if (!body) {
    return problem({
      status: 422,
      title: "Validation Failed",
      detail: "评论内容不能为空。",
      errors: [{ field: "body", message: "评论内容不能为空" }],
    });
  }

  const comment = {
    id: db.nextCommentId++,
    postId: post.id,
    authorId: Number(payload.authorId ?? 1),
    body,
    createdAt: new Date().toISOString(),
  };
  db.comments.push(comment);

  return json(comment, {
    status: 201,
    headers: {
      ...rl.headers,
      Location: `/api/posts/${post.id}/comments`,
      "X-Mock-Latency": `${ms}ms`,
    },
  });
}
