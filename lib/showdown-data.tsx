"use client";

// 终章 ✦ · 对决与选型 —— 动手任务 LABS + 终章测验 QUIZ 数据(双语,英文默认)。
// 测验横跨全书 12 章,难度比章测高一档;每个错误选项都有针对性纠错。
// 代码块只有注释需要双语,可执行行必须逐字节一致。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T } from "@/lib/i18n";

export const LABS: Lab[] = [
  {
    id: "pick-three",
    title: {
      en: "Three decisions: choose an API style for three products",
      zh: "选型三连:给三个产品各做一次选型",
    },
    d: "medium",
    tags: {
      en: ["choosing", "architecture"],
      zh: ["选型", "架构"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Give each of the three imaginary products below a decision —
                REST, GraphQL, tRPC, gRPC, or more than one of them — and write
                three sentences of reasoning for each. Do not decide by
                instinct. Go back to the five questions in §02 and answer them
                one at a time.
              </>
            }
            zh={
              <>
                给下面三个虚构产品各下一个判断(REST / GraphQL / tRPC / gRPC /
                同时用几种都行),每个写三句理由。别凭感觉,
                回到 §02 决策指南的五个问题挨个过一遍。
              </>
            }
          />
        </p>
        <p>
          <T
            en={
              <>
                <b>A.</b> A recipe app built by one developer: one web front end
                and one small back end, TypeScript on both sides.
                <br />
                <b>B.</b> A bank&apos;s open platform: hundreds of outside
                institutions integrate with it, audit requirements are strict,
                and the interface has to stay stable for ten years.
                <br />
                <b>C.</b> An e-commerce platform: app, web, mini program, TV,
                and till terminals — about 20 kinds of client, with dozens of
                back-end microservices.
              </>
            }
            zh={
              <>
                <b>A.</b> 独立开发者的菜谱 App:就你一个人,一个 Web 前端 +
                一个小后端,两端都是 TypeScript。
                <br />
                <b>B.</b> 银行对外开放平台:上百家第三方机构接入,
                审计要求严格,接口十年不能乱动。
                <br />
                <b>C.</b> 电商中台:App、Web、小程序、TV、POS 收银机…… 20
                种客户端形态,后端几十个微服务。
              </>
            }
          />
        </p>
      </>
    ),
    hint: {
      en: (
        <>
          For each product, answer three things first: who calls it, how many
          kinds of client there are, and what the team looks like. Once those
          three are answered, the decision mostly writes itself. Running more
          than one style is also a normal answer.
        </>
      ),
      zh: (
        <>
          每个产品先答三件事:给谁用?有几种客户端?团队什么形状?
          这三个答案一出,判断基本就写完了。
          「同时用几种」也是正经答案。
        </>
      ),
    },
    solution: (
      <>
        <p>
          <T
            en={
              <>
                <b>A: REST, or tRPC.</b> With one client there is no
                over-fetching problem large enough to pay for, and REST costs
                nothing to start. Since one person writes both sides in
                TypeScript, tRPC gives end-to-end types with no schema file:
                change a function signature and the front end stops compiling.
                GraphQL&apos;s fixed costs — a client cache, depth and
                complexity limits, field-level authorization — have only one
                client to spread across at this size.
              </>
            }
            zh={
              <>
                <b>A:REST,或 tRPC。</b>只有一个客户端时,over-fetching
                还不值得为它付代价,REST 起步是零成本。既然两端都由同一个人用
                TypeScript 写,tRPC 的端到端类型更省心:改一个函数签名,
                前端立刻编译不过,也不需要 schema 文件。这个规模上用
                GraphQL,固定成本(客户端缓存、深度与复杂度限制、字段级授权)
                只有一个客户端来摊。
              </>
            }
          />
        </p>
        <p>
          <T
            en={
              <>
                <b>B: REST plus OpenAPI.</b> Hundreds of integrators need the
                surface they already know: a versioning policy, status code
                semantics, gateway rate limiting, and one audit log line per
                endpoint. All of that already exists in REST infrastructure.
                GraphQL is not impossible here, but it moves work onto you: a
                caller can compose queries you never planned for, so query cost
                limits and per-field authorization become your responsibility,
                and a log line that always reads{" "}
                <code>POST /graphql · 200</code> does not say which data was
                read.
              </>
            }
            zh={
              <>
                <b>B:REST + OpenAPI。</b>上百家集成方需要的是他们本来就熟悉的
                东西:版本策略、状态码语义、网关限流,以及一个端点一条审计日志
                —— 这些在 REST 的基础设施里现成就有。GraphQL
                在这里不是不能用,但它把活挪给了你:调用方可以组合出你从未设想
                过的查询,于是查询开销限制和字段级授权都成了你的责任;而永远写着{" "}
                <code>POST /graphql · 200</code> 的日志,
                看不出刚才读走了哪些数据。
              </>
            }
          />
        </p>
        <p>
          <T
            en={
              <>
                <b>C: GraphQL as an aggregation layer, gRPC between the
                internal services.</b>{" "}
                Twenty kinds of client each needing a different shape is exactly
                where one schema pays off, and federation lets every team own
                its own subgraph. Keep file upload and payment callbacks on REST
                endpoints. This is the normal mixed design rather than a
                compromise, and Netflix&apos;s federated graph is a working
                example of it.
              </>
            }
            zh={
              <>
                <b>C:GraphQL 当聚合层,内部互调用 gRPC。</b>20
                种客户端各要各的形状,正是「一张 schema
                各取所需」最划算的地方,联邦(federation)
                让每个团队维护自己的子图。文件上传、支付回调这类端点保留
                REST。这是正常的混合设计,不是妥协 —— Netflix
                的联邦图就是它的一个实例。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "github-dual",
    title: {
      en: "GitHub, both ways: how many bytes for one number?",
      zh: "GitHub 双轨实测:一个数字要花多少字节",
    },
    d: "medium",
    tags: {
      en: ["REST", "GraphQL", "GitHub"],
      zh: ["REST", "GraphQL", "GitHub"],
    },
    task: (
      <p>
        <T
          en={
            <>
              Open the browser console and request{" "}
              <code>https://api.github.com/repos/facebook/react</code> without a
              token. The only thing you want is one number: the star count (
              <code>stargazers_count</code>). Measure how many characters the
              whole response has. Then write the GraphQL query that asks for
              that one field. GitHub&apos;s GraphQL API requires a token — the
              unauthenticated quota is zero — so write the query without running
              it.
            </>
          }
          zh={
            <>
              打开浏览器 Console,匿名请求{" "}
              <code>https://api.github.com/repos/facebook/react</code>。
              你真正想要的只有一个数字:star 数(
              <code>stargazers_count</code>)。量一量整个响应有多少个字符,
              再写出「只要这一个字段」的等价 GraphQL 查询 —— GitHub 的 GraphQL
              必须带 token(匿名配额为 0),所以只写不跑。
            </>
          }
        />
      </p>
    ),
    hint: {
      en: (
        <>
          Call <code>res.text()</code> first and measure the length of the raw
          text, then <code>JSON.parse</code> it to read the field. Do not fetch
          twice: the unauthenticated quota is 60 requests per hour.
        </>
      ),
      zh: (
        <>
          先 <code>res.text()</code> 拿原始文本量长度,再{" "}
          <code>JSON.parse</code> 取字段。别 fetch 两次 ——
          匿名配额一小时只有 60 次。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="js"
          title={{
            en: "console · REST, no token needed",
            zh: "console · REST 匿名可调",
          }}
          code={{
            en: `const res = await fetch("https://api.github.com/repos/facebook/react");
const text = await res.text();      // the raw text first, so you can measure it
console.log(text.length);           // usually 5,000-7,000 characters
const repo = JSON.parse(text);
console.log(repo.stargazers_count); // the one number you actually wanted`,
            zh: `const res = await fetch("https://api.github.com/repos/facebook/react");
const text = await res.text();      // 先拿原始文本,好量长度
console.log(text.length);           // 通常 5000-7000 个字符
const repo = JSON.parse(text);
console.log(repo.stargazers_count); // 你真正要的只有这一个数字`,
          }}
        />
        <CodeBlock
          lang="graphql"
          title={{
            en: "The equivalent GraphQL query (write it, do not run it)",
            zh: "等价的 GraphQL(只写不跑)",
          }}
          code={{
            en: `# POST https://api.github.com/graphql
# Requires Authorization: Bearer <token> - the unauthenticated quota is zero
query {
  repository(owner: "facebook", name: "react") {
    stargazerCount
  }
}`,
            zh: `# POST https://api.github.com/graphql
# 必须带 Authorization: Bearer <token> —— 匿名配额为 0
query {
  repository(owner: "facebook", name: "react") {
    stargazerCount
  }
}`,
          }}
          note={{
            en: (
              <>
                Read the pair as a trade-off, not a contest. REST returns the
                whole repository object for one number, and anyone can call it
                without a token — which also means a CDN can cache the response.
                GraphQL returns exactly the field you asked for, and asks who
                you are first, because it cannot predict the cost of a query it
                has not seen before.
              </>
            ),
            zh: (
              <>
                这组对比要当取舍读,不是比输赢:REST
                为一个数字端上整只仓库对象,但匿名就能调 ——
                这也意味着 CDN 能缓存这个响应;GraphQL
                要什么就回什么,但会先问你是谁,
                因为它没法预知一个没见过的查询要花多少开销。
              </>
            ),
          }}
        />
      </>
    ),
  },
  {
    id: "twelve-lights",
    title: {
      en: "Graduation: light up all twelve dots in the sidebar",
      zh: "毕业典礼:点亮侧栏全部十二盏灯",
    },
    d: "hard",
    tags: {
      en: ["graduation", "whole course"],
      zh: ["毕业", "全书"],
    },
    task: (
      <p>
        <T
          en={
            <>
              Look at the sidebar: twelve chapters, one dot each. A dot lights
              up only when every question in that chapter&apos;s quiz was
              answered correctly on the first try. Any dot still dark? Go back
              and take that quiz again — read the explanation under each wrong
              option, then redo it until every answer is right. The final quiz
              in §07 counts too. All twelve lit is graduation.
            </>
          }
          zh={
            <>
              看一眼侧栏:十二章,每章一盏灯。
              只有该章测验第一次点击就全对,那盏灯才会亮。还有暗着的?
              回去把那一章的测验再做一遍 ——
              错了就读错误选项下面的讲解,读完重做,直到全对。
              本章下面的终章测验(§07)也算在内。十二盏全亮,才算毕业。
            </>
          }
        />
      </p>
    ),
    hint: {
      en: (
        <>
          Start with the chapter where you got the most wrong. That is where
          reviewing pays the most. The card wall in §05 links to every chapter.
        </>
      ),
      zh: (
        <>
          从错得最多的那章开始 —— 那里复习的收益最大。
          §05 的卡片墙每章都留了入口。
        </>
      ),
    },
    solution: (
      <p>
        <T
          en={
            <>
              No code for this one. Progress is stored in your browser&apos;s
              localStorage under the key <code>apier-progress-v1</code>, so it
              does not travel to another browser — finish it on this machine.
              When all twelve are lit, take a screenshot. Going from not knowing
              what an API is to being able to choose one for a team is what that
              picture records.
            </>
          }
          zh={
            <>
              这题没有代码。进度存在浏览器的 localStorage 里,键名是{" "}
              <code>apier-progress-v1</code>,换浏览器不带走 ——
              所以就在这台机器上打完这场。十二盏全亮的那一刻,截个图:
              从「不知道 API 是什么」到「能替团队做选型」,这张图就是记录。
            </>
          }
        />
      </p>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          A payment service timed out during the night, and the gateway wants to
          retry the request automatically. Under HTTP semantics, which group of
          methods is safe to retry, because every method in it is idempotent?
        </>
      ),
      zh: (
        <>
          深夜,支付服务超时了,网关想自动重试刚才那个请求。按 HTTP
          语义,下面哪一组方法可以放心重试(组内每个方法都幂等)?
        </>
      ),
    },
    opts: [
      { en: <>GET, PUT, DELETE</>, zh: <>GET、PUT、DELETE</> },
      { en: <>GET, POST, PUT</>, zh: <>GET、POST、PUT</> },
      { en: <>POST, PATCH, DELETE</>, zh: <>POST、PATCH、DELETE</> },
      {
        en: <>Only GET; none of the others</>,
        zh: <>只有 GET,别的都不行</>,
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            POST is in this group. Retrying a POST can create a second order or
            charge the card twice. It is the clearest example of a method that
            is not idempotent.
          </>
        ),
        zh: (
          <>
            POST 混进来了 —— 重试一次 POST 就可能多创建一笔订单、多扣一次款,
            它是最典型的非幂等方法。
          </>
        ),
      },
      {
        en: (
          <>
            Neither POST nor PATCH promises idempotency. POST creates again. A
            PATCH changes the result when the patch is relative, such as
            &quot;add 10 to the balance&quot; — running it twice adds 20.
          </>
        ),
        zh: (
          <>
            POST 和 PATCH 都不承诺幂等:POST 会重复创建;PATCH 如果是
            「余额 +10」这种相对补丁,执行两次结果就变了。
          </>
        ),
      },
      {
        en: (
          <>
            Too cautious. PUT replaces the whole resource, so running it once
            and running it ten times leave the same state. DELETE leaves the
            resource gone either way. Idempotency is about the state on the
            server, not about the 404 the second call returns.
          </>
        ),
        zh: (
          <>
            太保守了。PUT 是整体替换,执行一次和执行十次,服务器状态相同;
            DELETE 删一次和删十次,资源都是「没了」—— 两个都幂等。
            幂等看的是服务器状态,不是第二次返回的 404。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Idempotent means running the same request once or N times leaves the
          same effect on the state of the server (RFC 9110). GET, HEAD, and
          OPTIONS are safe and idempotent. PUT and DELETE are idempotent. POST
          and PATCH promise nothing. That is why retrying a non-idempotent
          operation safely needs an <code>Idempotency-Key</code> (chapter 05).
        </>
      ),
      zh: (
        <>
          幂等 = 同一个请求执行 1 次和 N 次,对服务器状态的影响相同(RFC
          9110)。GET/HEAD/OPTIONS 安全且幂等,PUT/DELETE 幂等,POST/PATCH
          不承诺 —— 所以非幂等操作要安全重试,得配 <code>Idempotency-Key</code>
          (第 05 章)。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A user left the page open all night and the token expired. In the
          morning they click &quot;My orders&quot;. What should the server
          answer?
        </>
      ),
      zh: (
        <>
          用户登录后把页面开了一整夜,token 早过期了。早上他点「我的订单」,
          服务器最该回什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            200, with <code>{'{ "error": "token expired" }'}</code> in the body
          </>
        ),
        zh: (
          <>
            200,响应体里写 <code>{'{ "error": "token expired" }'}</code>
          </>
        ),
      },
      {
        en: (
          <>
            401 Unauthorized, with a <code>WWW-Authenticate</code> header
          </>
        ),
        zh: (
          <>
            401 Unauthorized,带上 <code>WWW-Authenticate</code> 头
          </>
        ),
      },
      { en: <>403 Forbidden</>, zh: <>403 Forbidden</> },
      { en: <>404 Not Found</>, zh: <>404 Not Found</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Always returning 200 and putting the error in the body is a REST
            anti-pattern: caches, monitoring, and gateways all treat it as
            success. GraphQL commonly does return 200 with an{" "}
            <code>errors</code> array, but that is a different convention and it
            does not carry over to REST.
          </>
        ),
        zh: (
          <>
            「恒 200、错误塞 body」是 REST 的反模式 ——
            缓存、监控、网关都会把它当成功处理。GraphQL 确实常返回 200 加一个{" "}
            <code>errors</code> 数组,但那是另一套约定,别搬到 REST 上来。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            403 means the server knows who you are and still refuses. An expired
            token means the server <b>no longer knows who you are</b>. Proving
            identity again is what 401 covers.
          </>
        ),
        zh: (
          <>
            403 是「我知道你是谁,但你没权限」。token 过期意味着服务器
            <b>不再确定你是谁</b> —— 先重新证明身份,这是 401 的领地。
          </>
        ),
      },
      {
        en: (
          <>
            The orders are still there; nothing is missing. 404 is sometimes
            used in place of 403 so that the existence of a resource is not
            revealed, but it is never used to report an expired credential.
          </>
        ),
        zh: (
          <>
            订单好端端在那儿,不是找不到。404 有时被用来代替 403
            (不泄露资源是否存在),但从不用来表示「凭证过期」。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          401 is an authentication problem: no credential, a wrong one, or an
          expired one — logging in again fixes it. 403 is an authorization
          problem: the identity is known and the action is still refused. The
          status code is named Unauthorized but it means unauthenticated, which
          is the most famous naming mistake in HTTP.
        </>
      ),
      zh: (
        <>
          401 是认证问题(没带、带错、过期 —— 重新登录能解决);403
          是授权问题(身份明确,但不许进)。这个状态码名叫
          Unauthorized、实际意思却是 unauthenticated,是 HTTP
          史上最有名的命名事故。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Which of the following is <b>not</b> one of the six REST constraints
          in Fielding&apos;s dissertation?
        </>
      ),
      zh: <>Fielding 论文里的 REST 六大约束,不包括下面哪一条?</>,
    },
    opts: [
      { en: <>Stateless</>, zh: <>无状态(Stateless)</> },
      { en: <>Uniform interface</>, zh: <>统一接口(Uniform Interface)</> },
      {
        en: <>The data format must be JSON</>,
        zh: <>必须使用 JSON 作为数据格式</>,
      },
      { en: <>Layered system</>, zh: <>分层系统(Layered System)</> },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            Stateless is one of the six: each request carries all the context it
            needs, and session state stays on the client. That constraint is
            half the reason JWT became popular.
          </>
        ),
        zh: (
          <>
            无状态是六约束之一:每个请求自带全部上下文,会话状态放在客户端 ——
            JWT 能流行,一半功劳归它。
          </>
        ),
      },
      {
        en: (
          <>
            The uniform interface is the constraint that separates REST from
            other architectural styles, and HATEOAS is one of its four parts.
          </>
        ),
        zh: (
          <>
            统一接口正是把 REST 与其他架构风格区分开的核心约束,HATEOAS
            就是它的四条子约束之一。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Layered system is on the list: the client does not need to know how
            many proxies or gateways sit in between. That is what lets a CDN be
            added at any point.
          </>
        ),
        zh: (
          <>
            分层系统在列:客户端不需要知道中间隔了几层代理和网关 ——
            CDN 能随手插进来,靠的就是它。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The six are client-server, stateless, cacheable, uniform interface,
          layered system, and code on demand (the only optional one). REST says
          nothing about the data format. JSON is an industry habit, not a REST
          rule. &quot;REST equals JSON over HTTP&quot; is the largest
          misconception in this course, and this is the last time it gets taken
          apart.
        </>
      ),
      zh: (
        <>
          六约束:客户端-服务器、无状态、可缓存、统一接口、分层系统、
          按需代码(唯一可选的一条)。REST 对数据格式只字未提 —— JSON
          是业界的默契,不是 REST 的规定。「REST = JSON over HTTP」
          是全书最大的误区,这里最后拆一次。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          &quot;Get the paid orders of user 42.&quot; Which design holds up best
          in a code review?
        </>
      ),
      zh: <>「取 42 号用户已支付的订单」,哪个设计最经得起同行评审?</>,
    },
    opts: [
      {
        en: (
          <>
            <code>POST /getUserPaidOrders</code>
          </>
        ),
        zh: (
          <>
            <code>POST /getUserPaidOrders</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>GET /users/42/orders?status=paid</code>
          </>
        ),
        zh: (
          <>
            <code>GET /users/42/orders?status=paid</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>{"GET /api/orders/getByUser?uid=42&paid=true"}</code>
          </>
        ),
        zh: (
          <>
            <code>{"GET /api/orders/getByUser?uid=42&paid=true"}</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>GET /users/42/paid-orders-list</code>
          </>
        ),
        zh: (
          <>
            <code>GET /users/42/paid-orders-list</code>
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A verb went into the URL, and POST is being used for a read. The
            HTTP method is already the verb: GET says &quot;read&quot;, so the
            URL only has to answer &quot;read what&quot;.
          </>
        ),
        zh: (
          <>
            动词进了 URL,还用 POST 做读取 —— HTTP 方法本身就是动词,GET
            已经在说「取」,URL 只该回答「取什么」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            <code>getByUser</code> is still a verb. And a belongs-to
            relationship such as &quot;this user&apos;s orders&quot; reads more
            clearly as a path (<code>/users/42/orders</code>) than as query
            parameters.
          </>
        ),
        zh: (
          <>
            <code>getByUser</code> 还是动词;而且「谁的订单」这种从属关系,
            放在路径里(<code>/users/42/orders</code>)比塞进查询参数清楚得多。
          </>
        ),
      },
      {
        en: (
          <>
            <code>paid-orders-list</code> welds a filter into the resource name.
            What happens tomorrow when you need the unpaid ones — a second
            resource? Filtering is the job of query parameters. Keep the
            resource name clean.
          </>
        ),
        zh: (
          <>
            <code>paid-orders-list</code> 把过滤条件焊死在了资源名里 ——
            明天要「未支付的」怎么办,再造一个资源?
            过滤是查询参数的活,资源名保持干净。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Four rules cover most URL reviews: plural nouns for collections, path
          segments for belongs-to relationships, query parameters for filtering,
          sorting, and pagination, and the method for the action.
        </>
      ),
      zh: (
        <>
          四条口诀能应付九成的 URL 评审:名词复数表示集合,
          路径层级表示从属,过滤、排序、分页交给查询参数,动作交给方法。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A feed table has hundreds of millions of rows, and users scroll
          without stopping. What goes wrong with offset pagination such as{" "}
          <code>{"?page=50000&per_page=20"}</code>, and what should replace it?
        </>
      ),
      zh: (
        <>
          信息流表有上亿行,用户会无限下滑。
          <code>{"?page=50000&per_page=20"}</code> 这种 offset
          分页会出什么事,该换成什么?
        </>
      ),
    },
    opts: [
      {
        en: <>Nothing goes wrong; the database optimizes deep pages by itself</>,
        zh: <>没事,数据库会自动优化深翻页</>,
      },
      {
        en: (
          <>
            Deep pages get slower, and rows inserted meanwhile cause duplicates
            and skips — switch to cursor pagination
          </>
        ),
        zh: (
          <>
            深翻页越来越慢,而且中途插入新数据会重复或漏条 ——
            换成 cursor(游标)分页
          </>
        ),
      },
      {
        en: (
          <>
            The only problem is that the parameters are long; send them in a
            POST body instead
          </>
        ),
        zh: <>问题只是参数太长,改成 POST 传参就好</>,
      },
      {
        en: <>offset is actually faster, so there is no need to change</>,
        zh: <>offset 反而更快,不用换</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            <code>OFFSET 1000000</code> means the database still reads the first
            million rows and then discards them. That work is real, and no query
            planner can skip it.
          </>
        ),
        zh: (
          <>
            <code>OFFSET 1000000</code> 意味着数据库还是要把前一百万行读完再
            扔掉。这是实打实的执行代价,查询优化器也免不掉。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Changing how the parameters travel does not change how the query
            runs; the database still reads a million rows. Using POST also gives
            up the HTTP caching that GET would have had.
          </>
        ),
        zh: (
          <>
            换传参方式不改变执行方式,数据库照样读一百万行;
            改成 POST 还会把 GET 本来有的 HTTP 缓存一起丢掉。
          </>
        ),
      },
      {
        en: (
          <>
            It is the other way round. The cost of offset grows with the depth.
            A cursor says &quot;give me 20 rows after this one&quot;, which
            stays a single index lookup however deep you go.
          </>
        ),
        zh: (
          <>
            方向反了:offset 的成本随深度增长;cursor 是「从上次那条之后再给 20
            条」,再深都只是一次索引定位。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Cursor pagination (Stripe&apos;s <code>starting_after</code>,
          GraphQL&apos;s Relay connections) remembers where the last page ended.
          That removes both the cost of deep pages and the drift caused by
          inserts, which makes it the standard answer for infinite scroll.
        </>
      ),
      zh: (
        <>
          cursor 分页(Stripe 的 <code>starting_after</code>、GraphQL 的 Relay
          Connections)记住「上次读到哪」,既避开深翻页的代价,
          也避开插入带来的漂移 —— 无限滚动场景的标准答案。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A colleague put a national ID number into the payload of a JWT,
          reasoning that &quot;a JWT is signed, so it is safe&quot;. What is
          wrong with that?
        </>
      ),
      zh: (
        <>
          同事把用户的身份证号放进了 JWT 的 payload,理由是「JWT
          有签名,很安全」。问题出在哪?
        </>
      ),
    },
    opts: [
      {
        en: <>Nothing is wrong; the signature encrypts the payload</>,
        zh: <>没问题,签名会把 payload 加密</>,
      },
      {
        en: (
          <>
            The payload is only Base64URL encoded, so anyone holding the token
            can decode and read it — the signature prevents tampering, not
            reading
          </>
        ),
        zh: (
          <>
            payload 只是 Base64URL 编码,谁拿到 token 谁就能解码看明文 ——
            签名防篡改,不防偷看
          </>
        ),
      },
      {
        en: <>A JWT does not allow custom fields</>,
        zh: <>JWT 不允许存自定义字段</>,
      },
      {
        en: <>An ID number is too long for the JWT size limit</>,
        zh: <>身份证号太长,超出 JWT 的长度限制</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            This is the dangerous misunderstanding. The signature (the third
            part) only proves the content was not changed. The first two parts
            are standard Base64URL: paste the token into jwt.io and the payload
            is readable.
          </>
        ),
        zh: (
          <>
            这正是最危险的误解:签名(第三段)只保证内容没被改过;
            前两段是标准 Base64URL,往 jwt.io 一粘就现原形。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            You can add custom fields (claims) freely. The question was never
            whether you can store it, but whether you should.
          </>
        ),
        zh: (
          <>
            payload 可以随便加自定义字段(claims),
            问题从来不是「能不能存」,而是「该不该存」。
          </>
        ),
      },
      {
        en: (
          <>
            The specification sets no length limit; a long token only makes
            every request larger. The real rule is that the payload is readable
            by anyone who holds it, so sensitive data does not go in.
          </>
        ),
        zh: (
          <>
            规范没有长度限制,太长只是让每个请求变大。真正的红线是:payload
            对任何持有者都可读,敏感数据一律不进。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A JWT is <code>header.payload.signature</code>, and the first two
          parts are Base64URL, which anyone can decode. It solves identity
          verification and tamper detection, not confidentiality. Keep sensitive
          data out, or store only an ID and look the rest up in the database.
        </>
      ),
      zh: (
        <>
          JWT = <code>header.payload.signature</code>,前两段都是可逆的
          Base64URL 编码。它解决的是「验明正身 + 防篡改」,不负责保密 ——
          敏感信息要么不放,要么只放一个 ID,回数据库查。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          The schema says <code>author: User</code>, with no exclamation mark.
          What does that mean for the client?
        </>
      ),
      zh: (
        <>
          schema 里写着 <code>author: User</code>(没有感叹号)。
          这对客户端意味着什么?
        </>
      ),
    },
    opts: [
      {
        en: <>author always has a value, so you can use it directly</>,
        zh: <>author 保证有值,放心用</>,
      },
      {
        en: (
          <>
            author may be null — GraphQL fields are nullable by default, so when
            something fails that field is set to null and the rest of the data
            still comes back
          </>
        ),
        zh: (
          <>
            author 可能是 null —— GraphQL 字段默认可空,
            某处出错时该字段置 null,其他数据照常返回
          </>
        ),
      },
      {
        en: (
          <>
            This is a syntax error; a type must be followed by <code>!</code>
          </>
        ),
        zh: (
          <>
            这是语法错误,类型后面必须带 <code>!</code>
          </>
        ),
      },
      {
        en: <>When author fails it returns an empty string</>,
        zh: <>author 出错时会返回空字符串</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            It is the opposite. GraphQL&apos;s default goes against the habit of
            most languages: without <code>!</code>, the field may be null. A
            front end that does not check for null will fail at runtime.
          </>
        ),
        zh: (
          <>
            恰好相反 —— GraphQL 的默认和多数语言的直觉拧着来:不写{" "}
            <code>!</code> 就是「可能为 null」。前端不判空,运行时就会出错。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Leaving off <code>!</code> is valid, and it is the default.{" "}
            <code>User!</code> (Non-Null) is the extra declaration.
          </>
        ),
        zh: (
          <>
            不带 <code>!</code> 完全合法,而且是默认;<code>User!</code>
            (Non-Null)才是那个「额外声明」。
          </>
        ),
      },
      {
        en: (
          <>
            null is null. The type system does not invent an empty string for
            you, and inventing data is more dangerous than returning null.
          </>
        ),
        zh: (
          <>
            null 就是 null,类型系统不会替你编造一个空字符串 ——
            造假数据比返回 null 危险得多。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Nullable by default is how GraphQL isolates failures: when one
          resolver fails, that field is set to <code>null</code>, the error is
          added to the <code>errors</code> array, and the rest of the response
          is still delivered — this is partial data. Non-Null changes that: the{" "}
          <code>null</code> moves up to the nearest nullable parent, so a
          stricter contract fails over a larger area.
        </>
      ),
      zh: (
        <>
          默认可空是 GraphQL 的失败隔离设计:某个 resolver 出错,
          就地把该字段置 <code>null</code>,把错误记进 <code>errors</code>{" "}
          数组,响应的其余部分照常送达 —— 这就是 partial data。Non-Null
          会改变这一点:<code>null</code> 会向上冒泡到最近一个可空的父字段,
          契约越硬,失败波及的范围越大。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          <code>posts {"{ author }"}</code> made 20 posts trigger 21 database
          queries — the N+1 problem. The standard fix open sourced by Facebook,
          which collects a batch, runs one query, and caches per request, is
          called ____ (one English word).
        </>
      ),
      zh: (
        <>
          <code>posts {"{ author }"}</code> 让 20 篇文章触发了 21
          次数据库查询(N+1)。Facebook 开源的那个「攒一批、查一次、
          每请求缓存」的标准解法叫____(一个英文单词)。
        </>
      ),
    },
    placeholder: { en: "lowercase is fine", zh: "小写英文即可" },
    answers: ["dataloader", "data loader"],
    hint: {
      en: (
        <>
          Data plus loader. It merges several <code>load(id)</code> calls made
          in the same turn of the event loop into one batched query.
        </>
      ),
      zh: (
        <>
          Data + loader(装载机)—— 它把同一轮事件循环里的多次{" "}
          <code>load(id)</code> 合并成一次批量查询。
        </>
      ),
    },
    why: {
      en: (
        <>
          DataLoader merges <code>load(1)</code>, <code>load(2)</code>, and so
          on from the same tick into a single{" "}
          <code>batchLoad([1, 2, …])</code>, and adds a per-request cache. It is
          the standard fix for N+1 and a normal part of a GraphQL server
          (chapter 10).
        </>
      ),
      zh: (
        <>
          DataLoader 把同一 tick 内的 <code>load(1)</code>、<code>load(2)</code>
          …… 合并成一次 <code>batchLoad([1, 2, …])</code>,再加上每请求缓存 ——
          N+1 的标准解法,GraphQL 服务端的常备件(第 10 章)。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          For the same article data, REST&apos;s <code>GET /posts/1</code> can
          be cached by a CDN, while a GraphQL query in the default setup cannot.
          What is the underlying reason?
        </>
      ),
      zh: (
        <>
          同一份文章数据,REST 的 <code>GET /posts/1</code> 能被 CDN
          直接缓存,而默认配置的 GraphQL 查询不能。根本原因是什么?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>GraphQL responses are too large for the cache limit of a CDN</>
        ),
        zh: <>GraphQL 的响应太大,超出 CDN 的缓存上限</>,
      },
      {
        en: (
          <>
            REST&apos;s GET plus a unique URL is already a cache key. GraphQL
            defaults to POST on one endpoint, with the query inside the request
            body, so an intermediary has nothing to key on
          </>
        ),
        zh: (
          <>
            REST 的「GET + 唯一 URL」天然就是缓存键;GraphQL 默认是单端点
            POST,查询藏在请求体里,中间设备没有可用的键
          </>
        ),
      },
      {
        en: <>CDN vendors deliberately do not support GraphQL</>,
        zh: <>CDN 厂商故意不支持 GraphQL</>,
      },
      {
        en: <>GraphQL data is real time, so caching it would be wrong</>,
        zh: <>GraphQL 的数据是实时的,缓存了会出错</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Size is not the reason. Even a very small POST response is not
            stored by an HTTP cache by default. The problem is the key, not the
            volume.
          </>
        ),
        zh: (
          <>
            跟大小无关 —— 再小的 POST 响应,HTTP 缓存默认也不会存。
            问题在「键」,不在「量」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            It is not unwillingness. Two completely different queries arrive at
            the same URL, so a CDN has nothing to tell them apart by.
          </>
        ),
        zh: (
          <>
            不是不想支持,是没得支持:两个完全不同的查询,URL 一模一样,
            CDN 拿什么区分谁是谁?
          </>
        ),
      },
      {
        en: (
          <>
            REST data changes too, and it is still cached. Freshness is handled
            by <code>max-age</code> and <code>ETag</code>. How long to cache is
            a policy question, not the question of whether caching is possible
            at all.
          </>
        ),
        zh: (
          <>
            REST 的数据一样会变,照样能缓存 —— 新鲜度交给 <code>max-age</code>{" "}
            和 <code>ETag</code> 管。缓存多久是策略问题,
            不是「能不能缓存」的问题。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          HTTP caching keys on the method and the URL. To get that back, GraphQL
          has to turn the query into something that can be a key: persisted
          queries (the query text replaced by a hash) sent as <code>GET</code>,
          or a normalized cache inside the client. Both work, and both are work
          you do yourself. This is the sharpest cost difference between the two
          styles.
        </>
      ),
      zh: (
        <>
          HTTP 缓存的世界观是「方法 + URL = 键」。GraphQL 想拿回这份红利,
          就得把查询变成能当键的东西:持久化查询(把查询文本换成哈希)配{" "}
          <code>GET</code> 发送,或者在客户端做归一化缓存。
          两条路都有效,也都得你自己搭 —— 这是两种风格之间最锋利的一处成本差别。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Final judgment. In which of these situations is GraphQL a{" "}
          <b>reasonable default</b>? (Select all that apply)
        </>
      ),
      zh: (
        <>
          毕业判断题:下面哪些场景,GraphQL 是<b>合理的默认选择</b>?(多选)
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            Four kinds of client — app, web, mini program, and car screen — and
            one screen assembles data from five microservices
          </>
        ),
        zh: <>App、Web、小程序、车机四种端,一屏数据要聚合五个微服务</>,
      },
      {
        en: (
          <>
            A large organization where dozens of teams build one data graph
            together, using federation
          </>
        ),
        zh: <>大组织几十个团队共建一张数据图,配联邦(federation)</>,
      },
      {
        en: (
          <>
            An independent developer&apos;s personal blog: one web front end and
            one small back end
          </>
        ),
        zh: <>独立开发者的个人博客:一个 Web 前端 + 一个小后端</>,
      },
      {
        en: (
          <>
            A public data API, open to tens of thousands of third parties and
            callable without a token
          </>
        ),
        zh: <>对外开放给上万第三方、匿名可调的公开数据 API</>,
      },
      {
        en: (
          <>
            A mobile-first product on slow networks, where each client needs a
            different set of fields
          </>
        ),
        zh: <>移动端为主、弱网流量敏感、各端字段需求差异大的产品</>,
      },
    ],
    correct: [0, 1, 4],
    missHint: {
      en: (
        <>
          One is still missing. Look for the situation that hits all three of
          GraphQL&apos;s strong cases at once: several kinds of client, a slow
          network, and different fields per client.
        </>
      ),
      zh: (
        <>
          还漏了一个 —— 找那个把 GraphQL 三大主场
          (多种客户端、弱网、各端字段不同)全踩中的场景。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One choice too many. In that situation, ask who the fixed costs of
          GraphQL — a client cache, depth and complexity limits, field-level
          authorization — would be spread across. A cost that cannot be spread
          is just a cost.
        </>
      ),
      zh: (
        <>
          有一项选多了 —— 想想那个场景里,GraphQL 的固定成本
          (客户端缓存、深度与复杂度限制、字段级授权)由谁来摊?
          摊不薄的成本就是纯负担。
        </>
      ),
    },
    why: {
      en: (
        <>
          Add it up this way. GraphQL&apos;s benefits — selecting fields, one
          schema for many clients, aggregation — multiply by the number of
          clients and teams. Its costs — a client cache, query cost limits, N+1
          batching, monitoring that reads the <code>errors</code> array — are
          close to fixed. A, B, and E spread those costs. C cannot, so REST or
          tRPC is simpler there. D adds a specific problem: anonymous callers
          composing arbitrary queries make query cost and field-level
          authorization your responsibility, which is why GitHub requires a
          token for GraphQL while its REST API still answers unauthenticated
          requests.
        </>
      ),
      zh: (
        <>
          这笔账要这么算:GraphQL 的收益(按需取数、一张 schema
          服务多端、聚合)会乘以客户端和团队的数量;
          它的成本(客户端缓存、查询开销限制、对付 N+1 的批处理、
          会去读 <code>errors</code>{" "}
          数组的监控)则接近固定。A、B、E 能把成本摊薄;C 摊不薄,用 REST 或
          tRPC 更省心;D 还多一个具体问题 ——
          匿名调用方可以组合任意查询,查询开销和字段级授权都成了你的责任,
          这正是 GitHub 的 GraphQL 必须带 token、而 REST API
          仍然允许匿名调用的原因。
        </>
      ),
    },
  },
];
