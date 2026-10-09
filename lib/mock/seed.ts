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
  /** Fingerprint of the request body, so a reused key with a different payload is refused. */
  fingerprint: string;
  location?: string;
}

/**
 * Shape and content version of the seed. A Service Worker that finds a stored
 * store with a different version re-seeds it, so a deploy that changes the
 * seed (or repairs a store an older engine could corrupt) reaches every visitor.
 */
export const SEED_VERSION = 2;

export interface MockStore {
  /** SEED_VERSION the store was created with; absent on stores from before versioning. */
  version: number;
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

// Stored data is not translated: every visitor sees the same records whatever
// the interface language, exactly as the chapters' JSON examples are identical
// in both languages. The text is therefore English, the language of the wire
// examples throughout the course. Ids, authors and statuses depend only on the
// sequence of rand() calls, so rewording these strings (keeping each list's
// length) never moves them.
const TOPICS = [
  "Why REST is not a protocol",
  "Three common mistakes in a first API call",
  "Status codes are not chosen at random",
  "What really separates PUT from PATCH",
  "Pagination: offset or cursor",
  "Putting ETag to work",
  "How an idempotency key prevented a double charge",
  "What problem GraphQL actually solves",
  "How the N+1 problem arises",
  "Getting used to a single endpoint",
  "Keep passwords out of a JWT",
  "A CORS error is not a broken API",
  "Is OpenAPI worth writing?",
  "A rate limit should send Retry-After",
  "Error responses deserve care too",
  "Caching, the quiet advantage of REST",
  "A schema is a contract",
  "The two mechanisms behind DataLoader",
  "Keep verbs out of URLs",
  "Put the version anywhere, but be consistent",
];

const BODY_SEEDS = [
  "To explain this properly we have to go back to the first question: what agreement lets a client and a server talk to each other.",
  "This looked like a minor detail until it caused a real outage; that is when the reason for the convention became clear.",
  "The conclusion first: there is no silver bullet, only trade-offs. The rest of this post works out the cost of each approach.",
  "The same mistake happened twice, for the same reason both times, so it is written down here.",
  "First the symptom, then the mechanism, and finally a piece of code you can run as it is.",
];

const COMMENT_SEEDS = [
  "Agreed.",
  "Clearly explained; saved for later.",
  "How would you apply this in production?",
  "Here is a counterexample.",
];

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
      title: i <= TOPICS.length ? TOPICS[i - 1] : `${topic} · follow-up ${i}`,
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
    version: SEED_VERSION,
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
