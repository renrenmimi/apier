// Minimal GraphQL executor: zero dependencies, covering the syntax the course
// teaches -- query/mutation, variables, aliases, nested selection sets,
// arguments, named and inline fragments, @include/@skip, __typename and
// introspection (__schema, __type). Subscriptions, custom scalars and
// federation are out of scope; a subscription is refused with an explanation.
//
// It follows the order the specification prescribes: parse, validate the whole
// document against the schema, coerce the variables, and only then execute.
// A document that fails any of the first three steps is a request error: the
// response carries `errors` and no `data` entry at all. Errors raised while
// executing are field errors: the position becomes null, and when that
// position is non-null the null propagates to the nearest nullable parent, up
// to `data` itself (chapter 09).
//
// Every execution counts "database reads" into extensions.dbCalls. Adding
// ?dataloader=1 batches the author loads, so the counter drops from 1+N to 2
// and the N+1 lesson in chapter 10 becomes an experiment rather than an animation.
//
// The executor is pure with respect to its store: it reads and writes only the
// MockStore handed to it, which is what keeps one visitor isolated from another.

import {
  commentsOfPost,
  findPost,
  findUser,
  postsOfUser,
  type Comment,
  type MockStore,
  type Post,
  type PostStatus,
  type User,
} from "./seed";
import { DEMO_TOKEN, tr, type Auth, type Lang } from "./http";

/** 请求错误:文档本身有问题(词法、语法、校验、变量),整个请求不执行,响应里没有 data。 */
class GqlRequestError extends Error {}

/** 字段错误:执行期出错,该位置置 null,错误连同 path 进 errors。 */
class FieldError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

/** 非空位置得到了 null:错误已经记录过,只负责把 null 继续往上传。 */
class NullPropagation extends Error {}
const PROPAGATE = new NullPropagation();

/* ================= 词法 ================= */

type Tok = { k: "punct" | "name" | "int" | "float" | "string"; v: string };

const NUMBER = /-?\d+(\.\d+)?([eE][+-]?\d+)?/y;
const NAME = /[_A-Za-z][_0-9A-Za-z]*/y;

function lex(src: string, lang: Lang): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "#") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (/[\s,﻿]/.test(c)) {
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
        if (end === -1) {
          throw new GqlRequestError(
            tr(lang, 'Syntax error: unterminated block string (missing the closing """).', '语法错误:块字符串没有闭合的 """。'),
          );
        }
        toks.push({ k: "string", v: src.slice(i + 3, end) });
        i = end + 3;
        continue;
      }
      let j = i + 1;
      let out = "";
      while (j < src.length && src[j] !== '"' && src[j] !== "\n") {
        if (src[j] === "\\") {
          if (src[j + 1] === "u") {
            out += String.fromCharCode(parseInt(src.slice(j + 2, j + 6), 16));
            j += 6;
            continue;
          }
          const esc: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", '"': '"', "\\": "\\", "/": "/" };
          out += esc[src[j + 1]] ?? src[j + 1];
          j += 2;
        } else {
          out += src[j++];
        }
      }
      if (src[j] !== '"') {
        throw new GqlRequestError(tr(lang, "Syntax error: unterminated string.", "语法错误:字符串没有闭合的引号。"));
      }
      toks.push({ k: "string", v: out });
      i = j + 1;
      continue;
    }
    NUMBER.lastIndex = i;
    const num = NUMBER.exec(src);
    if (num) {
      toks.push({ k: num[1] || num[2] ? "float" : "int", v: num[0] });
      i += num[0].length;
      continue;
    }
    NAME.lastIndex = i;
    const name = NAME.exec(src);
    if (name) {
      toks.push({ k: "name", v: name[0] });
      i += name[0].length;
      continue;
    }
    throw new GqlRequestError(tr(lang, `Syntax error: unexpected character "${c}".`, `语法错误:无法识别的字符 "${c}"。`));
  }
  return toks;
}

/* ================= 语法 ================= */

type Value =
  | { t: "var"; name: string }
  | { t: "int" | "float"; v: number }
  | { t: "string"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "null" }
  | { t: "enum"; v: string }
  | { t: "list"; items: Value[] }
  | { t: "object"; fields: { name: string; value: Value }[] };

interface Arg {
  name: string;
  value: Value;
}
interface Directive {
  name: string;
  args: Arg[];
}
interface FieldNode {
  kind: "field";
  /** 响应里的键:有别名用别名,否则就是字段名 */
  alias: string;
  name: string;
  args: Arg[];
  directives: Directive[];
  /** null 表示没写选择集 */
  sel: Selection[] | null;
}
interface SpreadNode {
  kind: "spread";
  name: string;
  directives: Directive[];
}
interface InlineNode {
  kind: "inline";
  on: string | null;
  directives: Directive[];
  sel: Selection[];
}
type Selection = FieldNode | SpreadNode | InlineNode;

type TypeRef = { kind: "NAMED"; name: string } | { kind: "LIST"; of: TypeRef } | { kind: "NON_NULL"; of: TypeRef };

interface VarDef {
  name: string;
  type: TypeRef;
  def: Value | null;
}
interface OperationNode {
  op: "query" | "mutation" | "subscription";
  name: string | null;
  vars: VarDef[];
  directives: Directive[];
  sel: Selection[];
}
interface FragmentNode {
  name: string;
  on: string;
  directives: Directive[];
  sel: Selection[];
}
interface Doc {
  ops: OperationNode[];
  frags: FragmentNode[];
}

