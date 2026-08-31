// POST /api/graphql —— 和 REST 端点共用同一套博客数据。
// 「同一份数据,两种风格」是全书主线,终章的对比因此可以亲手做,而不只是看表格。
//
// 教学开关:
//   ?dataloader=1  开启批量加载,对比 extensions.dbCalls 的变化(第 10 章 N+1)
//   GET 也放行     配合 persisted-query 的讨论(第 10 章),真实 GraphQL 也支持

import { executeGraphQL } from "@/lib/mock/graphql";
import { delay, json, preflight, problem, rateLimit, tooManyRequests } from "@/lib/mock/http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

async function run(query: string, variables: Record<string, unknown>, operationName: string | undefined, url: URL, ms: number) {
  const dataloader = url.searchParams.get("dataloader") === "1";
  const result = executeGraphQL(query, variables, operationName, { dataloader });

  // GraphQL 传统上恒返回 200,错误放在 body 的 errors 数组里 ——
  // 所以 res.ok 判断不了 GraphQL 的成败,必须查 body.errors(第 09 章的坑)。
  return json(result, {
    headers: {
      "X-Resolver-Calls": String((result.extensions?.dbCalls as number) ?? 0),
      "X-Mock-Latency": `${ms}ms`,
      "X-Teaching-Note": "GraphQL returns 200 even on field errors - check body.errors, not res.ok.",
    },
  });
}

export async function POST(req: Request) {
  const rl = rateLimit();
  if (!rl.ok) return tooManyRequests(rl.headers);
  const url = new URL(req.url);
  const ms = await delay(req, 40);

  let payload: { query?: string; variables?: Record<string, unknown>; operationName?: string };
  try {
    payload = await req.json();
  } catch {
    return problem({
      status: 400,
      title: "Malformed JSON",
      detail: 'GraphQL 请求体应该是 {"query":"...","variables":{}} 这样的 JSON。',
    });
  }

  if (!payload.query || typeof payload.query !== "string") {
    return problem({
      status: 400,
      title: "Missing query",
      detail: "请求体里必须有 query 字段 —— GraphQL 的一切都从这段查询文本开始。",
    });
  }

  return run(payload.query, payload.variables ?? {}, payload.operationName, url, ms);
}

/** GET 形式:?query={posts{title}} —— 方便直接贴到地址栏试,也呼应 persisted queries */
export async function GET(req: Request) {
  const rl = rateLimit();
  if (!rl.ok) return tooManyRequests(rl.headers);
  const url = new URL(req.url);
  const query = url.searchParams.get("query");
  if (!query) {
    return json({
      message: "APIer 本地 GraphQL 端点",
      usage: {
        post: 'POST /api/graphql  body: {"query":"{ posts(limit:3){ title } }"}',
        get: "GET /api/graphql?query={posts(limit:3){title}}",
        dataloader: "任一形式加 ?dataloader=1 可对比 N+1 的消除效果",
      },
      schema: `type Query {
  post(id: ID!): Post
  posts(limit: Int = 10, status: PostStatus): [Post!]!
  user(id: ID!): User
  users: [User!]!
}
type Mutation {
  createPost(input: CreatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}
type Post { id: ID!  title: String!  body: String!  createdAt: String!
            status: PostStatus!  author: User!  comments(first: Int): [Comment!]! }
type User { id: ID!  name: String!  email: String!  posts: [Post!]! }
type Comment { id: ID!  body: String!  createdAt: String!  author: User! }
enum PostStatus { DRAFT PUBLISHED ARCHIVED }`,
    });
  }
  const ms = await delay(req, 40);
  const rawVars = url.searchParams.get("variables");
  let variables: Record<string, unknown> = {};
  if (rawVars) {
    try {
      variables = JSON.parse(rawVars);
    } catch {
      return problem({ status: 400, title: "Bad variables", detail: "variables 不是合法 JSON。" });
    }
  }
  return run(query, variables, url.searchParams.get("operationName") ?? undefined, url, ms);
}
