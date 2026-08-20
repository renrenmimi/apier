"use client";

// 终章专属可视化(双语,英文默认):
//  - HeroArena:hero 两侧对照 —— REST / GraphQL,中间是「取舍由你定」。
//  - VersusTable:逐行对比表,11 行,点开看每一行的完整说明。
//  - DecisionRoom:决策指南 —— 五个问题给一份建议,可改答案、可重来。
//  - AdoptionBars:Postman 2025 使用率横条。
//  - HybridDiagram:两种一起用 —— 同一套后端,两个门面。
//  - ReviewWall:全书 12 章复习卡片墙(章节元数据来自 lib/curriculum.ts)。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { CHAPTERS, type ChapterId } from "@/lib/curriculum";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroArena ================= */

export function HeroArena() {
  return (
    <div className="sd-arena" aria-hidden>
      <div className="sd-corner sd-corner-rest">
        <span className="sd-corner-tag">
          <T en="Since 2000" zh="2000 年至今" />
        </span>
        <span className="sd-corner-name">REST</span>
        <span className="sd-corner-desc">
          <T
            en="Resources · HTTP caching · everywhere"
            zh="资源 · HTTP 缓存 · 遍地都是"
          />
        </span>
      </div>
      <div className="sd-bench">
        <span className="sd-bench-ico">⚖️</span>
        <span className="sd-bench-label">
          <T en="Trade-off" zh="取舍" />
        </span>
        <span className="sd-bench-you">
          <T en="Your call" zh="你来定" />
        </span>
      </div>
      <div className="sd-corner sd-corner-gql">
        <span className="sd-corner-tag">
          <T en="Since 2015" zh="2015 年至今" />
        </span>
        <span className="sd-corner-name">GraphQL</span>
        <span className="sd-corner-desc">
          <T
            en="Schema · exact fields · one request"
            zh="契约 · 精确取数 · 一次取整"
          />
        </span>
      </div>
    </div>
  );
}

/* ================= VersusTable ================= */

type Lean = "rest" | "gql" | "tie";

interface VsRow {
  /** 稳定 key,与展示文案无关 */
  id: string;
  dim: ReactNode;
  rest: ReactNode;
  gql: ReactNode;
  lean: Lean;
  detail: ReactNode;
}

const LEAN_LABEL: Record<Lean, ReactNode> = {
  rest: <T en="REST has the advantage" zh="这一行 REST 更省事" />,
  gql: <T en="GraphQL has the advantage" zh="这一行 GraphQL 更强" />,
  tie: <T en="No clear winner — it depends" zh="没有优劣,看场景" />,
};