function parse(src: string, lang: Lang): Doc {
  const toks = lex(src, lang);
  let p = 0;

  const found = () => (toks[p] ? `"${toks[p].v}"` : tr(lang, "the end of the document", "文档结尾"));
  const fail = (en: string, zh: string): never => {
    throw new GqlRequestError(tr(lang, `Syntax error: ${en}, found ${found()}.`, `语法错误:${zh},实际是 ${found()}。`));
  };
  // 字符串字面量 "{" 不是标点,所以比较时要连同记号类型一起看
  const isPunct = (v: string) => toks[p] !== undefined && toks[p].k === "punct" && toks[p].v === v;
  const isKeyword = (v: string) => toks[p] !== undefined && toks[p].k === "name" && toks[p].v === v;
  const expect = (v: string) => {
    if (!isPunct(v)) fail(`expected "${v}"`, `期望 "${v}"`);
    p++;
  };
  const name = (): string => {
    const t = toks[p];
    if (!t || t.k !== "name") return fail("expected a name", "期望一个名字");
    p++;
    return t.v;
  };

  function value(constant: boolean): Value {
    const t = toks[p];
    if (!t) return fail("expected a value", "期望一个值");
    if (isPunct("$")) {
      if (constant) fail("expected a constant value (a default value cannot use a variable)", "期望一个常量值(默认值里不能用变量)");
      p++;
      return { t: "var", name: name() };
    }
    if (t.k === "int") {
      p++;
      return { t: "int", v: parseInt(t.v, 10) };
    }
    if (t.k === "float") {
      p++;
      return { t: "float", v: parseFloat(t.v) };
    }
    if (t.k === "string") {
      p++;
      return { t: "string", v: t.v };
    }
    if (isPunct("[")) {
      p++;
      const items: Value[] = [];
      while (!isPunct("]")) items.push(value(constant));
      p++;
      return { t: "list", items };
    }
    if (isPunct("{")) {
      p++;
      const fields: { name: string; value: Value }[] = [];
      while (!isPunct("}")) {
        const k = name();
        expect(":");
        fields.push({ name: k, value: value(constant) });
      }
      p++;
      return { t: "object", fields };
    }
    if (t.k === "name") {
      p++;
      if (t.v === "true") return { t: "bool", v: true };
      if (t.v === "false") return { t: "bool", v: false };
      if (t.v === "null") return { t: "null" };
      return { t: "enum", v: t.v };
    }
    return fail("expected a value", "期望一个值");
  }

  function args(): Arg[] {
    if (!isPunct("(")) return [];
    p++;
    const out: Arg[] = [];
    do {
      const n = name();
      expect(":");
      out.push({ name: n, value: value(false) });
    } while (!isPunct(")"));
    p++;
    return out;
  }

  function directives(): Directive[] {
    const out: Directive[] = [];
    while (isPunct("@")) {
      p++;
      out.push({ name: name(), args: args() });
    }
    return out;
  }

  function selectionSet(): Selection[] {
    expect("{");
    const sel: Selection[] = [];
    do {
      if (isPunct("...")) {
        p++;
        if (isKeyword("on")) {
          p++;
          const on = name();
          const d = directives();
          sel.push({ kind: "inline", on, directives: d, sel: selectionSet() });
        } else if (isPunct("{") || isPunct("@")) {
          const d = directives();
          sel.push({ kind: "inline", on: null, directives: d, sel: selectionSet() });
        } else {
          const n = name();
          sel.push({ kind: "spread", name: n, directives: directives() });
        }
        continue;
      }
      const alias = name();
      let fname = alias;
      if (isPunct(":")) {
        p++;
        fname = name();
      }
      const a = args();
      const d = directives();
      const sub = isPunct("{") ? selectionSet() : null;
      sel.push({ kind: "field", alias, name: fname, args: a, directives: d, sel: sub });
    } while (!isPunct("}"));
    p++;
    return sel;
  }

  function typeRef(): TypeRef {
    let t: TypeRef;
    if (isPunct("[")) {
      p++;
      const inner = typeRef();
      expect("]");
      t = { kind: "LIST", of: inner };
    } else {
      t = { kind: "NAMED", name: name() };
    }
    if (isPunct("!")) {
      p++;
      t = { kind: "NON_NULL", of: t };
    }
    return t;
  }

  const ops: OperationNode[] = [];
  const frags: FragmentNode[] = [];

  while (p < toks.length) {
    if (isPunct("{")) {
      ops.push({ op: "query", name: null, vars: [], directives: [], sel: selectionSet() });
    } else if (isKeyword("query") || isKeyword("mutation") || isKeyword("subscription")) {
      const op = toks[p++].v as OperationNode["op"];
      const opName = toks[p]?.k === "name" ? name() : null;
      const vars: VarDef[] = [];
      if (isPunct("(")) {
        p++;
        do {
          expect("$");
          const vn = name();
          expect(":");
          const type = typeRef();
          let def: Value | null = null;
          if (isPunct("=")) {
            p++;
            def = value(true);
          }
          directives();
          vars.push({ name: vn, type, def });
        } while (!isPunct(")"));
        p++;
      }
      const d = directives();
      ops.push({ op, name: opName, vars, directives: d, sel: selectionSet() });
    } else if (isKeyword("fragment")) {
      p++;
      const fn = name();
      if (!isKeyword("on")) fail('expected "on"', '期望 "on"');
      p++;
      const on = name();
      const d = directives();
      frags.push({ name: fn, on, directives: d, sel: selectionSet() });
    } else {
      fail("expected an operation or a fragment", "期望一个操作或片段");
    }
  }

  if (!ops.length) {
    throw new GqlRequestError(tr(lang, "The document contains no operation to execute.", "文档里没有可执行的操作。"));
  }
  return { ops, frags };
}

/* ================= schema ================= */

interface InputValueDef {
  name: string;
  type: string;
  defaultValue?: unknown;
  description?: string;
}
interface FieldDef {
  name: string;
  type: string;
  args?: InputValueDef[];
  description?: string;
}
interface TypeDef {
  kind: "OBJECT" | "SCALAR" | "ENUM" | "INPUT_OBJECT";
  name: string;
  description?: string;
  fields?: FieldDef[];
  inputFields?: InputValueDef[];
  enumValues?: string[];
}

const fd = (name: string, type: string, extra: Partial<FieldDef> = {}): FieldDef => ({ name, type, ...extra });
const iv = (name: string, type: string, defaultValue?: unknown): InputValueDef =>
  defaultValue === undefined ? { name, type } : { name, type, defaultValue };
const INCLUDE_DEPRECATED = [iv("includeDeprecated", "Boolean", false)];

