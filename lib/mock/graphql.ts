// Minimal GraphQL executor: zero dependencies, covering only the syntax the
// course teaches -- query/mutation, variables, aliases, nested selection sets,
// arguments, named and inline fragments, @include/@skip, __typename and a
// trimmed __schema introspection. Subscriptions, custom scalars and federation
// are out of scope because the course does not teach them.
//
// Every execution counts "database reads" into extensions.dbCalls. Adding
// ?dataloader=1 batches the loads, so the counter drops from 1+N to 2 and the
// N+1 lesson in chapter 10 becomes an experiment rather than an animation.
//
// The executor is pure with respect to its store: it reads and writes only the
// MockStore handed to it, which is what keeps one visitor isolated from another.

import {
  findPost,
  findUser,
  commentsOfPost,
  postsOfUser,
  type Comment,
  type MockStore,
  type Post,
  type User,
} from "./seed";

/* ================= 词法 ================= */

type Tok = { k: "punct" | "name" | "int" | "float" | "string"; v: string };

function lex(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "#") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (/[\s,]/.test(c)) {
      i++;
      continue;
    }
    if (src.startsWith("...", i)) {
      toks.push({ k: "punct", v: "..." });
      i += 3;
      continue;
    }
    if ("{}()[]:=$@!|&".includes(c)) {
      toks.push({ k: "punct", v: c });
      i++;
      continue;
    }
    if (c === '"') {
      // 三引号块字符串
      if (src.startsWith('"""', i)) {
        const end = src.indexOf('"""', i + 3);
        if (end === -1) throw new GqlError("字符串没有闭合的 \"\"\"");
        toks.push({ k: "string", v: src.slice(i + 3, end) });
        i = end + 3;
        continue;
      }
      let j = i + 1;
      let out = "";
      while (j < src.length && src[j] !== '"') {
        if (src[j] === "\\") {
          const esc: Record<string, string> = { n: "\n", t: "\t", '"': '"', "\\": "\\", "/": "/" };
          out += esc[src[j + 1]] ?? src[j + 1];
          j += 2;
        } else {
          out += src[j++];
        }
      }
      if (src[j] !== '"') throw new GqlError("字符串没有闭合的引号");
      toks.push({ k: "string", v: out });
      i = j + 1;
      continue;
    }
    const num = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(src.slice(i));
    if (num) {
      toks.push({ k: num[1] || num[2] ? "float" : "int", v: num[0] });
      i += num[0].length;
      continue;
    }
    const name = /^[_A-Za-z][_0-9A-Za-z]*/.exec(src.slice(i));
    if (name) {
      toks.push({ k: "name", v: name[0] });
      i += name[0].length;
      continue;
    }
    throw new GqlError(`无法识别的字符 "${c}"`);
  }
  return toks;
}

export class GqlError extends Error {
  path?: (string | number)[];
  constructor(msg: string, path?: (string | number)[]) {
    super(msg);
    this.path = path;
  }
}

/* ================= 语法 ================= */

type Value =
  | { t: "var"; name: string }
  | { t: "const"; v: unknown };

interface Field {
  kind: "field";
  alias: string;
  name: string;
  args: Record<string, Value>;
  directives: { name: string; args: Record<string, Value> }[];
  sel: Selection[];
}
interface Spread {
  kind: "spread";
  /** 具名片段 */
  fragment?: string;
  /** 内联片段的类型条件 */
  on?: string;
  sel: Selection[];
  directives: { name: string; args: Record<string, Value> }[];
}
type Selection = Field | Spread;

interface Operation {
  op: "query" | "mutation";
  name?: string;
  vars: { name: string; type: string; def?: unknown }[];
  sel: Selection[];
}

