"use client";

// 第 08 章 · Schema 与类型系统(双语,英文默认):
// 契约的由来 → SDL 初见(完整博客 schema)→ 标量与修饰符(默认可空 + ModifierLab)→
// 关联与图(SchemaGraph)→ 类型工具箱(enum/interface/union/input)→
// 内省 → 契约怎么用 → 动手任务 → 测验 → 要点。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。
// resolver 属于第 10 章,这里只做一次前向引用,不重复讲。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/schema-data";
import { T } from "@/lib/i18n";
import { ScHeroContract, ModifierLab, SchemaGraph } from "./viz";

export default function SchemaPage() {
  return (
    <main className="page" data-ch="schema">
      <Hero
        ch="schema"
        title={{
          en: (
            <>
              Schema and the <span className="grad">type system</span>
            </>
          ),
          zh: (
            <>
              Schema 与<span className="grad">类型系统</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              The schema is a written contract. It declares which types the
              server has, which fields those types have, and where a value may
              be null. Both sides read the same file, so neither has to guess.
            </>
          ),
          zh: (
            <>
              schema 是一份写下来的契约:服务器有哪些类型、每个类型有哪些字段、
              哪里可能是 null,全部写明。前后端读的是同一份文件,谁也不用猜。
            </>
          ),
        }}
        chips={[
          { id: "sdl", n: "01", label: { en: "Reading SDL", zh: "SDL 初见" } },
          {
            id: "scalars",
            n: "02",
            label: { en: "Scalars and modifiers", zh: "标量与修饰符" },
          },
          {
            id: "graph",
            n: "03",
            label: { en: "Types as a graph", zh: "关联与图" },
          },
          {
            id: "toolbox",
            n: "04",
            label: { en: "Type toolbox", zh: "类型工具箱" },
          },
          {
            id: "introspection",
            n: "05",
            label: { en: "Introspection", zh: "内省" },
          },
          {
            id: "contract",
            n: "06",
            label: { en: "Using the contract", zh: "契约怎么用" },
          },
          { id: "labs", n: "07", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <ScHeroContract />
      </Hero>

      {/* ================= §01 SDL 初见 ================= */}
      <Section
        id="sdl"
        index="01"
        title={{
          en: "Reading SDL: the blog written as a contract",
          zh: "SDL 初见:把博客写成一纸契约",
        }}
        desc={{
          en: "The same blog data as before: users, posts, and comments. In chapter 07 you selected fields from it. Here you read the file that declares which fields exist.",
          zh: "还是那套博客数据:用户、帖子、评论。第 07 章你从中挑过字段,这一章来读那份「声明有哪些字段」的文件。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "Before there was a contract",
            zh: "没有契约的日子",
          }}
        >
          <p>
            <T
              en={
                <>
                  The client developer asks: is the avatar field called{" "}
                  <code>avatar</code> or <code>avatarUrl</code>? The server
                  developer answers: read the code. Can <code>comments</code> be
                  null? Probably not. Every &quot;probably&quot; turns into a bug
                  after release.
                </>
              }
              zh={
                <>
                  前端问:作者头像那个字段到底叫 <code>avatar</code> 还是{" "}
                  <code>avatarUrl</code>?后端答:看代码。前端又问:
                  <code>comments</code> 会不会是 null?后端答:应该不会吧。
                  每一个「应该」,上线后都会变成一个 bug。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  GraphQL answers this by writing it all down once. An API has
                  one <b>schema</b>, written in SDL (Schema Definition Language).
                  It declares which data the server has, the type of every field,
                  and where a value may be null. Nobody has to guess.
                </>
              }
              zh={
                <>
                  GraphQL 的解法是把这些问题<b>一次性写成白纸黑字</b>:
                  一个 API 有一份 <b>schema</b>,用 SDL(Schema Definition
                  Language,模式定义语言)写成。服务器有哪些数据、
                  每个字段是什么类型、哪里可能是 null,全都写明,谁也不用猜。
                </>
              }
            />
          </p>
        </Callout>

        <CodeBlock
          lang="graphql"
          title="blog.graphql"
          code={`type Query {
  post(id: ID!): Post
  posts(limit: Int = 10): [Post!]!
  user(id: ID!): User
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  createdAt: String!
  author: User!
  comments: [Comment!]!
}

type Comment {
  id: ID!
  body: String!
  author: User!
}`}
          hl={[1, 2, 3, 4, 5]}
          note={{
            en: (
              <>
                Look at the highlighted <code>Query</code> type. The return type
                of <code>post(id: ID!): Post</code> carries no exclamation mark,
                because asking for a post that does not exist and receiving null
                is a normal outcome. <code>posts</code> returns{" "}
                <code>[Post!]!</code>, so the list is always there, even when it
                is empty. Section 02 explains why nullability is a decision about
                the business, not about style.
              </>
            ),
            zh: (
              <>
                看高亮的 <code>Query</code>:<code>post(id: ID!): Post</code>{" "}
                的返回类型没有感叹号 —— 查一篇不存在的帖子、拿到 null,
                本来就是正常结果;而 <code>posts</code> 返回{" "}
                <code>[Post!]!</code>,列表永远在,顶多是空的。
                「可空性是业务决定,不是风格偏好」这件事,§02 细讲。
              </>
            ),
          }}
        />

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">type Query</div>
            <div className="card-title">
              <T en="The entry point for reads" zh="所有读操作的入口" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every read starts here. The many <code>GET</code> endpoints
                    of a REST API become fields on <code>Query</code>. This is
                    the answer to &quot;where did the routes go&quot; from
                    chapter 07.
                  </>
                }
                zh={
                  <>
                    所有读操作都从这里进。REST 里那一堆 <code>GET</code> 端点,
                    在这里变成 <code>Query</code> 上的一个个字段 —— 这就是第 07
                    章「路由去哪了」的答案。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">type User / Post / Comment</div>
            <div className="card-title">
              <T en="The nouns of your data" zh="数据里的名词" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each <code>type</code> describes the shape of one kind of
                    data. It looks like a TypeScript interface. The difference is
                    that this definition is shared: the server is held to it too.
                  </>
                }
                zh={
                  <>
                    每个 <code>type</code> 描述一种数据长什么样,写法很像
                    TypeScript 的 interface。区别在于这份定义是共用的 ——
                    服务器同样要守着它。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">name: String!</div>
            <div className="card-title">
              <T en="A field is a name and a type" zh="字段 = 名字 + 类型" />
            </div>
            <p>
              <T
                en={
                  <>
                    The name goes on the left of the colon, the type on the
                    right. A type can be a scalar, or it can be another type.
                    Types referring to types is what connects the data into a
                    graph (section 03).
                  </>
                }
                zh={
                  <>
                    冒号左边是字段名,右边是类型。类型可以是标量,
                    也可以是另一个 type —— 类型引用类型,数据就这样连成一张图
                    (§03)。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">! and [ ]</div>
            <div className="card-title">
              <T
                en="Two symbols that need a whole section"
                zh="两个符号,值得一整节"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    <code>!</code> means the value is never null.{" "}
                    <code>[ ]</code> means a list. These two symbols carry the
                    rule that surprises most people coming from other type
                    systems. Section 02 works through it.
                  </>
                }
                zh={
                  <>
                    <code>!</code> 表示这个值永远不会是 null,<code>[ ]</code>{" "}
                    表示列表。从别的类型系统过来的人,最容易在这两个符号上翻车
                    —— §02 专门讲它们。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="idea"
          title={{
            en: "The same file, on both desks",
            zh: "同一份文件,两边各留一份",
          }}
        >
          <p>
            <T
              en={
                <>
                  The client uses the schema to validate queries and to generate
                  types. The server uses it to line up the implementation of each
                  field. To change a field you change the contract first, and the
                  tools immediately mark every place where the two sides no
                  longer match.{" "}
                  <b>Work that used to need a meeting becomes a compile error.</b>
                </>
              }
              zh={
                <>
                  客户端拿它校验查询、生成类型;服务器拿它对齐每个字段的实现。
                  要改字段,先改契约 —— 工具会立刻标出两边不再匹配的地方。
                  <b>本来要开会才能对齐的事,变成了一个编译错误。</b>
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One limit is worth stating now: the schema only declares what
                  exists. On the server, each field still needs code that produces
                  its value. Those functions are called <b>resolvers</b>, and
                  chapter 10 covers them.
                </>
              }
              zh={
                <>
                  这里先划一条边界:schema 只负责声明「有什么」。
                  在服务器上,每个字段的值仍然要由代码产生 ——
                  这些函数叫 <b>resolver</b>,第 10 章专门讲。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 标量与修饰符 ================= */}
      <Section
        id="scalars"
        index="02"
        title={{
          en: "Scalars and modifiers: the atoms of the type system",
          zh: "标量与修饰符:类型系统的原子",
        }}
        desc={{
          en: "A value that cannot be broken down into fields is a scalar. The specification defines five of them.",
          zh: "不能再拆成字段的值叫标量(scalar)。规范一共定义了五个。",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Scalar" zh="标量" />
                </th>
                <th>
                  <T en="What it holds" zh="装什么" />
                </th>
                <th>
                  <T en="Example" zh="例子" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Int</b>
                </td>
                <td>
                  <T en="A signed 32-bit integer" zh="32 位有符号整数" />
                </td>
                <td>
                  <code>42</code>
                </td>
              </tr>
              <tr>
                <td>
                  <b>Float</b>
                </td>
                <td>
                  <T
                    en="A signed double-precision floating point number"
                    zh="有符号双精度浮点数"
                  />
                </td>
                <td>
                  <code>3.14</code>
                </td>
              </tr>
              <tr>
                <td>
                  <b>String</b>
                </td>
                <td>
                  <T
                    en="Text, as a sequence of UTF-8 characters"
                    zh="文本,一串 UTF-8 字符"
                  />
                </td>
                <td>
                  <code>&quot;hello&quot;</code>
                </td>
              </tr>
              <tr>
                <td>
                  <b>Boolean</b>
                </td>
                <td>
                  <T en="true or false" zh="真 / 假" />
                </td>
                <td>
                  <code>true</code>
                </td>
              </tr>
              <tr>
                <td>
                  <b>ID</b>
                </td>
                <td>
                  <T
                    en={
                      <>
                        A unique identifier. It is{" "}
                        <b>always serialized as a string</b>.
                      </>
                    }
                    zh={
                      <>
                        唯一标识,<b>序列化时一律变成字符串</b>。
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>&quot;9&quot;</code> (even when the server stores
                        the number 9)
                      </>
                    }
                    zh={
                      <>
                        <code>&quot;9&quot;</code>(服务器存的是数字 9 也一样)
                      </>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="sec-desc">
          <T
            en={
              <>
                <code>ID</code> deserves a note. It looks like a{" "}
                <code>String</code>, but it means something different: this value
                is a key used to find one object. Whether the key is a counter, a
                UUID, or a hash does not matter. You should not do arithmetic on
                it; you use it to fetch the object again. And what about dates?
                There is no built-in date scalar. You either send them as{" "}
                <code>String</code>, or you define a custom scalar with your own
                functions for serializing and parsing the value (
                <code>DateTime</code> is a common one in the ecosystem). One more
                consequence of the table above: <code>Int</code> is 32-bit, so a
                value beyond 2,147,483,647 — a timestamp in milliseconds, for
                example — does not fit in it.
              </>
            }
            zh={
              <>
                <code>ID</code> 值得多说两句。它长得像 <code>String</code>,
                含义却不同:它表示「这是一把用来定位某个对象的钥匙」。
                钥匙里是自增数字、UUID 还是哈希都无所谓。你不该拿它做算术,
                拿着它能换回对象就够了。那日期呢?内置标量里没有日期 ——
                要么用 <code>String</code> 传,要么自定义标量,
                自己写序列化和解析函数(生态里 <code>DateTime</code> 很常见)。
                上面那张表还有一个后果:<code>Int</code> 是 32 位的,
                超过 2,147,483,647 的值(比如毫秒时间戳)装不下。
              </>
            }
          />
        </p>

        <Callout
          tone="warn"
          title={{
            en: "Fields are nullable by default",
            zh: "反直觉的一条:字段默认可空",
          }}
        >
          <p>
            <T
              en={
                <>
                  In TypeScript and Java, a type is not nullable unless you say
                  so. GraphQL works the other way round:{" "}
                  <b>
                    a field written without <code>!</code> may return null at any
                    time
                  </b>
                  . This is deliberate. If the data source behind one field
                  fails, the server can return null for that field alone and
                  still deliver the rest of the response. Chapter 09 shows what
                  those partial responses look like.
                </>
              }
              zh={
                <>
                  在 TypeScript、Java 里,类型默认不可空,除非你显式声明;
                  GraphQL 正好相反:<b>没写 <code>!</code> 的字段,随时可能是 null</b>
                  。这是故意的设计 —— 某个字段背后的数据源挂了,
                  服务器可以只让这个字段为 null,响应的其余部分照常返回。
                  这种「部分成功」的响应长什么样,第 09 章会展开。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The cost is that the client has to check for null in more
                  places. So in a real schema, every field the server can
                  actually guarantee is marked with <code>!</code>. Each{" "}
                  <code>!</code> is a promise the server has to keep.
                </>
              }
              zh={
                <>
                  代价是客户端要在更多地方判空。所以真实项目的 schema 里,
                  凡是服务器确实能保证的字段,都会郑重地写上 <code>!</code> ——
                  每一个感叹号都是一句服务器必须兑现的承诺。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                <code>!</code> (Non-Null) and <code>[ ]</code> (List) combine,
                which gives four ways to write a list field. The tool below
                explains each one: select a form to see which level may be null.
              </>
            }
            zh={
              <>
                <code>!</code>(Non-Null,非空)和 <code>[ ]</code>(List,列表)
                可以组合,一共四种写法。下面这个工具逐一解释:
                点一种写法,看哪一层可以是 null。
              </>
            }
          />
        </p>

        <ModifierLab />
      </Section>

      {/* ================= §03 关联与图 ================= */}
      <Section
        id="graph"
        index="03"
        title={{
          en: "Types as a graph: where the Graph in GraphQL comes from",
          zh: "关联与图:GraphQL 的 Graph 是怎么来的",
        }}
        desc={{
          en: "Types refer to types. Post.author is a User, and User.posts is [Post!]!. Follow those references and a graph appears.",
          zh: "类型引用类型:Post.author 是 User,User.posts 是 [Post!]! —— 顺着引用走,就走出一张图。",
        }}
      >
        <SchemaGraph />
        <Callout
          tone="idea"
          title={{
            en: "From separate tables to one graph",
            zh: "从一张张表,到一张图",
          }}
        >
          <p>
            <T
              en={
                <>
                  REST splits the data into separate resources, and you join them
                  yourself by sending another request. GraphQL describes the same
                  data as a graph: <b>types are the nodes, fields are the edges</b>
                  . A query starts at <code>Query</code> and walks a path you
                  choose. &quot;The comments on the other posts by the author of
                  this post&quot; is one path, written once. This is what makes
                  the single request in chapter 07 possible.
                </>
              }
              zh={
                <>
                  REST 把数据切成一个个独立的资源,资源之间要靠你再发一次请求去拼;
                  GraphQL 把同一批数据描述成一张图:<b>类型是点,字段是边</b>。
                  查询从 <code>Query</code> 出发,沿着你自己选的路径走下去 ——
                  「这篇帖子的作者写的其他帖子的评论」,一次就能写完。
                  第 07 章那个「一趟请求拿全」,底气就在这张图上。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 类型工具箱 ================= */}
      <Section
        id="toolbox"
        index="04"
        title={{
          en: "Type toolbox: enum, interface, union, input",
          zh: "类型工具箱:enum、interface、union、input",
        }}
        desc={{
          en: "type and the scalars do most of the work. These four cover the cases they cannot. Each one comes with an example and a note on when to use it.",
          zh: "type 和标量是主力,剩下的情况交给这四件工具。每件配一段代码和一句「什么时候用它」。",
        }}
      >
        <h3 className="sc-tool-h">
          <span className="mono">enum</span>{" "}
          <T en="· a closed set of values" zh="· 枚举:值只有这几种" />
        </h3>
        <CodeBlock
          lang="graphql"
          title={{ en: "enum · enumeration", zh: "enum · 枚举" }}
          code={{
            en: `enum PostStatus {
  DRAFT      # written, not visible yet
  PUBLISHED  # visible to everyone
  ARCHIVED   # hidden again
}

type Post {
  status: PostStatus!
}`,
            zh: `enum PostStatus {
  DRAFT      # 已写好,尚未可见
  PUBLISHED  # 已发布,所有人可见
  ARCHIVED   # 已归档,重新隐藏
}

type Post {
  status: PostStatus!
}`,
          }}
          note={{
            en: (
              <>
                When to use it: the field can only hold a small, fixed set of
                values, and a typo would be expensive. Send{" "}
                <code>PUBLISH</code> instead of <code>PUBLISHED</code> and the
                server rejects the query before executing it, so the wrong value
                never reaches the database. Over JSON, an enum value travels as
                its name, which is a string. How your server represents it
                internally is not defined by the specification.
              </>
            ),
            zh: (
              <>
                什么时候用它:这个字段的取值只可能是有限的几种,而且拼错代价很大。
                写成 <code>PUBLISH</code> 而不是 <code>PUBLISHED</code>,
                服务器在执行查询之前就会拒绝,错误的值根本到不了数据库。
                在 JSON 里,枚举值以它的名字(一个字符串)传输;
                至于服务器内部怎么表示它,规范不作规定。
              </>
            ),
          }}
        />

        <h3 className="sc-tool-h">
          <span className="mono">interface</span>{" "}
          <T en="· fields that several types share" zh="· 接口:多个类型共有的字段" />
        </h3>
        <CodeBlock
          lang="graphql"
          title={{ en: "interface", zh: "interface · 接口" }}
          code={`interface Node {
  id: ID!
}

type Post implements Node {
  id: ID!
  title: String!
}

type User implements Node {
  id: ID!
  name: String!
}`}
          note={{
            en: (
              <>
                When to use it: several types really do share the same fields,
                and you want to handle them through one entry point — for
                example, anything that has a global <code>id</code> can be
                fetched by that <code>id</code>. A type that implements an
                interface must declare every field the interface declares. A
                query on an interface can select the shared fields directly, and
                uses an inline fragment when it needs a field that belongs to one
                specific type.
              </>
            ),
            zh: (
              <>
                什么时候用它:一批类型确实共有同一组字段,而且你想用同一个入口
                统一处理它们 —— 比如「凡是带全局 <code>id</code> 的对象,
                都能用这个 <code>id</code> 查回来」。实现接口的类型,
                必须把接口声明的字段一个不落地写出来。
                查询接口时,共有字段可以直接选;
                要取某个具体类型独有的字段,才需要内联片段。
              </>
            ),
          }}
        />

        <h3 className="sc-tool-h">
          <span className="mono">union</span>{" "}
          <T en="· one of several types" zh="· 联合:结果是这几种类型之一" />
        </h3>
        <CodeBlock
          lang="graphql"
          title={{ en: "union", zh: "union · 联合" }}
          code={{
            en: `union SearchResult = Post | User

type Query {
  search(keyword: String!): [SearchResult!]!
}

# A union declares no fields of its own, so a query cannot
# select a field directly. Use inline fragments, and ask for
# __typename to know which type you received:
# {
#   search(keyword: "graphql") {
#     __typename
#     ... on Post { title }
#     ... on User { name }
#   }
# }`,
            zh: `union SearchResult = Post | User

type Query {
  search(keyword: String!): [SearchResult!]!
}

# union 自己不声明任何字段,所以查询不能直接选字段。
# 要用内联片段按类型分头取,再用 __typename
# 判断这一条到底是哪种类型:
# {
#   search(keyword: "graphql") {
#     __typename
#     ... on Post { title }
#     ... on User { name }
#   }
# }`,
          }}
          note={{
            en: (
              <>
                When to use it: the result can be one of several types that have{" "}
                <b>no fields in common</b>, such as a search result or a mixed
                feed. That is also the line between the two tools: an interface
                declares fields its members must all have, while a union only
                lists which types are possible.
              </>
            ),
            zh: (
              <>
                什么时候用它:结果可能是几种<b>没有任何公共字段</b>的类型,
                比如搜索结果、混合信息流。这也正是两件工具的分界:
                interface 声明成员必须共有的字段,union 只列出可能是哪几种类型。
              </>
            ),
          }}
        />

        <h3 className="sc-tool-h">
          <span className="mono">input</span>{" "}
          <T en="· objects you send as arguments" zh="· 输入类型:作为参数传进去的对象" />
        </h3>
        <CodeBlock
          lang="graphql"
          title={{ en: "input · input object type", zh: "input · 输入类型" }}
          code={{
            en: `input CreatePostInput {
  title: String!
  body: String!
  status: PostStatus = DRAFT   # an argument may have a default
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
}`,
            zh: `input CreatePostInput {
  title: String!
  body: String!
  status: PostStatus = DRAFT   # 参数可以带默认值
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
}`,
          }}
          note={{
            en: (
              <>
                When to use it: a write operation needs to send a whole object of
                data. The specification keeps the two directions apart. A{" "}
                <code>type</code> may only be returned, and an{" "}
                <code>input</code> may only be passed in; one cannot be used
                where the other is expected. The type of an input field must
                itself be an input type: a scalar, an enum, or another input
                object. Chapter 09 uses input types for every mutation.
              </>
            ),
            zh: (
              <>
                什么时候用它:写操作需要传一整包数据的时候。规范把两个方向分得很死:
                <code>type</code> 只能被返回,<code>input</code> 只能被传入,
                谁也不能顶替谁。输入字段的类型本身也必须是输入类型 ——
                标量、枚举,或者另一个 input 对象。第 09 章的每个 mutation
                都要用到它。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §05 内省 ================= */}
      <Section
        id="introspection"
        index="05"
        title={{
          en: "Introspection: an API that describes itself",
          zh: "内省:会自我介绍的 API",
        }}
        desc={{
          en: "Chapter 07 left a question open: where do the documentation panel and the autocomplete in GraphiQL come from?",
          zh: "第 07 章欠的账今天还:GraphiQL 的文档面板和自动补全,到底是哪来的?",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                The answer is <b>introspection</b>. The schema is not only a
                document for people to read. It lives inside the server, and{" "}
                <b>you can query it with GraphQL itself</b>. Meta-fields whose
                names start with <code>__</code> (two underscores) return the
                schema:
              </>
            }
            zh={
              <>
                答案是<b>内省(introspection)</b>。schema 不只是给人读的文档,
                它本身就存在于服务器里,而且<b>可以用 GraphQL 来查 GraphQL</b>。
                以 <code>__</code>(两个下划线)开头的元字段,专门负责返回
                schema 自己的内容:
              </>
            }
          />
        </p>

        <CodePair
          left={
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
          }
          right={
            <CodeBlock
              lang="json"
              title={{ en: "Response (shortened)", zh: "响应(节选)" }}
              code={`{
  "data": {
    "__schema": {
      "types": [
        { "name": "Query" },
        { "name": "User" },
        { "name": "Post" },
        { "name": "Comment" },
        { "name": "String" },
        { "name": "__Schema" }
      ]
    }
  }
}`}
            />
          }
        />

        <p className="sec-desc">
          <T
            en={
              <>
                That one query returns the name of every type in the system. Ask{" "}
                <code>__type(name: &quot;Post&quot;)</code> and you get its
                fields, their arguments, and their descriptions. When GraphiQL
                starts, the first thing it sends is an introspection query. It
                then draws the documentation panel from the result and feeds the
                autocomplete.{" "}
                <b>
                  Every convenience in the GraphQL tooling is built on
                  introspection.
                </b>
              </>
            }
            zh={
              <>
                就这一句,整个类型系统的名单就回来了;再用{" "}
                <code>__type(name: &quot;Post&quot;)</code>{" "}
                往下问,字段、参数、说明文档也一样不缺。GraphiQL
                启动时发出的第一个请求就是内省查询,
                然后拿结果画出文档面板、喂给自动补全。
                <b>GraphQL 工具生态里的一切便利,地基都是内省。</b>
              </>
            }
          />
        </p>

        <Callout
          tone="deep"
          title={{
            en: "Should introspection be turned off in production? Both sides have a case.",
            zh: "生产环境要不要关掉内省?两派都有道理",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>Turn it off</b>: introspection tells an attacker exactly
                  what the API contains, which makes it cheap to look for a weak
                  field. Apollo Server disables it in production by default, and
                  OWASP lists it as a hardening step. <b>Leave it on</b>: a
                  public API such as GitHub&apos;s keeps it open, because the
                  documentation is part of the product, and hiding the schema
                  does not stop a determined attacker. The real defenses are an
                  allowlist of queries and authorization on each field. Which
                  side applies depends on whether your API is internal or public.
                  Chapter 10 works through it.
                </>
              }
              zh={
                <>
                  <b>关掉派</b>:内省会把 API 里有什么原样告诉攻击者,
                  找薄弱字段的成本因此很低。Apollo Server
                  在生产模式下默认关闭它,OWASP 也把它列为加固项。
                  <b>开着派</b>:GitHub 这类公开 API 大方开着 ——
                  文档本身就是产品的一部分,而且藏起 schema 也拦不住有备而来的攻击者。
                  真正的防线是查询白名单和字段级授权。到底适用哪一派,
                  取决于你的 API 是对内还是对外 —— 第 10 章细算这笔账。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 契约怎么用 ================= */}
      <Section
        id="contract"
        index="06"
        title={{
          en: "Using the contract: what happens after both sides sign",
          zh: "契约怎么用:签完之后,各自开工",
        }}
        desc={{
          en: "A schema is not a document you write once and file away. It sits at the center of the workflow. Three ways it gets used.",
          zh: "schema 不是写完就归档的文件,它是整个工作流的中心。三种用法。",
        }}
      >
        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">
              <T en="Use 1" zh="用法一" />
            </div>
            <div className="card-title">
              <T en="Both sides work in parallel" zh="前后端并行开发" />
            </div>
            <p>
              <T
                en={
                  <>
                    Once the schema is agreed, the client team can build the
                    interface against mock data, meaning fake responses shaped by
                    the contract. The server team fills in the real
                    implementation at its own pace. Neither team waits for the
                    other, and the contract is what they check against when the
                    two are joined.
                  </>
                }
                zh={
                  <>
                    schema 一旦定稿,前端就可以拿 mock
                    数据(按契约伪造的假响应)先把界面写出来,
                    后端慢慢填真正的实现。两边谁也不用等谁,
                    联调时照着同一份契约对表。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Use 2 · option A" zh="用法二 · 路线 A" />
            </div>
            <div className="card-title">
              <T en="Schema-first: write the SDL" zh="schema-first:先写 SDL" />
            </div>
            <p>
              <T
                en={
                  <>
                    You write the <code>.graphql</code> file by hand, then write
                    the code for each field. GraphQL Yoga with SDL is one
                    example. The contract is the source, and anyone can read it
                    in a review. The risk is that the SDL and the code drift
                    apart unless something checks them against each other.
                  </>
                }
                zh={
                  <>
                    人手写 <code>.graphql</code> 文件,再为每个字段补上实现。
                    GraphQL Yoga + SDL 是一例。契约就是源码,评审时人人能读。
                    风险是:如果没有工具去核对,SDL 和代码可能逐渐脱节。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Use 2 · option B" zh="用法二 · 路线 B" />
            </div>
            <div className="card-title">
              <T
                en="Code-first: generate the SDL"
                zh="code-first:代码生成 SDL"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    You define the types in TypeScript code, and the SDL is
                    exported from it. Pothos is one example. The schema cannot
                    fall out of step with the code, and renaming works across the
                    project in the editor. The cost is that nobody can read the
                    schema until it has been generated. Neither route is the
                    correct one; teams choose by how much they rely on the SDL as
                    a shared document.
                  </>
                }
                zh={
                  <>
                    用 TypeScript 代码定义类型,SDL 由代码导出。Pothos 是一例。
                    schema 不会和代码脱节,重命名也能在编辑器里跨项目完成。
                    代价是:在生成之前,谁也读不到 schema。
                    两条路线没有对错,取决于团队在多大程度上把 SDL
                    当作共用文档来读。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Use 3" zh="用法三" />
            </div>
            <div className="card-title">
              <T
                en="Codegen: the contract becomes client types"
                zh="codegen:契约变成前端类型"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    A tool reads the schema and generates TypeScript types from
                    it. When the server renames a field, the client stops
                    compiling. A broken contract is found by the compiler instead
                    of by a user.
                  </>
                }
                zh={
                  <>
                    工具读取 schema,自动生成 TypeScript 类型。
                    服务器改了字段名,前端立刻编译不过。
                    违约的地方由编译器发现,而不是由用户发现。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <CodeBlock
          lang="js"
          title={{
            en: "Generated TypeScript types (shortened)",
            zh: "codegen 生成的 TS 类型(节选)",
          }}
          code={{
            en: `// Generated by graphql-codegen from blog.graphql. Do not edit by hand.
export type Post = {
  id: string;
  title: string;
  body: string;
  author: User;
  comments: Comment[];
};`,
            zh: `// 由 graphql-codegen 从 blog.graphql 生成,请勿手改。
export type Post = {
  id: string;
  title: string;
  body: string;
  author: User;
  comments: Comment[];
};`,
          }}
          note={{
            en: (
              <>
                The schema is the single source of truth. Change it in one place
                and the client types, the documentation, and the mock data all
                follow. Setting up that pipeline is not part of this chapter; it
                is enough to know that it exists.
              </>
            ),
            zh: (
              <>
                schema 是唯一的事实来源:改一处,前端类型、文档、mock
                数据全都跟着变。这条流水线怎么搭不属于这一章 ——
                知道它存在就够了。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Three tasks: write a schema of your own, ask a public server to describe itself, and judge nullability the way a type checker does.",
          zh: "三个任务:自己写一份契约、让公开的服务器自报家门、再像类型检查器那样判断可空性。",
        }}
      >
        <LabSet ch="schema" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions. Nullability is the one people get wrong, so go back to section 02 if you miss it.",
          zh: "八道题。最容易错的是可空性 —— 错了就回 §02 重看一遍。",
        }}
      >
        <Quiz ch="schema" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                The schema is the contract between client and server. It declares
                which types exist, which fields each type has, and where a value
                may be null. It is written in SDL, and both sides are held to it.
              </>
            ),
            zh: (
              <>
                schema 是客户端与服务器之间的契约:有哪些类型、每个类型有哪些字段、
                哪里可能是 null,全部写明。它用 SDL 写成,两边都要守着它。
              </>
            ),
          },
          {
            en: (
              <>
                Five built-in scalars: <code>Int</code> (32-bit signed),{" "}
                <code>Float</code>, <code>String</code>, <code>Boolean</code>,
                and <code>ID</code>. <code>ID</code> is an opaque key that is
                always serialized as a string, so do not do arithmetic on it.
              </>
            ),
            zh: (
              <>
                内置标量五个:<code>Int</code>(32 位有符号)、<code>Float</code>、
                <code>String</code>、<code>Boolean</code>、<code>ID</code>。
                <code>ID</code> 是一把不透明的钥匙,序列化时一律变成字符串,
                别拿它做算术。
              </>
            ),
          },
          {
            en: (
              <>
                Fields are <b>nullable by default</b>; <code>!</code> is the
                promise. <code>!</code> applies to the type immediately on its
                left, so in <code>[String!]!</code> the inner one covers the
                elements and the outer one covers the list. A null in a non-null
                position moves up to the nearest parent field that allows null.
              </>
            ),
            zh: (
              <>
                字段<b>默认可空</b>,<code>!</code> 才是承诺。<code>!</code>{" "}
                作用于紧挨着它左边的类型 —— 在 <code>[String!]!</code> 里,
                里层管元素,外层管列表本身。非空位置上出现 null 时,
                这个 null 会向上冒泡到最近的、允许为空的父字段。
              </>
            ),
          },
          {
            en: (
              <>
                Types refer to types, so the data forms a graph. That graph is
                the Graph in GraphQL, and it is what lets one query walk several
                levels of related data.
              </>
            ),
            zh: (
              <>
                类型引用类型,数据于是连成一张图。GraphQL 名字里的 Graph
                就是它,「一次查询走多层关联」的底气也是它。
              </>
            ),
          },
          {
            en: (
              <>
                Four more tools: <code>enum</code> for a closed set of values,{" "}
                <code>interface</code> for fields several types share,{" "}
                <code>union</code> for a result that is one of several unrelated
                types, and <code>input</code> for objects sent as arguments.{" "}
                <code>type</code> and <code>input</code> are not
                interchangeable — that is a rule of the specification.
              </>
            ),
            zh: (
              <>
                工具箱还有四件:<code>enum</code> 表示取值只有固定的几种,
                <code>interface</code> 表示多个类型共有的字段,<code>union</code>{" "}
                表示结果是几种互不相干的类型之一,<code>input</code>{" "}
                表示作为参数传入的对象。<code>type</code> 和 <code>input</code>{" "}
                不能互换 —— 这是规范的规定。
              </>
            ),
          },
          {
            en: (
              <>
                Introspection lets the schema describe itself (
                <code>__schema</code>, <code>__type</code>). GraphiQL&apos;s
                documentation and autocomplete come from it. Whether to keep it
                on in production depends on who the API is open to.
              </>
            ),
            zh: (
              <>
                内省让 schema 自我描述(<code>__schema</code>、<code>__type</code>
                )。GraphiQL 的文档面板和自动补全都来自它。
                生产环境要不要开着,取决于这个 API 对谁开放。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="schema" />
    </main>
  );
}
