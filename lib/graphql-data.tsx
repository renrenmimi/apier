"use client";

// 第 07 章 · GraphQL 初见 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "rick-first-query",
    title: "第一句 query:去问 Rick Sanchez",
    d: "easy",
    tags: ["GraphiQL", "Rick and Morty"],
    task: (
      <p>
        打开 <code>https://rickandmortyapi.com/graphql</code>(免注册,浏览器直接开)。
        左边的编辑器里敲下你人生第一句 GraphQL 查询:
        <code>{'{ character(id: 1) { name species status } }'}</code>,
        按左上角的 ▶ 运行。看看右边回来了什么,再试着<b>加一个字段</b>
        (比如 <code>gender</code>)重新跑一次。
      </p>
    ),
    hint: (
      <>
        在花括号里按 Ctrl+Space(Mac 是 ⌥Space 或 Ctrl+Space),
        自动补全会把能点的字段全列出来 —— 这是 GraphiQL 最实用的功能,不必去背字段名。
      </>
    ),
    solution: (
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
          注意两件事:响应的形状和你查询的形状<b>一模一样</b>,只是套了层{" "}
          <code>data</code> 壳;加一个字段,响应就多一个字段,不多不少 ——
          这就是「照单出菜」。
        </p>
      </>
    ),
  },
  {
    id: "countries-lookup",
    title: "换一家店:查一个国家",
    d: "easy",
    tags: ["GraphiQL", "Countries"],
    task: (
      <p>
        打开 <code>https://countries.trevorblades.com</code>(同样免注册)。查询
        <code>{'{ country(code: "CN") { name capital currency } }'}</code>,
        看看回来什么。然后把 <code>&quot;CN&quot;</code> 换成{" "}
        <code>&quot;JP&quot;</code>、<code>&quot;FR&quot;</code>、
        <code>&quot;BR&quot;</code> 再跑几次 —— 顺便点开右上角的文档面板,
        看看 <code>Country</code> 类型还藏着哪些字段。
      </p>
    ),
    hint: (
      <>
        国家代码是两个大写字母(ISO 3166-1)。文档面板里点 Query → country →
        Country,能看到 languages、continent 这些「菜单上还没点过的菜」。
      </>
    ),
    solution: (
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
          两个完全不同的 API,查询的写法、响应的形状、文档的翻法全都一样 ——
          因为它们说的是同一门语言,遵守同一份规范。这就是标准化的力量。
        </p>
      </>
    ),
  },
  {
    id: "fetch-raw-post",
    title: "撕掉包装:用 fetch 裸发一个 query",
    d: "medium",
    tags: ["fetch", "Console", "POST"],
    task: (
      <p>
        这次不用 GraphiQL。随便开个网页,按 F12 进 Console,用第 02 章学的{" "}
        <code>fetch</code> 直接向 <code>rickandmortyapi.com/graphql</code> 发一个
        POST 请求:header 带 <code>Content-Type: application/json</code>,body 是{" "}
        <code>{'JSON.stringify({ query: "..." })'}</code>。
        目标:不借助任何 GraphQL 工具,拿到 Rick 的名字。
      </p>
    ),
    hint: (
      <>
        query 就是一个普通字符串,塞进 JSON 的 query 键里。发出去之后,
        响应照旧 <code>res.json()</code> —— 跟你调 REST API 没有任何区别。
      </>
    ),
    solution: (
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
console.log(json.data.character.name); // "Rick Sanchez"`}
        />
        <p>
          做完这个实验,你就亲手证明了本章最重要的揭魅:
          <b>GraphQL 不是新协议,就是一个普通的 HTTP POST</b>。
          fetch、DevTools、状态码 —— 前六章的本事一件都没作废。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>2012 年,Facebook 为什么要在内部造出 GraphQL?</>,
    opts: [
      <>REST 太难学,工程师们想要个门槛更低的方案</>,
      <>
        重写移动版 News Feed 时,弱网下 REST 要么多拿一堆用不上的字段,
        要么一屏数据得串好几次请求
      </>,
      <>数据库查询太慢,需要一种更快的数据库语言</>,
      <>HTTP 协议过时了,需要一个替代品</>,
    ],
    correct: 1,
    wrong: [
      <>
        恰恰相反,REST 简单得很,这正是它的优点。Facebook 的问题不是「难」,
        是「费」:弱网下每一趟往返、每一个多余字段都是真金白银的代价。
      </>,
      undefined,
      <>
        GraphQL 不碰数据库 —— 它是客户端和服务器之间的查询语言,
        数据库该怎么查还怎么查(查不好还会有 N+1 问题,第 10 章见)。
      </>,
      <>
        GraphQL 恰恰跑在 HTTP 上:一个普通的 POST 请求。
        它替代的不是协议,是「按固定套餐取数据」这个习惯。
      </>,
    ],
    why: (
      <>
        2012 年的移动网络又慢又贵,REST「套餐制」的浪费(over-fetching)和
        跑腿次数(under-fetching)在弱网下被无限放大 —— GraphQL
        就是给这两种痛开的药方。
      </>
    ),
  },
  {
    type: "multi",
    q: <>下面哪些场景属于 over-fetching(过度获取)?(多选)</>,
    opts: [
      <>只想显示作者名字,响应却回来 40 个字段的完整 user</>,
      <>渲染一篇帖子页,要连发 3 次请求才能凑齐数据</>,
      <>列表页只用标题,接口却把每篇文章的全文 body 都带回来了</>,
      <>请求发错了 URL,收到 404</>,
    ],
    correct: [0, 2],
    missHint: (
      <>
        还漏了一个 —— 判断标准很简单:「拿回来的数据里,有没有你根本不用的部分」。
        再扫一遍选项。
      </>
    ),
    extraHint: (
      <>
        混进了不该选的:「连发 3 次才凑齐」是拿得<b>不够</b>(under-fetching),
        不是拿得太多;404 是地址错了,跟拿多拿少无关。
      </>
    ),
    why: (
      <>
        over-fetching = 拿多了(字段浪费),under-fetching = 拿少了(还得再跑几趟)。
        A 和 C 都是「响应里塞了用不上的东西」,典型的 over-fetching。
      </>
    ),
  },
  {
    type: "choice",
    q: <>关于 GraphQL 查询和响应的关系,哪个说法是对的?</>,
    opts: [
      <>响应的格式由服务器决定,跟查询长什么样没关系</>,
      <>
        查询长什么形状,响应的 <code>data</code> 就长什么形状 ——
        字段一一对应,不多不少
      </>,
      <>响应永远包含该类型的全部字段,查询只是走个形式</>,
      <>想少收几个字段,得等响应回来后在前端自己删</>,
    ],
    correct: 1,
    wrong: [
      <>
        这是 REST 的规矩(套餐内容后厨说了算)。GraphQL 反过来:
        响应形状由<b>你的查询</b>决定,服务器照单出菜。
      </>,
      undefined,
      <>
        「全部字段」正是 GraphQL 要消灭的 over-fetching。你不点的字段,
        服务器连算都不算,更不会发给你。
      </>,
      <>
        前端删字段治标不治本 —— 字节已经在网络上跑了一趟,流量和时间都花了。
        GraphQL 是让多余字段<b>压根不出发</b>。
      </>,
    ],
    why: (
      <>
        「查询长什么样,响应就长什么样」是 GraphQL 最好记的规律:
        把查询里的字段名原样映进 <code>data</code>,就是你将收到的 JSON。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        REST 有一堆 URL,GraphQL 惯例上只暴露一个端点,路径通常是____
        (以斜杠开头,八个小写字母)。
      </>
    ),
    answers: ["/graphql", "graphql"],
    hint: <>就是这门语言自己的名字,全小写,前面加一道斜杠。</>,
    why: (
      <>
        惯例是 <code>POST /graphql</code>:一个入口,包办所有需求。
        「去哪个 URL」的问题,从此变成「在查询里点哪些字段」。
      </>
    ),
  },
  {
    type: "choice",
    q: <>浏览器发出的一个典型 GraphQL 请求,长什么样?</>,
    opts: [
      <>
        <code>GET /graphql?fields=name,status</code> —— 字段写进查询参数
      </>,
      <>
        <code>POST /graphql</code>,Content-Type 是 application/json,
        查询语句作为字符串装在 JSON body 里
      </>,
      <>用 HTTP 新增的 QUERY 方法,专门为 GraphQL 设计</>,
      <>不走 HTTP,走的是专用的二进制协议</>,
    ],
    correct: 1,
    wrong: [
      <>
        GET 传 GraphQL 确实存在(persisted queries 配 CDN 缓存,第 10 章讲),
        但那是进阶玩法,而且也不是 fields= 这种写法 —— 默认惯例是 POST + JSON。
      </>,
      undefined,
      <>
        HTTP 的 QUERY 方法确实在标准化路上,但 GraphQL 没等它 ——
        从 2015 年至今用的都是最普通的 POST。
      </>,
      <>
        恰恰相反:GraphQL 就是普通 HTTP,fetch 一行就能发。
        本章 Lab 03 就是让你亲手验证这件事。
      </>,
    ],
    why: (
      <>
        揭魅时刻:GraphQL = 披着查询语言外衣的 HTTP POST。body 是一个 JSON,
        里面 <code>query</code> 键装着查询字符串 —— 仅此而已。
      </>
    ),
  },
  {
    type: "choice",
    q: <>GraphiQL 是什么?</>,
    opts: [
      <>GraphQL 的商业付费版</>,
      <>
        跑在浏览器里的 GraphQL 操作台:写查询、看响应、翻文档、自动补全,
        一站全包
      </>,
      <>一种专门存图数据的数据库</>,
      <>GraphQL 的拼写错误,两个词是同一个东西</>,
    ],
    correct: 1,
    wrong: [
      <>
        GraphiQL 免费开源,官方出品。GraphQL 世界确实有商业产品(Apollo
        的整套工具链等),但 GraphiQL 不是。
      </>,
      undefined,
      <>
        名字里带 Graph 的数据库是 Neo4j 那一类。GraphiQL 不存任何数据,
        它只是帮你「点菜」的前台工具。
      </>,
      <>
        多出来的那个 i 是故意的:GraphiQL 读作 graphical,是工具;GraphQL
        是语言。一个字母,两个东西。
      </>,
    ],
    why: (
      <>
        GraphiQL(graphical)= GraphQL 的官方浏览器 IDE。它的自动补全和文档
        面板全靠内省(introspection)—— 第 08 章拆开讲。
      </>
    ),
  },
  {
    type: "choice",
    q: <>GraphQL 规范现在由谁维护?最新正式版是哪一版?</>,
    opts: [
      <>Facebook(Meta)内部维护,不对外开放</>,
      <>GraphQL Foundation 维护,最新正式版是 September 2025 Edition</>,
      <>W3C 维护,版本号 3.0</>,
      <>GraphQL Foundation 维护,最新正式版是 October 2021</>,
    ],
    correct: 1,
    wrong: [
      <>
        那是 2018 年以前的事。Facebook 在 2015 年开源、2018 年把规范交给了
        Linux Foundation 旗下中立的 GraphQL Foundation —— 现在谁都能参与。
      </>,
      undefined,
      <>
        W3C 管的是 HTML、CSS 这些 Web 标准。GraphQL 归 GraphQL Foundation,
        版本用日期命名,没有 3.0 这种编号。
      </>,
      <>
        October 2021 是<b>上一版</b>。隔了整整四年,2025 年 9 月发布了新正式版
        (@oneOf、Schema Coordinates 都在这版)—— 很多老教程还停在 2021,
        注意鉴别。
      </>,
    ],
    why: (
      <>
        2015 开源 → 2018 移交 GraphQL Foundation → 最新正式版 September 2025
        Edition。记住这条时间线,读旧文章时就知道哪些信息过期了。
      </>
    ),
  },
  {
    type: "choice",
    q: <>GraphQL 和 REST 的关系,哪种说法最靠谱?</>,
    opts: [
      <>GraphQL 是 REST 的升级版,学会了就可以把 REST 忘了</>,
      <>
        两种取舍不同的风格:Postman 2025 统计 REST 用 93%、GraphQL 用 33%,
        GitHub 干脆两个都提供
      </>,
      <>GraphQL 已经退潮被淘汰,不值得学</>,
      <>它们水火不容,一家公司必须二选一</>,
    ],
    correct: 1,
    wrong: [
      <>
        「升级版」是最常见的误解。GraphQL 用灵活性换走了 HTTP 缓存等好处
        (第 10 章细讲)—— 有得有失的东西,不叫升级,叫取舍。
      </>,
      undefined,
      <>
        33% 的使用率、GitHub/Shopify 的重仓投入,谈不上淘汰。
        它只是定位收窄了:多端、多团队、聚合层场景依然强势。
      </>,
      <>
        GitHub 就是活反例:REST 和 GraphQL 双轨并行,官方还写了选型指南。
        两种风格完全可以在一家公司里各管一摊。
      </>,
    ],
    why: (
      <>
        没有替代,只有取舍。什么场景 GraphQL 香、什么场景 REST 稳,
        终章会给你一张完整的决策树 —— 先把两边都学透,再谈站队。
      </>
    ),
  },
];