// 课程全书共用的博客世界;内省类型照规范 §4.5 定义。没有被引用的内置标量(Float)按规范不列出。
const SCHEMA: TypeDef[] = [
  {
    kind: "OBJECT",
    name: "Query",
    description: "Entry points for reading.",
    fields: [
      fd("post", "Post", { args: [iv("id", "ID!")], description: "One post, or null when no post has this id." }),
      fd("posts", "[Post!]!", {
        args: [iv("limit", "Int", 10), iv("status", "PostStatus")],
        description: "Posts in id order, at most `limit` (0 to 100) of them.",
      }),
      fd("user", "User", { args: [iv("id", "ID!")], description: "One user, or null when no user has this id." }),
      fd("users", "[User!]!"),
    ],
  },
  {
    kind: "OBJECT",
    name: "Mutation",
    description: `Entry points for writing. Every mutation needs Authorization: Bearer ${DEMO_TOKEN}, as REST writes do.`,
    fields: [
      fd("createPost", "Post!", { args: [iv("input", "CreatePostInput!")] }),
      fd("deletePost", "Boolean!", {
        args: [iv("id", "ID!")],
        description: "Deletes a post and its comments. False when no post has this id.",
      }),
    ],
  },
  {
    kind: "OBJECT",
    name: "Post",
    description: "A blog post.",
    fields: [
      fd("id", "ID!"),
      fd("title", "String!"),
      fd("body", "String!"),
      fd("createdAt", "String!"),
      fd("status", "PostStatus!"),
      fd("author", "User!"),
      fd("comments", "[Comment!]!", { args: [iv("first", "Int")] }),
    ],
  },
  {
    kind: "OBJECT",
    name: "User",
    description: "A person who writes posts and comments.",
    fields: [fd("id", "ID!"), fd("name", "String!"), fd("email", "String!"), fd("posts", "[Post!]!")],
  },
  {
    kind: "OBJECT",
    name: "Comment",
    description: "A comment on a post.",
    fields: [fd("id", "ID!"), fd("body", "String!"), fd("createdAt", "String!"), fd("author", "User!")],
  },
  { kind: "ENUM", name: "PostStatus", enumValues: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
  {
    kind: "INPUT_OBJECT",
    name: "CreatePostInput",
    inputFields: [iv("title", "String!"), iv("body", "String!"), iv("status", "PostStatus", "DRAFT"), iv("authorId", "ID")],
  },
  { kind: "SCALAR", name: "ID" },
  { kind: "SCALAR", name: "String" },
  { kind: "SCALAR", name: "Int" },
  { kind: "SCALAR", name: "Boolean" },
  {
    kind: "OBJECT",
    name: "__Schema",
    fields: [
      fd("description", "String"),
      fd("types", "[__Type!]!"),
      fd("queryType", "__Type!"),
      fd("mutationType", "__Type"),
      fd("subscriptionType", "__Type"),
      fd("directives", "[__Directive!]!"),
    ],
  },
  {
    kind: "OBJECT",
    name: "__Type",
    fields: [
      fd("kind", "__TypeKind!"),
      fd("name", "String"),
      fd("description", "String"),
      fd("specifiedByURL", "String"),
      fd("fields", "[__Field!]", { args: INCLUDE_DEPRECATED }),
      fd("interfaces", "[__Type!]"),
      fd("possibleTypes", "[__Type!]"),
      fd("enumValues", "[__EnumValue!]", { args: INCLUDE_DEPRECATED }),
      fd("inputFields", "[__InputValue!]", { args: INCLUDE_DEPRECATED }),
      fd("ofType", "__Type"),
      fd("isOneOf", "Boolean"),
    ],
  },
  {
    kind: "OBJECT",
    name: "__Field",
    fields: [
      fd("name", "String!"),
      fd("description", "String"),
      fd("args", "[__InputValue!]!", { args: INCLUDE_DEPRECATED }),
      fd("type", "__Type!"),
      fd("isDeprecated", "Boolean!"),
      fd("deprecationReason", "String"),
    ],
  },
  {
    kind: "OBJECT",
    name: "__InputValue",
    fields: [
      fd("name", "String!"),
      fd("description", "String"),
      fd("type", "__Type!"),
      fd("defaultValue", "String"),
      fd("isDeprecated", "Boolean!"),
      fd("deprecationReason", "String"),
    ],
  },
  {
    kind: "OBJECT",
    name: "__EnumValue",
    fields: [fd("name", "String!"), fd("description", "String"), fd("isDeprecated", "Boolean!"), fd("deprecationReason", "String")],
  },
  {
    kind: "OBJECT",
    name: "__Directive",
    fields: [
      fd("name", "String!"),
      fd("description", "String"),
      fd("isRepeatable", "Boolean!"),
      fd("locations", "[__DirectiveLocation!]!"),
      fd("args", "[__InputValue!]!", { args: INCLUDE_DEPRECATED }),
    ],
  },
  {
    kind: "ENUM",
    name: "__TypeKind",
    enumValues: ["SCALAR", "OBJECT", "INTERFACE", "UNION", "ENUM", "INPUT_OBJECT", "LIST", "NON_NULL"],
  },
  {
    kind: "ENUM",
    name: "__DirectiveLocation",
    enumValues: [
      "QUERY",
      "MUTATION",
      "SUBSCRIPTION",
      "FIELD",
      "FRAGMENT_DEFINITION",
      "FRAGMENT_SPREAD",
      "INLINE_FRAGMENT",
      "VARIABLE_DEFINITION",
      "SCHEMA",
      "SCALAR",
      "OBJECT",
      "FIELD_DEFINITION",
      "ARGUMENT_DEFINITION",
      "INTERFACE",
      "UNION",
      "ENUM",
      "ENUM_VALUE",
      "INPUT_OBJECT",
      "INPUT_FIELD_DEFINITION",
    ],
  },
];

const TYPES = new Map(SCHEMA.map((t) => [t.name, t]));

/** 只挂在根查询类型上的内省入口(规范 §4.2)。 */
const META_FIELDS: FieldDef[] = [fd("__schema", "__Schema!"), fd("__type", "__Type", { args: [iv("name", "String!")] })];
const TYPENAME = fd("__typename", "String!");

const DIRECTIVES = [
  {
    name: "include",
    description: "Includes this field or fragment only when the `if` argument is true.",
    args: [iv("if", "Boolean!")],
  },
  {
    name: "skip",
    description: "Skips this field or fragment when the `if` argument is true.",
    args: [iv("if", "Boolean!")],
  },
];
const DIRECTIVE_LOCATIONS = ["FIELD", "FRAGMENT_SPREAD", "INLINE_FRAGMENT"];

function fieldDef(typeName: string, name: string): FieldDef | undefined {
  if (name === "__typename") return TYPES.get(typeName)?.kind === "OBJECT" ? TYPENAME : undefined;
  if (typeName === "Query") {
    const meta = META_FIELDS.find((m) => m.name === name);
    if (meta) return meta;
  }
  return TYPES.get(typeName)?.fields?.find((x) => x.name === name);
}

const refCache = new Map<string, TypeRef>();
/** 把 "[Post!]!" 这样的类型写法解析成 TypeRef。 */
function ref(text: string): TypeRef {
  const hit = refCache.get(text);
  if (hit) return hit;
  const t: TypeRef = text.endsWith("!")
    ? { kind: "NON_NULL", of: ref(text.slice(0, -1)) }
    : text.startsWith("[")
      ? { kind: "LIST", of: ref(text.slice(1, -1)) }
      : { kind: "NAMED", name: text };
  refCache.set(text, t);
  return t;
}
const printType = (t: TypeRef): string =>
  t.kind === "NAMED" ? t.name : t.kind === "LIST" ? `[${printType(t.of)}]` : `${printType(t.of)}!`;
const namedOf = (t: TypeRef): string => (t.kind === "NAMED" ? t.name : namedOf(t.of));

/** 默认值的 GraphQL 字面量写法:枚举不加引号,字符串加。 */
function printLiteral(value: unknown, type: TypeRef): string {
  if (typeof value === "string") return TYPES.get(namedOf(type))?.kind === "ENUM" ? value : JSON.stringify(value);
  return String(value);
}

function printValue(v: Value): string {
  switch (v.t) {
    case "var":
      return `$${v.name}`;
    case "string":
      return JSON.stringify(v.v);
    case "null":
      return "null";
    case "list":
      return `[${v.items.map(printValue).join(", ")}]`;
    case "object":
      return `{${v.fields.map((f) => `${f.name}: ${printValue(f.value)}`).join(", ")}}`;
    default:
      return String(v.v);
  }
}

const show = (v: unknown) => {
  const s = JSON.stringify(v) ?? String(v);
  return s.length > 60 ? `${s.slice(0, 57)}...` : s;
};

/** SDL of the course schema, for the self-documenting GET /graphql. */
export function printSchema(): string {
  const sdlInput = (a: InputValueDef) =>
    `${a.name}: ${a.type}${a.defaultValue === undefined ? "" : ` = ${printLiteral(a.defaultValue, ref(a.type))}`}`;
  return SCHEMA.filter((t) => !t.name.startsWith("__") && t.kind !== "SCALAR")
    .map((t) => {
      if (t.kind === "ENUM") return `enum ${t.name} {\n${t.enumValues!.map((v) => `  ${v}`).join("\n")}\n}`;
      if (t.kind === "INPUT_OBJECT") return `input ${t.name} {\n${t.inputFields!.map((a) => `  ${sdlInput(a)}`).join("\n")}\n}`;
      const lines = t.fields!.map(
        (f) => `  ${f.name}${f.args?.length ? `(${f.args.map(sdlInput).join(", ")})` : ""}: ${f.type}`,
      );
      return `type ${t.name} {\n${lines.join("\n")}\n}`;
    })
    .join("\n\n");
}

/* ================= 内省数据 ================= */

interface IntroType {
  kind: string;
  name: string | null;
  description: string | null;
  specifiedByURL: null;
  fields: unknown[] | null;
  interfaces: IntroType[] | null;
  possibleTypes: null;
  enumValues: unknown[] | null;
  inputFields: unknown[] | null;
  ofType: IntroType | null;
  isOneOf: boolean | null;
}

// 由 SCHEMA 派生的只读数据,执行器按选择集从里面取字段 —— 与访客状态无关。
const INTROSPECTION = (() => {
  const types = new Map<string, IntroType>();
  for (const t of SCHEMA) {
    types.set(t.name, {
      kind: t.kind,
      name: t.name,
      description: t.description ?? null,
      specifiedByURL: null,
      fields: null,
      interfaces: t.kind === "OBJECT" ? [] : null,
      possibleTypes: null,
      enumValues: null,
      inputFields: null,
      ofType: null,
      isOneOf: t.kind === "INPUT_OBJECT" ? false : null,
    });
  }
  const wrap = (r: TypeRef): IntroType =>
    r.kind === "NAMED"
      ? types.get(r.name)!
      : {
          kind: r.kind,
          name: null,
          description: null,
          specifiedByURL: null,
          fields: null,
          interfaces: null,
          possibleTypes: null,
          enumValues: null,
          inputFields: null,
          ofType: wrap(r.of),
          isOneOf: null,
        };
  const inputValue = (a: InputValueDef) => ({
    name: a.name,
    description: a.description ?? null,
    type: wrap(ref(a.type)),
    defaultValue: a.defaultValue === undefined ? null : printLiteral(a.defaultValue, ref(a.type)),
    isDeprecated: false,
    deprecationReason: null,
  });
  for (const t of SCHEMA) {
    const it = types.get(t.name)!;
    if (t.fields) {
      it.fields = t.fields.map((f) => ({
        name: f.name,
        description: f.description ?? null,
        args: (f.args ?? []).map(inputValue),
        type: wrap(ref(f.type)),
        isDeprecated: false,
        deprecationReason: null,
      }));
    }
    if (t.inputFields) it.inputFields = t.inputFields.map(inputValue);
    if (t.enumValues) {
      it.enumValues = t.enumValues.map((v) => ({ name: v, description: null, isDeprecated: false, deprecationReason: null }));
    }
  }
  const schema = {
    description: null,
    types: [...types.values()],
    queryType: types.get("Query"),
    mutationType: types.get("Mutation"),
    subscriptionType: null,
    directives: DIRECTIVES.map((d) => ({
      name: d.name,
      description: d.description,
      isRepeatable: false,
      locations: DIRECTIVE_LOCATIONS,
      args: d.args.map(inputValue),
    })),
  };
  return { schema, types };
})();

/* ================= 输入值强制转换 ================= */

type Coerced = { ok: true; value: unknown } | { ok: false; why: [en: string, zh: string] };
const ok = (value: unknown): Coerced => ({ ok: true, value });
const bad = (en: string, zh: string): Coerced => ({ ok: false, why: [en, zh] });
const expected = (type: string) => bad(`Expected a value of type "${type}".`, `期望 "${type}" 类型的值。`);
const nonNull = () => bad("Expected a non-null value, found null.", "期望非空值,实际是 null。");
const INT_MAX = 2147483647;

/** JSON 里来的值(变量)按类型转换,规则见规范 §3.5、§3.9。 */
function coerceJson(v: unknown, t: TypeRef): Coerced {
  if (t.kind === "NON_NULL") return v === null || v === undefined ? nonNull() : coerceJson(v, t.of);
  if (v === null || v === undefined) return ok(null);
  if (t.kind === "LIST") {
    const out: unknown[] = [];
    for (const item of Array.isArray(v) ? v : [v]) {
      const r = coerceJson(item, t.of);
      if (!r.ok) return r;
      out.push(r.value);
    }
    return ok(out);
  }
  const type = TYPES.get(t.name);
  if (!type) return expected(t.name);
  if (type.kind === "SCALAR") {
    switch (type.name) {
      case "Int":
        return typeof v === "number" && Number.isInteger(v) && Math.abs(v) <= INT_MAX ? ok(v) : expected("Int");
      case "String":
        return typeof v === "string" ? ok(v) : expected("String");
      case "Boolean":
        return typeof v === "boolean" ? ok(v) : expected("Boolean");
      default:
        return typeof v === "string" || (typeof v === "number" && Number.isInteger(v)) ? ok(String(v)) : expected("ID");
    }
  }
  if (type.kind === "ENUM") {
    return typeof v === "string" && type.enumValues!.includes(v)
      ? ok(v)
      : bad(`Value ${show(v)} does not exist in "${type.name}" enum.`, `枚举 "${type.name}" 里没有值 ${show(v)}。`);
  }
  if (type.kind === "INPUT_OBJECT") {
    if (typeof v !== "object" || Array.isArray(v)) {
      return bad(`Expected an object of type "${type.name}".`, `期望 "${type.name}" 类型的对象。`);
    }
    const obj = v as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (!type.inputFields!.some((x) => x.name === key)) {
        return bad(`Field "${key}" is not defined by type "${type.name}".`, `"${type.name}" 类型没有字段 "${key}"。`);
      }
    }
    const out: Record<string, unknown> = {};
    for (const field of type.inputFields!) {
      const ft = ref(field.type);
      if (!(field.name in obj) || obj[field.name] === undefined) {
        if (field.defaultValue !== undefined) out[field.name] = field.defaultValue;
        else if (ft.kind === "NON_NULL") return requiredInputField(field);
        continue;
      }
      const r = coerceJson(obj[field.name], ft);
      if (!r.ok) return r;
      out[field.name] = r.value;
    }
    return ok(out);
  }
  return expected(type.name);
}

