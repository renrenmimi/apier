"use client";

// 第 08 章 · Schema 与类型系统 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语,英文默认)。
// 文案一律走 <T en zh /> 或 Loc<…>;代码块只有注释分语言,可执行行两边逐字节一致。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T } from "@/lib/i18n";

export const LABS: Lab[] = [
  {
    id: "library-sdl",
    title: {
      en: "Write a schema for a library",
      zh: "给图书馆写一份契约",
    },
    d: "medium",
    tags: { en: ["SDL", "modeling"], zh: ["SDL", "建模"] },
    task: (
      <p>
        <T
          en={
            <>
              Open an empty file, or use pen and paper, and write an SDL schema
              for a library system: <b>Book</b> (title, ISBN), <b>Member</b>{" "}
              (name, email), and <b>Loan</b> (which book, which member, when it
              was borrowed, when it was returned). Add a <code>type Query</code>{" "}
              with the entry points. One question decides your answer:{" "}
              <b>
                for a book that has not been returned yet, what should the return
                time be?
              </b>{" "}
              Your nullability has to answer it.
            </>
          }
          zh={
            <>
              打开一个空文件(或者就用纸笔),给「图书馆系统」写一份 SDL:
              <b>Book</b>(书名、ISBN)、<b>Member</b>(姓名、邮箱)、
              <b>Loan</b>(借阅记录:哪本书、谁借的、借出时间、归还时间),
              再加一个 <code>type Query</code> 提供查询入口。有一个问题决定你的答案:
              <b>还没还的书,归还时间该是什么?</b>你的可空性要答对它。
            </>
          }
        />
      </p>
    ),
    hint: (
      <T
        en={
          <>
            Start with who points at whom. <code>Loan</code> is the link between
            a <code>Book</code> and a <code>Member</code>. Nullability carries
            the business rule: a field that is allowed to be &quot;not there
            yet&quot; should not be marked <code>!</code>.
          </>
        }
        zh={
          <>
            先想清楚谁指向谁:<code>Loan</code> 是 <code>Book</code> 和{" "}
            <code>Member</code> 之间的一座桥。可空性承载的是业务规则 ——
            允许「暂时还没有」的字段,就别给它写 <code>!</code>。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="graphql"
          title={{
            en: "library.graphql · one answer",
            zh: "library.graphql · 参考答案",
          }}
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
          <T
            en={
              <>
                The line that matters is the last one:{" "}
                <code>returnedAt: String</code> has no <code>!</code>. While the
                book is still out, the return time is null, and that is the
                business rule written into the type. Different field names are
                fine; the structure and the nullability are what count.
              </>
            }
            zh={
              <>
                关键在最后一行:<code>returnedAt: String</code> 没有{" "}
                <code>!</code> —— 书还没还回来时,归还时间就该是 null,
                这条业务规则因此被写进了类型里。字段名有出入没关系,
                结构和可空性对了就算过关。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "introspect-count",
    title: {
      en: "Ask a server to describe itself",
      zh: "让服务器自报家门",
    },
    d: "easy",
    tags: ["introspection", "GraphiQL"],
    task: (
      <p>
        <T
          en={
            <>
              Open <code>https://rickandmortyapi.com/graphql</code> and run the
              introspection query{" "}
              <code>{"{ __schema { types { name } } }"}</code>. Count how many
              types come back, and look for two groups you did not define but
              that appear in the list anyway: the ones whose names start with{" "}
              <code>__</code>, and familiar names such as <code>String</code> and{" "}
              <code>Int</code>.
            </>
          }
          zh={
            <>
              打开 <code>https://rickandmortyapi.com/graphql</code>,运行内省查询{" "}
              <code>{"{ __schema { types { name } } }"}</code>。
              数一数一共回来多少个类型,并注意其中两类你没有定义、
              却出现在名单里的类型:名字以 <code>__</code> 开头的,
              以及 <code>String</code>、<code>Int</code> 这些眼熟的。
            </>
          }
        />
      </p>
    ),
    hint: (
      <T
        en={
          <>
            There are more than you expect. Besides <code>Character</code>,{" "}
            <code>Location</code>, and <code>Episode</code>, the list also
            contains the five built-in scalars and the introspection types
            themselves (<code>__Schema</code>, <code>__Type</code>, and so on).
          </>
        }
        zh={
          <>
            比你想的多 —— 除了 <code>Character</code>、<code>Location</code>、
            <code>Episode</code> 这些业务类型,五个内置标量和内省系统自己(
            <code>__Schema</code>、<code>__Type</code>……)也都在名单里。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="graphql"
          title={{ en: "Introspection query", zh: "内省查询" }}
          code={`{
  __schema {
    types {
      name
    }
  }
}`}
        />
        <p>
          <T
            en={
              <>
                The list falls into roughly three groups: the types of this API (
                <code>Character</code>, <code>Location</code>,{" "}
                <code>Episode</code>, and the types that wrap them for
                pagination), the five built-in scalars (<code>Int</code>,{" "}
                <code>Float</code>, <code>String</code>, <code>Boolean</code>,{" "}
                <code>ID</code>), and the introspection types (
                <code>__Schema</code>, <code>__Type</code>, <code>__Field</code>,
                and the rest). GraphiQL builds its documentation panel from this
                list, one level at a time. You just did what it does every time
                it starts.
              </>
            }
            zh={
              <>
                名单大致分三类:这个 API 自己的类型(<code>Character</code>、
                <code>Location</code>、<code>Episode</code>,
                以及包装它们的分页类型)、五个内置标量(<code>Int</code>、
                <code>Float</code>、<code>String</code>、<code>Boolean</code>、
                <code>ID</code>),还有内省家族(<code>__Schema</code>、
                <code>__Type</code>、<code>__Field</code>……)。GraphiQL
                的文档面板就是拿这份名单一层层查出来再画成页面的 ——
                你刚才做的,正是它每次启动都会做的事。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "null-detective",
    title: { en: "Nullability, case by case", zh: "可空性侦探" },
    d: "medium",
    tags: ["Non-Null", "List"],
    task: (
      <>
        <p>
          <T
            en={
              <>
                Five pairs of a field declaration and the value the server wants
                to return. Act as the type checker and decide whether each one is
                valid.
              </>
            }
            zh={
              <>
                五组「字段声明 → 服务器想返回的值」。
                你来当一次类型检查器,判断每一组是合法还是非法。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="graphql"
          title={{ en: "Five cases", zh: "五个案子" }}
          code={`# 1. name: String        → null
# 2. name: String!       → null
# 3. tags: [String]      → ["a", null]
# 4. tags: [String!]     → ["a", null]
# 5. tags: [String]!     → null`}
        />
      </>
    ),
    hint: (
      <T
        en={
          <>
            <code>!</code> applies to the type immediately on its left. Inside
            the brackets it covers the elements; outside the brackets it covers
            the list itself. Where there is no <code>!</code>, null is allowed.
          </>
        }
        zh={
          <>
            <code>!</code> 作用于紧挨着它左边的类型 ——
            方括号里的那个管元素,方括号外的那个管列表本身。没有 <code>!</code>{" "}
            的地方,null 一律放行。
          </>
        }
      />
    ),
    solution: (
      <>
        <p>
          <T en="Case by case:" zh="逐案宣判:" />
        </p>
        <CodeBlock
          lang="graphql"
          title={{ en: "The verdicts", zh: "判决书" }}
          code={{
            en: `# 1. name: String    → null         ✔ valid: nullable by default
# 2. name: String!   → null         ✘ invalid: ! is a promise; the null moves up to the nearest nullable parent
# 3. tags: [String]  → ["a", null]  ✔ valid: the elements have no !, so a null inside the list is allowed
# 4. tags: [String!] → ["a", null]  ✘ invalid: the inner ! covers the elements, so no null may appear inside
# 5. tags: [String]! → null         ✘ invalid: the outer ! covers the list, so the list must be there ([] is fine)`,
            zh: `# 1. name: String    → null         ✔ 合法:默认可空,没写 ! 就随时可能是 null
# 2. name: String!   → null         ✘ 非法:! 是承诺,这个 null 会向上冒泡到最近的、允许为空的父字段
# 3. tags: [String]  → ["a", null]  ✔ 合法:元素没写 !,列表里出现 null 没人管
# 4. tags: [String!] → ["a", null]  ✘ 非法:里层的 ! 管元素,列表里不许出现 null
# 5. tags: [String]! → null         ✘ 非法:外层的 ! 管列表,列表本身必须在(空列表 [] 就合法)`,
          }}
        />
        <p>
          <T
            en={
              <>
                Cases 4 and 5 are the two that go wrong most often in real
                projects. If you got all five, you have the rule.
              </>
            }
            zh={
              <>
                第 4、5 案是真实项目里最容易出错的两处。
                五道全对,说明这条规则你已经掌握了。
              </>
            }
          />
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "multi",
    q: {
      en: (
        <>
          Which of these are built-in GraphQL scalars? (select all that apply)
        </>
      ),
      zh: <>GraphQL 的内置标量(scalar)有哪些?(多选)</>,
    },
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
    missHint: {
      en: (
        <>
          Not all of them yet. There are five built-in scalars. Count how many
          you selected, then look for the one you left out.
        </>
      ),
      zh: (
        <>
          还没勾全 —— 内置标量一共五个。数数你选了几个,再看看漏了哪一个。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One of your selections is not built in. <code>Date</code> is common,
          but it is a <b>custom scalar</b> that someone has to define.{" "}
          <code>Number</code> is a JavaScript type; GraphQL splits that into{" "}
          <code>Int</code> and <code>Float</code>.
        </>
      ),
      zh: (
        <>
          你选中了不属于内置标量的项。<code>Date</code> 很常见,
          但它是需要有人定义的<b>自定义标量</b>;<code>Number</code> 是
          JavaScript 的说法,GraphQL 把它分成了 <code>Int</code> 和{" "}
          <code>Float</code>。
        </>
      ),
    },
    why: {
      en: (
        <>
          The five are <code>Int</code>, <code>Float</code>, <code>String</code>,{" "}
          <code>Boolean</code>, and <code>ID</code>. For dates you either send a{" "}
          <code>String</code>, or you define a custom scalar such as{" "}
          <code>DateTime</code> with your own serialize and parse functions.
        </>
      ),
      zh: (
        <>
          五个内置标量是 <code>Int</code>、<code>Float</code>、
          <code>String</code>、<code>Boolean</code>、<code>ID</code>。日期呢?
          要么用 <code>String</code> 传,要么自定义标量(例如{" "}
          <code>DateTime</code>),自己写序列化和解析函数。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A schema declares <code>{"type User { name: String }"}</code> and the
          server returns <code>name: null</code>. Is that valid?
        </>
      ),
      zh: (
        <>
          schema 里写着 <code>{"type User { name: String }"}</code>,
          服务器返回 <code>name: null</code> —— 合法吗?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            No, <code>name</code> is a required field
          </>
        ),
        zh: (
          <>
            不合法,<code>name</code> 是必填字段
          </>
        ),
      },
      {
        en: (
          <>
            Yes — GraphQL fields are <b>nullable by default</b>, and forbidding
            null requires writing <code>String!</code>
          </>
        ),
        zh: (
          <>
            合法 —— GraphQL 字段<b>默认可空</b>,想禁止 null 得显式写{" "}
            <code>String!</code>
          </>
        ),
      },
      {
        en: (
          <>
            No, a value of type <code>String</code> can never be null
          </>
        ),
        zh: (
          <>
            不合法,<code>String</code> 类型的值永远不能是 null
          </>
        ),
      },
      {
        en: <>It depends on whether the database column allows NULL</>,
        zh: <>要看数据库里这一列允不允许 NULL</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Required has to be declared. GraphQL is the opposite of TypeScript
            and Java here: without <code>!</code>, the field allows null.
          </>
        ),
        zh: (
          <>
            「必填」得自己声明。GraphQL 和 TypeScript、Java 的直觉正好相反:
            不写 <code>!</code>,字段就允许 null。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            It is the other way round. A plain <code>String</code> means &quot;a
            string <b>or</b> null&quot;. For &quot;a string, always&quot;, write{" "}
            <code>String!</code>.
          </>
        ),
        zh: (
          <>
            恰恰相反 —— 光写 <code>String</code> 的意思是「字符串<b>或</b>{" "}
            null」。想要「一定是字符串」,得写 <code>String!</code>。
          </>
        ),
      },
      {
        en: (
          <>
            The schema is its own contract, independent of the database. If the
            column allows NULL but the schema writes <code>!</code>, then
            returning null is the server breaking its promise, and the query
            returns an error.
          </>
        ),
        zh: (
          <>
            schema 是一份独立的契约,与数据库的约束无关。
            数据库允许 NULL、但 schema 写了 <code>!</code>?
            那返回 null 就是服务器违约,查询会返回错误。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Nullable by default is the part of GraphQL that surprises people most.
          The benefit is that one failing field can be null while the rest of the
          response is still delivered. The cost is that the client checks for
          null more often.
        </>
      ),
      zh: (
        <>
          默认可空是 GraphQL 最出人意料的一条设定。
          好处是某个字段失败时可以只让它为 null,响应的其余部分照常返回;
          代价是客户端要在更多地方判空。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          How do you read <code>tags: [String!]!</code>?
        </>
      ),
      zh: (
        <>
          <code>tags: [String!]!</code> 该怎么读?
        </>
      ),
    },
    opts: [
      {
        en: <>The list may be null, and the elements may be null</>,
        zh: <>列表可以是 null,元素也可以是 null</>,
      },
      {
        en: (
          <>
            The list itself cannot be null and no element can be null; an empty
            list <code>[]</code> is still valid
          </>
        ),
        zh: (
          <>
            列表本身不能是 null,元素也不能是 null;但空列表 <code>[]</code>{" "}
            仍然合法
          </>
        ),
      },
      {
        en: <>The list may be null, but the elements cannot be null</>,
        zh: <>列表可以是 null,但元素不能是 null</>,
      },
      {
        en: <>The list must contain at least one element</>,
        zh: <>列表必须至少有一个元素</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is <code>[String]</code>, the loosest form. Here both{" "}
            <code>!</code> are present, so null is not allowed at either level.
          </>
        ),
        zh: (
          <>
            那是最宽松的 <code>[String]</code>。这里里外两个 <code>!</code>{" "}
            都在,两层都不许出现 null。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            That is <code>[String!]</code>, with only the inner <code>!</code>.
            The outer <code>!</code> also requires the list itself to be there.
          </>
        ),
        zh: (
          <>
            你读的是 <code>[String!]</code>,只有里层的 <code>!</code>。
            外层再加一个 <code>!</code>,列表本身也不许缺席了。
          </>
        ),
      },
      {
        en: (
          <>
            <code>!</code> controls null, not length. An empty list{" "}
            <code>[]</code> is always valid. SDL cannot express &quot;at least
            one&quot;; that check belongs in your own code.
          </>
        ),
        zh: (
          <>
            <code>!</code> 管的是 null,不管长度 —— 空列表 <code>[]</code>{" "}
            永远合法。「至少一个」这种约束 SDL 表达不了,要靠你自己的代码去校验。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>!</code> applies to the type immediately on its left. The inner
          one says no element may be null; the outer one says the list itself may
          not be null. An empty list is not null, so <code>[]</code> is valid.
        </>
      ),
      zh: (
        <>
          <code>!</code> 作用于紧挨着它左边的类型:里层的说「元素不许是 null」,
          外层的说「列表本身不许是 null」。空列表不是 null,所以 <code>[]</code>{" "}
          合法。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Which statement about the <code>ID</code> type is correct?
        </>
      ),
      zh: (
        <>
          关于 <code>ID</code> 类型,哪个说法是对的?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            An <code>ID</code> is always an auto-incrementing integer
          </>
        ),
        zh: <>ID 一定是自增的整数</>,
      },
      {
        en: (
          <>
            An <code>ID</code> is a key used to identify one object, and it is
            always serialized as a string — the server may store the number 9 and
            the client still receives <code>&quot;9&quot;</code>
          </>
        ),
        zh: (
          <>
            ID 是用来唯一标识一个对象的钥匙,序列化时一律变成字符串 ——
            服务器存的是数字 9,发到客户端也是 <code>&quot;9&quot;</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>ID</code> and <code>Int</code> are equivalent and can be used
            interchangeably
          </>
        ),
        zh: <>ID 和 Int 完全等价,可以随便换用</>,
      },
      {
        en: (
          <>
            An <code>ID</code> can only hold a value in UUID format
          </>
        ),
        zh: <>ID 只能存 UUID 格式的值</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A counter, a UUID, a hash — any of these work. <code>ID</code> says
            nothing about the form of the value, only that it identifies one
            object.
          </>
        ),
        zh: (
          <>
            自增数字、UUID、哈希都行 —— <code>ID</code> 不规定值长什么样,
            只表示「这是一个唯一标识」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            They differ. <code>Int</code> is a 32-bit integer meant for
            arithmetic. <code>ID</code> is a key, it is serialized as a string,
            and the client should not calculate with it.
          </>
        ),
        zh: (
          <>
            差别很大:<code>Int</code> 是拿来做算术的 32 位整数,
            <code>ID</code> 是拿来定位对象的钥匙,序列化成字符串,
            客户端不该拿它算数。
          </>
        ),
      },
      {
        en: (
          <>
            UUID is only one common form. A number or a short hash is equally
            valid, once it is serialized as a string.
          </>
        ),
        zh: (
          <>
            UUID 只是常见形式之一。数字、短哈希,序列化成字符串之后同样是合法的{" "}
            <code>ID</code>。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>ID</code> means an opaque unique identifier. Do not read into its
          contents and do not calculate with it; use it to fetch the object
          again. This is also the basis for caching and global object identity,
          which chapter 10 returns to.
        </>
      ),
      zh: (
        <>
          <code>ID</code> 的关键词是「不透明的唯一标识」:别去解读它的内容,
          也别拿它算数,拿着它能换回对象就够了。
          这也是缓存和全局对象标识的地基,第 10 章会回到这里。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Which of these fields is the best fit for an <code>enum</code>?
        </>
      ),
      zh: (
        <>
          下面哪个字段最应该用 <code>enum</code>(枚举)?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            The status of a post: only <code>DRAFT</code>,{" "}
            <code>PUBLISHED</code>, or <code>ARCHIVED</code>
          </>
        ),
        zh: (
          <>
            文章状态:只可能是 <code>DRAFT</code>、<code>PUBLISHED</code>、
            <code>ARCHIVED</code> 三种之一
          </>
        ),
      },
      {
        en: <>The title of a post: any text</>,
        zh: <>文章标题:任意一段文字</>,
      },
      {
        en: <>The age of a user: any non-negative integer</>,
        zh: <>用户年龄:任意非负整数</>,
      },
      {
        en: (
          <>
            A search result: it may be a <code>Post</code> or a{" "}
            <code>User</code>
          </>
        ),
        zh: <>搜索结果:可能是 Post,也可能是 User</>,
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            Any text is what <code>String</code> is for. The point of an{" "}
            <code>enum</code> is that arbitrary values are not allowed: the
            options are fixed in the schema.
          </>
        ),
        zh: (
          <>
            任意文字是 <code>String</code> 的活。<code>enum</code>{" "}
            的价值恰恰在于「不许任意」:选项固定在 schema 里。
          </>
        ),
      },
      {
        en: (
          <>
            A numeric range uses <code>Int</code> plus a check in your own code.
            An <code>enum</code> lists a finite set of names, not an unbounded
            set of numbers.
          </>
        ),
        zh: (
          <>
            数值范围用 <code>Int</code> 加上你自己的校验代码。<code>enum</code>{" "}
            列举的是有限的几个名字,不是无限的数。
          </>
        ),
      },
      {
        en: (
          <>
            &quot;It may be this type or that type&quot; is what a{" "}
            <code>union</code> does. An <code>enum</code> lists <b>values</b>; a{" "}
            <code>union</code> lists <b>types</b>.
          </>
        ),
        zh: (
          <>
            「可能是这种类型,也可能是那种类型」是 <code>union</code> 的活。
            <code>enum</code> 列举的是<b>值</b>,<code>union</code> 列举的是
            <b>类型</b>。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Use an <code>enum</code> when the set of values is small and fixed, a
          typo would be expensive, and a change should be visible everywhere.
          Write <code>PUBLISH</code> instead of <code>PUBLISHED</code> and the
          server rejects the query before executing it.
        </>
      ),
      zh: (
        <>
          取值有限、拼错代价大、改动要全局可见 —— 三个条件齐了就用{" "}
          <code>enum</code>。把 <code>PUBLISHED</code> 写成 <code>PUBLISH</code>,
          服务器在执行查询之前就会拒绝。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What is the key difference between an <code>interface</code> and a{" "}
          <code>union</code>?
        </>
      ),
      zh: (
        <>
          <code>interface</code> 和 <code>union</code> 最关键的区别是什么?
        </>
      ),
    },
    opts: [
      {
        en: <>There is none; they are two ways of writing the same thing</>,
        zh: <>没有区别,只是两种写法</>,
      },
      {
        en: (
          <>
            An <code>interface</code> requires its members to declare the same
            set of fields; the members of a <code>union</code> need no fields in
            common
          </>
        ),
        zh: (
          <>
            <code>interface</code> 要求成员声明同一组字段;<code>union</code>{" "}
            的成员之间不需要任何公共字段
          </>
        ),
      },
      {
        en: (
          <>
            A <code>union</code> is faster to query
          </>
        ),
        zh: (
          <>
            <code>union</code> 的查询速度更快
          </>
        ),
      },
      {
        en: (
          <>
            An <code>interface</code> can be implemented by only one type
          </>
        ),
        zh: (
          <>
            <code>interface</code> 只能被一个类型实现
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The difference is real: one declares shared fields, the other only
            lists which types are possible. The queries you write against them
            differ too.
          </>
        ),
        zh: (
          <>
            区别是实打实的:一个声明共有字段,一个只列出可能是哪几种类型。
            针对它们写出来的查询也不一样。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Performance is not the difference; both are abstractions in the type
            system. On a <code>union</code> you always need an inline fragment to
            select fields. On an <code>interface</code> you can select the shared
            fields directly.
          </>
        ),
        zh: (
          <>
            差别不在性能,两者都只是类型系统里的抽象工具。查 <code>union</code>{" "}
            时必须用内联片段才能选字段;查 <code>interface</code>{" "}
            时共有字段可以直接选。
          </>
        ),
      },
      {
        en: (
          <>
            The opposite: an <code>interface</code> exists so that <b>several</b>{" "}
            types can implement it. An interface with a single implementation
            adds nothing.
          </>
        ),
        zh: (
          <>
            恰恰相反,<code>interface</code> 生来就是给<b>多个</b>类型实现的 ——
            只有一个实现的接口没有什么意义。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          An <code>interface</code> says &quot;all of you must have these
          fields&quot;. A <code>union</code> says &quot;the result is one of these
          types, and they need nothing in common&quot;. Search results mixing{" "}
          <code>Post</code> and <code>User</code>: <code>union</code>. A group of
          types that all have an <code>id</code> and should be handled together:{" "}
          <code>interface</code>.
        </>
      ),
      zh: (
        <>
          <code>interface</code> 说的是「你们都得有这些字段」;<code>union</code>{" "}
          说的是「结果是这几种类型之一,彼此不必有共同点」。
          搜索结果混着 <code>Post</code> 和 <code>User</code>?用{" "}
          <code>union</code>。一批类型都有 <code>id</code>、要统一处理?用{" "}
          <code>interface</code>。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What is an <code>input</code> type for?
        </>
      ),
      zh: (
        <>
          <code>input</code> 类型是干什么用的?
        </>
      ),
    },
    opts: [
      {
        en: <>Describing the shape of the data a query returns</>,
        zh: <>定义查询返回的数据形状</>,
      },
      {
        en: (
          <>
            An object type used only for arguments: a mutation uses it to send a
            whole object of data. An ordinary <code>type</code> cannot be used as
            an argument
          </>
        ),
        zh: (
          <>
            专门用于参数的对象类型:mutation 用它一次传进一整包数据;
            普通的 <code>type</code> 不能当参数用
          </>
        ),
      },
      {
        en: <>Receiving uploaded files</>,
        zh: <>用来接收上传的文件</>,
      },
      {
        en: (
          <>
            It is another name for <code>type</code>, and the two can be swapped
          </>
        ),
        zh: (
          <>
            它是 <code>type</code> 的别名,两者可以随便换用
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is the job of <code>type</code>. An <code>input</code> describes
            data going <b>into</b> the server, such as the object{" "}
            <code>createPost</code> needs.
          </>
        ),
        zh: (
          <>
            那是 <code>type</code> 的活。<code>input</code> 描述的是<b>进</b>
            服务器的数据,比如 <code>createPost</code> 需要的那包参数。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            File upload is a separate solution (the multipart request extension).
            An <code>input</code> carries ordinary structured arguments: a title,
            a body, a status.
          </>
        ),
        zh: (
          <>
            文件上传是另一套方案(multipart 请求扩展)。<code>input</code>{" "}
            装的是普通的结构化参数:标题、正文、状态这些。
          </>
        ),
      },
      {
        en: (
          <>
            They cannot be swapped. The specification states that a{" "}
            <code>type</code> may only be returned and an <code>input</code> may
            only be passed in. The type of an input field must itself be an input
            type.
          </>
        ),
        zh: (
          <>
            换不了 —— 规范明确规定 <code>type</code> 只能被返回、
            <code>input</code> 只能被传入。输入字段的类型本身也必须是输入类型。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          An <code>input</code> is an object type used for arguments. Chapter 09
          uses it in every mutation:{" "}
          <code>createPost(input: CreatePostInput!)</code> sends one object
          instead of a long list of separate arguments.
        </>
      ),
      zh: (
        <>
          <code>input</code> 就是参数专用的对象类型。第 09 章的每个 mutation
          都会用到它:<code>createPost(input: CreatePostInput!)</code>{" "}
          一次传进一个对象,而不是一长串分开的参数。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          The mechanism by which a schema describes itself — GraphiQL&apos;s
          documentation panel and autocomplete are built on it, and the query
          starts with two underscores (<code>__schema</code>). What is it called?
        </>
      ),
      zh: (
        <>
          schema 自我描述的机制 —— GraphiQL 的文档面板和自动补全都靠它,
          查询以两个下划线开头(<code>__schema</code>)。它的英文名是____。
        </>
      ),
    },
    answers: ["introspection", "内省"],
    hint: {
      en: (
        <>
          The word begins with intro-, which means looking inward at yourself.
          Thirteen letters.
        </>
      ),
      zh: (
        <>
          中文叫「内省」—— 向内看、审视自己。英文是一个 intro- 开头的长单词。
        </>
      ),
    },
    why: {
      en: (
        <>
          Introspection: query <code>__schema</code> or <code>__type</code> and
          the server returns its whole type system. Every convenience in the
          GraphQL tooling is built on it.
        </>
      ),
      zh: (
        <>
          introspection(内省):向服务器查 <code>__schema</code>、
          <code>__type</code>,就能拿回整个类型系统。GraphQL
          工具生态里的一切便利,地基都是它。
        </>
      ),
    },
  },
];