const VS_ROWS: VsRow[] = [
  {
    id: "endpoints",
    dim: <T en="Endpoints" zh="端点数量" />,
    rest: (
      <T
        en="One path per resource: /posts, /posts/1, /posts/1/comments. The server fixes the list."
        zh="一种资源一条路径:/posts、/posts/1、/posts/1/comments,清单由服务器定死。"
      />
    ),
    gql: (
      <T
        en="One path, POST /graphql. The schema says what exists; the query says what you want."
        zh="只有一条路径 POST /graphql。schema 说明有什么,查询说明要什么。"
      />
    ),
    lean: "tie",
    detail: (
      <T
        en={
          <>
            Many endpoints is not by itself a problem. Each URL is a place where
            you can cache, rate-limit, and log separately. But the list grows:
            every integrator wants a slightly different set of fields, so teams
            keep adding custom endpoints. That pressure is what pushed GitHub
            toward GraphQL. A single endpoint removes the routing work and moves
            the same complexity into the query language.
          </>
        }
        zh={
          <>
            端点多本身不是问题:每个 URL
            都是一个可以单独缓存、单独限流、单独记日志的位置。但清单会膨胀 ——
            每个集成方想要的字段都略有不同,定制端点越加越多,GitHub
            当年就是被这个推向 GraphQL 的。单端点省掉了路由这件事,
            却把同样的复杂度挪进了查询语言。
          </>
        }
      />
    ),
  },
  {
    id: "fields",
    dim: <T en="Choosing fields" zh="取数粒度" />,
    rest: (
      <T
        en="The server fixes the response shape. GET /users/42 returns whatever that endpoint returns."
        zh="响应形状由服务器定:GET /users/42 返回什么就是什么。"
      />
    ),
    gql: (
      <T
        en="The client lists the fields. Ask for name and avatarUrl, and the response has those two."
        zh="字段由客户端点名:只要 name 和 avatarUrl,响应里就只有这两个。"
      />
    ),
    lean: "gql",
    detail: (
      <T
        en={
          <>
            REST can reduce over-fetching too, with a sparse fieldset parameter
            such as <code>?fields=name,avatar</code>, or with a compound
            document that embeds the related records. Both work. Neither is part
            of REST itself, so each API invents its own version and every client
            has to learn it. In GraphQL, selecting fields is the language. On a
            slow mobile network, or where data is billed by the megabyte, this
            is the difference GraphQL was built for.
          </>
        }
        zh={
          <>
            REST 也能减少 over-fetching:加一个 <code>?fields=name,avatar</code>{" "}
            这样的稀疏字段参数,或者返回一份把关联记录一起嵌进来的复合文档。
            两种都管用,但都不属于 REST 本身 —— 每家 API 自己发明一套,
            客户端得逐家学。而在 GraphQL 里,选字段就是语言本身。
            移动端弱网、按流量计费的场景,正是它被设计出来要解决的。
          </>
        }
      />
    ),
  },
  {
    id: "roundtrips",
    dim: <T en="Round trips" zh="往返次数" />,
    rest: (
      <T
        en="A post, its author, and its comments usually mean three requests, often one after another."
        zh="文章、作者、评论三样数据,通常是三次请求,而且常常只能串行。"
      />
    ),
    gql: (
      <T
        en="One query describes the whole tree, and one request returns it, however deep the nesting."
        zh="一次查询描述整棵树,一次请求取回,嵌套多深都是一趟。"
      />
    ),
    lean: "gql",
    detail: (
      <T
        en={
          <>
            REST can cut round trips as well, with an <code>?embed=</code>{" "}
            parameter or an endpoint built for one screen. The cost is another
            endpoint to maintain for every new combination. GraphQL removes the
            round trips, but the work does not disappear — it moves to the
            server, where one query now runs many resolvers. Written without
            batching, that is the N+1 problem from chapter 10.
          </>
        }
        zh={
          <>
            REST 也能减少往返:加一个 <code>?embed=</code>{" "}
            参数,或者为某个页面专门开一个端点。
            代价是每多一种组合就多养一个端点。GraphQL 确实省掉了往返,
            但工作量没有消失,只是挪到了服务端 —— 一次查询要跑很多个 resolver。
            不做批处理,就是第 10 章那个 N+1 问题。
          </>
        }
      />
    ),
  },
  {
    id: "cache",
    dim: <T en="HTTP caching" zh="HTTP 缓存" />,
    rest: (
      <T
        en="GET plus a URL is already a cache key. Browsers, proxies, and CDNs reuse the response."
        zh="GET 加 URL 本身就是缓存键,浏览器、代理、CDN 都能直接复用响应。"
      />
    ),
    gql: (
      <T
        en="One POST path by default. Intermediaries have nothing to key on, so caching moves into the client."
        zh="默认是同一条路径上的 POST。中间设备没有可用的键,缓存只能挪进客户端。"
      />
    ),
    lean: "rest",
    detail: (
      <T
        en={
          <>
            This is the sharpest difference between the two. HTTP caches key
            entries on the method and the URL, so <code>GET /posts/1</code>{" "}
            gives every cache a key and <code>ETag</code>, <code>304</code>, and{" "}
            <code>max-age</code> work without extra code. Every GraphQL query is
            a different body sent to the same path, so a proxy cannot tell two
            queries apart. GraphQL clients answer this with a normalized cache,
            storing each object once under its <code>id</code> and{" "}
            <code>__typename</code>. Persisted queries sent as{" "}
            <code>GET</code> can bring HTTP caching back. Both are real
            solutions, and both are work you do yourself.
          </>
        }
        zh={
          <>
            这是两者之间最锋利的一处差别。HTTP 缓存按方法和 URL 建索引:
            <code>GET /posts/1</code> 天然就是一个键,<code>ETag</code>、
            <code>304</code>、<code>max-age</code> 不用额外写代码就能用。
            而每个 GraphQL 查询都是发往同一条路径的不同请求体,
            代理根本分不清两个查询谁是谁。GraphQL 客户端的答案是归一化缓存:
            按 <code>id</code> 和 <code>__typename</code> 把每个对象只存一份。
            把持久化查询(persisted queries)改用 <code>GET</code> 发送,
            也能把 HTTP 缓存拿回来。两条路都有效,也都得你自己搭。
          </>
        }
      />
    ),
  },
  {
    id: "contract",
    dim: <T en="Typed contract" zh="类型契约" />,
    rest: (
      <T
        en="OpenAPI describes the API in a separate document. Writing it is optional, and it can fall behind the code."
        zh="OpenAPI 是另写一份文档来描述 API。写不写是可选的,而且可能落后于代码。"
      />
    ),
    gql: (
      <T
        en="The schema is part of the running server. Without it there is nothing to execute."
        zh="schema 是运行中的服务器的一部分,没有它就没有东西可执行。"
      />
    ),
    lean: "gql",
    detail: (
      <T
        en={
          <>
            Both sides can have types. The difference is what happens by
            default. An OpenAPI document lives next to the code, so it can drift
            from it and nothing reports the mismatch — unless the team generates
            it from the code or checks it in CI. A GraphQL schema is the thing
            the execution engine reads, and introspection lets a client ask the
            server what the schema is right now. Validation, code generation,
            and editor completion all follow from it.
          </>
        }
        zh={
          <>
            两边都能有类型,差别在默认行为。OpenAPI 文档写在代码旁边,
            可能和代码脱节而没人报警 —— 除非团队从代码生成它,或者在 CI
            里校验它。GraphQL 的 schema 就是执行引擎读的那份东西,
            而且客户端可以通过内省(introspection)直接问服务器
            「你现在的 schema 长什么样」。校验、代码生成、
            编辑器补全都从它长出来。
          </>
        }
      />
    ),
  },
  {
    id: "upload",
    dim: <T en="File upload" zh="文件上传" />,
    rest: (
      <T
        en="multipart/form-data, or a pre-signed URL. Browsers support it directly and every server library handles it."
        zh="multipart/form-data,或者预签名 URL。浏览器原生支持,服务端库也都处理得了。"
      />
    ),
    gql: (
      <T
        en="The specification does not cover it. You add a multipart extension, or use a separate REST endpoint."
        zh="规范里没有这件事。要么装一个 multipart 扩展,要么另开一个 REST 端点。"
      />
    ),
    lean: "rest",
    detail: (
      <T
        en={
          <>
            A GraphQL request body is JSON, and binary data does not fit into
            JSON without being encoded first. The community has an extension
            (the GraphQL multipart request specification), but the common advice
            is simpler: keep uploads and downloads on a REST endpoint, or hand
            the client a pre-signed URL and let it upload straight to storage.
            Using both styles together is a normal design, not a compromise —
            §04 shows what it looks like.
          </>
        }
        zh={
          <>
            GraphQL 的请求体是 JSON,二进制数据不先编码就塞不进去。社区有扩展
            (GraphQL multipart request specification),
            但更常见的建议更简单:上传下载走 REST 端点,
            或者给客户端一个预签名 URL,让它直接传到对象存储。
            两种风格一起用是正常设计,不是妥协 —— §04 会画出它的样子。
          </>
        }
      />
    ),
  },
  {
    id: "errors",
    dim: <T en="Errors" zh="错误模型" />,
    rest: (
      <T
        en="The status code carries the result: 404 not found, 401 not authenticated, 500 server failure."
        zh="结果由状态码承载:404 找不到、401 未认证、500 服务端故障。"
      />
    ),
    gql: (
      <T
        en="Commonly 200 with an errors array, and data that may be only partly filled in."
        zh="通常返回 200,错误装进 errors 数组,data 可能只填了一部分。"
      />
    ),
    lean: "tie",
    detail: (
      <T
        en={
          <>
            Partial results are useful and awkward at the same time. If one
            module on a screen fails, the other nine still render. But your
            monitoring has to read the response body to know that anything went
            wrong, because the status line says <code>200</code>. Chapter 07 has
            the detail that matters here: a failed field becomes{" "}
            <code>null</code>, and if the schema declared it Non-Null, that{" "}
            <code>null</code> travels up to the nearest nullable parent. The{" "}
            <code>application/graphql-response+json</code> media type gives
            servers a way to use status codes again, and support for it is still
            spreading.
          </>
        }
        zh={
          <>
            部分成功既有用也别扭:一屏十个模块坏了一个,另外九个照常渲染;
            但监控必须去读响应体才知道刚才出没出事,因为状态行写着{" "}
            <code>200</code>。这里有个第 07 章讲过的细节:失败的字段会变成{" "}
            <code>null</code>,如果 schema 把它声明成了 Non-Null,这个{" "}
            <code>null</code> 会向上冒泡到最近一个可空的父字段。
            <code>application/graphql-response+json</code>{" "}
            这个媒体类型让服务器可以重新用上状态码,只是生态还在跟进。
          </>
        }
      />
    ),
  },
  {
    id: "learning",
    dim: <T en="Learning curve" zh="学习曲线" />,
    rest: (
      <T
        en="If you know HTTP, you know most of it. curl is enough to try an endpoint."
        zh="会 HTTP 就懂了大半,用 curl 就能试一个端点。"
      />
    ),
    gql: (
      <T
        en="SDL, resolvers, variables, fragments, client caching, depth limits — new concepts on top of HTTP."
        zh="SDL、resolver、变量、fragment、客户端缓存、深度限制 —— HTTP 之上还有一套新概念。"
      />
    ),
    lean: "rest",
    detail: (
      <T
        en={
          <>
            You just walked both paths, so you can judge this one yourself. The
            REST chapters are mostly about using HTTP correctly. The GraphQL
            chapters add a query language and a second kind of server. Every new
            person on the team pays that cost again. Time spent teaching is a
            real number and belongs in the decision.
          </>
        }
        zh={
          <>
            两条路你都刚走完,可以自己判断:REST 那几章基本是在「把 HTTP 用对」,
            GraphQL 那几章则要多学一门查询语言和一种新的服务端写法。
            团队每来一个新人,这笔学习成本就要再付一次 ——
            教学时间是实打实的开销,应该进选型表。
          </>
        }
      />
    ),
  },
  {
    id: "server",
    dim: <T en="Server-side work" zh="服务端成本" />,
    rest: (
      <T
        en="A route and a handler. The shape of each response is decided by the code you wrote."
        zh="一条路由加一个处理函数。每个响应的形状由你写的代码决定。"
      />
    ),
    gql: (
      <T
        en="Resolvers, batching against N+1, a depth limit, a complexity budget, and field-level authorization."
        zh="resolver、对付 N+1 的批处理、深度限制、复杂度预算,还有字段级授权。"
      />
    ),
    lean: "rest",
    detail: (
      <T
        en={
          <>
            Chapter 10 opened this up. A client can change its query and cause
            an N+1 problem on a server nobody touched. Without a depth limit, a
            short query can cost seconds of CPU. And because any field may be
            reached through many paths, authorization has to be decided per
            field rather than per endpoint. Most of this is unnecessary in REST,
            because the server decides the shape of each response in advance.
          </>
        }
        zh={
          <>
            第 10 章拉开过这块幕布:客户端改一次查询,
            就可能在后端一行没改的情况下触发 N+1;不设深度限制,
            一个很短的查询就能吃掉几秒 CPU;而任何字段都可能通过多条路径被取到,
            所以授权要做到字段级,而不是端点级。这些在 REST 里大多不需要 ——
            因为每个响应的形状是服务器预先定好的。
          </>
        }
      />
    ),
  },
  {
    id: "tooling",
    dim: <T en="Tooling" zh="工具生态" />,
    rest: (
      <T
        en="curl, Postman, browsers, proxies, CDNs, gateways. The deployed infrastructure already understands it."
        zh="curl、Postman、浏览器、代理、CDN、网关 —— 现有基础设施本来就懂它。"
      />
    ),
    gql: (
      <T
        en="GraphiQL gives documentation and completion straight from the schema, and code generation is standard."
        zh="GraphiQL 直接从 schema 长出文档和补全,代码生成也是常规做法。"
      />
    ),
    lean: "tie",
    detail: (
      <T
        en={
          <>
            These are two different kinds of tooling. REST works with
            infrastructure that is already deployed everywhere, which matters
            most when the callers are not you. GraphQL&apos;s tools are
            generated from the schema, so they are always current — and the
            OpenAPI ecosystem, such as Swagger UI, does the same thing when the
            document is generated from the code. Which row wins depends on who
            is calling your API.
          </>
        }
        zh={
          <>
            这是两种不同的工具优势。REST 能直接用上到处都已经部署好的基础设施 ——
            当调用方不是你自己的时候,这一点最要紧。GraphQL 的工具是从 schema
            生成的,所以永远是最新的;而 OpenAPI 生态(比如 Swagger UI)
            在文档由代码生成时也能做到同样的事。这一行谁更强,
            取决于调用你 API 的是谁。
          </>
        }
      />
    ),
  },
  {
    id: "scale",
    dim: <T en="Team and scale" zh="团队与规模" />,
    rest: (
      <T
        en="Works at any size. One person can start an API today with no extra setup."
        zh="什么规模都能用。一个人今天就能起一套 API,不需要额外准备。"
      />
    ),
    gql: (
      <T
        en="One schema shared by many teams. The fixed costs are paid once and spread across clients."
        zh="一张 schema 多团队共建。固定成本只付一次,由所有客户端一起分摊。"
      />
    ),
    lean: "tie",
    detail: (
      <T
        en={
          <>
            This row is the sum of the ten above it. Most of GraphQL&apos;s cost
            is fixed: schema governance, a client cache, depth and complexity
            limits, field-level authorization. Those costs are about the same
            whether you have two clients or twenty, so the cost per client falls
            as the number of clients and teams rises. Netflix and Shopify spread
            them over a very large surface. A single front end pays a similar
            bill and gets much less back, which is why small teams often stay on
            REST.
          </>
        }
        zh={
          <>
            这一行是上面十行的总账。GraphQL 的成本大头是固定成本:schema
            治理、客户端缓存、深度与复杂度限制、字段级授权。
            这些开销无论你有两个客户端还是二十个都差不多,
            所以端和团队越多,摊到每个客户端头上就越便宜。Netflix、Shopify
            是在很大的面上摊这笔账;而只有一个前端的项目账单差不多,
            收益却小得多 —— 所以小团队常常留在 REST。
          </>
        }
      />
    ),
  },
];