const requiredInputField = (field: InputValueDef) =>
  bad(
    `Field "${field.name}" of required type "${field.type}" was not provided.`,
    `输入字段 "${field.name}"(类型 "${field.type}")是必填的,但没有提供。`,
  );

/**
 * 文档里写的字面量按类型转换。vars 为 null 表示校验阶段:变量的值要到执行时才知道,先放过;
 * 执行阶段变量缺省时返回 undefined,由调用方决定用默认值还是报错。
 */
function coerceLiteral(node: Value, t: TypeRef, vars: Record<string, unknown> | null): Coerced {
  if (node.t === "var") {
    if (vars === null || !(node.name in vars)) return ok(undefined);
    return coerceJson(vars[node.name], t);
  }
  if (t.kind === "NON_NULL") return node.t === "null" ? nonNull() : coerceLiteral(node, t.of, vars);
  if (node.t === "null") return ok(null);
  if (t.kind === "LIST") {
    const out: unknown[] = [];
    for (const item of node.t === "list" ? node.items : [node]) {
      const r = coerceLiteral(item, t.of, vars);
      if (!r.ok) return r;
      out.push(r.value);
    }
    return ok(out);
  }
  const type = TYPES.get(t.name);
  if (!type) return expected(t.name);
  if (type.kind === "SCALAR") {
    switch (type.name) {
      case "Int":
        return node.t === "int" && Math.abs(node.v) <= INT_MAX ? ok(node.v) : expected("Int");
      case "String":
        return node.t === "string" ? ok(node.v) : expected("String");
      case "Boolean":
        return node.t === "bool" ? ok(node.v) : expected("Boolean");
      default:
        return node.t === "string" || node.t === "int" ? ok(String(node.v)) : expected("ID");
    }
  }
  if (type.kind === "ENUM") {
    if (node.t === "enum") {
      return type.enumValues!.includes(node.v)
        ? ok(node.v)
        : bad(`Value "${node.v}" does not exist in "${type.name}" enum.`, `枚举 "${type.name}" 里没有值 "${node.v}"。`);
    }
    if (node.t === "string") {
      return bad(
        `Enum values are written without quotes: use ${node.v} rather than "${node.v}".`,
        `枚举值不加引号:应写 ${node.v},而不是 "${node.v}"。`,
      );
    }
    return expected(type.name);
  }
  if (type.kind === "INPUT_OBJECT") {
    if (node.t !== "object") return bad(`Expected an object of type "${type.name}".`, `期望 "${type.name}" 类型的对象。`);
    for (const f of node.fields) {
      if (!type.inputFields!.some((x) => x.name === f.name)) {
        return bad(`Field "${f.name}" is not defined by type "${type.name}".`, `"${type.name}" 类型没有字段 "${f.name}"。`);
      }
    }
    const out: Record<string, unknown> = {};
    for (const field of type.inputFields!) {
      const ft = ref(field.type);
      const given = node.fields.find((x) => x.name === field.name);
      if (given) {
        const r = coerceLiteral(given.value, ft, vars);
        if (!r.ok) return r;
        if (r.value !== undefined) {
          out[field.name] = r.value;
          continue;
        }
        // 用了变量:校验阶段先放过,执行阶段变量缺省再按缺省处理
        if (vars === null) continue;
      }
      if (field.defaultValue !== undefined) out[field.name] = field.defaultValue;
      else if (ft.kind === "NON_NULL") return requiredInputField(field);
    }
    return ok(out);
  }
  return expected(type.name);
}