function parse(src: string) {
  const toks = lex(src);
  let p = 0;
  const peek = () => toks[p];
  const at = (v: string) => toks[p] && toks[p].v === v;
  const eat = (v: string) => {
    if (!at(v)) throw new GqlError(`期望 "${v}",却看到 "${toks[p]?.v ?? "结尾"}"`);
    return toks[p++];
  };
  const name = () => {
    if (!toks[p] || toks[p].k !== "name") throw new GqlError(`期望名字,却看到 "${toks[p]?.v ?? "结尾"}"`);
    return toks[p++].v;
  };

  function value(): Value {
    const t = peek();
    if (!t) throw new GqlError("参数值缺失");
    if (t.v === "$") {
      p++;
      return { t: "var", name: name() };
    }
    if (t.k === "int") {
      p++;
      return { t: "const", v: parseInt(t.v, 10) };
    }
    if (t.k === "float") {
      p++;
      return { t: "const", v: parseFloat(t.v) };
    }
    if (t.k === "string") {
      p++;
      return { t: "const", v: t.v };
    }
    if (t.v === "[") {
      p++;
      const arr: Value[] = [];
      while (!at("]")) arr.push(value());
      eat("]");
      return { t: "const", v: arr.map((a) => (a.t === "const" ? a.v : null)) };
    }
    if (t.v === "{") {
      p++;
      const obj: Record<string, unknown> = {};
      while (!at("}")) {
        const k = name();
        eat(":");
        const v = value();
        obj[k] = v.t === "const" ? v.v : null;
      }
      eat("}");
      return { t: "const", v: obj };
    }
    if (t.k === "name") {
      p++;
      if (t.v === "true") return { t: "const", v: true };
      if (t.v === "false") return { t: "const", v: false };
      if (t.v === "null") return { t: "const", v: null };
      return { t: "const", v: t.v }; // 枚举当字符串
    }
    throw new GqlError(`看不懂的值 "${t.v}"`);
  }

  function args(): Record<string, Value> {
    const out: Record<string, Value> = {};
    if (!at("(")) return out;
    eat("(");
    while (!at(")")) {
      const k = name();
      eat(":");
      out[k] = value();
    }
    eat(")");
    return out;
  }

  function directives() {
    const out: { name: string; args: Record<string, Value> }[] = [];
    while (at("@")) {
      eat("@");
      out.push({ name: name(), args: args() });
    }
    return out;
  }

  function selectionSet(): Selection[] {
    eat("{");
    const sel: Selection[] = [];
    while (!at("}")) {
      if (at("...")) {
        eat("...");
        if (at("on")) {
          eat("on");
          const on = name();
          const d = directives();
          sel.push({ kind: "spread", on, directives: d, sel: selectionSet() });
        } else {
          const frag = name();
          sel.push({ kind: "spread", fragment: frag, directives: directives(), sel: [] });
        }
        continue;
      }
      const alias = name();
      let fname = alias;
      if (at(":")) {
        eat(":");
        fname = name();
      }
      const a = args();
      const d = directives();
      const sub = at("{") ? selectionSet() : [];
      sel.push({ kind: "field", alias, name: fname, args: a, directives: d, sel: sub });
    }
    eat("}");
    return sel;
  }

  const ops: Operation[] = [];
  const frags: Record<string, { on: string; sel: Selection[] }> = {};

  while (p < toks.length) {
    if (at("query") || at("mutation")) {
      const op = name() as "query" | "mutation";
      const opName = peek() && peek().k === "name" ? name() : undefined;
      const vars: { name: string; type: string; def?: unknown }[] = [];
      if (at("(")) {
        eat("(");
        while (!at(")")) {
          eat("$");
          const vn = name();
          eat(":");
          let type = "";
          if (at("[")) {
            eat("[");
            type += "[" + name();
            if (at("!")) { eat("!"); type += "!"; }
            eat("]");
            type += "]";
          } else {
            type = name();
          }
          if (at("!")) { eat("!"); type += "!"; }
          let def: unknown;
          if (at("=")) {
            eat("=");
            const v = value();
            def = v.t === "const" ? v.v : undefined;
          }
          vars.push({ name: vn, type, def });
        }
        eat(")");
      }
      ops.push({ op, name: opName, vars, sel: selectionSet() });
    } else if (at("fragment")) {
      eat("fragment");
      const fn = name();
      eat("on");
      const on = name();
      frags[fn] = { on, sel: selectionSet() };
    } else if (at("{")) {
      ops.push({ op: "query", vars: [], sel: selectionSet() });
    } else {
      throw new GqlError(`文档顶层看不懂的记号 "${peek()?.v}"`);
    }
  }

  if (!ops.length) throw new GqlError("文档里没有可执行的操作");
  return { ops, frags };
}

/* ================= 执行 ================= */

