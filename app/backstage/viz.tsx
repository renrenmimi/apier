"use client";

// 第 10 章专属可视化:
//  - HeroBackstage:hero 里的「台前 query / 后厨 resolver 链」循环点亮。
//  - ResolverTreeViz:一棵 query 树按执行顺序逐节点点亮,旁白讲 parent 怎么传。
//  - SqlCounter:本章核心 —— 左边 query,右边 SQL 计数器逐帧 +1;
//    loader=false 演 N+1 灾难,loader=true 演 DataLoader 救场(只到 2)。
//  - NormalizeViz:嵌套响应 → 按 __typename:id 拍平的本地缓存表(静态示意)。

import { type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= HeroBackstage ================= */

const HERO_FNS = ["Query.post()", "Post.author()", "User.name()"];

export function HeroBackstage() {
  return (
    <div className="bs-hero" aria-hidden>
      <div className="bs-hero-front">
        <div className="bs-hero-label">台前 · 你点的菜</div>
        <pre className="bs-hero-q">{`{
  post(id: "1") {
    author { name }
  }
}`}</pre>
      </div>
      <div className="bs-hero-curtain">🎭</div>
      <div className="bs-hero-back">
        <div className="bs-hero-label">后厨 · 真正在跑的函数</div>
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
  /** 当前调用签名(展示在侧栏) */
  sig?: string;
  /** parent 说明 */
  parent?: string;
  msg: ReactNode;
}

const TREE_FRAMES: TreeFrame[] = [
  {
    post: "idle",
    title: "idle",
    author: "idle",
    name: "idle",
    msg: (
      <>
        query 进门。执行引擎不查路由表 —— 它拿着这棵字段树,从 Query
        根类型出发,一个字段一个字段往下走。
      </>
    ),
  },
  {
    post: "run",
    title: "idle",
    author: "idle",
    name: "idle",
    sig: 'Query.post(parent, { id: "1" }, ctx)',
    parent: "parent = undefined(根字段没有父亲)",
    msg: (
      <>
        <code>Query.post</code> 的 resolver 执行,去数据库查回一个 post 对象。
        <b>记住这个返回值</b> —— 它马上要作为 parent 传给下一层。
      </>
    ),
  },
  {
    post: "done",
    title: "run",
    author: "idle",
    name: "idle",
    sig: "Post.title(post) → post.title",
    parent: "parent = 刚才返回的 post 对象",
    msg: (
      <>
        进入 post 的选择集。<code>title</code> 没人给它写 resolver ——
        走<b>默认 resolver</b>:从 parent 身上取同名属性,完事。
        同一层的 title 和 author 互不依赖,可以并行跑。
      </>
    ),
  },
  {
    post: "done",
    title: "done",
    author: "run",
    name: "idle",
    sig: "Post.author(post, {}, ctx) → db.findUser(post.authorId)",
    parent: "parent = 还是那个 post 对象",
    msg: (
      <>
        <code>author</code> 的 parent 同样是那个 post 对象 ——
        它从 parent 身上拿 <code>authorId</code>,去换一个 user 对象回来。
        父与子之间的接力棒,永远是「上一层的返回值」。
      </>
    ),
  },
  {
    post: "done",
    title: "done",
    author: "done",
    name: "run",
    sig: "User.name(user) → user.name",
    parent: "parent = author 刚返回的 user 对象",
    msg: (
      <>
        再下一层:<code>name</code> 的 parent 换人了 ——
        是 author 刚返回的 user 对象。又是默认 resolver,取属性交差。
      </>
    ),
  },
  {
    post: "done",
    title: "done",
    author: "done",
    name: "done",
    msg: (
      <>
        走到叶子,整棵树跑完。结果按 query 的形状拼装成 JSON 返回 ——
        响应长得和 query 一模一样,不是巧合,是执行方式决定的。
      </>
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
        {isDefault && <span className="bs-tree-def">默认</span>}
      </div>
      {children && <div className="bs-tree-kids">{children}</div>}
    </div>
  );
}

export function ResolverTreeViz() {
  const stepper = useStepper(TREE_FRAMES.length, 2200);
  const f = TREE_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">一棵 query 树的执行现场(逐帧慢放)</div>
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
                  <div className="bs-tree-parent mono">{f.parent}</div>
                </>
              ) : (
                <div className="bs-tree-parent mono">
                  {stepper.step === 0 ? "等待执行…" : "执行完毕 ✓"}
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
  /** 累计出现的 SQL 日志行 */
  sql: string[];
  /** 计数器读数 */
  count: number;
  /** DataLoader 的「小本本」内容(仅 loader 模式) */
  notepad?: string;
  /** query 里点亮的行号(1-based) */
  hlLine?: number;
  /** 结算帧 */
  final?: boolean;
  msg: ReactNode;
}

const Q_LINES = [
  "{",
  "  posts {          # 3 篇",
  "    title",
  "    author {       # 嵌套!",
  "      name",
  "    }",
  "  }",
  "}",
];

const N1_FRAMES: SqlFrame[] = [
  {
    sql: [],
    count: 0,
    msg: (
      <>
        客户端发来一条再普通不过的 query:文章列表,每篇带作者。
        盯住右边的 <b>SQL 计数器</b>。
      </>
    ),
  },
  {
    sql: ["SELECT * FROM posts LIMIT 3"],
    count: 1,
    hlLine: 2,
    msg: (
      <>
        <code>Query.posts</code> 跑了一条 SQL,拿回 3 篇文章
        (作者分别是 9、12、9 号)。到目前为止,一切正常。
      </>
    ),
  },
  {
    sql: ["SELECT * FROM posts LIMIT 3", "SELECT * FROM users WHERE id = 9"],
    count: 2,
    hlLine: 4,
    msg: (
      <>
        第 1 篇文章的 <code>author</code> resolver 执行 ——
        它只认识自己手里的 parent,单独查了一次 9 号用户。
      </>
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
      <>
        第 2 篇的 author resolver 又查一次。每个 resolver
        各干各的,<b>谁也不知道别人也在查用户表</b>。
      </>
    ),
  },
  {
    sql: [
      "SELECT * FROM posts LIMIT 3",
      "SELECT * FROM users WHERE id = 9",
      "SELECT * FROM users WHERE id = 12",
      "SELECT * FROM users WHERE id = 9  -- 又来?!",
    ],
    count: 4,
    hlLine: 4,
    msg: (
      <>
        第 3 篇的作者还是 9 号 —— 照查不误,连重复的都不放过。
        数据库管理员的表情已经开始不对了。
      </>
    ),
  },
  {
    sql: [
      "SELECT * FROM posts LIMIT 3",
      "SELECT * FROM users WHERE id = 9",
      "SELECT * FROM users WHERE id = 12",
      "SELECT * FROM users WHERE id = 9  -- 又来?!",
    ],
    count: 4,
    final: true,
    msg: (
      <>
        结算:1 次查列表 + N 次查作者 = <b>1 + N</b>。3 篇文章是 4 次,
        <b>100 篇文章就是 101 次</b>。最吓人的在这:后端一行代码没改,
        客户端在 query 里多勾一个嵌套字段,生产库就被引爆了。
      </>
    ),
  },
];

const DL_FRAMES: SqlFrame[] = [
  {
    sql: [],
    count: 0,
    msg: (
      <>
        同一条 query,同样 3 篇文章。区别只有一个:author resolver 里的
        <code>db.findUser(id)</code> 换成了 <code>loader.load(id)</code>。
      </>
    ),
  },
  {
    sql: ["SELECT * FROM posts LIMIT 3"],
    count: 1,
    hlLine: 2,
    msg: <>第一步一样:查回 3 篇文章,作者 9、12、9 号。</>,
  },
  {
    sql: ["SELECT * FROM posts LIMIT 3"],
    count: 1,
    hlLine: 4,
    notepad: "load(9) → load(12) → load(9)  ⇒  [9, 12, 9]",
    msg: (
      <>
        三个 author resolver 执行 —— 但<b>一条 SQL 都没发</b>。
        <code>load(id)</code> 只是把要的 id 记在小本本上,立刻返回一个
        Promise:「稍等,马上一起办」。
      </>
    ),
  },
  {
    sql: [
      "SELECT * FROM posts LIMIT 3",
      "SELECT * FROM users WHERE id IN (9, 12)",
    ],
    count: 2,
    hlLine: 4,
    notepad: "[9, 12, 9] 去重 → [9, 12]",
    msg: (
      <>
        本轮同步代码跑完(一个 tick 结束),DataLoader 出手:
        把小本本<b>去重</b>成 [9, 12],一条批量 SQL 全部拿回,
        再按登记顺序把结果一一还给三个 resolver —— 重复的 9 号吃的是缓存。
      </>
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
      <>
        结算:<b>2 次</b>,句号。3 篇文章是 2 次,100 篇文章
        <b>还是 2 次</b> —— 批量那条 SQL 只是 IN 列表长一点。
        这就是批处理 + 每请求缓存的全部魔法。
      </>
    ),
  },
];

export function SqlCounter({ loader = false }: { loader?: boolean }) {
  const frames = loader ? DL_FRAMES : N1_FRAMES;
  const stepper = useStepper(frames.length, 2400);
  const f = frames[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">
        {loader ? "同一条 query · 这次有 DataLoader" : "SQL 计数器 · N+1 事故现场"}
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="bs-n1">
            <div className="bs-n1-q">
              {Q_LINES.map((l, i) => (
                <div key={i} className={`bs-n1-ql${f.hlLine === i + 1 ? " on" : ""}`}>
                  {l}
                </div>
              ))}
            </div>
            <div className="bs-n1-right">
              <div className={`bs-n1-counter${f.final ? (loader ? " good" : " boom") : ""}`}>
                <span className="bs-n1-count">{f.count}</span>
                <span className="bs-n1-unit">次 SQL</span>
              </div>
              {f.notepad && <div className="bs-n1-pad mono">📒 {f.notepad}</div>}
              <div className="bs-n1-log">
                {f.sql.map((s, i) => (
                  <div className="bs-n1-sql mono" key={i}>
                    {s}
                  </div>
                ))}
                {f.sql.length === 0 && <div className="bs-n1-empty">（还没有查询）</div>}
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
        <div className="bs-norm-title">服务器返回的嵌套响应</div>
        <pre className="bs-norm-json mono">{`{
  "post": {
    "__typename": "Post",
    "id": "1",
    "title": "GraphQL 入门",
    "author": {
      "__typename": "User",
      "id": "9",
      "name": "Ada"
    }
  }
}`}</pre>
      </div>
      <div className="bs-norm-arrow" aria-hidden>
        →<span>按 __typename:id 拍平</span>
      </div>
      <div className="bs-norm-panel">
        <div className="bs-norm-title">客户端的本地「小数据库」</div>
        <div className="bs-norm-row">
          <span className="bs-norm-key mono">Post:1</span>
          <span className="bs-norm-val mono">
            {'{ title: "GraphQL 入门", author: '}
            <b>→ User:9</b>
            {" }"}
          </span>
        </div>
        <div className="bs-norm-row">
          <span className="bs-norm-key mono">User:9</span>
          <span className="bs-norm-val mono">{'{ name: "Ada" }'}</span>
        </div>
        <p className="bs-norm-note">
          嵌套没了,对象各存一份,互相用<b>引用</b>相连。之后任何查询再遇到
          User:9,直接本地命中;一次 mutation 改了 Ada 的名字,
          所有引用她的界面同时更新 —— 一处存储,处处一致。
        </p>
      </div>
    </div>
  );
}