/* ================= 校验 ================= */

/** 编辑距离(允许相邻字母对调),用来给拼错的字段名提建议。 */
function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

function suggest(input: string, options: string[]): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const o of options) {
    const dist = distance(input.toLowerCase(), o.toLowerCase());
    if (dist < bestD) {
      bestD = dist;
      best = o;
    }
  }
  return best !== null && bestD <= Math.floor(input.length * 0.4) + 1 ? best : null;
}

/** 执行之前把整份文档对照 schema 查一遍(规范 §5);有任何一条不通过,整个请求都不执行。 */
function validate(doc: Doc, lang: Lang): string[] {
  const errs: string[] = [];
  const say = (en: string, zh: string) => errs.push(tr(lang, en, zh));
  const frags = new Map(doc.frags.map((f) => [f.name, f]));

  const dupes = (names: string[]) => [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
  if (doc.ops.length > 1 && doc.ops.some((o) => !o.name)) {
    say("This anonymous operation must be the only defined operation.", "文档里有多个操作时,每个操作都必须有名字。");
  }
  for (const n of dupes(doc.ops.flatMap((o) => (o.name ? [o.name] : [])))) {
    say(`There can be only one operation named "${n}".`, `操作名 "${n}" 重复了。`);
  }
  for (const n of dupes(doc.frags.map((f) => f.name))) {
    say(`There can be only one fragment named "${n}".`, `片段名 "${n}" 重复了。`);
  }

  function checkArgs(defs: InputValueDef[], given: Arg[], where: [en: string, zh: string]) {
    for (const a of given) {
      const def = defs.find((x) => x.name === a.name);
      if (!def) {
        say(`Unknown argument "${a.name}" on ${where[0]}.`, `${where[1]} 没有参数 "${a.name}"。`);
        continue;
      }
      const r = coerceLiteral(a.value, ref(def.type), null);
      if (!r.ok) {
        say(
          `Invalid value ${printValue(a.value)} for argument "${a.name}" on ${where[0]}: ${r.why[0]}`,
          `${where[1]} 的参数 "${a.name}" 收到了不合法的值 ${printValue(a.value)}:${r.why[1]}`,
        );
      }
    }
    for (const def of defs) {
      if (ref(def.type).kind === "NON_NULL" && def.defaultValue === undefined && !given.some((a) => a.name === def.name)) {
        say(
          `Argument "${def.name}" of type "${def.type}" is required on ${where[0]}, but it was not provided.`,
          `${where[1]} 的参数 "${def.name}"(类型 "${def.type}")是必填的,但没有提供。`,
        );
      }
    }
  }

  function checkDirectives(dirs: Directive[], location: string) {
    for (const d of dirs) {
      const def = DIRECTIVES.find((x) => x.name === d.name);
      if (!def) {
        say(`Unknown directive "@${d.name}".`, `未知指令 "@${d.name}"。`);
      } else if (!DIRECTIVE_LOCATIONS.includes(location)) {
        say(`Directive "@${d.name}" may not be used on ${location}.`, `指令 "@${d.name}" 不能用在 ${location} 上。`);
      } else {
        checkArgs(def.args, d.args, [`directive "@${d.name}"`, `指令 "@${d.name}"`]);
      }
    }
  }

  function checkSelections(typeName: string, sel: Selection[]) {
    for (const s of sel) {
      if (s.kind === "field") {
        checkDirectives(s.directives, "FIELD");
        const def = fieldDef(typeName, s.name);
        if (!def) {
          const options = (TYPES.get(typeName)?.fields ?? []).map((f) => f.name);
          const hint = suggest(s.name, options);
          say(
            `Cannot query field "${s.name}" on type "${typeName}".${hint ? ` Did you mean "${hint}"?` : ""}`,
            `"${typeName}" 类型上没有字段 "${s.name}"。${hint ? `你是不是想写 "${hint}"?` : ""}`,
          );
          continue;
        }
        checkArgs(def.args ?? [], s.args, [`field "${typeName}.${s.name}"`, `字段 "${typeName}.${s.name}"`]);
        const target = TYPES.get(namedOf(ref(def.type)))!;
        if (target.kind === "OBJECT") {
          if (!s.sel) {
            say(
              `Field "${s.name}" of type "${def.type}" must have a selection of subfields. Did you mean "${s.name} { ... }"?`,
              `字段 "${s.name}" 的类型是 "${def.type}",必须带上子字段的选择集,例如 "${s.name} { ... }"。`,
            );
          } else {
            checkSelections(target.name, s.sel);
          }
        } else if (s.sel) {
          say(
            `Field "${s.name}" must not have a selection since type "${def.type}" has no subfields.`,
            `字段 "${s.name}" 的类型是 "${def.type}",它没有子字段,不能带选择集。`,
          );
        }
      } else if (s.kind === "inline") {
        checkDirectives(s.directives, "INLINE_FRAGMENT");
        if (s.on !== null && !checkCondition(s.on, typeName, null)) continue;
        checkSelections(s.on ?? typeName, s.sel);
      } else {
        checkDirectives(s.directives, "FRAGMENT_SPREAD");
        const fr = frags.get(s.name);
        if (!fr) {
          say(`Unknown fragment "${s.name}".`, `没有定义过的片段 "${s.name}"。`);
        } else if (TYPES.get(fr.on)?.kind === "OBJECT" && fr.on !== typeName) {
          say(
            `Fragment "${s.name}" cannot be spread here as objects of type "${typeName}" can never be of type "${fr.on}".`,
            `片段 "${s.name}" 不能展开在这里:"${typeName}" 类型的对象不可能是 "${fr.on}" 类型。`,
          );
        }
      }
    }
  }

  /** 类型条件:必须是已知的对象类型;这份 schema 没有接口和联合,所以还必须正好是所在的类型。 */
  function checkCondition(on: string, parent: string | null, fragment: string | null): boolean {
    const t = TYPES.get(on);
    if (!t) {
      say(`Unknown type "${on}".`, `未知类型 "${on}"。`);
      return false;
    }
    if (t.kind !== "OBJECT") {
      say(
        fragment
          ? `Fragment "${fragment}" cannot condition on non composite type "${on}".`
          : `Fragment cannot condition on non composite type "${on}".`,
        fragment ? `片段 "${fragment}" 的类型条件 "${on}" 不是对象类型。` : `内联片段的类型条件 "${on}" 不是对象类型。`,
      );
      return false;
    }
    if (parent !== null && on !== parent) {
      say(
        `Fragment cannot be spread here as objects of type "${parent}" can never be of type "${on}".`,
        `内联片段不能用在这里:"${parent}" 类型的对象不可能是 "${on}" 类型。`,
      );
      return false;
    }
    return true;
  }

  for (const fr of doc.frags) {
    checkDirectives(fr.directives, "FRAGMENT_DEFINITION");
    if (checkCondition(fr.on, null, fr.name)) checkSelections(fr.on, fr.sel);
  }

  // 片段不能直接或间接展开自己,否则执行会无限递归
  const spreadsIn = (sel: Selection[]): string[] =>
    sel.flatMap((s) => (s.kind === "spread" ? [s.name] : s.kind === "inline" ? spreadsIn(s.sel) : s.sel ? spreadsIn(s.sel) : []));
  for (const fr of doc.frags) {
    const seen = new Set<string>();
    const stack = spreadsIn(fr.sel);
    while (stack.length) {
      const next = stack.pop()!;
      if (next === fr.name) {
        say(`Cannot spread fragment "${fr.name}" within itself.`, `片段 "${fr.name}" 不能展开它自己。`);
        break;
      }
      if (seen.has(next)) continue;
      seen.add(next);
      const target = frags.get(next);
      if (target) stack.push(...spreadsIn(target.sel));
    }
  }

  const varsIn = (v: Value, into: Set<string>) => {
    if (v.t === "var") into.add(v.name);
    else if (v.t === "list") v.items.forEach((item) => varsIn(item, into));
    else if (v.t === "object") v.fields.forEach((f) => varsIn(f.value, into));
  };
  const usedFragments = new Set<string>();
  function usage(sel: Selection[], vars: Set<string>, seen: Set<string>) {
    for (const s of sel) {
      for (const d of s.directives) d.args.forEach((a) => varsIn(a.value, vars));
      if (s.kind === "field") {
        s.args.forEach((a) => varsIn(a.value, vars));
        if (s.sel) usage(s.sel, vars, seen);
      } else if (s.kind === "inline") {
        usage(s.sel, vars, seen);
      } else {
        usedFragments.add(s.name);
        const fr = frags.get(s.name);
        if (fr && !seen.has(s.name)) {
          seen.add(s.name);
          usage(fr.sel, vars, seen);
        }
      }
    }
  }

  for (const op of doc.ops) {
    const used = new Set<string>();
    usage(op.sel, used, new Set());
    if (op.op === "subscription") {
      say(
        "This endpoint does not support subscriptions. A subscription needs a long-lived connection, such as a WebSocket, over which the server pushes events; chapter 09 explains how it works.",
        "这个端点不支持 subscription。订阅需要 WebSocket 这样的长连接,由服务器持续推送事件;第 09 章讲解它的工作方式。",
      );
      continue;
    }
    checkDirectives(op.directives, op.op === "mutation" ? "MUTATION" : "QUERY");
    checkSelections(op.op === "mutation" ? "Mutation" : "Query", op.sel);

    const defined = new Set<string>();
    for (const v of op.vars) {
      if (defined.has(v.name)) say(`There can be only one variable named "$${v.name}".`, `变量 "$${v.name}" 重复定义了。`);
      defined.add(v.name);
      const t = TYPES.get(namedOf(v.type));
      if (!t) {
        say(`Unknown type "${namedOf(v.type)}".`, `未知类型 "${namedOf(v.type)}"。`);
      } else if (t.kind === "OBJECT") {
        say(
          `Variable "$${v.name}" cannot be non-input type "${printType(v.type)}".`,
          `变量 "$${v.name}" 不能是非输入类型 "${printType(v.type)}"。`,
        );
      } else if (v.def) {
        const r = coerceLiteral(v.def, v.type, null);
        if (!r.ok) say(`Variable "$${v.name}" has an invalid default value: ${r.why[0]}`, `变量 "$${v.name}" 的默认值不合法:${r.why[1]}`);
      }
    }
    for (const name of used) {
      if (defined.has(name)) continue;
      say(
        op.name ? `Variable "$${name}" is not defined by operation "${op.name}".` : `Variable "$${name}" is not defined.`,
        op.name ? `操作 "${op.name}" 没有定义变量 "$${name}"。` : `变量 "$${name}" 没有定义。`,
      );
    }
    for (const name of defined) {
      if (used.has(name)) continue;
      say(
        op.name ? `Variable "$${name}" is never used in operation "${op.name}".` : `Variable "$${name}" is never used.`,
        op.name ? `变量 "$${name}" 在操作 "${op.name}" 里定义了却没有被使用。` : `变量 "$${name}" 定义了却没有被使用。`,
      );
    }
  }

  for (const fr of doc.frags) {
    if (!usedFragments.has(fr.name)) say(`Fragment "${fr.name}" is never used.`, `片段 "${fr.name}" 定义了却没有被使用。`);
  }
  return errs;
}

/* ================= 执行 ================= */

export interface GqlError {
  message: string;
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
}

interface Ctx {
  /** The caller's store. Nothing in this module reads ambient state. */
  store: MockStore;
  lang: Lang;
  auth: Auth;
  vars: Record<string, unknown>;
  frags: Map<string, FragmentNode>;
  errors: GqlError[];
  /** 数据库读取计数 —— N+1 教学的核心指标 */
  dbCalls: number;
  /** 开启后 author 走批量加载(DataLoader 效果) */
  dataloader: boolean;
  /** 批量缓存:同一次请求内相同 id 只查一次 */
  userCache: Map<number, User>;
  /** 没开 loader 时逐条查作者的次数,决定要不要提示 N+1 */
  singleAuthorLoads: number;
  /** 开了 loader 时一批里最多合并了几个 id */
  largestBatch: number;
  mutated: boolean;
}

/** @include(if:) / @skip(if:) —— 第 09 章 */
function skipped(dirs: Directive[], ctx: Ctx): boolean {
  for (const d of dirs) {
    if (d.name !== "include" && d.name !== "skip") continue;
    const a = d.args.find((x) => x.name === "if");
    const r = a ? coerceLiteral(a.value, ref("Boolean!"), ctx.vars) : null;
    const cond = r && r.ok ? r.value : undefined;
    if (d.name === "skip" && cond === true) return true;
    if (d.name === "include" && cond === false) return true;
  }
  return false;
}

/** 把片段摊平,按响应键分组(规范 CollectFields);同一个键的多个字段合并执行。 */
function collectFields(
  typeName: string,
  sel: Selection[],
  ctx: Ctx,
  into = new Map<string, FieldNode[]>(),
  visited = new Set<string>(),
): Map<string, FieldNode[]> {
  for (const s of sel) {
    if (skipped(s.directives, ctx)) continue;
    if (s.kind === "field") {
      const group = into.get(s.alias);
      if (group) group.push(s);
      else into.set(s.alias, [s]);
    } else if (s.kind === "inline") {
      if (s.on === null || s.on === typeName) collectFields(typeName, s.sel, ctx, into, visited);
    } else if (!visited.has(s.name)) {
      visited.add(s.name);
      const fr = ctx.frags.get(s.name);
      if (fr && fr.on === typeName) collectFields(typeName, fr.sel, ctx, into, visited);
    }
  }
  return into;
}

const subFields = (fields: FieldNode[], typeName: string, ctx: Ctx) =>
  collectFields(typeName, fields.flatMap((f) => f.sel ?? []), ctx);

/** 批量取用户 —— DataLoader 模式:同一批 id 只打一次「数据库」 */
function loadUsers(ids: number[], ctx: Ctx): void {
  const missing = [...new Set(ids)].filter((id) => !ctx.userCache.has(id));
  if (!missing.length) return;
  ctx.dbCalls++; // 一次批量查询
  ctx.largestBatch = Math.max(ctx.largestBatch, missing.length);
  for (const id of missing) {
    const u = findUser(ctx.store, id);
    if (u) ctx.userCache.set(id, u);
  }
}

function getUser(id: number, ctx: Ctx): User | null {
  if (ctx.dataloader) {
    // 正常情况下这里已被 primeAuthors 预热过,直接命中缓存,不再产生查询
    if (!ctx.userCache.has(id)) loadUsers([id], ctx);
    return ctx.userCache.get(id) ?? null;
  }
  ctx.dbCalls++; // 每篇文章单独查一次 → 这就是 N+1
  ctx.singleAuthorLoads++;
  return findUser(ctx.store, id) ?? null;
}

// 真正的 DataLoader 靠事件循环的同一个 tick 合并 load() 调用;这个执行器是同步的,
// 所以改用等价手法:解析一批记录之前,先看选择集里要不要 author,
// 要的话就把这批作者 id 一次性预取。效果与 DataLoader 一致 —— 1+N 次塌缩成 2 次。
function primeAuthors(rows: { authorId: number }[], itemType: string, fields: FieldNode[], ctx: Ctx) {
  if (!ctx.dataloader || !rows.length) return;
  const wanted = [...subFields(fields, itemType, ctx).values()].some((group) => group[0].name === "author");
  if (wanted) loadUsers(rows.map((r) => r.authorId), ctx);
}

/** 与 REST 共用同一套凭证规则:mutation 也要可写的 Bearer token。 */
function requireWrite(ctx: Ctx, field: string) {
  const a = ctx.auth;
  if (a.kind === "user" && a.canWrite) return;
  if (a.kind === "user") {
    throw new FieldError(
      tr(ctx.lang, `This token may only read; ${field} needs a token that may write.`, `这枚 token 只有读权限;${field} 需要一枚有写权限的 token。`),
      "FORBIDDEN",
    );
  }
  throw new FieldError(
    a.kind === "invalid"
      ? tr(
          ctx.lang,
          `The token in the Authorization header is not valid, so ${field} cannot run. Send Authorization: Bearer ${DEMO_TOKEN}.`,
          `Authorization 头里的 token 无效,${field} 无法执行。请带上 Authorization: Bearer ${DEMO_TOKEN}。`,
        )
      : tr(
          ctx.lang,
          `${field} requires authentication. Send Authorization: Bearer ${DEMO_TOKEN}, as for any REST write.`,
          `${field} 要求认证。和 REST 的写操作一样,请带上 Authorization: Bearer ${DEMO_TOKEN}。`,
        ),
    "UNAUTHENTICATED",
  );
}

const badInput = (ctx: Ctx, en: string, zh: string) => new FieldError(tr(ctx.lang, en, zh), "BAD_USER_INPUT");

type Resolver = (parent: unknown, args: Record<string, unknown>, ctx: Ctx, fields: FieldNode[]) => unknown;

const RESOLVERS: Record<string, Record<string, Resolver>> = {
  Query: {
    post: (_p, a, ctx) => {
      ctx.dbCalls++;
      // Query.post 返回可空的 Post —— 找不到就是 null,不是错误
      return findPost(ctx.store, Number(a.id)) ?? null;
    },
    posts: (_p, a, ctx, fields) => {
      const limit = typeof a.limit === "number" ? a.limit : 10;
      if (limit < 0 || limit > 100) throw badInput(ctx, "limit must be between 0 and 100.", "limit 必须在 0 到 100 之间。");
      ctx.dbCalls++;
      const rows = a.status ? ctx.store.posts.filter((p) => p.status === a.status) : ctx.store.posts;
      const shown = rows.slice(0, limit);
      primeAuthors(shown, "Post", fields, ctx);
      return shown;
    },
    user: (_p, a, ctx) => {
      ctx.dbCalls++;
      return findUser(ctx.store, Number(a.id)) ?? null;
    },
    users: (_p, _a, ctx) => {
      ctx.dbCalls++;
      return ctx.store.users;
    },
    __schema: () => INTROSPECTION.schema,
    __type: (_p, a) => INTROSPECTION.types.get(String(a.name)) ?? null,
  },
  Mutation: {
    createPost: (_p, a, ctx) => {
      requireWrite(ctx, "createPost");
      const input = a.input as { title: string; body: string; status: PostStatus | null; authorId?: string | null };
      const title = input.title.trim();
      const body = input.body.trim();
      if (!title) throw badInput(ctx, "createPost: title must not be empty.", "createPost:title 不能为空。");
      if (title.length > 120) {
        throw badInput(ctx, "createPost: title must be at most 120 characters.", "createPost:title 不能超过 120 个字符。");
      }
      if (!body) throw badInput(ctx, "createPost: body must not be empty.", "createPost:body 不能为空。");
      const authorId = input.authorId == null ? 1 : Number(input.authorId);
      // 不允许悬空引用:作者不存在的文章会让 Post.author(非空)在之后的每次查询里出错
      if (!Number.isInteger(authorId) || !findUser(ctx.store, authorId)) {
        throw badInput(ctx, `createPost: author ${input.authorId} does not exist.`, `createPost:作者 ${input.authorId} 不存在。`);
      }
      const post: Post = {
        id: ctx.store.nextPostId++,
        title,
        body,
        authorId,
        status: input.status ?? "DRAFT",
        createdAt: new Date().toISOString(),
      };
      ctx.store.posts.push(post);
      ctx.dbCalls++;
      ctx.mutated = true;
      return post;
    },
    deletePost: (_p, a, ctx) => {
      requireWrite(ctx, "deletePost");
      const id = Number(a.id);
      ctx.dbCalls++;
      const idx = ctx.store.posts.findIndex((p) => p.id === id);
      if (idx === -1) return false;
      ctx.store.posts.splice(idx, 1);
      // 和 REST 的 DELETE 一样,文章的评论一并删除
      ctx.store.comments = ctx.store.comments.filter((c) => c.postId !== id);
      ctx.mutated = true;
      return true;
    },
  },
  Post: {
    author: (p, _a, ctx) => getUser((p as Post).authorId, ctx),
    comments: (p, a, ctx, fields) => {
      if (typeof a.first === "number" && a.first < 0) throw badInput(ctx, "first must not be negative.", "first 不能是负数。");
      ctx.dbCalls++;
      const rows = commentsOfPost(ctx.store, (p as Post).id);
      const shown = typeof a.first === "number" ? rows.slice(0, a.first) : rows;
      primeAuthors(shown, "Comment", fields, ctx);
      return shown;
    },
  },
  User: {
    posts: (u, _a, ctx, fields) => {
      ctx.dbCalls++;
      const mine = postsOfUser(ctx.store, (u as User).id);
      primeAuthors(mine, "Post", fields, ctx);
      return mine;
    },
  },
  Comment: {
    author: (c, _a, ctx) => getUser((c as Comment).authorId, ctx),
  },
};

function coerceArgs(def: FieldDef, node: FieldNode, ctx: Ctx): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const a of def.args ?? []) {
    const t = ref(a.type);
    const given = node.args.find((x) => x.name === a.name);
    let value: unknown;
    if (given) {
      const r = coerceLiteral(given.value, t, ctx.vars);
      if (!r.ok) {
        throw new FieldError(
          tr(ctx.lang, `Invalid value for argument "${a.name}": ${r.why[0]}`, `参数 "${a.name}" 的值不合法:${r.why[1]}`),
        );
      }
      value = r.value;
    }
    if (value === undefined) {
      if (a.defaultValue !== undefined) value = a.defaultValue;
      else if (t.kind === "NON_NULL") {
        throw new FieldError(
          tr(
            ctx.lang,
            `Argument "${a.name}" of required type "${a.type}" was not provided a value.`,
            `参数 "${a.name}"(类型 "${a.type}")是必填的,但没有得到值。`,
          ),
        );
      } else continue;
    }
    out[a.name] = value;
  }
  return out;
}

