"use client";

// 第 09 章 · 查询、变更与订阅 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "vars-character",
    title: "用变量查一个角色",
    d: "easy",
    tags: ["GraphiQL", "variables"],
    task: (
      <p>
        打开 <code>https://rickandmortyapi.com/graphql</code>(Rick and Morty
        的在线 GraphiQL,免费免注册)。写一个<b>带变量</b>的查询:声明{" "}
        <code>$id: ID!</code>,用它查 <code>character(id: $id)</code> 的{" "}
        <code>name</code>、<code>species</code>、<code>status</code>。
        动态值不许写死在查询里 —— 全部走左下角的 <b>Variables</b> 面板。
      </p>
    ),
    hint: (
      <>
        Variables 面板在编辑器左下角(找不到就点一下底部的 Variables
        标签),里面写的是一份 JSON:<code>{`{ "id": 1 }`}</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="graphql"
          title="query"
          code={`query GetCharacter($id: ID!) {
  character(id: $id) {
    name
    species
    status
  }
}`}
        />
        <CodeBlock
          lang="json"
          title="Variables 面板"
          code={`{ "id": 1 }`}
        />
        <p>
          应该查到 <code>Rick Sanchez / Human / Alive</code>。把 Variables 改成{" "}
          <code>{`{ "id": 2 }`}</code> 再跑一次 —— 查询文本一个字没动,
          结果换人了。这就是变量的意义:<b>文本恒定,数据流动</b>。
        </p>
      </>
    ),
  },
  {
    id: "fragment-alias",
    title: "fragment + 别名:一次要两个人",
    d: "medium",
    tags: ["fragment", "alias"],
    task: (
      <p>
        还是 Rick and Morty 的 GraphiQL。一次请求里把 1 号和 2 号角色
        <b>都</b>查回来:字段组(name、species、status)用一个{" "}
        <b>fragment</b> 定义,只写一遍;两次 <code>character</code>{" "}
        调用分别起<b>别名</b>,别让它们在响应里打架。
      </p>
    ),
    hint: (
      <>
        没有别名时,两个 <code>character</code> 在响应里会抢同一个键 ——
        GraphiQL 会直接标红报错,你可以先故意试试。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="graphql"
          title="query"
          code={`query TwoCharacters($a: ID!, $b: ID!) {
  rick: character(id: $a) {
    ...basics
  }
  morty: character(id: $b) {
    ...basics
  }
}

fragment basics on Character {
  name
  species
  status
}`}
        />
        <CodeBlock
          lang="json"
          title="Variables 面板"
          code={`{ "a": 1, "b": 2 }`}
        />
        <p>
          响应里是 <code>data.rick</code> 和 <code>data.morty</code>{" "}
          两个键 —— 别名负责改名,fragment 负责让那三个字段只写一遍。
          以后想多查一个字段,改 fragment 一处,两个人同时生效。
        </p>
      </>
    ),
  },
  {
    id: "page-flip",
    title: "翻到第 3 页,盯住 info.next",
    d: "medium",
    tags: ["分页", "page-based"],
    task: (
      <p>
        Rick and Morty 用的是<b>页码式分页</b>(不是 Relay connections)。
        在 GraphiQL 里查 <code>characters(page: 1)</code> 的{" "}
        <code>info {"{ count pages next prev }"}</code> 和{" "}
        <code>results {"{ name }"}</code>,然后把 page 改成 2、再改成 3,
        记录每一页 <code>info.next</code> 和 <code>info.prev</code> 的变化。
      </p>
    ),
    hint: (
      <>
        <code>info</code> 就是这套 API 的「pageInfo」:<code>next</code>{" "}
        告诉你下一页的页码,翻到没有下一页时它会变成 <code>null</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="graphql"
          title="query"
          code={`{
  characters(page: 3) {
    info {
      count
      pages
      next
      prev
    }
    results {
      name
    }
  }
}`}
        />
        <p>
          三页下来:<code>page: 1</code> 时 <code>next: 2, prev: null</code>;
          <code>page: 2</code> 时 <code>next: 3, prev: 1</code>;
          <code>page: 3</code> 时 <code>next: 4, prev: 2</code>。
          服务器每次都把「往哪翻」告诉你 —— 这和 §05 的{" "}
          <code>pageInfo.endCursor</code> 是同一个思想,只是书签从
          「不透明 cursor」换成了「页码」。两种分页都真实存在,
          别看到不是 connections 就慌。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        你在做一个聊天 App:①进房间先拉 50 条历史消息;②用户发一条新消息;
        ③别人发消息时你的界面立刻收到。三件事依次该用哪种操作?
      </>
    ),
    opts: [
      <>query → mutation → subscription</>,
      <>query → subscription → mutation</>,
      <>mutation → query → subscription</>,
      <>全部用 query,反正都能传数据</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        ②「发一条消息」是在<b>改</b>服务器上的数据 —— 写操作是 mutation 的地盘;
        subscription 是被动收事件,不负责发。
      </>,
      <>
        ①「拉历史消息」只是读,不改任何东西 —— 读用 query。用 mutation
        读数据虽然语法上跑得通,但等于骗所有读代码的人。
      </>,
      <>
        query 语法上确实什么都能塞,但约定就是共识:读走 query、写走
        mutation、听走 subscription —— 乱用的代价是没人敢相信你的 API。
      </>,
    ],
    why: (
      <>
        读、写、听,一一对应:拉数据是 query,改数据是 mutation,
        等服务器推事件是 subscription。三种操作就是 GraphQL 跟世界打交道的
        全部方式。
      </>
    ),
  },
  {
    type: "choice",
    q: <>别名(alias)解决的核心问题是什么?</>,
    opts: [
      <>给字段起个更好看的名字,纯属美观</>,
      <>
        同一个字段带不同参数要两份时,响应里的键会冲突 ——
        别名给它们各起一个名字
      </>,
      <>把字段名加密,防止别人看懂你的查询</>,
      <>缩短查询文本,节省流量</>,
    ],
    correct: 1,
    wrong: [
      <>
        改名确实是它的表象,但「美观」不是刚需 —— 刚需是{" "}
        <code>post(id:"1")</code> 和 <code>post(id:"2")</code>{" "}
        同时出现时,响应里两个都叫 post,必须有人让路。
      </>,
      undefined,
      <>
        查询文本本来就是明文发给服务器的,加密无从谈起。别名只是给
        <b>响应里的键</b>换个名字。
      </>,
      <>
        别名通常反而让查询变长(多写了个名字)。它买的不是体积,是
        「同一字段请求两份」的能力。
      </>,
    ],
    why: (
      <>
        响应的形状跟着查询走,键名默认就是字段名。同一字段不同参数要两份,
        键名就撞车了 —— <code>latest: post(id:"42")</code> 和{" "}
        <code>pinned: post(id:"1")</code>,一人一个名字,各回各家。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        把用户输入拼进查询字符串(<code>{'`{ post(id: "${input}") }`'}</code>
        )和用变量(<code>$id: ID!</code>)相比,变量的核心优势是:
      </>
    ),
    opts: [
      <>字符串拼接的性能太差,变量更快</>,
      <>只是代码风格问题,两种写法没有实质区别</>,
      <>
        查询文本保持恒定:服务器能先做类型检查、注入攻击无处下嘴、
        固定文本还便于缓存和 persisted queries
      </>,
      <>GraphQL 语法禁止在查询里写死参数值,不用变量跑不起来</>,
    ],
    correct: 2,
    wrong: [
      <>
        拼字符串本身快得很 —— 问题不在性能,在安全和可靠性:
        用户输入一混进查询文本,查询本身就成了攻击面。
      </>,
      <>
        区别大了:拼接时用户输入能改写查询结构(和 SQL 注入一个路数),
        变量则永远只是「数据」,进不了「代码」。
      </>,
      undefined,
      <>
        写死参数完全合法,<code>post(id: "1")</code> 天天见。
        变量不是语法强制,是工程自保。
      </>,
    ],
    why: (
      <>
        和 SQL 参数化查询同一个道理:<b>代码归代码,数据归数据</b>。
        查询文本一旦恒定,服务器可以预先校验类型、缓存执行计划,
        persisted queries 也才有的谈。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        GraphQL 规范规定:顶层的 mutation 字段必须<b>串行</b>执行,
        而 query 的顶层字段可以并行。为什么要区别对待?
      </>
    ),
    opts: [
      <>mutation 比 query 重要,所以要排队执行</>,
      <>
        写操作可能互相依赖、互相影响 ——
        「先扣款再入账」这种顺序乱了会出事;读操作互不干扰,并行无妨
      </>,
      <>因为 mutation 的语法解析比较慢,只能一个一个来</>,
      <>历史遗留 bug,新版规范已经改成并行了</>,
    ],
    correct: 1,
    wrong: [
      <>
        规范关心的是正确性:两个写操作并行,谁先谁后就看运气了 ——
        涉及同一份数据时结果不可预测。
      </>,
      undefined,
      <>
        解析速度和执行顺序是两码事。串行是<b>语义</b>上的保证:
        上一个写完,下一个才开始。
      </>,
      <>
        没有的事 —— 包括最新的 September 2025 版,规范一直明文规定顶层
        mutation 字段按出现顺序依次执行。
      </>,
    ],
    why: (
      <>
        读一百遍余额,结果都一样;先取钱还是先存钱,结果天差地别。
        写操作有顺序依赖,所以规范保证顶层 mutation
        字段一个执行完再执行下一个 —— 结果永远可预测。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        判断题:一个 GraphQL 响应里,<code>data</code> 和 <code>errors</code>{" "}
        能不能同时出现?
      </>
    ),
    opts: [
      <>不能 —— 只要出错,data 一定是 null</>,
      <>
        能 —— 一个字段挂了,其它字段照常返回:data 装幸存的数据,
        errors 记出错的账
      </>,
      <>能,但只有 mutation 会这样,query 不会</>,
      <>不能 —— 规范规定二者互斥,同时出现是服务器 bug</>,
    ],
    correct: 1,
    wrong: [
      <>
        这是 REST 思维的惯性:REST 里一个请求要么成要么败。GraphQL
        一次执行几十个 resolver,一个倒下不连累全家 —— 除非非空约束逼它连累。
      </>,
      undefined,
      <>
        和操作类型无关 —— query、mutation、subscription
        都可能部分成功。决定「牵连范围」的是字段的非空(!)约束,不是操作类型。
      </>,
      <>
        恰恰相反,规范明确允许并存 —— 「部分成功(partial data)」是 GraphQL
        响应模型的招牌特性,REST 没有对应物。
      </>,
    ],
    why: (
      <>
        <code>{`{ data, errors }`}</code> 是一对搭档不是单选题:
        每个字段各自执行,谁出错谁进 errors(带着 path 报坐标),
        幸存字段照常躺在 data 里。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        schema 里写着 <code>author: User!</code>(非空)。执行时 author 的
        resolver 抛了错,响应里会发生什么?
      </>
    ),
    opts: [
      <>只有 author 变成 null,post 的其它字段不受影响</>,
      <>
        author 不能为 null,错误向上「冒泡」:整个 post 被置成 null,
        errors 里用 path 记下事发地点
      </>,
      <>整个响应变成 HTTP 500,body 为空</>,
      <>服务器自动返回一个空的 User 对象顶替</>,
    ],
    correct: 1,
    wrong: [
      <>
        「只有它自己变 null」是 <code>author: User</code>(可空)的待遇。
        加了 <code>!</code> 就没有这条退路了 —— null 放不进非空字段。
      </>,
      undefined,
      <>
        传统上 GraphQL 的 HTTP 状态照样是 200,错误全在 body 的 errors
        数组里 —— 这正是「res.ok 判断不了 GraphQL 成败」的原因。
      </>,
      <>
        服务器绝不会凭空捏造数据 —— 造一个假 User 比返回错误危险多了。
        规范的选择是:置 null,冒泡,记账。
      </>,
    ],
    why: (
      <>
        非空是承诺:「这个字段绝不给你 null」。兑现不了承诺,只好把 null
        上交给父字段;父字段要也是非空,就继续往上冒 ——
        直到某个可空字段接住它,或者整个 data 变 null。
      </>
    ),
  },
  {
    type: "multi",
    q: (
      <>
        用 Relay 风格的 connections 翻下一页,<code>pageInfo</code>{" "}
        里必须盯住哪两个字段?(多选)
      </>
    ),
    opts: [
      <>
        <code>hasNextPage</code>
      </>,
      <>
        <code>endCursor</code>
      </>,
      <>
        <code>startCursor</code>
      </>,
      <>
        <code>totalCount</code>
      </>,
    ],
    correct: [0, 1],
    missHint: (
      <>
        少了一个 —— 想想往前翻的两个动作:「还有没有下一页?」和
        「下一页从哪开始?」,各对应一个字段。
      </>
    ),
    extraHint: (
      <>
        多选了 —— <code>startCursor</code> 是往<b>回</b>翻(last/before)
        用的,<code>totalCount</code> 是可选统计,都不是往后翻页的必需品。
      </>
    ),
    why: (
      <>
        往后翻的循环就两步:<code>hasNextPage</code> 为 true 就继续,把{" "}
        <code>endCursor</code> 原样填进下一次请求的 <code>after</code>。
        一个管「翻不翻」,一个管「从哪翻」。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        subscription 要让服务器能随时把事件<b>推</b>给客户端,
        底层通常靠什么实现?
      </>
    ),
    opts: [
      <>客户端每秒发一次 HTTP GET 去问「有新的吗」</>,
      <>WebSocket 或 SSE 这类保持打开的长连接/事件流</>,
      <>FTP 文件传输</>,
      <>服务器直接给客户端的 IP 发 UDP 包</>,
    ],
    correct: 1,
    wrong: [
      <>
        那是轮询(polling)—— 恰恰是 subscription 要取代的东西:
        没消息也白问,有消息还延迟。
      </>,
      undefined,
      <>
        FTP 是传文件的老协议,连「服务器主动推」的概念都没有,
        和实时订阅不沾边。
      </>,
      <>
        浏览器里的 JS 根本发不了裸 UDP;而且 UDP 不保证送达,
        丢一条聊天消息可不是闹着玩的。
      </>,
    ],
    why: (
      <>
        普通 HTTP 是「一问一答就挂断」,推不了。WebSocket 建立双向长连接,
        SSE(Server-Sent Events)保持一条只出不进的事件流 ——
        两者都让「服务器想说就说」成为可能。
      </>
    ),
  },
];
