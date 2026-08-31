// Deterministic seed data for the mock API.
//
// This module is intentionally pure and environment-agnostic: it never touches
// globalThis, the filesystem, or any runtime API. The same seed therefore
// produces byte-identical data in a Service Worker, in Node, and in tests,
// which is what makes "reset" a genuinely deterministic operation.
//
// The store must stay structured-cloneable so it can be persisted to IndexedDB
// as a single record (hence plain objects rather than Map/Set).

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

/** A replayed response, kept so a repeated Idempotency-Key returns the first result. */
export interface IdempotentRecord {
  status: number;
  body: unknown;
}

export interface MockStore {
  users: User[];
  posts: Post[];
  comments: Comment[];
  nextPostId: number;
  nextCommentId: number;
  /** Idempotency-Key -> first response (chapter 05). */
  idempotency: Record<string, IdempotentRecord>;
  /** Fixed-window rate limiter state (chapter 05). */
  rate: { windowStart: number; used: number };
}

/** Deterministic PRNG (mulberry32) so the dataset never drifts between runs. */
function rng(seedValue: number) {
  let state = seedValue;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
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

// Post titles double as course cross-references, so they stay bilingual-neutral
// (they are data, not UI copy, and are identical in both languages).
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

const COMMENT_SEEDS = ["同意。", "这段讲得好,收藏了。", "请教一下,这个在生产上怎么落地?", "补充一个反例。"];

/**
 * Build a fresh store from the fixed seed.
 *
 * `rate.windowStart` is the only value that depends on the clock; it is passed
 * in so tests can pin it and so a reset starts the visitor's rate window now.
 */
export function createSeedStore(now: number = Date.now()): MockStore {
  const rand = rng(42);

  const users: User[] = NAMES.map(([name, handle], i) => ({
    id: i + 1,
    name,
    email: `${handle}@apier.dev`,
  }));

  const statuses: PostStatus[] = ["PUBLISHED", "PUBLISHED", "PUBLISHED", "DRAFT", "ARCHIVED"];
  const posts: Post[] = [];
  // 50 posts so ids referenced by the course (for example /posts/42) exist.
  for (let i = 1; i <= 50; i++) {
    const topic = TOPICS[Math.floor(rand() * TOPICS.length)];
    posts.push({
      id: i,
      title: i <= TOPICS.length ? TOPICS[i - 1] : `${topic} · 续篇 ${i}`,
      body: BODY_SEEDS[Math.floor(rand() * BODY_SEEDS.length)],
      authorId: 1 + Math.floor(rand() * users.length),
      status: statuses[Math.floor(rand() * statuses.length)],
      // Fixed epoch so timestamps never drift between runs.
      createdAt: new Date(Date.UTC(2026, 0, 1) + i * 86400000).toISOString(),
    });
  }

  const comments: Comment[] = [];
  let commentId = 1;
  for (const post of posts) {
    const count = Math.floor(rand() * 4); // 0-3 comments
    for (let k = 0; k < count; k++) {
      comments.push({
        id: commentId++,
        postId: post.id,
        authorId: 1 + Math.floor(rand() * users.length),
        body: COMMENT_SEEDS[Math.floor(rand() * COMMENT_SEEDS.length)],
        createdAt: new Date(Date.parse(post.createdAt) + 3600000 * (k + 1)).toISOString(),
      });
    }
  }

  return {
    users,
    posts,
    comments,
    nextPostId: 51,
    nextCommentId: commentId,
    idempotency: {},
    rate: { windowStart: now, used: 0 },
  };
}

/* ---------- store-scoped lookups ---------- */

export const findUser = (store: MockStore, id: number) => store.users.find((u) => u.id === id);
export const findPost = (store: MockStore, id: number) => store.posts.find((p) => p.id === id);
export const commentsOfPost = (store: MockStore, postId: number) =>
  store.comments.filter((c) => c.postId === postId);
export const postsOfUser = (store: MockStore, authorId: number) =>
  store.posts.filter((p) => p.authorId === authorId);