interface Ctx {
  /** The caller's store. Nothing in this module reads ambient state. */
  store: MockStore;
  vars: Record<string, unknown>;
  frags: Record<string, { on: string; sel: Selection[] }>;
  errors: { message: string; path: (string | number)[] }[];
  /** 数据库读取计数 —— N+1 教学的核心指标 */
  dbCalls: number;
  /** 开启后 author/comments 走批量加载(DataLoader 效果) */
  dataloader: boolean;
  /** 批量缓存:同一次请求内相同 id 只查一次 */
  userCache: Map<number, User>;
}

function resolveValue(v: Value, ctx: Ctx): unknown {
  return v.t === "var" ? ctx.vars[v.name] : v.v;
}

function argMap(f: Field, ctx: Ctx): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f.args)) out[k] = resolveValue(v, ctx);
  return out;
}

/** @include(if:) / @skip(if:) —— 第 09 章 */
function skipped(d: { name: string; args: Record<string, Value> }[], ctx: Ctx): boolean {
  for (const dir of d) {
    const cond = dir.args.if ? resolveValue(dir.args.if, ctx) : undefined;
    if (dir.name === "include" && cond === false) return true;
    if (dir.name === "skip" && cond === true) return true;
  }
  return false;
}

/** 把片段摊平成字段列表 */
function flatten(sel: Selection[], typeName: string, ctx: Ctx): Field[] {
  const out: Field[] = [];
  for (const s of sel) {
    if (skipped(s.directives, ctx)) continue;
    if (s.kind === "field") {
      out.push(s);
    } else {
      if (s.fragment) {
        const f = ctx.frags[s.fragment];
        if (!f) throw new GqlError(`没有定义过的片段 "${s.fragment}"`);
        if (f.on === typeName) out.push(...flatten(f.sel, typeName, ctx));
      } else if (!s.on || s.on === typeName) {
        out.push(...flatten(s.sel, typeName, ctx));
      }
    }
  }
  return out;
}

/** 批量取用户 —— DataLoader 模式:同一批 id 只打一次「数据库」 */
function loadUsers(ids: number[], ctx: Ctx): void {
  const missing = [...new Set(ids)].filter((id) => !ctx.userCache.has(id));
  if (!missing.length) return;
  ctx.dbCalls++; // 一次批量查询
  for (const id of missing) {
    const u = findUser(ctx.store, id);
    if (u) ctx.userCache.set(id, u);
  }
}

function getUser(id: number, ctx: Ctx): User | null {
  if (ctx.dataloader) {
    // 正常情况下这里已被 prime* 预热过,直接命中缓存,不再产生查询
    if (!ctx.userCache.has(id)) loadUsers([id], ctx);
    return ctx.userCache.get(id) ?? null;
  }
  ctx.dbCalls++; // 每篇文章单独查一次 → 这就是 N+1
  return findUser(ctx.store, id) ?? null;
}

// 真正的 DataLoader 靠事件循环的同一个 tick 合并 load() 调用;这个执行器是同步的,
// 所以改用等价手法:解析一批记录之前,先看选择集里要不要 author,
// 要的话就把这批作者 id 一次性预取。效果与 DataLoader 一致 —— 1+N 次塌缩成 2 次。
function primePostAuthors(rows: Post[], sel: Selection[], ctx: Ctx) {
  if (!ctx.dataloader || !rows.length) return;
  if (flatten(sel, "Post", ctx).some((f) => f.name === "author")) {
    loadUsers(rows.map((r) => r.authorId), ctx);
  }
}

function primeCommentAuthors(rows: Comment[], sel: Selection[], ctx: Ctx) {
  if (!ctx.dataloader || !rows.length) return;
  if (flatten(sel, "Comment", ctx).some((f) => f.name === "author")) {
    loadUsers(rows.map((r) => r.authorId), ctx);
  }
}

const POST_FIELDS = new Set(["id", "title", "body", "createdAt", "status", "author", "comments", "__typename"]);
const USER_FIELDS = new Set(["id", "name", "email", "posts", "__typename"]);
const COMMENT_FIELDS = new Set(["id", "body", "createdAt", "author", "__typename"]);