function executeSelectionSet(
  typeName: string,
  parent: unknown,
  grouped: Map<string, FieldNode[]>,
  path: (string | number)[],
  ctx: Ctx,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, fields] of grouped) out[key] = executeField(typeName, parent, fields, [...path, key], ctx);
  return out;
}

function executeField(typeName: string, parent: unknown, fields: FieldNode[], path: (string | number)[], ctx: Ctx) {
  const node = fields[0];
  if (node.name === "__typename") return typeName;
  const def = fieldDef(typeName, node.name)!;
  const type = ref(def.type);
  let value: unknown;
  try {
    const args = coerceArgs(def, node, ctx);
    const resolver = RESOLVERS[typeName]?.[node.name];
    value = resolver ? resolver(parent, args, ctx, fields) : (parent as Record<string, unknown>)[node.name];
  } catch (e) {
    if (!(e instanceof FieldError)) throw e;
    ctx.errors.push({ message: e.message, path, ...(e.code ? { extensions: { code: e.code } } : {}) });
    // 每个位置最多贡献一条错误;非空位置把 null 交给父字段
    if (type.kind === "NON_NULL") throw PROPAGATE;
    return null;
  }
  return complete(type, value, fields, path, `${typeName}.${node.name}`, ctx);
}

/**
 * 非空与冒泡(规范 §6.4.4):可空位置拦下来自内部的 null;非空位置遇到 null 就记一条错误,
 * 再把 null 交给父字段。全程都是非空时,data 本身变成 null。
 */
