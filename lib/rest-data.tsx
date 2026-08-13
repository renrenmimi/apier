"use client";

// 第 03 章 · REST 的思想 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "hateoas-trace",
    title: "数一数 GitHub 身上的 HATEOAS 痕迹",
    d: "easy",
    tags: ["fetch", "GitHub API"],
    task: (
      <p>
        打开浏览器 Console,fetch 一下{" "}
        <code>https://api.github.com/users/octocat</code>,把响应里所有以{" "}
        <code>_url</code> 结尾的字段挑出来,数数有几个。再想一想:
        这些链接是干什么用的?
      </p>
    ),
    hint: (
      <>
        <code>Object.keys(obj)</code> 能拿到所有字段名,字符串自带{" "}
        <code>.endsWith()</code> 方法 —— 组合一下就不用肉眼数了。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const res = await fetch("https://api.github.com/users/octocat");
const user = await res.json();
const links = Object.keys(user).filter((k) => k.endsWith("_url"));
console.log(links.length, links); // 11 个左右(GitHub 偶尔增减)`}
        />
        <p>
          followers_url、repos_url、gists_url…… 一口气十来个。
          这就是超媒体的活化石:服务器在告诉你「从我这儿还能去哪」,
          你不需要背 URL 拼接规则,跟着链接走就行。GitHub 正是早年
          超媒体驱动 API 的典型代表。
        </p>
      </>
    ),
  },
  {
    id: "level-judge",
    title: "给三段 API 判级",
    d: "medium",
    tags: ["成熟度模型"],
    task: (
      <>
        <p>
          下面三段虚构 API 的描述,请分别判定它在 Richardson
          成熟度模型的哪一级(L0 / L1 / L2 / L3):
        </p>
        <p>
          <b>A.</b> 所有请求都发到 <code>POST /api</code>,body 里用{" "}
          <code>cmd</code> 字段区分「getUser」「addOrder」……不管成败,
          一律返回 200。
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
    hint: (
      <>
        判级只看三件事:有几个 URL?动词和状态码用对了吗?响应里有链接吗?
      </>
    ),
    solution: (
      <p>
        <b>A = L0</b>:单端点 + 单方法,HTTP 只是隧道,标准的 swamp of POX。
        <br />
        <b>B = L1</b>:资源有了门牌号,但方法没分化 —— 只爬了一格。
        <br />
        <b>C = L2</b>:动词、状态码全用对了;差的只是超媒体链接,
        所以到不了 L3 —— 而这正是业界绝大多数「REST API」站的位置。
      </p>
    ),
  },
  {
    id: "library-resources",
    title: "把图书馆拆成资源",
    d: "medium",
    tags: ["资源建模", "URI"],
    task: (
      <p>
        一个图书馆借书系统:藏书可以检索,读者可以注册,读者能借书、还书。
        请把它拆成<b>资源清单</b>:每种资源起一个复数名词,写出集合和单个的
        URI。注意一个难点:「借书」是个动词,它怎么变成资源?
      </p>
    ),
    hint: (
      <>
        动词困境的标准解法:别盯着动作本身,盯着动作留下的<b>记录</b> ——
        记录是名词。
      </>
    ),
    solution: (
      <p>
        三种资源:<code>books</code>(/books、/books/42)、
        <code>members</code>(/members、/members/7)、
        <code>loans</code>(借阅记录:/loans、/loans/1001,也可以挂成
        /members/7/loans)。「借书」= <code>POST /loans</code>{" "}
        创建一条借阅记录;「还书」= <code>PATCH /loans/1001</code> 把{" "}
        <code>returnedAt</code> 填上(要不要留痕决定用 PATCH 还是
        DELETE)。记住这招:<b>把动作名词化成一条记录</b>,REST
        的世界里就没有装不下的动词。
      </p>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>下面哪句话,把 REST 的定位说得最准?</>,
    opts: [
      <>REST 是 HTTP 的最新版本</>,
      <>REST 是一种架构风格 —— 一组设计约束,不是协议也不是标准</>,
      <>REST 是一种数据格式,和 JSON 是一回事</>,
      <>REST 是一个需要 npm install 的框架</>,
    ],
    correct: 1,
    wrong: [
      <>
        HTTP 是协议,有版本号(1.1、2、3);REST 从来没有版本号 ——
        因为它不是协议,是 Fielding 对「Web 为什么能长这么大」的原则总结。
      </>,
      undefined,
      <>
        这正是本章要拆的头号误解:REST 对格式只字未提。JSON 只是最流行的
        表述,同一资源换成 XML、HTML 照样 REST。
      </>,
      <>
        装不了 —— REST 没有安装包、没有官方实现。它是一套设计原则,
        用任何语言、任何框架都能遵守(或违反)。
      </>,
    ],
    why: (
      <>
        REST 是架构风格(architectural style):六条约束,遵守得越多,
        你的系统就越能搭上 Web 这套基础设施的便车。它是规划理念,
        不是交通法规。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        你 <code>GET /users/42</code>,拿到一份 JSON。严格说,
        这份 JSON 是什么?
      </>
    ),
    opts: [
      <>资源本身 —— 42 号用户就是这份 JSON</>,
      <>资源的一种表述(representation)—— 某一刻的一张快照</>,
      <>一个 URI</>,
      <>数据库里的那行记录</>,
    ],
    correct: 1,
    wrong: [
      <>
        资源是抽象的「42 号用户」这个概念;JSON 只是它此刻的一张照片。
        换个 Accept 头,同一个资源能给你 XML、HTML —— 照片不是本人。
      </>,
      undefined,
      <>
        URI 是门牌号(<code>/users/42</code> 那串地址),你拿到的 JSON
        是从这个门牌号取回的快照,两码事。
      </>,
      <>
        数据库长什么样,REST 根本不关心 —— 表述是服务器为你现做的快照,
        它和底层存储可以毫无相似之处。
      </>,
    ],
    why: (
      <>
        三件套要分清:资源(抽象的事物)、URI(它的门牌号)、表述
        (某一刻某种格式的快照)。REST 名字里的 R 就是
        representation —— 你手里永远只有快照。
      </>
    ),
  },
  {
    type: "multi",
    q: <>下面哪些属于 REST 的六大约束?(多选)</>,
    opts: [
      <>无状态(stateless)</>,
      <>必须使用 JSON</>,
      <>可缓存(cache)</>,
      <>分层系统(layered system)</>,
      <>必须使用 HTTPS</>,
      <>统一接口(uniform interface)</>,
    ],
    correct: [0, 2, 3, 5],
    missHint: (
      <>
        还有约束没选全 —— 回想那六张翻转卡:客户端-服务器、无状态、可缓存、
        统一接口、分层系统、按需代码。
      </>
    ),
    extraHint: (
      <>
        你选进了具体的技术选型 —— REST 对数据格式和加密方式只字未提,
        六条约束全是架构层面的原则,没有一条点名某个技术。
      </>
    ),
    why: (
      <>
        六大约束:客户端-服务器、无状态、可缓存、统一接口、分层系统、
        按需代码(唯一可选)。JSON 和 HTTPS 都是好东西,
        但它们是工程选择,不是 REST 的要求。
      </>
    ),
  },
  {
    type: "choice",
    q: <>「无状态(stateless)」约束的准确含义是?</>,
    opts: [
      <>服务器不能有数据库,什么都不许存</>,
      <>
        每个请求自带理解它所需的全部信息,会话状态由客户端自己保管
      </>,
      <>客户端不能在本地保存任何数据</>,
      <>服务器必须把会话统一存进 Redis</>,
    ],
    correct: 1,
    wrong: [
      <>
        无状态说的是「会话状态」不留在服务器内存,文章、用户这些资源数据
        当然照存数据库 —— 不然 API 还有什么可提供的?
      </>,
      undefined,
      <>
        恰恰相反:会话状态就该客户端随身带着(比如 token、页码),
        每次请求自报家门。
      </>,
      <>
        把会话挪进 Redis 是常见的工程手段,但那叫「集中共享状态」,
        不是 REST 说的无状态 —— 约束的原意是状态根本不进服务端会话。
      </>,
    ],
    why: (
      <>
        每个请求独立完整、自带说明书 —— 于是哪台服务器都能接,
        挂一台换一台,想扩容就加机器。无状态是水平扩展的钥匙。
      </>
    ),
  },
  {
    type: "choice",
    q: <>六大约束里,唯一「可选」的是哪一条?</>,
    opts: [
      <>无状态(stateless)</>,
      <>可缓存(cache)</>,
      <>按需代码(code-on-demand)</>,
      <>统一接口(uniform interface)</>,
    ],
    correct: 2,
    wrong: [
      <>
        无状态是硬性约束 —— 破坏它,水平扩展和可靠性就跟着塌,
        Fielding 没给它留「可选」的口子。
      </>,
      <>
        可缓存也是硬性的:每个响应都必须说清自己能不能被缓存,
        这是 Web 快得起来的前提。
      </>,
      undefined,
      <>
        统一接口恰恰是 REST 的核心区别性约束 —— 把它拿掉,
        REST 就不是 REST 了。
      </>,
    ],
    why: (
      <>
        按需代码(服务器下发代码给客户端执行,比如网页里的 JS)
        是六条里唯一标了「optional」的 —— 不用它,系统照样可以是 REST 的。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        某 API:每种资源有自己的 URL,GET / POST / DELETE 用得有模有样,
        201 / 404 也回得对,但响应里没有任何链接。它在成熟度模型的哪一级?
      </>
    ),
    opts: [<>Level 0</>, <>Level 1</>, <>Level 2</>, <>Level 3</>],
    correct: 2,
    wrong: [
      <>
        L0 是所有请求挤一个 URL、一律 POST 的沼泽 ——
        这个 API 明明已经把资源分开了。
      </>,
      <>
        L1 的特征是「有资源但方法不分化」;它的动词和状态码都用对了,
        早就过了这关。
      </>,
      undefined,
      <>
        差的正是 L3 的入场券:超媒体链接。响应里一个链接都没有,
        就还够不到 the glory of REST。
      </>,
    ],
    why: (
      <>
        资源分开 ✓、动词用对 ✓、状态码用对 ✓、没有超媒体 ✕ ——
        标准的 Level 2,也是业界绝大多数「REST API」的真实位置。
      </>
    ),
  },
  {
    type: "choice",
    q: <>HATEOAS 说的是什么?</>,
    opts: [
      <>一种更安全的登录协议</>,
      <>
        响应里带着「接下来能去哪」的链接,客户端像逛网页一样跟着链接走
      </>,
      <>把 API 文档自动生成成 HTML 页面</>,
      <>用 XML 代替 JSON 传输数据</>,
    ],
    correct: 1,
    wrong: [
      <>
        跟登录没关系 —— 它是统一接口的第 4 个子约束,管的是
        「客户端如何知道下一步能干什么」。
      </>,
      undefined,
      <>
        文档生成由 OpenAPI 负责(第 05 章)。HATEOAS 是把「下一步」
        直接写进响应本身,连文档都可以少翻。
      </>,
      <>
        格式无关 —— JSON 里照样能放链接(比如 <code>_links</code> 字段),
        GitHub 的一堆 <code>*_url</code> 就是证据。
      </>,
    ],
    why: (
      <>
        Hypermedia As The Engine Of Application State:超媒体作为应用状态的
        引擎。服务器在响应里给出可跟随的链接,客户端不再硬编码 URL ——
        像人逛网页一样,跟着链接走。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        同一个 URI,你想要 XML 版的表述 —— 应该在请求里设置哪个
        header?(只写 header 名)
      </>
    ),
    placeholder: "Header 名…",
    answers: ["accept", "accept:"],
    hint: (
      <>
        这个单词的中文意思是「接受」—— 客户端用它声明:我接受什么格式。
      </>
    ),
    why: (
      <>
        <code>Accept: application/xml</code>。这套「按需换表述」的机制叫
        内容协商(content negotiation)—— 同一资源多副面孔,
        它就是「REST ≠ JSON」的活证据。
      </>
    ),
  },
];
