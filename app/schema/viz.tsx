"use client";

// 第 08 章 · Schema 与类型系统 —— 本章专属可视化(双语,英文默认):
//  - ScHeroContract:hero 里的「客户端 — 契约 — 服务器」示意(纯 CSS)。
//  - ModifierLab:列表字段的四种写法,点谁讲谁,配合法/非法示例值。
//  - SchemaGraph:SVG 类型关系图(Query/User/Post/Comment),点节点看 SDL。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { useState } from "react";
import { CodeBlock } from "@/lib/code";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= ScHeroContract ================= */

export function ScHeroContract() {
  return (
    <div className="sc-hero" aria-hidden>
      <div className="flow-node">
        <span className="ico">🧑‍💻</span>
        <T en="Client" zh="前端" />
      </div>
      <div className="sc-hero-link" />
      <div className="sc-hero-doc">
        <div className="sc-hero-doc-name">schema.graphql</div>
        <pre>{`type Post {
  title: String!
  author: User!
}`}</pre>
        <div className="sc-hero-seal">
          <T en="One copy on each desk ✦" zh="双方各执一份 ✦" />
        </div>
      </div>
      <div className="sc-hero-link" />
      <div className="flow-node">
        <span className="ico">🗄️</span>
        <T en="Server" zh="后端" />
      </div>
    </div>
  );
}

/* ================= ModifierLab ================= */

interface ModForm {
  sig: string;
  listNull: boolean;
  itemNull: boolean;
  read: Loc<string>;
}

const MOD_FORMS: ModForm[] = [
  {
    sig: "[String]",
    listNull: true,
    itemNull: true,
    read: {
      en: "The loosest form. The whole list may be null, and the list may also contain null elements. There is no ! anywhere, so nothing is ruled out.",
      zh: "最宽松的一种:列表本身可以整个是 null,列表里也可以出现 null。哪儿都没有 !,哪儿都不设限。",
    },
  },
  {
    sig: "[String!]",
    listNull: true,
    itemNull: false,
    read: {
      en: "The inner ! applies to the elements. The list itself may be null, but if the list is there, no element inside it may be null.",
      zh: "里层的 ! 管元素:列表本身可以是 null,但只要列表在,里面就不许出现 null。",
    },
  },
  {
    sig: "[String]!",
    listNull: false,
    itemNull: true,
    read: {
      en: "The outer ! applies to the list. The list itself must be present — an empty list [] counts as present — but the elements inside may be null.",
      zh: "外层的 ! 管列表:列表本身必须在(空列表 [] 也算在),但元素里可以出现 null。",
    },
  },
  {
    sig: "[String!]!",
    listNull: false,
    itemNull: false,
    read: {
      en: "The strictest form. The list must be present, and no element may be null. This is the most common choice for list fields in a production schema.",
      zh: "最严格的一种:列表必须在,元素也一个都不许是 null。生产环境的 schema 里,列表字段最常这么写。",
    },
  },
];

const MOD_SAMPLES: {
  v: string;
  ok: (f: ModForm) => boolean;
  note: Loc<string>;
}[] = [
  {
    v: "null",
    ok: (f) => f.listNull,
    note: { en: "the whole list is null", zh: "整个列表就是 null" },
  },
  {
    v: "[]",
    ok: () => true,
    note: {
      en: "an empty list, which is not null",
      zh: "空列表 —— 它不是 null",
    },
  },
  {
    v: '["a", "b"]',
    ok: () => true,
    note: { en: "an ordinary list", zh: "规规矩矩的列表" },
  },
  {
    v: '["a", null]',
    ok: (f) => f.itemNull,
    note: {
      en: "the list is there, but one element is null",
      zh: "列表在,但里面混进一个 null",
    },
  },
];

