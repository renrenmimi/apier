"use client";

// 终章 ✦ · 对决与选型(双语,英文默认):
// 逐行对比表 → 决策指南(五问出建议)→ 四个真实决定 → 两种一起用 →
// 全书复习墙 → 动手任务 → 终章测验 → 接下来的路 → 全书要点。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import "./chapter.css";

import { Hero, Section, Callout, KeyPoints, ChapterFooter } from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/showdown-data";
import { T } from "@/lib/i18n";
import {
  HeroArena,
  VersusTable,
  DecisionRoom,
  AdoptionBars,
  HybridDiagram,
  ReviewWall,
} from "./viz";

export default function ShowdownPage() {
  return (
    <main className="page" data-ch="showdown">
      <Hero
        ch="showdown"
        title={{
          en: (
            <>
              Finale: <span className="grad">REST or GraphQL?</span>
            </>
          ),
          zh: (
            <>
              终章:<span className="grad">对比与选型</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              You have now seen both. This chapter teaches no new syntax. It
              teaches one judgment: which style fits which situation. Neither
              one replaces the other, and most teams that use GraphQL run REST
              endpoints as well.
            </>
          ),
          zh: (
            <>
              两边你都学过了。这一章不教新语法,只练一个判断:
              什么场景该用什么。谁也不是谁的替代品 —— 用 GraphQL
              的团队,大多同时也在跑 REST 端点。
            </>
          ),
        }}
        chips={[
          {
            id: "versus",
            n: "01",
            label: { en: "Row by row", zh: "逐行对比" },
          },
          {
            id: "decision",
            n: "02",
            label: { en: "Decision guide", zh: "决策指南" },
          },
          {
            id: "cases",
            n: "03",
            label: { en: "Real decisions", zh: "真实决定" },
          },
          {
            id: "hybrid",
            n: "04",
            label: { en: "Running both", zh: "两种一起用" },
          },
          { id: "review", n: "05", label: { en: "Review", zh: "全书复习" } },
          { id: "labs", n: "06", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "07", label: { en: "Final quiz", zh: "终章测验" } },
          { id: "grad", n: "08", label: { en: "What next", zh: "接下来" } },
        ]}
      >
        <HeroArena />
      </Hero>

      {/* ================= §01 逐行对比 ================= */}
      <Section
        id="versus"
        index="01"
        title={{
          en: "The comparison, row by row",
          zh: "逐行对比:十一个维度",
        }}
        desc={{
          en: "The same blog data, served two ways. Open a row to read the full explanation — each one comes from a chapter you have already finished.",
          zh: "同一份博客数据,两种端法。点开任意一行看完整说明 —— 每一行都来自你已经学完的某一章。",
        }}
      >
        <Callout
          tone="story"
          title={{ en: "Before you read the table", zh: "读表之前" }}
        >
          <p>
            <T
              en={
                <>
                  Through this course, the same blog data was served twice. REST
                  gave it endpoints such as <code>/posts</code> and{" "}
                  <code>/users/42/orders</code>, and used the uniform interface
                  and HTTP caching. GraphQL described the same data in one
                  schema and let each client select the fields it wanted. The
                  table below puts the two side by side. Read it as a list of
                  trade-offs rather than a scoreboard:{" "}
                  <b>what decides the choice is your situation</b>, not a total.
                </>
              }
              zh={
                <>
                  整门课里,同一份博客数据被端出了两次:REST 给了它{" "}
                  <code>/posts</code>、<code>/users/42/orders</code>{" "}
                  这样的端点,靠统一接口和 HTTP 缓存干活;GraphQL 用一张 schema
                  描述同一份数据,让每个客户端自己选字段。
                  下面这张表把两者并排放在一起。请把它当成一份取舍清单,
                  而不是一张记分牌:<b>决定选择的是你的场景</b>,不是总分。
                </>
              }
            />
          </p>
        </Callout>
        <VersusTable />
      </Section>

      {/* ================= §02 决策指南 ================= */}
      <Section
        id="decision"
        index="02"
        title={{
          en: "A decision guide: five questions",
          zh: "决策指南:五个问题",
        }}
        desc={{
          en: "The hard part of a design meeting is not knowing the technology. It is stating the reason out loud.",
          zh: "选型会上难的不是懂不懂技术,是说不说得出理由。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Two other options belong on the table first. Neither is a
                variant of REST, and neither competes with GraphQL on the same
                ground — but both come up in real design meetings.
              </>
            }
            zh={
              <>
                先把另外两个选项摆上桌。它们都不是 REST 的变体,
                也不和 GraphQL 在同一块地方竞争 ——
                但真实的选型会上,它们经常被提起。
              </>
            }
          />
        </p>

        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Another option · RPC" zh="另一种选项 · RPC" />
            </div>
            <div className="card-title">
              <T
                en="tRPC: types across one TypeScript codebase"
                zh="tRPC:同一个 TypeScript 代码库里的类型直通"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    RPC stands for remote procedure call. Instead of modeling
                    resources or writing a query, the client calls a function on
                    the server. tRPC applies that idea inside one TypeScript
                    repository: the back end exports functions, and the front
                    end receives their exact types with no schema file and no
                    code generation. Change a signature and the front end stops
                    compiling. Version 11 is stable, and it is widely used with
                    Next.js.
                  </>
                }
                zh={
                  <>
                    RPC 是 remote procedure call(远程过程调用)的缩写:
                    不建模资源,也不写查询语言,客户端直接调用服务器上的函数。
                    tRPC 把这个思路用在同一个 TypeScript 仓库里 ——
                    后端导出函数,前端拿到它们的确切类型,不需要 schema 文件,
                    也不需要代码生成。改一个签名,前端就编译不过。v11
                    已经稳定,在 Next.js 生态里用得很多。
                  </>
                }
              />
            </p>
            <p>
              <T
                en={
                  <>
                    The limit is equally clear: it only works where both sides
                    are TypeScript, so it cannot serve a public API. It is also
                    a different kind of thing from REST and GraphQL — calling
                    functions, not describing data.
                  </>
                }
                zh={
                  <>
                    边界同样清楚:只在两端都是 TypeScript 的地方成立,
                    所以做不了公开 API。它和 REST、GraphQL 也不是同一类东西 ——
                    它是在调用函数,不是在描述数据。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T
                en="Another option · service to service"
                zh="另一种选项 · 服务之间"
              />
            </div>
            <div className="card-title">
              <T
                en="gRPC: calls between back-end services"
                zh="gRPC:后端服务之间的调用"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    gRPC comes from Google. The contract is written in Protocol
                    Buffers (a binary serialization format), the calls run over
                    HTTP/2, streaming is part of the design, and client code can
                    be generated for many languages. For calls between
                    microservices written in different languages it is a common
                    default.
                  </>
                }
                zh={
                  <>
                    gRPC 出自 Google:契约用 Protocol Buffers
                    (一种二进制序列化格式)来写,调用跑在 HTTP/2 上,
                    流式是设计的一部分,还能为多种语言生成客户端代码。
                    跨语言的微服务之间互相调用,它是常见的默认选择。
                  </>
                }
              />
            </p>
            <p>
              <T
                en={
                  <>
                    A browser cannot call it directly — grpc-web translates in
                    between — so it usually stays inside the network. The layer
                    your clients talk to is still REST or GraphQL.
                  </>
                }
                zh={
                  <>
                    浏览器不能直接调它(中间要靠 grpc-web 转换),
                    所以它通常留在内网。客户端面对的那一层,仍然是 REST 或
                    GraphQL。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <DecisionRoom />

        <Callout
          tone="idea"
          title={{ en: "The guide in four lines", zh: "四行总结" }}
        >
          <p>
            <T
              en={
                <>
                  A public API for outside developers: REST. Many clients and
                  many teams, with one screen assembled from several services:
                  GraphQL, with federation once the graph is large. One team on
                  one TypeScript codebase: tRPC. Calls between internal services
                  in different languages: gRPC. These are starting points rather
                  than rules, and one system often uses more than one of them.
                </>
              }
              zh={
                <>
                  对外给第三方开发者用:REST。多端、多团队,
                  而且一屏数据要从多个服务拼:GraphQL(图大了再上联邦)。
                  同一个 TypeScript 代码库里的一拨人:tRPC。
                  内部跨语言的服务间调用:gRPC。这些是起点而不是规矩 ——
                  而且同一个系统里,常常不止用一种。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 真实决定 ================= */}
      <Section
        id="cases"
        index="03"
        title={{
          en: "How four teams actually decided",
          zh: "四个团队真实的决定",
        }}
        desc={{
          en: "Public decisions, with the reasons the teams gave for them. They did not all decide the same way.",
          zh: "公开的决定,以及团队自己给出的理由 —— 他们的结论并不一致。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "GitHub: added GraphQL, kept REST",
            zh: "GitHub:加了 GraphQL,也留着 REST",
          }}
        >
          <p>
            <T
              en={
                <>
                  GitHub published a GraphQL API in 2016 and described it as the
                  biggest change to its API since it chose JSON over XML. The
                  reason was concrete: every integrator wanted a slightly
                  different set of fields, so the number of custom REST
                  endpoints kept growing. GraphQL let each integrator select
                  fields instead. Ten years later the REST API is still there.
                  GitHub runs both and publishes a page explaining which one to
                  use for what.
                </>
              }
              zh={
                <>
                  GitHub 在 2016 年发布了 GraphQL API,他们自己的说法是:
                  这是把 XML 换成 JSON 以来对 API 最大的一次改动。
                  理由很具体 —— 每个集成方想要的字段都略有不同,
                  定制 REST 端点越加越多;有了 GraphQL,集成方可以自己选字段。
                  十年过去,REST API 依然在那里:两套并行,
                  官方还专门写了一页文档说明什么场景该用哪一套。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One detail is worth noticing. The REST API answers
                  unauthenticated requests, at 60 per hour. The GraphQL API
                  requires a token, and the unauthenticated quota is zero. When
                  a client composes its own query, the server has to know whose
                  budget to charge.
                </>
              }
              zh={
                <>
                  有个细节值得注意:REST API 允许匿名调用,配额是每小时 60 次;
                  GraphQL API 必须带 token,匿名配额是 0。
                  当客户端可以自己组合查询时,
                  服务器必须知道这笔开销该记在谁头上。
                </>
              }
            />
          </p>
        </Callout>

        <CodePair
          left={
            <CodeBlock
              lang="http"
              title={{
                en: "REST · GET /repos/facebook/react (no token needed)",
                zh: "REST · GET /repos/facebook/react(匿名可调)",
              }}
              hl={[9]}
              code={`HTTP/1.1 200 OK
content-type: application/json
x-ratelimit-limit: 60

{
  "id": 10270250,
  "name": "react",
  "full_name": "facebook/react",
  "stargazers_count": 237000,
  "forks_count": 49000,
  "open_issues_count": 700,
  "...": "and many more fields this page will not use"
}`}
              note={{
                en: (
                  <>
                    The page wanted one number and received the whole repository
                    object. That is over-fetching. In exchange, anyone can call
                    it and a CDN can cache the response.
                  </>
                ),
                zh: (
                  <>
                    页面只想要一个数字,拿回来的是整个仓库对象 —— 这就是
                    over-fetching。换来的是:谁都能调,CDN 也能缓存这个响应。
                  </>
                ),
              }}
            />
          }
          right={
            <CodeBlock
              lang="graphql"
              title={{
                en: "GraphQL · POST /graphql (token required)",
                zh: "GraphQL · POST /graphql(必须认证)",
              }}
              code={{
                en: `# The same number, one field
query {
  repository(owner: "facebook", name: "react") {
    stargazerCount
  }
}`,
                zh: `# 同一个数字,一个字段就够
query {
  repository(owner: "facebook", name: "react") {
    stargazerCount
  }
}`,
              }}
              note={{
                en: (
                  <>
                    Exactly the requested field comes back. The server asks for
                    a token first, because it cannot predict the cost of a query
                    it has not seen before.
                  </>
                ),
                zh: (
                  <>
                    要什么就回什么。服务器会先要 token ——
                    因为它没法预知一个没见过的查询要花多少开销。
                  </>
                ),
              }}
            />
          }
        />

        <Callout
          tone="story"
          title={{
            en: "Shopify: moved its Admin API to GraphQL",
            zh: "Shopify:把 Admin API 迁到了 GraphQL",
          }}
        >
          <p>
            <T
              en={
                <>
                  On 1 October 2024 Shopify marked the REST Admin API as legacy,
                  and from 1 April 2025 new public apps submitted to its app
                  store must use the GraphQL Admin API. The context explains the
                  decision: Shopify&apos;s callers are thousands of third-party
                  app developers, and the shapes they need out of products,
                  orders, and inventory vary widely. Rather than maintain two
                  surfaces, Shopify put its investment into the one that lets
                  callers select what they need. That is a strong position, and
                  not the common one — GitHub reached the opposite conclusion
                  with a similar audience.
                </>
              }
              zh={
                <>
                  2024 年 10 月 1 日,Shopify 把 REST Admin API 标记为 legacy
                  (遗留);从 2025 年 4 月 1 日起,
                  新提交到应用商店的公共 App 必须使用 GraphQL Admin API。
                  背景解释了这个决定:Shopify 的调用方是成千上万的第三方 App
                  开发者,他们需要的商品、订单、库存数据形状差别很大。
                  与其同时维护两套接口,
                  不如把投入放在那套允许调用方自己选字段的接口上。
                  这是一个很强硬的立场,但并不是普遍做法 ——
                  面对相似的调用方,GitHub 得出的是相反的结论。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="story"
          title={{
            en: "Netflix: GraphQL as an aggregation layer",
            zh: "Netflix:把 GraphQL 当聚合层",
          }}
        >
          <p>
            <T
              en={
                <>
                  Netflix&apos;s Studio API combines around 70 internal services
                  into one federated graph, with hundreds of developers
                  contributing to it. Each team owns a subgraph, and a router
                  assembles a query that crosses several of them. Netflix open
                  sourced its Spring Boot framework for this, DGS, in 2021.
                  Notice what did not happen: none of the microservices were
                  replaced. GraphQL sits in front of them so a client makes one
                  request instead of many.
                </>
              }
              zh={
                <>
                  Netflix 的 Studio API 用联邦(federation)
                  把大约 70 个内部服务合成一张图,上百名开发者共同参与:
                  每个团队维护自己的子图(subgraph),
                  路由器负责把一个跨多个子图的查询拼起来。2021
                  年他们把配套的 Spring Boot 框架 DGS 开了源。
                  注意没有发生的事:没有任何一个微服务被替换掉 ——
                  GraphQL 站在它们前面,让客户端一次请求就能取到数据。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "Matt Bessey: six years in, moving away from GraphQL",
            zh: "Matt Bessey:用了六年之后,他不再推荐 GraphQL",
          }}
        >
          <p>
            <T
              en={
                <>
                  In 2024 Matt Bessey published{" "}
                  <i>Why, after 6 years, I&apos;m over GraphQL</i>, and it was
                  widely discussed. His argument has four parts.{" "}
                  <b>Attack surface</b>: a client can compose queries you never
                  planned for, and he measured a 128-byte query that cost about
                  ten seconds of CPU on a public API. <b>Authorization</b>:
                  because any field can be reached through many paths,
                  permission has to be decided per field. <b>Performance</b>: a
                  client can change its query and cause N+1 database queries on
                  a server nobody touched. <b>Complexity</b>: every one of those
                  mitigations is more code to write and to maintain.
                </>
              }
              zh={
                <>
                  2024 年,Matt Bessey 写了{" "}
                  <i>Why, after 6 years, I&apos;m over GraphQL</i>,
                  引起了广泛讨论。他的论点有四部分。<b>攻击面</b>:
                  客户端可以组合出你从未设想过的查询 —— 他实测过一个 128
                  字节的查询,在某个公开 API 上吃掉了约 10 秒 CPU。<b>授权</b>:
                  任何字段都可能通过多条路径被取到,所以权限必须做到字段级。
                  <b>性能</b>:客户端改一次查询,
                  就可能在后端一行没改的情况下引发 N+1 数据库查询。
                  <b>复杂度</b>:上面每一条的防御措施,都是要写和要维护的代码。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  He does not claim GraphQL is bad. He says these costs are
                  fixed, and his teams did not have enough clients to spread
                  them over. Operational debugging belongs on the same list: a
                  URL in a log tells you what happened, while{" "}
                  <code>POST /graphql</code> with a <code>200</code> status does
                  not.
                </>
              }
              zh={
                <>
                  他没有说 GraphQL 不好,他说的是:这些成本是固定的,
                  而他的团队没有足够多的客户端来分摊它们。
                  运维排查也属于同一份账单:日志里的一个 URL
                  能告诉你刚才发生了什么,而恒定的 <code>POST /graphql</code>{" "}
                  加 <code>200</code> 做不到。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                Postman asks several thousand teams every year which API styles
                they work with. The 2025 answers look like this.
              </>
            }
            zh={
              <>
                Postman 每年会问几千个团队「你们在使用哪些 API 风格」,2025
                年的答案是这样的。
              </>
            }
          />
        </p>

        <AdoptionBars />

        <Callout
          tone="deep"
          title={{ en: "How to read these numbers", zh: "这组数字怎么读" }}
        >
          <p>
            <T
              en={
                <>
                  For a technology open sourced in 2015, a third of teams is
                  significant adoption. It is also not a replacement: REST at
                  93% is still what nearly everyone works with, and because
                  respondents could choose more than one style, most teams using
                  GraphQL are using REST as well. Together the two numbers
                  describe <b>addition</b>, not succession.
                </>
              }
              zh={
                <>
                  对一门 2015 年才开源的技术来说,三分之一的团队在用,
                  是相当高的采用率。但它也不是替代:REST 的 93%
                  说明几乎所有人仍然在用它;而且这是多选题,用 GraphQL
                  的团队大多同时也在用 REST。两个数字放在一起,说明的是
                  <b>叠加</b>,不是更替。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "The last misconception to clear up",
            zh: "最后一个要拆掉的误区",
          }}
        >
          <p>
            <T
              en={
                <>
                  GraphQL is not a newer version of REST. REST is an{" "}
                  <b>architectural style</b> — a set of constraints on how a
                  system is arranged. GraphQL is a <b>query language</b> and a
                  runtime that executes it. They are not points on the same
                  line, and neither one replaces the other. GitHub runs both.
                  Shopify chose GraphQL. Bessey&apos;s teams went back to REST.
                  All three decisions were reasonable, because the three
                  situations were different.
                </>
              }
              zh={
                <>
                  GraphQL 不是 REST 的新版本。REST 是<b>架构风格</b> ——
                  一组关于系统如何组织的约束;GraphQL 是一门<b>查询语言</b>,
                  外加执行它的运行时。两者不在同一条线上,谁也不是谁的替代品。
                  GitHub 两套都跑,Shopify 选了 GraphQL,Bessey
                  的团队退回了 REST —— 三个决定都合理,因为三边的场景不一样。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 两种一起用 ================= */}
      <Section
        id="hybrid"
        index="04"
        title={{ en: "Running both", zh: "两种一起用" }}
        desc={{
          en: "One back end can have more than one surface. This is a normal design, not a compromise.",
          zh: "同一套后端可以有不止一个门面 —— 这是正常设计,不是妥协。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                By now the pattern is visible. A public surface benefits from
                what REST already has: predictable URLs, HTTP caching, gateways,
                and tooling every caller owns. Your own clients benefit from
                selecting fields and from one request per screen. A company with
                both situations does not have to pick one. It publishes a REST
                API for outside callers and a GraphQL layer for its own clients,
                over the same services. That is how GitHub operates.
              </>
            }
            zh={
              <>
                到这里,模式已经很清楚了。对外的那一层受益于 REST
                已经具备的东西:可预期的 URL、HTTP 缓存、网关,
                以及每个调用方手里都有的工具;自家的客户端则受益于按需选字段和
                「一屏一次请求」。两种情况都有的公司不必二选一 ——
                对外发布一套 REST API,对内提供一层 GraphQL,
                两者建立在同一套服务之上。GitHub 就是这么运作的。
              </>
            }
          />
        </p>

        <HybridDiagram />

        <Callout
          tone="idea"
          title={{
            en: "BFF: where a GraphQL layer usually sits",
            zh: "BFF:GraphQL 层通常待的位置",
          }}
        >
          <p>
            <T
              en={
                <>
                  That inner surface has a name: <b>backend for frontend</b>, or
                  BFF. It is a layer between the general-purpose back end and
                  one group of clients, and its job is to assemble the data
                  those clients need. A GraphQL BFF does not replace your
                  services and does not touch the database directly. It calls
                  the services and returns one response shaped like the query.
                  Netflix&apos;s federated graph is this pattern at a very large
                  size.
                </>
              }
              zh={
                <>
                  对内那一层有个正式名字:<b>BFF</b>(backend for frontend,
                  面向前端的后端)。它是通用后端和某一组客户端之间的一层,
                  职责是把这组客户端需要的数据拼装好。GraphQL 做的 BFF
                  不替代你的服务,也不直接碰数据库 —— 它去调用这些服务,
                  然后返回一个形状和查询一致的响应。Netflix
                  的联邦图就是这个模式在很大规模上的样子。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="deep"
          title={{
            en: "Most systems use more than one style",
            zh: "多数系统不止用一种风格",
          }}
        >
          <p>
            <T
              en={
                <>
                  File uploads on a REST endpoint or a pre-signed URL. Live
                  updates over a WebSocket or a GraphQL subscription. Calls
                  between internal services over gRPC. Screens that combine
                  several sources through a GraphQL layer. A public API as REST
                  with an OpenAPI document. These are different problems. When
                  someone says a whole system uses only one style, the useful
                  question is whether its problems really are that uniform.
                </>
              }
              zh={
                <>
                  文件上传走 REST 端点或预签名 URL;实时更新走 WebSocket 或
                  GraphQL subscription;内部服务之间走 gRPC;
                  需要聚合多个来源的页面走 GraphQL 层;对外公开的 API 走 REST
                  加 OpenAPI 文档。这些本来就是不同的问题。
                  听到「我们整个系统只用某一种」的时候,值得问一句:
                  这些问题真的这么单一吗?
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 全书复习 ================= */}
      <Section
        id="review"
        index="05"
        title={{
          en: "The whole course: twelve chapters, one line each",
          zh: "全书复习:十二章,每章一句",
        }}
        desc={{
          en: "One sentence per chapter. If a sentence does not feel familiar, open that chapter again.",
          zh: "每章一句话。哪一句读着不熟,就点开那一章回去看。",
        }}
      >
        <ReviewWall />
      </Section>

      {/* ================= §06 动手任务 ================= */}
      <Section
        id="labs"
        index="06"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Three tasks: make three decisions, measure one response, and finish every chapter quiz.",
          zh: "三个任务:做三次选型判断、量一次响应大小、把每章的测验做完。",
        }}
      >
        <LabSet ch="showdown" items={LABS} />
      </Section>

      {/* ================= §07 终章测验 ================= */}
      <Section
        id="quiz"
        index="07"
        title={{ en: "Final quiz", zh: "终章测验" }}
        desc={{
          en: "Ten questions covering all twelve chapters. Every wrong option has its own explanation.",
          zh: "十道题,横跨全书十二章。每个错误选项都有针对性的解释。",
        }}
      >
        <Quiz ch="showdown" items={QUIZ} />
      </Section>

      {/* ================= §08 接下来的路 ================= */}
      <Section
        id="grad"
        index="08"
        title={{ en: "Where to go next", zh: "接下来的路" }}
        desc={{
          en: "The course ends here. The part that turns it into a skill happens outside it.",
          zh: "课程到这里结束。真正把它变成能力的部分,发生在课程外面。",
        }}
      >
        <Callout
          tone="win"
          title={{ en: "What you can do now", zh: "你现在会的事" }}
        >
          <p>
            <T
              en={
                <>
                  At the start you were asking where the data on a page comes
                  from. Now you can read the status code semantics in an RFC,
                  design a set of URLs a colleague will recognize, explain why a
                  JWT is signed but not hidden, write a resolver that batches
                  its database calls, and give a reason for choosing one API
                  style over another. That is twelve chapters of ground covered.
                </>
              }
              zh={
                <>
                  刚开始时,你还在问「页面上的数据是从哪来的」。现在你能读懂 RFC
                  里的状态码语义,能设计一套同行一看就懂的 URL,能解释 JWT
                  为什么只是签了名而不是藏起来,能写出会做批处理的 resolver,
                  也能为「选哪种 API 风格」给出理由。这是十二章走下来的结果。
                </>
              }
            />
          </p>
        </Callout>

        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Route 1 · build it" zh="路线一 · 动手" />
            </div>
            <div className="card-title">
              <T en="Build the blog API" zh="把博客 API 真做出来" />
            </div>
            <p>
              <T
                en={
                  <>
                    Write the blog API with Express or Hono, and store the data
                    in a JSON file. Use what you learned: CRUD mapped onto
                    methods, cursor pagination, the RFC 9457 error format, and
                    an <code>Idempotency-Key</code> on the write that needs one.
                  </>
                }
                zh={
                  <>
                    用 Express 或 Hono 写一套博客 API,
                    数据就存在一个 JSON 文件里。把学过的用上:CRUD
                    映射到方法、cursor 分页、RFC 9457 错误格式,
                    以及在需要的写操作上加 <code>Idempotency-Key</code>。
                  </>
                }
              />
            </p>
            <p>
              <T
                en={
                  <>
                    Then put a GraphQL layer over <b>the same data</b>, with
                    GraphQL Yoga or Apollo Server. Building both surfaces over
                    one data source is the clearest way to feel the difference.
                  </>
                }
                zh={
                  <>
                    然后给<b>同一份数据</b>套一层 GraphQL(GraphQL Yoga 或
                    Apollo Server 都行)。
                    在同一份数据上把两个门面都做一遍,是感受差别最直接的方式。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Route 2 · read the source" zh="路线二 · 读原典" />
            </div>
            <div className="card-title">
              <T en="Read the specifications" zh="去读规范" />
            </div>
            <p>
              <T
                en={
                  <>
                    Second-hand summaries go out of date; specifications do not.
                    OpenAPI 3.2 is at <code>spec.openapis.org</code>. The
                    GraphQL tutorial is at <code>graphql.org/learn</code>. The
                    Apollo documentation is at{" "}
                    <code>apollographql.com/docs</code>. HTTP semantics are
                    defined in RFC 9110, at{" "}
                    <code>rfc-editor.org/rfc/rfc9110</code>.
                  </>
                }
                zh={
                  <>
                    二手总结会过时,规范不会:OpenAPI 3.2 在{" "}
                    <code>spec.openapis.org</code>;GraphQL 官方教程在{" "}
                    <code>graphql.org/learn</code>;Apollo 的文档在{" "}
                    <code>apollographql.com/docs</code>;HTTP 语义定义在 RFC
                    9110,<code>rfc-editor.org/rfc/rfc9110</code>。
                  </>
                }
              />
            </p>
            <p>
              <T
                en="At your current level these are readable. That is what the course was for."
                zh="以你现在的水平,这些读得动了 —— 这正是这门课要给你的东西。"
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Route 3 · ship something" zh="路线三 · 做点东西" />
            </div>
            <div className="card-title">
              <T en="Build one small project" zh="做一个小作品" />
            </div>
            <p>
              <T
                en={
                  <>
                    Pick a public API: Open-Meteo for a weather panel, PokeAPI
                    for a Pokemon browser, or the Rick and Morty API, which
                    offers both REST and GraphQL. Building the same small
                    project twice, once in each style, will change how you read
                    the table in §01.
                  </>
                }
                zh={
                  <>
                    挑一个公开 API:Open-Meteo 做天气面板,PokeAPI 做宝可梦图鉴,
                    或者 Rick and Morty API(它同时提供 REST 和 GraphQL)。
                    同一个小作品用两种风格各写一遍,你再回头看 §01 的对比表,
                    感受会不一样。
                  </>
                }
              />
            </p>
            <p>
              <T
                en="A finished project says more than a certificate."
                zh="一个做完的作品,比一张证书更有说服力。"
              />
            </p>
          </div>
        </div>

        <div className="sd-farewell">
          <span className="sd-farewell-mark" aria-hidden>
            ✦
          </span>
          <p>
            <T
              en={
                <>
                  One last thing. This course was not really about REST, and not
                  really about GraphQL. It was about reading a trade-off: what
                  problem does this solve, what does it cost, and does my
                  situation match? New API styles will appear, and someone will
                  announce that an old one is finished. You will be able to
                  check that claim yourself, because you know what to measure.
                  Going from having heard of something to being able to build
                  it, design it, and choose it — that is what learning a subject
                  properly looks like.
                </>
              }
              zh={
                <>
                  最后说一件事。这门课教的其实不是 REST,也不是 GraphQL,
                  而是怎么读懂一个取舍:它解决什么问题?代价是什么?
                  我的场景对得上吗?以后一定会出现新的 API 风格,
                  也一定会有人宣布某种风格已经过时。到那时你能自己核对这个说法,
                  因为你知道该量什么。从「听说过」到「能上手、能设计、能选型」,
                  把一件事学透,大概就是这个样子。
                </>
              }
            />
          </p>
          <p>
            <b>
              <T en="Now go and build something." zh="去做点东西吧。" />
            </b>
          </p>
        </div>
      </Section>

      <KeyPoints
        title={{
          en: "What to take away from the whole course",
          zh: "这一整本书,真正要带走的",
        }}
        points={[
          {
            en: (
              <>
                An API is an agreement about how to ask for data and what comes
                back. REST, GraphQL, tRPC, and gRPC are different ways of
                writing that agreement down.
              </>
            ),
            zh: (
              <>
                API 是一份关于「怎么问、回什么」的约定。REST、GraphQL、tRPC、
                gRPC,是把这份约定写下来的不同方式。
              </>
            ),
          },
          {
            en: (
              <>
                HTTP is the shared foundation: methods, status codes, headers,
                and caching semantics. REST uses all of it. GraphQL uses HTTP
                mainly as transport, and still runs on top of it.
              </>
            ),
            zh: (
              <>
                HTTP 是共同的地基:方法、状态码、Header、缓存语义。REST
                把这套用满;GraphQL 主要把 HTTP 当运输层,但仍然跑在它上面。
              </>
            ),
          },
          {
            en: (
              <>
                REST is an architectural style: resources behind a uniform
                interface. Its strengths are that it is cheap to start and that
                HTTP caching works on <code>GET</code> without extra code. 93%
                of teams work with REST APIs (Postman, 2025).
              </>
            ),
            zh: (
              <>
                REST 是架构风格:资源加统一接口。它的长处是起步成本低,而且{" "}
                <code>GET</code> 上的 HTTP 缓存不用额外写代码就能用。93%
                的团队在使用 REST API(Postman,2025)。
              </>
            ),
          },
          {
            en: (
              <>
                GraphQL is a query language and a runtime: a schema as the
                contract, and fields chosen by the client. It is strongest with
                many clients and with screens assembled from several services.
                Its costs are mostly fixed — a client cache, depth and
                complexity limits, batching against N+1, field-level
                authorization — so they get cheaper per client as the number of
                clients grows. 33% of teams work with GraphQL, and most of them
                work with REST as well.
              </>
            ),
            zh: (
              <>
                GraphQL 是查询语言加运行时:schema 当契约,字段由客户端选。
                它最强的场景是多客户端,以及一屏数据要从多个服务拼起来。
                它的成本大多是固定成本 —— 客户端缓存、深度与复杂度限制、
                对付 N+1 的批处理、字段级授权 ——
                所以客户端越多,摊到每个客户端头上就越便宜。33%
                的团队在使用 GraphQL,而其中大多数同时也在用 REST。
              </>
            ),
          },
          {
            en: (
              <>
                The choice comes from the situation: who calls the API, how many
                kinds of client there are, how the teams are arranged, and
                whether one screen needs several sources. Neither style replaces
                the other, and many systems run both. Being able to explain the
                trade-off is the skill that lasts.
              </>
            ),
            zh: (
              <>
                选择来自场景:谁来调、有几种客户端、团队怎么分、
                一屏要不要拼多个来源。两种风格谁也不是谁的替代品,
                很多系统两种都在跑。真正留得住的能力,
                是能把这个取舍讲清楚。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="showdown" />
    </main>
  );
}
