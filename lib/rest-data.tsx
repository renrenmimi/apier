"use client";

// 第 03 章 · REST 的思想 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语,英文默认)。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "hateoas-trace",
    title: {
      en: "Count the links in a GitHub API response",
      zh: "数一数 GitHub 响应里的链接字段",
    },
    d: "easy",
    tags: { en: ["fetch", "GitHub API"], zh: ["fetch", "GitHub API"] },
    task: {
      en: (
        <p>
          Open the browser console and fetch{" "}
          <code>https://api.github.com/users/octocat</code>. Pick out every
          field whose name ends in <code>_url</code> and count them. Then ask
          yourself what those links are for.
        </p>
      ),
      zh: (
        <p>
          打开浏览器 Console,fetch 一下{" "}
          <code>https://api.github.com/users/octocat</code>,
          把响应里所有以 <code>_url</code> 结尾的字段挑出来,数数有几个。
          再想一想:这些链接是干什么用的?
        </p>
      ),
    },
    hint: {
      en: (
        <>
          <code>Object.keys(obj)</code> gives you every field name, and a string
          has an <code>.endsWith()</code> method. Combine the two instead of
          counting by eye.
        </>
      ),
      zh: (
        <>
          <code>Object.keys(obj)</code> 能拿到所有字段名,字符串自带{" "}
          <code>.endsWith()</code> 方法 —— 组合一下就不用肉眼数了。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const res = await fetch("https://api.github.com/users/octocat");
const user = await res.json();
const links = Object.keys(user).filter((k) => k.endsWith("_url"));
console.log(links.length, links); // around 11; GitHub adds and removes fields`}
          />
          <p>
            <code>followers_url</code>, <code>repos_url</code>,{" "}
            <code>gists_url</code> and about eight more. The server is telling
            you where you can go from here, so the client does not have to build
            those URLs from rules of its own. This is one half of the hypermedia
            idea. It is not full HATEOAS: the links say where, but not what you
            are allowed to do, so a client still needs the documentation.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const res = await fetch("https://api.github.com/users/octocat");
const user = await res.json();
const links = Object.keys(user).filter((k) => k.endsWith("_url"));
console.log(links.length, links); // 11 个左右,GitHub 偶尔增减字段`}
          />
          <p>
            <code>followers_url</code>、<code>repos_url</code>、
            <code>gists_url</code>…… 一口气十来个。
            服务器在告诉你「从我这儿还能去哪」,客户端因此不必自己拼这些 URL。
            这是超媒体想法的前半段,但还不是完整的 HATEOAS:
            链接只说了「去哪」,没说「你现在能做什么」,
            所以客户端仍然要读文档。
          </p>
        </>
      ),
    },
  },
  {
    id: "level-judge",
    title: {
      en: "Give three APIs a maturity level",
      zh: "给三段 API 判级",
    },
    d: "medium",
    tags: { en: ["maturity model"], zh: ["成熟度模型"] },
    task: {
      en: (
        <>
          <p>
            Three imaginary APIs are described below. Decide which level of the
            Richardson maturity model each one sits at (L0 / L1 / L2 / L3).
          </p>
          <p>
            <b>A.</b> Every request goes to <code>POST /api</code>. A{" "}
            <code>cmd</code> field in the body selects{" "}
            <code>getUser</code>, <code>addOrder</code>, and so on. Success or
            failure, the status is always 200.
            <br />
            <b>B.</b> Each kind of thing has its own URL (
            <code>/users/7</code>, <code>/orders/33</code>), but reads and
            deletes both use POST, with the action written in the body.
            <br />
            <b>C.</b> <code>GET /users/7</code> reads a user,{" "}
            <code>DELETE /orders/33</code> deletes an order. Creating an order
            returns 201; an order that does not exist returns 404. Responses
            contain no links.
          </p>
        </>
      ),
      zh: (
        <>
          <p>
            下面三段虚构 API 的描述,请分别判定它在 Richardson
            成熟度模型的哪一级(L0 / L1 / L2 / L3):
          </p>
          <p>
            <b>A.</b> 所有请求都发到 <code>POST /api</code>,body 里用{" "}
            <code>cmd</code> 字段区分 <code>getUser</code>、
            <code>addOrder</code>……不管成败,一律返回 200。
            <br />
            <b>B.</b> 每种东西有自己的 URL(<code>/users/7</code>、
            <code>/orders/33</code>),但不管读还是删,全用 POST,
            动作写在 body 里。
            <br />
            <b>C.</b> <code>GET /users/7</code> 拿用户,
            <code>DELETE /orders/33</code> 删订单;建单成功回 201,
            查无此单回 404。响应里没有任何链接。
          </p>
        </>
      ),
    },
    hint: {
      en: (
        <>
          Three questions decide it. How many URLs are there? Are the methods
          and status codes used for what they mean? Does the response contain
          links?
        </>
      ),
      zh: (
        <>
          判级只看三件事:有几个 URL?方法和状态码用对了吗?响应里有链接吗?
        </>
      ),
    },
    solution: {
      en: (
        <p>
          <b>A = L0</b>: one endpoint, one method. HTTP is only a tunnel. This
          is the swamp of POX.
          <br />
          <b>B = L1</b>: resources have their own addresses, but the methods
          are still undifferentiated. One step up, no more.
          <br />
          <b>C = L2</b>: methods and status codes are used correctly. The only
          thing missing is hypermedia links, so it cannot reach L3 — and this is
          where most APIs called REST actually sit.
        </p>
      ),
      zh: (
        <p>
          <b>A = L0</b>:单端点 + 单方法,HTTP 只是隧道,标准的 swamp of POX。
          <br />
          <b>B = L1</b>:资源有了自己的地址,但方法没有分化 —— 只爬了一格。
          <br />
          <b>C = L2</b>:方法和状态码都用对了;差的只是超媒体链接,
          所以到不了 L3 —— 而这正是业界绝大多数「REST API」的真实位置。
        </p>
      ),
    },
  },
  {
    id: "library-resources",
    title: {
      en: "Model a library as resources",
      zh: "把图书馆拆成资源",
    },
    d: "medium",
    tags: {
      en: ["resource modeling", "URI"],
      zh: ["资源建模", "URI"],
    },
    task: {
      en: (
        <p>
          A library lending system: books can be searched, readers can register,
          and readers can borrow and return books. Write out the{" "}
          <b>list of resources</b>: give each one a noun and write the URI for
          the collection and for a single item. One part is harder than the
          rest: borrowing is a verb. How does it become a resource?
        </p>
      ),
      zh: (
        <p>
          一个图书馆借书系统:藏书可以检索,读者可以注册,读者能借书、还书。
          请把它拆成<b>资源清单</b>:每种资源起一个名词,
          写出集合和单个条目的 URI。有一个难点:「借书」是个动词,
          它怎么变成资源?
        </p>
      ),
    },
    hint: {
      en: (
        <>
          The usual way out of the verb problem: do not look at the action, look
          at the <b>record</b> the action leaves behind. A record is a noun.
        </>
      ),
      zh: (
        <>
          动词困境的常见解法:别盯着动作本身,盯着动作留下的<b>记录</b> ——
          记录是名词。
        </>
      ),
    },
    solution: {
      en: (
        <p>
          Three resources: <code>books</code> (<code>/books</code>,{" "}
          <code>/books/42</code>), <code>members</code> (<code>/members</code>,{" "}
          <code>/members/7</code>), and <code>loans</code> — the borrowing
          records (<code>/loans</code>, <code>/loans/1001</code>, and they can
          also appear as <code>/members/7/loans</code>). Borrowing is{" "}
          <code>POST /loans</code>, which creates a loan record and lets the
          server assign its identifier. Returning is{" "}
          <code>PATCH /loans/1001</code> setting <code>returnedAt</code>, which
          is a partial update of an existing record. Use <code>DELETE</code>{" "}
          only if you do not need to keep the history. The technique to remember
          is this: <b>turn the action into a record</b>, and every verb finds a
          place in a REST design. Note that the plural nouns above are a widely
          used convention, not a rule in REST.
        </p>
      ),
      zh: (
        <p>
          三种资源:<code>books</code>(<code>/books</code>、
          <code>/books/42</code>)、<code>members</code>(<code>/members</code>、
          <code>/members/7</code>)、<code>loans</code>(借阅记录:
          <code>/loans</code>、<code>/loans/1001</code>,也可以挂成{" "}
          <code>/members/7/loans</code>)。「借书」=&nbsp;
          <code>POST /loans</code>:创建一条借阅记录,标识符由服务器分配。
          「还书」= <code>PATCH /loans/1001</code>,把{" "}
          <code>returnedAt</code> 填上 —— 这是对已有记录的部分更新。
          只有在不需要保留历史时才用 <code>DELETE</code>。要记住的招式是:
          <b>把动作变成一条记录</b>,REST 的世界里就没有装不下的动词。
          另外,上面用复数名词是业界通行的约定,不是 REST 的规定。
        </p>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: <>Which sentence describes what REST is most accurately?</>,
      zh: <>下面哪句话,把 REST 的定位说得最准?</>,
    },
    opts: [
      { en: <>REST is the newest version of HTTP</>, zh: <>REST 是 HTTP 的最新版本</> },
      {
        en: (
          <>
            REST is an architectural style — a set of design constraints, not a
            protocol and not a standard
          </>
        ),
        zh: <>REST 是一种架构风格 —— 一组设计约束,不是协议也不是标准</>,
      },
      {
        en: <>REST is a data format, essentially the same thing as JSON</>,
        zh: <>REST 是一种数据格式,和 JSON 是一回事</>,
      },
      {
        en: <>REST is a framework you install with npm</>,
        zh: <>REST 是一个需要 npm install 的框架</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            HTTP is a protocol and it has version numbers (1.1, 2, 3). REST has
            no version number, because it is not a protocol. It is
            Fielding&apos;s summary of the principles that let the web grow.
          </>
        ),
        zh: (
          <>
            HTTP 是协议,有版本号(1.1、2、3);REST 从来没有版本号 ——
            因为它不是协议,而是 Fielding 对「Web 为什么能长这么大」的原则总结。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            This is the misunderstanding this chapter exists to correct. REST
            says nothing about formats. JSON is the most common representation;
            the same resource served as XML or HTML is just as RESTful.
          </>
        ),
        zh: (
          <>
            这正是本章要拆的头号误解:REST 对格式只字未提。JSON
            只是最常见的表述,同一资源换成 XML、HTML 照样 REST。
          </>
        ),
      },
      {
        en: (
          <>
            There is nothing to install. REST has no package and no official
            implementation. It is a set of design principles that any language
            or framework can follow, or break.
          </>
        ),
        zh: (
          <>
            装不了 —— REST 没有安装包,也没有官方实现。它是一套设计原则,
            用任何语言、任何框架都能遵守(或违反)。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          REST is an architectural style: a set of constraints. The more of them
          a system follows, the more it can reuse the infrastructure the web
          already provides.
        </>
      ),
      zh: (
        <>
          REST 是架构风格(architectural style):一组约束。守得越多,
          系统就越能复用 Web 已有的基础设施。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You send <code>GET /users/42</code> and receive some JSON. Strictly
          speaking, what is that JSON?
        </>
      ),
      zh: (
        <>
          你 <code>GET /users/42</code>,拿到一份 JSON。严格说,
          这份 JSON 是什么?
        </>
      ),
    },
    opts: [
      {
        en: <>The resource itself — user 42 is that JSON</>,
        zh: <>资源本身 —— 42 号用户就是这份 JSON</>,
      },
      {
        en: (
          <>
            A representation of the resource — a copy in one format at one
            moment
          </>
        ),
        zh: <>资源的一种表述(representation)—— 某一刻的一份副本</>,
      },
      { en: <>A URI</>, zh: <>一个 URI</> },
      { en: <>The matching row in the database</>, zh: <>数据库里的那行记录</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The resource is the abstract thing, user 42. The JSON is one copy of
            it. Change the <code>Accept</code> header and the same resource can
            arrive as XML or HTML.
          </>
        ),
        zh: (
          <>
            资源是抽象的「42 号用户」;JSON 只是它的一份副本。
            换个 <code>Accept</code> 头,同一个资源能给你 XML 或 HTML。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The URI is the identifier (<code>/users/42</code>). What you
            received is a representation fetched through that identifier. Two
            different things.
          </>
        ),
        zh: (
          <>
            URI 是标识符(<code>/users/42</code>),你拿到的 JSON
            是通过这个标识符取回的表述,两码事。
          </>
        ),
      },
      {
        en: (
          <>
            REST says nothing about storage. The server builds the
            representation for you, and it may look nothing like the rows behind
            it.
          </>
        ),
        zh: (
          <>
            REST 不关心底层怎么存 —— 表述是服务器为你生成的,
            它可以和背后的数据行毫无相似之处。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Keep the three apart: the resource is the thing, the URI identifies
          it, and the representation is a copy in one format at one moment. The
          R in REST is representation — the client only ever holds a copy.
        </>
      ),
      zh: (
        <>
          三件套要分清:资源是那个事物,URI 是它的标识符,
          表述是它在某一刻、某种格式下的副本。REST 里的 R 就是
          representation —— 客户端手里永远只有副本。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: <>Which of these are REST constraints? (select all that apply)</>,
      zh: <>下面哪些属于 REST 的六大约束?(多选)</>,
    },
    opts: [
      { en: <>Stateless</>, zh: <>无状态(stateless)</> },
      { en: <>JSON must be used</>, zh: <>必须使用 JSON</> },
      { en: <>Cacheable</>, zh: <>可缓存(cache)</> },
      { en: <>Layered system</>, zh: <>分层系统(layered system)</> },
      { en: <>HTTPS must be used</>, zh: <>必须使用 HTTPS</> },
      { en: <>Uniform interface</>, zh: <>统一接口(uniform interface)</> },
    ],
    correct: [0, 2, 3, 5],
    missHint: {
      en: (
        <>
          One or more constraints are still unselected. The six are:
          client-server, stateless, cacheable, uniform interface, layered
          system, and code-on-demand.
        </>
      ),
      zh: (
        <>
          还有约束没选全 —— 六条是:客户端-服务器、无状态、可缓存、统一接口、
          分层系统、按需代码。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          You selected a specific technology choice. REST says nothing about
          data formats or encryption. All six constraints are architectural, and
          none of them names a technology.
        </>
      ),
      zh: (
        <>
          你选进了具体的技术选型 —— REST 对数据格式和加密方式只字未提,
          六条约束全是架构层面的原则,没有一条点名某个技术。
        </>
      ),
    },
    why: {
      en: (
        <>
          The six: client-server, stateless, cacheable, uniform interface,
          layered system, and code-on-demand (the only optional one). JSON and
          HTTPS are good engineering choices, but REST does not require either.
        </>
      ),
      zh: (
        <>
          六大约束:客户端-服务器、无状态、可缓存、统一接口、分层系统、
          按需代码(唯一可选)。JSON 和 HTTPS 都是好的工程选择,
          但不是 REST 的要求。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>What does the stateless constraint actually require?</>,
      zh: <>「无状态(stateless)」约束的准确含义是?</>,
    },
    opts: [
      {
        en: <>The server may not have a database and may store nothing</>,
        zh: <>服务器不能有数据库,什么都不许存</>,
      },
      {
        en: (
          <>
            Each request carries all the information needed to understand it,
            and session state is kept by the client
          </>
        ),
        zh: <>每个请求自带理解它所需的全部信息,会话状态由客户端自己保管</>,
      },
      {
        en: <>The client may not store anything locally</>,
        zh: <>客户端不能在本地保存任何数据</>,
      },
      {
        en: <>Sessions must be moved into a shared Redis instance</>,
        zh: <>服务器必须把会话统一存进 Redis</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Stateless is about session state, not stored data. Articles, users,
            and orders are still kept in a database — otherwise the API would
            have nothing to serve.
          </>
        ),
        zh: (
          <>
            无状态说的是「会话状态」不留在服务器上,文章、用户这些资源数据
            当然照存数据库 —— 不然 API 还有什么可提供的?
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The opposite is true. Session state is exactly what the client
            should carry — a token, a page number — and send with every request.
          </>
        ),
        zh: (
          <>
            恰恰相反:会话状态正该由客户端带着(比如 token、页码),
            每次请求随身送来。
          </>
        ),
      },
      {
        en: (
          <>
            Moving sessions into Redis is a common engineering solution, but it
            is shared server-side state. The constraint asks for no server-side
            session at all.
          </>
        ),
        zh: (
          <>
            把会话挪进 Redis 是常见的工程手段,但那是共享的服务端状态。
            这条约束要求的是服务端根本不保留会话。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Every request is complete on its own, so any server can answer it. If
          one machine dies, another takes over, and adding machines adds
          capacity. That is why statelessness allows horizontal scaling.
        </>
      ),
      zh: (
        <>
          每个请求都自成一体,于是哪台服务器都能接。挂一台换一台,
          加机器就能加容量 —— 这就是无状态让水平扩展成为可能的原因。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>Which of the six constraints is the only optional one?</>,
      zh: <>六大约束里,唯一「可选」的是哪一条?</>,
    },
    opts: [
      { en: <>Stateless</>, zh: <>无状态(stateless)</> },
      { en: <>Cacheable</>, zh: <>可缓存(cache)</> },
      { en: <>Code-on-demand</>, zh: <>按需代码(code-on-demand)</> },
      { en: <>Uniform interface</>, zh: <>统一接口(uniform interface)</> },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            Stateless is required. Break it and horizontal scaling and
            reliability go with it. Fielding did not mark it optional.
          </>
        ),
        zh: (
          <>
            无状态是必需的 —— 破坏它,水平扩展和可靠性就跟着塌,
            Fielding 没给它留「可选」的口子。
          </>
        ),
      },
      {
        en: (
          <>
            Cacheable is required too. Every response has to indicate whether it
            can be cached, which is what makes the web fast.
          </>
        ),
        zh: (
          <>
            可缓存也是必需的:每个响应都要标明自己能不能被缓存,
            这是 Web 快得起来的前提。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The uniform interface is the constraint that distinguishes REST.
            Remove it and what is left is no longer REST.
          </>
        ),
        zh: (
          <>
            统一接口恰恰是把 REST 与其他风格区分开的约束 —— 把它拿掉,
            REST 就不是 REST 了。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Code-on-demand — the server sending code for the client to run, such
          as the JavaScript in a web page — is the one constraint Fielding
          marked optional. A system can be REST without it.
        </>
      ),
      zh: (
        <>
          按需代码(服务器下发代码给客户端执行,比如网页里的 JavaScript)
          是 Fielding 唯一标注为「可选」的一条 —— 不用它,系统照样是 REST 的。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          An API gives each kind of resource its own URL, uses GET, POST and
          DELETE for what they mean, and returns 201 and 404 correctly. Its
          responses contain no links. Which maturity level is it at?
        </>
      ),
      zh: (
        <>
          某 API:每种资源有自己的 URL,GET / POST / DELETE 用得有模有样,
          201 / 404 也回得对,但响应里没有任何链接。它在成熟度模型的哪一级?
        </>
      ),
    },
    opts: [
      { en: <>Level 0</>, zh: <>Level 0</> },
      { en: <>Level 1</>, zh: <>Level 1</> },
      { en: <>Level 2</>, zh: <>Level 2</> },
      { en: <>Level 3</>, zh: <>Level 3</> },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            L0 is the swamp: every request goes to one URL with one method. This
            API has already separated its resources.
          </>
        ),
        zh: (
          <>
            L0 是所有请求挤在一个 URL、一律用 POST 的沼泽 ——
            这个 API 明明已经把资源分开了。
          </>
        ),
      },
      {
        en: (
          <>
            L1 means resources exist but the methods are undifferentiated. This
            API uses methods and status codes correctly, so it is past that.
          </>
        ),
        zh: (
          <>
            L1 的特征是「有资源但方法不分化」;它的方法和状态码都用对了,
            早就过了这一关。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The missing piece is exactly what L3 requires: hypermedia links.
            With no links in the response, it does not reach L3.
          </>
        ),
        zh: (
          <>
            差的正是 L3 的入场券:超媒体链接。响应里一个链接都没有,
            就到不了 L3。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Resources separated, methods used correctly, status codes used
          correctly, no hypermedia. That is Level 2, and it is where most APIs
          called REST actually sit.
        </>
      ),
      zh: (
        <>
          资源分开 ✓、方法用对 ✓、状态码用对 ✓、没有超媒体 ✕ ——
          标准的 Level 2,也是业界绝大多数「REST API」的真实位置。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: { en: <>What does HATEOAS describe?</>, zh: <>HATEOAS 说的是什么?</> },
    opts: [
      { en: <>A safer login protocol</>, zh: <>一种更安全的登录协议</> },
      {
        en: (
          <>
            The response carries links to the next available steps, and the
            client follows them the way a person follows links on a web page
          </>
        ),
        zh: <>响应里带着「接下来能去哪」的链接,客户端像逛网页一样跟着链接走</>,
      },
      {
        en: <>Generating API documentation as HTML pages automatically</>,
        zh: <>把 API 文档自动生成成 HTML 页面</>,
      },
      { en: <>Using XML instead of JSON</>, zh: <>用 XML 代替 JSON 传输数据</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            It has nothing to do with login. It is the fourth part of the
            uniform interface, and it answers the question of how a client
            learns what it can do next.
          </>
        ),
        zh: (
          <>
            跟登录没关系 —— 它是统一接口的第 4 个子约束,
            解决的是「客户端如何知道下一步能做什么」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Documentation generation is what OpenAPI does (chapter 05). HATEOAS
            puts the next steps into the response itself.
          </>
        ),
        zh: (
          <>
            文档生成是 OpenAPI 的活(第 05 章)。HATEOAS
            是把「下一步」直接写进响应本身。
          </>
        ),
      },
      {
        en: (
          <>
            The format does not matter. JSON can carry links perfectly well —
            a <code>_links</code> object, or GitHub&apos;s{" "}
            <code>*_url</code> fields.
          </>
        ),
        zh: (
          <>
            与格式无关 —— JSON 里照样能放链接(比如 <code>_links</code>{" "}
            字段),GitHub 的一堆 <code>*_url</code> 就是例子。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Hypermedia As The Engine Of Application State. The server puts links
          the client can follow into the response, so the client does not build
          URLs from rules of its own. Few APIs implement it fully.
        </>
      ),
      zh: (
        <>
          Hypermedia As The Engine Of Application State,
          超媒体作为应用状态的引擎。服务器在响应里给出可跟随的链接,
          客户端不必再自己拼 URL。真正完整实现它的 API 很少。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Same URI, but you want the XML representation. Which request header do
          you set? (write the header name only)
        </>
      ),
      zh: (
        <>
          同一个 URI,你想要 XML 版的表述 —— 应该在请求里设置哪个
          header?(只写 header 名)
        </>
      ),
    },
    placeholder: { en: "Header name…", zh: "Header 名…" },
    answers: ["accept", "accept:"],
    hint: {
      en: (
        <>
          The client uses this header to state which media types it is willing
          to receive. The name is a single common English verb.
        </>
      ),
      zh: (
        <>
          客户端用这个 header 声明自己愿意接收哪些媒体类型 ——
          名字就是英文里「接受」那个动词。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>Accept: application/xml</code>. Choosing a representation this
          way is called content negotiation: one resource, several formats. It
          is the clearest evidence that REST does not mean JSON.
        </>
      ),
      zh: (
        <>
          <code>Accept: application/xml</code>。这套「按需选表述」的机制叫
          内容协商(content negotiation)—— 一个资源,多种格式,
          它就是「REST 不等于 JSON」的直接证据。
        </>
      ),
    },
  },
];