function execPost(post: Post, sel: Selection[], ctx: Ctx, path: (string | number)[]) {
  const out: Record<string, unknown> = {};
  for (const f of flatten(sel, "Post", ctx)) {
    const fp = [...path, f.alias];
    if (!POST_FIELDS.has(f.name)) {
      ctx.errors.push({ message: `Post 类型上没有字段 "${f.name}"`, path: fp });
      out[f.alias] = null;
      continue;
    }
    switch (f.name) {
      case "__typename":
        out[f.alias] = "Post";
        break;
      case "author": {
        const u = getUser(post.authorId, ctx);
        if (!u) {
          // author 声明为 User!(非空),解析失败要向上冒泡 —— 第 09 章
          throw new GqlError(`文章 ${post.id} 的作者不存在,而 Post.author 是非空字段`, fp);
        }
        out[f.alias] = execUser(u, f.sel, ctx, fp);
        break;
      }
      case "comments": {
        ctx.dbCalls++;
        const rows = commentsOfPost(ctx.store, post.id);
        const limit = Number(argMap(f, ctx).first ?? rows.length);
        const shown = rows.slice(0, limit);
        primeCommentAuthors(shown, f.sel, ctx);
        out[f.alias] = shown.map((c, i) => execComment(c, f.sel, ctx, [...fp, i]));
        break;
      }
      default:
        out[f.alias] = (post as unknown as Record<string, unknown>)[f.name];
    }
  }
  return out;
}

function execUser(user: User, sel: Selection[], ctx: Ctx, path: (string | number)[]) {
  const out: Record<string, unknown> = {};
  for (const f of flatten(sel, "User", ctx)) {
    const fp = [...path, f.alias];
    if (!USER_FIELDS.has(f.name)) {
      ctx.errors.push({ message: `User 类型上没有字段 "${f.name}"`, path: fp });
      out[f.alias] = null;
      continue;
    }
    if (f.name === "__typename") out[f.alias] = "User";
    else if (f.name === "posts") {
      ctx.dbCalls++;
      const mine = postsOfUser(ctx.store, user.id);
      primePostAuthors(mine, f.sel, ctx);
      out[f.alias] = mine.map((p, i) => execPost(p, f.sel, ctx, [...fp, i]));
    } else out[f.alias] = (user as unknown as Record<string, unknown>)[f.name];
  }
  return out;
}

function execComment(c: Comment, sel: Selection[], ctx: Ctx, path: (string | number)[]) {
  const out: Record<string, unknown> = {};
  for (const f of flatten(sel, "Comment", ctx)) {
    const fp = [...path, f.alias];
    if (!COMMENT_FIELDS.has(f.name)) {
      ctx.errors.push({ message: `Comment 类型上没有字段 "${f.name}"`, path: fp });
      out[f.alias] = null;
      continue;
    }
    if (f.name === "__typename") out[f.alias] = "Comment";
    else if (f.name === "author") {
      const u = getUser(c.authorId, ctx);
      if (!u) throw new GqlError(`评论 ${c.id} 的作者不存在,而 Comment.author 是非空字段`, fp);
      out[f.alias] = execUser(u, f.sel, ctx, fp);
    } else out[f.alias] = (c as unknown as Record<string, unknown>)[f.name];
  }
  return out;
}

const SCHEMA_TYPES = [
  "Query", "Mutation", "Post", "User", "Comment", "PostStatus",
  "CreatePostInput", "ID", "String", "Int", "Boolean",
];

