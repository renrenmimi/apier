"use client";

// 第 09 章 · 查询、变更与订阅(双语,英文默认):
// 三种操作 → Query 工具箱(参数/别名/fragment/变量/指令 + 解剖台)→
// Mutation 与顶层字段串行 → Subscription 长连接动画 →
// { data, errors }、非空与冒泡 → Relay cursor 分页 → 动手任务 → 测验 → 要点。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

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
import { T } from "@/lib/i18n";
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
        title={{
          en: (
            <>
              Queries, mutations{" "}
              <span className="grad">and subscriptions</span>
            </>
          ),
          zh: (
            <>
              查询、变更<span className="grad">与订阅</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              GraphQL defines three operation types and no others. A query
              reads data. A mutation writes data. A subscription receives
              events that the server sends over time.
            </>
          ),
          zh: (
            <>
              GraphQL 只定义了三种操作类型,没有第四种:query 读数据,
              mutation 写数据,subscription 接收服务器随时间推送的事件。
            </>
          ),
        }}
        chips={[
          {
            id: "toolbox",
            n: "01",
            label: { en: "Query toolbox", zh: "Query 工具箱" },
          },
          { id: "mutation", n: "02", label: { en: "Mutations", zh: "Mutation" } },
          {
            id: "subscription",
            n: "03",
            label: { en: "Subscriptions", zh: "Subscription" },
          },
          { id: "errors", n: "04", label: { en: "Errors", zh: "错误处理" } },
          { id: "pagination", n: "05", label: { en: "Pagination", zh: "分页" } },
          { id: "labs", n: "06", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "07", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroOps />
      </Hero>

      {/* ================= §01 Query 工具箱 ================= */}
      <Section
        id="toolbox"
        index="01"
        title={{ en: "The query toolbox", zh: "Query 进阶工具箱" }}
        desc={{
          en: "Chapter 07 showed the simplest possible query. This section adds the five tools that appear in almost every real query: field arguments, aliases, fragments, variables, and directives.",
          zh: "第 07 章你写过最朴素的 query。这一节补上真实查询里几乎必然出现的五样工具:字段参数、别名、fragment、变量、指令。",
        }}
      >
        <div className="op-tool">
          <div className="op-tool-head">
            <span className="op-tool-num">
              <T en="TOOL 1" zh="工具 1" />
            </span>
            <h3 className="op-tool-title">
              <T
                en="Field arguments: not only on the top-level field"
                zh="字段参数:不只顶层字段能带"
              />
            </h3>
          </div>
          <p>
            <T
              en={
                <>
                  An argument is a value you pass to a field, written in
                  parentheses after the field name. A field accepts arguments
                  only if the schema declares them — and{" "}
                  <b>the schema can declare arguments on a field at any depth</b>
                  , not just on the fields at the top of the query. Here{" "}
                  <code>comments</code> takes an argument three levels in.
                </>
              }
              zh={
                <>
                  参数是传给某个字段的值,写在字段名后面的括号里。
                  一个字段能不能带参数,由 schema 决定 —— 而{" "}
                  <b>schema 可以给任意层级的字段声明参数</b>,不限于查询最外层。
                  下面 <code>comments</code> 就在第三层带了参数。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="graphql"
            title={{
              en: "An argument on a nested field",
              zh: "嵌套字段上的参数",
            }}
            hl={[4]}
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
            <span className="op-tool-num">
              <T en="TOOL 2" zh="工具 2" />
            </span>
            <h3 className="op-tool-title">
              <T
                en="Aliases: request the same field twice"
                zh="别名:同一个字段要两份"
              />
            </h3>
          </div>
          <p>
            <T
              en={
                <>
                  Each key in the response is the field name by default. So what
                  happens when you need the same field twice with{" "}
                  <b>different arguments</b>? Both results would want the key{" "}
                  <code>post</code>. An alias renames the key: write the name you
                  want, a colon, then the field. The response then has one key
                  per alias, and its shape is unambiguous.
                </>
              }
              zh={
                <>
                  响应里的键默认就是字段名。那同一个字段要用<b>不同参数</b>
                  取两份时会怎样?两份结果都想占用 <code>post</code> 这个键。
                  别名(alias)负责改名:写上你想要的名字、一个冒号,再写字段。
                  响应里于是一个别名一个键,形状不再有歧义。
                </>
              }
            />
          </p>
          <CodePair
            left={
              <CodeBlock
                lang="graphql"
                title={{
                  en: "query · two posts at once",
                  zh: "query · 一次要两篇",
                }}
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
                title={{
                  en: "response · one key per alias",
                  zh: "响应 · 一个别名一个键",
                }}
                code={`{
  "data": {
    "latest": { "title": "Meeting GraphQL" },
    "pinned": { "title": "Community guidelines" }
  }
}`}
              />
            }
          />
        </div>

        <div className="op-tool">
          <div className="op-tool-head">
            <span className="op-tool-num">
              <T en="TOOL 3" zh="工具 3" />
            </span>
            <h3 className="op-tool-title">
              <T
                en="Fragments: a named selection set you can reuse"
                zh="fragment:可复用的具名字段组"
              />
            </h3>
          </div>
          <p>
            <T
              en={
                <>
                  A <b>selection set</b> is the group of fields inside a pair of
                  braces. A fragment gives one selection set a name so you can
                  reuse it instead of repeating it. The list page, the detail
                  page, and the search page all need the same post fields —
                  write them once, then spread the fragment with{" "}
                  <code>...</code> wherever they are needed.
                </>
              }
              zh={
                <>
                  一对花括号里的那组字段,叫一个<b>选择集(selection set)</b>。
                  fragment 给一个选择集起个名字,让你复用它,而不是抄第二遍。
                  列表页、详情页、搜索结果页要的是同一组文章字段 ——
                  写一次,再用 <code>...</code> 在需要的地方展开。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="graphql"
            title={{
              en: "fragment · define once, spread anywhere",
              zh: "fragment · 定义一次,处处展开",
            }}
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
            note={{
              en: (
                <>
                  <b>on Post</b> is the type condition: this selection set may
                  only be spread where a <code>Post</code> is being selected.
                  Spread it somewhere else and validation rejects the document
                  before execution starts. When the product team asks for a view
                  count on every post card, you edit the fragment once.
                </>
              ),
              zh: (
                <>
                  <b>on Post</b> 是类型条件:这个选择集只能展开在正在选取{" "}
                  <code>Post</code> 的位置上。展开错地方,校验会在执行之前直接拒绝这份文档。
                  产品要给所有文章卡片加个阅读量时,你只改 fragment 这一处。
                </>
              ),
            }}
          />
          <Callout
            tone="deep"
            title={{
              en: "Inline fragments: selecting fields that only some types have",
              zh: "内联 fragment:只在部分类型上存在的字段",
            }}
          >
            <p>
              <T
                en={
                  <>
                    A field can return an interface or a union — a type that
                    stands for several concrete types. On such a field you may
                    only select the fields that all of those types share. To
                    reach the fields of one specific type, open an{" "}
                    <b>inline fragment</b>: a type condition with no name.
                  </>
                }
                zh={
                  <>
                    一个字段的返回类型可以是接口(interface)或联合(union)——
                    这类类型代表着若干具体类型。在这样的字段上,
                    你只能选取所有这些类型共有的字段。想取某一个具体类型独有的字段,
                    就开一个<b>内联 fragment</b>:一个没有名字的类型条件。
                  </>
                }
              />
            </p>
            <CodeBlock
              lang="graphql"
              title={{ en: "... on <Type>", zh: "... on <类型>" }}
              hl={[4, 5, 6, 7, 8, 9]}
              code={`{
  search(term: "ada") {
    __typename
    ... on User {
      name
    }
    ... on Post {
      title
    }
  }
}`}
              note={{
                en: (
                  <>
                    <code>__typename</code> is a built-in field you can select
                    in any selection set on an object, interface, or union type.
                    It returns the name of the type that was actually returned,
                    so the client knows which branch it is holding. Client
                    caches also use it: they store each object once under a key
                    built from its <code>__typename</code> and its id.
                  </>
                ),
                zh: (
                  <>
                    <code>__typename</code> 是内置字段,
                    在对象、接口、联合类型的任何选择集里都能选。
                    它返回实际返回的那个类型的名字 ——
                    客户端据此知道自己拿到的是哪一支。客户端缓存也依赖它:
                    每个对象按 <code>__typename</code> 加 id 组成的键只存一份。
                  </>
                ),
              }}
            />
          </Callout>
        </div>

        <div className="op-tool">
          <div className="op-tool-head">
            <span className="op-tool-num">
              <T en="TOOL 4" zh="工具 4" />
            </span>
            <h3 className="op-tool-title">
              <T
                en="Variables: how dynamic values enter a query"
                zh="变量:动态值的正确入口"
              />
            </h3>
          </div>
          <p>
            <T
              en={
                <>
                  Which post the user opens is only known at run time. The first
                  idea is usually to build the query text with string
                  concatenation. <b>Do not do that.</b> It has the same problem
                  as building SQL by concatenation: once user input is part of
                  the query text, it is no longer data. It can change the
                  structure of the query.
                </>
              }
              zh={
                <>
                  用户点开哪篇文章,是运行时才知道的事。第一反应通常是拼字符串把查询文本拼出来。
                  <b>不要这么做。</b>它和用拼接的方式生成 SQL 是同一个问题:
                  用户输入一旦成为查询文本的一部分,它就不再是数据,
                  而是能够改变查询结构的东西。
                </>
              }
            />
          </p>
          <CodePair
            left={
              <CodeBlock
                lang="js"
                title={{
                  en: "Wrong: string concatenation",
                  zh: "错误做法:字符串拼接",
                }}
                code={{
                  en: `// User input goes straight into the query text
const q = \`{ post(id: "\${input}") { title } }\`;

// Someone enters this, and the query is rewritten:
// 1") { title } author { email } # `,
                  zh: `// 用户输入直接进入了查询文本
const q = \`{ post(id: "\${input}") { title } }\`;

// 有人输入下面这一串,查询就被改写了:
// 1") { title } author { email } # `,
                }}
              />
            }
            right={
              <CodeBlock
                lang="js"
                title={{ en: "Right: variables", zh: "正确做法:变量" }}
                code={{
                  en: `// The query text never changes.
// Dynamic values travel as a separate JSON object.
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
});`,
                  zh: `// 查询文本永远不变,
// 动态值作为另一份独立的 JSON 一起发出去。
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
});`,
                }}
              />
            }
          />
          <Callout
            tone="idea"
            title={{
              en: "What the extra typing buys you",
              zh: "多写这几行,买到了什么",
            }}
          >
            <p>
              <T
                en={
                  <>
                    Variables are declared on the operation —{" "}
                    <code>query GetPost($id: ID!)</code> — and their values are
                    sent as a separate JSON object next to the query. Three
                    things follow. First, a value stays a value: it is never
                    parsed as part of the query, so concatenation cannot be used
                    to inject structure. Second, the server checks the declared
                    type before it executes anything, so{" "}
                    <code>$id: ID!</code> means a missing or wrongly typed{" "}
                    <code>id</code> is rejected up front. Third, the query text
                    is constant, so the server can parse and validate it once
                    and cache the result, and <b>persisted queries</b> become
                    possible: the client sends an identifier instead of the text
                    (chapter 10).
                  </>
                }
                zh={
                  <>
                    变量声明在操作上 —— <code>query GetPost($id: ID!)</code>{" "}
                    —— 它们的值作为另一份 JSON,和查询并排发出去。于是有三件事成立。
                    第一,值始终只是值:它不会被当作查询的一部分去解析,
                    所以没法靠拼接注入结构。第二,服务器在执行之前就检查声明的类型,
                    <code>$id: ID!</code> 意味着 <code>id</code>{" "}
                    缺失或类型不对会被提前拒绝。第三,查询文本恒定,
                    服务器可以只解析、校验一次并缓存结果,<b>持久化查询
                    (persisted queries)</b>也才成立:客户端发的是标识符,
                    不是查询正文(第 10 章)。
                  </>
                }
              />
            </p>
          </Callout>
        </div>

        <div className="op-tool">
          <div className="op-tool-head">
            <span className="op-tool-num">
              <T en="TOOL 5" zh="工具 5" />
            </span>
            <h3 className="op-tool-title">
              <T
                en="Directives: @include and @skip"
                zh="指令:@include 与 @skip"
              />
            </h3>
          </div>
          <p>
            <T
              en={
                <>
                  The mobile layout does not show comments; the desktop layout
                  does. You do not need two query documents for that. A{" "}
                  <b>directive</b> attaches to a field and changes how it is
                  handled — here, whether it is part of the request at all.
                </>
              }
              zh={
                <>
                  手机版界面不显示评论,桌面版显示。为此并不需要两份查询文档。
                  <b>指令(directive)</b>附在字段上,改变这个字段被处理的方式 ——
                  这里就是:它到底算不算这次请求的一部分。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="graphql"
            title={{ en: "An executable directive", zh: "执行期指令" }}
            hl={[4]}
            code={`query PostPage($id: ID!, $withComments: Boolean!) {
  post(id: $id) {
    title
    comments(first: 3) @include(if: $withComments) {
      body
    }
  }
}`}
            note={{
              en: (
                <>
                  <b>@include(if:)</b> keeps the field only when the condition
                  is true. <b>@skip(if:)</b> is the mirror image: it removes the
                  field when the condition is true. If a field carries both, it
                  is included only when <code>@include</code> is true{" "}
                  <b>and</b> <code>@skip</code> is false.
                </>
              ),
              zh: (
                <>
                  <b>@include(if:)</b> 只在条件为 true 时保留该字段;
                  <b>@skip(if:)</b> 正好相反:条件为 true 时移除该字段。
                  如果一个字段两个都带,只有在 <code>@include</code> 为 true{" "}
                  <b>且</b> <code>@skip</code> 为 false 时,它才会被包含进来。
                </>
              ),
            }}
          />
          <Callout
            tone="warn"
            title={{
              en: "Two are guaranteed; the rest are not",
              zh: "只有这两个是有保证的",
            }}
          >
            <p>
              <T
                en={
                  <>
                    <code>@include</code> and <code>@skip</code> are the two
                    executable directives that the specification requires every
                    server to support. You can rely on them anywhere.{" "}
                    <code>@deprecated</code> is different: it is a{" "}
                    <b>schema directive</b>. It marks a field as outdated inside
                    the schema definition, and you cannot write it in a query. A
                    server may also define its own directives, but those work
                    only on that server. Check the schema before using one.
                  </>
                }
                zh={
                  <>
                    <code>@include</code> 和 <code>@skip</code>{" "}
                    是规范要求每个服务器都必须支持的两个执行期指令,任何地方都能放心用。
                    <code>@deprecated</code> 不一样,它是<b>schema 指令</b>:
                    在 schema 定义里标记某个字段已过时,不能写进查询。
                    服务器也可以自定义指令,但那些只在该服务器上有效 ——
                    用之前先看 schema。
                  </>
                }
              />
            </p>
          </Callout>
        </div>

        <p className="sec-desc" style={{ marginTop: 26 }}>
          <T
            en={
              <>
                All five tools appear in the query below. Click any line to see
                which part it is and what it does.
              </>
            }
            zh={
              <>
                下面这段查询把五样工具全用上了。点任意一行,
                看它是哪个部件、在做什么。
              </>
            }
          />
        </p>
        <QueryAnatomy />
      </Section>

      {/* ================= §02 Mutation ================= */}
      <Section
        id="mutation"
        index="02"
        title={{ en: "Mutations: changing data", zh: "Mutation:改数据" }}
        desc={{
          en: "Publishing a post, deleting a comment, adding a like — every write goes through a mutation. The syntax is almost the same as a query. Two rules are different.",
          zh: "发文章、删评论、点赞 —— 一切写操作都走 mutation。语法和 query 几乎一样,有两条规矩不同。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                The first rule is a <b>convention</b>: reads use{" "}
                <code>query</code>, writes use <code>mutation</code>. Nothing in
                the syntax stops you from changing data inside a query, but
                doing so misleads every person and every tool that reads your
                API. Complex input is usually collected into a single{" "}
                <code>input</code> type (chapter 08) instead of a long list of
                separate arguments.
              </>
            }
            zh={
              <>
                第一条规矩是<b>约定</b>:读走 <code>query</code>,写走{" "}
                <code>mutation</code>。语法上没有任何东西阻止你在 query
                里改数据,但这么做会误导每一个读你 API 的人和工具。
                复杂的输入通常收进一个 <code>input</code> 类型(第 08 章),
                而不是摊成一长串独立参数。
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="graphql"
              title={{ en: "The mutation", zh: "mutation 定义" }}
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
    "title": "My first post",
    "body": "Notes from my first week with GraphQL."
  }
}`}
            />
          }
        />
        <CodeBlock
          lang="json"
          title={{
            en: "response · the new state",
            zh: "响应 · 改完之后的新状态",
          }}
          code={`{
  "data": {
    "createPost": {
      "id": "42",
      "title": "My first post",
      "createdAt": "2026-07-20T09:30:00Z",
      "author": { "name": "Ada Wong" }
    }
  }
}`}
          note={{
            en: (
              <>
                A mutation has a <b>selection set</b> too: the braces after{" "}
                <code>createPost</code> choose what you want to see once the
                write is done. The usual practice is to return the{" "}
                <b>new state</b> — the id of the new post, the{" "}
                <code>createdAt</code> the server generated — so the client can
                update its local cache without sending a second query.
              </>
            ),
            zh: (
              <>
                mutation 同样有<b>选择集</b>:<code>createPost</code>{" "}
                后面那对花括号,选的是「写完之后我要看到什么」。
                惯例是返回<b>新状态</b> —— 新文章的 id、服务器生成的{" "}
                <code>createdAt</code> —— 这样客户端不用再发一次 query
                就能更新本地缓存。
              </>
            ),
          }}
        />

        <Callout
          tone="deep"
          title={{
            en: "The specification: top-level mutation fields execute in series",
            zh: "规范明文规定:顶层 mutation 字段串行执行",
          }}
        >
          <p>
            <T
              en={
                <>
                  In a query, the top-level fields <b>may</b> be executed in
                  parallel. Reads do not affect each other, so the order does
                  not change the result. In a mutation, the specification
                  requires the top-level fields to execute{" "}
                  <b>one after another, in the order they are written</b>. The
                  first one finishes before the second one starts.
                </>
              }
              zh={
                <>
                  在 query 里,顶层字段<b>可以</b>并行执行 ——
                  读操作互不影响,顺序不改变结果。而在 mutation 里,
                  规范要求顶层字段<b>按书写顺序一个接一个执行</b>:
                  上一个执行完,下一个才开始。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="graphql"
            title={{ en: "Order is a guarantee", zh: "顺序是一种保证" }}
            code={{
              en: `mutation Transfer {
  withdraw(from: "A", amount: 100) { balance }  # runs first, to completion
  deposit(to: "B", amount: 100) { balance }     # only then does this start
}`,
              zh: `mutation Transfer {
  withdraw(from: "A", amount: 100) { balance }  # 先完整执行完
  deposit(to: "B", amount: 100) { balance }     # 之后才轮到它
}`,
            }}
          />
          <p>
            <T
              en={
                <>
                  Why the difference? Writes can depend on each other. If
                  &quot;take money out&quot; and &quot;put money in&quot; ran at
                  the same time, the result would depend on timing. Serial
                  execution removes that.
                </>
              }
              zh={
                <>
                  为什么要区别对待?写操作之间可能互相依赖。
                  如果「扣款」和「入账」同时进行,结果就取决于时序了。
                  串行执行消除了这种不确定性。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One detail people get wrong: this rule covers only the{" "}
                  <b>top-level</b> fields of the mutation. Inside the payload of
                  one mutation field — <code>id</code>, <code>title</code>,{" "}
                  <code>author</code> above — the fields resolve like any query,
                  and may run in parallel. And serial execution is not a
                  transaction. If the second mutation fails, the first one is
                  not undone. Rolling back is your server&apos;s job.
                </>
              }
              zh={
                <>
                  一个常被弄错的细节:这条规则只管 mutation 的<b>顶层</b>字段。
                  在某个 mutation 字段返回的负载内部 —— 比如上面的{" "}
                  <code>id</code>、<code>title</code>、<code>author</code>{" "}
                  —— 字段的解析和普通 query 一样,可以并行。
                  另外,串行执行不等于事务:第二个 mutation 失败,
                  第一个不会被撤销。回滚是你自己服务器的事。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 Subscription ================= */}
      <Section
        id="subscription"
        index="03"
        title={{
          en: "Subscriptions: receiving events over time",
          zh: "Subscription:持续接收事件",
        }}
        desc={{
          en: "A query and a mutation both follow one pattern: you ask once, the server answers once. A subscription is different. You register interest once, and the server sends results whenever the event happens.",
          zh: "query 和 mutation 都是同一种模式:你问一次,服务器答一次。subscription 不同:你登记一次关注,之后事件每发生一次,服务器就送一次结果。",
        }}
      >
        <CodeBlock
          lang="graphql"
          title={{
            en: "subscription · send me each new comment",
            zh: "subscription · 有新评论就送过来",
          }}
          code={`subscription OnNewComment($postId: ID!) {
  newComment(postId: $postId) {
    body
    author { name }
  }
}`}
          note={{
            en: (
              <>
                The shape is the same as a query; the meaning is not. This is
                not &quot;give me this now&quot;, it is &quot;send me this every
                time it happens&quot;. One subscription, many results. The
                specification adds one restriction:{" "}
                <b>a subscription operation must have exactly one root field</b>
                . One subscription follows one kind of event.
              </>
            ),
            zh: (
              <>
                形状和 query 一样,含义完全不同:这不是「现在给我」,
                而是「以后每次发生都送给我」。一次订阅,多次结果。
                规范额外加了一条限制:<b>一个 subscription 操作有且只能有一个根字段</b>
                。一条订阅只跟一种事件。
              </>
            ),
          }}
        />
        <p className="sec-desc">
          <T
            en={
              <>
                A single request-and-response exchange cannot deliver something
                that happens ten minutes later, because it is already finished.
                A subscription therefore needs a connection that{" "}
                <b>stays open</b>. The usual transport is a <b>WebSocket</b>: a
                connection, opened from the browser, that both sides can send
                messages on until one of them closes it. <b>SSE</b>{" "}
                (Server-Sent Events) is also used: that one is still HTTP, but
                the response body stays open and the server keeps writing events
                into it, one direction only.
              </>
            }
            zh={
              <>
                一次请求 - 响应的往返送不了十分钟以后才发生的事,
                因为它早就结束了。所以 subscription 需要一条<b>保持打开</b>的连接。
                常用的传输方式是 <b>WebSocket</b>:由浏览器发起、
                双方都能往里发消息、直到一方关闭为止的连接。也有用 <b>SSE</b>
                (Server-Sent Events)的:它仍然是 HTTP,
                只是响应体一直不结束,服务器不断往里写事件,只有单向。
              </>
            }
          />
        </p>

        <SubscriptionFlow />

        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-kicker" style={{ color: "var(--ok)" }}>
              <T en="Worth a subscription" zh="值得用订阅" />
            </div>
            <div className="card-title">
              <T
                en="Frequent events, and delay is visible"
                zh="事件密集,而且延迟看得见"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    Chat messages, the cursors of other people in a shared
                    document, market prices, live scores. One second late is
                    already noticeable. Polling for these is either too frequent
                    (wasted server work) or too slow (visible lag).
                  </>
                }
                zh={
                  <>
                    聊天消息、协作文档里其他人的光标、行情价格、比赛比分 ——
                    晚一秒就能看出来。这类数据用轮询要么太频繁(白白消耗服务器),
                    要么太慢(看得见的卡顿)。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker" style={{ color: "var(--warn)" }}>
              <T en="Polling is enough" zh="轮询就够了" />
            </div>
            <div className="card-title">
              <T
                en="Slow changes, and delay does not matter"
                zh="变化慢,晚一点也没关系"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    A notification badge, or a dashboard that nobody minds
                    seeing a few minutes late. Sending a query on a timer is
                    simpler and more reliable. An open connection costs memory,
                    heartbeat messages, and reconnection handling on both sides.
                  </>
                }
                zh={
                  <>
                    通知红点,或者晚几分钟也没人在意的仪表盘。
                    定时发一个 query 更简单也更可靠。
                    一条保持打开的连接是有成本的:两端都要付出内存、
                    心跳消息和断线重连的处理。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §04 错误处理 ================= */}
      <Section
        id="errors"
        index="04"
        title={{
          en: "Errors: { data, errors } and partial results",
          zh: "错误处理:{ data, errors } 与部分结果",
        }}
        desc={{
          en: "This is where GraphQL differs most from REST. REST reports failure with a status code. GraphQL puts errors inside the response body, next to the data.",
          zh: "这是 GraphQL 和 REST 差别最大的地方。REST 用状态码报告失败,GraphQL 把错误放进响应体,和数据并排。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                The specification fixes the shape of the response: a{" "}
                <code>data</code> entry and an <code>errors</code> entry, and{" "}
                <b>both may be present at once</b>. Each field is produced by
                its own resolver. When one resolver fails, the others keep
                running: the failed field is recorded in <code>errors</code>,
                and the fields that succeeded are still in <code>data</code>.
                This is called a <b>partial result</b>, and REST has no
                equivalent — there, one request either succeeds or fails. Click
                through the response below line by line.
              </>
            }
            zh={
              <>
                规范固定了响应的形状:一个 <code>data</code>、一个{" "}
                <code>errors</code>,而且<b>两者可以同时出现</b>。
                每个字段由各自的 resolver 产生,某个 resolver 失败时,
                其余的照常执行:失败的字段记进 <code>errors</code>,
                成功的字段仍然留在 <code>data</code> 里。这叫<b>部分结果
                (partial result)</b>,REST 里没有对应的东西 ——
                在那边,一个请求要么成功要么失败。点下面这份响应,逐行看。
              </>
            }
          />
        </p>

        <ErrorAnatomy />

        <p className="sec-desc" style={{ marginTop: 24 }}>
          <T
            en={
              <>
                Partial results have one limit: <b>non-null fields</b>. Before
                the limit makes sense, you need to read the type notation
                correctly.
              </>
            }
            zh={
              <>
                部分结果有一个边界:<b>非空字段</b>。
                在讲这个边界之前,得先把类型写法读对。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="graphql"
          title={{
            en: "Reading non-null and list types",
            zh: "读懂非空与列表的写法",
          }}
          code={{
            en: `type Post {
  subtitle: String     # may be null
  title: String!       # never null
  tags: [String!]!     # list is never null, and no item is null
  notes: [String!]     # list may be null; if present, no item is null
  scores: [Int]!       # list is never null; an item may be null
}`,
            zh: `type Post {
  subtitle: String     # 可以是 null
  title: String!       # 绝不为 null
  tags: [String!]!     # 列表本身绝不为 null,里面也没有 null 元素
  notes: [String!]     # 列表本身可以是 null;若存在,里面没有 null 元素
  scores: [Int]!       # 列表本身绝不为 null;元素可以是 null
}`,
          }}
          note={{
            en: (
              <>
                The rule: <code>!</code> applies to the thing immediately on its
                left. In <code>[String!]!</code> the inner <code>!</code>{" "}
                belongs to <code>String</code>, and the outer one belongs to the
                list. Read from the inside out and the two are never confused.
              </>
            ),
            zh: (
              <>
                规则:<code>!</code> 作用于紧挨着它左边的那个东西。
                <code>[String!]!</code> 里,内层的 <code>!</code> 属于{" "}
                <code>String</code>,外层的属于这个列表。
                从里往外读,两者就不会混。
              </>
            ),
          }}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                A <code>!</code> is a promise to the client: this position will
                never hold <code>null</code>. When a resolver for a non-null
                field fails, the server cannot keep that promise and cannot put{" "}
                <code>null</code> there either. So the <code>null</code> moves
                up to the <b>nearest parent field that is allowed to be null</b>
                , and everything below that parent is discarded with it. The
                same rule was stated in chapter 07; here is what it looks like
                step by step.
              </>
            }
            zh={
              <>
                <code>!</code> 是对客户端的承诺:这个位置绝不会是{" "}
                <code>null</code>。当一个非空字段的 resolver 失败时,
                服务器既兑现不了承诺,也不能把 <code>null</code> 放在那里。
                于是这个 <code>null</code> 会向上移动到
                <b>最近的、允许为 null 的父字段</b>,
                这个父字段下面的一切也随之丢弃。
                第 07 章提到过同一条规则,下面是它一步步发生的样子。
              </>
            }
          />
        </p>

        <BubbleViz />

        <Callout
          tone="warn"
          title={{
            en: "res.ok cannot tell you whether a GraphQL request succeeded",
            zh: "res.ok 判断不了 GraphQL 请求的成败",
          }}
        >
          <p>
            <T
              en={
                <>
                  A GraphQL server traditionally answers{" "}
                  <code>200 OK</code> even when every field failed. The status
                  code describes the HTTP exchange; the errors are in the body.
                  So the <code>res.ok</code> check from chapter 02 is not enough
                  here. Read <code>body.errors</code>.
                </>
              }
              zh={
                <>
                  传统上,即使所有字段都失败了,GraphQL 服务器仍然返回{" "}
                  <code>200 OK</code>:状态码描述的是这次 HTTP 往返,
                  错误在响应体里。所以第 02 章那套 <code>res.ok</code>{" "}
                  检查在这里不够用,要读 <code>body.errors</code>。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="js"
            title={{
              en: "Calling a GraphQL API correctly",
              zh: "调用 GraphQL 的正确写法",
            }}
            hl={[8, 9]}
            code={{
              en: `const res = await fetch("/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query, variables }),
});
const body = await res.json();

// res.ok === true does not mean the query worked.
if (body.errors) {
  console.error("Some fields failed:", body.errors);
}
render(body.data); // data may still hold usable fields`,
              zh: `const res = await fetch("/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query, variables }),
});
const body = await res.json();

// res.ok === true 不代表查询成功了。
if (body.errors) {
  console.error("有字段失败了:", body.errors);
}
render(body.data); // data 里可能仍有可用的字段`,
            }}
          />
          <p>
            <T
              en={
                <>
                  The always-200 habit is changing. The GraphQL over HTTP
                  specification is still a draft, and it allows a non-2xx status
                  for errors that concern the whole request, such as a document
                  that fails validation. Chapter 10 goes into it.
                </>
              }
              zh={
                <>
                  「恒回 200」这个习惯正在改变。GraphQL over HTTP
                  规范目前仍是草案,它允许对整个请求层面的错误使用非 2xx
                  状态码 —— 比如一份没通过校验的文档。第 10 章会展开。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 分页 ================= */}
      <Section
        id="pagination"
        index="05"
        title={{
          en: "Pagination: Relay cursor connections",
          zh: "分页:Relay Cursor Connections",
        }}
        desc={{
          en: "A list cannot be returned all at once. Chapter 05 answered this for REST. The GraphQL world has a widely copied convention that looks unusual at first and solves the same problem.",
          zh: "列表不能一次全给。这道题第 05 章在 REST 那边答过一遍,GraphQL 世界有一套被广泛照抄的惯例,乍看奇怪,解决的是同一个问题。",
        }}
      >
        <CodeBlock
          lang="graphql"
          title={{ en: "The connections convention", zh: "connections 惯例" }}
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
          <T
            en={
              <>
                Three levels for a list looks like a lot. Each one has a
                purpose. <b>edges</b> is the list of connections between the
                parent and each item: the item itself is under{" "}
                <code>node</code>, and anything that describes the{" "}
                <i>relationship</i> sits next to it — every edge carries its own{" "}
                <code>cursor</code>, and a schema can add fields such as the
                date a user started following. <b>cursor</b> is an opaque
                bookmark. It looks like nonsense on purpose: it may encode a
                sort key or a shard position, and the server does not want
                clients depending on that. Do not parse it; send it back
                unchanged. <b>pageInfo</b> describes the page itself: whether
                there is more, and where the next page starts.
              </>
            }
            zh={
              <>
                要个列表套了三层,确实显得多。每一层都有用意。
                <b>edges</b> 是父对象与每个元素之间的「边」的列表:
                元素本身放在 <code>node</code> 里,
                描述这段<i>关系</i>的信息则放在它旁边 —— 每条边自带一个{" "}
                <code>cursor</code>,schema 还可以在边上加「关注开始时间」
                这类字段。<b>cursor</b> 是不透明书签,
                长得像乱码是故意的:它可能编码了排序键或分片位置,
                服务器不希望客户端依赖这些内部结构 ——
                别解析它,原样带回来。<b>pageInfo</b> 描述这一页本身:
                后面还有没有,下一页从哪里开始。
              </>
            }
          />
        </p>

        <CursorPager />

        <Callout
          tone="idea"
          title={{ en: "A convention, not syntax", zh: "这是惯例,不是语法" }}
        >
          <p>
            <T
              en={
                <>
                  Connections come from the Relay specification (Relay is
                  Meta&apos;s GraphQL client). The GitHub GraphQL API follows
                  it, and you will meet it in many large schemas — but it is not
                  part of the GraphQL language. The Rick and Morty API uses
                  plain page numbers instead: <code>characters(page: 2)</code>,
                  with an <code>info.next</code> field holding the next page
                  number. Both are in use. Cursors handle deep lists that change
                  while you read them, without skipping or repeating items; page
                  numbers are simpler and let a user jump straight to page 5.
                  The practice tasks use the page-number style.
                </>
              }
              zh={
                <>
                  connections 出自 Relay 规范(Relay 是 Meta 的 GraphQL 客户端)。
                  GitHub GraphQL API 遵循它,很多大型 schema 里也都能见到 ——
                  但它不是 GraphQL 语言的一部分。Rick and Morty API
                  用的就是简单的页码式:<code>characters(page: 2)</code>,
                  返回里有一个 <code>info.next</code> 告诉你下一页的页码。
                  两种都在用:cursor 适合边读边变的长列表,不会漏也不会重;
                  页码更简单,还能让用户直接跳到第 5 页。
                  下面的动手任务用的就是页码式。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 动手任务 ================= */}
      <Section
        id="labs"
        index="06"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "GraphiQL is already set up for you; open it in the browser. Three tasks cover variables, fragments, aliases, and pagination.",
          zh: "GraphiQL 已经替你准备好了,浏览器打开就能练。三个任务把变量、fragment、别名、分页都过一遍。",
        }}
      >
        <LabSet ch="operations" items={LABS} />
      </Section>

      {/* ================= §07 通关测验 ================= */}
      <Section
        id="quiz"
        index="07"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions. The two about partial results and non-null bubbling matter most — if you miss them, read §04 again.",
          zh: "八道题。关于部分结果和非空冒泡的那两道最关键 —— 错了就回 §04 再看一遍。",
        }}
      >
        <Quiz ch="operations" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                Three operation types, and no others: <code>query</code> reads,{" "}
                <code>mutation</code> writes, <code>subscription</code> receives
                events over time. Keeping reads and writes on the right
                operation is a convention, and other people rely on it.
              </>
            ),
            zh: (
              <>
                三种操作类型,没有第四种:<code>query</code> 读,
                <code>mutation</code> 写,<code>subscription</code>{" "}
                持续接收事件。读写各归各的操作是一条约定,别人是照着它来理解你的 API 的。
              </>
            ),
          },
          {
            en: (
              <>
                The toolbox: the schema may declare arguments on a field at any
                depth; an alias renames a response key so the same field can be
                requested twice; a fragment names a selection set so it is
                written once; an inline fragment (<code>... on Dog</code>)
                reaches the fields of one type behind an interface or union.
              </>
            ),
            zh: (
              <>
                工具箱:schema 可以给任意层级的字段声明参数;
                别名给响应的键改名,让同一个字段能取两份;
                fragment 给一个选择集起名字,从而只写一遍;
                内联 fragment(<code>... on Dog</code>)
                用来取接口或联合背后某一个具体类型的字段。
              </>
            ),
          },
          {
            en: (
              <>
                Variables are declared on the operation and sent as a separate
                JSON object. The query text stays constant, which prevents
                injection through string building, lets the server check types
                before execution, and makes cached parsed documents and
                persisted queries possible. <code>@include(if:)</code> and{" "}
                <code>@skip(if:)</code> are the two executable directives every
                server must support.
              </>
            ),
            zh: (
              <>
                变量声明在操作上,值作为另一份 JSON 发送。
                查询文本因此保持恒定 —— 拼接注入无从谈起,
                服务器能在执行前检查类型,解析结果可以缓存,
                持久化查询也才可行。<code>@include(if:)</code> 和{" "}
                <code>@skip(if:)</code> 是每个服务器都必须支持的两个执行期指令。
              </>
            ),
          },
          {
            en: (
              <>
                A mutation returns the new state so the client can update its
                cache. Its <b>top-level</b> fields execute in series, in written
                order; the fields inside each payload resolve like a query.
                Serial execution is not a transaction.
              </>
            ),
            zh: (
              <>
                mutation 返回改完之后的新状态,方便客户端更新缓存。
                它的<b>顶层</b>字段按书写顺序串行执行;
                每个负载内部的字段则和 query 一样解析。串行执行不等于事务。
              </>
            ),
          },
          {
            en: (
              <>
                The response is always <code>{`{ data, errors }`}</code>, and
                both may appear together — a partial result. A failing non-null
                field cannot hold <code>null</code>, so the <code>null</code>{" "}
                moves up to the nearest parent that allows it. Read{" "}
                <code>!</code> as applying to the thing on its left.
              </>
            ),
            zh: (
              <>
                响应恒为 <code>{`{ data, errors }`}</code>,二者可以并存 ——
                这就是部分结果。失败的非空字段放不下 <code>null</code>,
                于是 <code>null</code> 向上移到最近的允许为空的父字段。
                <code>!</code> 作用于它左边的那个东西。
              </>
            ),
          },
          {
            en: (
              <>
                A GraphQL server traditionally answers <code>200 OK</code> even
                on failure, so <code>res.ok</code> proves nothing. Check{" "}
                <code>body.errors</code>.
              </>
            ),
            zh: (
              <>
                传统上 GraphQL 服务器出错也返回 <code>200 OK</code>,
                所以 <code>res.ok</code> 说明不了任何事。要检查{" "}
                <code>body.errors</code>。
              </>
            ),
          },
          {
            en: (
              <>
                For Relay pagination, watch two fields:{" "}
                <code>hasNextPage</code> decides whether to continue, and{" "}
                <code>endCursor</code> goes into the next request as{" "}
                <code>after</code>. A cursor is an opaque bookmark — do not
                parse it.
              </>
            ),
            zh: (
              <>
                Relay 分页盯住两个字段:<code>hasNextPage</code>{" "}
                决定还翻不翻,<code>endCursor</code> 填进下一次请求的{" "}
                <code>after</code>。cursor 是不透明书签 —— 不要解析它。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="operations" />
    </main>
  );
}
