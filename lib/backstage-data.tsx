"use client";

// 第 10 章 · GraphQL 后台与性能 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语,英文默认)。
// 代码块只有注释需要双语,可执行行必须逐字节一致。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T } from "@/lib/i18n";

export const LABS: Lab[] = [
  {
    id: "count-resolvers",
    title: {
      en: "Count the resolvers: how many calls does this query make?",
      zh: "数 resolver:这条 query 触发几次调用?",
    },
    d: "easy",
    tags: {
      en: ["resolver", "execution"],
      zh: ["resolver", "执行模型"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                Pen and paper. The query below reaches the server, and this post
                has <b>2 comments</b>. How many resolver calls happen in total?
                Count the default resolvers as well — they are functions too,
                and they run.
              </>
            }
            zh={
              <>
                纸笔任务。下面这条 query 打到服务器上,假设这篇文章有{" "}
                <b>2 条评论</b>。总共会触发多少次 resolver 调用?
                默认 resolver 也要算 —— 它也是函数,也要跑。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="graphql"
          title="query"
          code={`{
  post(id: "1") {
    title
    author { name }
    comments {
      body
    }
  }
}`}
        />
      </>
    ),
    hint: {
      en: (
        <>
          Count level by level from the <code>Query</code> root. A list field
          multiplies: <code>comments</code> returns 2 items, so every field
          inside it runs twice.
        </>
      ),
      zh: (
        <>
          从 <code>Query</code> 根一层层往下数。列表字段要做乘法:
          <code>comments</code> 返回 2 条,里面的每个字段就各跑 2 次。
        </>
      ),
    },
    solution: (
      <>
        <p>
          <T
            en={
              <>
                The answer is <b>7</b>. Level by level:
              </>
            }
            zh={
              <>
                答案是 <b>7 次</b>。逐层拆:
              </>
            }
          />
        </p>
        <CodeBlock
          lang="bash"
          title={{ en: "Level by level", zh: "逐层拆解" }}
          code={{
            en: `Query.post          1 call    # root field
Post.title          1 call    # default resolver, reads parent.title
Post.author         1 call
User.name           1 call    # default resolver
Post.comments       1 call    # returns an array of 2
Comment.body        2 calls   # once for each comment in the array
--------------------------------------------------------------
Total               7 calls`,
            zh: `Query.post          1 次   # 根字段
Post.title          1 次   # 默认 resolver,取 parent.title
Post.author         1 次
User.name           1 次   # 默认 resolver
Post.comments       1 次   # 返回一个 2 条的数组
Comment.body        2 次   # 数组里每条评论各 1 次
------------------------------------------
合计                7 次`,
          }}
        />
        <p>
          <T
            en={
              <>
                Notice the multiplication. With 200 comments,{" "}
                <code>body</code> alone is 200 calls, and adding{" "}
                <code>author {"{ name }"}</code> inside a comment adds 200 × 2
                more. That is the setup for the next task.
              </>
            }
            zh={
              <>
                注意这里的乘法:如果有 200 条评论,光 <code>body</code>{" "}
                就是 200 次调用;评论里再嵌一层{" "}
                <code>author {"{ name }"}</code>,又多 200 × 2 次。
                这正是下一个任务的引子。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "write-batch",
    title: {
      en: "Write a DataLoader batch function yourself",
      zh: "亲手写一个 DataLoader 的 batch 函数",
    },
    d: "medium",
    tags: {
      en: ["DataLoader", "batching"],
      zh: ["DataLoader", "批处理"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                No database needed — the browser console is enough. Given a fake
                user table, implement <code>batchUsers(ids)</code>: it takes a
                list of ids and returns an array of users{" "}
                <b>in the same order</b>. That is the rule DataLoader depends
                on: result <i>i</i> must belong to id <i>i</i>, and a missing
                user is <code>null</code>.
              </>
            }
            zh={
              <>
                不用真数据库,浏览器 Console 就够了。给你一张假的「用户表」,
                请实现 <code>batchUsers(ids)</code>:传入一批 id,
                返回<b>与 ids 同序</b>的用户数组。
                这是 DataLoader 依赖的规则:第 i 个结果必须对应第 i 个 id,
                查不到的位置放 <code>null</code>。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="js"
          title={{
            en: "console · starting code",
            zh: "console · 起手代码",
          }}
          code={{
            en: `const DB = {
  7:  { id: 7,  name: "Grace" },
  9:  { id: 9,  name: "Ada" },
  12: { id: 12, name: "Linus" },
};

// A fake batch query: returns rows out of order, and skips missing ids
async function whereIdIn(ids) {
  return [...new Set(ids)]
    .filter((id) => DB[id])
    .reverse()
    .map((id) => DB[id]);
}

async function batchUsers(ids) {
  // Your turn: return an array in the same order as ids, null when missing
}

// Expected output: [Ada, Linus, null, Ada]
batchUsers([9, 12, 99, 9]).then(console.log);`,
            zh: `const DB = {
  7:  { id: 7,  name: "Grace" },
  9:  { id: 9,  name: "Ada" },
  12: { id: 12, name: "Linus" },
};

// 模拟一次批量查询:返回顺序是乱的,查不到的 id 会被跳过
async function whereIdIn(ids) {
  return [...new Set(ids)]
    .filter((id) => DB[id])
    .reverse()
    .map((id) => DB[id]);
}

async function batchUsers(ids) {
  // 你来实现:返回与 ids 同序的数组,查不到的放 null
}

// 期望输出:[Ada, Linus, null, Ada]
batchUsers([9, 12, 99, 9]).then(console.log);`,
          }}
        />
      </>
    ),
    hint: {
      en: (
        <>
          The database does not promise an order — the code above reverses it on
          purpose. Build a <code>Map</code> from the rows you got back, then
          read it once for each entry of <code>ids</code>.
        </>
      ),
      zh: (
        <>
          数据库不保证返回顺序(上面故意 reverse 了)。
          先把查回来的行建成一张 <code>Map</code>,
          再照着 <code>ids</code> 的顺序逐个取。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="js"
          title={{ en: "One way to write it", zh: "参考实现" }}
          code={`async function batchUsers(ids) {
  const rows = await whereIdIn(ids);
  const byId = new Map(rows.map((u) => [u.id, u]));
  return ids.map((id) => byId.get(id) ?? null);
}`}
        />
        <p>
          <T
            en={
              <>
                Two steps: <b>index the rows, then read them back in order</b>.
                In a real project you pass this function to{" "}
                <code>new DataLoader(batchUsers)</code>. The rule &quot;same
                order, same length&quot; matters because DataLoader splits the
                batch result and returns one row to each resolver that called{" "}
                <code>load(id)</code>. If the order slips, post 9 gets the
                author of post 12.
              </>
            }
            zh={
              <>
                两步:<b>建索引,按序取</b>。真实项目里把它交给{" "}
                <code>new DataLoader(batchUsers)</code> 就能用。
                「同序、等长」这条规则之所以重要,是因为 DataLoader
                要把批量结果拆开,一一还给当初调用 <code>load(id)</code>{" "}
                的那些 resolver —— 顺序错位,9 号的文章就挂上 12 号的作者了。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "cost-budget",
    title: {
      en: "Design a complexity budget",
      zh: "设计一个复杂度预算",
    },
    d: "hard",
    tags: {
      en: ["security", "complexity"],
      zh: ["安全", "复杂度分析"],
    },
    task: (
      <>
        <p>
          <T
            en={
              <>
                You are the gatekeeper of the blog API. Prices:{" "}
                <b>a scalar costs 1, an object costs 2, and a list costs its{" "}
                <code>first</code> argument multiplied by the total of its
                selection set</b>. The budget is 500, and anything above it is
                rejected. Score both queries and decide which one passes.
              </>
            }
            zh={
              <>
                你是这套博客 API 的守门人。定价规则:
                <b>标量 1 分,对象 2 分,列表 = <code>first</code>{" "}
                参数 × 它子选择集的总分</b>。预算上限 500 分,超了就拒绝。
                请给下面两条 query 算总分,判断谁能过、谁被拒:
              </>
            }
          />
        </p>
        <CodeBlock
          lang="graphql"
          title="Query A"
          code={`{
  post(id: "1") {
    title
    author { name }
  }
}`}
        />
        <CodeBlock
          lang="graphql"
          title="Query B"
          code={`{
  posts(first: 20) {
    title
    comments(first: 10) {
      body
      author { name }
    }
  }
}`}
        />
      </>
    ),
    hint: {
      en: (
        <>
          Work from the inside out. Score the selection set of{" "}
          <code>comments</code> first and multiply it by 10. Then put that
          number inside each post and multiply by 20.
        </>
      ),
      zh: (
        <>
          从最里层往外算:先算 <code>comments</code> 子选择集的分数,乘以 10;
          再把结果算进每篇 post,乘以 20。
        </>
      ),
    },
    solution: (
      <>
        <CodeBlock
          lang="bash"
          title={{ en: "Working out the score", zh: "算分过程" }}
          code={{
            en: `Query A:
  post 2 + title 1 + author 2 + name 1                  = 6    ✓ allowed

Query B (from the inside out):
  selection set of comments: body 1 + author 2 + name 1 = 4
  comments = 10 × 4                                     = 40
  selection set of each post: title 1 + 40              = 41
  posts = 20 × 41                                       = 820  ✕ rejected (> 500)`,
            zh: `Query A:
  post 2 + title 1 + author 2 + name 1            = 6 分   ✓ 放行

Query B(从里往外):
  comments 的子选择集: body 1 + author 2 + name 1 = 4 分
  comments = 10 × 4                               = 40 分
  每篇 post 的子选择集: title 1 + 40               = 41 分
  posts = 20 × 41                                 = 820 分  ✕ 拒绝(> 500)`,
          }}
        />
        <p>
          <T
            en={
              <>
                The two queries are about the same length, and one costs more
                than a hundred times the other. That is why counting requests is
                not enough in GraphQL: the limit has to follow the <b>cost</b>.
                The GitHub GraphQL API works this way — it scores a query first,
                then subtracts that score from your point budget.
              </>
            }
            zh={
              <>
                两条 query 文本长度差不多,代价差了一百多倍。
                这就是为什么在 GraphQL 里「按请求次数限流」不够用:
                限制必须跟着<b>代价</b>走。GitHub GraphQL API
                就是这么做的:先给查询估分,再从你的点数余额里扣。
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
      en: <>What are the four arguments of a resolver, in order?</>,
      zh: <>resolver 函数的四个参数,按顺序是哪一组?</>,
    },
    opts: [
      <>(req, res, next, err)</>,
      <>(parent, args, context, info)</>,
      <>(query, mutation, subscription, schema)</>,
      <>(id, name, email, posts)</>,
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is the signature of an Express middleware function. A GraphQL
            resolver does not handle a route; it produces one field.
          </>
        ),
        zh: (
          <>
            那是 Express 中间件的签名。GraphQL 的 resolver 不处理路由,
            它产生的是一个字段的值。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Those are operation types and type-system terms, not function
            arguments.
          </>
        ),
        zh: <>这四个是操作类型和类型系统的概念,不是函数参数。</>,
      },
      {
        en: (
          <>
            Those are field names in the blog data. A field&apos;s value is what
            a resolver returns, not what it receives.
          </>
        ),
        zh: (
          <>
            那是博客数据里的字段名。字段的值是 resolver 返回的,不是它收到的。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>parent</code> is the value the parent field returned,{" "}
          <code>args</code> are the arguments this field received,{" "}
          <code>context</code> is the object shared by the whole request, and{" "}
          <code>info</code> is metadata about the current execution. The first
          three appear in everyday code.
        </>
      ),
      zh: (
        <>
          <code>parent</code> 是父字段的返回值,<code>args</code>{" "}
          是这个字段收到的参数,<code>context</code> 是整个请求共享的那个对象,
          <code>info</code> 是执行现场的元信息。前三个天天会用到。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          While executing{" "}
          <code>{`{ post(id:"1") { author { name } } }`}</code>, what does the{" "}
          <code>Post.author</code> resolver receive as <code>parent</code>?
        </>
      ),
      zh: (
        <>
          执行 <code>{`{ post(id:"1") { author { name } } }`}</code> 时,
          <code>Post.author</code> 这个 resolver 收到的 <code>parent</code>{" "}
          是什么?
        </>
      ),
    },
    opts: [
      { en: <>The whole schema object</>, zh: <>整个 schema 对象</> },
      {
        en: (
          <>
            The post object <code>Query.post</code> just returned
          </>
        ),
        zh: (
          <>
            <code>Query.post</code> 刚刚返回的那个 post 对象
          </>
        ),
      },
      {
        en: <>The variables sent by the client</>,
        zh: <>客户端传来的 variables</>,
      },
      {
        en: <>Always null; parent is only a placeholder</>,
        zh: <>永远是 null,parent 只是占位</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The schema is the type-system definition. It is not passed between
            resolvers; it is reachable through the <code>info</code> argument.
          </>
        ),
        zh: (
          <>
            schema 是类型系统的定义,不会在 resolver 之间传来传去 ——
            要拿它得从 <code>info</code> 参数里取。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Variable values arrive in <b>args</b>, for example{" "}
            <code>args.id</code>. <code>parent</code> comes from the level above
            in the field tree and has nothing to do with the client.
          </>
        ),
        zh: (
          <>
            变量的值出现在 <b>args</b> 里(比如 <code>args.id</code>)。
            <code>parent</code> 来自字段树的上一层,和客户端无关。
          </>
        ),
      },
      {
        en: (
          <>
            Only a <b>root field</b> has an empty <code>parent</code>. Below
            that, every <code>parent</code> is the return value of the resolver
            one level up.
          </>
        ),
        zh: (
          <>
            只有<b>根字段</b>的 <code>parent</code> 是空的。
            再往下每一层,<code>parent</code> 都是上一层 resolver 的返回值。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Execution walks down the field tree. The parent field runs first, and
          its return value is passed to the child fields unchanged.{" "}
          <code>Post.author</code> reads <code>parent.authorId</code> and
          exchanges it for a user.
        </>
      ),
      zh: (
        <>
          执行过程是沿字段树往下走:父字段先跑,
          它的返回值原样传给子字段。<code>Post.author</code> 就是拿{" "}
          <code>parent.authorId</code> 去换一个用户的。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          The schema declares <code>title: String!</code>, but the resolvers
          object has no <code>Post.title</code>. What happens at execution time?
        </>
      ),
      zh: (
        <>
          schema 里写着 <code>title: String!</code>,但 resolvers
          对象里根本没有 <code>Post.title</code>。执行时会发生什么?
        </>
      ),
    },
    opts: [
      {
        en: <>An error: &quot;no resolver for field&quot;</>,
        zh: <>报错:「字段缺少 resolver」</>,
      },
      {
        en: (
          <>
            <code>title</code> is always null
          </>
        ),
        zh: (
          <>
            <code>title</code> 永远返回 null
          </>
        ),
      },
      {
        en: (
          <>
            The default resolver runs and reads <code>parent.title</code>
          </>
        ),
        zh: (
          <>
            走默认 resolver:直接取 <code>parent.title</code>
          </>
        ),
      },
      {
        en: <>You have to add a @default directive in the schema</>,
        zh: <>需要在 schema 里加 @default 指令才行</>,
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            No error. Writing a &quot;read this property&quot; function for
            every scalar field would be a large amount of pointless code.
          </>
        ),
        zh: (
          <>
            不报错。要是每个标量字段都得手写一个「取属性」的函数,
            那会是一大堆没有意义的代码。
          </>
        ),
      },
      {
        en: (
          <>
            As long as <code>parent</code> really has a <code>title</code>{" "}
            property, the value is found. Null happens only when the property is
            missing.
          </>
        ),
        zh: (
          <>
            只要 <code>parent</code> 上真有 <code>title</code> 属性,
            就能取到值。返回 null 的前提是属性不存在。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            There is no such directive. The default behaviour is built in and
            needs no configuration.
          </>
        ),
        zh: <>没有这个指令。默认行为是内置的,不需要任何配置。</>,
      },
    ],
    why: {
      en: (
        <>
          A field with no resolver uses the <b>default resolver</b>: read the
          property of the same name from <code>parent</code>. You write a
          resolver yourself only when the field name does not match the data, or
          when the value has to be computed or fetched — for example{" "}
          <code>author</code>, which exchanges <code>authorId</code> for a user.
        </>
      ),
      zh: (
        <>
          没写 resolver 的字段走<b>默认 resolver</b>:取 <code>parent</code>{" "}
          上的同名属性。只有「字段名和数据属性对不上」或
          「值需要计算、需要查库」时才自己写 —— 比如 <code>author</code>{" "}
          要拿 <code>authorId</code> 去换一个用户。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          The query is{" "}
          <code>{`{ posts { title author { name } comments { body } } }`}</code>
          , and <code>posts</code> returns 3 posts. The resolvers for{" "}
          <code>author</code> and <code>comments</code> each query the database
          on their own. How many database queries in the worst case?
        </>
      ),
      zh: (
        <>
          query 是{" "}
          <code>{`{ posts { title author { name } comments { body } } }`}</code>
          ,<code>posts</code> 返回 3 篇文章;<code>author</code> 和{" "}
          <code>comments</code> 的 resolver 各自单独查一次数据库。
          最坏情况下总共几次数据库查询?
        </>
      ),
    },
    opts: [
      { en: <>3</>, zh: <>3 次</> },
      { en: <>4</>, zh: <>4 次</> },
      { en: <>7</>, zh: <>7 次</> },
      { en: <>9</>, zh: <>9 次</> },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            Too few. <code>posts</code> is 1 query, and then <b>each</b> post
            costs 1 for <code>author</code> and 1 for <code>comments</code>. A
            list field multiplies.
          </>
        ),
        zh: (
          <>
            少算了。<code>posts</code> 本身 1 次,然后<b>每篇</b>文章的{" "}
            <code>author</code> 各 1 次、<code>comments</code> 各 1 次 ——
            列表字段是乘法。
          </>
        ),
      },
      {
        en: (
          <>
            4 is the total when only <code>author</code> is nested (1 + 3). This
            query also asks for <code>comments</code> on every post, which adds
            3 more.
          </>
        ),
        zh: (
          <>
            4 次是只嵌套 <code>author</code> 时的账(1 + 3)。
            这条 query 里 <code>comments</code> 也在每篇文章上各查一次,
            还得加 3。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Too many. The <code>comments</code> resolver fetches all comments of
            one post in a single query, and <code>body</code> uses the default
            resolver, which does not touch the database.
          </>
        ),
        zh: (
          <>
            多算了。<code>comments</code> 的 resolver
            一次就把这篇文章的所有评论查回来,而 <code>body</code>{" "}
            走默认 resolver,根本不碰数据库。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          1 for <code>posts</code>, 3 for <code>author</code>, 3 for{" "}
          <code>comments</code> = <b>7</b>, which is 1 + 2N. With 100 posts it
          is 201. And the client can trigger it by adding one nested field,
          without any change on the server.
        </>
      ),
      zh: (
        <>
          <code>posts</code> 1 次 + <code>author</code> 3 次 +{" "}
          <code>comments</code> 3 次 = <b>7 次</b>,也就是 1 + 2N。
          文章涨到 100 篇就是 201 次。而客户端只要多加一个嵌套字段就能触发,
          服务器一行代码都不用改。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: <>Which two mechanisms does DataLoader use against N+1? (select two)</>,
      zh: <>DataLoader 靠哪两个机制解决 N+1?(多选)</>,
    },
    opts: [
      {
        en: (
          <>
            Batching: the <code>load(id)</code> calls made in one tick of the
            event loop become one query
          </>
        ),
        zh: (
          <>
            批处理:同一个 tick 内的多次 <code>load(id)</code>{" "}
            合并成一次查询
          </>
        ),
      },
      {
        en: (
          <>Per-request cache: a repeated id inside one request is fetched once</>
        ),
        zh: <>每请求缓存:同一个请求里重复的 id,只取一次</>,
      },
      {
        en: <>It adds indexes to the database automatically</>,
        zh: <>自动给数据库加索引</>,
      },
      {
        en: <>It replaces the SQL database with a NoSQL one</>,
        zh: <>把 SQL 数据库换成 NoSQL</>,
      },
    ],
    correct: [0, 1],
    missHint: {
      en: (
        <>
          One is still missing. Think about the sequence{" "}
          <code>load(9), load(12), load(9)</code>: besides being merged, what
          else happens to the repeated 9?
        </>
      ),
      zh: (
        <>
          还漏了一个。想想 <code>load(9)、load(12)、load(9)</code>{" "}
          这串调用:除了被合并,那个重复的 9 号还得到了什么待遇?
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One selection too many. DataLoader is a small scheduling library. It
          does not change your database, and it does not create indexes.
        </>
      ),
      zh: (
        <>
          多选了。DataLoader 只是一个很小的调度库,
          它不改变你的数据库选型,也不会替你建索引。
        </>
      ),
    },
    why: {
      en: (
        <>
          <b>Batching</b> turns many separate queries into one.{" "}
          <b>The per-request cache</b> means a repeated id is not even part of
          the batch — <code>load(9), load(12), load(9)</code> sends a single{" "}
          <code>WHERE id IN (9, 12)</code>. The cache lives for one request and
          is discarded with it, so data cannot leak between users.
        </>
      ),
      zh: (
        <>
          <b>批处理</b>把很多次单独查询变成一次。
          <b>每请求缓存</b>让重复的 id 连批量查询都不用进 ——
          <code>load(9)、load(12)、load(9)</code> 最终只发一条{" "}
          <code>WHERE id IN (9, 12)</code>。
          这个缓存只活一个请求,请求结束就丢掉,不会在用户之间串数据。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          In chapter 05, REST responses could be cached with{" "}
          <code>ETag</code> and <code>Cache-Control</code>. Why does GraphQL
          usually miss out on that?
        </>
      ),
      zh: (
        <>
          第 05 章里,REST 的响应可以靠 <code>ETag</code> 和{" "}
          <code>Cache-Control</code> 被缓存。GraphQL 为什么通常吃不到?
        </>
      ),
    },
    opts: [
      {
        en: <>Browsers do not understand the GraphQL response format</>,
        zh: <>GraphQL 的响应格式浏览器不认识</>,
      },
      {
        en: (
          <>
            Traditionally one endpoint, POST, and a different body every time —
            so the URL can no longer serve as the cache key
          </>
        ),
        zh: (
          <>
            传统做法是单端点 + POST + 每次都不一样的请求体 ——
            URL 没法再当缓存键
          </>
        ),
      },
      {
        en: <>GraphQL does not run on HTTP, so HTTP caching does not apply</>,
        zh: <>GraphQL 走的不是 HTTP,缓存机制天然不适用</>,
      },
      {
        en: <>GraphQL responses are too large to store in a cache</>,
        zh: <>GraphQL 响应太大,缓存放不下</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The response is ordinary JSON and browsers read it fine. The problem
            is on the <b>request</b> side: what would the cache use as a key?
          </>
        ),
        zh: (
          <>
            响应就是普通 JSON,浏览器读得懂。问题出在<b>请求</b>那一侧:
            缓存拿什么当键?
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            GraphQL almost always runs over HTTP. That is exactly why losing
            HTTP caching is worth talking about.
          </>
        ),
        zh: (
          <>
            GraphQL 绝大多数时候就跑在 HTTP 上。
            正因为如此,「在 HTTP 上却用不上 HTTP 缓存」才值得一讲。
          </>
        ),
      },
      {
        en: (
          <>
            Size is not the issue; a CDN stores much larger files every day. The
            issue is that POST with a changing body gives the cache no way to
            recognise the same request.
          </>
        ),
        zh: (
          <>
            大小不是问题,CDN 每天都在存大得多的文件。
            问题是 POST 加上不断变化的请求体,让缓存认不出「这是同一个请求」。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          HTTP caching is built on &quot;GET plus a URL is the cache key&quot;.
          The traditional GraphQL setup sends every query as a POST to the same{" "}
          <code>/graphql</code> URL, with the query text in the body. A browser,
          a CDN, or a proxy cannot tell two different queries apart, so it
          cannot cache either of them.
        </>
      ),
      zh: (
        <>
          HTTP 缓存建立在「GET + URL 就是缓存键」之上。
          GraphQL 的传统做法是所有查询都 POST 到同一个 <code>/graphql</code>,
          查询文本放在请求体里 —— 浏览器、CDN、代理分不清两条不同的查询,
          自然也没法缓存。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>What do persisted queries actually give you?</>,
      zh: <>persisted queries(持久化查询)带来的核心好处是哪组?</>,
    },
    opts: [
      {
        en: (
          <>Faster execution, because the server compiled the query to machine code</>
        ),
        zh: <>让查询执行得更快,因为服务器提前编译成了机器码</>,
      },
      {
        en: (
          <>
            The query text is replaced by a SHA-256 hash: smaller requests, GET
            instead of POST so a CDN can cache them, and an allowlist if the
            server accepts registered hashes only
          </>
        ),
        zh: (
          <>
            查询文本换成 SHA-256 哈希:请求更小、能改用 GET 吃 CDN 缓存、
            只接受注册过的哈希时还是一张白名单
          </>
        ),
      },
      {
        en: <>The client stops writing queries; the server guesses what it needs</>,
        zh: <>让客户端不用再写查询,服务器自动猜你要什么</>,
      },
      {
        en: (
          <>Query results are stored permanently, so the query never runs again</>
        ),
        zh: <>把查询结果永久存进数据库,再也不用重新执行</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            There is no machine code. The server may cache the parsed document,
            but every resolver still runs. The gain is in transport and caching,
            not in execution.
          </>
        ),
        zh: (
          <>
            没有什么机器码。服务器顶多缓存一下解析结果,
            该跑的 resolver 一个都不少。收益在传输和缓存,不在执行。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            You still write the query. It is <b>registered</b> with the server,
            and daily requests refer to it by hash. Nothing is guessed.
          </>
        ),
        zh: (
          <>
            查询还是你写的,只是<b>注册</b>到了服务器,
            日常请求用哈希指代它。没有任何「猜」的成分。
          </>
        ),
      },
      {
        en: (
          <>
            What is persisted is the <b>query text</b>, not the result. The data
            is still read fresh on every request.
          </>
        ),
        zh: (
          <>
            persisted 的是<b>查询文本</b>,不是查询结果。
            数据每次照常现取,新鲜度不受影响。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Sending a hash instead of the text has three effects: the request body
          shrinks from kilobytes to a few dozen bytes; the hash and the
          variables fit in a URL, so the request can use GET and a CDN can cache
          it; and if the server accepts only registered hashes, an unknown query
          is rejected before execution.
        </>
      ),
      zh: (
        <>
          用哈希代替文本有三个效果:请求体从几 KB 缩到几十字节;
          哈希加变量能放进 URL,于是可以用 GET,CDN 也能缓存;
          如果服务器只接受注册过的哈希,没见过的查询在执行前就被拒绝。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>What does a query depth limit protect against?</>,
      zh: <>查询深度限制(depth limit)防的是哪种攻击?</>,
    },
    opts: [
      { en: <>SQL injection</>, zh: <>SQL 注入</> },
      {
        en: (
          <>
            A deeply nested query built from a cycle in the schema (post →
            author → post → …), which multiplies the amount of work the server
            has to do
          </>
        ),
        zh: (
          <>
            利用 schema 里的循环(文章 → 作者 → 文章 → …)构造的深层嵌套查询,
            让服务器要做的工作成倍增长
          </>
        ),
      },
      { en: <>Brute-force password guessing</>, zh: <>暴力破解用户密码</> },
      {
        en: <>Response JSON that is nested too deeply for the client to parse</>,
        zh: <>防止响应 JSON 嵌套太深,前端解析不了</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            SQL injection is prevented in the code that talks to the database,
            by sending values as parameters instead of building SQL by joining
            strings. A depth limit addresses a different problem: the query is
            valid, but executing it costs too much.
          </>
        ),
        zh: (
          <>
            SQL 注入是在访问数据库的代码里防住的:把值作为参数传给数据库,
            而不是用字符串拼出 SQL。深度限制管的是另一个问题:
            查询本身合法,但执行代价太大。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Password guessing targets the login endpoint and is handled by rate
            limiting and account lockout. A depth limit constrains the{" "}
            <b>shape</b> of a query.
          </>
        ),
        zh: (
          <>
            破解密码打的是登录接口,由限流和账号锁定来管。
            深度限制约束的是查询的<b>形状</b>。
          </>
        ),
      },
      {
        en: (
          <>
            <code>JSON.parse</code> handles deep nesting without trouble. The
            server is what suffers: each extra level multiplies the number of
            resolver calls.
          </>
        ),
        zh: (
          <>
            <code>JSON.parse</code> 不在乎嵌套深浅。受影响的是服务器:
            每多一层,resolver 的调用次数就再乘一次。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          In the schema <code>Post.author</code> points at <code>User</code> and{" "}
          <code>User.posts</code> points back at <code>Post</code>. That cycle
          is normal design, and it also gives an attacker material: a query of a
          few hundred bytes can keep a server busy for seconds. A depth limit
          caps the nesting, and it works together with cost scoring and a
          timeout.
        </>
      ),
      zh: (
        <>
          schema 里 <code>Post.author</code> 指向 <code>User</code>,
          <code>User.posts</code> 又指回 <code>Post</code>。
          这种循环是正常设计,同时也给了攻击者素材:
          几百字节的查询就可能让服务器忙上几秒。
          深度限制给嵌套层数封顶,再配合成本打分和超时,门才算守住。
        </>
      ),
    },
  },
];
