"use client";

// 第 07 章 · GraphQL 初见(双语,英文默认):
// REST 的两种取数问题(over/under-fetching)→ GraphQL 的答案(CodePair)→
// QueryBuilder 亲手写查询 → 一个端点 + 三种操作 + 200 与 errors →
// GraphiQL 与内省 → 取舍与代价 → 动手任务 → 测验 → 要点。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  Method,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/graphql-data";
import { T } from "@/lib/i18n";
import {
  GqHeroLoop,
  OverfetchViz,
  UnderfetchWaterfall,
  QueryBuilder,
  GraphiqlTour,
  AdoptionBars,
} from "./viz";

export default function GraphqlPage() {
  return (
    <main className="page" data-ch="graphql">
      <Hero
        ch="graphql"
        title={{
          en: (
            <>
              Meeting <span className="grad">GraphQL</span>
            </>
          ),
          zh: (
            <>
              GraphQL <span className="grad">初见</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              GraphQL is a query language for APIs, and a runtime that answers
              those queries. The client writes down which fields it needs, and
              the server returns those fields and nothing else.
            </>
          ),
          zh: (
            <>
              GraphQL 是一门面向 API 的查询语言,也是执行这些查询的运行时。
              客户端写清楚自己要哪些字段,服务器就只返回这些字段,不多不少。
            </>
          ),
        }}
        chips={[
          {
            id: "rest-pain",
            n: "01",
            label: { en: "Two problems", zh: "两种取数问题" },
          },
          {
            id: "answer",
            n: "02",
            label: { en: "The GraphQL answer", zh: "GraphQL 的答案" },
          },
          {
            id: "builder",
            n: "03",
            label: { en: "Build a query", zh: "亲手写查询" },
          },
          {
            id: "endpoint",
            n: "04",
            label: { en: "One endpoint", zh: "一个端点" },
          },
          { id: "graphiql", n: "05", label: "GraphiQL" },
          {
            id: "no-sides",
            n: "06",
            label: { en: "Trade-offs", zh: "取舍与代价" },
          },
          { id: "labs", n: "07", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <GqHeroLoop />
      </Hero>

      {/* ================= §01 两种取数问题 ================= */}
      <Section
        id="rest-pain"
        index="01"
        title={{
          en: "Two problems: over-fetching and under-fetching",
          zh: "两种取数问题:拿多了,和拿不够",
        }}
        desc={{
          en: "REST is not broken. But when the server decides the shape of every response in advance, it has to guess what each client needs. The examples use the blog API from chapter 04.",
          zh: "不是 REST 不好。只要响应的形状由服务器预先定死,服务器就只能猜客户端要什么。下面还是用第 04 章那套博客 API 说话。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "2012: rewriting the Facebook mobile News Feed",
            zh: "2012 年:重写 Facebook 移动版 News Feed",
          }}
        >
          <p>
            <T
              en={
                <>
                  Facebook decided to rebuild its slow mobile News Feed as a
                  native app. Mobile networks then were 2G and 3G: one round
                  trip often took several hundred milliseconds, and data was
                  billed by the kilobyte. Two things showed up in every profile.
                  The REST responses carried many fields the app never
                  displayed. And one screen needed several endpoints, called one
                  after another.
                </>
              }
              zh={
                <>
                  Facebook 决定把越来越卡的移动版 News Feed 推倒,用原生 App
                  重写。当年的移动网络是 2G/3G:一次往返动辄几百毫秒,
                  流量按 KB 收费。性能剖析里反复出现两件事:REST
                  响应里带回来一堆 App 根本不显示的字段;
                  而一屏内容又得串着调好几个端点才凑得齐。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Lee Byron, Nick Schrock, and Dan Schafer designed a different
                  arrangement: the client sends a list of the fields it wants,
                  and the server returns exactly those fields. Facebook released
                  it as open source in 2015 under the name GraphQL, and moved
                  the specification to the neutral GraphQL Foundation in 2018.
                  The latest ratified edition is the{" "}
                  <b>September 2025 Edition</b>, four years after the previous
                  one.
                </>
              }
              zh={
                <>
                  Lee Byron、Nick Schrock、Dan Schafer 三个人设计了另一种分工:
                  客户端把想要的字段写成一张清单交上去,服务器就只返回这些字段。
                  2015 年 Facebook 把它开源,起名 GraphQL;2018
                  年把规范移交给中立的 GraphQL Foundation。最新的正式版是{" "}
                  <b>September 2025 Edition</b>,距上一版隔了四年。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                The first problem is <b>over-fetching</b>: the response carries
                fields the client did not need. A post page shows the
                author&apos;s name and picture. But <code>GET /users/9</code>{" "}
                returns the whole user record, because the server fixed that
                shape long before your page existed.
              </>
            }
            zh={
              <>
                第一个问题是 <b>over-fetching(拿多了)</b>:
                响应里带回了客户端根本不需要的字段。文章页只想显示作者的名字和头像,
                可 <code>GET /users/9</code> 会把整条 user
                记录都返回 —— 这个形状在你的页面存在之前就已经定死了。
              </>
            }
          />
        </p>

        <OverfetchViz />

        <p className="sec-desc">
          <T
            en={
              <>
                The second problem is <b>under-fetching</b>: one endpoint does
                not return everything the screen needs, so the client sends
                another request. Often the second URL cannot even be built until
                the first response arrives, so the requests run one after
                another instead of in parallel.
              </>
            }
            zh={
              <>
                第二个问题是 <b>under-fetching(拿不够)</b>:
                一个端点给不全这一屏需要的数据,客户端只能再发一次请求。
                而且下一个 URL 往往要等上一个响应回来才拼得出来 ——
                于是几次请求只能排队跑,没法并发。
              </>
            }
          />
        </p>

        <UnderfetchWaterfall />

        <Callout
          tone="warn"
          title={{
            en: "This is not a mistake by the API designer",
            zh: "这不是 API 设计者的失误",
          }}
        >
          <p>
            <T
              en={
                <>
                  You could add a parameter to <code>/posts/1</code> that
                  includes the author and the comments. That works. But every
                  new screen then needs another variant, and the endpoint list
                  keeps growing. The cause is structural:{" "}
                  <b>the server fixes the response shape in advance</b>, so it
                  can only guess. Return more and some clients waste bytes.
                  Return less and some clients need another round trip.
                </>
              }
              zh={
                <>
                  你当然可以给 <code>/posts/1</code>{" "}
                  加个参数,把作者和评论一起带上。这确实管用。
                  但每来一种新页面就要加一个变体,端点清单只会越来越长。
                  根源是结构性的:<b>响应形状由服务器预先定死</b>,它只能猜。
                  给多了,有的客户端在浪费流量;给少了,有的客户端还得再跑一趟。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 GraphQL 的答案 ================= */}
      <Section
        id="answer"
        index="02"
        title={{
          en: "The GraphQL answer: state the whole request once",
          zh: "GraphQL 的答案:一次把需求说完",
        }}
        desc={{
          en: "The same post page. On the left, three REST requests. On the right, one GraphQL query.",
          zh: "同一个帖子页:左边是 REST 的三次请求,右边是 GraphQL 的一次查询。",
        }}
      >
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title={{ en: "REST · three requests", zh: "REST · 三次请求" }}
              code={`GET /posts/1 HTTP/1.1
GET /users/9 HTTP/1.1
GET /posts/1/comments HTTP/1.1`}
              note={{
                en: (
                  <>
                    Three round trips, and they cannot run in parallel: the URL
                    of the second request depends on the first response. Each
                    response also carries fields this page does not use.
                  </>
                ),
                zh: (
                  <>
                    三趟往返,而且没法并发:第二趟的 URL
                    依赖第一趟的响应。每趟响应还都带着这个页面用不上的字段。
                  </>
                ),
              }}
            />
          }
          right={
            <CodeBlock
              lang="graphql"
              title={{ en: "GraphQL · one query", zh: "GraphQL · 一次查询" }}
              code={`{
  post(id: 1) {
    title
    body
    author {
      name
      avatarUrl
    }
    comments {
      body
      author { name }
    }
  }
}`}
              note={{
                en: (
                  <>
                    The post, its author, its comments, and the author of each
                    comment. The nesting is written in one document, and one
                    round trip returns all of it.
                  </>
                ),
                zh: (
                  <>
                    帖子、作者、评论、每条评论的作者 ——
                    嵌套几层都写在同一份文档里,一趟往返全部带回。
                  </>
                ),
              }}
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                Now the rule that makes GraphQL easy to read:{" "}
                <b>the response mirrors the shape of the query</b>. Compare the
                two windows line by line.
              </>
            }
            zh={
              <>
                接着是 GraphQL 最好记的一条规律:
                <b>响应的形状和查询的形状一一对应</b>。左右两个窗口逐行对一遍。
              </>
            }
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="graphql"
              title={{ en: "The query you write", zh: "你写的查询" }}
              code={`{
  post(id: 1) {
    title
    author {
      name
    }
    comments {
      body
    }
  }
}`}
              hl={[4, 5, 6]}
            />
          }
          right={
            <CodeBlock
              lang="json"
              title={{ en: "The response you get", zh: "你收到的响应" }}
              code={`{
  "data": {
    "post": {
      "title": "Meeting GraphQL",
      "author": {
        "name": "Ada Wong"
      },
      "comments": [
        { "body": "Clear explanation, thanks." },
        { "body": "Saved for later." }
      ]
    }
  }
}`}
              hl={[5, 6, 7]}
            />
          }
        />

        <Callout
          tone="idea"
          title={{
            en: "Why this rule is worth memorising",
            zh: "这条规律为什么值得背下来",
          }}
        >
          <p>
            <T
              en={
                <>
                  When you read the query, you already know the shape of the
                  JSON you will receive. You do not have to open the
                  documentation or print the response to find out. Only two
                  things are added: an outer <code>data</code> object, and list
                  fields such as <code>comments</code> come back as arrays.
                </>
              }
              zh={
                <>
                  读完查询,你就已经知道将要收到的 JSON
                  长什么样,不用翻文档,也不用把响应打印出来猜结构。
                  只多出两样东西:最外层的 <code>data</code>{" "}
                  对象,以及列表字段(比如 <code>comments</code>)会以数组形式返回。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 亲手写查询 ================= */}
      <Section
        id="builder"
        index="03"
        title={{ en: "Build a query yourself", zh: "亲手写一次查询" }}
        desc={{
          en: "On the left are the fields of the Character type from the Rick and Morty API. Select fields, and the query in the middle and the response on the right follow your selection.",
          zh: "左边是 Rick and Morty API 里 Character 类型的字段。勾选字段,中间的查询和右边的响应会跟着变。",
        }}
      >
        <QueryBuilder />
        <Callout
          tone="idea"
          title={{
            en: "Who decides the size of the response",
            zh: "谁来决定响应的大小",
          }}
        >
          <p>
            <T
              en={
                <>
                  In REST, that decision belongs to the server; a client can
                  only ask for a different endpoint. In GraphQL the client
                  decides. A list screen can select <code>name</code> and{" "}
                  <code>image</code>. A detail screen can select all seven
                  fields. Same API, same endpoint, two different queries.
                </>
              }
              zh={
                <>
                  在 REST 里,这个决定权在服务器手上,客户端只能改调另一个端点;
                  在 GraphQL 里,决定权在客户端。列表页只选 <code>name</code> 和{" "}
                  <code>image</code>,详情页把七个字段全选上 ——
                  同一个 API、同一个端点,两份不同的查询。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 一个端点 ================= */}
      <Section
        id="endpoint"
        index="04"
        title={{
          en: "One endpoint instead of many URLs",
          zh: "一个端点,取代一堆 URL",
        }}
        desc={{
          en: "After the REST chapters you think in URLs. A GraphQL API usually exposes a single path.",
          zh: "学完 REST,你满脑子都是 URL。而一个 GraphQL API 通常只暴露一条路径。",
        }}
      >
        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">REST</div>
            <div className="card-title">
              <T
                en="A URL list that keeps growing"
                zh="一张越写越长的 URL 清单"
              />
            </div>
            <div className="gq-ep-list">
              <div>
                <Method m="GET" /> <code>/posts</code>
              </div>
              <div>
                <Method m="POST" /> <code>/posts</code>
              </div>
              <div>
                <Method m="GET" /> <code>/posts/1</code>
              </div>
              <div>
                <Method m="PATCH" /> <code>/posts/1</code>
              </div>
              <div>
                <Method m="GET" /> <code>/posts/1/comments</code>
              </div>
              <div>
                <Method m="GET" /> <code>/users/9</code>
              </div>
              <div className="gq-ep-more">
                <T en="…one URL per need" zh="……每种需求一个 URL" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">GraphQL</div>
            <div className="card-title">
              <T en="One path" zh="一条路径" />
            </div>
            <div className="gq-ep-one">
              <Method m="POST" /> <code>/graphql</code>
            </div>
            <p>
              <T
                en={
                  <>
                    Every request goes to this one path. The schema behind it
                    defines what can be asked. The question changes from
                    &quot;which URL do I call&quot; to &quot;which fields do I
                    select&quot;.
                  </>
                }
                zh={
                  <>
                    所有请求都发往这一条路径,路径背后是 schema,
                    由它规定什么可以被查询。问题从「该调哪个 URL」
                    变成了「该选哪些字段」。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <p className="sec-desc">
          <T
            en="So where did the routes go? They did not disappear. They moved."
            zh="那原来那些路由去哪了?没有消失,只是换了个地方。"
          />
        </p>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="In REST" zh="在 REST 里" />
                </th>
                <th>
                  <T en="In GraphQL" zh="到了 GraphQL" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Many endpoints (URLs)" zh="一批端点(URL)" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <b>One endpoint</b>, <code>/graphql</code>
                      </>
                    }
                    zh={
                      <>
                        <b>一个端点</b> <code>/graphql</code>
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en="A resource, located by its URL"
                    zh="资源 —— 用 URL 定位"
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        A <b>type</b>, defined in the schema
                      </>
                    }
                    zh={
                      <>
                        <b>类型(type)</b> —— 在 schema 里定义
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en="Which endpoint, and which method"
                    zh="调哪个端点、用什么方法"
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <b>Which fields to select</b> in the query
                      </>
                    }
                    zh={
                      <>
                        <b>在查询里选哪些字段</b>
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en="OpenAPI documentation, written separately"
                    zh="OpenAPI 文档 —— 单独写、单独维护"
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        The <b>schema</b>, readable through introspection
                        (chapter 08)
                      </>
                    }
                    zh={
                      <>
                        <b>schema</b> —— 通过内省即可读取(第 08 章)
                      </>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout
          tone="idea"
          title={{ en: "Three operation types", zh: "三种操作类型" }}
        >
          <p>
            <T
              en={
                <>
                  Everything sent to that endpoint is one of three operation
                  types. A <code>query</code> reads data. A{" "}
                  <code>mutation</code> writes data; the specification requires
                  that top-level mutation fields execute one after another,
                  while the fields of a query may execute in parallel. A{" "}
                  <code>subscription</code> asks the server to push updates as
                  they happen, over a connection that stays open — usually a
                  WebSocket, not this POST endpoint. Chapter 09 covers all
                  three.
                </>
              }
              zh={
                <>
                  发往这个端点的一切,都属于三种操作类型之一。
                  <code>query</code> 用来读数据。<code>mutation</code>{" "}
                  用来写数据;规范要求顶层 mutation
                  字段按书写顺序串行执行,而 query 的字段可以并行执行。
                  <code>subscription</code> 让服务器在事件发生时主动推送,
                  走的是一条保持打开的连接 —— 通常是 WebSocket,不是这个 POST
                  端点。这三种操作,第 09 章逐个展开。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                Open DevTools, and a GraphQL request looks like this on the
                network.
              </>
            }
            zh={<>把 DevTools 打开,GraphQL 请求在网络上其实长这样。</>}
          />
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="http"
              title={{ en: "Request", zh: "请求报文" }}
              code={`POST /graphql HTTP/1.1
Host: rickandmortyapi.com
Content-Type: application/json

{
  "query": "{ character(id: 1) { name status } }"
}`}
              hl={[6]}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title={{ en: "Response", zh: "响应报文" }}
              code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "character": {
      "name": "Rick Sanchez",
      "status": "Alive"
    }
  }
}`}
              hl={[1]}
            />
          }
        />

        <Callout
          tone="deep"
          title={{
            en: "GraphQL travels over an ordinary HTTP POST",
            zh: "GraphQL 走的就是一个普通的 HTTP POST",
          }}
        >
          <p>
            <T
              en={
                <>
                  There is no new protocol here. The request is a normal POST.
                  The body is JSON. The query is a string inside that JSON.
                  GraphQL does not replace HTTP — it is carried by it.
                  Everything you learned about <code>fetch</code>, headers, and
                  DevTools still applies.
                </>
              }
              zh={
                <>
                  这里没有任何新协议:一个普通的 POST 请求,body 是 JSON,
                  查询语句是 JSON 里的一个字符串。GraphQL 不替代 HTTP,
                  而是由 HTTP 承载。你前面学的 <code>fetch</code>、Header、
                  DevTools 全都继续有效。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                One thing does change, and it catches people who arrive from the
                HTTP and REST chapters. Look at the status line of a response
                where something went wrong.
              </>
            }
            zh={
              <>
                但有一件事确实变了,而且刚从 HTTP 和 REST
                两章过来的人最容易在这里翻车。看一个「出了问题」的响应的状态行。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="http"
          title={{
            en: "A response where one field failed",
            zh: "一个字段失败时的响应",
          }}
          code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "post": {
      "title": "Meeting GraphQL",
      "author": null
    }
  },
  "errors": [
    {
      "message": "Author service unavailable",
      "path": ["post", "author"]
    }
  ]
}`}
          hl={[1, 8, 11]}
          note={{
            en: (
              <>
                The status is <code>200 OK</code>. The <code>author</code> field
                is <code>null</code>, and the reason sits in{" "}
                <code>errors</code> with the <code>path</code> that failed. The
                rest of the data is still there and still usable.
              </>
            ),
            zh: (
              <>
                状态码是 <code>200 OK</code>。<code>author</code> 字段是{" "}
                <code>null</code>,失败的原因在 <code>errors</code> 里,
                并用 <code>path</code> 指出是哪个字段。其余数据照常返回,
                仍然可用。
              </>
            ),
          }}
        />

        <Callout
          tone="warn"
          title={{
            en: "200 does not mean the query succeeded",
            zh: "200 不代表查询成功了",
          }}
        >
          <p>
            <T
              en={
                <>
                  A GraphQL server commonly answers <code>200 OK</code> even
                  when part of the query failed. The result is one JSON object
                  that may contain both <code>data</code> and an{" "}
                  <code>errors</code> array. So <code>res.ok</code> tells you
                  that the HTTP request arrived and came back — not that the
                  query worked. Read <code>errors</code>.
                </>
              }
              zh={
                <>
                  即使查询有一部分失败了,GraphQL 服务器通常仍然返回{" "}
                  <code>200 OK</code>。响应是一个 JSON 对象,里面可能同时有{" "}
                  <code>data</code> 和 <code>errors</code> 数组。所以{" "}
                  <code>res.ok</code> 只能说明 HTTP
                  请求发出去又回来了,不能说明查询成功。要判断成败,得读{" "}
                  <code>errors</code>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  What happens to the data? A field that fails becomes{" "}
                  <code>null</code>, and the server keeps executing the rest of
                  the query. If that field was declared non-null in the schema,{" "}
                  <code>null</code> is not allowed there, so the{" "}
                  <code>null</code> moves up to the nearest parent field that
                  does allow it. That is why a single broken field can empty a
                  whole branch of the response, but not the whole response.
                  Chapters 09 and 10 go further.
                </>
              }
              zh={
                <>
                  那数据部分会怎样?出错的字段变成 <code>null</code>,
                  服务器继续执行查询的其余部分。如果这个字段在 schema
                  里被声明为非空(non-null),那里放不下 <code>null</code>,
                  于是这个 <code>null</code> 会向上冒泡到最近的、允许为空的父字段。
                  所以一个字段出错,可能让响应的一整枝变空,但不会让整个响应失败。
                  第 09、10 章还会细说。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 GraphiQL ================= */}
      <Section
        id="graphiql"
        index="05"
        title={{
          en: "GraphiQL: a browser console for a GraphQL API",
          zh: "GraphiQL:浏览器里的 GraphQL 操作台",
        }}
        desc={{
          en: "The extra i stands for graphical. GraphiQL is the standard in-browser editor for GraphQL, and it is where you will practise.",
          zh: "多出来的那个 i 读作 graphical。它是 GraphQL 官方的浏览器编辑器,也是你练手的主场。",
        }}
      >
        <GraphiqlTour />
        <Callout
          tone="idea"
          title={{
            en: "Where do the autocomplete and the documentation come from?",
            zh: "自动补全和文档是哪来的?",
          }}
        >
          <p>
            <T
              en={
                <>
                  A GraphQL server can describe its own schema. The client sends
                  a query that asks for the list of types and fields, and the
                  server answers with it like any other query. That mechanism is
                  called <b>introspection</b>, and chapter 08 covers it. REST
                  has no equivalent in the protocol: documentation such as
                  OpenAPI is written and published separately, and can drift
                  away from the code.
                </>
              }
              zh={
                <>
                  GraphQL 服务器能描述自己的 schema:
                  客户端发一个查询,问它有哪些类型、哪些字段,
                  服务器像回答任何普通查询一样回答。这个机制叫
                  <b>内省(introspection)</b>,第 08 章展开讲。REST
                  的协议里没有对应机制 —— OpenAPI 这类文档要单独写、单独发布,
                  也就可能和代码逐渐脱节。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One caution: many production servers turn introspection off,
                  because it also tells an attacker exactly what the API
                  contains. If a playground says introspection is disabled, that
                  is usually deliberate.
                </>
              }
              zh={
                <>
                  一点提醒:很多生产环境会关掉内省,
                  因为它同样会把 API 的全部内容原样告诉攻击者。
                  如果某个在线环境提示内省被禁用,那通常是有意为之。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Two public playgrounds need no account and open right now:{" "}
                  <code>rickandmortyapi.com/graphql</code> and{" "}
                  <code>countries.trevorblades.com</code>. The practice tasks
                  below use both.
                </>
              }
              zh={
                <>
                  两个免注册的在线练习场,现在就能打开:
                  <code>rickandmortyapi.com/graphql</code> 和{" "}
                  <code>countries.trevorblades.com</code>{" "}
                  —— 下面的动手任务就在这两个上面做。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 取舍与代价 ================= */}
      <Section
        id="no-sides"
        index="06"
        title={{
          en: "GraphQL does not replace REST",
          zh: "GraphQL 不是 REST 的替代品",
        }}
        desc={{
          en: "GraphQL changes who decides the shape of the response. It does not delete the problems that decision was solving.",
          zh: "GraphQL 改变的是「谁来决定响应的形状」。它并没有消灭这个决定原本在解决的问题。",
        }}
      >
        <AdoptionBars />

        <p className="sec-desc">
          <T
            en={
              <>
                Moving that decision to the client has a price. Three items on
                the bill are worth knowing now, even though chapter 10 is where
                you learn to handle them.
              </>
            }
            zh={
              <>
                把这个决定权交给客户端,是要付代价的。有三笔账现在就该知道,
                尽管真正学会怎么应付它们是在第 10 章。
              </>
            }
          />
        </p>

        <div className="gq-cost">
          <div className="card">
            <div className="card-kicker">cache</div>
            <div className="card-title">
              <T en="HTTP caching stops working" zh="HTTP 缓存不再起作用" />
            </div>
            <p>
              <T
                en={
                  <>
                    An HTTP cache keys entries on the URL and the method. Every
                    GraphQL request is a <code>POST</code> to the same path, so
                    a proxy or CDN has nothing to key on and cannot reuse
                    responses the way it reuses <code>GET</code> resources.
                    GraphQL clients solve this themselves: they keep a
                    normalized cache, storing each object once under a key built
                    from its <code>id</code> and its <code>__typename</code>.
                  </>
                }
                zh={
                  <>
                    HTTP 缓存是按 URL 和方法建索引的。而每个 GraphQL
                    请求都是发往同一条路径的 <code>POST</code>,
                    代理和 CDN 没有可用的键,也就无法像复用 <code>GET</code>{" "}
                    资源那样复用响应。GraphQL 客户端只能自己解决:
                    它们维护一个归一化缓存,按对象的 <code>id</code> 和{" "}
                    <code>__typename</code> 组成的键,把每个对象只存一份。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">cost</div>
            <div className="card-title">
              <T en="The client writes the query" zh="查询是客户端写的" />
            </div>
            <p>
              <T
                en={
                  <>
                    That is the feature, and also the risk: a deeply nested
                    query can be very expensive to execute. Servers add a
                    maximum depth and a complexity budget, and reject queries
                    above it. Many teams go further with{" "}
                    <b>persisted queries</b>: the server accepts only a fixed
                    set of queries it was given in advance, and the client sends
                    an identifier instead of the text. Note that none of this is
                    authorization — GraphQL provides none. Deciding who may read
                    which field is still your own code.
                  </>
                }
                zh={
                  <>
                    这既是它的卖点,也是风险:一个嵌套很深的查询,
                    执行起来可能极其昂贵。服务器要设最大深度和复杂度预算,
                    超出就拒绝。很多团队还会用<b>持久化查询(persisted queries)</b>
                    :服务器只接受事先登记过的一组查询,客户端发的是标识符而不是查询正文。
                    注意这些都不是授权 —— GraphQL 本身不提供授权。
                    谁能读哪个字段,仍然要由你自己的代码来判断。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">N+1</div>
            <div className="card-title">
              <T en="One query per item" zh="每条数据一次查询" />
            </div>
            <p>
              <T
                en={
                  <>
                    On the server, each field is produced by a function called a{" "}
                    <b>resolver</b>. Written in the obvious way, the resolver
                    for <code>author</code> runs one database query per post: 1
                    query for 20 posts, then 20 more for their authors. The
                    standard fix is <b>batching</b>. A loader collects every id
                    requested during one tick of the event loop, fetches them in
                    a single query, and hands each resolver its own row.
                    DataLoader is the common implementation.
                  </>
                }
                zh={
                  <>
                    在服务器上,每个字段的值都由一个函数产生,这个函数叫{" "}
                    <b>resolver</b>。按最直觉的写法,<code>author</code>{" "}
                    的 resolver 会为每篇文章各发一次数据库查询:20
                    篇文章先查 1 次,再为作者查 20 次。标准解法是<b>批处理</b>:
                    用一个 loader 收集同一个事件循环 tick 内请求的全部 id,
                    合成一次查询取回,再把各自的那条数据分发给对应的 resolver。
                    常见实现是 DataLoader。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">
              <T en="Where GraphQL helps most" zh="GraphQL 最能发挥的场景" />
            </div>
            <p>
              <T
                en={
                  <>
                    Several clients that each need different fields, such as
                    iOS, Android, and web. One screen that combines data from
                    several sources. A front-end team that needs to change what
                    it requests without waiting for a new endpoint to be built.
                  </>
                }
                zh={
                  <>
                    多个客户端各要各的字段(iOS、Android、Web);
                    一屏内容需要聚合多个来源的数据;
                    前端要频繁调整取哪些数据,不想每次都等后端加新端点。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T en="Where REST stays simpler" zh="REST 更省事的场景" />
            </div>
            <p>
              <T
                en={
                  <>
                    A public API with one kind of client, content that many
                    people read and few people change, file uploads and
                    downloads, and anything you want a CDN to cache. These are
                    exactly the cases where <code>GET</code> plus HTTP caching
                    is already the answer.
                  </>
                }
                zh={
                  <>
                    只有一类客户端的公开 API;读多写少的内容;文件上传下载;
                    以及任何你希望交给 CDN 缓存的东西。这些正好是{" "}
                    <code>GET</code> 加 HTTP 缓存已经解决好了的场景。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="win"
          title={{ en: "How this course treats it", zh: "这门课的立场" }}
        >
          <p>
            <T
              en={
                <>
                  The next three chapters cover GraphQL properly: the schema as
                  a contract (chapter 08), the three operations (chapter 09),
                  and servers and performance (chapter 10). The finale then puts
                  REST and GraphQL side by side and gives you a decision guide.
                  Learn both before you choose one.
                </>
              }
              zh={
                <>
                  接下来三章把 GraphQL 讲透:schema 作为契约(第 08 章)、
                  三种操作(第 09 章)、服务器与性能(第 10 章)。
                  终章再把 REST 和 GraphQL 摆在一起对比,给你一份选型指南。
                  先把两边都学明白,再谈选谁。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Three tasks. Two use public playgrounds, and the last one sends a query with fetch and nothing else.",
          zh: "三个任务:两个在公开练习场里做,最后一个只用 fetch 把查询发出去。",
        }}
      >
        <LabSet ch="graphql" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Nine questions. Every wrong option has its own explanation.",
          zh: "九道题。每个错误选项都有针对性的解释。",
        }}
      >
        <Quiz ch="graphql" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                GraphQL is a query language for APIs and a runtime that executes
                those queries. It exists because a fixed response shape causes
                two problems: over-fetching (fields the client did not need) and
                under-fetching (extra round trips to assemble one screen).
              </>
            ),
            zh: (
              <>
                GraphQL 是一门面向 API 的查询语言,也是执行这些查询的运行时。
                它的存在是为了解决「响应形状固定」带来的两个问题:
                over-fetching(带回客户端不需要的字段)和
                under-fetching(一屏数据要跑好几趟)。
              </>
            ),
          },
          {
            en: (
              <>
                The client selects the fields, and the response mirrors the
                shape of the query. There is no <code>SELECT *</code> — every
                field must be named.
              </>
            ),
            zh: (
              <>
                字段由客户端选择,响应的形状和查询的形状一一对应。
                这里没有 <code>SELECT *</code> —— 每个字段都必须点名。
              </>
            ),
          },
          {
            en: (
              <>
                By convention there is one endpoint, <code>POST /graphql</code>.
                Resources become types defined in the schema, and choosing an
                endpoint becomes choosing fields.
              </>
            ),
            zh: (
              <>
                惯例是只有一个端点 <code>POST /graphql</code>:资源变成 schema
                里定义的类型,「调哪个端点」变成「选哪些字段」。
              </>
            ),
          },
          {
            en: (
              <>
                It is carried over ordinary HTTP, so <code>fetch</code> is
                enough to send one. But a GraphQL server commonly answers{" "}
                <code>200 OK</code> even when a field failed: that field becomes{" "}
                <code>null</code> and the reason goes into <code>errors</code>.
                Check <code>errors</code>, not <code>res.ok</code>.
              </>
            ),
            zh: (
              <>
                它由普通 HTTP 承载,用 <code>fetch</code> 就能发出去。
                但字段失败时 GraphQL 服务器通常仍返回 <code>200 OK</code>:
                该字段变成 <code>null</code>,原因写进 <code>errors</code>。
                判断成败要看 <code>errors</code>,不是 <code>res.ok</code>。
              </>
            ),
          },
          {
            en: (
              <>
                The trade-off is real: one POST endpoint cannot use HTTP
                caching, the server must limit query depth and cost, and naive
                resolvers cause N+1 queries. 93% of teams work with REST APIs
                and 33% work with GraphQL (Postman, 2025). The finale compares
                the two.
              </>
            ),
            zh: (
              <>
                取舍是实打实的:单个 POST 端点用不上 HTTP 缓存,
                服务器必须限制查询的深度和开销,写得随意的 resolver 会带来 N+1
                查询。93% 的团队在使用 REST API,33% 在使用 GraphQL(Postman,
                2025)。两者的正面对比留给终章。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="graphql" />
    </main>
  );
}
