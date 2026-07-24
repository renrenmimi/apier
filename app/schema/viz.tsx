"use client";

// 第 08 章 · Schema 与类型系统 —— 本章专属可视化:
//  - ScHeroContract:hero 里的「前端 — 契约 — 后端」示意(纯 CSS)。
//  - ModifierLab:[String] 四种写法点谁讲谁,配合法/非法示例值。
//  - SchemaGraph:SVG 类型关系图(Query/User/Post/Comment),点节点看 SDL。

import { useState } from "react";
import { CodeBlock } from "@/lib/code";

/* ================= ScHeroContract ================= */

export function ScHeroContract() {
  return (
    <div className="sc-hero" aria-hidden>
      <div className="flow-node">
        <span className="ico">🧑‍💻</span>
        前端
      </div>
      <div className="sc-hero-link" />
      <div className="sc-hero-doc">
        <div className="sc-hero-doc-name">schema.graphql</div>
        <pre>{`type Post {
  title: String!
  author: User!
}`}</pre>
        <div className="sc-hero-seal">双方各执一份 ✦</div>
      </div>
      <div className="sc-hero-link" />
      <div className="flow-node">
        <span className="ico">🗄️</span>
        后端
      </div>
    </div>
  );
}

/* ================= ModifierLab ================= */

interface ModForm {
  sig: string;
  listNull: boolean;
  itemNull: boolean;
  read: string;
}

const MOD_FORMS: ModForm[] = [
  {
    sig: "[String]",
    listNull: true,
    itemNull: true,
    read: "最宽松:列表本身可以整个是 null,列表里也可以混进 null。哪儿都没戴 !,哪儿都拦不住。",
  },
  {
    sig: "[String!]",
    listNull: true,
    itemNull: false,
    read: "里层的 ! 管元素:列表可以整个缺席(null),但只要列表在,里面就不许出现 null。",
  },
  {
    sig: "[String]!",
    listNull: false,
    itemNull: true,
    read: "外层的 ! 管列表:列表本身必须在 —— 哪怕是空的 [] 也行,但元素里可以混 null。",
  },
  {
    sig: "[String!]!",
    listNull: false,
    itemNull: false,
    read: "最严格:列表必须在,元素也一个都不许是 null。生产 schema 里列表字段最常见的选择。",
  },
];

const MOD_SAMPLES: {
  v: string;
  ok: (f: ModForm) => boolean;
  note: string;
}[] = [
  { v: "null", ok: (f) => f.listNull, note: "整个列表就是 null" },
  { v: "[]", ok: () => true, note: "空列表 —— 它不是 null!" },
  { v: '["a", "b"]', ok: () => true, note: "规规矩矩的列表" },
  { v: '["a", null]', ok: (f) => f.itemNull, note: "列表在,但混进一个 null" },
];

export function ModifierLab() {
  const [sel, setSel] = useState(0);
  const f = MOD_FORMS[sel];

  return (
    <div className="viz">
      <div className="viz-title">
        修饰符四连:点一种写法,看哪层能 null、哪层不能
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
        <p className="sc-mod-read">{f.read}</p>
        <div className="sc-mod-switches">
          <span className="chip" data-tone={f.listNull ? "ok" : "risk"}>
            列表本身可空:{f.listNull ? "✓ 可以" : "✕ 不行"}
          </span>
          <span className="chip" data-tone={f.itemNull ? "ok" : "risk"}>
            元素可空:{f.itemNull ? "✓ 可以" : "✕ 不行"}
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
                  {legal ? "✓ 合法" : "✕ 非法"}
                </span>
                <span className="sc-mod-note">{s.note}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="viz-msg">
        读法口诀:<b>从里往外</b> —— 里层的 ! 管元素,外层的 ! 管列表本身。
        另外记住:空列表 [] 永远合法,它不是 null。
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
  { x: number; y: number; sub: string }
> = {
  Query: { x: 60, y: 40, sub: "查询入口" },
  User: { x: 440, y: 40, sub: "用户" },
  Post: { x: 60, y: 250, sub: "帖子" },
  Comment: { x: 440, y: 250, sub: "评论" },
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

const SG_BLURB: Record<NodeId, string> = {
  Query:
    "一切查询的大门。它自己不存数据,只负责把「你能从哪进」列出来:按 id 拿一篇帖子、拿一页帖子、按 id 拿一个用户。",
  User: "两条腿站在图里:被 Post.author 指着,又通过 posts 指回自己写的帖子。「作者的帖子的评论的作者」这种链路,就是沿着边走出来的。",
  Post: "整张图的枢纽:author 指向 User,comments 指向 Comment。两条边都戴着 !,意思是拿到一篇帖子,就一定能问到它的作者和评论列表。",
  Comment:
    "最安静的类型:只被 Post.comments 引用,自己再通过 author 指回 User —— 于是图里出现了环,这在「表思维」里很别扭,在「图思维」里理所当然。",
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
  const [sel, setSel] = useState<NodeId>("Post");

  return (
    <div className="viz">
      <div className="viz-title">
        博客 schema 的关系图:类型是点,字段是边 —— 点节点看它的 SDL
      </div>
      <div className="sc-sg-grid">
        <div className="sc-sg-svgwrap">
          <svg
            viewBox="0 0 620 340"
            className="sc-sg-svg"
            role="img"
            aria-label="Query、User、Post、Comment 四个类型的关系图"
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
                  aria-label={`查看 ${id} 的定义`}
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
                    {n.sub}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="sc-sg-panel" aria-live="polite">
          <div className="sc-sg-head mono">type {sel}</div>
          <p>{SG_BLURB[sel]}</p>
          <CodeBlock lang="graphql" title={`${sel} 的定义`} code={SG_SDL[sel]} />
        </div>
      </div>
      <div className="viz-msg">
        亮起来的边是 <b>{sel}</b> 伸出去的引用 —— 数据不是一张张孤立的表,
        是一张网。GraphQL 名字里的 <b>Graph</b>,就是这张网。
      </div>
    </div>
  );
}
