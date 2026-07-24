"use client";

// 第 08 章 · Schema 与类型系统:
// 一纸契约比喻 → SDL 初见(完整博客 schema)→ 标量与修饰符(默认可空 + ModifierLab)→
// 关联与图(SchemaGraph)→ 类型工具箱(enum/interface/union/input)→
// 内省 → 契约怎么用 → 动手任务 → 测验 → 要点。

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
import { ScHeroContract, ModifierLab, SchemaGraph } from "./viz";

export default function SchemaPage() {
  return (
    <main className="page" data-ch="schema">
      <Hero
        ch="schema"
        title={
          <>
            Schema 与<span className="grad">类型系统</span>
          </>
        }
        essence={
          <>
            前端后端各干各的,靠什么不打架?靠一份写清楚「有什么数据、
            长什么样」的合同。这一章教你读懂它,然后亲手写一份。
          </>
        }
        chips={[
          { id: "sdl", n: "01", label: "SDL 初见" },
          { id: "scalars", n: "02", label: "标量与修饰符" },
          { id: "graph", n: "03", label: "关联与图" },
          { id: "toolbox", n: "04", label: "类型工具箱" },
          { id: "introspection", n: "05", label: "内省" },
          { id: "contract", n: "06", label: "契约怎么用" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <ScHeroContract />
      </Hero>

      {/* ================= §01 SDL 初见 ================= */}
      <Section
        id="sdl"
        index="01"
        title="SDL 初见:把博客写成一纸契约"
        desc="还是那套博客数据:用户、帖子、评论。上一章你对它点过菜,这一章看菜单是怎么印出来的。"
      >
        <Callout tone="story" title="没有契约的日子">
          <p>
            前端:「作者头像字段到底叫 avatar 还是 avatarUrl?」后端:「看代码。」
            前端:「评论会不会是 null?」后端:「应该……不会吧。」——
            每个「应该」都是一个上线后的 bug。
          </p>
          <p>
            GraphQL 的解法是把这些问题<b>一次性写成白纸黑字</b>:一份 schema,
            用 SDL(Schema Definition Language,模式定义语言)写成,
            服务器有什么数据、每个字段什么类型、哪里可能为
            null,全部写明,谁也不用猜。
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
          note={
            <>
              细看高亮的 Query:<code>post(id: ID!): Post</code> 的返回值
              没带感叹号 —— 查一篇不存在的帖子拿到 null 是正常业务;而{" "}
              <code>posts</code> 带了,列表永远在(顶多是空的)。
              这种「可空性即业务语义」§02 细讲。
            </>
          }
        />

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">type Query</div>
            <div className="card-title">查询的大门</div>
            <p>
              所有读操作都从这里进。REST 里的一堆 GET 端点,
              在这里变成了 Query 上的一个个字段 —— 上一章「路由去哪了」的答案。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">type User / Post / Comment</div>
            <div className="card-title">数据的名词表</div>
            <p>
              每个 type 描述一种数据长什么样,有点像 TypeScript 的
              interface —— 区别是这份定义前后端共用,不是前端一厢情愿。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">name: String!</div>
            <div className="card-title">字段 = 名字 + 类型</div>
            <p>
              冒号左边字段名,右边类型。类型可以是标量,也可以是另一个
              type —— 类型引用类型,关联就是这么连起来的(§03)。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">! 和 [ ]</div>
            <div className="card-title">两个小符号,一整节的戏</div>
            <p>
              <code>!</code> 表示不许为 null,<code>[ ]</code> 表示列表。
              别看个头小,GraphQL 最著名的反直觉设定就藏在它们身上,§02 见。
            </p>
          </div>
        </div>

        <Callout tone="idea" title="这份文件,前后端各执一份">
          <p>
            前端拿它校验查询、生成类型;后端拿它对齐每个字段的实现。
            想改字段?先改契约 —— 工具立刻把两边不匹配的地方标红。
            <b>本来要靠开会和猜的事,变成了编译错误</b>,这就是 schema 的价值。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 标量与修饰符 ================= */}
      <Section
        id="scalars"
        index="02"
        title="标量与修饰符:类型系统的原子"
        desc="拆到不能再拆的值叫标量(scalar)。内置的一共五个,一张表背下来。"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>标量</th>
                <th>装什么</th>
                <th>例子</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Int</b>
                </td>
                <td>32 位有符号整数</td>
                <td>
                  <code>42</code>
                </td>
              </tr>
              <tr>
                <td>
                  <b>Float</b>
                </td>
                <td>双精度浮点数</td>
                <td>
                  <code>3.14</code>
                </td>
              </tr>
              <tr>
                <td>
                  <b>String</b>
                </td>
                <td>UTF-8 字符串</td>
                <td>
                  <code>&quot;hello&quot;</code>
                </td>
              </tr>
              <tr>
                <td>
                  <b>Boolean</b>
                </td>
                <td>真 / 假</td>
                <td>
                  <code>true</code>
                </td>
              </tr>
              <tr>
                <td>
                  <b>ID</b>
                </td>
                <td>
                  唯一标识,<b>序列化时一律变成字符串</b>
                </td>
                <td>
                  <code>&quot;9&quot;</code>(后端存的是数字 9 也一样)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="sec-desc">
          ID 值得多说两句:它长得像 String,但语义不同 ——
          它说的是「这是一把用来定位对象的钥匙」。钥匙里刻的是自增数字还是
          UUID 无所谓,你不该拿它做数学运算,拿着它能换回对象就行。
          还有个常见问题:日期呢?内置没有 —— 要么先用 String 顶着,
          要么自定义标量(生态里 <code>DateTime</code> 很常见),
          知道有这回事就够了。
        </p>

        <Callout tone="warn" title="反直觉预警:GraphQL 字段默认可空">
          <p>
            TypeScript、Java 里类型默认非空,GraphQL 正好反过来:
            <b>不写 <code>!</code> 的字段,随时可能给你 null</b>。
            这是故意的 —— 后端某个字段的数据源挂了,可以只让这个字段为 null,
            其他字段照常返回,不必整个请求陪葬(「部分成功」,第 09 章细讲)。
          </p>
          <p>
            代价是前端得处处判空。所以真实项目的 schema 里,
            拿得准的字段都会郑重地戴上 <code>!</code> —— 每个感叹号都是一句
            「我保证」。
          </p>
        </Callout>

        <p className="sec-desc">
          <code>!</code>(Non-Null,非空)和 <code>[ ]</code>(List,列表)
          可以组合,一共四种写法 —— 全在下面这台机器里,点谁讲谁:
        </p>

        <ModifierLab />
      </Section>

      {/* ================= §03 关联与图 ================= */}
      <Section
        id="graph"
        index="03"
        title="关联与图:GraphQL 的 Graph 是怎么来的"
        desc="类型引用类型:Post.author 是 User,User.posts 是 [Post!]! —— 谁指向谁,连出一张网。"
      >
        <SchemaGraph />
        <Callout tone="idea" title="从「表思维」换到「图思维」">
          <p>
            REST 把世界切成一张张资源表,表和表之间靠你手动 join(再发一次请求);
            GraphQL 把世界看成一张图:<b>类型是点,字段是边</b>。
            查询就是从 Query 出发,在图上走一条你自己画的路线 ——
            「这篇帖子的作者的其他帖子的评论」,一笔就能画到。
            上一章那句「一次说清」,底气全在这张图上。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 类型工具箱 ================= */}
      <Section
        id="toolbox"
        index="04"
        title="类型工具箱:enum、interface、union、input"
        desc="type 和标量是主力,这四件是特种工具 —— 每件配一段代码和一句「什么时候用它」。"
      >
        <h3 className="sc-tool-h">
          <span className="mono">enum</span> · 枚举:选项焊死在契约里
        </h3>
        <CodeBlock
          lang="graphql"
          title="enum · 枚举(enumeration)"
          code={`enum PostStatus {
  DRAFT      # 草稿
  PUBLISHED  # 已发布
  ARCHIVED   # 已归档
}

type Post {
  status: PostStatus!
}`}
          note={
            <>
              什么时候用它:值只可能是有限的几种,而且拼错要命 ——
              写成 <code>PUBLISH</code>?查询阶段直接报错,根本到不了数据库。
              用 String 存状态的项目,迟早会为一个错别字加班。
            </>
          }
        />

        <h3 className="sc-tool-h">
          <span className="mono">interface</span> · 接口:一份字段合同
        </h3>
        <CodeBlock
          lang="graphql"
          title="interface · 接口"
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
          note={
            <>
              什么时候用它:一批类型天生共享同一组字段,而且你想「一视同仁」
              地处理它们 —— 比如「凡是有全局 id 的东西,都能用一个入口查回来」。
              实现者必须把合同里的字段一个不落地写全。
            </>
          }
        />

        <h3 className="sc-tool-h">
          <span className="mono">union</span> · 联合:候选名单
        </h3>
        <CodeBlock
          lang="graphql"
          title="union · 联合(union type)"
          code={`union SearchResult = Post | User

type Query {
  search(keyword: String!): [SearchResult!]!
}

# 查询时用内联片段,按类型分头拿字段:
# {
#   search(keyword: "graphql") {
#     ... on Post { title }
#     ... on User { name }
#   }
# }`}
          note={
            <>
              什么时候用它:结果可能是几种<b>完全不同</b>的类型,
              且它们不必有任何公共字段 —— 搜索结果、混合消息流。
              和 interface 的分界线就在这:interface 立合同,union 只开名单。
            </>
          }
        />

        <h3 className="sc-tool-h">
          <span className="mono">input</span> · 输入类型:参数的专用包装
        </h3>
        <CodeBlock
          lang="graphql"
          title="input · 输入类型(input type)"
          code={`input CreatePostInput {
  title: String!
  body: String!
  status: PostStatus = DRAFT   # 参数可以带默认值
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
}`}
          note={
            <>
              什么时候用它:写操作要传一整包数据的时候。规范规定 type 只能
              「出」、input 只能「进」,两个世界不许混用 —— 所以输出类型可以
              随便加关联字段,而输入永远干干净净。第 09 章的 mutation 全靠它,
              这里先递个眼神。
            </>
          }
        />
      </Section>

      {/* ================= §05 内省 ================= */}
      <Section
        id="introspection"
        index="05"
        title="内省:会自我介绍的 API"
        desc="上一章欠的账今天还:GraphiQL 的文档面板和自动补全,到底是哪来的?"
      >
        <p className="sec-desc">
          答案:<b>内省(introspection)</b>。schema 不只是给人看的文档,
          它本身就存在服务器里,而且可以<b>用 GraphQL 查 GraphQL</b> ——
          以 <code>__</code>(双下划线)开头的元字段,专门负责让 schema
          自报家门:
        </p>

        <CodePair
          left={
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
          }
          right={
            <CodeBlock
              lang="json"
              title="响应(节选)"
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
          就这么一句,整个类型系统的名单全回来了;再配上{" "}
          <code>__type(name: &quot;Post&quot;)</code>{" "}
          这样的深挖,字段、参数、说明文档一样不缺。GraphiQL
          启动时干的第一件事就是发内省查询,然后拿结果画出文档面板、
          喂给自动补全 —— <b>工具生态的一切便利,地基都是内省</b>。
        </p>

        <Callout tone="deep" title="生产环境要不要关掉内省?两派都有道理">
          <p>
            <b>关派</b>:内省等于把菜单挂在门口,方便你也方便攻击者摸清攻击面 ——
            Apollo Server 在生产模式下默认关闭,OWASP 也把它列为加固项。
            <b>开派</b>:GitHub 这类公开 API 就大方开着 —— 文档本身就是产品,
            靠藏菜单挡不住真正的坏人,真正的防线是查询白名单和字段级授权。
            谁对?看你的 API 是「对内」还是「对外」—— 细节第 10 章算总账。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 契约怎么用 ================= */}
      <Section
        id="contract"
        index="06"
        title="契约怎么用:签完合同,各自开工"
        desc="schema 不是写完就供起来的 —— 它是工作流的中心。三种用法,一瞥即可。"
      >
        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">用法一</div>
            <div className="card-title">前后端并行开发</div>
            <p>
              schema 定稿那天,前端就能拿 mock 数据(按契约伪造的假响应)
              开写界面,后端慢慢填真实现 —— 谁也不用等谁,联调那天照着契约对表。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">用法二 · 路线 A</div>
            <div className="card-title">schema-first:先写 SDL</div>
            <p>
              人手写 <code>.graphql</code> 文件,再补每个字段的实现。
              代表:GraphQL Yoga + SDL。契约就是源码,评审时人人能读。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">用法二 · 路线 B</div>
            <div className="card-title">code-first:代码生成 SDL</div>
            <p>
              用 TypeScript 代码定义类型,SDL 自动导出。代表:Pothos。
              类型安全拉满,重构跟着 IDE 走 —— TS 全栈团队的心头好。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">用法三</div>
            <div className="card-title">codegen:契约变前端类型</div>
            <p>
              工具读取 schema,自动生成 TypeScript 类型 —— 后端改个字段,
              前端编译立刻飘红。合同违约,当场被抓。
            </p>
          </div>
        </div>

        <CodeBlock
          lang="js"
          title="codegen 生成的 TS 类型(节选,感受一下即可)"
          code={`// 由 graphql-codegen 从 blog.graphql 自动生成 —— 别手改
export type Post = {
  id: string;
  title: string;
  body: string;
  author: User;
  comments: Comment[];
};`}
          note={
            <>
              schema 是唯一事实来源:改一处,前端类型、文档、mock 全部跟着变。
              工程化细节不属于这一章 —— 知道这条流水线存在,就够了。
            </>
          }
        />
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="三个任务:签一份自己的契约、让服务器自报家门、再当一回可空性侦探。"
      >
        <LabSet ch="schema" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="八道题,考的全是本章的硬骨头 —— 尤其是可空性,错了回 §02 重修。"
      >
        <Quiz ch="schema" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            schema 是前后端的一纸契约:有什么数据、长什么样、哪里可能为 null,
            全部写成白纸黑字 —— 靠猜的事变成编译错误。
          </>,
          <>
            内置标量五件套:Int、Float、String、Boolean、ID;
            ID 是序列化成字符串的「不透明钥匙」,别拿它算数。
          </>,
          <>
            反直觉铁律:字段<b>默认可空</b>,<code>!</code> 才是承诺;
            修饰符从里往外读 —— 里层 ! 管元素,外层 ! 管列表。
          </>,
          <>
            类型引用类型,数据连成一张图 —— GraphQL 的 Graph 就是它,
            「一次查询走多层关联」的底气也是它。
          </>,
          <>
            工具箱四件:enum 焊死选项、interface 立字段合同、union 开候选名单、
            input 专管入参。
          </>,
          <>
            内省让 schema 自报家门(<code>__schema</code>/<code>__type</code>)——
            GraphiQL 的文档和补全全靠它;生产环境开或关,取决于 API 对谁开放。
          </>,
        ]}
      />

      <ChapterFooter ch="schema" />
    </main>
  );
}
