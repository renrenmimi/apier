"use client";

// 第 09 章专属可视化:
//  - HeroOps:hero 里的「读 / 写 / 听」三操作循环。
//  - QueryAnatomy:一段满配 query(变量/别名/fragment/指令),点每一行看解释。
//  - SubscriptionFlow:订阅通道逐帧动画(建立 → 推送 → 再推送 → 取消)。
//  - ErrorAnatomy:一份「部分失败」的真实响应,点行看谁挂了、谁幸存。
//  - BubbleViz:非空字段出错向上冒泡的逐帧演示。
//  - CursorPager:Relay 风格 cursor 分页,一页页往后翻。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= HeroOps ================= */

const HERO_OPS = [
  { kw: "query", zh: "读", desc: "拉一份数据" },
  { kw: "mutation", zh: "写", desc: "改一次状态" },
  { kw: "subscription", zh: "听", desc: "事件来了推给我" },
];

export function HeroOps() {
  return (
    <div className="op-hero" aria-hidden>
      {HERO_OPS.map((o, i) => (
        <div className="op-hero-card" key={o.kw} style={{ animationDelay: `${i * 1.2}s` }}>
          <span className="op-hero-zh">{o.zh}</span>
          <span className="op-hero-kw">{o.kw}</span>
          <span className="op-hero-desc">{o.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* ================= QueryAnatomy ================= */

interface QaLine {
  code: string;
  indent: number;
  /** null = 装饰行(空行/收尾括号),不可点 */
  info: ReactNode | null;
  /** 部件标签,显示在信息面板上方 */
  tag?: string;
}

const QA_LINES: QaLine[] = [
  {
    code: "query PostPage($id: ID!, $withComments: Boolean!) {",
    indent: 0,
    tag: "操作类型 · 操作名 · 变量声明",
    info: (
      <>
        开场三件事:<code>query</code> 声明这是读操作;<code>PostPage</code>{" "}
        是你给这次操作起的名字,报错、日志、监控里全靠它认人;括号里是
        <b>变量声明</b>:<code>$id</code> 必须是 ID 且不能缺席(<code>!</code>
        ),<code>$withComments</code> 是布尔。变量的具体值不写在这里 ——
        它们随请求另附一份 JSON。
      </>
    ),
  },
  {
    code: "post(id: $id) {",
    indent: 1,
    tag: "字段参数 + 变量引用",
    info: (
      <>
        <code>post</code> 字段带了参数 <code>id</code>,值不是写死的字符串,
        是变量 <code>$id</code>。运行时服务器先检查类型对不对得上
        (声明的 <code>ID!</code>),再把值填进来。
      </>
    ),
  },
  {
    code: "...postFields",
    indent: 2,
    tag: "fragment 展开",
    info: (
      <>
        三个点的意思是「把 <code>postFields</code>{" "}
        这组字段原地铺开」。字段组本身定义在最底下 ——
        写一次,处处引用,改一处,全生效。
      </>
    ),
  },
  {
    code: "comments(first: 3) @include(if: $withComments) {",
    indent: 2,
    tag: "任意字段带参 + 指令",
    info: (
      <>
        两个重点。其一:参数不是顶层字段的特权,<b>任何字段都能带</b> ——
        这里让 <code>comments</code> 只给前 3 条。其二:
        <code>@include(if: $withComments)</code> 是指令(directive):
        变量为 true 才要这一块,为 false 整块跳过 ——
        一份查询伺候两种界面。它的镜像是 <code>@skip(if:)</code>:条件成立就不要。
      </>
    ),
  },
  {
    code: "body",
    indent: 3,
    tag: "标量字段(叶子)",
    info: (
      <>
        评论正文,一个普通的 String 字段。走到标量就到了叶子 ——
        选择集不能再往下嵌了。
      </>
    ),
  },
  {
    code: "author { name }",
    indent: 3,
    tag: "嵌套选择集",
    info: (
      <>
        评论的作者是个对象类型,所以必须继续往里选字段 —— 这里只要{" "}
        <code>name</code>。文章 → 评论 → 作者,三层关联一次要齐,
        REST 里这可能是三次往返。
      </>
    ),
  },
  { code: "}", indent: 2, info: null },
  { code: "}", indent: 1, info: null },
  {
    code: 'pinned: post(id: "1") {',
    indent: 1,
    tag: "别名(alias)",
    info: (
      <>
        <code>post</code> 字段第二次出场,这回参数写死为置顶文章的 id。
        问题来了:响应里的键默认就叫字段名,两个 <code>post</code>{" "}
        会打架。<code>pinned:</code> 给这一份改名 —— 响应里它就是{" "}
        <code>data.pinned</code>,上面那份是 <code>data.post</code>,井水不犯河水。
      </>
    ),
  },
  {
    code: "...postFields",
    indent: 2,
    tag: "fragment 复用",
    info: (
      <>
        同一个 fragment 又用了一次 —— 这就是它存在的理由:
        文章卡片、置顶位、搜索结果……哪个地方都要这组字段,
        谁也不用抄第二遍。
      </>
    ),
  },
  { code: "}", indent: 1, info: null },
  { code: "}", indent: 0, info: null },
  { code: "", indent: 0, info: null },
  {
    code: "fragment postFields on Post {",
    indent: 0,
    tag: "fragment 定义",
    info: (
      <>
        字段组的定义:名字叫 <code>postFields</code>,<code>on Post</code>{" "}
        规定它只能铺在 Post 类型上 —— 想把它铺到 User 上?校验直接报错。
        类型系统连「复制粘贴」都替你把关。
      </>
    ),
  },
  {
    code: "title",
    indent: 1,
    tag: "fragment 成员",
    info: (
      <>
        字段组的成员之一。产品经理说「所有文章卡片都加个阅读量」时,
        你只需要在这里加一行。
      </>
    ),
  },
  {
    code: "createdAt",
    indent: 1,
    tag: "fragment 成员",
    info: (
      <>
        发布时间。注意 fragment 里还可以继续嵌套选择集、带参数、用指令 ——
        工具箱里的家伙什,互相都能组合。
      </>
    ),
  },
  { code: "}", indent: 0, info: null },
];

export function QueryAnatomy() {
  const [sel, setSel] = useState(0);
  const line = QA_LINES[sel];

  return (
    <div className="op-qa">
      <div className="op-qa-win">
        <div className="codewin-bar">
          <span className="codewin-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="codewin-name">满配 query · 点每一行试试</span>
          <span style={{ width: 47 }} aria-hidden />
        </div>
        <div className="op-qa-body">
          {QA_LINES.map((l, i) =>
            l.info === null ? (
              <div
                key={i}
                className="op-qa-line dead"
                style={{ paddingLeft: 14 + l.indent * 22 }}
              >
                {l.code || " "}
              </div>
            ) : (
              <button
                key={i}
                type="button"
                className={`op-qa-line${sel === i ? " on" : ""}`}
                style={{ paddingLeft: 14 + l.indent * 22 }}
                onClick={() => setSel(i)}
              >
                {l.code}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="op-qa-info" aria-live="polite">
        {line.tag && <div className="op-qa-tag">{line.tag}</div>}
        <div className="op-qa-code">{line.code}</div>
        <p>{line.info}</p>
      </div>
    </div>
  );
}

/* ================= SubscriptionFlow ================= */

interface SubFrame {
  /** 通道状态:off 未建立 / on 已建立 / closed 已关闭 */
  channel: "off" | "on" | "closed";
  /** 在途包裹(从服务器推向客户端) */
  packet?: string;
  /** 客户端消息列表(累计收到的评论) */
  inbox: string[];
  /** 服务器侧事件提示 */
  event?: string;
  msg: ReactNode;
}

const SUB_FRAMES: SubFrame[] = [
  {
    channel: "off",
    inbox: [],
    msg: (
      <>
        客户端发起 <code>subscription {"{ newComment(postId: \"1\") … }"}</code>
        ,和服务器握手,把普通 HTTP 连接<b>升级</b>成一条保持打开的通道
        (通常是 WebSocket)。
      </>
    ),
  },
  {
    channel: "on",
    inbox: [],
    msg: (
      <>
        通道建好了(实线)。注意:没有事件时<b>双方都安静</b> ——
        不轮询、不空转,只是耳朵竖着。
      </>
    ),
  },
  {
    channel: "on",
    packet: 'newComment: "写得真好!"',
    event: "有人评论了 1 号文章",
    inbox: [],
    msg: (
      <>
        另一个用户给 1 号文章发了评论。服务器立刻把 <code>newComment</code>{" "}
        事件<b>推</b>过来 —— 数据的形状就是你订阅时选的那几个字段,
        客户端一个问题都没问。
      </>
    ),
  },
  {
    channel: "on",
    packet: 'newComment: "学到了,收藏"',
    event: "又来一条评论",
    inbox: ['"写得真好!" — Ada'],
    msg: (
      <>
        又一条评论,又一次推送。只要通道开着,事件就源源不断 ——
        这是一次订阅、多次响应,和 query 的「一问一答」根本不同。
      </>
    ),
  },
  {
    channel: "closed",
    inbox: ['"写得真好!" — Ada', '"学到了,收藏" — Linus'],
    msg: (
      <>
        用户离开页面,客户端<b>取消订阅</b>,通道关闭(虚线)。
        记得做这一步 —— 服务器为每条长连接都付着内存和心跳的房租。
      </>
    ),
  },
];

export function SubscriptionFlow() {
  const stepper = useStepper(SUB_FRAMES.length, 2000);
  const f = SUB_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">一条订阅的一生(逐帧慢放)</div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="op-sub">
            <div className="flow-node lit">
              <span className="ico">🖥️</span>
              客户端
              <div className="op-sub-inbox">
                {f.inbox.map((m, i) => (
                  <div className="op-sub-mail" key={i}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
            <div className={`op-sub-mid ${f.channel}`}>
              <div className="op-sub-line" />
              <span className="op-sub-label">
                {f.channel === "off" && "握手中…"}
                {f.channel === "on" && "WebSocket 通道 · 保持打开"}
                {f.channel === "closed" && "已关闭"}
              </span>
              {f.packet && <span className="flow-packet back op-sub-packet">{f.packet}</span>}
            </div>
            <div className={`flow-node${f.event ? " lit" : ""}`}>
              <span className="ico">🗄️</span>
              服务器
              {f.event && <div className="op-sub-event">⚡ {f.event}</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={SUB_FRAMES.length} />
    </div>
  );
}

/* ================= ErrorAnatomy ================= */

interface EaLine {
  code: string;
  indent: number;
  /** ok 幸存数据 / bad 出错相关 / 无 = 中性 */
  tone?: "ok" | "bad";
  info: ReactNode | null;
}

const EA_LINES: EaLine[] = [
  { code: "{", indent: 0, info: null },
  {
    code: '"data": {',
    indent: 1,
    tone: "ok",
    info: (
      <>
        <b>data 还在!</b>虽然下面有字段挂了,data 并没有整个变
        null —— 幸存的字段照常交货。这就是「部分成功(partial data)」,
        REST 的「要么全成要么全败」里没有这种中间态。
      </>
    ),
  },
  {
    code: '"post": {',
    indent: 2,
    tone: "ok",
    info: (
      <>
        post 本身查到了。它内部有字段出事,但 post 在 schema 里是可空的
        <code>comments: [Comment!]</code> 接住了 null,没让错误继续往上爬。
      </>
    ),
  },
  {
    code: '"title": "GraphQL 入门指南",',
    indent: 3,
    tone: "ok",
    info: (
      <>
        幸存者:title 的 resolver 跑得好好的,数据原样返回。
        界面上标题照常渲染,用户甚至可能感觉不到出过事。
      </>
    ),
  },
  {
    code: '"comments": null',
    indent: 3,
    tone: "bad",
    info: (
      <>
        事故现场:comments 的 resolver 挂了(比如评论服务超时)。
        这个字段被置成 null —— 具体死因不在这里,在楼下的 errors 里记着。
      </>
    ),
  },
  { code: "}", indent: 2, info: null },
  { code: "},", indent: 1, info: null },
  {
    code: '"errors": [',
    indent: 1,
    tone: "bad",
    info: (
      <>
        errors 数组:本次执行的事故台账,和 data <b>并列</b>存在。
        有几个字段出事,这里就有几条记录。注意:HTTP 状态码传统上还是
        200 —— 光看状态码,你会以为一切安好。
      </>
    ),
  },
  { code: "{", indent: 2, info: null },
  {
    code: '"message": "评论服务连接超时",',
    indent: 3,
    tone: "bad",
    info: (
      <>
        给人看的错误描述。生产环境注意别把堆栈、SQL
        这种内部细节漏出来 —— 攻击者最爱读别人的报错。
      </>
    ),
  },
  {
    code: '"locations": [{ "line": 5, "column": 5 }],',
    indent: 3,
    tone: "bad",
    info: (
      <>
        出事字段在<b>查询文本</b>里的行列号 ——
        方便你回头在自己写的 query 里定位到那一行。
      </>
    ),
  },
  {
    code: '"path": ["post", "comments"],',
    indent: 3,
    tone: "bad",
    info: (
      <>
        出事字段在<b>响应数据</b>里的路径:data.post.comments。
        前端拿它就能精确知道界面上哪一块该显示「加载失败,点击重试」,
        其它区域照常渲染。
      </>
    ),
  },
  {
    code: '"extensions": { "code": "INTERNAL_SERVER_ERROR" }',
    indent: 3,
    tone: "bad",
    info: (
      <>
        扩展信息,惯例在里面放机器可读的错误码(<code>code</code>)。
        REST 用 HTTP 状态码区分错误种类,GraphQL 的对应物就是它:
        <code>UNAUTHENTICATED</code>、<code>FORBIDDEN</code>、
        <code>BAD_USER_INPUT</code>……
      </>
    ),
  },
  { code: "}", indent: 2, info: null },
  { code: "]", indent: 1, info: null },
  { code: "}", indent: 0, info: null },
];

export function ErrorAnatomy() {
  const [sel, setSel] = useState(4);
  const line = EA_LINES[sel];

  return (
    <div className="op-qa">
      <div className="op-qa-win">
        <div className="codewin-bar">
          <span className="codewin-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="codewin-name">一份「部分失败」的响应 · 点行验尸</span>
          <span style={{ width: 47 }} aria-hidden />
        </div>
        <div className="op-qa-body">
          {EA_LINES.map((l, i) =>
            l.info === null ? (
              <div
                key={i}
                className="op-qa-line dead"
                style={{ paddingLeft: 14 + l.indent * 22 }}
              >
                {l.code}
              </div>
            ) : (
              <button
                key={i}
                type="button"
                className={`op-qa-line ${l.tone ?? ""}${sel === i ? " on" : ""}`}
                style={{ paddingLeft: 14 + l.indent * 22 }}
                onClick={() => setSel(i)}
              >
                {l.code}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="op-qa-info" aria-live="polite">
        {line.tone && (
          <div className={`op-qa-tag ${line.tone}`}>
            {line.tone === "ok" ? "✓ 幸存数据" : "✕ 事故相关"}
          </div>
        )}
        <div className="op-qa-code">{line.code}</div>
        <p>{line.info}</p>
      </div>
    </div>
  );
}

/* ================= BubbleViz ================= */

interface BubFrame {
  /** author 节点状态 */
  author: "ok" | "boom" | "null";
  /** title 节点状态 */
  title: "ok" | "gone";
  /** post 盒子状态 */
  post: "ok" | "null";
  /** 展示的 schema 行 */
  schema: string;
  result: string;
  msg: ReactNode;
}

const BUB_FRAMES: BubFrame[] = [
  {
    author: "boom",
    title: "ok",
    post: "ok",
    schema: "author: User!   # 非空",
    result: `"post": { "title": "…", "author": ? }`,
    msg: (
      <>
        执行到一半,<code>author</code> 字段的 resolver 抛了错(用户服务挂了)。
        title 已经查好了 —— 现在的问题是:author 这个坑怎么填?
      </>
    ),
  },
  {
    author: "null",
    title: "ok",
    post: "ok",
    schema: "author: User!   # 非空",
    result: `"author": null ← 违反 User! 的承诺`,
    msg: (
      <>
        正常流程是把出错字段置成 null。但 schema 写的是{" "}
        <code>User!</code> —— 这是「绝不给你 null」的承诺,null 放不进去。
      </>
    ),
  },
  {
    author: "null",
    title: "gone",
    post: "null",
    schema: "author: User!   # 非空",
    result: `"data": { "post": null }, "errors": [...]`,
    msg: (
      <>
        于是 null 向上<b>冒泡</b>:整个 post 被置成 null 交差 ——
        辛辛苦苦查好的 title 也陪葬了。errors 里的 path
        仍然指着真正的事发地 <code>["post", "author"]</code>。
      </>
    ),
  },
  {
    author: "null",
    title: "ok",
    post: "ok",
    schema: "author: User    # 可空",
    result: `"post": { "title": "…", "author": null }`,
    msg: (
      <>
        对照组:如果 schema 写的是可空的 <code>User</code>,null
        就地被接住,title 保住了。<b>非空(!)是把双刃剑</b>:
        它是对客户端的承诺,也是错误的放大器 —— 关键字段才用它。
      </>
    ),
  },
];

export function BubbleViz() {
  const stepper = useStepper(BUB_FRAMES.length, 2200);
  const f = BUB_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">非空字段出错:null 的冒泡之旅</div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="op-bub">
            <div className={`op-bub-box post ${f.post}`}>
              <div className="op-bub-name">post {f.post === "null" ? "= null" : ""}</div>
              <div className="op-bub-kids">
                <div className={`op-bub-box leaf ${f.title}`}>
                  <div className="op-bub-name">title</div>
                  <div className="op-bub-val">
                    {f.title === "ok" ? '"GraphQL 入门指南"' : "陪葬 ✝"}
                  </div>
                </div>
                <div className={`op-bub-box leaf ${f.author === "ok" ? "ok" : f.author}`}>
                  <div className="op-bub-name">author</div>
                  <div className="op-bub-val">
                    {f.author === "boom" ? "resolver 抛错 💥" : "null"}
                  </div>
                </div>
              </div>
            </div>
            <div className="op-bub-side">
              <div className="op-bub-schema mono">{f.schema}</div>
              <div className="op-bub-result mono">{f.result}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={BUB_FRAMES.length} />
    </div>
  );
}

/* ================= CursorPager ================= */

const PG_POSTS = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];

interface PgFrame {
  /** 本页窗口 [start, end)(-1 表示无) */
  win: [number, number];
  req: string;
  hasNext: boolean;
  endCursor: string;
  msg: ReactNode;
}

const PG_FRAMES: PgFrame[] = [
  {
    win: [0, 3],
    req: "posts(first: 3)",
    hasNext: true,
    endCursor: '"c3"',
    msg: (
      <>
        第一页:只带 <code>first: 3</code>,不带 <code>after</code>,
        从头开始。拿回 P1–P3,<code>pageInfo</code> 说:后面还有
        (hasNextPage: true),这页最后一条的书签是 <code>"c3"</code>。
      </>
    ),
  },
  {
    win: [3, 6],
    req: 'posts(first: 3, after: "c3")',
    hasNext: true,
    endCursor: '"c6"',
    msg: (
      <>
        翻页 = 把上一页的 <code>endCursor</code> 原样填进{" "}
        <code>after</code>:「从 c3 这个书签<b>之后</b>再给我 3 条」。
        拿回 P4–P6,新书签 <code>"c6"</code>。
      </>
    ),
  },
  {
    win: [6, 8],
    req: 'posts(first: 3, after: "c6")',
    hasNext: false,
    endCursor: '"c8"',
    msg: (
      <>
        再翻:只剩 P7、P8 两条了,没凑满 3 条也照给。这次{" "}
        <code>hasNextPage: false</code> —— 服务器明说:到底了。
      </>
    ),
  },
  {
    win: [-1, -1],
    req: "(停止请求)",
    hasNext: false,
    endCursor: '"c8"',
    msg: (
      <>
        看到 false 就收手,别再发请求。顺便记住:cursor 是<b>不透明书签</b>
        ,长得像乱码是故意的 —— 别解析它、别自己造,拿到什么原样带回来什么。
      </>
    ),
  },
];

export function CursorPager() {
  const stepper = useStepper(PG_FRAMES.length, 2200);
  const f = PG_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">Relay 风格 cursor 分页:一页页往后翻</div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="op-pg">
            <div className="op-pg-req mono">{f.req}</div>
            <div className="op-pg-row">
              {PG_POSTS.map((p, i) => (
                <div
                  key={p}
                  className={`cell${i >= f.win[0] && i < f.win[1] ? " lit" : ""}`}
                >
                  {p}
                </div>
              ))}
            </div>
            <div className="op-pg-info mono">
              pageInfo {"{"} hasNextPage:{" "}
              <b className={f.hasNext ? "yes" : "no"}>{String(f.hasNext)}</b>, endCursor:{" "}
              <b>{f.endCursor}</b> {"}"}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={PG_FRAMES.length} />
    </div>
  );
}
