"use client";

// 第 10 章 · GraphQL 后台与性能:
// 拉开幕布比喻 → resolver 执行模型(树遍历 + parent 接力)→ context 公文包 →
// N+1 灾难(SQL 计数器)→ DataLoader 救场(对照动画)→ 缓存三条出路 →
// 安全与滥用防护 → 动手任务 → 测验 → 要点。

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
        title={
          <>
            GraphQL <span className="grad">后台与性能</span>
          </>
        }
        essence={
          <>
            前三章你一直是坐在桌边点菜的客人。这一章,拉开幕布进后厨 ——
            一句 query 递进去之后,厨房里到底发生了什么,哪口锅最容易着火。
          </>
        }
        chips={[
          { id: "resolver", n: "01", label: "resolver 执行模型" },
          { id: "context", n: "02", label: "context" },
          { id: "nplus1", n: "03", label: "N+1 灾难" },
          { id: "dataloader", n: "04", label: "DataLoader" },
          { id: "caching", n: "05", label: "缓存这道坎" },
          { id: "security", n: "06", label: "安全" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <HeroBackstage />
      </Hero>

      {/* ================= §01 resolver ================= */}
      <Section
        id="resolver"
        index="01"
        title="resolver:每个字段背后都有一个函数"
        desc="GraphQL 服务器的全部秘密就一句话:执行引擎 + 一张「字段 → 函数」的映射表。"
      >
        <p className="sec-desc">
          REST 思维里,一个 URL 对应一个处理函数。GraphQL 把粒度切得细得多:
          <b>schema 里的每个字段,背后都站着一个函数</b>,
          行话叫解析器(resolver)。它的签名固定四个参数:
          <code>(parent, args, context, info)</code> ——
          父字段的返回值、本字段收到的参数、本次请求的公文包(§02)、
          执行现场的元信息(很少用)。执行一条 query,
          就是从 Query 根类型开始的一趟<b>树遍历</b>:
          父字段先跑,它的返回值作为 <code>parent</code> 传给子字段,一层层接力到叶子。
        </p>

        <CodeBlock
          lang="graphql"
          title="schema.graphql · 第 08 章写好的博客契约"
          code={`type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Comment {
  id: ID!
  body: String!
  author: User!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  comments: [Comment!]!
}

type Query {
  post(id: ID!): Post
  posts: [Post!]!
}`}
        />
        <CodeBlock
          lang="js"
          title="resolvers.js · Apollo Server 5 风格"
          hl={[3, 4, 8, 9]}
          code={`const resolvers = {
  Query: {
    post: (parent, args, context) => context.db.findPost(args.id),
    posts: (parent, args, context) => context.db.allPosts(),
  },
  Post: {
    // parent 就是上一层刚查回来的那个 post 对象
    author: (post, args, context) => context.db.findUser(post.authorId),
    comments: (post, args, context) => context.db.commentsOf(post.id),
  },
  // Post.title、Post.body、User.name…… 一个都没写?
  // 没写的字段走「默认 resolver」:直接取 parent 的同名属性。
};

const server = new ApolloServer({ typeDefs, resolvers });`}
          note={
            <>
              <b>默认 resolver</b> 是体力活的救星:数据库查回来的 post
              对象本来就有 title 属性,取一下就完了,犯不着人人手写。
              只有「字段名对不上」或「要计算、要查库」的字段才需要亲自动手 ——
              比如 author 得拿 authorId 去换人。
            </>
          }
        />

        <ResolverTreeViz />
      </Section>

      {/* ================= §02 context ================= */}
      <Section
        id="context"
        index="02"
        title="context:每个请求一份的公文包"
        desc="几十个 resolver 各自为战,总得有个地方放「大家都要用的东西」。"
      >
        <p className="sec-desc">
          <code>context</code> 是<b>每个请求进门时现打包的一份对象</b>,
          这次请求里的所有 resolver 共享它:当前登录的用户、数据库连接、
          待会儿要讲的 DataLoader……全塞这里。注意「每个请求一份」这几个字 ——
          它不跨请求存在,所以放当前用户不会串号,放缓存不会漏数据。
        </p>
        <CodeBlock
          lang="js"
          title="context.js · 打包,然后在 resolver 里用"
          hl={[4, 5, 14, 15]}
          code={`// 建服务器时声明:每个请求进来,现做一份 context
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    const user = await getUserFromToken(req.headers.authorization);
    return { user, db, loaders: makeLoaders() };
  },
});

// 任何 resolver 的第三个参数都是它 —— 比如做权限判断:
const resolvers = {
  Mutation: {
    deletePost: async (parent, { id }, context) => {
      const post = await context.db.findPost(id);
      if (!context.user || context.user.id !== post.authorId) {
        throw new GraphQLError("这篇文章不归你管", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return context.db.deletePost(id);
    },
  },
};`}
          note={
            <>
              第 06 章的认证知识在这接上了:token 在 HTTP header
              里进门,context 函数负责验明正身,resolver 只管问
              「<code>context.user</code> 是谁、有没有资格」。
            </>
          }
        />
      </Section>

      {/* ================= §03 N+1 ================= */}
      <Section
        id="nplus1"
        index="03"
        title="N+1 灾难"
        desc="GraphQL 后台第一大性能刺客。名字听着像数学题,现场看一遍你就再也忘不掉。"
      >
        <p className="sec-desc">
          回看 §01 的 resolver:<code>Post.author</code> 每次执行都单独查一次库。
          单看没有问题 —— 但 query 是 <code>posts {"{ author }"}</code>{" "}
          的时候呢?列表有 N 篇文章,author 的 resolver 就跑 N 次,
          <b>1 次查列表 + N 次查作者</b>。每个 resolver
          都只看得见自己手里的那个 parent,谁也不知道别人在干同样的事。
          盯着右边的计数器,看事故怎么发生:
        </p>

        <SqlCounter />

        <Callout tone="warn" title="真正吓人的不是 101 次,是「零改动引爆」">
          <p>
            REST 里,响应的形状是后端写死的,性能问题上线前多半能撞见。GraphQL
            把「查询的形状」交给了客户端 —— 前端同事哪天在 query 里多勾一个
            <code>{" author { name }"}</code>,你的后端<b>一行代码没改</b>,
            生产库的查询量就翻了倍。灵活是真灵活,账单也是真账单:
            这正是 GraphQL 从客人手里收回的第一笔学费。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 DataLoader ================= */}
      <Section
        id="dataloader"
        index="04"
        title="DataLoader 救场"
        desc="Facebook 开源的几百行小工具,两招拆雷:批处理 + 每请求缓存。"
      >
        <p className="sec-desc">
          思路其实很像食堂打饭:与其每个 resolver 各自跑一趟后厨,
          不如大家把要的菜<b>先报上来</b>,凑一批一起做。
          DataLoader 干的就是这个:resolver 调 <code>load(id)</code>{" "}
          时不真查库,只是登记;等这一轮同步代码跑完(同一个
          tick 结束),它把登记簿上的 id <b>去重、合并</b>,
          一次 <code>batchLoad([9, 12])</code> 全部拿回,再按序分发。
          同一个请求里,<code>load(9)、load(12)、load(9)</code>{" "}
          —— 重复的 9 号连批量查询都不用进,直接吃缓存。
        </p>

        <CodeBlock
          lang="js"
          title="loaders.js · 改动极小"
          hl={[5, 15]}
          code={`import DataLoader from "dataloader";

// batch 函数:进一堆 id,出「同序」的一堆结果
const makeLoaders = () => ({
  user: new DataLoader(async (ids) => {
    const rows = await db.users.whereIdIn(ids);   // 一条 IN 查询
    const byId = new Map(rows.map((u) => [u.id, u]));
    return ids.map((id) => byId.get(id) ?? null); // 必须与 ids 同序等长
  }),
});

// resolver 里:不再直接查库,改成「登记」
const resolvers = {
  Post: {
    author: (post, args, context) => context.loaders.user.load(post.authorId),
  },
};`}
          note={
            <>
              还记得 §02 的 <code>makeLoaders()</code> 是在 context
              里调用的吗?<b>loader 必须每个请求新建一份</b> ——
              它的缓存不会自动过期,做成全局单例,用户 A
              改完名字,用户 B 还在看旧数据。
            </>
          }
        />

        <p className="sec-desc">同一条 query,再跑一遍 —— 这次看计数器停在哪:</p>

        <SqlCounter loader />
      </Section>

      {/* ================= §05 缓存 ================= */}
      <Section
        id="caching"
        index="05"
        title="缓存这道坎"
        desc="第 05 章 REST 白吃的那顿 HTTP 缓存自助餐,GraphQL 进门就被拦下了。三条出路,一条条看。"
      >
        <p className="sec-desc">
          回忆一下 REST 的红利:GET + 每个资源一个 URL,天然就是缓存键 ——
          浏览器、CDN、代理这些「免费劳动力」看一眼 URL
          就知道能不能直接上菜,ETag 一验连响应体都省了。GraphQL 的传统姿势是
          <b>所有查询 POST 到同一个 /graphql,内容藏在 body 里</b>:
          缓存键没了,免费劳动力集体失明,HTTP 缓存基本失灵。
          这不是能绕开的小坑,是架构级的代价 —— 但出路也是真实存在的,有三条。
        </p>

        <div className="bs-way">
          <div className="bs-way-head">
            <span className="bs-way-num">出路 ①</span>
            <h3 className="bs-way-title">客户端规范化缓存</h3>
          </div>
          <p>
            既然中间层指望不上,就把缓存做进客户端。Apollo Client 这类库会按{" "}
            <code>__typename:id</code> 给每个对象发身份证,
            把嵌套响应<b>拆平</b>存进一个本地小数据库:
          </p>
          <NormalizeViz />
        </div>

        <div className="bs-way">
          <div className="bs-way-head">
            <span className="bs-way-num">出路 ②</span>
            <h3 className="bs-way-title">persisted queries:文本换哈希</h3>
          </div>
          <p>
            上一章说过,用了变量之后<b>查询文本是恒定的</b> ——
            那还每次都把几 KB 的文本发一遍干嘛?提前把查询注册到服务器,
            日常请求只发它的 SHA-256 哈希。请求瞬间瘦身,更妙的是:
            哈希 + variables 短到能塞进 URL,于是可以改用 <b>GET</b> ——
            CDN 缓存就这么复活了。
          </p>
          <CodeBlock
            lang="http"
            title="哈希当查询用"
            code={`GET /graphql?extensions={"persistedQuery":{"sha256Hash":"3f2a91c8…"}}&variables={"id":"1"} HTTP/1.1
Host: api.example.com`}
            note={
              <>
                只认注册过的哈希时,它还是一张<b>查询白名单</b> ——
                没登记的恶意查询直接吃闭门羹,§06 会再见到它。
              </>
            }
          />
        </div>

        <div className="bs-way">
          <div className="bs-way-head">
            <span className="bs-way-num">出路 ③</span>
            <h3 className="bs-way-title">GraphQL over HTTP:规范进行时</h3>
          </div>
          <p>
            GraphQL 基金会正在制定 <b>GraphQL over HTTP</b> 规范(仍是草案,
            主流实现已在跟进):标准化了 GET 传参的方式,定义了新媒体类型{" "}
            <code>application/graphql-response+json</code>,
            并且<b>允许请求级错误返回非 2xx 状态码</b>。
            也就是说,「GraphQL 只能 POST、只能 200」这两条老规矩,
            正在成为历史 —— 你在老项目里还会见到它们,但别再把它们当真理。
          </p>
        </div>
      </Section>

      {/* ================= §06 安全 ================= */}
      <Section
        id="security"
        index="06"
        title="安全与滥用防护"
        desc="把查询的形状交给客户端,也就把攻击的形状交给了攻击者。先看恶意查询长什么样。"
      >
        <CodeBlock
          lang="graphql"
          title="一颗小炸弹 · 百来个字节"
          code={`{
  posts {
    comments {
      author {          # 评论的作者
        posts {         # 作者的文章
          comments {    # 文章的评论……
            author {
              posts { title }
            }
          }
        }
      }
    }
  }
}`}
          note={
            <>
              素材就是 schema 里正常的循环引用:Post → Comment → User → Post。
              每深一层,resolver 调用量翻着倍涨 —— 真实案例里,128
              字节的匿名查询烧掉了服务器 10 秒 CPU。REST
              没有这个问题:每个端点返回什么,后端早就写死了。
            </>
          }
        />

        <div className="grid-3" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-kicker">防线 1</div>
            <div className="card-title">深度限制</div>
            <p>
              一刀切住「套娃」层数:超过 7 层?直接拒收,连执行都不开始。
              简单粗暴,五分钟接入(graphql-depth-limit),先把最蠢的攻击挡在门外。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">防线 2</div>
            <div className="card-title">复杂度 / 成本打分</div>
            <p>
              深度浅但列表巨大的查询照样能压垮你 —— 给字段标价:标量 1 分、
              列表按 first 参数乘子选择集,执行前先算总分,超预算就拒绝。
              GitHub 的 rate limit 就是这套思路。动手任务里你会亲自定一次价。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">防线 3</div>
            <div className="card-title">超时兜底</div>
            <p>
              前两道都算不准的漏网之鱼,交给最古老的保险丝:单条查询超过
              N 秒,掐掉。宁可一个用户看到报错,不能让一条查询拖死整台服务器。
            </p>
          </div>
        </div>

        <Callout tone="deep" title="introspection 生产环境关不关?两派都有道理">
          <p>
            <b>关派</b>(Apollo 官方立场,OWASP 也列为加固项):introspection
            把整张 schema 双手奉上,等于给攻击者发地图 —— Apollo Server 在生产
            环境默认就是关的。<b>开派</b>反驳:这只是「靠隐蔽求安全」,
            查询照样能从前端代码里扒出来、能猜出来;GitHub 这样的公开 API
            就大大方方开着。两派其实有共识:<b>真正的硬防线是 persisted queries
            白名单 + 字段级授权</b>,introspection 开关只是锦上添花或聊胜于无。
          </p>
        </Callout>

        <Callout tone="story" title="反方发言:这些账单都是真的">
          <p>
            2024 年有篇流传很广的文章,《Why, after 6 years, I&apos;m over
            GraphQL》(Bessey)—— 作者用了六年 GraphQL 之后公开退坑。
            他抱怨的四件事,恰好就是本章讲的四件:攻击面(那颗 128 字节的炸弹
            就是他的实测)、字段级授权的成本(REST 在端点门口检查一次就行,
            GraphQL 得在每个字段上把关)、N+1、可观测性(几百种 query
            打同一个端点,监控和排障都得换工具)。
          </p>
          <p>
            这些代价都是真的,没必要护短。大厂用 federation、成本分析、
            全套工具链把它们扛住了,换来了那份灵活;小团队接不住这套工具链,
            REST 的朴素反而是福气。<b>没有替代关系,只有取舍</b> ——
            这句话的完整版,终章见。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="三个任务全是后厨视角:数一次 resolver,写一个 batch 函数,再当一回守门人。"
      >
        <LabSet ch="backstage" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="八道题。N+1 计数那道请动笔真算 —— 心算糊弄过去的话,生产库会替你补考。"
      >
        <Quiz ch="backstage" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            每个字段背后一个 resolver:<code>(parent, args, context, info)</code>
            ;执行 = 从 Query 根开始的树遍历,父字段的返回值就是子字段的
            parent;没写的字段走默认 resolver(取 parent 的同名属性)。
          </>,
          <>
            context 是每个请求现打包的公文包:当前用户、数据源、loader
            都放这 —— 「每请求一份」是它不串号、不漏数据的前提。
          </>,
          <>
            N+1:<code>posts {"{ author }"}</code> = 1 次查列表 + N 次查作者;
            客户端改个查询就能在后端零改动的情况下引爆它。
          </>,
          <>
            DataLoader 两招拆雷:同一 tick 的 load() <b>批处理</b>成一次
            IN 查询,重复 id 走<b>每请求缓存</b> —— 计数器从 1+N 降到 2。
          </>,
          <>
            单端点 + POST + 动态 body 让 HTTP 缓存失灵;出路:客户端规范化缓存
            (按 __typename:id 拍平)、persisted queries(文本换哈希,GET 吃
            CDN)、GraphQL over HTTP 规范(非 2xx 正在合法化)。
          </>,
          <>
            灵活是双刃剑:深度限制、复杂度打分、超时三道防线要上齐;
            introspection 开关有争议,persisted queries
            白名单才是硬防线 —— Bessey 们抱怨的代价都是真的,取舍见终章。
          </>,
        ]}
      />

      <ChapterFooter ch="backstage" />
    </main>
  );
}
