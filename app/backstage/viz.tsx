"use client";

// 第 10 章专属可视化(双语,英文默认):
//  - HeroBackstage:hero 里的「客户端发的 query / 服务器上跑的函数」循环点亮。
//  - ResolverTreeViz:一棵 query 树按执行顺序逐节点点亮,旁白讲 parent 怎么传。
//  - SqlCounter:本章核心 —— 左边 query,右边 SQL 计数器逐帧 +1;
//    loader=false 演 N+1,loader=true 演 DataLoader(只到 2)。
//  - NormalizeViz:嵌套响应 → 按 __typename:id 拍平的本地缓存表(静态示意)。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroBackstage ================= */

const HERO_FNS = ["Query.post()", "Post.author()", "User.name()"];

export function HeroBackstage() {
  return (
    <div className="bs-hero" aria-hidden>
      <div className="bs-hero-front">
        <div className="bs-hero-label">
          <T en="The query the client sends" zh="客户端发出的查询" />
        </div>
        <pre className="bs-hero-q">{`{
  post(id: "1") {
    author { name }
  }
}`}</pre>
      </div>
      <div className="bs-hero-curtain">🎭</div>
      <div className="bs-hero-back">
        <div className="bs-hero-label">
          <T en="The functions that run on the server" zh="服务器上真正跑的函数" />
        </div>
        {HERO_FNS.map((fn, i) => (
          <div className="bs-hero-fn" key={fn} style={{ animationDelay: `${i * 1.1}s` }}>
            {fn}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= ResolverTreeViz ================= */

type NodeState = "idle" | "run" | "done";

interface TreeFrame {
  post: NodeState;
  title: NodeState;
  author: NodeState;
  name: NodeState;
  /** 当前调用签名(展示在侧栏,是代码,不翻译) */
  sig?: string;
  /** parent 说明 */
  parent?: Loc<string>;
  msg: ReactNode;
}

const TREE_FRAMES: TreeFrame[] = [
  {
    post: "idle",
    title: "idle",
    author: "idle",
    name: "idle",
    msg: (
      <T
        en={
          <>
            The query arrives. The server does not look up a route. It takes
            this tree of fields and walks it, starting at the{" "}
            <code>Query</code> root type.
          </>
        }
        zh={
          <>
            查询进门。服务器不查路由表,而是拿着这棵字段树,从{" "}
            <code>Query</code> 根类型出发,一个字段一个字段往下走。
          </>
        }
      />
    ),
  },
  {
    post: "run",
    title: "idle",
    author: "idle",
    name: "idle",
    sig: 'Query.post(parent, { id: "1" }, ctx)',
    parent: {
      en: "parent = undefined (a root field has no parent)",
      zh: "parent = undefined(根字段没有父字段)",
    },
    msg: (
      <T
        en={
          <>
            The resolver for <code>Query.post</code> runs and reads one post
            object from the database. <b>Remember that return value</b> — it is
            about to be passed down as <code>parent</code>.
          </>
        }
        zh={
          <>
            <code>Query.post</code> 的 resolver 执行,
            从数据库读回一个 post 对象。<b>记住这个返回值</b> ——
            它马上要作为 <code>parent</code> 传给下一层。
          </>
        }
      />
    ),
  },
  {
    post: "done",
    title: "run",
    author: "idle",
    name: "idle",
    sig: "Post.title(post) → post.title",
    parent: {
      en: "parent = the post object just returned",
      zh: "parent = 刚刚返回的那个 post 对象",
    },
    msg: (
      <T
        en={
          <>
            Now the selection set of <code>post</code>. Nobody wrote a resolver
            for <code>title</code>, so it uses the <b>default resolver</b>: read
            the property of the same name from <code>parent</code>.{" "}
            <code>title</code> and <code>author</code> do not depend on each
            other, so the server can resolve them at the same time.
          </>
        }
        zh={
          <>
            进入 <code>post</code> 的选择集。<code>title</code>{" "}
            没人给它写 resolver,于是走<b>默认 resolver</b>:
            从 <code>parent</code> 上取同名属性。<code>title</code> 和{" "}
            <code>author</code> 互不依赖,服务器可以同时解析它们。
          </>
        }
      />
    ),
  },
  {
    post: "done",
    title: "done",
    author: "run",
    name: "idle",
    sig: "Post.author(post, {}, ctx) → db.findUser(post.authorId)",
    parent: {
      en: "parent = the same post object",
      zh: "parent = 还是那个 post 对象",
    },
    msg: (
      <T
        en={
          <>
            <code>author</code> receives the same post object as{" "}
            <code>parent</code>. It reads <code>authorId</code> from it and
            exchanges that for a user object. What is passed from a parent field
            to a child field is always the parent&apos;s return value.
          </>
        }
        zh={
          <>
            <code>author</code> 收到的 <code>parent</code>{" "}
            还是那个 post 对象。它从里面取出 <code>authorId</code>,
            换回一个 user 对象。父字段传给子字段的,永远是父字段的返回值。
          </>
        }
      />
    ),
  },
  {
    post: "done",
    title: "done",
    author: "done",
    name: "run",
    sig: "User.name(user) → user.name",
    parent: {
      en: "parent = the user object author returned",
      zh: "parent = author 刚返回的那个 user 对象",
    },
    msg: (
      <T
        en={
          <>
            One level further down, <code>parent</code> is a different object:
            the user that <code>author</code> just returned. Another default
            resolver reads the property and returns it.
          </>
        }
        zh={
          <>
            再往下一层,<code>parent</code> 换了对象:是 <code>author</code>{" "}
            刚返回的那个 user。又是默认 resolver,取属性返回。
          </>
        }
      />
    ),
  },
  {
    post: "done",
    title: "done",
    author: "done",
    name: "done",
    msg: (
      <T
        en={
          <>
            The walk reaches the leaves and the tree is finished. The results
            are assembled into JSON in the shape of the query. The response
            looks like the query because of how it was executed.
          </>
        }
        zh={
          <>
            走到叶子,整棵树跑完。结果按 query 的形状拼成 JSON。
            响应长得像查询,正是这种执行方式的结果。
          </>
        }
      />
    ),
  },
];

function TreeNode({
  label,
  state,
  isDefault,
  children,
}: {
  label: string;
  state: NodeState;
  /** 是否默认 resolver */
  isDefault?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`bs-tree-node ${state}`}>
      <div className="bs-tree-head">
        <span className="bs-tree-dot" aria-hidden />
        <span className="bs-tree-label">{label}</span>
        {isDefault && (
          <span className="bs-tree-def">
            <T en="default" zh="默认" />
          </span>
        )}
      </div>
      {children && <div className="bs-tree-kids">{children}</div>}
    </div>
  );
}

export function ResolverTreeViz() {
  const L = useL();
  const stepper = useStepper(TREE_FRAMES.length, 2200);
  const f = TREE_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="One query tree, executed step by step"
          zh="一棵 query 树的执行过程(逐帧慢放)"
        />
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="bs-tree">
            <TreeNode label="Query.post" state={f.post}>
              <TreeNode label="Post.title" state={f.title} isDefault />
              <TreeNode label="Post.author" state={f.author}>
                <TreeNode label="User.name" state={f.name} isDefault />
              </TreeNode>
            </TreeNode>
            <div className="bs-tree-side">
              {f.sig ? (
                <>
                  <div className="bs-tree-sig mono">{f.sig}</div>
                  <div className="bs-tree-parent mono">{L(f.parent ?? "")}</div>
                </>
              ) : (
                <div className="bs-tree-parent mono">
                  {stepper.step === 0
                    ? L({ en: "Waiting to run…", zh: "等待执行…" })
                    : L({ en: "Finished ✓", zh: "执行完毕 ✓" })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={TREE_FRAMES.length} />
    </div>
  );
}

/* ================= SqlCounter(N+1 / DataLoader 对照)================= */

interface SqlFrame {
  /** 累计出现的 SQL 日志行(只有注释需要双语) */
  sql: Loc<string[]>;
  /** 计数器读数 */
  count: number;
  /** DataLoader 的「登记簿」内容(仅 loader 模式) */
  notepad?: Loc<string>;
  /** query 里点亮的行号(1-based) */
  hlLine?: number;
  /** 结算帧 */
  final?: boolean;
  msg: ReactNode;
}

/** 两种语言行数必须一致 —— hlLine 是按行号点亮的。 */
const Q_LINES: Loc<string[]> = {
  en: [
    "{",
    "  posts {          # 3 posts",
    "    title",
    "    author {       # nested!",
    "      name",
    "    }",
    "  }",
    "}",
  ],
  zh: [
    "{",
    "  posts {          # 3 篇",
    "    title",
    "    author {       # 嵌套!",
    "      name",
    "    }",
    "  }",
    "}",
  ],
};

const N1_FRAMES: SqlFrame[] = [
  {
    sql: [],
    count: 0,
    msg: (
      <T
        en={
          <>
            The client sends an ordinary query: a list of posts, each with its
            author. Watch the <b>query counter</b> on the right.
          </>
        }
        zh={
          <>
            客户端发来一条很普通的查询:文章列表,每篇带作者。
            盯住右边的<b>查询计数器</b>。
          </>
        }
      />
    ),
  },
  {
    sql: ["SELECT * FROM posts LIMIT 3"],
    count: 1,
    hlLine: 2,
    msg: (
      <T
        en={
          <>
            <code>Query.posts</code> runs one query and gets 3 posts back. Their
            authors are 9, 12, and 9. So far nothing is wrong.
          </>
        }
        zh={
          <>
            <code>Query.posts</code> 跑了一条查询,拿回 3 篇文章,
            作者分别是 9、12、9 号。到这里一切正常。
          </>
        }
      />
    ),
  },
  {
    sql: ["SELECT * FROM posts LIMIT 3", "SELECT * FROM users WHERE id = 9"],
    count: 2,
    hlLine: 4,
    msg: (
      <T
        en={
          <>
            The <code>author</code> resolver runs for the first post. It only
            knows its own <code>parent</code>, so it queries user 9 on its own.
          </>
        }
        zh={
          <>
            第 1 篇文章的 <code>author</code> resolver 执行。
            它只认识自己的 <code>parent</code>,于是单独查了一次 9 号用户。
          </>
        }
      />
    ),
  },
  {
    sql: [
      "SELECT * FROM posts LIMIT 3",
      "SELECT * FROM users WHERE id = 9",
      "SELECT * FROM users WHERE id = 12",
    ],
    count: 3,
    hlLine: 4,
    msg: (
      <T
        en={
          <>
            The second post queries again. Each resolver works alone, and{" "}
            <b>none of them knows the others are reading the same table</b>.
          </>
        }
        zh={
          <>
            第 2 篇又查一次。每个 resolver 各干各的,
            <b>谁也不知道别人也在读同一张表</b>。
          </>
        }
      />
    ),
  },
  {
    sql: {
      en: [
        "SELECT * FROM posts LIMIT 3",
        "SELECT * FROM users WHERE id = 9",
        "SELECT * FROM users WHERE id = 12",
        "SELECT * FROM users WHERE id = 9  -- id 9 again",
      ],
      zh: [
        "SELECT * FROM posts LIMIT 3",
        "SELECT * FROM users WHERE id = 9",
        "SELECT * FROM users WHERE id = 12",
        "SELECT * FROM users WHERE id = 9  -- 又是 9 号",
      ],
    },
    count: 4,
    hlLine: 4,
    msg: (
      <T
        en={
          <>
            The third post has author 9 as well, and it is fetched a second
            time. Nothing in this design notices the repetition.
          </>
        }
        zh={
          <>
            第 3 篇的作者还是 9 号,于是又取了一遍。
            这种写法里没有任何东西会注意到重复。
          </>
        }
      />
    ),
  },
  {
    sql: {
      en: [
        "SELECT * FROM posts LIMIT 3",
        "SELECT * FROM users WHERE id = 9",
        "SELECT * FROM users WHERE id = 12",
        "SELECT * FROM users WHERE id = 9  -- id 9 again",
      ],
      zh: [
        "SELECT * FROM posts LIMIT 3",
        "SELECT * FROM users WHERE id = 9",
        "SELECT * FROM users WHERE id = 12",
        "SELECT * FROM users WHERE id = 9  -- 又是 9 号",
      ],
    },
    count: 4,
    final: true,
    msg: (
      <T
        en={
          <>
            The total: 1 query for the list plus N for the authors ={" "}
            <b>1 + N</b>. 3 posts cost 4 queries, and{" "}
            <b>100 posts cost 101</b>. The part to remember: the server code did
            not change. The client added one nested field to the query.
          </>
        }
        zh={
          <>
            结算:1 次查列表加 N 次查作者 = <b>1 + N</b>。
            3 篇文章是 4 次,<b>100 篇文章就是 101 次</b>。
            要记住的是:服务器代码一行没改,
            只是客户端在查询里多加了一个嵌套字段。
          </>
        }
      />
    ),
  },
];

const DL_FRAMES: SqlFrame[] = [
  {
    sql: [],
    count: 0,
    msg: (
      <T
        en={
          <>
            The same query, the same 3 posts. One difference: inside the{" "}
            <code>author</code> resolver, <code>db.findUser(id)</code> became{" "}
            <code>loader.load(id)</code>.
          </>
        }
        zh={
          <>
            同一条查询,同样 3 篇文章。区别只有一个:<code>author</code>{" "}
            resolver 里的 <code>db.findUser(id)</code> 换成了{" "}
            <code>loader.load(id)</code>。
          </>
        }
      />
    ),
  },
  {
    sql: ["SELECT * FROM posts LIMIT 3"],
    count: 1,
    hlLine: 2,
    msg: (
      <T
        en={<>The first step is the same: 3 posts, authors 9, 12, and 9.</>}
        zh={<>第一步一样:查回 3 篇文章,作者 9、12、9 号。</>}
      />
    ),
  },
  {
    sql: ["SELECT * FROM posts LIMIT 3"],
    count: 1,
    hlLine: 4,
    notepad: "load(9) → load(12) → load(9)  ⇒  [9, 12, 9]",
    msg: (
      <T
        en={
          <>
            All three <code>author</code> resolvers run, and <b>no query is
            sent</b>. <code>load(id)</code> only records the id and returns a
            Promise immediately.
          </>
        }
        zh={
          <>
            三个 <code>author</code> resolver 都执行了,
            但<b>一条查询也没发出去</b>。<code>load(id)</code>{" "}
            只是把 id 记下来,立刻返回一个 Promise。
          </>
        }
      />
    ),
  },
  {
    sql: [
      "SELECT * FROM posts LIMIT 3",
      "SELECT * FROM users WHERE id IN (9, 12)",
    ],
    count: 2,
    hlLine: 4,
    notepad: {
      en: "[9, 12, 9] deduplicated → [9, 12]",
      zh: "[9, 12, 9] 去重 → [9, 12]",
    },
    msg: (
      <T
        en={
          <>
            The current tick of the event loop ends and DataLoader acts. It{" "}
            <b>removes the duplicate</b>, leaving [9, 12], fetches both with one
            query, and hands each resolver its own row. The repeated 9 is
            answered from the cache.
          </>
        }
        zh={
          <>
            本轮事件循环(同一个 tick)结束,DataLoader 出手:
            <b>去掉重复的</b>,剩下 [9, 12],用一条查询把两个都取回,
            再把各自的那条分发给对应的 resolver。重复的 9 号由缓存回答。
          </>
        }
      />
    ),
  },
  {
    sql: [
      "SELECT * FROM posts LIMIT 3",
      "SELECT * FROM users WHERE id IN (9, 12)",
    ],
    count: 2,
    final: true,
    msg: (
      <T
        en={
          <>
            The total: <b>2 queries</b>. 3 posts cost 2, and 100 posts still
            cost 2 — the batched query just has a longer <code>IN</code> list.
            That is all batching plus a per-request cache does.
          </>
        }
        zh={
          <>
            结算:<b>2 次</b>。3 篇文章是 2 次,100 篇文章
            <b>还是 2 次</b> —— 批量的那条查询只是 <code>IN</code>{" "}
            列表长一点。批处理加每请求缓存,做的就是这些。
          </>
        }
      />
    ),
  },
];

export function SqlCounter({ loader = false }: { loader?: boolean }) {
  const L = useL();
  const frames = loader ? DL_FRAMES : N1_FRAMES;
  const stepper = useStepper(frames.length, 2400);
  const f = frames[stepper.step];
  const lines = L(Q_LINES);
  const sql = L(f.sql);

  return (
    <div className="viz">
      <div className="viz-title">
        {loader
          ? L({
              en: "The same query, this time with DataLoader",
              zh: "同一条 query · 这次有 DataLoader",
            })
          : L({
              en: "Query counter · the N+1 problem in action",
              zh: "查询计数器 · N+1 现场",
            })}
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="bs-n1">
            <div className="bs-n1-q">
              {lines.map((l, i) => (
                <div key={i} className={`bs-n1-ql${f.hlLine === i + 1 ? " on" : ""}`}>
                  {l}
                </div>
              ))}
            </div>
            <div className="bs-n1-right">
              <div className={`bs-n1-counter${f.final ? (loader ? " good" : " boom") : ""}`}>
                <span className="bs-n1-count">{f.count}</span>
                <span className="bs-n1-unit">
                  <T en="SQL queries" zh="次 SQL" />
                </span>
              </div>
              {f.notepad && <div className="bs-n1-pad mono">📒 {L(f.notepad)}</div>}
              <div className="bs-n1-log">
                {sql.map((s, i) => (
                  <div className="bs-n1-sql mono" key={i}>
                    {s}
                  </div>
                ))}
                {sql.length === 0 && (
                  <div className="bs-n1-empty">
                    <T en="(no queries yet)" zh="(还没有查询)" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}

/* ================= NormalizeViz ================= */

export function NormalizeViz() {
  return (
    <div className="bs-norm">
      <div className="bs-norm-panel">
        <div className="bs-norm-title">
          <T en="The nested response from the server" zh="服务器返回的嵌套响应" />
        </div>
        <pre className="bs-norm-json mono">{`{
  "post": {
    "__typename": "Post",
    "id": "1",
    "title": "Meeting GraphQL",
    "author": {
      "__typename": "User",
      "id": "9",
      "name": "Ada"
    }
  }
}`}</pre>
      </div>
      <div className="bs-norm-arrow" aria-hidden>
        →
        <span>
          <T en="split by __typename:id" zh="按 __typename:id 拍平" />
        </span>
      </div>
      <div className="bs-norm-panel">
        <div className="bs-norm-title">
          <T en="The local store in the client" zh="客户端的本地仓库" />
        </div>
        <div className="bs-norm-row">
          <span className="bs-norm-key mono">Post:1</span>
          <span className="bs-norm-val mono">
            {'{ title: "Meeting GraphQL", author: '}
            <b>→ User:9</b>
            {" }"}
          </span>
        </div>
        <div className="bs-norm-row">
          <span className="bs-norm-key mono">User:9</span>
          <span className="bs-norm-val mono">{'{ name: "Ada" }'}</span>
        </div>
        <p className="bs-norm-note">
          <T
            en={
              <>
                The nesting is gone. Each object is stored once, and the objects
                point at each other by <b>reference</b>. A later query that
                needs <code>User:9</code> is answered locally, and a mutation
                that changes Ada&apos;s name updates every view that reads her —
                one copy, one value.
              </>
            }
            zh={
              <>
                嵌套没有了,每个对象只存一份,对象之间用<b>引用</b>相连。
                之后的查询再需要 <code>User:9</code>,本地就能回答;
                一次 mutation 改了 Ada 的名字,所有读到她的界面同时更新 ——
                只存一份,值也只有一个。
              </>
            }
          />
        </p>
      </div>
    </div>
  );
}
