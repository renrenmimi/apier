"use client";

// 第 09 章 · 查询、变更与订阅 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语,英文默认)。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T } from "@/lib/i18n";

export const LABS: Lab[] = [
  {
    id: "vars-character",
    title: {
      en: "Fetch one character with a variable",
      zh: "用变量查一个角色",
    },
    d: "easy",
    tags: ["GraphiQL", "variables"],
    task: (
      <p>
        <T
          en={
            <>
              Open <code>https://rickandmortyapi.com/graphql</code> — the Rick
              and Morty GraphiQL playground, free and with no account. Write a
              query that <b>uses a variable</b>: declare <code>$id: ID!</code>,
              use it in <code>character(id: $id)</code>, and select{" "}
              <code>name</code>, <code>species</code>, and <code>status</code>.
              The id must not be written into the query text. Put it in the{" "}
              <b>Variables</b> panel instead.
            </>
          }
          zh={
            <>
              打开 <code>https://rickandmortyapi.com/graphql</code> —— Rick and
              Morty 的在线 GraphiQL,免费、免注册。写一个<b>使用变量</b>的查询:
              声明 <code>$id: ID!</code>,用它调 <code>character(id: $id)</code>
              ,并选取 <code>name</code>、<code>species</code>、
              <code>status</code>。id 不许写进查询文本,要放在{" "}
              <b>Variables</b> 面板里。
            </>
          }
        />
      </p>
    ),
    hint: (
      <T
        en={
          <>
            The Variables panel is at the bottom left of the editor; if you do
            not see it, click the Variables tab at the bottom. What you write in
            it is JSON: <code>{`{ "id": 1 }`}</code>.
          </>
        }
        zh={
          <>
            Variables 面板在编辑器左下角,看不到就点一下底部的 Variables 标签。
            里面写的是一份 JSON:<code>{`{ "id": 1 }`}</code>。
          </>
        }
      />
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
          title={{ en: "Variables panel", zh: "Variables 面板" }}
          code={`{ "id": 1 }`}
        />
        <p>
          <T
            en={
              <>
                You should get <code>Rick Sanchez / Human / Alive</code>. Now
                change the variables to <code>{`{ "id": 2 }`}</code> and run it
                again. Not one character of the query text changed, and a
                different character came back. That is the point of variables:{" "}
                <b>constant text, changing values</b>.
              </>
            }
            zh={
              <>
                应该查到 <code>Rick Sanchez / Human / Alive</code>。
                再把 Variables 改成 <code>{`{ "id": 2 }`}</code> 跑一次 ——
                查询文本一个字没动,回来的却是另一个角色。
                这就是变量的意义:<b>文本恒定,值可变</b>。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "fragment-alias",
    title: {
      en: "Fragment and alias: two characters in one request",
      zh: "fragment + 别名:一次请求要两个人",
    },
    d: "medium",
    tags: ["fragment", "alias"],
    task: (
      <p>
        <T
          en={
            <>
              Same playground. Fetch character 1 <b>and</b> character 2 in one
              request. Define the group of fields (name, species, status) once
              as a <b>fragment</b>, and give the two <code>character</code>{" "}
              calls their own <b>aliases</b> so their keys do not collide in the
              response.
            </>
          }
          zh={
            <>
              还是那个练习场。在一次请求里把 1 号<b>和</b> 2 号角色都查回来:
              把那组字段(name、species、status)用一个 <b>fragment</b>{" "}
              定义一次,再给两次 <code>character</code> 调用各起一个<b>别名</b>,
              让它们在响应里的键不冲突。
            </>
          }
        />
      </p>
    ),
    hint: (
      <T
        en={
          <>
            Without aliases, both <code>character</code> fields want the same
            response key. GraphiQL marks that as an error before you run it —
            try it on purpose first.
          </>
        }
        zh={
          <>
            没有别名时,两个 <code>character</code> 字段会抢同一个响应键。
            GraphiQL 在你运行之前就会标红 —— 可以先故意试一次。
          </>
        }
      />
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
          title={{ en: "Variables panel", zh: "Variables 面板" }}
          code={`{ "a": 1, "b": 2 }`}
        />
        <p>
          <T
            en={
              <>
                The response has two keys, <code>data.rick</code> and{" "}
                <code>data.morty</code>. The aliases produced the keys; the
                fragment kept the three fields written once. Add a field to the
                fragment later and both characters get it.
              </>
            }
            zh={
              <>
                响应里是 <code>data.rick</code> 和 <code>data.morty</code>{" "}
                两个键。键名来自别名,那三个字段只写了一遍来自 fragment。
                以后往 fragment 里加个字段,两个角色同时生效。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "page-flip",
    title: {
      en: "Page through the list and watch info.next",
      zh: "一页页翻,盯住 info.next",
    },
    d: "medium",
    tags: { en: ["pagination", "page-based"], zh: ["分页", "page-based"] },
    task: (
      <p>
        <T
          en={
            <>
              The Rick and Morty API uses <b>page numbers</b>, not Relay
              connections. In GraphiQL, query{" "}
              <code>characters(page: 1)</code> for{" "}
              <code>info {"{ count pages next prev }"}</code> and{" "}
              <code>results {"{ name }"}</code>. Then change the page to 2, then
              to 3, and write down how <code>info.next</code> and{" "}
              <code>info.prev</code> change.
            </>
          }
          zh={
            <>
              Rick and Morty API 用的是<b>页码</b>,不是 Relay connections。
              在 GraphiQL 里查 <code>characters(page: 1)</code> 的{" "}
              <code>info {"{ count pages next prev }"}</code> 和{" "}
              <code>results {"{ name }"}</code>,然后把 page 改成 2、再改成 3,
              记下 <code>info.next</code> 和 <code>info.prev</code> 怎么变。
            </>
          }
        />
      </p>
    ),
    hint: (
      <T
        en={
          <>
            <code>info</code> is this API&apos;s version of{" "}
            <code>pageInfo</code>. <code>next</code> holds the next page number,
            and it becomes <code>null</code> on the last page.
          </>
        }
        zh={
          <>
            <code>info</code> 就是这套 API 的 <code>pageInfo</code>。
            <code>next</code> 是下一页的页码,翻到最后一页时它会变成{" "}
            <code>null</code>。
          </>
        }
      />
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
          <T
            en={
              <>
                Across the three pages: on <code>page: 1</code> you get{" "}
                <code>next: 2, prev: null</code>; on <code>page: 2</code>,{" "}
                <code>next: 3, prev: 1</code>; on <code>page: 3</code>,{" "}
                <code>next: 4, prev: 2</code>. The server tells you where to go
                next every time. That is the same idea as{" "}
                <code>pageInfo.endCursor</code> in §05 — only the bookmark
                changed from an opaque cursor to a page number. Both styles are
                real, so do not assume something is wrong when a schema is not
                using connections.
              </>
            }
            zh={
              <>
                三页看下来:<code>page: 1</code> 时 <code>next: 2, prev: null</code>
                ;<code>page: 2</code> 时 <code>next: 3, prev: 1</code>;
                <code>page: 3</code> 时 <code>next: 4, prev: 2</code>。
                服务器每次都告诉你下一步往哪走 —— 这和 §05 的{" "}
                <code>pageInfo.endCursor</code> 是同一个思路,
                只是书签从不透明 cursor 换成了页码。两种风格都真实存在,
                看到不是 connections 不用怀疑哪里出错了。
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
    type: "choice",
    q: {
      en: (
        <>
          You are building a chat app. ① When a user enters a room, load the
          last 50 messages. ② The user sends a new message. ③ When someone else
          sends a message, it appears immediately. Which operation type fits
          each step?
        </>
      ),
      zh: (
        <>
          你在做一个聊天应用:①进房间时加载最近 50 条消息;②用户发出一条新消息;
          ③别人发消息时,你的界面立刻显示出来。三步各该用哪种操作?
        </>
      ),
    },
    opts: [
      <>query → mutation → subscription</>,
      <>query → subscription → mutation</>,
      <>mutation → query → subscription</>,
      {
        en: <>All three can be a query, since a query can carry any data</>,
        zh: <>三步都用 query,反正 query 什么数据都能传</>,
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            Step ② <b>changes</b> data on the server, and writes belong to a
            mutation. A subscription only receives events; it does not send
            anything.
          </>
        ),
        zh: (
          <>
            第 ② 步是在<b>改</b>服务器上的数据,写操作属于 mutation。
            subscription 只负责接收事件,它不发送任何东西。
          </>
        ),
      },
      {
        en: (
          <>
            Step ① only reads; it changes nothing, so it is a query. Reading
            through a mutation does work syntactically, but it misleads everyone
            who reads your API.
          </>
        ),
        zh: (
          <>
            第 ① 步只是读,什么都没改,所以是 query。
            用 mutation 读数据语法上确实跑得通,但会误导每一个读你 API 的人。
          </>
        ),
      },
      {
        en: (
          <>
            A query can technically carry the data, but the convention is what
            other people and tools rely on: reads use query, writes use
            mutation, and pushed events use subscription. And a query cannot
            deliver an event that happens later — the exchange is already
            finished.
          </>
        ),
        zh: (
          <>
            query 技术上确实能传这些数据,但别人和工具依赖的正是这条约定:
            读用 query,写用 mutation,被推送的事件用 subscription。
            而且 query 送不了之后才发生的事件 —— 那次往返早就结束了。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Read, write, subscribe, one for each: loading data is a query,
          changing data is a mutation, and receiving events the server sends is
          a subscription. Those three operation types are the whole interface.
        </>
      ),
      zh: (
        <>
          读、写、订阅,一一对应:加载数据是 query,改数据是 mutation,
          接收服务器推送的事件是 subscription。这三种操作类型就是全部接口。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>What problem does an alias solve?</>,
      zh: <>别名(alias)解决的是什么问题?</>,
    },
    opts: [
      {
        en: <>It gives a field a nicer name; it is purely cosmetic</>,
        zh: <>给字段起个好看的名字,纯粹为了美观</>,
      },
      {
        en: (
          <>
            When the same field is requested twice with different arguments, the
            response keys would collide — an alias gives each result its own key
          </>
        ),
        zh: (
          <>
            同一个字段用不同参数取两份时,响应的键会冲突 ——
            别名给每份结果各一个键
          </>
        ),
      },
      {
        en: <>It hides the field name so nobody can read your query</>,
        zh: <>把字段名藏起来,让别人读不懂你的查询</>,
      },
      {
        en: <>It shortens the query text and saves bandwidth</>,
        zh: <>缩短查询文本,节省流量</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Renaming is what it does, but appearance is not the reason. The
            reason is that <code>post(id: &quot;1&quot;)</code> and{" "}
            <code>post(id: &quot;2&quot;)</code> in the same query would both
            want the key <code>post</code>.
          </>
        ),
        zh: (
          <>
            改名确实是它做的事,但理由不是好看。理由是同一个查询里的{" "}
            <code>post(id: &quot;1&quot;)</code> 和{" "}
            <code>post(id: &quot;2&quot;)</code> 都想占 <code>post</code>{" "}
            这个键。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The query text is sent to the server as plain text anyway, so
            hiding is not possible. An alias only changes a key{" "}
            <b>in the response</b>.
          </>
        ),
        zh: (
          <>
            查询文本本来就是明文发给服务器的,藏不住。
            别名只改<b>响应里</b>的键名。
          </>
        ),
      },
      {
        en: (
          <>
            An alias usually makes the query slightly longer, since you write an
            extra name. What it buys is the ability to request one field more
            than once.
          </>
        ),
        zh: (
          <>
            别名通常让查询稍微变长(多写了一个名字)。
            它买到的是「同一个字段能请求多次」的能力。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The response mirrors the query, and each key is the field name by
          default. Request the same field twice and the keys collide.{" "}
          <code>latest: post(id: &quot;42&quot;)</code> and{" "}
          <code>pinned: post(id: &quot;1&quot;)</code> each get their own key,
          so the shape of the response is unambiguous.
        </>
      ),
      zh: (
        <>
          响应的形状跟着查询走,键默认就是字段名。同一个字段取两份,键就撞了。
          <code>latest: post(id: &quot;42&quot;)</code> 和{" "}
          <code>pinned: post(id: &quot;1&quot;)</code> 各占一个键,
          响应的形状就没有歧义了。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Compared with building the query text by concatenation (
          <code>{'`{ post(id: "${input}") }`'}</code>), what does using a
          variable (<code>$id: ID!</code>) give you?
        </>
      ),
      zh: (
        <>
          和用拼接生成查询文本(<code>{'`{ post(id: "${input}") }`'}</code>
          )相比,使用变量(<code>$id: ID!</code>)带来的是什么?
        </>
      ),
    },
    opts: [
      {
        en: <>String concatenation is slow, so variables run faster</>,
        zh: <>字符串拼接慢,变量更快</>,
      },
      {
        en: <>Only a matter of code style; the two are equivalent</>,
        zh: <>只是代码风格问题,两种写法等价</>,
      },
      {
        en: (
          <>
            The query text stays constant: values cannot change the structure of
            the query, the server checks the declared types before execution,
            and the fixed text can be parsed once and cached, which is what
            persisted queries need
          </>
        ),
        zh: (
          <>
            查询文本保持恒定:值改变不了查询的结构,
            服务器在执行前先检查声明的类型,
            固定的文本可以只解析一次并缓存 —— 持久化查询正是靠这一点
          </>
        ),
      },
      {
        en: (
          <>
            The GraphQL syntax forbids literal argument values, so a query
            without variables will not run
          </>
        ),
        zh: <>GraphQL 语法禁止把参数值写死,不用变量就跑不起来</>,
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            Concatenating strings is fast. The problem is not speed; it is that
            user input becomes part of the query text and can then change what
            the query asks for.
          </>
        ),
        zh: (
          <>
            拼字符串本身很快。问题不在速度,
            而在于用户输入成了查询文本的一部分,从而能改变这个查询在要什么。
          </>
        ),
      },
      {
        en: (
          <>
            They are not equivalent. With concatenation, user input can rewrite
            the structure of the query — the same class of problem as SQL
            injection. A variable value is only ever data.
          </>
        ),
        zh: (
          <>
            并不等价。用拼接时,用户输入可以改写查询的结构 ——
            和 SQL 注入是同一类问题。而变量的值永远只是数据。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Literal arguments are perfectly legal; <code>post(id: &quot;1&quot;)</code>{" "}
            is everywhere. Variables are not required by the syntax. They are an
            engineering choice.
          </>
        ),
        zh: (
          <>
            写死参数完全合法,<code>post(id: &quot;1&quot;)</code> 到处都是。
            语法并不强制使用变量,那是一个工程上的选择。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The same principle as a parameterised SQL query:{" "}
          <b>keep code and data separate</b>. A variable is declared on the
          operation and its value travels as a separate JSON object. Because the
          text never changes, the server can validate types up front, cache the
          parsed document, and accept persisted queries.
        </>
      ),
      zh: (
        <>
          和参数化 SQL 是同一个原则:<b>代码和数据分开</b>。
          变量声明在操作上,值作为另一份 JSON 一起发送。
          正因为文本不变,服务器才能提前校验类型、缓存解析结果,
          并接受持久化查询。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          The specification requires the top-level fields of a mutation to
          execute <b>in series</b>, while the top-level fields of a query may
          execute in parallel. Why the difference?
        </>
      ),
      zh: (
        <>
          规范要求 mutation 的顶层字段<b>串行</b>执行,
          而 query 的顶层字段可以并行执行。为什么要区别对待?
        </>
      ),
    },
    opts: [
      {
        en: <>Mutations matter more than queries, so they get a queue</>,
        zh: <>mutation 比 query 重要,所以要排队</>,
      },
      {
        en: (
          <>
            Writes can depend on each other — &quot;take the money out, then put
            it in&quot; gives a different result if the order changes. Reads do
            not affect each other, so parallel execution is safe
          </>
        ),
        zh: (
          <>
            写操作之间可能互相依赖 ——「先扣款、后入账」顺序变了结果就不同;
            读操作互不影响,并行是安全的
          </>
        ),
      },
      {
        en: <>Parsing a mutation is slower, so they have to run one at a time</>,
        zh: <>mutation 解析起来更慢,只能一个一个来</>,
      },
      {
        en: <>A historical bug; the current specification made them parallel</>,
        zh: <>历史遗留 bug,最新的规范已经改成并行了</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The specification is about correctness, not importance. If two
            writes touching the same data ran at the same time, the result would
            depend on timing.
          </>
        ),
        zh: (
          <>
            规范关心的是正确性,不是重要性。
            两个写操作碰到同一份数据又同时执行,结果就取决于时序了。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Parsing speed and execution order are separate things. Serial
            execution is a <b>semantic</b> guarantee: the first field finishes
            before the second starts.
          </>
        ),
        zh: (
          <>
            解析速度和执行顺序是两回事。串行执行是一条<b>语义</b>保证:
            第一个字段执行完,第二个才开始。
          </>
        ),
      },
      {
        en: (
          <>
            No. Every edition, including the September 2025 Edition, states that
            the top-level fields of a mutation execute in the order they are
            written.
          </>
        ),
        zh: (
          <>
            并没有。包括 September 2025 Edition 在内的每一版规范都写明:
            mutation 的顶层字段按书写顺序执行。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Reading a balance a hundred times gives the same answer every time;
          withdrawing before depositing is not the same as the reverse. Because
          writes depend on order, the specification guarantees that one
          top-level mutation field completes before the next begins. Note the
          limit: this covers only the top-level fields. Inside the payload each
          mutation returns, the fields resolve like a query.
        </>
      ),
      zh: (
        <>
          读一百次余额,结果都一样;先取款后存款和反过来,结果不一样。
          正因为写操作依赖顺序,规范保证一个顶层 mutation 字段执行完,
          下一个才开始。注意边界:这只管顶层字段。
          在每个 mutation 返回的负载内部,字段的解析和 query 一样。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Can <code>data</code> and <code>errors</code> appear in the same
          GraphQL response?
        </>
      ),
      zh: (
        <>
          一个 GraphQL 响应里,<code>data</code> 和 <code>errors</code>{" "}
          能同时出现吗?
        </>
      ),
    },
    opts: [
      {
        en: <>No — as soon as anything fails, data is null</>,
        zh: <>不能 —— 只要出错,data 就是 null</>,
      },
      {
        en: (
          <>
            Yes — when one field fails, the others are still returned: data
            holds what succeeded and errors records what failed
          </>
        ),
        zh: (
          <>
            能 —— 一个字段失败时,其余字段照常返回:
            data 装成功的部分,errors 记录失败的部分
          </>
        ),
      },
      {
        en: <>Yes, but only for a mutation; a query never does this</>,
        zh: <>能,但只有 mutation 会这样,query 不会</>,
      },
      {
        en: (
          <>
            No — the specification says they are mutually exclusive, so seeing
            both is a server bug
          </>
        ),
        zh: <>不能 —— 规范规定二者互斥,同时出现是服务器的 bug</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is REST thinking: there, one request either succeeds or fails.
            A GraphQL execution runs many resolvers, and one failure does not
            stop the rest — unless a non-null constraint forces the failure
            upward.
          </>
        ),
        zh: (
          <>
            这是 REST 的思维:在那边,一个请求要么成功要么失败。
            一次 GraphQL 执行会跑很多 resolver,一个失败并不会拖垮其余的 ——
            除非非空约束把失败往上推。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The operation type makes no difference here. What decides how far a
            failure spreads is the non-null (<code>!</code>) constraint on the
            fields, not whether it is a query or a mutation.
          </>
        ),
        zh: (
          <>
            这和操作类型无关。决定失败影响范围的是字段上的非空(<code>!</code>
            )约束,不是它是 query 还是 mutation。
          </>
        ),
      },
      {
        en: (
          <>
            The opposite: the specification explicitly allows both. A partial
            result is a defining property of the GraphQL response, and REST has
            no equivalent.
          </>
        ),
        zh: (
          <>
            恰恰相反,规范明确允许二者并存。
            部分结果是 GraphQL 响应的一个定义性特征,REST 里没有对应物。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>{`{ data, errors }`}</code> is a pair, not a choice. Each field
          executes on its own. A field that fails is recorded in{" "}
          <code>errors</code> with a <code>path</code> pointing at its position,
          and the fields that succeeded stay in <code>data</code>.
        </>
      ),
      zh: (
        <>
          <code>{`{ data, errors }`}</code> 是一对搭档,不是单选题。
          每个字段各自执行:失败的字段记进 <code>errors</code>,
          并用 <code>path</code> 指出它的位置;成功的字段留在 <code>data</code>{" "}
          里。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          The schema declares <code>author: User!</code> (non-null), and{" "}
          <code>post</code> itself is nullable. At run time the resolver for{" "}
          <code>author</code> throws. What does the response look like?
        </>
      ),
      zh: (
        <>
          schema 里声明的是 <code>author: User!</code>(非空),
          而 <code>post</code> 本身可空。执行时 <code>author</code> 的 resolver
          抛了错,响应会是什么样?
        </>
      ),
    },
    opts: [
      {
        en: <>Only author becomes null; the other fields of post are unaffected</>,
        zh: <>只有 author 变成 null,post 的其它字段不受影响</>,
      },
      {
        en: (
          <>
            null is not allowed in author, so it moves up to the nearest
            nullable parent: the whole post becomes null, and errors records the
            path of the field that actually failed
          </>
        ),
        zh: (
          <>
            author 位置放不下 null,于是它向上移到最近的可空父字段:
            整个 post 变成 null,errors 里记下真正失败的那个字段的 path
          </>
        ),
      },
      {
        en: <>The whole response becomes HTTP 500 with an empty body</>,
        zh: <>整个响应变成 HTTP 500,body 为空</>,
      },
      {
        en: <>The server returns an empty User object instead</>,
        zh: <>服务器返回一个空的 User 对象顶替</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is what happens with <code>author: User</code>, the nullable
            version. With <code>!</code> that option is gone —{" "}
            <code>null</code> cannot be placed in a non-null position.
          </>
        ),
        zh: (
          <>
            那是 <code>author: User</code>(可空版本)的结果。
            加了 <code>!</code> 就没有这条路了 —— 非空位置放不下{" "}
            <code>null</code>。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Traditionally the HTTP status is still 200 and the failure is in the{" "}
            <code>errors</code> array in the body. That is exactly why{" "}
            <code>res.ok</code> cannot tell you whether a GraphQL request
            succeeded.
          </>
        ),
        zh: (
          <>
            传统上 HTTP 状态码仍然是 200,失败信息在响应体的{" "}
            <code>errors</code> 数组里。这正是 <code>res.ok</code>{" "}
            判断不了 GraphQL 成败的原因。
          </>
        ),
      },
      {
        en: (
          <>
            A server never invents data. Returning a fake <code>User</code>{" "}
            would be far more dangerous than reporting the error. The
            specification chooses to set null, move it up, and record the error.
          </>
        ),
        zh: (
          <>
            服务器绝不会凭空造数据。造一个假的 <code>User</code>{" "}
            比报告错误危险得多。规范的选择是:置为 null、向上移动、记录错误。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A <code>!</code> is a promise that the position will never hold{" "}
          <code>null</code>. When the promise cannot be kept, the{" "}
          <code>null</code> is passed to the parent field. If the parent is also
          non-null, it keeps moving up until it reaches a field that allows null
          — or until <code>data</code> itself becomes null.
        </>
      ),
      zh: (
        <>
          <code>!</code> 是一条承诺:这个位置绝不会是 <code>null</code>。
          承诺兑现不了时,<code>null</code> 被交给父字段。
          父字段如果也是非空,就继续往上,
          直到遇见一个允许为空的字段 —— 或者直到 <code>data</code> 本身变成 null。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          To fetch the next page with Relay-style connections, which two{" "}
          <code>pageInfo</code> fields do you need? (Select all that apply)
        </>
      ),
      zh: (
        <>
          用 Relay 风格的 connections 取下一页,需要 <code>pageInfo</code>{" "}
          里的哪两个字段?(多选)
        </>
      ),
    },
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
    missHint: {
      en: (
        <>
          One is missing. Paging forward asks two questions: &quot;is there
          more?&quot; and &quot;where does the next page start?&quot; One field
          answers each.
        </>
      ),
      zh: (
        <>
          少了一个。往后翻要回答两个问题:「后面还有吗?」和
          「下一页从哪里开始?」,一个字段答一个。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One too many. <code>startCursor</code> is for paging{" "}
          <b>backwards</b> (<code>last</code> / <code>before</code>), and{" "}
          <code>totalCount</code> is an optional count that some schemas add to
          the connection. Neither is needed to move forward.
        </>
      ),
      zh: (
        <>
          多选了一个。<code>startCursor</code> 是往<b>回</b>翻时用的
          (<code>last</code> / <code>before</code>),<code>totalCount</code>{" "}
          是部分 schema 在 connection 上额外加的统计字段。
          往后翻这两个都不需要。
        </>
      ),
    },
    why: {
      en: (
        <>
          The loop has two steps: continue while <code>hasNextPage</code> is
          true, and put <code>endCursor</code> unchanged into the{" "}
          <code>after</code> argument of the next request. One field decides
          whether to continue, the other decides where to start.
        </>
      ),
      zh: (
        <>
          循环只有两步:<code>hasNextPage</code> 为 true 就继续,
          并把 <code>endCursor</code> 原样填进下一次请求的 <code>after</code>{" "}
          参数。一个决定还翻不翻,一个决定从哪里开始。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A subscription lets the server send events to the client at any time.
          What is normally used underneath to make that possible?
        </>
      ),
      zh: (
        <>
          subscription 让服务器可以在任意时刻把事件发给客户端。
          底层通常靠什么来实现?
        </>
      ),
    },
    opts: [
      {
        en: <>The client sends an HTTP GET every second to ask for updates</>,
        zh: <>客户端每秒发一次 HTTP GET 去问有没有新的</>,
      },
      {
        en: (
          <>
            A connection that stays open, usually a WebSocket, or an SSE event
            stream
          </>
        ),
        zh: <>一条保持打开的连接,通常是 WebSocket,或者 SSE 事件流</>,
      },
      { en: <>FTP file transfer</>, zh: <>FTP 文件传输</> },
      {
        en: <>The server sends UDP packets directly to the client IP</>,
        zh: <>服务器直接往客户端 IP 发 UDP 包</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is polling, which is what a subscription replaces. Polling asks
            even when there is nothing, and still arrives late when there is.
          </>
        ),
        zh: (
          <>
            那是轮询,正是 subscription 要替代的做法:
            没消息时白问一遍,有消息时还是晚一步。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            FTP is an old file transfer protocol. It has no concept of a server
            pushing events, and it is not used for this.
          </>
        ),
        zh: (
          <>
            FTP 是老的文件传输协议,根本没有「服务器推送事件」的概念,
            也不用于这种场景。
          </>
        ),
      },
      {
        en: (
          <>
            JavaScript in a browser cannot send raw UDP. UDP also does not
            guarantee delivery, which is not acceptable for a chat message.
          </>
        ),
        zh: (
          <>
            浏览器里的 JavaScript 发不了裸 UDP。
            UDP 也不保证送达,聊天消息丢一条是不能接受的。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          One request-and-response exchange is finished as soon as the response
          arrives, so it cannot deliver an event that happens later. A WebSocket
          keeps a two-way connection open. SSE keeps one HTTP response open and
          the server writes events into it, in one direction. Either way, the
          connection is still there when the event happens.
        </>
      ),
      zh: (
        <>
          一次请求 - 响应的往返在响应到达时就结束了,
          所以送不了之后才发生的事件。WebSocket 保持一条双向连接;
          SSE 让一个 HTTP 响应一直不结束,服务器单向往里写事件。
          两种做法的共同点是:事件发生时,那条连接还在。
        </>
      ),
    },
  },
];