function execRoot(op: Operation, ctx: Ctx) {
  const data: Record<string, unknown> = {};
  const rootType = op.op === "mutation" ? "Mutation" : "Query";

  for (const f of flatten(op.sel, rootType, ctx)) {
    const path = [f.alias];
    const a = argMap(f, ctx);
    try {
      if (f.name === "__typename") {
        data[f.alias] = rootType;
      } else if (f.name === "__schema") {
        // 精简内省 —— 够第 08 章的 { __schema { types { name } } } 用
        data[f.alias] = {
          queryType: { name: "Query" },
          mutationType: { name: "Mutation" },
          types: SCHEMA_TYPES.map((name) => ({ name, kind: "OBJECT" })),
        };
      } else if (op.op === "query") {
        switch (f.name) {
          case "post": {
            ctx.dbCalls++;
            const p = findPost(ctx.store, Number(a.id));
            // Query.post 返回可空的 Post —— 找不到就是 null,不是错误
            data[f.alias] = p ? execPost(p, f.sel, ctx, path) : null;
            break;
          }
          case "posts": {
            ctx.dbCalls++;
            let rows = [...ctx.store.posts];
            if (a.status) rows = rows.filter((p) => p.status === a.status);
            const limit = Number(a.limit ?? 10);
            const shown = rows.slice(0, limit);
            primePostAuthors(shown, f.sel, ctx);
            data[f.alias] = shown.map((p, i) => execPost(p, f.sel, ctx, [...path, i]));
            break;
          }
          case "user": {
            ctx.dbCalls++;
            const u = findUser(ctx.store, Number(a.id));
            data[f.alias] = u ? execUser(u, f.sel, ctx, path) : null;
            break;
          }
          case "users": {
            ctx.dbCalls++;
            data[f.alias] = ctx.store.users.map((u, i) => execUser(u, f.sel, ctx, [...path, i]));
            break;
          }
          default:
            ctx.errors.push({ message: `Query 上没有字段 "${f.name}"`, path });
            data[f.alias] = null;
        }
      } else {
        switch (f.name) {
          case "createPost": {
            const input = (a.input ?? {}) as Record<string, unknown>;
            const title = String(input.title ?? "").trim();
            if (!title) throw new GqlError("createPost 需要非空的 title", path);
            const post: Post = {
              id: ctx.store.nextPostId++,
              title,
              body: String(input.body ?? ""),
              authorId: Number(input.authorId ?? 1),
              status: (input.status as Post["status"]) ?? "DRAFT",
              createdAt: new Date().toISOString(),
            };
            ctx.store.posts.push(post);
            ctx.dbCalls++;
            data[f.alias] = execPost(post, f.sel, ctx, path);
            break;
          }
          case "deletePost": {
            const idx = ctx.store.posts.findIndex((p) => p.id === Number(a.id));
            ctx.dbCalls++;
            if (idx !== -1) ctx.store.posts.splice(idx, 1);
            data[f.alias] = idx !== -1;
            break;
          }
          default:
            ctx.errors.push({ message: `Mutation 上没有字段 "${f.name}"`, path });
            data[f.alias] = null;
        }
      }
    } catch (e) {
      // 非空字段出错 → 该字段所在的整棵子树置 null,错误进 errors 数组。
      // data 和 errors 同时存在 —— 这就是 GraphQL 的 partial data。
      const err = e as GqlError;
      ctx.errors.push({ message: err.message, path: err.path ?? path });
      data[f.alias] = null;
    }
  }
  return data;
}

export interface GqlResult {
  data?: Record<string, unknown> | null;
  errors?: { message: string; path?: (string | number)[] }[];
  extensions?: Record<string, unknown>;
}

export function executeGraphQL(
  store: MockStore,
  query: string,
  variables: Record<string, unknown> = {},
  operationName?: string,
  opts: { dataloader?: boolean } = {},
): GqlResult {
  let parsed;
  try {
    parsed = parse(query);
  } catch (e) {
    // 语法错误:整个请求没法执行,data 为 null(这类错误 GraphQL 叫 request error)
    return { errors: [{ message: (e as Error).message }], data: null };
  }

  const op =
    (operationName ? parsed.ops.find((o) => o.name === operationName) : parsed.ops[0]) ??
    parsed.ops[0];

  // 变量:必填的没给就直接报错
  const vars: Record<string, unknown> = {};
  for (const v of op.vars) {
    const given = variables[v.name];
    if (given === undefined) {
      if (v.def !== undefined) vars[v.name] = v.def;
      else if (v.type.endsWith("!"))
        return {
          data: null,
          errors: [{ message: `变量 $${v.name} 是 ${v.type},必须提供` }],
        };
    } else {
      vars[v.name] = given;
    }
  }

  const ctx: Ctx = {
    store,
    vars,
    frags: parsed.frags,
    errors: [],
    dbCalls: 0,
    dataloader: !!opts.dataloader,
    userCache: new Map(),
  };

  const data = execRoot(op, ctx);

  const res: GqlResult = { data };
  if (ctx.errors.length) res.errors = ctx.errors;
  res.extensions = {
    dbCalls: ctx.dbCalls,
    dataloader: ctx.dataloader,
    hint: ctx.dataloader
      ? "开了 DataLoader:同一批作者合并成一次查询。"
      : "没开 DataLoader:每条记录的关联作者都单独查了一次 —— 这就是 N+1。加 ?dataloader=1 再跑一次对比。",
  };
  return res;
}
