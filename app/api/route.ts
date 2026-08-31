// GET /api —— Mock API 的自我介绍。
// 学习者 curl 一下这里就知道有哪些端点可玩,不用翻源码。

import { db } from "@/lib/mock/db";
import { DEMO_TOKEN, READONLY_TOKEN, json, preflight } from "@/lib/mock/http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET() {
  return json({
    name: "APIer Mock API",
    why: "本地、同源、免注册、不限速、断网也能跑 —— 课程里的每个 HTTP 概念都能在这里亲手验证,不必依赖第三方服务,也永远不会撞 CORS。",
    data: {
      users: db.users.length,
      posts: db.posts.length,
      comments: db.comments.length,
      note: "数据在内存里,你的写操作会真的生效;POST /api/reset 可一键还原。",
    },
    auth: {
      write: `Authorization: Bearer ${DEMO_TOKEN}`,
      readOnly: `Authorization: Bearer ${READONLY_TOKEN}  (拿它去写会得到 403)`,
      none: "不带凭证去写会得到 401",
    },
    rest: {
      "GET    /api/posts": "列表。支持 ?page= &per_page= &status= &sort=-createdAt &fields=id,title",
      "POST   /api/posts": "创建 → 201 + Location。支持 Idempotency-Key 去重",
      "GET    /api/posts/:id": "单篇。带 ETag;?embed=author,comments 可一次多拿",
      "PUT    /api/posts/:id": "整体替换 —— 没发的字段会消失",
      "PATCH  /api/posts/:id": "部分修改 —— 只动你发的字段",
      "DELETE /api/posts/:id": "删除 → 204;再删一次 → 404",
      "GET    /api/posts/:id/comments": "嵌套资源",
      "GET    /api/users": "用户列表",
      "GET    /api/users/:id": "单个用户;?embed=posts",
      "POST   /api/reset": "恢复出厂设置",
    },
    graphql: {
      endpoint: "POST /api/graphql",
      playground: "GET /api/graphql  (不带 query 时返回 schema)",
      sameData: "和上面的 REST 端点共用同一份数据 —— 终章的对比可以亲手做",
      nPlusOne: "加 ?dataloader=1 看 extensions.dbCalls 从 11 掉到 2",
    },
    knobs: {
      "?delay=800": "人为增加服务器耗时(上限 3000ms),让 timing 看得更清楚",
      "If-None-Match": "带上上次拿到的 ETag → 304 空响应",
      "Idempotency-Key": "同一个 key 重复 POST 只会创建一次",
      rateLimit: "每分钟 60 次,超了给 429 + Retry-After",
    },
  });
}
