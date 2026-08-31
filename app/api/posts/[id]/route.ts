// 单篇文章:GET(含 ETag/304)/ PUT(整体替换,会丢字段!)/ PATCH(部分修改)/ DELETE(204)
// 这四个方法的差别是第 04 章的重头戏 —— 这里让学习者亲手把字段「弄丢」一次。

import { db, findPost, findUser, commentsOfPost } from "@/lib/mock/db";
import {
  delay,
  etagOf,
  forbidden,
  json,
  noContent,
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

function notFound(id: string) {
  return problem({
    status: 404,
    title: "Post Not Found",
    detail: `没有 id 为 ${id} 的文章。也许它从来不存在,也许刚被 DELETE 掉了 —— 两种情况服务器都回 404。`,
  });
}

export async function GET(req: Request, { params }: Ctx) {
  const rl = rateLimit();
  if (!rl.ok) return tooManyRequests(rl.headers);
  const { id } = await params;
  const ms = await delay(req);

  const post = findPost(Number(id));
  if (!post) return notFound(id);

  // ?embed=author,comments —— 让 REST 也能一次多拿点,方便和 GraphQL 对照(终章)
  const embed = (new URL(req.url).searchParams.get("embed") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const body: Record<string, unknown> = { ...post };
  if (embed.includes("author")) body.author = findUser(post.authorId) ?? null;
  if (embed.includes("comments")) body.comments = commentsOfPost(post.id);

  const etag = etagOf(body);
  // 协商缓存:客户端带着上次的指纹来,没变就回 304 空身子(第 05 章)
  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ...rl.headers,
        ETag: etag,
        "Access-Control-Allow-Origin": "*",
        "X-Mock-Latency": `${ms}ms`,
      },
    });
  }

  return json(body, {
    headers: {
      ...rl.headers,
      ETag: etag,
      "Cache-Control": "public, max-age=30",
      "X-Mock-Latency": `${ms}ms`,
    },
  });
}

/** PUT / PATCH 共用的前置检查 */
async function guard(req: Request, id: string) {
  const rl = rateLimit();
  if (!rl.ok) return { err: tooManyRequests(rl.headers) };
  const auth = readAuth(req);
  if (auth.kind === "anonymous") return { err: unauthorized() };
  if (!auth.canWrite) return { err: forbidden() };
  const post = findPost(Number(id));
  if (!post) return { err: notFound(id) };
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return {
      err: problem({
        status: 400,
        title: "Malformed JSON",
        detail: "请求体不是合法 JSON。",
      }),
    };
  }
  return { rl: rl.headers, post, payload };
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guard(req, id);
  if (g.err) return g.err;
  const ms = await delay(req);

  const { post, payload, rl } = g;
  const idx = db.posts.findIndex((p) => p.id === post!.id);

  // PUT = 整体替换。请求体里没写的字段,就是真的没了 ——
  // 这正是课程要让学习者亲眼看到的「字段蒸发」。id 和 createdAt 属于服务器,保留。
  const replaced = {
    id: post!.id,
    createdAt: post!.createdAt,
    title: typeof payload.title === "string" ? payload.title : "",
    body: typeof payload.body === "string" ? payload.body : "",
    authorId: Number(payload.authorId ?? 0),
    status: (payload.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT",
  };
  db.posts[idx] = replaced;

  return json(replaced, {
    headers: {
      ...rl!,
      ETag: etagOf(replaced),
      "X-Mock-Latency": `${ms}ms`,
      "X-Teaching-Note": "PUT replaced the whole resource; omitted fields are gone.",
    },
  });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guard(req, id);
  if (g.err) return g.err;
  const ms = await delay(req);

  const { post, payload, rl } = g;
  const idx = db.posts.findIndex((p) => p.id === post!.id);

  // PATCH = 部分修改。只动请求体里出现的字段,其余原样保留。
  const patched = { ...post! };
  for (const k of ["title", "body", "authorId", "status"] as const) {
    if (k in payload) {
      (patched as unknown as Record<string, unknown>)[k] =
        k === "authorId" ? Number(payload[k]) : payload[k];
    }
  }
  db.posts[idx] = patched;

  return json(patched, {
    headers: {
      ...rl!,
      ETag: etagOf(patched),
      "X-Mock-Latency": `${ms}ms`,
      "X-Teaching-Note": "PATCH merged only the fields you sent.",
    },
  });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const rl = rateLimit();
  if (!rl.ok) return tooManyRequests(rl.headers);
  const auth = readAuth(req);
  if (auth.kind === "anonymous") return unauthorized();
  if (!auth.canWrite) return forbidden();

  const { id } = await params;
  const ms = await delay(req);
  const idx = db.posts.findIndex((p) => p.id === Number(id));

  // 已经删过了 → 404。但 DELETE 依然是幂等的:
  // 幂等看的是「服务器最终状态」(这篇没了),不是看响应码一不一样。
  if (idx === -1) return notFound(id);

  db.posts.splice(idx, 1);
  db.comments = db.comments.filter((c) => c.postId !== Number(id));

  // 204:办成了,但没什么可说的 —— 所以没有响应体
  return noContent({ ...rl.headers, "X-Mock-Latency": `${ms}ms` });
}
