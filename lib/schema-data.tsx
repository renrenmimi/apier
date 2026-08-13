"use client";

// 第 08 章 · Schema 与类型系统 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "library-sdl",
    title: "给图书馆签一份契约",
    d: "medium",
    tags: ["SDL", "建模"],
    task: (
      <p>
        开个空白文件(或者就用纸笔),给「图书馆系统」写一份 SDL:
        <b>Book</b>(书名、ISBN)、<b>Member</b>(姓名、邮箱)、
        <b>Loan</b>(借阅记录:哪本书、谁借的、借出时间、归还时间),
        最后加一个 <code>type Query</code> 提供查询入口。想一个问题:
        <b>还没还的书,归还时间该是什么?</b>你的可空性要答对这道题。
      </p>
    ),
    hint: (
      <>
        先想清楚「谁指向谁」:Loan 是座桥,一头连 Book 一头连 Member。
        可空性就是业务语义 —— 哪个字段允许「暂时还没有」,就别给它戴 <code>!</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="graphql"
          title="library.graphql · 参考答案"
          code={`type Query {
  book(id: ID!): Book
  books: [Book!]!
  member(id: ID!): Member
}

type Book {
  id: ID!
  title: String!
  isbn: String!
  loans: [Loan!]!
}

type Member {
  id: ID!
  name: String!
  email: String!
  loans: [Loan!]!
}

type Loan {
  id: ID!
  book: Book!
  member: Member!
  borrowedAt: String!
  returnedAt: String
}`}
          hl={[26]}
        />
        <p>
          点睛之笔在最后一行:<code>returnedAt: String</code> 不带{" "}
          <code>!</code> —— 书还没还回来,归还时间就该是 null,
          这不是偷懒,是把业务规则写进了类型里。字段名有出入没关系,
          结构和可空性对了就算过关。
        </p>
      </>
    ),
  },
  {
    id: "introspect-count",
    title: "让服务器自报家门",
    d: "easy",
    tags: ["introspection", "GraphiQL"],
    task: (
      <p>
        打开 <code>https://rickandmortyapi.com/graphql</code>,运行内省查询{" "}
        <code>{"{ __schema { types { name } } }"}</code>。
        数一数一共回来多少个类型,并注意两类你没有定义、却出现在名单里的类型:
        名字以 <code>__</code> 开头的,和 String、Int 这些眼熟的。
      </p>
    ),
    hint: (
      <>
        比你想的多 —— 除了 Character、Location、Episode 这些业务类型,
        五个内置标量和内省系统自己(__Schema、__Type……)也都在名单里。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="graphql"
          title="内省查询"
          code={`{
  __schema {
    types {
      name
    }
  }
}`}
        />
        <p>
          名单里大致三类:业务类型(Character、Location、Episode
          和它们的分页包装类型)、内置标量(Int、Float、String、Boolean、ID)、
          内省家族(<code>__Schema</code>、<code>__Type</code>、
          <code>__Field</code>……)。GraphiQL 的文档面板,
          就是拿这份名单一层层查出来再画成页面的 —— 你刚才做了它每次启动都在做的事。
        </p>
      </>
    ),
  },
  {
    id: "null-detective",
    title: "可空性侦探",
    d: "medium",
    tags: ["Non-Null", "List"],
    task: (
      <>
        <p>
          五组「字段声明 → 服务器想返回的值」,当一回类型检查器,
          判断每组合法还是非法:
        </p>
        <CodeBlock
          lang="graphql"
          title="五个案子"
          code={`# 1. name: String        → null
# 2. name: String!       → null
# 3. tags: [String]      → ["a", null]
# 4. tags: [String!]     → ["a", null]
# 5. tags: [String]!     → null`}
        />
      </>
    ),
    hint: (
      <>
        口诀:<b>从里往外读</b> —— 里层的 <code>!</code> 管元素,外层的{" "}
        <code>!</code> 管列表本身。没有 <code>!</code> 的地方,null 畅行无阻。
      </>
    ),
    solution: (
      <>
        <p>逐案宣判:</p>
        <CodeBlock
          lang="graphql"
          title="判决书"
          code={`# 1. name: String    → null         ✔ 合法:默认可空,没戴 ! 就随时可能是 null
# 2. name: String!   → null         ✘ 非法:! 是承诺,违约会连累父字段一起变 null
# 3. tags: [String]  → ["a", null]  ✔ 合法:元素没戴 !,列表里混 null 没人管
# 4. tags: [String!] → ["a", null]  ✘ 非法:里层 ! 管元素,列表里不许有 null
# 5. tags: [String]! → null         ✘ 非法:外层 ! 管列表,列表本身必须在([] 才合法)`}
        />
        <p>
          全对的话,你已经比不少写了一年 GraphQL 的人都稳了 ——
          第 4、5 案是真实项目里最常见的两个出错点。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "multi",
    q: <>GraphQL 的内置标量(scalar)有哪些?(多选)</>,
    opts: [
      <>Int</>,
      <>Float</>,
      <>Date</>,
      <>String</>,
      <>Boolean</>,
      <>ID</>,
      <>Number</>,
    ],
    correct: [0, 1, 3, 4, 5],
    missHint: (
      <>还没勾全 —— 内置标量一共五个,数数你选了几个,再看看漏了哪个老熟人。</>
    ),
    extraHint: (
      <>
        选中了不属于内置标量的项:Date 很常见但那是<b>自定义标量</b>,不是内置的;
        Number 是 JavaScript 的说法,GraphQL 里分成 Int 和 Float。
      </>
    ),
    why: (
      <>
        五件套:Int、Float、String、Boolean、ID。日期怎么办?
        要么先用 String 顶着,要么自定义标量(如 DateTime)—— 但那是加装,
        不是出厂配置。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        schema 里写着 <code>{"type User { name: String }"}</code>,
        服务器返回 <code>name: null</code> —— 合法吗?
      </>
    ),
    opts: [
      <>不合法,name 是必填字段</>,
      <>
        合法 —— GraphQL 字段<b>默认可空</b>,想禁止 null 得显式写{" "}
        <code>String!</code>
      </>,
      <>不合法,String 类型的值永远不能是 null</>,
      <>要看数据库里这一列允不允许 NULL</>,
    ],
    correct: 1,
    wrong: [
      <>
        「必填」得自己声明。GraphQL 和 TS/Java 的直觉正好相反:
        不写 <code>!</code>,字段就默认允许 null。
      </>,
      undefined,
      <>
        恰恰相反 —— 光秃秃的 <code>String</code> 意思是「字符串<b>或</b> null」。
        想要「纯字符串」,得写 <code>String!</code>。
      </>,
      <>
        schema 是独立的契约,与数据库的约束无关。数据库允许 NULL 但 schema 写了{" "}
        <code>!</code>?那返回 null 时就是服务器违约,直接报错。
      </>,
    ],
    why: (
      <>
        默认可空是 GraphQL 最著名的反直觉设定:好处是某个字段挂了可以只让它为
        null,不影响整个响应;代价是前端要多判空。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>tags: [String!]!</code> 该怎么读?
      </>
    ),
    opts: [
      <>列表可以是 null,元素也可以是 null</>,
      <>
        列表本身不能是 null,元素也不能是 null;但空列表 <code>[]</code> 完全合法
      </>,
      <>列表可以是 null,但元素不能是 null</>,
      <>列表必须至少有一个元素</>,
    ],
    correct: 1,
    wrong: [
      <>
        那是最宽松的 <code>[String]</code>。这里里外两个 <code>!</code>{" "}
        都戴着,两层都不许 null。
      </>,
      undefined,
      <>
        你读的是 <code>[String!]</code>(只有里层 !)。外层再加一个 !,
        列表本身也不许缺席了。
      </>,
      <>
        <code>!</code> 管的是 null,不管长度 —— <code>[]</code>{" "}
        空列表永远合法。「至少一个」这种约束 SDL 表达不了,得靠业务代码。
      </>,
    ],
    why: (
      <>
        从里往外读:里层 <code>!</code> 说「元素不许是 null」,外层{" "}
        <code>!</code> 说「列表本身不许是 null」。空列表不是 null,所以{" "}
        <code>[]</code> 合法。
      </>
    ),
  },
  {
    type: "choice",
    q: <>关于 ID 类型,哪个说法是对的?</>,
    opts: [
      <>ID 一定是自增的整数</>,
      <>
        ID 是「用来唯一定位对象的钥匙」,序列化时一律变成字符串 ——
        后端存的是数字 9,发到前端也是 <code>&quot;9&quot;</code>
      </>,
      <>ID 和 Int 完全等价,随便换用</>,
      <>ID 只能存 UUID 格式的值</>,
    ],
    correct: 1,
    wrong: [
      <>
        自增数字、UUID、哈希……什么形式都行 —— ID 不关心内容长什么样,
        只承诺「这是唯一标识」。
      </>,
      undefined,
      <>
        差别大了:Int 是拿来算数的 32 位整数,ID 是拿来定位的钥匙,
        序列化成字符串,客户端不该对它做数学运算。
      </>,
      <>UUID 只是常见形式之一。数字、短哈希,序列化成字符串后都是合法的 ID。</>,
    ],
    why: (
      <>
        ID 的关键词是「不透明的唯一标识」:别管里面是什么,别拿它算数,
        拿着它能换回对象就行。这也是缓存和全局对象标识的地基(第 10 章会回收)。
      </>
    ),
  },
  {
    type: "choice",
    q: <>下面哪个场景最应该用 enum(枚举)?</>,
    opts: [
      <>
        文章状态:只可能是 DRAFT、PUBLISHED、ARCHIVED 三种之一
      </>,
      <>文章标题:任意一段文字</>,
      <>用户年龄:任意非负整数</>,
      <>搜索结果:可能是 Post,也可能是 User</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        任意文字就是 <code>String</code> 的地盘 —— enum 的价值恰恰是
        「不许任意」,选项焊死在 schema 里。
      </>,
      <>
        数值范围用 <code>Int</code> + 业务校验。enum 枚举的是有限的几个「名字」,
        不是无限的数。
      </>,
      <>
        「可能是这种类型也可能是那种类型」是 union 的地盘 —— enum 枚举的是
        <b>值</b>,union 枚举的是<b>类型</b>。
      </>,
    ],
    why: (
      <>
        选项有限、拼写要防错、改动要全局可见 —— 三个条件齐了就上 enum。
        写错成 <code>PUBLISH</code>?查询阶段直接报错,根本到不了数据库。
      </>
    ),
  },
  {
    type: "choice",
    q: <>interface 和 union 最关键的区别是什么?</>,
    opts: [
      <>没有区别,只是两种写法</>,
      <>
        interface 要求成员实现同一组公共字段;union
        的成员之间不需要任何公共字段
      </>,
      <>union 的查询速度更快</>,
      <>interface 只能被一个类型实现</>,
    ],
    correct: 1,
    wrong: [
      <>
        区别是本质性的:一个立「字段合同」(interface),
        一个只做「候选名单」(union)—— 选错了,查询写法都会跟着别扭。
      </>,
      undefined,
      <>
        性能跟这俩没关系 —— 它们只是类型系统里的抽象工具,
        执行时都靠内联片段分头取字段。
      </>,
      <>
        恰恰相反,interface 生来就是给<b>多个</b>类型实现的 ——
        只有一个实现的 interface 才叫多余。
      </>,
    ],
    why: (
      <>
        记口诀:interface = 「你们都得有这些字段」;union = 「结果是这几种之一,
        彼此不必有共同点」。搜索结果混着 Post 和 User?union。
        一批类型都有 id 要统一处理?interface。
      </>
    ),
  },
  {
    type: "choice",
    q: <>input 类型是干什么用的?</>,
    opts: [
      <>定义查询返回的数据形状</>,
      <>
        专门给参数用的对象类型:mutation 要传一整包数据时用它;
        普通 type 不能当参数
      </>,
      <>用来接收上传的文件</>,
      <>是 type 的别名,两者随便换用</>,
    ],
    correct: 1,
    wrong: [
      <>
        方向反了:返回形状是 <code>type</code> 的活。input 管的是
        <b>进</b>服务器的数据,比如 createPost 要带的那包参数。
      </>,
      undefined,
      <>
        文件上传是另一套方案(multipart 扩展)。input 装的是普通的结构化参数:
        标题、正文、状态这些。
      </>,
      <>
        换不了 —— 规范明确规定 type 只能出、input 只能进,两个世界不许混。
        这样输出类型可以随便加关联字段,而不会把输入搞出循环。
      </>,
    ],
    why: (
      <>
        input = 参数专用的对象类型。第 09 章写 mutation 时它是主角:
        <code>createPost(input: CreatePostInput!)</code>,一包参数干干净净。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        schema「自己描述自己」的机制 —— GraphiQL 的文档面板和自动补全全靠它,
        查询以两个下划线开头(<code>__schema</code>)。它的英文名是____。
      </>
    ),
    answers: ["introspection", "内省"],
    hint: (
      <>
        中文叫「内省」—— 向内看、自我审视。英文是个 i 开头的长单词,
        intro- 打头。
      </>
    ),
    why: (
      <>
        introspection(内省):向服务器查 <code>__schema</code>、
        <code>__type</code>,就能拿回整个类型系统。GraphQL
        工具生态的一切便利,地基都是它。
      </>
    ),
  },
];