export function VersusTable() {
  const [open, setOpen] = useState<number | null>(0);
  const tally = VS_ROWS.reduce(
    (acc, r) => {
      acc[r.lean] += 1;
      return acc;
    },
    { rest: 0, gql: 0, tie: 0 } as Record<Lean, number>,
  );

  return (
    <div className="sd-vs">
      <div className="sd-vs-head" aria-hidden>
        <span>
          <T en="Dimension" zh="维度" />
        </span>
        <span className="sd-head-rest">REST</span>
        <span className="sd-head-gql">GraphQL</span>
      </div>
      {VS_ROWS.map((r, i) => {
        const expanded = open === i;
        return (
          <div key={r.id} className={`sd-vs-row${expanded ? " open" : ""}`}>
            <button
              type="button"
              className="sd-vs-line"
              onClick={() => setOpen(expanded ? null : i)}
              aria-expanded={expanded}
            >
              <span className="sd-vs-dim">
                {r.dim}
                <span className="sd-vs-caret" aria-hidden>
                  ▾
                </span>
              </span>
              <span className="sd-vs-cell">
                <i className="sd-vs-side" data-side="rest">
                  REST
                </i>
                {r.rest}
              </span>
              <span className="sd-vs-cell">
                <i className="sd-vs-side" data-side="gql">
                  GraphQL
                </i>
                {r.gql}
              </span>
            </button>
            {expanded && (
              <div className="sd-vs-detail">
                <span className="sd-lean" data-lean={r.lean}>
                  {LEAN_LABEL[r.lean]}
                </span>
                <p>{r.detail}</p>
              </div>
            )}
          </div>
        );
      })}
      <div className="sd-vs-score">
        <T
          en={
            <>
              REST has the advantage on {tally.rest} rows, GraphQL on{" "}
              {tally.gql}, and {tally.tie} rows have no clear winner. This is
              not a score to add up: only the rows your own situation touches
              should affect the decision.
            </>
          }
          zh={
            <>
              REST 更省事的有 {tally.rest} 行,GraphQL 更强的有 {tally.gql} 行,
              还有 {tally.tie} 行不分优劣。这不是一个可以加总的分数 ——
              真正影响决定的,只有你自己场景踩中的那几行。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= DecisionRoom ================= */

type Contender = "rest" | "graphql" | "trpc" | "grpc";

interface DOption {
  label: ReactNode;
  scores: Partial<Record<Contender, number>>;
  reason: ReactNode;
}

interface DQuestion {
  q: ReactNode;
  opts: DOption[];
}

const D_QUESTIONS: DQuestion[] = [
  {
    q: <T en="Who will call this API?" zh="这套 API 主要给谁调用?" />,
    opts: [
      {
        label: (
          <T
            en="Third-party developers outside your company"
            zh="公司外部的第三方开发者"
          />
        ),
        scores: { rest: 3 },
        reason: (
          <T
            en="A public API is judged on how predictable it is. REST plus OpenAPI is what most callers already know, and HTTP caching, gateways, and rate limiting work with no extra setup."
            zh="对外公开的 API,首要指标是可预期。REST 加 OpenAPI 是多数调用方本来就熟悉的东西,HTTP 缓存、网关、限流也都不用额外搭。"
          />
        ),
      },
      {
        label: (
          <T
            en="Your own product, on several kinds of client (app, web, mini program, TV)"
            zh="自家产品,多种客户端(App、Web、小程序、TV)"
          />
        ),
        scores: { graphql: 2 },
        reason: (
          <T
            en="Different clients need different fields. Letting each client select its own fields is the problem GraphQL was designed for."
            zh="不同客户端要的字段不一样。让每个客户端自己选字段,正是 GraphQL 被设计出来要解决的问题。"
          />
        ),
      },
      {
        label: (
          <T
            en="Your own product, with one web front end"
            zh="自家产品,只有一个 Web 前端"
          />
        ),
        scores: { rest: 1, trpc: 2 },
        reason: (
          <T
            en="With one client there is no over-fetching problem large enough to pay for, and REST is enough. If the front end and the back end are one TypeScript codebase, tRPC removes the hand-written client entirely."
            zh="只有一个客户端时,over-fetching 还不值得为它付代价,REST 就够。如果前后端本来就是同一个 TypeScript 代码库,tRPC 可以把手写客户端这一步整个省掉。"
          />
        ),
      },
    ],
  },
  {
    q: (
      <T
        en="How many kinds of client will there be, now and soon?"
        zh="客户端形态,现在和不远的将来会有几种?"
      />
    ),
    opts: [
      {
        label: (
          <T
            en="Three or more, and the list keeps growing"
            zh="三种以上,而且还会增加"
          />
        ),
        scores: { graphql: 2 },
        reason: (
          <T
            en="With many clients, one schema that each client queries differently costs less than a custom endpoint per client."
            zh="客户端一多,「一张 schema、各端各取所需」就比为每种端开定制端点更划算。"
          />
        ),
      },
      {
        label: <T en="One or two, and that is stable" zh="一到两种,基本稳定" />,
        scores: { rest: 1 },
        reason: (
          <T
            en="Few clients means a short endpoint list. There is no aggregation problem to build a layer for."
            zh="客户端少,端点清单就短。没有聚合问题,也就不必为它加一层。"
          />
        ),
      },
    ],
  },
  {
    q: <T en="What does the team look like?" zh="团队是什么形状?" />,
    opts: [
      {
        label: (
          <T
            en="One team, TypeScript on both sides, one repository"
            zh="一拨人,前后端都写 TypeScript,同一个仓库"
          />
        ),
        scores: { trpc: 3 },
        reason: (
          <T
            en="Inside one TypeScript codebase there is no need for a language-neutral contract. tRPC gives the front end the back end's types directly, so a changed signature becomes a compile error."
            zh="在同一个 TypeScript 代码库里,不需要一份跨语言的契约。tRPC 让前端直接拿到后端函数的类型,改一个签名就是一处编译错误。"
          />
        ),
      },
      {
        label: (
          <T
            en="Separate front-end and back-end teams working from a contract"
            zh="前后端两拨人,靠契约协作"
          />
        ),
        scores: { rest: 1, graphql: 1 },
        reason: (
          <T
            en="When two teams work in parallel, the written contract is what keeps them in step: an OpenAPI document, or a GraphQL schema."
            zh="两个团队并行开发时,把它们对齐的是那份写下来的契约 —— OpenAPI 文档,或者 GraphQL schema。"
          />
        ),
      },
      {
        label: (
          <T
            en="Many back-end services in several languages, owned by several teams"
            zh="后端是多语言、多团队的微服务群"
          />
        ),
        scores: { grpc: 2, graphql: 1 },
        reason: (
          <T
            en="gRPC is a common choice for calls between services in different languages. What your clients talk to is a separate decision."
            zh="服务之间跨语言互调,gRPC 是常见选择。客户端对着什么说话,是另一个独立的决定。"
          />
        ),
      },
    ],
  },
  {
    q: (
      <T
        en="Is bandwidth or latency a constraint for your clients?"
        zh="客户端有带宽或延迟上的约束吗?"
      />
    ),
    opts: [
      {
        label: (
          <T
            en="Yes — mobile users on slow networks, or metered data"
            zh="有 —— 弱网移动用户,或者按流量计费"
          />
        ),
        scores: { graphql: 2 },
        reason: (
          <T
            en="Sending only the fields a screen uses makes every response smaller. REST can do this with a fields parameter; in GraphQL it is the default."
            zh="只发这一屏用得上的字段,每个响应都会更小。REST 可以靠 fields 参数做到;在 GraphQL 里这是默认行为。"
          />
        ),
      },
      {
        label: (
          <T
            en="No — internal network, desktop, or service-to-service traffic"
            zh="没有 —— 主要是内网、桌面端,或服务之间的调用"
          />
        ),
        scores: { rest: 1, grpc: 1 },
        reason: (
          <T
            en="When bandwidth is not the constraint, the simpler option wins. For traffic between services, the binary encoding of gRPC saves more than field selection would."
            zh="带宽不是瓶颈时,越简单的方案越好。如果大头是服务之间的调用,gRPC 的二进制编码比精挑字段省得更多。"
          />
        ),
      },
    ],
  },
  {
    q: (
      <T
        en="How many back-end services does one screen read from?"
        zh="一屏数据要从几个后端服务取?"
      />
    ),
    opts: [
      {
        label: (
          <T
            en="Several — combining sources is normal here"
            zh="好几个 —— 聚合是常态"
          />
        ),
        scores: { graphql: 2, grpc: 1 },
        reason: (
          <T
            en="Combining sources is what a GraphQL layer is good at: each team owns a subgraph, and a router assembles the query. The calls behind it can run over gRPC."
            zh="聚合正是 GraphQL 层擅长的事:每个团队维护自己的子图(subgraph),路由器负责拼装查询。它身后的服务间调用可以走 gRPC。"
          />
        ),
      },
      {
        label: (
          <T
            en="One — the client calls a single back end"
            zh="就一个 —— 客户端直接调一个后端"
          />
        ),
        scores: { rest: 1 },
        reason: (
          <T
            en="There is nothing to aggregate. Do not add a layer for a problem you do not have."
            zh="没有需要聚合的东西。不要为一个还不存在的问题加一层。"
          />
        ),
      },
    ],
  },
];

const CONTENDERS: { id: Contender; name: string }[] = [
  { id: "rest", name: "REST" },
  { id: "graphql", name: "GraphQL" },
  { id: "trpc", name: "tRPC" },
  { id: "grpc", name: "gRPC" },
];

const VERDICTS: Record<
  Contender,
  { title: ReactNode; body: ReactNode; counter: ReactNode }
> = {
  rest: {
    title: (
      <T en="Suggested starting point: REST" zh="建议:从 REST 开始" />
    ),
    body: (
      <T
        en="Your answers do not show the problems GraphQL is built to solve: not many kinds of client, nothing to aggregate, and bandwidth is not the constraint. REST is the smaller thing to build and to operate, and HTTP caching works on GET without extra code. It is also what most callers expect — 93% of teams work with REST APIs (Postman, 2025)."
        zh="你的答案里没有出现 GraphQL 要解决的那些问题:客户端形态不多、没有要聚合的东西、带宽也不是瓶颈。REST 是更小的东西,搭起来和运维起来都更省,GET 上的 HTTP 缓存不写额外代码就能用。它也是多数调用方预期的样子 —— 93% 的团队在使用 REST API(Postman,2025)。"
      />
    ),
    counter: (
      <T
        en="The other side: if the number of clients grows, or one screen starts combining several services, you can put a GraphQL layer in front of the REST services you already have. That is an addition, not a rewrite, and the two can run side by side (see §04). And if the front end and the back end are one TypeScript codebase, tRPC saves you writing an API client by hand."
        zh="另一面:如果客户端形态多起来,或者一屏开始要拼好几个服务的数据,你可以在现有 REST 服务前面加一层 GraphQL。那是增量,不是推倒重来,两个门面可以并存(见 §04)。另外,如果前后端本来就是同一个 TypeScript 代码库,tRPC 能省掉手写 API 客户端这件事。"
      />
    ),
  },
  graphql: {
    title: (
      <T en="Suggested starting point: GraphQL" zh="建议:从 GraphQL 开始" />
    ),
    body: (
      <T
        en="Several kinds of client, data assembled from several services, and clients that each need different fields — these are the cases GraphQL was built for. One schema serves every client, and a client can change what it requests without waiting for a new endpoint to be built. GitHub, Netflix, and Shopify all run large GraphQL APIs."
        zh="多种客户端、数据来自多个服务、各端要的字段各不相同 —— 这正是 GraphQL 被设计出来要处理的情况。一张 schema 服务所有客户端,客户端改取数也不必等后端加新端点。GitHub、Netflix、Shopify 都在跑规模很大的 GraphQL API。"
      />
    ),
    counter: (
      <T
        en="The other side: put the fixed costs into the plan before you start. Depth and complexity limits, authorization decided per field, batching so resolvers do not cause N+1 queries, monitoring that reads the errors array, and a client cache to replace HTTP caching. None of it is optional, and it is roughly the same amount of work whether you have two clients or twenty. If nobody has time for it, start with REST."
        zh="另一面:动手之前先把固定成本排进计划 —— 深度与复杂度限制、按字段判断的授权、避免 resolver 触发 N+1 的批处理、会去读 errors 数组的监控,以及一套用来替代 HTTP 缓存的客户端缓存。这些都不是可选项,而且你有两个客户端还是二十个,工作量都差不多。如果没人有余力填这些,先用 REST。"
      />
    ),
  },
  trpc: {
    title: <T en="Worth looking at: tRPC" zh="值得一看:tRPC" />,
    body: (
      <T
        en="One team, TypeScript on both sides, one client. Nobody here needs a contract that other languages can read. tRPC lets the front end call back-end functions with their real types: no schema file, no code generation, and a changed signature becomes a compile error."
        zh="一拨人、前后端都是 TypeScript、只有一个客户端 —— 你们之间不需要一份别的语言也能读的契约。tRPC 让前端直接以真实类型调用后端函数:没有 schema 文件,不用代码生成,改一个签名就是一处编译错误。"
      />
    ),
    counter: (
      <T
        en="Its limit is clear: it only works where both sides are TypeScript. Third-party developers, a native iOS app, or another team's service cannot use it. If you later open the API to callers outside that codebase, you will still publish a REST or GraphQL surface next to it. Note also that tRPC is not another way of writing REST — it calls functions instead of modeling resources."
        zh="它的边界很清楚:只在两端都是 TypeScript 的地方成立。第三方开发者、原生 iOS App、别的团队的服务都用不了。将来要对代码库之外的调用方开放,你还是得在旁边发布一套 REST 或 GraphQL 接口。另外注意,tRPC 不是 REST 的另一种写法 —— 它是在调用函数,不是在建模资源。"
      />
    ),
  },
  grpc: {
    title: <T en="Worth looking at: gRPC" zh="值得一看:gRPC" />,
    body: (
      <T
        en="For calls between back-end services written in different languages, gRPC is a common choice. The contract is a .proto file, the encoding is binary, it runs over HTTP/2, streaming is part of the design, and client code can be generated for many languages."
        zh="后端服务之间跨语言互调,gRPC 是常见选择:契约写在 .proto 文件里,编码是二进制,跑在 HTTP/2 上,原生支持流式,还能为多种语言生成客户端代码。"
      />
    ),
    counter: (
      <T
        en="Keep its place in mind: it carries traffic between services, and it is not the surface your clients talk to. A browser cannot call gRPC directly (grpc-web translates in between), and third-party developers will not install a Protobuf toolchain to use your API. The public or client-facing layer is still REST or GraphQL, with gRPC behind it."
        zh="记住它的位置:它承载的是服务之间的流量,不是客户端面对的那一层。浏览器不能直接调 gRPC(中间要靠 grpc-web 转换),第三方开发者也不会为了调你的 API 去装一套 Protobuf 工具链。对外、对端的那一层仍然是 REST 或 GraphQL,gRPC 在它们身后。"
      />
    ),
  },
};

export function DecisionRoom() {
  const [picks, setPicks] = useState<(number | null)[]>(
    D_QUESTIONS.map(() => null),
  );
  const [showCounter, setShowCounter] = useState(false);

  const answered = picks.filter((p) => p !== null).length;
  const done = answered === D_QUESTIONS.length;

  const scores: Record<Contender, number> = {
    rest: 0,
    graphql: 0,
    trpc: 0,
    grpc: 0,
  };
  const reasons: ReactNode[] = [];
  picks.forEach((p, qi) => {
    if (p === null) return;
    const opt = D_QUESTIONS[qi].opts[p];
    for (const c of CONTENDERS) {
      scores[c.id] += opt.scores[c.id] ?? 0;
    }
    reasons.push(opt.reason);
  });

  const winner = CONTENDERS.reduce((best, c) =>
    scores[c.id] > scores[best.id] ? c : best,
  );
  const top = Math.max(1, scores[winner.id]);
  const verdict = VERDICTS[winner.id];

  const reset = () => {
    setPicks(D_QUESTIONS.map(() => null));
    setShowCounter(false);
  };

  return (
    <div className="sd-dr">
      <div className="sd-dr-head">
        <span className="sd-dr-head-ico" aria-hidden>
          ⚖️
        </span>
        <T
          en="Answer five questions and the guide suggests a starting point. You can change any answer, and the suggestion updates."
          zh="回答五个问题,这份指南会给出一个起点建议。答案随时可以改,建议会跟着更新。"
        />
      </div>

      {D_QUESTIONS.map((q, qi) => (
        <div className="sd-dr-q" key={qi}>
          <div className="sd-dr-qt">
            <span className="sd-dr-qn">Q{qi + 1}</span>
            {q.q}
          </div>
          <div className="sd-dr-opts" role="group">
            {q.opts.map((opt, oi) => (
              <button
                key={oi}
                type="button"
                className={`sd-dr-opt${picks[qi] === oi ? " on" : ""}`}
                onClick={() => {
                  setPicks((prev) => {
                    const next = [...prev];
                    next[qi] = next[qi] === oi ? null : oi;
                    return next;
                  });
                  setShowCounter(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!done && (
        <div className="sd-dr-pending">
          <T
            en={
              <>
                Still {D_QUESTIONS.length - answered} to answer. The suggestion
                appears once all five are done.
              </>
            }
            zh={
              <>
                还有 {D_QUESTIONS.length - answered} 问没答 ——
                五问答完就会给出建议。
              </>
            }
          />
        </div>
      )}

      {done && (
        <div className="sd-dr-result">
          <div className="sd-dr-bars">
            {CONTENDERS.map((c) => (
              <div className="sd-dr-bar" key={c.id}>
                <span className="sd-dr-bar-name">{c.name}</span>
                <span className="sd-dr-track">
                  <span
                    className="sd-dr-fill"
                    data-c={c.id}
                    style={{ width: `${(scores[c.id] / top) * 100}%` }}
                  />
                </span>
                <span className="sd-dr-bar-val">{scores[c.id]}</span>
              </div>
            ))}
          </div>

          <div className="sd-dr-verdict">
            <h4>{verdict.title}</h4>
            <p>{verdict.body}</p>
            <ul className="sd-dr-reasons">
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            {showCounter && (
              <div className="sd-dr-counter">{verdict.counter}</div>
            )}
            <div className="sd-dr-actions">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setShowCounter((v) => !v)}
              >
                {showCounter ? (
                  <T
                    en="Hide the argument against"
                    zh="收起反对意见"
                  />
                ) : (
                  <T
                    en="Show the argument against"
                    zh="看看反对意见"
                  />
                )}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={reset}
              >
                <T en="↻ Start over" zh="↻ 重新来一次" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= AdoptionBars ================= */

const ADOPTION: { name: string; v: number; tone: "rest" | "gql" | "dim" }[] = [
  { name: "REST", v: 93, tone: "rest" },
  { name: "Webhooks", v: 50, tone: "dim" },
  { name: "WebSockets", v: 35, tone: "dim" },
  { name: "GraphQL", v: 33, tone: "gql" },
];

export function AdoptionBars() {
  return (
    <div className="sd-poll">
      {ADOPTION.map((a) => (
        <div className="sd-poll-row" key={a.name}>
          <span className="sd-poll-name">{a.name}</span>
          <span className="sd-poll-track">
            <span
              className="sd-poll-fill"
              data-tone={a.tone}
              style={{ width: `${a.v}%` }}
            />
          </span>
          <span className="sd-poll-val">{a.v}%</span>
        </div>
      ))}
      <div className="sd-poll-cap">
        <T
          en={
            <>
              &ldquo;Which API styles does your team work with?&rdquo;
              Respondents could choose more than one. Source: Postman, 2025
              State of the API, more than 5,700 respondents. 93% of teams work
              with REST APIs and 33% work with GraphQL, so most teams using
              GraphQL are using REST as well. Webhooks and WebSockets are event
              and connection patterns rather than alternatives to either.
            </>
          }
          zh={
            <>
              「你的团队在使用哪些 API 风格?」多选题。数据来源:Postman
              《2025 State of the API》,5700 多名受访者。93% 的团队在使用 REST
              API,33% 在使用 GraphQL,所以用 GraphQL 的团队大多同时也在用
              REST。Webhooks 和 WebSockets 是事件与长连接模式,
              不是这两者的替代品。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= HybridDiagram ================= */

export function HybridDiagram() {
  const L = useL();
  return (
    <div
      className="sd-hybrid"
      role="img"
      aria-label={L({
        en: "Running both: one back end behind two surfaces, a public REST API and a GraphQL layer for the company's own clients",
        zh: "两种一起用:同一套后端,两个门面 —— 对外的 REST API,和给自家客户端用的 GraphQL 层",
      })}
    >
      <div className="sd-hy-node sd-hy-c1">
        <span className="sd-hy-ico" aria-hidden>
          🌍
        </span>
        <T en="Third-party integrators" zh="第三方集成方" />
        <small>
          <T
            en="Servers and scripts you do not control"
            zh="你控制不了的服务器和脚本"
          />
        </small>
      </div>
      <div className="sd-hy-link sd-hy-l1">
        <span className="sd-hy-proto" data-side="rest">
          GET /v1/posts
        </span>
        <span className="sd-hy-arrow" aria-hidden>
          ⟶
        </span>
      </div>
      <div className="sd-hy-node sd-hy-facade sd-hy-rest sd-hy-f1">
        <T en="Public REST surface" zh="对外的 REST 门面" />
        <small>
          <T
            en="Versioned · CDN cache · rate limits · OpenAPI"
            zh="版本化 · CDN 缓存 · 限流 · OpenAPI"
          />
        </small>
      </div>

      <div className="sd-hy-node sd-hy-c2">
        <span className="sd-hy-ico" aria-hidden>
          📱
        </span>
        <T en="Your app, web, and mini program" zh="自家 App · Web · 小程序" />
        <small>
          <T en="Clients your own team owns" zh="你自己团队维护的多端前端" />
        </small>
      </div>
      <div className="sd-hy-link sd-hy-l2">
        <span className="sd-hy-proto" data-side="gql">
          POST /graphql
        </span>
        <span className="sd-hy-arrow" aria-hidden>
          ⟶
        </span>
      </div>
      <div className="sd-hy-node sd-hy-facade sd-hy-gql sd-hy-f2">
        GraphQL BFF
        <small>
          <T
            en="Assembles data · one schema for every client"
            zh="按需聚合 · 一张 schema 伺候所有端"
          />
        </small>
      </div>

      <div className="sd-hy-link sd-hy-l3">
        <span className="sd-hy-proto">
          <T en="Internal calls (gRPC)" zh="内部调用(可用 gRPC)" />
        </span>
        <span className="sd-hy-arrow" aria-hidden>
          ⟶
        </span>
      </div>
      <div className="sd-hy-link sd-hy-l4">
        <span className="sd-hy-proto">
          <T en="Internal calls (gRPC)" zh="内部调用(可用 gRPC)" />
        </span>
        <span className="sd-hy-arrow" aria-hidden>
          ⟶
        </span>
      </div>

      <div className="sd-hy-node sd-hy-core">
        <span className="sd-hy-ico" aria-hidden>
          🍳
        </span>
        <T en="One back end" zh="同一套后端" />
        <small>
          <T
            en="Core services and the database — one copy of the data"
            zh="核心服务 + 数据库 —— 数据只有一份"
          />
        </small>
      </div>
    </div>
  );
}

/* ================= ReviewWall ================= */

const REVIEW: Record<ChapterId, { soul: Loc<string>; keys: Loc<string[]> }> = {
  home: {
    soul: {
      en: "An API is an agreed way to ask for data and get an answer back. The whole course starts from that agreement.",
      zh: "API 是一套事先约好的问答规矩:怎么问,怎么答。全书的世界观从这份约定开始。",
    },
    keys: {
      en: ["client/server", "request-response", "JSON"],
      zh: ["客户端/服务器", "请求-响应", "JSON"],
    },
  },
  http: {
    soul: {
      en: "The method states the intent, the status code states the result, and headers carry the details. REST uses all of it; GraphQL uses HTTP mainly as transport.",
      zh: "方法表达意图,状态码表达结果,Header 补充细节。REST 把这套用满,GraphQL 主要把 HTTP 当运输层。",
    },
    keys: {
      en: ["GET/POST", "status codes", "headers"],
      zh: ["GET/POST", "状态码", "Header"],
    },
  },
  "first-call": {
    soul: {
      en: "fetch rejects only when the request never completed. A 404 or a 500 still resolves, so you check res.ok yourself.",
      zh: "只有请求根本没走完时 fetch 才会 reject;404、500 一样会 resolve,所以要自己查 res.ok。",
    },
    keys: {
      en: ["fetch", "async/await", "DevTools"],
      zh: ["fetch", "async/await", "DevTools"],
    },
  },
  rest: {
    soul: {
      en: "REST is a style, not a protocol: six constraints that produced a web which can be cached, layered, and grown.",
      zh: "REST 是风格不是协议:六条约束,换来一个可缓存、可分层、能长到今天这么大的 Web。",
    },
    keys: {
      en: ["six constraints", "resources", "stateless"],
      zh: ["六大约束", "资源", "无状态"],
    },
  },
  "rest-design": {
    soul: {
      en: "Nouns in the URL, the action in the method, the result in the status code, and errors in a documented format such as RFC 9457.",
      zh: "URL 用名词,动作交给方法,结果交给状态码,错误用 RFC 9457 这类有规范的格式来表达。",
    },
    keys: {
      en: ["plural nouns", "CRUD mapping", "Problem Details"],
      zh: ["名词复数", "CRUD 映射", "Problem Details"],
    },
  },
  "rest-advanced": {
    soul: {
      en: "Pagination, caching, idempotency keys, and a versioning policy. This is where a production API differs from an example.",
      zh: "分页、缓存、幂等键、版本策略 —— 生产环境的 API 和示例 API,差距就在这一章。",
    },
    keys: {
      en: ["cursor pagination", "ETag/304", "Idempotency-Key"],
      zh: ["cursor 分页", "ETag/304", "Idempotency-Key"],
    },
  },
  auth: {
    soul: {
      en: "401 means the server does not know who you are; 403 means it does and still refuses. A JWT is signed, not hidden. OAuth grants access without sharing a password.",
      zh: "401 是「不知道你是谁」,403 是「知道你是谁但不许」。JWT 只是签了名,不是藏起来;OAuth 让你不交出密码也能授权。",
    },
    keys: {
      en: ["JWT", "OAuth + PKCE", "CORS"],
      zh: ["JWT", "OAuth + PKCE", "CORS"],
    },
  },
  graphql: {
    soul: {
      en: "Over-fetching and under-fetching are the two problems. GraphQL answers them with one endpoint and a query language.",
      zh: "over-fetching 和 under-fetching 是两个问题,GraphQL 的答案是一个端点加一门查询语言。",
    },
    keys: {
      en: ["one endpoint", "field selection", "query language"],
      zh: ["单端点", "精确取数", "查询语言"],
    },
  },
  schema: {
    soul: {
      en: "The schema is the contract: types, nullability, and deprecations are written down, and introspection lets a client read the current one.",
      zh: "schema 就是那份契约:类型、可空性、废弃字段都白纸黑字写着,内省让客户端能读到当前这一版。",
    },
    keys: {
      en: ["SDL", "Non-Null (!)", "introspection"],
      zh: ["SDL", "Non-Null(!)", "introspection"],
    },
  },
  operations: {
    soul: {
      en: "query reads, mutation writes, subscription listens. Variables and fragments let you reuse the same query text.",
      zh: "query 读、mutation 写、subscription 听;变量和 fragment 让同一段查询文本可以复用。",
    },
    keys: {
      en: ["three operations", "variables", "fragment"],
      zh: ["三种操作", "变量", "fragment"],
    },
  },
  backstage: {
    soul: {
      en: "Every field is produced by a resolver. Without batching, one query per item becomes the N+1 problem, and DataLoader is the standard fix.",
      zh: "每个字段背后都有一个 resolver。不做批处理,一条数据一次查询就成了 N+1;标准解法是 DataLoader。",
    },
    keys: {
      en: ["resolver", "N+1", "DataLoader"],
      zh: ["resolver", "N+1", "DataLoader"],
    },
  },
  showdown: {
    soul: {
      en: "Neither style replaces the other. The decision comes from your situation, and you can now explain it.",
      zh: "两种风格谁也不是谁的替代品。决定来自你的场景,而现在你能把这个决定讲清楚。",
    },
    keys: {
      en: ["choosing", "hybrid", "trade-offs"],
      zh: ["选型", "混合架构", "取舍"],
    },
  },
};

export function ReviewWall() {
  const L = useL();
  return (
    <div className="sd-wall">
      {CHAPTERS.map((c) => {
        const r = REVIEW[c.id];
        return (
          <Link
            key={c.id}
            href={c.href}
            className="card hoverable sd-wall-card"
            style={{ "--hue": c.hue, "--ch-hue": c.hue } as CSSProperties}
          >
            <span className="sd-wall-num">
              {c.num} · {L(c.en)}
            </span>
            <span className="sd-wall-title">{L(c.title)}</span>
            <span className="sd-wall-soul">{L(r.soul)}</span>
            <span className="sd-wall-keys">
              {L(r.keys).map((k) => (
                <span key={k} className="chip">
                  {k}
                </span>
              ))}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
