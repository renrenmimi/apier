"use client";

// 第 09 章专属可视化(双语,英文默认):
//  - HeroOps:hero 里的「读 / 写 / 听」三操作循环。
//  - QueryAnatomy:一段用满工具箱的 query,点每一行看解释。
//  - SubscriptionFlow:订阅连接逐帧动画(建立 → 推送 → 再推送 → 取消)。
//  - ErrorAnatomy:一份「部分结果」的响应,点行看哪些字段还在、哪些失败了。
//  - BubbleViz:非空字段失败时 null 向上移动的逐帧演示。
//  - CursorPager:Relay 风格 cursor 分页,一页页往后翻。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroOps ================= */

const HERO_OPS: { kw: string; word: ReactNode; desc: ReactNode }[] = [
  {
    kw: "query",
    word: <T en="Read" zh="读" />,
    desc: <T en="Fetch data once" zh="拉一份数据" />,
  },
  {
    kw: "mutation",
    word: <T en="Write" zh="写" />,
    desc: <T en="Change the state" zh="改一次状态" />,
  },
  {
    kw: "subscription",
    word: <T en="Subscribe" zh="听" />,
    desc: <T en="Receive events as they happen" zh="事件来了就送过来" />,
  },
];

export function HeroOps() {
  return (
    <div className="op-hero" aria-hidden>
      {HERO_OPS.map((o, i) => (
        <div
          className="op-hero-card"
          key={o.kw}
          style={{ animationDelay: `${i * 1.2}s` }}
        >
          <span className="op-hero-word">{o.word}</span>
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
  tag?: ReactNode;
}

const QA_LINES: QaLine[] = [
  {
    code: "query PostPage($id: ID!, $withComments: Boolean!) {",
    indent: 0,
    tag: (
      <T
        en="Operation type · name · variables"
        zh="操作类型 · 操作名 · 变量声明"
      />
    ),
    info: (
      <T
        en={
          <>
            Three things on one line. <code>query</code> says this operation
            reads. <code>PostPage</code> is the operation name, which is what
            errors, logs, and monitoring will show. The parentheses hold the{" "}
            <b>variable declarations</b>: <code>$id</code> must be an{" "}
            <code>ID</code> and cannot be omitted (that is the <code>!</code>),
            and <code>$withComments</code> is a boolean. The values are not
            written here — they travel with the request as a separate JSON
            object.
          </>
        }
        zh={
          <>
            一行里有三件事。<code>query</code> 说明这是读操作。
            <code>PostPage</code> 是操作名,报错、日志和监控里显示的就是它。
            括号里是<b>变量声明</b>:<code>$id</code> 必须是 <code>ID</code>{" "}
            且不能缺省(那个 <code>!</code>),<code>$withComments</code>{" "}
            是布尔值。值不写在这里 —— 它们作为另一份 JSON 随请求一起发送。
          </>
        }
      />
    ),
  },
  {
    code: "post(id: $id) {",
    indent: 1,
    tag: <T en="Field argument + variable" zh="字段参数 + 变量引用" />,
    info: (
      <T
        en={
          <>
            The <code>post</code> field takes an argument named{" "}
            <code>id</code>. Its value is not a fixed string; it is the variable{" "}
            <code>$id</code>. Before execution the server checks that the
            supplied value matches the declared type <code>ID!</code>, then
            passes it in.
          </>
        }
        zh={
          <>
            <code>post</code> 字段带了一个名为 <code>id</code> 的参数。
            它的值不是写死的字符串,而是变量 <code>$id</code>。
            执行之前,服务器先检查传来的值是否符合声明的类型{" "}
            <code>ID!</code>,再把它传进去。
          </>
        }
      />
    ),
  },
  {
    code: "...postFields",
    indent: 2,
    tag: <T en="Fragment spread" zh="fragment 展开" />,
    info: (
      <T
        en={
          <>
            Three dots mean &quot;insert the selection set named{" "}
            <code>postFields</code> here&quot;. The selection set itself is
            defined at the bottom of the document. Written once, spread
            anywhere, edited in one place.
          </>
        }
        zh={
          <>
            三个点的意思是「把名为 <code>postFields</code>{" "}
            的选择集插到这里」。选择集本身定义在文档最下面。
            写一次,处处展开,只改一处。
          </>
        }
      />
    ),
  },
  {
    code: "comments(first: 3) @include(if: $withComments) {",
    indent: 2,
    tag: <T en="Nested argument + directive" zh="嵌套字段的参数 + 指令" />,
    info: (
      <T
        en={
          <>
            Two points here. First, arguments are not limited to the top-level
            field: the schema declares them wherever it wants, and here{" "}
            <code>comments</code> takes <code>first: 3</code>. Second,{" "}
            <code>@include(if: $withComments)</code> is a directive. When the
            variable is true this block is part of the request; when it is
            false the whole block is left out. Its mirror image is{" "}
            <code>@skip(if:)</code>, which removes the field when the condition
            is true.
          </>
        }
        zh={
          <>
            这里有两个点。其一,参数不是顶层字段的专利:
            schema 想在哪一层声明就在哪一层声明,这里 <code>comments</code>{" "}
            带了 <code>first: 3</code>。其二,
            <code>@include(if: $withComments)</code> 是指令:
            变量为 true 时这一块属于本次请求,为 false 时整块被排除。
            它的镜像是 <code>@skip(if:)</code>,条件为 true 时移除该字段。
          </>
        }
      />
    ),
  },
  {
    code: "body",
    indent: 3,
    tag: <T en="Scalar field (a leaf)" zh="标量字段(叶子)" />,
    info: (
      <T
        en={
          <>
            The text of the comment, an ordinary <code>String</code> field. A
            scalar is a leaf: it holds a single value, so it cannot have a
            selection set of its own.
          </>
        }
        zh={
          <>
            评论正文,一个普通的 <code>String</code> 字段。
            标量就是叶子:它只装一个值,所以不能再带自己的选择集。
          </>
        }
      />
    ),
  },
  {
    code: "author { name }",
    indent: 3,
    tag: <T en="Nested selection set" zh="嵌套选择集" />,
    info: (
      <T
        en={
          <>
            The author of a comment is an object type, so it must have a
            selection set — here only <code>name</code>. Post, comment, author:
            three levels of related data in one request. In REST this would
            usually be three round trips.
          </>
        }
        zh={
          <>
            评论的作者是对象类型,所以必须带选择集 —— 这里只要 <code>name</code>
            。文章、评论、作者,三层关联数据在一次请求里取齐。
            在 REST 里,这通常是三趟往返。
          </>
        }
      />
    ),
  },
  { code: "}", indent: 2, info: null },
  { code: "}", indent: 1, info: null },
  {
    code: 'pinned: post(id: "1") {',
    indent: 1,
    tag: <T en="Alias" zh="别名(alias)" />,
    info: (
      <T
        en={
          <>
            The <code>post</code> field appears a second time, this time with a
            fixed id. That creates a problem: response keys are field names by
            default, so both results would want the key <code>post</code>. The
            alias <code>pinned:</code> renames this one. In the response it
            becomes <code>data.pinned</code>, while the first one stays{" "}
            <code>data.post</code>.
          </>
        }
        zh={
          <>
            <code>post</code> 字段第二次出现,这回用的是写死的 id。
            问题来了:响应的键默认就是字段名,两份结果都想占 <code>post</code>{" "}
            这个键。别名 <code>pinned:</code> 给这一份改名 ——
            响应里它是 <code>data.pinned</code>,上面那份仍是{" "}
            <code>data.post</code>。
          </>
        }
      />
    ),
  },
  {
    code: "...postFields",
    indent: 2,
    tag: <T en="Fragment reused" zh="fragment 复用" />,
    info: (
      <T
        en={
          <>
            The same fragment again. This is the point of naming it: the post
            card, the pinned slot, and the search results all need this group of
            fields, and none of them repeats it.
          </>
        }
        zh={
          <>
            同一个 fragment 又用了一次。这正是给它起名的意义:
            文章卡片、置顶位、搜索结果都要这组字段,谁也不用抄第二遍。
          </>
        }
      />
    ),
  },
  { code: "}", indent: 1, info: null },
  { code: "}", indent: 0, info: null },
  { code: "", indent: 0, info: null },
  {
    code: "fragment postFields on Post {",
    indent: 0,
    tag: <T en="Fragment definition" zh="fragment 定义" />,
    info: (
      <T
        en={
          <>
            The definition of the selection set. Its name is{" "}
            <code>postFields</code>, and <code>on Post</code> is the type
            condition: it may only be spread where a <code>Post</code> is being
            selected. Spread it on a <code>User</code> and validation rejects
            the document before execution starts.
          </>
        }
        zh={
          <>
            选择集的定义。名字是 <code>postFields</code>,<code>on Post</code>{" "}
            是类型条件:它只能展开在正在选取 <code>Post</code> 的位置上。
            展开到 <code>User</code> 上,校验会在执行开始前就拒绝这份文档。
          </>
        }
      />
    ),
  },
  {
    code: "title",
    indent: 1,
    tag: <T en="Fragment member" zh="fragment 成员" />,
    info: (
      <T
        en={
          <>
            One of the fields in the group. When the product team asks for a
            view count on every post card, you add one line here and every
            spread of this fragment gets it.
          </>
        }
        zh={
          <>
            字段组的成员之一。产品要给所有文章卡片加个阅读量时,
            你在这里加一行,所有展开这个 fragment 的地方都有了。
          </>
        }
      />
    ),
  },
  {
    code: "createdAt",
    indent: 1,
    tag: <T en="Fragment member" zh="fragment 成员" />,
    info: (
      <T
        en={
          <>
            The publication time. Note that a fragment is a normal selection
            set: the fields inside it can take arguments, carry directives, and
            nest further. The five tools combine freely.
          </>
        }
        zh={
          <>
            发布时间。注意 fragment 就是一个普通的选择集:
            里面的字段照样可以带参数、带指令、继续嵌套。五样工具可以自由组合。
          </>
        }
      />
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
          <span className="codewin-name">
            <T
              en="All five tools · click any line"
              zh="五样工具全用上 · 点任意一行"
            />
          </span>
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
  /** 连接状态:off 未建立 / on 已建立 / closed 已关闭 */
  channel: "off" | "on" | "closed";
  /** 在途消息(从服务器推向客户端) */
  packet?: string;
  /** 客户端已收到的消息列表 */
  inbox: string[];
  /** 服务器侧发生的事件 */
  event?: ReactNode;
  msg: ReactNode;
}

const SUB_FRAMES: SubFrame[] = [
  {
    channel: "off",
    inbox: [],
    msg: (
      <T
        en={
          <>
            The client sends{" "}
            <code>subscription {'{ newComment(postId: "1") … }'}</code> and
            negotiates a connection that will stay open, usually a WebSocket.
            The subscription is registered on the server.
          </>
        }
        zh={
          <>
            客户端发出{" "}
            <code>subscription {'{ newComment(postId: "1") … }'}</code>,
            协商建立一条会保持打开的连接,通常是 WebSocket。
            服务器上登记下这条订阅。
          </>
        }
      />
    ),
  },
  {
    channel: "on",
    inbox: [],
    msg: (
      <T
        en={
          <>
            The connection is open (solid line). Note what happens while there
            is no event: <b>nothing</b>. Neither side sends anything, and the
            client is not polling.
          </>
        }
        zh={
          <>
            连接已建立(实线)。注意没有事件时会发生什么:<b>什么都不发生</b>。
            双方都不发消息,客户端也没有在轮询。
          </>
        }
      />
    ),
  },
  {
    channel: "on",
    packet: 'newComment: "Clear explanation, thanks."',
    event: <T en="Someone commented on post 1" zh="有人评论了 1 号文章" />,
    inbox: [],
    msg: (
      <T
        en={
          <>
            Another user comments on post 1. The server immediately sends the{" "}
            <code>newComment</code> result over the open connection. Its shape
            is the selection set you wrote when you subscribed. The client asked
            for nothing at this moment.
          </>
        }
        zh={
          <>
            另一个用户评论了 1 号文章。服务器立刻通过这条打开的连接把{" "}
            <code>newComment</code> 的结果发过来。
            它的形状就是你订阅时写下的那个选择集。这一刻客户端什么都没问。
          </>
        }
      />
    ),
  },
  {
    channel: "on",
    packet: 'newComment: "Saved for later."',
    event: <T en="Another comment arrives" zh="又来了一条评论" />,
    inbox: ['"Clear explanation, thanks." — Ada'],
    msg: (
      <T
        en={
          <>
            Another comment, another message. As long as the connection is open,
            every matching event produces one more result. One subscription,
            many results — that is what makes it different from a query.
          </>
        }
        zh={
          <>
            又一条评论,又一条消息。只要连接开着,
            每次匹配的事件都会再产生一个结果。一次订阅,多次结果 ——
            这就是它和 query 的根本区别。
          </>
        }
      />
    ),
  },
  {
    channel: "closed",
    inbox: ['"Clear explanation, thanks." — Ada', '"Saved for later." — Linus'],
    msg: (
      <T
        en={
          <>
            The user leaves the page and the client <b>unsubscribes</b>, which
            closes the connection (dashed line). Do this step. Every open
            connection costs the server memory and heartbeat messages for as
            long as it lasts.
          </>
        }
        zh={
          <>
            用户离开页面,客户端<b>取消订阅</b>,连接随之关闭(虚线)。
            这一步一定要做:每条打开的连接,只要还开着,
            就一直在占用服务器的内存和心跳消息。
          </>
        }
      />
    ),
  },
];

export function SubscriptionFlow() {
  const stepper = useStepper(SUB_FRAMES.length, 2000);
  const f = SUB_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="The life of one subscription, frame by frame"
          zh="一条订阅的一生(逐帧慢放)"
        />
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="op-sub">
            <div className="flow-node lit">
              <span className="ico">🖥️</span>
              <T en="Client" zh="客户端" />
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
                {f.channel === "off" && (
                  <T en="Opening…" zh="正在建立…" />
                )}
                {f.channel === "on" && (
                  <T
                    en="WebSocket · stays open"
                    zh="WebSocket 连接 · 保持打开"
                  />
                )}
                {f.channel === "closed" && <T en="Closed" zh="已关闭" />}
              </span>
              {f.packet && (
                <span className="flow-packet back op-sub-packet">
                  {f.packet}
                </span>
              )}
            </div>
            <div className={`flow-node${f.event ? " lit" : ""}`}>
              <span className="ico">🗄️</span>
              <T en="Server" zh="服务器" />
              {f.event && <div className="op-sub-event">⚡ {f.event}</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls
        stepper={stepper}
        step={stepper.step}
        total={SUB_FRAMES.length}
      />
    </div>
  );
}

/* ================= ErrorAnatomy ================= */

interface EaLine {
  code: string;
  indent: number;
  /** ok 成功返回的数据 / bad 与失败相关 / 无 = 中性 */
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
      <T
        en={
          <>
            <b>data is still here.</b> One field below failed, but{" "}
            <code>data</code> did not become <code>null</code> — the fields that
            succeeded are returned as usual. This is a{" "}
            <b>partial result</b>, and REST has no middle state like it.
          </>
        }
        zh={
          <>
            <b>data 还在。</b>下面有一个字段失败了,但 <code>data</code>{" "}
            并没有整个变成 <code>null</code> —— 成功的字段照常返回。
            这就是<b>部分结果</b>,REST 里没有这种中间状态。
          </>
        }
      />
    ),
  },
  {
    code: '"post": {',
    indent: 2,
    tone: "ok",
    info: (
      <T
        en={
          <>
            The post itself was returned. A field inside it failed, but the
            schema declares <code>comments: [Comment!]</code> — the list itself
            has no trailing <code>!</code>, so <code>null</code> is allowed
            there. The failure stops at that field and does not move up.
          </>
        }
        zh={
          <>
            post 本身返回了。它内部有个字段失败,但 schema 里声明的是{" "}
            <code>comments: [Comment!]</code> —— 列表本身后面没有{" "}
            <code>!</code>,所以那个位置允许 <code>null</code>。
            失败止步于该字段,不会继续向上。
          </>
        }
      />
    ),
  },
  {
    code: '"title": "Meeting GraphQL",',
    indent: 3,
    tone: "ok",
    info: (
      <T
        en={
          <>
            A field that succeeded: the resolver for <code>title</code> ran
            normally and its value is returned unchanged. The page can render
            the title even though part of the request failed.
          </>
        }
        zh={
          <>
            成功的字段:<code>title</code> 的 resolver 正常执行,
            值原样返回。即使这次请求有一部分失败了,页面照样能渲染标题。
          </>
        }
      />
    ),
  },
  {
    code: '"comments": null',
    indent: 3,
    tone: "bad",
    info: (
      <T
        en={
          <>
            The failure: the resolver for <code>comments</code> threw an error,
            for example because the comment service timed out. The field is set
            to <code>null</code>. The reason is not stored here — it is in the{" "}
            <code>errors</code> array below.
          </>
        }
        zh={
          <>
            失败点:<code>comments</code> 的 resolver 抛了错,
            比如评论服务超时。这个字段被置为 <code>null</code>。
            原因不放在这里 —— 它在下面的 <code>errors</code> 数组里。
          </>
        }
      />
    ),
  },
  { code: "}", indent: 2, info: null },
  { code: "},", indent: 1, info: null },
  {
    code: '"errors": [',
    indent: 1,
    tone: "bad",
    info: (
      <T
        en={
          <>
            The <code>errors</code> array records what went wrong during this
            execution, and it sits <b>next to</b> <code>data</code>, not instead
            of it. One entry per failure. Note that the HTTP status code is
            traditionally still <code>200</code>: the status code alone would
            tell you everything is fine.
          </>
        }
        zh={
          <>
            <code>errors</code> 数组记录本次执行中出的问题,
            它和 <code>data</code> <b>并排</b>存在,不是二选一。
            失败几处就有几条记录。注意 HTTP 状态码传统上仍是 <code>200</code>:
            只看状态码,你会以为一切正常。
          </>
        }
      />
    ),
  },
  { code: "{", indent: 2, info: null },
  {
    code: '"message": "Comment service timed out",',
    indent: 3,
    tone: "bad",
    info: (
      <T
        en={
          <>
            A description for a human reader. In production, keep internal
            details such as stack traces and SQL out of this string — error
            messages are one of the first places an attacker looks.
          </>
        }
        zh={
          <>
            给人读的错误描述。生产环境里别把堆栈、SQL
            这类内部细节写进这个字符串 —— 报错信息是攻击者最先翻的地方之一。
          </>
        }
      />
    ),
  },
  {
    code: '"locations": [{ "line": 5, "column": 5 }],',
    indent: 3,
    tone: "bad",
    info: (
      <T
        en={
          <>
            Where the failing field sits in the <b>query text</b>: line and
            column. This helps you find the exact line in the document you sent.
          </>
        }
        zh={
          <>
            失败字段在<b>查询文本</b>里的位置:行号和列号。
            它帮你在自己发出的文档里定位到具体那一行。
          </>
        }
      />
    ),
  },
  {
    code: '"path": ["post", "comments"],',
    indent: 3,
    tone: "bad",
    info: (
      <T
        en={
          <>
            Where the failing field sits in the <b>response data</b>:{" "}
            <code>data.post.comments</code>. The client can use this to show
            &quot;could not load, retry&quot; on exactly that part of the screen
            and render the rest normally.
          </>
        }
        zh={
          <>
            失败字段在<b>响应数据</b>里的路径:<code>data.post.comments</code>。
            客户端据此可以只在界面的那一块显示「加载失败,点击重试」,
            其余部分照常渲染。
          </>
        }
      />
    ),
  },
  {
    code: '"extensions": { "code": "INTERNAL_SERVER_ERROR" }',
    indent: 3,
    tone: "bad",
    info: (
      <T
        en={
          <>
            <code>extensions</code> is the place for anything extra. By
            convention servers put a machine-readable error code in it. REST
            distinguishes kinds of failure with the HTTP status code; this is
            the GraphQL equivalent: <code>UNAUTHENTICATED</code>,{" "}
            <code>FORBIDDEN</code>, <code>BAD_USER_INPUT</code>. The codes are a
            convention, not part of the specification, so check the server you
            are calling.
          </>
        }
        zh={
          <>
            <code>extensions</code> 用来放任何附加信息,
            惯例是在里面放一个机器可读的错误码。REST 用 HTTP
            状态码区分错误种类,GraphQL 里对应的就是它:
            <code>UNAUTHENTICATED</code>、<code>FORBIDDEN</code>、
            <code>BAD_USER_INPUT</code>。这些码是惯例,不是规范的一部分,
            所以要看你调用的那个服务器怎么定。
          </>
        }
      />
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
          <span className="codewin-name">
            <T
              en="A partial result · click any line"
              zh="一份「部分结果」响应 · 点任意一行"
            />
          </span>
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
            {line.tone === "ok" ? (
              <T en="✓ Returned" zh="✓ 成功返回" />
            ) : (
              <T en="✕ Failure" zh="✕ 失败相关" />
            )}
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
  /** 展示的 schema 行(只有注释需要双语) */
  schema: Loc<string>;
  result: Loc<string>;
  msg: ReactNode;
}

const BUB_FRAMES: BubFrame[] = [
  {
    author: "boom",
    title: "ok",
    post: "ok",
    schema: { en: "author: User!   # non-null", zh: "author: User!   # 非空" },
    result: `"post": { "title": "…", "author": ? }`,
    msg: (
      <T
        en={
          <>
            Half way through execution, the resolver for <code>author</code>{" "}
            throws an error — say the user service is down.{" "}
            <code>title</code> is already resolved. The question is what to put
            in the <code>author</code> position.
          </>
        }
        zh={
          <>
            执行到一半,<code>author</code> 字段的 resolver 抛了错 ——
            比如用户服务挂了。<code>title</code> 已经解析好了。
            现在的问题是:<code>author</code> 这个位置该放什么。
          </>
        }
      />
    ),
  },
  {
    author: "null",
    title: "ok",
    post: "ok",
    schema: { en: "author: User!   # non-null", zh: "author: User!   # 非空" },
    result: {
      en: `"author": null ← breaks the User! promise`,
      zh: `"author": null ← 违背了 User! 的承诺`,
    },
    msg: (
      <T
        en={
          <>
            Normally a failed field is set to <code>null</code>. But the schema
            says <code>User!</code>, which promises this position will never
            hold <code>null</code>. So <code>null</code> cannot go there.
          </>
        }
        zh={
          <>
            正常做法是把失败的字段置为 <code>null</code>。但 schema 写的是{" "}
            <code>User!</code>,这个承诺说该位置绝不会是 <code>null</code>。
            所以 <code>null</code> 放不进去。
          </>
        }
      />
    ),
  },
  {
    author: "null",
    title: "gone",
    post: "null",
    schema: { en: "author: User!   # non-null", zh: "author: User!   # 非空" },
    result: `"data": { "post": null }, "errors": [...]`,
    msg: (
      <T
        en={
          <>
            So the <code>null</code> moves up to the nearest parent that allows
            it: the whole <code>post</code> becomes <code>null</code>, and the{" "}
            <code>title</code> that was already resolved is discarded with it.
            The <code>path</code> in <code>errors</code> still points at the
            real cause, <code>[&quot;post&quot;, &quot;author&quot;]</code>.
          </>
        }
        zh={
          <>
            于是 <code>null</code> 向上移动到最近的、允许为空的父字段:
            整个 <code>post</code> 变成 <code>null</code>,
            已经解析好的 <code>title</code> 也随之丢弃。
            <code>errors</code> 里的 <code>path</code> 仍然指向真正的原因:
            <code>[&quot;post&quot;, &quot;author&quot;]</code>。
          </>
        }
      />
    ),
  },
  {
    author: "null",
    title: "ok",
    post: "ok",
    schema: { en: "author: User    # nullable", zh: "author: User    # 可空" },
    result: `"post": { "title": "…", "author": null }`,
    msg: (
      <T
        en={
          <>
            For comparison: if the schema declared a nullable{" "}
            <code>User</code>, the <code>null</code> stops right there and{" "}
            <code>title</code> survives. <code>!</code> works in two directions
            at once. It is a guarantee the client can rely on, and it widens the
            damage when a field fails. Use it where the guarantee is worth that.
          </>
        }
        zh={
          <>
            作对照:如果 schema 声明的是可空的 <code>User</code>,
            <code>null</code> 就地停下,<code>title</code> 保住了。
            <code>!</code> 同时朝两个方向起作用:
            它是客户端可以依赖的保证,也会在字段失败时扩大影响面。
            值得为这个保证付出代价的地方,才用它。
          </>
        }
      />
    ),
  },
];

export function BubbleViz() {
  const L = useL();
  const stepper = useStepper(BUB_FRAMES.length, 2200);
  const f = BUB_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="A non-null field fails: where the null goes"
          zh="非空字段失败:null 往哪里去"
        />
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="op-bub">
            <div className={`op-bub-box post ${f.post}`}>
              <div className="op-bub-name">
                post {f.post === "null" ? "= null" : ""}
              </div>
              <div className="op-bub-kids">
                <div className={`op-bub-box leaf ${f.title}`}>
                  <div className="op-bub-name">title</div>
                  <div className="op-bub-val">
                    {f.title === "ok" ? (
                      '"Meeting GraphQL"'
                    ) : (
                      <T en="discarded" zh="一并丢弃" />
                    )}
                  </div>
                </div>
                <div
                  className={`op-bub-box leaf ${f.author === "ok" ? "ok" : f.author}`}
                >
                  <div className="op-bub-name">author</div>
                  <div className="op-bub-val">
                    {f.author === "boom" ? (
                      <T en="resolver threw 💥" zh="resolver 抛错 💥" />
                    ) : (
                      "null"
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="op-bub-side">
              <div className="op-bub-schema mono">{L(f.schema)}</div>
              <div className="op-bub-result mono">{L(f.result)}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls
        stepper={stepper}
        step={stepper.step}
        total={BUB_FRAMES.length}
      />
    </div>
  );
}

/* ================= CursorPager ================= */

const PG_POSTS = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];

interface PgFrame {
  /** 本页窗口 [start, end)(-1 表示无) */
  win: [number, number];
  req: ReactNode;
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
      <T
        en={
          <>
            The first page: <code>first: 3</code> and no <code>after</code>, so
            the server starts at the beginning. It returns P1–P3.{" "}
            <code>pageInfo</code> reports that more items exist
            (<code>hasNextPage: true</code>) and that the bookmark for the last
            item on this page is <code>&quot;c3&quot;</code>.
          </>
        }
        zh={
          <>
            第一页:只有 <code>first: 3</code>,没有 <code>after</code>,
            所以服务器从头开始。返回 P1–P3。<code>pageInfo</code>{" "}
            告诉你后面还有(<code>hasNextPage: true</code>),
            本页最后一条的书签是 <code>&quot;c3&quot;</code>。
          </>
        }
      />
    ),
  },
  {
    win: [3, 6],
    req: 'posts(first: 3, after: "c3")',
    hasNext: true,
    endCursor: '"c6"',
    msg: (
      <T
        en={
          <>
            Turning the page means putting the previous{" "}
            <code>endCursor</code> into <code>after</code> unchanged: &quot;give
            me 3 more items <b>after</b> the bookmark c3&quot;. Back come P4–P6,
            with a new bookmark <code>&quot;c6&quot;</code>.
          </>
        }
        zh={
          <>
            翻页就是把上一页的 <code>endCursor</code> 原样填进{" "}
            <code>after</code>:「从书签 c3 <b>之后</b>再给我 3 条」。
            返回 P4–P6,新书签是 <code>&quot;c6&quot;</code>。
          </>
        }
      />
    ),
  },
  {
    win: [6, 8],
    req: 'posts(first: 3, after: "c6")',
    hasNext: false,
    endCursor: '"c8"',
    msg: (
      <T
        en={
          <>
            Once more: only P7 and P8 are left. Fewer than 3 items is fine — the
            server returns what it has. This time{" "}
            <code>hasNextPage: false</code>, which is the server saying there is
            nothing after this.
          </>
        }
        zh={
          <>
            再翻一次:只剩 P7、P8 两条。不足 3 条也没关系,服务器有多少给多少。
            这次 <code>hasNextPage: false</code> ——
            服务器明确告诉你,后面没有了。
          </>
        }
      />
    ),
  },
  {
    win: [-1, -1],
    req: <T en="(no more requests)" zh="(停止请求)" />,
    hasNext: false,
    endCursor: '"c8"',
    msg: (
      <T
        en={
          <>
            When you see <code>false</code>, stop sending requests. And remember
            what a cursor is: an <b>opaque bookmark</b>. It looks like nonsense
            on purpose. Do not parse it and do not build one yourself — send
            back exactly what you received.
          </>
        }
        zh={
          <>
            看到 <code>false</code> 就别再发请求了。
            另外记住 cursor 是什么:一个<b>不透明书签</b>,
            长得像乱码是故意的。别解析它,也别自己造 —— 收到什么就原样送回什么。
          </>
        }
      />
    ),
  },
];

export function CursorPager() {
  const stepper = useStepper(PG_FRAMES.length, 2200);
  const f = PG_FRAMES[stepper.step];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Relay-style cursor pagination, one page at a time"
          zh="Relay 风格 cursor 分页:一页页往后翻"
        />
      </div>
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
              <b className={f.hasNext ? "yes" : "no"}>{String(f.hasNext)}</b>,
              endCursor: <b>{f.endCursor}</b> {"}"}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls
        stepper={stepper}
        step={stepper.step}
        total={PG_FRAMES.length}
      />
    </div>
  );
}
