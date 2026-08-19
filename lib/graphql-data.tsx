"use client";

// 第 07 章 · GraphQL 初见 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语,英文默认)。
// 代码窗里的示例数据统一用英文;只有代码注释需要双语,且两种语言的可执行行完全一致。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "rick-first-query",
    title: {
      en: "Your first query: ask about Rick Sanchez",
      zh: "第一句 query:去问 Rick Sanchez",
    },
    d: "easy",
    tags: ["GraphiQL", "Rick and Morty"],
    task: {
      en: (
        <p>
          Open <code>https://rickandmortyapi.com/graphql</code>. No account is
          needed. In the editor on the left, write your first GraphQL query:{" "}
          <code>{"{ character(id: 1) { name species status } }"}</code>, then
          press ▶ at the top left to run it. Read the response on the right.
          Then <b>add one more field</b> (<code>gender</code>, for example) and
          run it again.
        </p>
      ),
      zh: (
        <p>
          打开 <code>https://rickandmortyapi.com/graphql</code>,免注册,
          浏览器直接开。在左边的编辑器里写下你的第一句 GraphQL 查询:
          <code>{"{ character(id: 1) { name species status } }"}</code>,
          按左上角的 ▶ 运行,看看右边返回了什么。然后<b>加一个字段</b>
          (比如 <code>gender</code>)再跑一次。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          Inside the braces, press Ctrl+Space (on a Mac, ⌥Space or Ctrl+Space).
          Autocomplete lists every field you can select here, so you do not have
          to remember field names.
        </>
      ),
      zh: (
        <>
          在花括号里按 Ctrl+Space(Mac 上是 ⌥Space 或 Ctrl+Space),
          自动补全会把此处能选的字段全部列出来 —— 不必去背字段名。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="json"
            title="Response"
            code={`{
  "data": {
    "character": {
      "name": "Rick Sanchez",
      "species": "Human",
      "status": "Alive"
    }
  }
}`}
          />
          <p>
            Notice two things. The shape of the response matches the shape of
            your query exactly, with an outer <code>data</code> object added.
            And adding one field to the query adds exactly one field to the
            response — no more, no less.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="json"
            title="响应"
            code={`{
  "data": {
    "character": {
      "name": "Rick Sanchez",
      "species": "Human",
      "status": "Alive"
    }
  }
}`}
          />
          <p>
            注意两件事:响应的形状和你查询的形状完全一致,只是外面多套了一层{" "}
            <code>data</code>;查询里加一个字段,响应里就多一个字段 ——
            不多也不少。
          </p>
        </>
      ),
    },
  },
  {
    id: "countries-lookup",
    title: {
      en: "A second API: look up a country",
      zh: "换一个 API:查一个国家",
    },
    d: "easy",
    tags: ["GraphiQL", "Countries"],
    task: {
      en: (
        <p>
          Open <code>https://countries.trevorblades.com</code>, also without an
          account. Run{" "}
          <code>{'{ country(code: "CN") { name capital currency } }'}</code> and
          read the result. Then replace <code>&quot;CN&quot;</code> with{" "}
          <code>&quot;JP&quot;</code>, <code>&quot;FR&quot;</code>, and{" "}
          <code>&quot;BR&quot;</code> and run it again. Finally, open the docs
          panel and look at which other fields the <code>Country</code> type
          has.
        </p>
      ),
      zh: (
        <p>
          打开 <code>https://countries.trevorblades.com</code>,同样免注册。
          运行 <code>{'{ country(code: "CN") { name capital currency } }'}</code>
          ,看看返回什么。然后把 <code>&quot;CN&quot;</code> 换成{" "}
          <code>&quot;JP&quot;</code>、<code>&quot;FR&quot;</code>、
          <code>&quot;BR&quot;</code> 再跑几次。最后打开文档面板,
          看看 <code>Country</code> 类型还有哪些字段。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          A country code is two uppercase letters (ISO 3166-1 alpha-2). In the
          docs panel, follow Query → country → Country to find fields such as{" "}
          <code>languages</code> and <code>continent</code>.
        </>
      ),
      zh: (
        <>
          国家代码是两个大写字母(ISO 3166-1 alpha-2)。文档面板里按 Query →
          country → Country 一路点下去,能看到 <code>languages</code>、
          <code>continent</code> 这些还没用过的字段。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="json"
            title="Response"
            code={`{
  "data": {
    "country": {
      "name": "China",
      "capital": "Beijing",
      "currency": "CNY"
    }
  }
}`}
          />
          <p>
            Two completely unrelated APIs, and the way you write the query, the
            shape of the response, and the way you read the docs are all the
            same. They follow the same specification. That is what a standard
            buys you.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="json"
            title="响应"
            code={`{
  "data": {
    "country": {
      "name": "China",
      "capital": "Beijing",
      "currency": "CNY"
    }
  }
}`}
          />
          <p>
            两个毫不相干的 API,查询的写法、响应的形状、文档的翻法完全一样 ——
            因为它们遵守同一份规范。这就是标准带来的好处。
          </p>
        </>
      ),
    },
  },
  {
    id: "fetch-raw-post",
    title: {
      en: "Send a query with fetch and nothing else",
      zh: "撕掉工具:只用 fetch 发一次查询",
    },
    d: "medium",
    tags: ["fetch", "Console", "POST"],
    task: {
      en: (
        <p>
          No GraphiQL this time. Open any web page, press F12 to open the
          console, and use the <code>fetch</code> you learned in chapter 02 to
          send a POST request to <code>rickandmortyapi.com/graphql</code>. Set
          the header <code>Content-Type: application/json</code>, and make the
          body <code>{'JSON.stringify({ query: "..." })'}</code>. The goal: get
          Rick&apos;s name without using any GraphQL library or tool.
        </p>
      ),
      zh: (
        <p>
          这次不用 GraphiQL。随便打开一个网页,按 F12 进 Console,
          用第 02 章学过的 <code>fetch</code> 直接向{" "}
          <code>rickandmortyapi.com/graphql</code> 发一个 POST 请求:
          header 带 <code>Content-Type: application/json</code>,body 是{" "}
          <code>{'JSON.stringify({ query: "..." })'}</code>。
          目标是:不借助任何 GraphQL 库或工具,拿到 Rick 的名字。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          The query is just a string. Put it in the <code>query</code> key of a
          JSON object. Read the response with <code>res.json()</code>, exactly
          as you would for a REST API.
        </>
      ),
      zh: (
        <>
          查询就是一个普通字符串,放进 JSON 对象的 <code>query</code> 键里。
          响应照旧用 <code>res.json()</code> 读 —— 和调 REST API 没有区别。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const res = await fetch("https://rickandmortyapi.com/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "{ character(id: 1) { name species status } }",
  }),
});
const json = await res.json();
console.log(json.errors); // undefined when nothing failed
console.log(json.data.character.name); // "Rick Sanchez"`}
          />
          <p>
            This experiment proves the main point of the chapter yourself:{" "}
            <b>GraphQL is not a new protocol. It is an ordinary HTTP POST.</b>{" "}
            Everything from the first six chapters still works. Note the second
            line as well: check <code>json.errors</code> before you trust{" "}
            <code>json.data</code>, because a failed field still arrives with
            status 200.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const res = await fetch("https://rickandmortyapi.com/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "{ character(id: 1) { name species status } }",
  }),
});
const json = await res.json();
console.log(json.errors); // 没有失败时是 undefined
console.log(json.data.character.name); // "Rick Sanchez"`}
          />
          <p>
            做完这个实验,你就亲手验证了本章最重要的一点:
            <b>GraphQL 不是新协议,它就是一个普通的 HTTP POST</b>。
            前六章学的东西一样都没作废。也注意倒数第二行:先看{" "}
            <code>json.errors</code>,再去信 <code>json.data</code> ——
            字段失败时状态码依然是 200。
          </p>
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: <>Why did Facebook build GraphQL internally in 2012?</>,
      zh: <>2012 年,Facebook 为什么要在内部造出 GraphQL?</>,
    },
    opts: [
      {
        en: <>REST was too hard to learn, and they wanted something simpler</>,
        zh: <>REST 太难学,工程师们想要个门槛更低的方案</>,
      },
      {
        en: (
          <>
            While rewriting the mobile News Feed, REST responses carried many
            unused fields, and one screen needed several requests in sequence
          </>
        ),
        zh: (
          <>
            重写移动版 News Feed 时,REST
            响应带回一堆用不上的字段,而一屏数据又得串着发好几次请求
          </>
        ),
      },
      {
        en: <>Their database was too slow and needed a faster query language</>,
        zh: <>数据库查询太慢,需要一种更快的数据库语言</>,
      },
      {
        en: <>HTTP was outdated and needed a replacement</>,
        zh: <>HTTP 协议过时了,需要一个替代品</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The opposite: REST is simple, and that is one of its strengths. The
            problem was cost, not difficulty. On a 2G or 3G connection, every
            round trip and every unused field cost real time and real money.
          </>
        ),
        zh: (
          <>
            恰恰相反,REST 很简单,这正是它的优点之一。他们的问题不是「难」,
            是「贵」:在 2G/3G 网络下,每一趟往返、每一个多余字段都是实打实的时间和钱。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            GraphQL does not touch the database. It is a query language between
            the client and the server. How the server reads its database is
            unchanged — and if the resolvers are written carelessly, the N+1
            problem appears (chapter 10).
          </>
        ),
        zh: (
          <>
            GraphQL 不碰数据库 —— 它是客户端与服务器之间的查询语言。
            服务器怎么读数据库还是怎么读;resolver 写得随意,还会出现 N+1
            问题(第 10 章)。
          </>
        ),
      },
      {
        en: (
          <>
            GraphQL runs on HTTP: an ordinary POST request. What it replaces is
            not the protocol. It replaces the habit of letting the server fix
            the shape of every response.
          </>
        ),
        zh: (
          <>
            GraphQL 恰恰跑在 HTTP 上:一个普通的 POST 请求。
            它替代的不是协议,而是「响应形状由服务器定死」这个做法。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Mobile networks in 2012 were slow and expensive. A fixed response
          shape produced both over-fetching (unused fields) and under-fetching
          (extra round trips), and both hurt most on a weak connection. GraphQL
          was the answer to those two problems.
        </>
      ),
      zh: (
        <>
          2012 年的移动网络又慢又贵。响应形状固定,同时带来了
          over-fetching(用不上的字段)和 under-fetching(多跑几趟),
          而弱网把这两笔账都放大了 —— GraphQL 就是冲着这两个问题去的。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: <>Which of these are examples of over-fetching? (Select all)</>,
      zh: <>下面哪些属于 over-fetching(拿多了)?(多选)</>,
    },
    opts: [
      {
        en: (
          <>
            You only need the author&apos;s name, but the response contains a
            user object with 40 fields
          </>
        ),
        zh: <>只想显示作者名字,响应却回来一个 40 个字段的完整 user</>,
      },
      {
        en: (
          <>
            Rendering one post page requires three requests before the data is
            complete
          </>
        ),
        zh: <>渲染一篇帖子页,要连发 3 次请求才能凑齐数据</>,
      },
      {
        en: (
          <>
            A list page shows only titles, but the endpoint returns the full{" "}
            <code>body</code> of every post
          </>
        ),
        zh: (
          <>
            列表页只用标题,接口却把每篇文章完整的 <code>body</code> 都带回来了
          </>
        ),
      },
      {
        en: <>A request goes to the wrong URL and comes back 404</>,
        zh: <>请求发错了 URL,收到 404</>,
      },
    ],
    correct: [0, 2],
    missHint: {
      en: (
        <>
          One is still missing. The test is simple: does the response contain
          data you do not use? Read the options again.
        </>
      ),
      zh: (
        <>
          还漏了一个。判断标准很简单:响应里有没有你根本用不上的数据?
          再扫一遍选项。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One of your picks does not belong. &quot;Three requests before the
          data is complete&quot; is <b>under</b>-fetching, not over-fetching.
          And a 404 means the URL was wrong; it has nothing to do with how much
          data came back.
        </>
      ),
      zh: (
        <>
          选进了不该选的:「连发 3 次才凑齐」是拿得<b>不够</b>
          (under-fetching),不是拿得太多;404 是地址错了,和拿多拿少无关。
        </>
      ),
    },
    why: {
      en: (
        <>
          Over-fetching means the response carries fields the client did not
          need. Under-fetching means the client needs more round trips to
          assemble one screen. A and C both describe unused data in the
          response.
        </>
      ),
      zh: (
        <>
          over-fetching 是响应里带了客户端不需要的字段;under-fetching
          是一屏数据需要多跑几趟。A 和 C 都是「响应里装了用不上的东西」。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Which statement about the relationship between a GraphQL query and its
          response is correct?
        </>
      ),
      zh: <>关于 GraphQL 查询和响应的关系,哪个说法是对的?</>,
    },
    opts: [
      {
        en: (
          <>
            The server decides the format of the response; the query has no
            effect on it
          </>
        ),
        zh: <>响应的格式由服务器决定,跟查询长什么样没关系</>,
      },
      {
        en: (
          <>
            The response <code>data</code> mirrors the shape of the query —
            field for field, no more and no less
          </>
        ),
        zh: (
          <>
            响应的 <code>data</code> 和查询的形状一一对应 ——
            字段一个对一个,不多不少
          </>
        ),
      },
      {
        en: (
          <>
            The response always contains every field of the type; the query is
            only a formality
          </>
        ),
        zh: <>响应永远包含该类型的全部字段,查询只是走个形式</>,
      },
      {
        en: (
          <>
            To receive fewer fields, the client has to delete them after the
            response arrives
          </>
        ),
        zh: <>想少收几个字段,得等响应回来后在前端自己删</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is how REST works: the server decides the shape in advance. In
            GraphQL the query decides it, and the server returns the fields that
            were selected.
          </>
        ),
        zh: (
          <>
            这是 REST 的做法:形状由服务器预先决定。GraphQL 反过来 ——
            形状由查询决定,服务器只返回被选中的字段。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            &quot;Every field&quot; is exactly the over-fetching that GraphQL
            was built to avoid. A field you did not select is not resolved on
            the server and is not sent to you.
          </>
        ),
        zh: (
          <>
            「全部字段」正是 GraphQL 要避免的 over-fetching。
            你没有选的字段,服务器不会去解析,也不会发给你。
          </>
        ),
      },
      {
        en: (
          <>
            Deleting fields in the client does not help: the bytes have already
            crossed the network, so the data cost and the waiting time were
            already spent. GraphQL keeps the extra fields from being sent at
            all.
          </>
        ),
        zh: (
          <>
            在前端删字段没有用:字节已经在网络上跑过一趟了,流量和时间都已经花掉。
            GraphQL 是让多余的字段根本不出发。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          &quot;The response mirrors the shape of the query&quot; is the rule
          worth memorising. Copy the field names from the query into{" "}
          <code>data</code> and you have the JSON you will receive.
        </>
      ),
      zh: (
        <>
          「响应的形状和查询的形状一一对应」是最值得记住的一条规律:
          把查询里的字段名原样映进 <code>data</code>,就是你将收到的 JSON。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          REST exposes many URLs. A GraphQL API conventionally exposes one
          endpoint, and its path is usually ____ (starts with a slash, then
          seven lowercase letters).
        </>
      ),
      zh: (
        <>
          REST 有一堆 URL,GraphQL 惯例上只暴露一个端点,路径通常是____
          (以斜杠开头,后面七个小写字母)。
        </>
      ),
    },
    answers: ["/graphql", "graphql"],
    hint: {
      en: <>It is the name of the language itself, lowercase, after a slash.</>,
      zh: <>就是这门语言自己的名字,全小写,前面加一道斜杠。</>,
    },
    why: {
      en: (
        <>
          The convention is <code>POST /graphql</code>: one entry point for
          every request. The question &quot;which URL do I call&quot; becomes
          &quot;which fields do I select&quot;.
        </>
      ),
      zh: (
        <>
          惯例是 <code>POST /graphql</code>:一个入口,承接所有请求。
          「调哪个 URL」的问题,变成了「选哪些字段」。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>What does a typical GraphQL request from a browser look like?</>,
      zh: <>浏览器发出的一个典型 GraphQL 请求,长什么样?</>,
    },
    opts: [
      {
        en: (
          <>
            <code>GET /graphql?fields=name,status</code> — the fields go in the
            query string
          </>
        ),
        zh: (
          <>
            <code>GET /graphql?fields=name,status</code> —— 字段写进查询参数
          </>
        ),
      },
      {
        en: (
          <>
            <code>POST /graphql</code> with{" "}
            <code>Content-Type: application/json</code>, and the query as a
            string inside the JSON body
          </>
        ),
        zh: (
          <>
            <code>POST /graphql</code>,<code>Content-Type</code> 是{" "}
            <code>application/json</code>,查询语句作为字符串装在 JSON body 里
          </>
        ),
      },
      {
        en: <>It uses a new HTTP method, QUERY, designed for GraphQL</>,
        zh: <>用 HTTP 新增的 QUERY 方法,专门为 GraphQL 设计</>,
      },
      {
        en: <>It does not use HTTP; it uses its own binary protocol</>,
        zh: <>不走 HTTP,走的是专用的二进制协议</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Sending GraphQL over <code>GET</code> is possible, and it is how
            persisted queries can be cached by a CDN (chapter 10). But the
            parameter is <code>query</code>, not <code>fields</code>, and the
            default convention is still POST with a JSON body.
          </>
        ),
        zh: (
          <>
            用 <code>GET</code> 发 GraphQL 确实可行,持久化查询配合 CDN
            缓存就是这么做的(第 10 章)。但参数名是 <code>query</code>,
            不是 <code>fields</code>;而且默认惯例仍然是 POST 加 JSON body。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            An HTTP <code>QUERY</code> method is being standardised, but GraphQL
            did not wait for it. Since 2015 it has used an ordinary POST.
          </>
        ),
        zh: (
          <>
            HTTP 的 <code>QUERY</code> 方法确实在标准化中,但 GraphQL
            没有等它 —— 从 2015 年至今用的都是最普通的 POST。
          </>
        ),
      },
      {
        en: (
          <>
            The opposite is true: GraphQL is carried over ordinary HTTP, and one{" "}
            <code>fetch</code> call is enough to send a query. Lab 03 in this
            chapter has you verify that yourself.
          </>
        ),
        zh: (
          <>
            恰恰相反:GraphQL 由普通 HTTP 承载,一句 <code>fetch</code>{" "}
            就能发出去。本章 Lab 03 就是让你亲手验证这件事。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A GraphQL request is an ordinary HTTP POST. The body is a JSON object
          whose <code>query</code> key holds the query string. Variables, when
          used, go in a <code>variables</code> key beside it.
        </>
      ),
      zh: (
        <>
          GraphQL 请求就是一个普通的 HTTP POST:body 是一个 JSON 对象,
          <code>query</code> 键里装着查询字符串;用到变量时,
          旁边再放一个 <code>variables</code> 键。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A query asked for a post and its author. The author service was down.
          What does the response usually look like?
        </>
      ),
      zh: (
        <>
          一个查询要了帖子和它的作者,而作者服务挂了。这时响应通常长什么样?
        </>
      ),
    },
    opts: [
      {
        en: <>HTTP 500 with an empty body</>,
        zh: <>HTTP 500,body 是空的</>,
      },
      {
        en: (
          <>
            HTTP 200, with <code>data.post.author</code> set to{" "}
            <code>null</code> and the reason listed in an <code>errors</code>{" "}
            array
          </>
        ),
        zh: (
          <>
            HTTP 200,<code>data.post.author</code> 是 <code>null</code>,
            失败的原因写在 <code>errors</code> 数组里
          </>
        ),
      },
      {
        en: <>HTTP 404, because the author could not be found</>,
        zh: <>HTTP 404,因为作者没找到</>,
      },
      {
        en: (
          <>
            HTTP 200 with no sign of the failure; the client has to compare what
            it asked for with what it received
          </>
        ),
        zh: (
          <>HTTP 200,而且看不出出过错,客户端只能自己比对「要的」和「收到的」</>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A GraphQL server usually answers 200 even when a field failed. A 5xx
            status normally means the request never reached the GraphQL runtime
            at all — for example, the whole server is down.
          </>
        ),
        zh: (
          <>
            即使字段失败,GraphQL 服务器通常也返回 200。返回 5xx
            一般说明请求根本没走到 GraphQL 运行时,比如整台服务器都挂了。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            404 is about a URL that does not exist. Here <code>/graphql</code>{" "}
            exists and the request was handled normally. A field that is missing
            or failed is reported inside the response body, not by the status
            code.
          </>
        ),
        zh: (
          <>
            404 说的是 URL 不存在。这里 <code>/graphql</code>{" "}
            存在,请求也正常处理了。字段缺失或失败是在响应 body
            里汇报的,不靠状态码。
          </>
        ),
      },
      {
        en: (
          <>
            The failure is not hidden. It is listed in <code>errors</code>, with
            a <code>path</code> that names exactly which field failed.
          </>
        ),
        zh: (
          <>
            失败并没有被藏起来:它就列在 <code>errors</code> 里,还带一个{" "}
            <code>path</code>,直接指出是哪个字段失败了。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The result is one JSON object. A failed field becomes{" "}
          <code>null</code>, the reason goes into <code>errors</code> with its{" "}
          <code>path</code>, and the rest of <code>data</code> is still
          returned. If the field was declared non-null, the <code>null</code>{" "}
          moves up to the nearest parent that allows null. So{" "}
          <code>res.ok</code> does not tell you whether the query succeeded —
          read <code>errors</code>.
        </>
      ),
      zh: (
        <>
          响应是一个 JSON 对象:失败的字段变成 <code>null</code>,原因写进{" "}
          <code>errors</code> 并附上 <code>path</code>,<code>data</code>{" "}
          的其余部分照常返回。如果该字段被声明为非空,这个 <code>null</code>{" "}
          会向上冒泡到最近的、允许为空的父字段。所以 <code>res.ok</code>{" "}
          不能说明查询是否成功 —— 要读 <code>errors</code>。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: { en: <>What is GraphiQL?</>, zh: <>GraphiQL 是什么?</> },
    opts: [
      {
        en: <>The paid commercial edition of GraphQL</>,
        zh: <>GraphQL 的商业付费版</>,
      },
      {
        en: (
          <>
            An in-browser console for a GraphQL API: write queries, run them,
            read the response, browse the schema, and get autocomplete
          </>
        ),
        zh: (
          <>
            浏览器里的 GraphQL 操作台:写查询、运行、看响应、翻 schema
            文档、自动补全
          </>
        ),
      },
      {
        en: <>A database built for storing graph data</>,
        zh: <>一种专门存图数据的数据库</>,
      },
      {
        en: <>A misspelling of GraphQL; the two words mean the same thing</>,
        zh: <>GraphQL 的拼写错误,两个词是同一个东西</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            GraphiQL is free and open source. There are commercial products in
            the GraphQL ecosystem, such as parts of the Apollo tooling, but
            GraphiQL is not one of them.
          </>
        ),
        zh: (
          <>
            GraphiQL 免费开源。GraphQL 生态里确实有商业产品(比如 Apollo
            工具链的一部分),但 GraphiQL 不是。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Graph databases are a different category, such as Neo4j. GraphiQL
            stores no data at all — it only helps you write and send queries.
          </>
        ),
        zh: (
          <>
            图数据库是另一类东西,比如 Neo4j。GraphiQL 不存任何数据,
            它只是帮你写查询、发查询的工具。
          </>
        ),
      },
      {
        en: (
          <>
            The extra <code>i</code> is deliberate. GraphiQL is pronounced
            &quot;graphical&quot; and is a tool; GraphQL is the language. One
            letter, two different things.
          </>
        ),
        zh: (
          <>
            多出来的那个 <code>i</code> 是故意的:GraphiQL 读作
            graphical,是工具;GraphQL 是语言。一个字母之差,两样东西。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          GraphiQL is the standard in-browser editor for GraphQL. Its
          autocomplete and its docs panel both come from introspection — the
          server describing its own schema. Chapter 08 covers that.
        </>
      ),
      zh: (
        <>
          GraphiQL 是 GraphQL 官方的浏览器编辑器。它的自动补全和文档面板
          都来自内省(introspection)—— 服务器描述自己的 schema。第 08 章展开讲。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Who maintains the GraphQL specification today, and what is the latest
          ratified edition?
        </>
      ),
      zh: <>GraphQL 规范现在由谁维护?最新的正式版是哪一版?</>,
    },
    opts: [
      {
        en: <>Facebook (Meta), privately, with no outside participation</>,
        zh: <>Facebook(Meta)内部维护,不对外开放</>,
      },
      {
        en: (
          <>
            The GraphQL Foundation, and the latest ratified edition is the
            September 2025 Edition
          </>
        ),
        zh: <>GraphQL Foundation 维护,最新正式版是 September 2025 Edition</>,
      },
      {
        en: <>The W3C, and the current version number is 3.0</>,
        zh: <>W3C 维护,版本号 3.0</>,
      },
      {
        en: (
          <>
            The GraphQL Foundation, and the latest ratified edition is October
            2021
          </>
        ),
        zh: <>GraphQL Foundation 维护,最新正式版是 October 2021</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That was true before 2018. Facebook open-sourced GraphQL in 2015 and
            handed the specification to the neutral GraphQL Foundation, hosted
            by the Linux Foundation, in 2018. Anyone can take part now.
          </>
        ),
        zh: (
          <>
            那是 2018 年以前的事。Facebook 2015 年开源,2018
            年把规范交给了 Linux Foundation 旗下中立的 GraphQL Foundation ——
            现在谁都能参与。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The W3C maintains web standards such as HTML and CSS. GraphQL
            belongs to the GraphQL Foundation, and its editions are named by
            date rather than numbered, so there is no 3.0.
          </>
        ),
        zh: (
          <>
            W3C 管的是 HTML、CSS 这类 Web 标准。GraphQL 归 GraphQL
            Foundation,而且版本按日期命名,不用数字编号,所以没有 3.0 这一说。
          </>
        ),
      },
      {
        en: (
          <>
            October 2021 was the <b>previous</b> edition. The September 2025
            Edition followed it four years later, adding Schema Coordinates and{" "}
            <code>@oneOf</code> input objects. Many older tutorials still
            describe the 2021 edition.
          </>
        ),
        zh: (
          <>
            October 2021 是<b>上一版</b>。四年后发布的 September 2025 Edition
            才是最新版,新增了 Schema Coordinates 和 <code>@oneOf</code>{" "}
            输入对象。很多旧教程还停在 2021 版,读的时候要留意。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The timeline: open-sourced in 2015, moved to the GraphQL Foundation in
          2018, latest ratified edition September 2025. Knowing it tells you
          which parts of an older article may be out of date.
        </>
      ),
      zh: (
        <>
          时间线:2015 年开源 → 2018 年移交 GraphQL Foundation → 最新正式版
          September 2025 Edition。记住它,读旧文章时就知道哪些信息可能已经过期。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Which statement about the relationship between GraphQL and REST is
          most accurate?
        </>
      ),
      zh: <>GraphQL 和 REST 的关系,哪种说法最准确?</>,
    },
    opts: [
      {
        en: (
          <>GraphQL is an upgrade of REST, so you can forget REST once you learn it</>
        ),
        zh: <>GraphQL 是 REST 的升级版,学会了就可以把 REST 忘了</>,
      },
      {
        en: (
          <>
            They are two styles with different trade-offs: 93% of teams work
            with REST APIs and 33% work with GraphQL (Postman, 2025), and GitHub
            offers both
          </>
        ),
        zh: (
          <>
            两种取舍不同的风格:93% 的团队在用 REST API,33% 在用
            GraphQL(Postman,2025),GitHub 干脆两个都提供
          </>
        ),
      },
      {
        en: <>GraphQL has faded away and is no longer worth learning</>,
        zh: <>GraphQL 已经退潮被淘汰,不值得学</>,
      },
      {
        en: <>They are incompatible, so a company has to pick exactly one</>,
        zh: <>它们水火不容,一家公司必须二选一</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            &quot;Upgrade&quot; is the most common misunderstanding. GraphQL
            gives up HTTP caching to gain flexibility (chapter 10). Something
            you gain and lose at the same time is a trade-off, not an upgrade.
          </>
        ),
        zh: (
          <>
            「升级版」是最常见的误解。GraphQL 用 HTTP
            缓存换来了灵活性(第 10 章)。有得有失的东西不叫升级,叫取舍。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A third of teams use it, and GitHub and Shopify run large GraphQL
            APIs. It has not faded away; its scope has simply become clearer —
            multiple clients, multiple teams, and aggregation layers.
          </>
        ),
        zh: (
          <>
            三分之一的团队在用,GitHub、Shopify 都在跑大规模 GraphQL API,
            谈不上淘汰。只是它的适用范围更清楚了:多客户端、多团队、聚合层。
          </>
        ),
      },
      {
        en: (
          <>
            GitHub is the counter-example: it offers a REST API and a GraphQL
            API side by side, and publishes guidance on when to use which. The
            two styles can coexist in one company.
          </>
        ),
        zh: (
          <>
            GitHub 就是反例:REST API 和 GraphQL API 并行提供,
            官方还写了什么时候用哪个的指南。两种风格完全可以在一家公司里共存。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Neither replaces the other; each has different trade-offs. The finale
          gives you a full decision guide for when GraphQL helps and when REST
          stays simpler. Learn both before you choose.
        </>
      ),
      zh: (
        <>
          没有谁替代谁,只有取舍不同。什么场景 GraphQL 更合适、什么场景 REST
          更省事,终章会给你一份完整的决策指南 —— 先把两边都学明白,再谈选型。
        </>
      ),
    },
  },
];
