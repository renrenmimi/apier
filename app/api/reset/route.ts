// POST /api/reset —— 把 Mock 数据恢复出厂设置。
// 学习者随便 PUT/DELETE 折腾,一键还原,不用重启服务器。

import { resetDb, db } from "@/lib/mock/db";
import { json, preflight } from "@/lib/mock/http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function POST() {
  resetDb();
  return json({
    ok: true,
    message: "Mock 数据已恢复出厂设置。",
    counts: { users: db.users.length, posts: db.posts.length, comments: db.comments.length },
  });
}