export function ModifierLab() {
  const L = useL();
  const [sel, setSel] = useState(0);
  const f = MOD_FORMS[sel];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Four ways to write a list field: select one to see which level may be null"
          zh="列表字段的四种写法:点一种,看哪一层可以是 null"
        />
      </div>
      <div className="seg sc-mod-seg" role="tablist">
        {MOD_FORMS.map((m, i) => (
          <button
            key={m.sig}
            type="button"
            role="tab"
            aria-selected={sel === i}
            className={`seg-btn mono${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            {m.sig}
          </button>
        ))}
      </div>
      <div className="sc-mod-panel" aria-live="polite">
        <div className="sc-mod-sig mono">tags: {f.sig}</div>
        <p className="sc-mod-read">{L(f.read)}</p>
        <div className="sc-mod-switches">
          <span className="chip" data-tone={f.listNull ? "ok" : "risk"}>
            {L({ en: "List can be null", zh: "列表本身可空" })}:{" "}
            {f.listNull
              ? L({ en: "✓ yes", zh: "✓ 可以" })
              : L({ en: "✕ no", zh: "✕ 不行" })}
          </span>
          <span className="chip" data-tone={f.itemNull ? "ok" : "risk"}>
            {L({ en: "Element can be null", zh: "元素可空" })}:{" "}
            {f.itemNull
              ? L({ en: "✓ yes", zh: "✓ 可以" })
              : L({ en: "✕ no", zh: "✕ 不行" })}
          </span>
        </div>
        <div className="sc-mod-samples">
          {MOD_SAMPLES.map((s) => {
            const legal = s.ok(f);
            return (
              <div
                key={s.v}
                className={`sc-mod-sample${legal ? " ok" : " bad"}`}
              >
                <span className="mono">{s.v}</span>
                <span className="sc-mod-verdict">
                  {legal
                    ? L({ en: "✓ valid", zh: "✓ 合法" })
                    : L({ en: "✕ invalid", zh: "✕ 非法" })}
                </span>
                <span className="sc-mod-note">{L(s.note)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="viz-msg">
        <T
          en={
            <>
              How to read it: <b>!</b> applies to the type immediately on its
              left. Inside the brackets it covers the elements; outside the
              brackets it covers the list itself. And remember that an empty list{" "}
              <b>[]</b> is always valid, because it is not null.
            </>
          }
          zh={
            <>
              读法:<b>!</b> 作用于紧挨着它左边的类型 ——
              方括号里的那个管元素,方括号外的那个管列表本身。另外记住:空列表{" "}
              <b>[]</b> 永远合法,因为它不是 null。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= SchemaGraph ================= */

type NodeId = "Query" | "User" | "Post" | "Comment";

const NODE_W = 120;
const NODE_H = 46;

const SG_NODES: Record<
  NodeId,
  { x: number; y: number; sub: Loc<string> }
> = {
  Query: { x: 60, y: 40, sub: { en: "entry point", zh: "查询入口" } },
  User: { x: 440, y: 40, sub: { en: "accounts", zh: "用户" } },
  Post: { x: 60, y: 250, sub: { en: "articles", zh: "帖子" } },
  Comment: { x: 440, y: 250, sub: { en: "replies", zh: "评论" } },
};

const SG_SDL: Record<NodeId, string> = {
  Query: `type Query {
  post(id: ID!): Post
  posts(limit: Int = 10): [Post!]!
  user(id: ID!): User
}`,
  User: `type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}`,
  Post: `type Post {
  id: ID!
  title: String!
  body: String!
  createdAt: String!
  author: User!
  comments: [Comment!]!
}`,
  Comment: `type Comment {
  id: ID!
  body: String!
  author: User!
}`,
};

const SG_BLURB: Record<NodeId, Loc<string>> = {
  Query: {
    en: "The entry point for every read. It stores no data itself; it lists where you can start: one post by id, a page of posts, or one user by id.",
    zh: "所有读操作的入口。它自己不存数据,只列出你能从哪里开始:按 id 拿一篇帖子、拿一页帖子、按 id 拿一个用户。",
  },
  User: {
    en: "User sits at both ends of an edge. Post.author points at it, and its posts field points back at the posts that user wrote. Longer paths follow those edges from one type to the next.",
    zh: "User 站在边的两头:Post.author 指向它,而它的 posts 字段又指回这个用户写的帖子。更长的路径,就是这样一条边接一条边走出来的。",
  },
  Post: {
    en: "The busiest type here. author points at User, comments points at Comment. Both edges carry !, so once you have a post you can always ask for its author and its comments.",
    zh: "这张图里最忙的类型:author 指向 User,comments 指向 Comment。两条边都带着 !,所以只要拿到一篇帖子,就一定能问到它的作者和评论列表。",
  },
  Comment: {
    en: "The quietest type. Only Post.comments refers to it, and it points back at User through author. That makes a cycle in the graph: unusual if you think in tables, ordinary if you think in graphs.",
    zh: "最安静的类型:只有 Post.comments 引用它,而它又通过 author 指回 User。于是图里出现了一个环 —— 用「表」的思路看很别扭,用「图」的思路看理所当然。",
  },
};

const SG_EDGES: {
  from: NodeId;
  to: NodeId;
  label: string;
  d: string;
  lx: number;
  ly: number;
  anchor?: "start" | "middle";
}[] = [
  {
    from: "Query",
    to: "User",
    label: "user",
    d: "M 184 63 L 432 63",
    lx: 308,
    ly: 52,
  },
  {
    from: "Query",
    to: "Post",
    label: "post · posts",
    d: "M 120 90 L 120 242",
    lx: 132,
    ly: 170,
    anchor: "start",
  },
  {
    from: "Post",
    to: "User",
    label: "author",
    d: "M 175 246 Q 280 140 442 92",
    lx: 286,
    ly: 146,
  },
  {
    from: "User",
    to: "Post",
    label: "posts",
    d: "M 455 90 Q 350 230 188 264",
    lx: 344,
    ly: 216,
  },
  {
    from: "Post",
    to: "Comment",
    label: "comments",
    d: "M 184 273 L 432 273",
    lx: 308,
    ly: 292,
  },
  {
    from: "Comment",
    to: "User",
    label: "author",
    d: "M 500 246 L 500 90",
    lx: 512,
    ly: 172,
    anchor: "start",
  },
];

export function SchemaGraph() {
  const L = useL();
  const [sel, setSel] = useState<NodeId>("Post");

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="The blog schema as a graph: types are nodes, fields are edges. Select a node to read its SDL."
          zh="博客 schema 的关系图:类型是点,字段是边 —— 点一个节点,看它的 SDL。"
        />
      </div>
      <div className="sc-sg-grid">
        <div className="sc-sg-svgwrap">
          <svg
            viewBox="0 0 620 340"
            className="sc-sg-svg"
            role="img"
            aria-label={L({
              en: "A graph of four types: Query, User, Post, and Comment",
              zh: "Query、User、Post、Comment 四个类型的关系图",
            })}
          >
            <defs>
              <marker
                id="sc-arr"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-3)" />
              </marker>
              <marker
                id="sc-arr-on"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--acc)" />
              </marker>
            </defs>

            {SG_EDGES.map((e) => {
              const on = e.from === sel;
              return (
                <g key={`${e.from}-${e.to}-${e.label}`}>
                  <path
                    d={e.d}
                    fill="none"
                    className={on ? "flow-edge" : undefined}
                    stroke={on ? "var(--acc)" : "var(--border-strong)"}
                    strokeWidth={on ? 2 : 1.5}
                    markerEnd={on ? "url(#sc-arr-on)" : "url(#sc-arr)"}
                  />
                  <text
                    x={e.lx}
                    y={e.ly}
                    textAnchor={e.anchor ?? "middle"}
                    className={`sc-sg-lab${on ? " on" : ""}`}
                  >
                    {e.label}
                  </text>
                </g>
              );
            })}

            {(Object.keys(SG_NODES) as NodeId[]).map((id) => {
              const n = SG_NODES[id];
              const on = sel === id;
              return (
                <g
                  key={id}
                  className={`sc-sg-node${on ? " on" : ""}`}
                  onClick={() => setSel(id)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      setSel(id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={on}
                  aria-label={L({
                    en: `Show the definition of ${id}`,
                    zh: `查看 ${id} 的定义`,
                  })}
                >
                  <rect
                    x={n.x}
                    y={n.y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={13}
                  />
                  <text
                    x={n.x + NODE_W / 2}
                    y={n.y + 20}
                    textAnchor="middle"
                    className="sc-sg-name"
                  >
                    {id}
                  </text>
                  <text
                    x={n.x + NODE_W / 2}
                    y={n.y + 36}
                    textAnchor="middle"
                    className="sc-sg-sub"
                  >
                    {L(n.sub)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="sc-sg-panel" aria-live="polite">
          <div className="sc-sg-head mono">type {sel}</div>
          <p>{L(SG_BLURB[sel])}</p>
          <CodeBlock
            lang="graphql"
            title={{
              en: `Definition of ${sel}`,
              zh: `${sel} 的定义`,
            }}
            code={SG_SDL[sel]}
          />
        </div>
      </div>
      <div className="viz-msg">
        <T
          en={
            <>
              The highlighted edges are the references that <b>{sel}</b> points
              out to. The data is not a set of separate tables; it is one
              connected graph. That graph is the <b>Graph</b> in GraphQL.
            </>
          }
          zh={
            <>
              亮起来的边,是 <b>{sel}</b> 向外伸出的引用。
              数据不是一张张孤立的表,而是一张连通的图。GraphQL 名字里的{" "}
              <b>Graph</b>,指的就是它。
            </>
          }
        />
      </div>
    </div>
  );
}
