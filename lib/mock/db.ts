// 本地 Mock 数据库 —— 全书贯穿案例「博客」的唯一数据源。
//  - 字段口径与第 04 章端点总表、第 08 章 SDL 完全一致(User/Post/Comment)。
//  - 进程内存储:改动(POST/PUT/PATCH/DELETE)会真的生效,让学习者看到副作用;
//    /api/reset 可一键恢复,dev 热更新也会自然重置。
//  - 种子数据由固定 PRNG 生成 —— 每次启动内容一致,教学截图/答案不会漂移。

export interface User {
  id: number;
  name: string;
  email: string;
}

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Post {
  id: number;
  title: string;
  body: string;
  authorId: number;
  status: PostStatus;
  createdAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  body: string;
  createdAt: string;
}

interface Store {
  users: User[];
  posts: Post[];
  comments: Comment[];
  /** 自增计数器,保证新建资源的 id 不撞车 */
  nextPostId: number;
  nextCommentId: number;
  /** Idempotency-Key → 首次响应快照(第 05 章幂等键教学用) */
  idempotency: Map<string, { status: number; body: unknown }>;
  /** 限流计数:窗口起点 + 已用次数(第 05 章限流教学用) */
  rate: { windowStart: number; used: number };
}

/** 确定性 PRNG(mulberry32)—— 固定种子,内容每次一样 */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES: [string, string][] = [
  ["Ada Lovelace", "ada"],
  ["Grace Hopper", "grace"],
  ["Alan Turing", "alan"],
  ["Radia Perlman", "radia"],
  ["Tim Berners-Lee", "tim"],
  ["Barbara Liskov", "barbara"],
  ["Roy Fielding", "roy"],
  ["Margaret Hamilton", "margaret"],
  ["Linus Torvalds", "linus"],
  ["Katherine Johnson", "katherine"],
];

const TOPICS = [
  "为什么 REST 不是协议",
  "第一次调用 API 踩的三个坑",
  "状态码不是随便挑的",
  "PUT 和 PATCH 到底差在哪",
  "分页:offset 还是 cursor",
  "把 ETag 用起来",
  "幂等键救过我一次线上事故",
  "GraphQL 解决的到底是什么问题",
  "N+1 是怎么炸的",
  "一个端点的心理落差",
  "JWT 里别放密码",
  "CORS 报错不是 API 挂了",
  "OpenAPI 值不值得写",
  "限流要给出 Retry-After",
  "错误响应也要好好说话",
  "缓存是 REST 的隐藏福利",
  "Schema 是一纸契约",
  "DataLoader 的两把刷子",
  "别在 URL 里放动词",
  "版本号放哪儿都行,但要一致",
];

const BODY_SEEDS = [
  "把这件事讲清楚要先回到最开始的问题:客户端和服务器之间,靠什么约定说话。",
  "我一开始也以为这是小事,直到线上真的出了问题,才明白规范存在的理由。",
  "结论先放这儿:没有银弹,只有取舍。下面把两种做法的代价摊开算一遍。",
  "这个坑我踩过两次,第二次还是同样的原因,所以决定写下来提醒自己。",
  "先看现象,再看原理,最后给一段能直接跑的代码。",
];

function seed(): Store {
  const rand = rng(42);
  const users: User[] = NAMES.map(([name, handle], i) => ({
    id: i + 1,
    name,
    email: `${handle}@apier.dev`,
  }));

  const statuses: PostStatus[] = ["PUBLISHED", "PUBLISHED", "PUBLISHED", "DRAFT", "ARCHIVED"];
  const posts: Post[] = [];
  // 50 篇 —— 覆盖课程里出现过的 /posts/42 等具体编号,例子可直接照抄跑通
  for (let i = 1; i <= 50; i++) {
    const topic = TOPICS[Math.floor(rand() * TOPICS.length)];
    posts.push({
      id: i,
      title: i <= TOPICS.length ? TOPICS[i - 1] : `${topic} · 续篇 ${i}`,
      body: BODY_SEEDS[Math.floor(rand() * BODY_SEEDS.length)],
      authorId: 1 + Math.floor(rand() * users.length),
      status: statuses[Math.floor(rand() * statuses.length)],
      // 从 2026-01-01 起每篇隔约一天,时间戳稳定可预期
      createdAt: new Date(Date.UTC(2026, 0, 1) + i * 86400000).toISOString(),
    });
  }

  const comments: Comment[] = [];
  let cid = 1;
  for (const p of posts) {
    const n = Math.floor(rand() * 4); // 0–3 条
    for (let k = 0; k < n; k++) {
      comments.push({
        id: cid++,
        postId: p.id,
        authorId: 1 + Math.floor(rand() * users.length),
        body: ["同意。", "这段讲得好,收藏了。", "请教一下,这个在生产上怎么落地?", "补充一个反例。"][
          Math.floor(rand() * 4)
        ],
        createdAt: new Date(Date.parse(p.createdAt) + 3600000 * (k + 1)).toISOString(),
      });
    }
  }

  return {
    users,
    posts,
    comments,
    nextPostId: 51,
    nextCommentId: cid,
    idempotency: new Map(),
    rate: { windowStart: Date.now(), used: 0 },
  };
}

// dev 环境下 Next 会热重载模块,挂在 globalThis 上才不会每次改代码就丢状态
const g = globalThis as { __apierStore?: Store };
export const db: Store = (g.__apierStore ??= seed());

/** 恢复出厂设置 —— /api/reset 调用 */
export function resetDb() {
  const fresh = seed();
  db.users = fresh.users;
  db.posts = fresh.posts;
  db.comments = fresh.comments;
  db.nextPostId = fresh.nextPostId;
  db.nextCommentId = fresh.nextCommentId;
  db.idempotency.clear();
  db.rate = fresh.rate;
}

/* ---------- 查询helpers ---------- */

export const findUser = (id: number) => db.users.find((u) => u.id === id);
export const findPost = (id: number) => db.posts.find((p) => p.id === id);
export const commentsOfPost = (postId: number) =>
  db.comments.filter((c) => c.postId === postId);
export const postsOfUser = (authorId: number) =>
  db.posts.filter((p) => p.authorId === authorId);
