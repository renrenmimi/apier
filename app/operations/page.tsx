"use client";

// 第 09 章 · 查询、变更与订阅:
// 读/写/听比喻 → Query 进阶工具箱(参数/别名/fragment/变量/指令 + 解剖台)→
// Mutation 三件套与串行冷知识 → Subscription 通道动画 →
// { data, errors } 与部分成功 → Relay cursor 分页 → 动手任务 → 测验 → 要点。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/operations-data";
import {
  HeroOps,
  QueryAnatomy,
  SubscriptionFlow,
  ErrorAnatomy,
  BubbleViz,
  CursorPager,
} from "./viz";

export default function OperationsPage() {
  return (
    <main className="page" data-ch="operations">
      <Hero
        ch="operations"
        title={
          <>
            查询、变更<span className="grad">与订阅</span>
          </>
        }
        essence={
          <>
            人跟世界打交道就三种方式:看一眼(读)、动个手(写)、竖起耳朵(听)。
            GraphQL 也一样 —— query 读、mutation 写、subscription 听,没有第四种。
          </>
        }
        chips={[
          { id: "toolbox", n: "01", label: "Query 工具箱" },
          { id: "mutation", n: "02", label: "Mutation" },
          { id: "subscription", n: "03", label: "Subscription" },
          { id: "errors", n: "04", label: "错误处理" },
          { id: "pagination", n: "05", label: "分页" },
          { id: "labs", n: "06", label: "动手" },
          { id: "quiz", n: "07", label: "测验" },
        ]}
      >
        <HeroOps />
      </Hero>

      {/* ================= §01 Query 工具箱 ================= */}
      <Section
        id="toolbox"
        index="01"
        title="Query 进阶工具箱"
        desc="第 07 章你已经会写最朴素的 query 了。这一节发装备:五样小工具,把「点菜」这件事做到真实项目的水准。"
      >
        <div className="op-tool">
          <div className="op-tool-head">
            <span className="op-tool-num">工具 1</span>
            <h3 className="op-tool-title">字段参数:不只顶层,任何字段都能带</h3>
          </div>
          <p>
            很多人以为参数是 <code>post(id: "1")</code> 这种顶层字段的专利。
            不是 —— <b>选择集里的任何一层字段都可以带参数</b>。
            「这篇文章的评论,只要前 3 条」,一个参数的事:
          </p>
          <CodeBlock
            lang="graphql"
            title="任意字段带参"
            hl={[3]}
            code={`{
  post(id: "1") {
    title
    comments(first: 3) {
      body
    }
  }
}`}
          />
        </div>

        <div className="op-tool">
          <div className="op-tool-head">
            <span className="op-tool-num">工具 2</span>
            <h3 className="op-tool-title">别名:同一道菜,点两份不同做法</h3>
          </div>
          <p>
            响应里的键默认就是字段名。那要是同一个字段带<b>不同参数</b>要两份呢?
            两个 <code>post</code> 键会撞车。别名(alias)出场:
            冒号前面写你想要的名字,响应就按这个名字交货。
          </p>
          <CodePair
            left={
              <CodeBlock
                lang="graphql"
                title="query · 一次要两篇"
                hl={[2, 3]}
                code={`{
  latest: post(id: "42") { title }
  pinned: post(id: "1") { title }
}`}
              />
            }
            right={
              <CodeBlock
                lang="json"
                title="响应 · 各回各家"
                code={`{
  "data": {
    "latest": { "title": "GraphQL 上手记" },
    "pinned": { "title": "社区公约" }
  }
}`}
              />
            }
          />
        </div>

        <div className="op-tool">
          <div className="op-tool-head">
            <span className="op-tool-num">工具 3</span>
            <h3 className="op-tool-title">fragment:可复用的字段组</h3>
          </div>
          <p>
            文章列表页、文章详情页、搜索结果页 ——
            这几个页面都要同一组文章字段。抄三遍?改需求的时候你会哭。
            片段(fragment)让这组字段<b>只写一遍</b>,谁要谁展开:
          </p>
          <CodeBlock
            lang="graphql"
            title="fragment · 写一次,处处用"
            hl={[1, 8, 9]}
            code={`fragment postFields on Post {
  id
  title
  createdAt
}

{
  feed: posts(first: 10) { ...postFields }
  pinned: post(id: "1") { ...postFields }
}`}
            note={
              <>
                <b>on Post</b> 是类型约束:这组字段只能铺在 Post 上,
                铺错地方校验直接拦下。产品经理说「所有文章卡片加个阅读量」——
                你只改 fragment 一处。
              </>
            }
          />
        </div>

        <div className="op-tool">
          <div className="op-tool-head">
            <span className="op-tool-num">工具 4</span>
            <h3 className="op-tool-title">变量:动态值的正确打开方式</h3>
          </div>
          <p>
            用户点开哪篇文章是运行时才知道的事。新手的第一反应是拼字符串 ——
            <b>打住,这是坑</b>。跟 SQL 拼接会招来注入攻击一模一样:
            用户输入一旦混进查询文本,它就不再是「数据」,而是能改写查询结构的「代码」。
          </p>
          <CodePair
            left={
              <CodeBlock
                lang="js"
                title="❌ 字符串拼接"
                code={`// 用户输入直接进了查询文本
const q = \`{ post(id: "\${input}") { title } }\`;

// 有人输入这个,你的查询就被改写了:
// 1") { title } author { email } # `}
              />
            }
            right={
              <CodeBlock
                lang="js"
                title="✅ 变量(variables)"
                code={`// 查询文本永远不变,动态值另走一份 JSON
const q = \`query GetPost($id: ID!) {
  post(id: $id) { title }
}\`;

fetch("/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: q,
    variables: { id: input },
  }),
});`}
              />
            }
          />
          <Callout tone="idea" title="变量买到的三样东西">
            <p>
              ① <b>安全</b>:值永远是值,进不了查询结构,注入无从下嘴;②{" "}
              <b>类型检查</b>:<code>$id: ID!</code>{" "}
              让服务器在执行前就验明参数的类型和必填性;③ <b>恒定的查询文本</b>
              :文本不变才谈得上缓存、持久化查询(persisted queries,第 10 章见)。
              和 SQL 参数化查询是同一个道理:代码归代码,数据归数据。
            </p>
          </Callout>
        </div>

        <div className="op-tool">
          <div className="op-tool-head">
            <span className="op-tool-num">工具 5</span>
            <h3 className="op-tool-title">指令:@include 与 @skip</h3>
          </div>
          <p>
            同一份查询,手机端不要评论、桌面端要 —— 难道写两份 query?
            指令(directive)让字段的去留由变量说了算:
          </p>
          <CodeBlock
            lang="graphql"
            title="执行期指令"
            hl={[4]}
            code={`query PostPage($id: ID!, $withComments: Boolean!) {
  post(id: $id) {
    title
    comments(first: 3) @include(if: $withComments) {
      body
    }
  }
}`}
            note={
              <>
                <b>@include(if:)</b>:条件为 true 才要这块;<b>@skip(if:)</b>{" "}
                是它的镜像:条件为 true 就不要。一份查询文本,伺候多种界面。
              </>
            }
          />
        </div>

        <p className="sec-desc" style={{ marginTop: 26 }}>
          五样工具都认识了?下面这段 query
          把它们全用上了。点每一行,看它是哪个部件、在干什么。
        </p>
        <QueryAnatomy />
      </Section>

      {/* ================= §02 Mutation ================= */}
      <Section
        id="mutation"
        index="02"
        title="Mutation:动手改数据"
        desc="发文章、删评论、点赞 —— 一切「写」操作走 mutation。语法和 query 几乎一样,规矩多两条。"
      >
        <p className="sec-desc">
          第一条规矩是<b>约定</b>:读走 query,写走 mutation。语法上用 query
          改数据拦不住你,但这等于骗所有读代码的人 —— 就像把「拆迁」写在
          「参观」的告示牌下面。复杂的输入通常打包成一个{" "}
          <code>input</code> 类型(第 08 章讲过),别拆成十个零散参数。
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="graphql"
              title="mutation 定义"
              code={`mutation NewPost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    createdAt
    author { name }
  }
}`}
            />
          }
          right={
            <CodeBlock
              lang="json"
              title="variables"
              code={`{
  "input": {
    "title": "我的第一篇文章",
    "body": "GraphQL 上手记,踩坑实录……"
  }
}`}
            />
          }
        />
        <CodeBlock
          lang="json"
          title="响应 · 改完的新状态"
          code={`{
  "data": {
    "createPost": {
      "id": "42",
      "title": "我的第一篇文章",
      "createdAt": "2026-07-20T09:30:00Z",
      "author": { "name": "Ada" }
    }
  }
}`}
          note={
            <>
              注意 mutation 也有<b>选择集</b>:
              <code>createPost</code> 后面那对花括号,是在点「改完之后我要看什么」。
              惯例是让 mutation 返回<b>改完的新状态</b>(新文章的 id、服务器生成的
              createdAt)—— 前端拿它直接更新本地缓存,不用再发一次 query 确认。
            </>
          }
        />

        <Callout tone="deep" title="冷知识(规范明文规定):顶层 mutation 字段串行执行">
          <p>
            一次 query 里的顶层字段,服务器<b>可以并行</b>去查 ——
            读操作互不干扰,先查谁都一样。但一次 mutation
            里的顶层字段,规范规定必须<b>按出现顺序一个个执行</b>,
            上一个写完,下一个才开始。
          </p>
          <CodeBlock
            lang="graphql"
            title="顺序就是承诺"
            code={`mutation Transfer {
  withdraw(from: "A", amount: 100) { balance }  # 先执行完
  deposit(to: "B", amount: 100) { balance }     # 才轮到它
}`}
          />
          <p>
            为什么?<b>写操作有顺序依赖</b>。「先扣款再入账」并行了,
            结果就看运气 —— 规范用串行把运气从系统里赶出去。
            读一百遍余额结果都一样,所以 query 随便并行。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 Subscription ================= */}
      <Section
        id="subscription"
        index="03"
        title="Subscription:竖起耳朵听"
        desc="query 和 mutation 都是「你问一句,服务器答一句」。第三种操作反过来:你说一次「有事叫我」,服务器想说就说。"
      >
        <CodeBlock
          lang="graphql"
          title="订阅(subscription)· 有新评论就推给我"
          code={`subscription OnNewComment($postId: ID!) {
  newComment(postId: $postId) {
    body
    author { name }
  }
}`}
          note={
            <>
              形状和 query 一模一样,语义完全不同:这不是「现在给我」,
              是「以后每次发生都推给我」。一次订阅,多次响应。
              另外规范有个小限制:subscription 的<b>顶层字段只能有一个</b> ——
              一条订阅盯一种事件。
            </>
          }
        />
        <p className="sec-desc">
          普通 HTTP 是一问一答就挂断,推不了。所以 subscription 底层通常换交通工具:
          <b>WebSocket</b>(浏览器和服务器之间一条保持打开的双向通道,谁都能随时说话)
          或 <b>SSE</b>(Server-Sent Events,一条只从服务器流向浏览器的事件流)。
          一句话:都是「不挂电话」的技术。
        </p>

        <SubscriptionFlow />

        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-kicker" style={{ color: "var(--ok)" }}>
              值得用订阅
            </div>
            <div className="card-title">事件密集,时效敏感</div>
            <p>
              聊天消息、多人协作文档的光标、股票行情、比赛比分 ——
              晚一秒体验就塌,轮询要么太频繁烧服务器,要么太慢误事。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker" style={{ color: "var(--warn)" }}>
              轮询就够了
            </div>
            <div className="card-title">变化慢,晚点无妨</div>
            <p>
              通知红点、仪表盘统计这种几分钟刷一次都没人抱怨的场景,
              定时发个 query 简单可靠。长连接是要花钱养的(内存、心跳、断线重连),
              别为低频数据开专线。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §04 错误处理 ================= */}
      <Section
        id="errors"
        index="04"
        title="错误处理:{ data, errors } 与部分成功"
        desc="这是 GraphQL 和 REST 分歧最大的地方。REST 用状态码报错,GraphQL 把错误当数据的一部分。"
      >
        <p className="sec-desc">
          GraphQL 响应的形状是规范定死的:一个 <code>data</code>,一个{" "}
          <code>errors</code>,可以<b>同时存在</b>。一次查询几十个字段,
          每个字段背后各自的 resolver 在跑 —— 一个倒下,不连累全家:
          挂掉的字段进 errors 记账,幸存的字段照常躺在 data 里。
          这叫<b>部分成功(partial data)</b>,REST
          的「一个请求要么全成要么全败」里没有这个物种。点下面这份真实的事故响应,逐行验尸:
        </p>

        <ErrorAnatomy />

        <p className="sec-desc" style={{ marginTop: 24 }}>
          但部分成功有一个例外:<b>非空字段</b>。schema 里的{" "}
          <code>!</code> 是「绝不给你 null」的承诺 ——
          承诺兑现不了的时候,null 会向上「冒泡」,牵连范围比你想的大:
        </p>

        <BubbleViz />

        <Callout tone="warn" title="新手必踩坑:res.ok 判断不了 GraphQL 的成败">
          <p>
            传统上 GraphQL 服务器<b>恒回 HTTP 200</b> ——
            哪怕字段全军覆没,状态码照样是 200,错误全在 body 里。
            所以第 02 章那套「查 <code>res.ok</code>」在这里失灵了,
            必须检查 <code>body.errors</code>:
          </p>
          <CodeBlock
            lang="js"
            title="调 GraphQL 的正确姿势"
            hl={[8, 9]}
            code={`const res = await fetch("/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query, variables }),
});
const body = await res.json();

// res.ok 是 true 不代表没出事 —— 看 errors!
if (body.errors) {
  console.error("有字段挂了:", body.errors);
}
render(body.data); // data 里可能还有幸存数据,别扔`}
          />
          <p>
            「恒 200」也在松动:GraphQL over HTTP
            规范草案允许请求级错误用非 2xx 状态码 —— 第 10 章细说。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 分页 ================= */}
      <Section
        id="pagination"
        index="05"
        title="分页:Relay Cursor Connections"
        desc="列表不能一次全给 —— 这道题 REST 在第 05 章答过一遍,GraphQL 世界有一套长相奇特但目的相同的大厂惯例。"
      >
        <CodeBlock
          lang="graphql"
          title="connections 惯例"
          hl={[3, 4, 7, 8, 9]}
          code={`query Feed($cursor: String) {
  posts(first: 10, after: $cursor) {
    edges {
      node { title }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`}
        />
        <p className="sec-desc">
          第一眼谁都嫌它啰嗦:要个列表,怎么套了三层?拆开看每层都有用意:
          <b>edges</b> 是「带元数据的边」——
          每个元素除了数据本身(<code>node</code>),还能挂这条关系自己的信息
          (每条边自带一个 <code>cursor</code>,以后还能挂「关注时间」这类边上的属性);
          <b>cursor</b> 是不透明书签,长得像乱码是故意的:
          它可能编码了排序键、分片位置,服务器不想让你依赖它的内部结构 ——
          别解析,原样带回来就行;<b>pageInfo</b> 是指路牌:
          还有没有下一页、下一页从哪开始。
        </p>

        <CursorPager />

        <Callout tone="idea" title="惯例,不是语法">
          <p>
            connections 出自 Relay(Meta 的 GraphQL 客户端)的规范,
            <b>GitHub GraphQL API 完整遵循</b>,大厂 schema 里遍地都是 ——
            但它不是 GraphQL 语法的一部分。Rick and Morty API 就用简单的页码式:
            <code>characters(page: 2)</code>,返回里一个 <code>info.next</code>{" "}
            告诉你下一页页码。两种都活得好好的:cursor 深翻不重不漏适合无限流,
            页码简单直观适合「跳到第 5 页」。动手任务里两种你都会摸到。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 动手任务 ================= */}
      <Section
        id="labs"
        index="06"
        title="动手任务"
        desc="GraphiQL 已经替你搭好了,浏览器打开就能练。三个任务把变量、fragment、别名、分页全过一遍手。"
      >
        <LabSet ch="operations" items={LABS} />
      </Section>

      {/* ================= §07 通关测验 ================= */}
      <Section
        id="quiz"
        index="07"
        title="通关测验"
        desc="八道题。partial data 和非空冒泡那两道,是这一章的灵魂 —— 错了记得回 §04 再看一眼。"
      >
        <Quiz ch="operations" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            读、写、听:query 读,mutation 写,subscription 听 ——
            三种操作覆盖全部交互,读写别混用,那是给队友挖坑。
          </>,
          <>
            工具箱五件套:任何字段都能带参数;别名解决「同字段两份」的键冲突;
            fragment 让字段组只写一遍;变量让动态值不碰查询文本(免注入 + 类型检查
            + 可缓存);@include / @skip 让一份查询伺候多种界面。
          </>,
          <>
            mutation 返回「改完的新状态」方便前端更新缓存;
            顶层 mutation 字段<b>串行</b>执行(query 可并行)——
            因为写操作有顺序依赖。
          </>,
          <>
            响应恒为 <code>{`{ data, errors }`}</code>,二者可以并存 ——
            部分成功是 GraphQL 特产;非空字段(!)出错会把 null
            向上冒泡,牵连父字段。
          </>,
          <>
            传统上 HTTP 恒 200:<code>res.ok</code> 判断不了成败,
            必须检查 <code>body.errors</code>。
          </>,
          <>
            Relay 分页认准两个字段:<code>hasNextPage</code> 决定翻不翻,
            <code>endCursor</code> 填进下一次的 <code>after</code>;
            cursor 是不透明书签,别解析。
          </>,
        ]}
      />

      <ChapterFooter ch="operations" />
    </main>
  );
}