function complete(type: TypeRef, value: unknown, fields: FieldNode[], path: (string | number)[], label: string, ctx: Ctx): unknown {
  if (type.kind === "NON_NULL") {
    const r = completeInner(type.of, value, fields, path, label, ctx);
    if (r === null) {
      ctx.errors.push({
        message: tr(
          ctx.lang,
          `Cannot return null for non-nullable field ${label}. The null propagates to the nearest nullable parent.`,
          `非空字段 ${label} 不能返回 null。这个 null 会向上冒泡到最近的可空父字段。`,
        ),
        path,
      });
      throw PROPAGATE;
    }
    return r;
  }
  try {
    return completeInner(type, value, fields, path, label, ctx);
  } catch (e) {
    if (e === PROPAGATE) return null;
    throw e;
  }
}

function completeInner(type: TypeRef, value: unknown, fields: FieldNode[], path: (string | number)[], label: string, ctx: Ctx): unknown {
  if (value === null || value === undefined) return null;
  if (type.kind === "LIST") {
    return (value as unknown[]).map((item, i) => complete(type.of, item, fields, [...path, i], label, ctx));
  }
  const t = TYPES.get(namedOf(type))!;
  if (t.kind === "SCALAR") return t.name === "ID" ? String(value) : value;
  if (t.kind === "ENUM") return value;
  return executeSelectionSet(t.name, value, subFields(fields, t.name, ctx), path, ctx);
}

