"use client";

// 第 10 章 · GraphQL 后台与性能(双语,英文默认):
// resolver 执行模型(树遍历 + parent 接力)→ context 每请求一份 →
// N+1 问题(SQL 计数器)→ DataLoader(批处理 + 每请求缓存)→ 缓存三条出路 →
// 安全与滥用防护 → 动手任务 → 测验 → 要点。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeBlock } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/backstage-data";
import { T } from "@/lib/i18n";
import {
  HeroBackstage,
  ResolverTreeViz,
  SqlCounter,
  NormalizeViz,
} from "./viz";

export default function BackstagePage() {
  return (
    <main className="page" data-ch="backstage">
      <Hero
        ch="backstage"
        title={{
          en: (
            <>
              GraphQL <span className="grad">servers and performance</span>
            </>
          ),
          zh: (
            <>
              GraphQL <span className="grad">后台与性能</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              In the last three chapters you were the client writing queries.
              This chapter is about the server that answers them: which
              functions run, in what order, and why a small query can turn into
              a hundred database queries.
            </>
          ),
          zh: (
            <>
              前三章你一直是写查询的客户端。这一章换到服务器这一侧:
              一条 query 递进来之后,哪些函数会跑、按什么顺序跑,
              以及一条很小的查询为什么可能变成上百次数据库查询。
            </>
          ),
        }}
        chips={[
          { id: "resolver", n: "01", label: { en: "Resolvers", zh: "resolver" } },
          { id: "context", n: "02", label: "context" },
          {
            id: "nplus1",
            n: "03",
            label: { en: "The N+1 problem", zh: "N+1 问题" },
          },
          { id: "dataloader", n: "04", label: "DataLoader" },
          { id: "caching", n: "05", label: { en: "Caching", zh: "缓存" } },
          { id: "security", n: "06", label: { en: "Security", zh: "安全" } },
          { id: "labs", n: "07", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroBackstage />
      </Hero>

      {/* ================= §01 resolver ================= */}
      <Section
        id="resolver"
        index="01"
        title={{
          en: "Resolvers: one function behind every field",
          zh: "resolver:每个字段背后都有一个函数",
        }}
        desc={{
          en: "A GraphQL server is an execution engine plus a table that maps each field to a function.",
          zh: "GraphQL 服务器可以拆成两部分:一个执行引擎,和一张「字段 → 函数」的映射表。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                In REST, one URL is handled by one function. GraphQL works at a
                much smaller unit: <b>every field in the schema is produced by
                a function</b>, called a <b>resolver</b>. A resolver always
                receives the same four arguments:{" "}
                <code>(parent, args, context, info)</code> — the value the
                parent field returned, the arguments this field received, one
                object shared by the whole request (§02), and metadata about
                the current execution (rarely used). Running a query is a{" "}
                <b>walk down the field tree</b> that starts at the{" "}
                <code>Query</code> root type. A parent field runs first, and its
                return value is passed to its child fields as{" "}
                <code>parent</code>.
              </>
            }
            zh={
              <>
                REST 里,一个 URL 对应一个处理函数。GraphQL 的粒度小得多:
                <b>schema 里的每个字段,都由一个函数产生</b>,
                这个函数叫解析器(resolver)。resolver 固定收到四个参数:
                <code>(parent, args, context, info)</code> ——
                父字段的返回值、本字段收到的参数、整个请求共享的一个对象(§02)、
                以及执行现场的元信息(很少用)。执行一条 query,
                就是从 <code>Query</code> 根类型开始<b>沿字段树往下走</b>:
                父字段先跑,它的返回值作为 <code>parent</code> 传给子字段。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="graphql"
          title={{
            en: "schema.graphql · the blog contract from chapter 08",
            zh: "schema.graphql · 第 08 章写好的博客契约",
          }}
          code={`type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  comments: [Comment!]!
}

type Comment {
  id: ID!
  body: String!
  author: User!
}

type Query {
  post(id: ID!): Post
  posts: [Post!]!
}`}
        />
        <CodeBlock
          lang="js"
          title={{
            en: "resolvers.js · Apollo Server style",
            zh: "resolvers.js · Apollo Server 风格",
          }}
          hl={[3, 4, 8, 9]}
          code={{
            en: `const resolvers = {
  Query: {
    post: (parent, args, context) => context.db.findPost(args.id),
    posts: (parent, args, context) => context.db.allPosts(),
  },
  Post: {
    // parent is the post object the level above just returned
    author: (post, args, context) => context.db.findUser(post.authorId),
    comments: (post, args, context) => context.db.commentsOf(post.id),
  },
  // Post.title, Post.body and User.name are missing on purpose.
  // A field with no resolver uses the default resolver:
  // it reads the property of the same name from parent.
};

const server = new ApolloServer({ typeDefs, resolvers });`,
            zh: `const resolvers = {
  Query: {
    post: (parent, args, context) => context.db.findPost(args.id),
    posts: (parent, args, context) => context.db.allPosts(),
  },
  Post: {
    // parent 就是上一层刚刚返回的那个 post 对象
    author: (post, args, context) => context.db.findUser(post.authorId),
    comments: (post, args, context) => context.db.commentsOf(post.id),
  },
  // Post.title、Post.body、User.name 一个都没写,这是故意的。
  // 没写 resolver 的字段走「默认 resolver」:
  // 从 parent 上取同名属性。
};

const server = new ApolloServer({ typeDefs, resolvers });`,
          }}
          note={{
            en: (
              <>
                The <b>default resolver</b> saves most of the typing. The post
                object that came back from the database already has a{" "}
                <code>title</code> property, so reading it is all that is
                needed. You only write a resolver yourself when the field name
                does not match the data, or when the field has to be computed
                or fetched — <code>author</code> has to exchange{" "}
                <code>authorId</code> for a user.
              </>
            ),
            zh: (
              <>
                <b>默认 resolver</b> 省掉了绝大部分体力活:
                数据库查回来的 post 对象本来就带 <code>title</code> 属性,
                取一下就行。只有「字段名和数据属性对不上」或
                「需要计算、需要查库」的字段,才需要自己写 —— 比如{" "}
                <code>author</code> 得拿 <code>authorId</code> 去换一个用户。
              </>
            ),
          }}
        />

        <ResolverTreeViz />
      </Section>

      {/* ================= §02 context ================= */}
      <Section
        id="context"
        index="02"
        title={{
          en: "context: one object per request",
          zh: "context:每个请求一份的共享对象",
        }}
        desc={{
          en: "Dozens of resolvers run independently, so they need one place to find the things they all use.",
          zh: "几十个 resolver 各跑各的,总得有个地方放「大家都要用的东西」。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                <code>context</code> is <b>an object built when a request
                arrives</b>. Every resolver in that one request receives the
                same object: the logged-in user, the database connection, and
                the DataLoader instances from §04. The words &quot;per
                request&quot; matter. The object does not survive into the next
                request, so a user stored there cannot leak into someone
                else&apos;s request, and a cache stored there cannot serve stale
                data later.
              </>
            }
            zh={
              <>
                <code>context</code> 是<b>请求进门时现建的一个对象</b>,
                这次请求里的所有 resolver 都拿到同一份:当前登录的用户、
                数据库连接、§04 要讲的 DataLoader 实例。
                「每个请求一份」这几个字很关键 ——
                它不会留到下一个请求,所以放在里面的用户不会串到别人的请求里,
                放在里面的缓存也不会在之后返回过期数据。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="js"
          title={{
            en: "context.js · build it, then use it in a resolver",
            zh: "context.js · 先构建,再在 resolver 里用",
          }}
          hl={[4, 5, 14, 15]}
          code={{
            en: `// Declared once when the server starts: build a context per request
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    const user = await getUserFromToken(req.headers.authorization);
    return { user, db, loaders: makeLoaders() };
  },
});

// It is the third argument of every resolver — here it decides access:
const resolvers = {
  Mutation: {
    deletePost: async (parent, { id }, context) => {
      const post = await context.db.findPost(id);
      if (!context.user || context.user.id !== post.authorId) {
        throw new GraphQLError("You are not the author of this post", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return context.db.deletePost(id);
    },
  },
};`,
            zh: `// 建服务器时声明一次:每来一个请求,就现做一份 context
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    const user = await getUserFromToken(req.headers.authorization);
    return { user, db, loaders: makeLoaders() };
  },
});

// 它是每个 resolver 的第三个参数 —— 这里用它判断权限:
const resolvers = {
  Mutation: {
    deletePost: async (parent, { id }, context) => {
      const post = await context.db.findPost(id);
      if (!context.user || context.user.id !== post.authorId) {
        throw new GraphQLError("You are not the author of this post", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return context.db.deletePost(id);
    },
  },
};`,
          }}
          note={{
            en: (
              <>
                This is where chapter 06 connects. The token arrives in an HTTP
                header. The context function checks it once and turns it into{" "}
                <code>context.user</code> — that is authentication. Each
                resolver then asks whether that user is allowed to do this
                particular thing — that is authorization, and in GraphQL it has
                to be decided field by field.
              </>
            ),
            zh: (
              <>
                第 06 章的内容在这里接上了:token 从 HTTP header 进门,
                context 函数验一次,把它变成 <code>context.user</code> ——
                这是认证。之后每个 resolver 各自判断「这个用户能不能做这件事」——
                这是授权,而在 GraphQL 里它得逐个字段地判断。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §03 N+1 ================= */}
      <Section
        id="nplus1"
        index="03"
        title={{ en: "The N+1 problem", zh: "N+1 问题" }}
        desc={{
          en: "The most common performance problem in a GraphQL server. It is much easier to see once than to describe.",
          zh: "GraphQL 后台最常见的性能问题。描述半天,不如现场看一遍。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Look again at the resolvers in §01. <code>Post.author</code>{" "}
                queries the database once, every time it runs. That is fine for
                one post. But what happens when the query is{" "}
                <code>posts {"{ author }"}</code>? The list has N posts, so the{" "}
                <code>author</code> resolver runs N times:{" "}
                <b>1 query for the list, plus N queries for the authors</b>.
                Each resolver only sees its own <code>parent</code>. None of
                them knows that the others are doing the same work. Watch the
                counter on the right.
              </>
            }
            zh={
              <>
                回看 §01 的 resolver:<code>Post.author</code>{" "}
                每执行一次就查一次库。只查一篇文章时没问题。
                但如果查询是 <code>posts {"{ author }"}</code> 呢?
                列表里有 N 篇文章,<code>author</code> 的 resolver 就跑 N 次:
                <b>1 次查列表,再加 N 次查作者</b>。每个 resolver
                只看得见自己的 <code>parent</code>,谁也不知道别人在做同样的事。
                盯住右边的计数器:
              </>
            }
          />
        </p>

        <SqlCounter />

        <Callout
          tone="warn"
          title={{
            en: "The dangerous part is that no server code has to change",
            zh: "真正危险的是:后端一行代码都不用改",
          }}
        >
          <p>
            <T
              en={
                <>
                  In REST the server decides the shape of every response, so a
                  query like this one is written by the backend team and usually
                  shows up in testing. GraphQL moves the shape of the query to
                  the client. The day a frontend developer adds{" "}
                  <code>{"author { name }"}</code> to an existing query, the
                  number of database queries in production goes up, and{" "}
                  <b>no server code changed</b>. That flexibility is real, and
                  so is the cost. Handling it is the work of this chapter.
                </>
              }
              zh={
                <>
                  在 REST 里,响应的形状由服务器决定,这样一条查询是后端自己写的,
                  性能问题一般在测试阶段就撞见了。GraphQL
                  把「查询的形状」交给了客户端:哪天前端在已有查询里加一个{" "}
                  <code>{"author { name }"}</code>,生产环境的数据库查询量就上去了,
                  而<b>后端一行代码都没改</b>。灵活是真的,代价也是真的。
                  这一章剩下的部分,讲的就是怎么把代价压住。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 DataLoader ================= */}
      <Section
        id="dataloader"
        index="04"
        title={{ en: "DataLoader", zh: "DataLoader" }}
        desc={{
          en: "A small open-source library with two mechanisms: batching, and a cache that lives for exactly one request.",
          zh: "一个很小的开源库,两个机制:批处理,以及只活一个请求那么久的缓存。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                DataLoader replaces &quot;each resolver queries on its own&quot;
                with &quot;collect the ids first, then run one query&quot;. When
                a resolver calls <code>load(id)</code>, nothing is queried yet.
                The id is recorded and a Promise is returned. When the current
                tick of the event loop finishes, DataLoader takes the recorded
                ids, <b>removes duplicates</b>, fetches them all with one call
                to <code>batchLoad([9, 12])</code>, and gives each caller its
                own row. Inside one request,{" "}
                <code>load(9), load(12), load(9)</code> produces a single
                query — the repeated 9 is answered from the cache and is not
                even part of the batch.
              </>
            }
            zh={
              <>
                DataLoader 把「每个 resolver 各查各的」换成「先把 id
                收齐,再查一次」。resolver 调 <code>load(id)</code>{" "}
                时并不查库:它只是把 id 记下来,返回一个 Promise。
                等这一轮事件循环(同一个 tick)跑完,DataLoader
                把记下的 id <b>去重</b>,用一次 <code>batchLoad([9, 12])</code>{" "}
                全部取回,再把各自的那条数据分发给对应的调用方。
                在同一个请求里,<code>load(9)、load(12)、load(9)</code>{" "}
                最终只产生一次查询 —— 重复的 9 号由缓存回答,
                连批量查询都不用进。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="js"
          title={{
            en: "loaders.js · a very small change",
            zh: "loaders.js · 改动很小",
          }}
          hl={[6, 17]}
          code={{
            en: `import DataLoader from "dataloader";

// A batch function takes many ids and returns one
// result per id, in the same order and the same length
const makeLoaders = () => ({
  user: new DataLoader(async (ids) => {
    // One query for all of them
    const rows = await db.users.whereIdIn(ids);
    const byId = new Map(rows.map((u) => [u.id, u]));
    return ids.map((id) => byId.get(id) ?? null);
  }),
});

// In the resolver: record the id instead of querying
const resolvers = {
  Post: {
    author: (post, args, context) => context.loaders.user.load(post.authorId),
  },
};`,
            zh: `import DataLoader from "dataloader";

// batch 函数:传进来一批 id,返回同样数量、
// 同样顺序的一批结果
const makeLoaders = () => ({
  user: new DataLoader(async (ids) => {
    // 一条查询把它们全部取回
    const rows = await db.users.whereIdIn(ids);
    const byId = new Map(rows.map((u) => [u.id, u]));
    return ids.map((id) => byId.get(id) ?? null);
  }),
});

// resolver 里:不再直接查库,只登记这个 id
const resolvers = {
  Post: {
    author: (post, args, context) => context.loaders.user.load(post.authorId),
  },
};`,
          }}
          note={{
            en: (
              <>
                Notice where <code>makeLoaders()</code> was called in §02:
                inside the context function. <b>Create the loaders once per
                request</b>. Their cache has no expiry, so a single shared
                instance would keep returning the same user object after that
                user changed their name.
              </>
            ),
            zh: (
              <>
                注意 §02 里 <code>makeLoaders()</code> 是在 context
                函数里调用的:<b>loader 必须每个请求新建一份</b>。
                它的缓存没有过期时间,做成全局共享的一份,
                用户改了名字之后,别人还会一直拿到旧的用户对象。
              </>
            ),
          }}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The same query again, with the loader in place. Watch where the
                counter stops:
              </>
            }
            zh={<>同一条 query,这次加上 loader —— 看计数器停在哪:</>}
          />
        </p>

        <SqlCounter loader />
      </Section>

      {/* ================= §05 缓存 ================= */}
      <Section
        id="caching"
        index="05"
        title={{ en: "Caching", zh: "缓存这道坎" }}
        desc={{
          en: "Chapter 05 showed how a REST response can be cached by the browser, a CDN, or a proxy. GraphQL loses most of that. Here are three ways to get it back.",
          zh: "第 05 章讲过,REST 的响应可以被浏览器、CDN、代理缓存。GraphQL 大部分吃不到,三条出路一条条看。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Recall how REST caching works: a <code>GET</code> request and
                one URL per resource, so the URL itself is the cache key. A
                browser, a CDN, or a proxy can look at the URL and decide
                whether it may reuse a stored response, and an{" "}
                <code>ETag</code> lets the server answer{" "}
                <code>304 Not Modified</code> with no body at all. The
                traditional GraphQL setup is different:{" "}
                <b>every query is a POST to the same <code>/graphql</code>{" "}
                URL, and the query text sits in the body</b>. The cache key is
                gone, the caches in between cannot tell two different queries
                apart, and HTTP caching stops working. This is a real
                architectural cost — but there are three practical answers.
              </>
            }
            zh={
              <>
                回忆一下 REST 的缓存是怎么成立的:<code>GET</code>{" "}
                请求,加上「每个资源一个 URL」,URL 本身就是缓存键。
                浏览器、CDN、代理看一眼 URL 就知道能不能复用存下来的响应;
                有 <code>ETag</code> 时,服务器还能回一个不带响应体的{" "}
                <code>304 Not Modified</code>。GraphQL 的传统做法完全不同:
                <b>所有查询都 POST 到同一个 <code>/graphql</code>,
                查询文本放在请求体里</b>。缓存键没有了,中间这些缓存分不清两条查询,
                HTTP 缓存也就失效了。这是实实在在的架构代价 ——
                但确实有三条出路。
              </>
            }
          />
        </p>

        <div className="bs-way">
          <div className="bs-way-head">
            <span className="bs-way-num">
              <T en="Way 1" zh="出路 ①" />
            </span>
            <h3 className="bs-way-title">
              <T en="A normalized cache in the client" zh="客户端规范化缓存" />
            </h3>
          </div>
          <p>
            <T
              en={
                <>
                  If the layers in between cannot cache, move the cache into the
                  client. Libraries such as Apollo Client give every object an
                  identity built from <code>__typename</code> and{" "}
                  <code>id</code>, then <b>flatten</b> the nested response into
                  a small local store:
                </>
              }
              zh={
                <>
                  既然中间层缓存不了,就把缓存放进客户端。Apollo Client
                  这类库会用 <code>__typename</code> 和 <code>id</code>{" "}
                  给每个对象定一个身份,再把嵌套的响应<b>拍平</b>
                  存进一个本地的小仓库:
                </>
              }
            />
          </p>
          <NormalizeViz />
        </div>

        <div className="bs-way">
          <div className="bs-way-head">
            <span className="bs-way-num">
              <T en="Way 2" zh="出路 ②" />
            </span>
            <h3 className="bs-way-title">
              <T
                en="Persisted queries: send a hash instead of the text"
                zh="persisted queries:用哈希代替查询文本"
              />
            </h3>
          </div>
          <p>
            <T
              en={
                <>
                  Chapter 09 showed that once the changing values are moved into
                  variables, <b>the query text stays the same on every
                  request</b>. So there is no reason to send those few kilobytes
                  again and again. Register the query with the server in
                  advance, and send only its SHA-256 hash. The request becomes
                  much smaller, and the hash plus the variables are short enough
                  to fit in a URL — which means the request can use{" "}
                  <b>GET</b>, and a CDN can cache it again. Only queries may be
                  sent this way. A mutation changes data, so it keeps using
                  POST, exactly as chapter 01 described for safe and unsafe
                  methods.
                </>
              }
              zh={
                <>
                  第 09 章讲过,把变化的值换成变量之后,
                  <b>查询文本每次请求都是一样的</b>。
                  既然如此,就没必要每次都把这几 KB 文本再发一遍。
                  提前把查询注册到服务器,日常请求只发它的 SHA-256 哈希。
                  请求体小了很多;更重要的是,哈希加上变量短到能放进 URL ——
                  于是请求可以改用 <b>GET</b>,CDN 缓存也就重新可用了。
                  只有 query 能这么发:mutation 会修改数据,仍然用 POST ——
                  就是第 01 章讲的安全方法与非安全方法之分。
                </>
              }
            />
          </p>
          <CodeBlock
            lang="http"
            title={{
              en: "The hash stands for the query",
              zh: "用哈希指代查询",
            }}
            code={`GET /graphql?extensions={"persistedQuery":{"version":1,"sha256Hash":"3f2a91c8…"}}&variables={"id":"1"} HTTP/1.1
Host: api.example.com`}
            note={{
              en: (
                <>
                  The JSON in the query string is percent-encoded in a real
                  request; it is shown unencoded here so it stays readable. If
                  the server accepts <b>only</b> hashes that were registered in
                  advance, the same mechanism is a <b>query allowlist</b>: a
                  query the server has never seen is rejected before it is
                  executed. §06 comes back to this.
                </>
              ),
              zh: (
                <>
                  真实请求里,查询串中的 JSON 是经过百分号编码的,
                  这里为了可读没有编码。如果服务器<b>只</b>接受事先注册过的哈希,
                  这套机制同时就是一张<b>查询白名单</b>:
                  没见过的查询在执行之前就被拒绝。§06 还会再用到它。
                </>
              ),
            }}
          />
        </div>

        <div className="bs-way">
          <div className="bs-way-head">
            <span className="bs-way-num">
              <T en="Way 3" zh="出路 ③" />
            </span>
            <h3 className="bs-way-title">
              <T
                en="GraphQL over HTTP: a specification still in draft"
                zh="GraphQL over HTTP:仍在草案中的规范"
              />
            </h3>
          </div>
          <p>
            <T
              en={
                <>
                  The GraphQL Foundation is writing a specification called{" "}
                  <b>GraphQL over HTTP</b>. It is a <b>working draft</b>, not a
                  ratified standard, although several servers already follow it.
                  It defines how to send a query with <code>GET</code>, and adds
                  the media type{" "}
                  <code>application/graphql-response+json</code>. Under that
                  media type a <b>request error</b> — a query the server could
                  not parse or validate — may be answered with a 4xx status
                  instead of 200. A query that executes but has a field failure
                  still returns <code>200</code> with an <code>errors</code>{" "}
                  array, exactly as chapter 07 described. So the two old rules
                  &quot;GraphQL is always POST&quot; and &quot;GraphQL always
                  answers 200&quot; are becoming less absolute. You will still
                  meet both in existing projects.
                </>
              }
              zh={
                <>
                  GraphQL 基金会正在制定 <b>GraphQL over HTTP</b> 规范。
                  它目前是<b>工作草案</b>,不是已经批准的标准,
                  但已经有若干服务器在跟进。它规定了怎么用 <code>GET</code>{" "}
                  发查询,并定义了新的媒体类型{" "}
                  <code>application/graphql-response+json</code>。
                  在这个媒体类型下,<b>请求级错误</b>
                  (服务器根本没能解析或校验通过的查询)可以用 4xx 回应,
                  而不必回 200。而查询正常执行、只是某个字段失败时,
                  仍然返回 <code>200</code> 加一个 <code>errors</code> 数组 ——
                  和第 07 章讲的一样。所以「GraphQL 只能 POST」
                  「GraphQL 永远回 200」这两条老规矩正在变得没那么绝对,
                  但在现有项目里你还是会遇到它们。
                </>
              }
            />
          </p>
        </div>
      </Section>

      {/* ================= §06 安全 ================= */}
      <Section
        id="security"
        index="06"
        title={{
          en: "Security and abuse",
          zh: "安全与滥用防护",
        }}
        desc={{
          en: "Letting the client choose the shape of the query also lets an attacker choose it. Start by looking at what an expensive query looks like.",
          zh: "把查询的形状交给客户端,也就把它交给了攻击者。先看看一条昂贵的查询长什么样。",
        }}
      >
        <CodeBlock
          lang="graphql"
          title={{
            en: "About a hundred bytes",
            zh: "一百来个字节",
          }}
          code={{
            en: `{
  posts {
    comments {
      author {          # the author of a comment
        posts {         # that author's posts
          comments {    # the comments on those posts…
            author {
              posts { title }
            }
          }
        }
      }
    }
  }
}`,
            zh: `{
  posts {
    comments {
      author {          # 评论的作者
        posts {         # 这个作者的文章
          comments {    # 这些文章的评论……
            author {
              posts { title }
            }
          }
        }
      }
    }
  }
}`,
          }}
          note={{
            en: (
              <>
                Nothing here is invalid. It only uses the cycle that already
                exists in the schema: Post → Comment → User → Post. Each extra
                level multiplies the number of resolver calls, so a short query
                can ask the server to do an enormous amount of work. REST does
                not have this problem, because each endpoint returns a shape the
                backend fixed in advance.
              </>
            ),
            zh: (
              <>
                这条查询完全合法。它只是用上了 schema
                里本来就有的循环:Post → Comment → User → Post。
                每多嵌套一层,resolver 的调用次数就再乘一次,
                所以很短的查询也能让服务器干极大量的活。REST
                没有这个问题:每个端点返回什么,后端事先就定死了。
              </>
            ),
          }}
        />

        <div className="grid-3" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="Defense 1" zh="防线 1" />
            </div>
            <div className="card-title">
              <T en="Depth limit" zh="深度限制" />
            </div>
            <p>
              <T
                en={
                  <>
                    Reject a query whose nesting goes deeper than a fixed number
                    of levels, for example 7, before execution starts. It is a
                    blunt rule and it takes minutes to add (GraphQL Armor and
                    similar libraries provide it), but it stops the simplest
                    attacks.
                  </>
                }
                zh={
                  <>
                    嵌套超过固定层数(比如 7 层)的查询,在开始执行之前就拒绝。
                    这条规则很粗糙,但几分钟就能接上(GraphQL Armor
                    这类库都提供),足以挡住最简单的攻击。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Defense 2" zh="防线 2" />
            </div>
            <div className="card-title">
              <T en="Complexity or cost scoring" zh="复杂度 / 成本打分" />
            </div>
            <p>
              <T
                en={
                  <>
                    A shallow query over huge lists is expensive too. Give each
                    field a price: a scalar costs 1, a list costs its{" "}
                    <code>first</code> argument multiplied by the cost of its
                    selection set. Add the score up before executing, and reject
                    anything over budget. The GitHub GraphQL API rate limit
                    works this way. You will set the prices yourself in the
                    practice section.
                  </>
                }
                zh={
                  <>
                    嵌套不深但列表巨大的查询同样昂贵。给字段定价:标量 1 分,
                    列表按 <code>first</code> 参数乘以它子选择集的分数。
                    执行前先把总分算出来,超预算就拒绝。GitHub GraphQL API
                    的限流就是这么算的。动手任务里你会亲自定一次价。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Defense 3" zh="防线 3" />
            </div>
            <div className="card-title">
              <T en="Timeout" zh="超时" />
            </div>
            <p>
              <T
                en={
                  <>
                    Whatever the first two rules fail to catch is caught by the
                    oldest rule of all: stop a single query after N seconds. One
                    user seeing an error is much better than one query holding
                    the whole server.
                  </>
                }
                zh={
                  <>
                    前两道防线漏掉的,交给最古老的一条规则:
                    单条查询超过 N 秒就中断。让一个用户看到报错,
                    远好过让一条查询拖住整台服务器。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="deep"
          title={{
            en: "Should introspection be disabled in production? Both sides have a point",
            zh: "introspection 生产环境该不该关?两边都有道理",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>Disable it</b>: introspection hands the whole schema to
                  anyone who asks, which is a map for an attacker, and an
                  introspection query can itself be expensive to answer. Apollo
                  Server disables it in production by default, and OWASP lists
                  it as a hardening step. <b>Keep it on</b>: hiding the schema is
                  security by obscurity. The queries can be read out of the
                  frontend bundle or guessed, and public APIs such as
                  GitHub&apos;s leave introspection enabled on purpose. Both
                  sides agree on what actually protects the server:{" "}
                  <b>a persisted-query allowlist and field-level
                  authorization</b>. The introspection switch is a small extra
                  measure either way.
                </>
              }
              zh={
                <>
                  <b>主张关闭</b>:introspection 会把整张 schema
                  交给任何来问的人,等于给攻击者一张地图;
                  而且 introspection 查询本身回答起来就可能很贵。
                  Apollo Server 在生产环境默认关闭它,OWASP 也把它列为加固项。
                  <b>主张开着</b>:藏 schema 属于「靠隐蔽求安全」,
                  查询能从前端产物里读出来,也能猜出来;
                  GitHub 这样的公开 API 就是有意开着的。
                  两边其实在一件事上一致:真正保护服务器的是{" "}
                  <b>persisted queries 白名单 + 字段级授权</b>,
                  introspection 开关只是额外的一点补充。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="story"
          title={{
            en: "The other side: these costs are real",
            zh: "反方发言:这些代价都是真的",
          }}
        >
          <p>
            <T
              en={
                <>
                  In 2024 Matt Bessey published{" "}
                  <i>Why, after 6 years, I&apos;m over GraphQL</i>, written
                  after six years of using it. He reports an unauthenticated
                  introspection query of about 128 bytes that used roughly ten
                  seconds of CPU on a public API. His four complaints are the
                  four subjects of this chapter: the attack surface, the cost of
                  field-level authorization (REST checks once at the endpoint,
                  GraphQL has to check every field), N+1, and observability —
                  hundreds of different queries arrive at one endpoint, so
                  monitoring and debugging need different tools.
                </>
              }
              zh={
                <>
                  2024 年,Matt Bessey 写了一篇{" "}
                  <i>Why, after 6 years, I&apos;m over GraphQL</i>,
                  那是他用了六年之后的总结。文中提到:一条约 128
                  字节、不需要认证的 introspection
                  查询,在一个公开 API 上消耗了约十秒 CPU。
                  他抱怨的四件事,正好是这一章的四个主题:攻击面、
                  字段级授权的成本(REST 在端点门口检查一次就行,
                  GraphQL 得每个字段都检查)、N+1,以及可观测性 ——
                  几百种不同的查询打到同一个端点,监控和排障都得换工具。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  These costs are real. Large teams absorb them with federation,
                  cost analysis, and a full set of tools, and get the
                  flexibility in return. A small team that cannot maintain that
                  tooling may be better served by REST.{" "}
                  <b>Neither one replaces the other; each is a trade-off</b> —
                  the finale works through that decision.
                </>
              }
              zh={
                <>
                  这些代价是真的。大团队用 federation、成本分析和一整套工具把它们扛下来,
                  换到那份灵活。小团队维护不了这套工具链,用 REST 反而更合适。
                  <b>两者不是替代关系,而是各有取舍</b> —— 终章会把这个决定讲完。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Three tasks from the server side: count resolver calls, write a batch function, then act as the gatekeeper.",
          zh: "三个任务都站在服务器这一侧:数一次 resolver 调用,写一个 batch 函数,再当一回守门人。",
        }}
      >
        <LabSet ch="backstage" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions. For the N+1 counting one, work the number out on paper instead of guessing.",
          zh: "八道题。N+1 计数那道请动笔算一遍,不要凭感觉猜。",
        }}
      >
        <Quiz ch="backstage" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                Every field is produced by a resolver with the signature{" "}
                <code>(parent, args, context, info)</code>. Execution is a walk
                down the field tree from the <code>Query</code> root, and each
                parent field&apos;s return value becomes the child&apos;s{" "}
                <code>parent</code>. A field with no resolver uses the default
                resolver, which reads the property of the same name from{" "}
                <code>parent</code>.
              </>
            ),
            zh: (
              <>
                每个字段由一个 resolver 产生,签名是{" "}
                <code>(parent, args, context, info)</code>。执行过程是从{" "}
                <code>Query</code> 根开始沿字段树往下走,
                父字段的返回值就是子字段的 <code>parent</code>。
                没写 resolver 的字段走默认 resolver:取 <code>parent</code>{" "}
                上的同名属性。
              </>
            ),
          },
          {
            en: (
              <>
                <code>context</code> is built once per request and shared by
                every resolver in it: the current user, the data sources, the
                loaders. &quot;Per request&quot; is what keeps one user&apos;s
                data out of another user&apos;s response.
              </>
            ),
            zh: (
              <>
                <code>context</code> 每个请求构建一次,由这次请求里的所有
                resolver 共享:当前用户、数据源、loader。
                「每请求一份」正是它不会把一个用户的数据带进另一个用户响应的原因。
              </>
            ),
          },
          {
            en: (
              <>
                N+1: <code>posts {"{ author }"}</code> costs 1 query for the
                list plus N queries for the authors. A client-side change to the
                query can trigger it with no change on the server.
              </>
            ),
            zh: (
              <>
                N+1:<code>posts {"{ author }"}</code>{" "}
                的代价是 1 次查列表加 N 次查作者。
                客户端改一下查询就能触发它,服务器一行代码都不用动。
              </>
            ),
          },
          {
            en: (
              <>
                DataLoader has two mechanisms: it <b>batches</b> the{" "}
                <code>load()</code> calls made in the same tick of the event
                loop into one query, and it answers a repeated id from a{" "}
                <b>per-request cache</b>. The counter drops from 1+N to 2.
              </>
            ),
            zh: (
              <>
                DataLoader 有两个机制:把同一个 tick 内的{" "}
                <code>load()</code> <b>批处理</b>成一次查询,
                重复的 id 由<b>每请求缓存</b>回答。计数器从 1+N 降到 2。
              </>
            ),
          },
          {
            en: (
              <>
                One endpoint, POST, and a body that changes every time is what
                breaks HTTP caching. The three answers: a normalized cache in
                the client (keyed by <code>__typename</code> and{" "}
                <code>id</code>), persisted queries (send a hash, use GET, reach
                the CDN), and the draft GraphQL over HTTP specification.
              </>
            ),
            zh: (
              <>
                单端点 + POST + 每次都变的请求体,是 HTTP 缓存失效的原因。
                三条出路:客户端规范化缓存(按 <code>__typename</code> 和{" "}
                <code>id</code> 建键)、persisted queries(发哈希、改用 GET、
                重新吃到 CDN),以及仍在草案中的 GraphQL over HTTP 规范。
              </>
            ),
          },
          {
            en: (
              <>
                Flexibility cuts both ways: use a depth limit, cost scoring, and
                a timeout together. Whether to disable introspection is
                debated; a persisted-query allowlist plus field-level
                authorization is the defense that matters.
              </>
            ),
            zh: (
              <>
                灵活是双刃剑:深度限制、成本打分、超时三道防线要一起上。
                introspection 关不关有争论;真正管用的防线是 persisted queries
                白名单加字段级授权。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="backstage" />
    </main>
  );
}