export interface GqlResult {
  data?: Record<string, unknown> | null;
  errors?: GqlError[];
  extensions?: Record<string, unknown>;
}

export interface GqlOptions {
  dataloader?: boolean;
  lang?: Lang;
  /** Same credential rules as REST: mutations need a token that may write. */
  auth?: Auth;
  /** True for GET: GraphQL over HTTP forbids running a mutation from a GET request. */
  readOnly?: boolean;
}

export type GqlOutcome =
  | { kind: "result"; result: GqlResult; mutated: boolean }
  /** The selected operation is a mutation but the request was a GET: answer 405. */
  | { kind: "mutation-over-get" };

function coerceVariables(
  op: OperationNode,
  given: Record<string, unknown>,
  lang: Lang,
): { ok: true; vars: Record<string, unknown> } | { ok: false; errors: string[] } {
  const vars: Record<string, unknown> = {};
  const errors: string[] = [];
  for (const v of op.vars) {
    const has = Object.prototype.hasOwnProperty.call(given, v.name) && given[v.name] !== undefined;
    if (!has) {
      if (v.def) {
        const r = coerceLiteral(v.def, v.type, {});
        if (r.ok) vars[v.name] = r.value;
      } else if (v.type.kind === "NON_NULL") {
        errors.push(
          tr(
            lang,
            `Variable "$${v.name}" of required type "${printType(v.type)}" was not provided.`,
            `变量 "$${v.name}" 的类型是 "${printType(v.type)}",必须提供。`,
          ),
        );
      }
      continue;
    }
    const r = coerceJson(given[v.name], v.type);
    if (r.ok) vars[v.name] = r.value;
    else {
      errors.push(
        tr(
          lang,
          `Variable "$${v.name}" got invalid value ${show(given[v.name])}; ${r.why[0]}`,
          `变量 "$${v.name}" 的值 ${show(given[v.name])} 不合法:${r.why[1]}`,
        ),
      );
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true, vars };
}

export function executeGraphQL(
  store: MockStore,
  query: string,
  variables: Record<string, unknown> = {},
  operationName?: string,
  opts: GqlOptions = {},
): GqlOutcome {
  const lang = opts.lang ?? "en";
  const dataloader = !!opts.dataloader;
  // 请求错误:没有执行,所以响应里没有 data 这个键
  const requestError = (messages: string[]): GqlOutcome => ({
    kind: "result",
    mutated: false,
    result: { errors: messages.map((message) => ({ message })), extensions: { dbCalls: 0, dataloader } },
  });

  let doc: Doc;
  try {
    doc = parse(query, lang);
  } catch (e) {
    if (e instanceof GqlRequestError) return requestError([e.message]);
    throw e;
  }

  const invalid = validate(doc, lang);
  if (invalid.length) return requestError(invalid);

  let op: OperationNode | undefined;
  if (operationName) {
    op = doc.ops.find((o) => o.name === operationName);
    if (!op) {
      return requestError([tr(lang, `Unknown operation named "${operationName}".`, `文档里没有名为 "${operationName}" 的操作。`)]);
    }
  } else if (doc.ops.length > 1) {
    return requestError([
      tr(
        lang,
        "Must provide operation name if query contains multiple operations.",
        "文档包含多个操作时,必须用 operationName 指定要执行哪一个。",
      ),
    ]);
  } else {
    op = doc.ops[0];
  }

  if (op.op === "mutation" && opts.readOnly) return { kind: "mutation-over-get" };

  const coerced = coerceVariables(op, variables, lang);
  if (!coerced.ok) return requestError(coerced.errors);

  const ctx: Ctx = {
    store,
    lang,
    auth: opts.auth ?? { kind: "anonymous" },
    vars: coerced.vars,
    frags: new Map(doc.frags.map((f) => [f.name, f])),
    errors: [],
    dbCalls: 0,
    dataloader,
    userCache: new Map(),
    singleAuthorLoads: 0,
    largestBatch: 0,
    mutated: false,
  };

  const root = op.op === "mutation" ? "Mutation" : "Query";
  let data: Record<string, unknown> | null;
  try {
    data = executeSelectionSet(root, null, collectFields(root, op.sel, ctx), [], ctx);
  } catch (e) {
    if (e !== PROPAGATE) throw e;
    data = null;
  }

  const hint =
    !dataloader && ctx.singleAuthorLoads > 1
      ? tr(
          lang,
          "Without DataLoader, each record's author was fetched with a query of its own: that is N+1. Run it again with ?dataloader=1 to compare.",
          "没开 DataLoader:每条记录的关联作者都单独查了一次 —— 这就是 N+1。加 ?dataloader=1 再跑一次对比。",
        )
      : dataloader && ctx.largestBatch > 1
        ? tr(lang, "With DataLoader, the authors were collected into one batched query.", "开了 DataLoader:同一批作者合并成一次查询。")
        : null;

  const result: GqlResult = { data };
  if (ctx.errors.length) result.errors = ctx.errors;
  result.extensions = { dbCalls: ctx.dbCalls, dataloader, ...(hint ? { hint } : {}) };
  return { kind: "result", result, mutated: ctx.mutated };
}
