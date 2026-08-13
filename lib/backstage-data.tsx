"use client";

// 第 10 章 · GraphQL 后台与性能 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "count-resolvers",
    title: "数 resolver:这条 query 触发几次调用?",
    d: "easy",
    tags: ["resolver", "执行模型"],
    task: (
      <>
        <p>
          纸笔任务。下面这条 query 打到服务器上,假设这篇文章有{" "}
          <b>2 条评论</b>。数一数:总共会触发多少次 resolver 调用?
          (默认 resolver 也算 —— 它也是函数,也要跑。)
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
    hint: (
      <>
        从 Query 根一层层往下数,列表字段要乘以元素个数:comments
        返回 2 条,里面的每个字段就各跑 2 次。
      </>
    ),
    solution: (
      <>
        <p>
          答案是 <b>7 次</b>。逐层拆:
        </p>
        <CodeBlock
          lang="bash"
          title="逐层拆解"
          code={`Query.post          1 次   # 根字段
Post.title          1 次   # 默认 resolver,取 parent.title
Post.author         1 次
User.name           1 次   # 默认 resolver
Post.comments       1 次   # 返回一个 2 条的数组
Comment.body        2 次   # 数组里每条评论各 1 次
------------------------------------------
合计                7 次`}
        />
        <p>
          体会一下「乘法」:comments 要是有 200 条,光 body 就是 200 次调用;
          评论里再嵌一层 <code>author {"{ name }"}</code>,又是 200 × 2 次 ——
          这正是下一个任务(N+1)的伏笔。
        </p>
      </>
    ),
  },
  {
    id: "write-batch",
    title: "亲手写一个 DataLoader 的 batch 函数",
    d: "medium",
    tags: ["DataLoader", "批处理"],
    task: (
      <>
        <p>
          不用真数据库 —— 浏览器 Console 就能做。给你一个假「用户表」,
          请实现 <code>batchUsers(ids)</code>:输入一堆 id,
          返回<b>与 ids 同序</b>的用户数组(这是 DataLoader
          的铁律:第 i 个结果必须对应第 i 个 id,查不到的位置放 null)。
        </p>
        <CodeBlock
          lang="js"
          title="console · 起手代码"
          code={`const DB = {
  7:  { id: 7,  name: "Grace" },
  9:  { id: 9,  name: "Ada" },
  12: { id: 12, name: "Linus" },
};

// 模拟一次「批量 SQL」:乱序返回,还会漏掉查不到的
async function whereIdIn(ids) {
  return [...new Set(ids)]
    .filter((id) => DB[id])
    .reverse()
    .map((id) => DB[id]);
}

async function batchUsers(ids) {
  // 你来实现:返回与 ids 同序的数组,查不到的放 null
}

// 验收:应打印 [Ada, Linus, null, Ada 所在对象]
batchUsers([9, 12, 99, 9]).then(console.log);`}
        />
      </>
    ),
    hint: (
      <>
        数据库不保证返回顺序(上面故意 reverse 了)——
        先把查回来的行按 id 建一张 Map,再照着 ids 的顺序逐个取。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="参考实现"
          code={`async function batchUsers(ids) {
  const rows = await whereIdIn(ids);
  const byId = new Map(rows.map((u) => [u.id, u]));
  return ids.map((id) => byId.get(id) ?? null);
}`}
        />
        <p>
          核心就两步:<b>建索引、按序取</b>。真实项目里把它塞进{" "}
          <code>new DataLoader(batchUsers)</code> 就能用了。
          「同序 + 等长」这条契约之所以重要,是因为 DataLoader
          要把批量结果拆开,一一还给当初调用 <code>load(id)</code>{" "}
          的那些 resolver —— 顺序错位,9 号的文章就挂上 12 号的作者了。
        </p>
      </>
    ),
  },
  {
    id: "cost-budget",
    title: "设计一个复杂度预算",
    d: "hard",
    tags: ["安全", "复杂度分析"],
    task: (
      <>
        <p>
          你是博客 API 的守门人,给字段定价:<b>标量 1 分,对象 2 分,
          列表 = first 参数 × 子选择集总分</b>。预算上限 500 分,超了直接拒绝。
          请给下面两条 query 算总分,判断谁能过、谁被拒:
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
    hint: (
      <>
        从最里层往外算:先算 comments 的子选择集值多少分,
        乘以 10;再把结果算进每篇 post,乘以 20。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="bash"
          title="算分过程"
          code={`Query A:
  post 2 + title 1 + author 2 + name 1        = 6 分   ✓ 放行

Query B(从里往外):
  comments 的子选择集: body 1 + author 2 + name 1 = 4 分
  comments = 10 × 4                            = 40 分
  每篇 post 的子选择集: title 1 + 40            = 41 分
  posts = 20 × 41                              = 820 分  ✕ 拒绝(> 500)`}
        />
        <p>
          两条 query 文本长度差不多,代价差了 100 多倍 ——
          这就是为什么「按请求次数限流」在 GraphQL 里不够用,
          得按<b>代价</b>限。GitHub GraphQL API 的 rate limit
          就是这么算的:每条 query 先估分,再从你的点数余额里扣。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>resolver 函数的四个参数,按顺序是哪一组?</>,
    opts: [
      <>(req, res, next, err)</>,
      <>(parent, args, context, info)</>,
      <>(query, mutation, subscription, schema)</>,
      <>(id, name, email, posts)</>,
    ],
    correct: 1,
    wrong: [
      <>
        那是 Express 中间件的签名 —— REST 路由思维的残影。GraphQL
        的 resolver 不面向「路由」,面向「字段」。
      </>,
      undefined,
      <>这四个是操作类型和类型系统的概念,不是函数参数。</>,
      <>那是博客数据里的字段名 —— 字段的值由 resolver 算出来,不是参数。</>,
    ],
    why: (
      <>
        parent(父字段的返回值)、args(这个字段收到的参数)、
        context(本次请求的公文包)、info(执行现场的元信息,很少用)。
        前三个天天见,背下来。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        执行 <code>{`{ post(id:"1") { author { name } } }`}</code> 时,
        <code>Post.author</code> 这个 resolver 收到的 <code>parent</code>{" "}
        是什么?
      </>
    ),
    opts: [
      <>整个 schema 对象</>,
      <>
        <code>Query.post</code> 刚刚返回的那个 post 对象
      </>,
      <>客户端传来的 variables</>,
      <>永远是 null,parent 只是占位</>,
    ],
    correct: 1,
    wrong: [
      <>
        schema 是类型系统的定义,不在执行现场传来传去 ——
        要拿它得去 info 参数里翻。
      </>,
      undefined,
      <>
        变量的值会出现在 <b>args</b> 里(比如 <code>args.id</code>),
        parent 是执行树上一层的产物,和客户端无关。
      </>,
      <>
        只有<b>根字段</b>的 parent 是空的;往下每一层,parent
        都是上一层 resolver 的返回值 —— 这正是数据一层层往下流的方式。
      </>,
    ],
    why: (
      <>
        执行是树遍历:父字段先跑,它的返回值原封不动地作为子字段的
        parent 传下来。<code>Post.author</code> 拿着{" "}
        <code>parent.authorId</code> 去查人,就是这么接力的。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        schema 里有 <code>title: String!</code>,但 resolvers
        对象里根本没写 <code>Post.title</code>。执行时会发生什么?
      </>
    ),
    opts: [
      <>报错:「字段缺少 resolver」</>,
      <>title 永远返回 null</>,
      <>走默认 resolver:直接从 parent 上取同名属性 parent.title</>,
      <>需要在 schema 里加 @default 指令才行</>,
    ],
    correct: 2,
    wrong: [
      <>
        不报错 —— 要是每个标量字段都得手写一个「取属性」函数,
        没人受得了这个体力活。
      </>,
      <>
        只要 parent(post 对象)身上真有 title 属性,就能取到值 ——
        返回 null 的前提是属性不存在。
      </>,
      undefined,
      <>没有这个指令 —— 默认行为是内置的,零配置。</>,
    ],
    why: (
      <>
        没写 resolver 的字段走<b>默认 resolver</b>:从 parent
        上取同名属性。所以只有「字段名和数据属性对不上」或
        「需要计算/查库」的字段才需要手写 —— 比如{" "}
        <code>author</code> 要拿 authorId 换人。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        query 是 <code>{`{ posts { title author { name } comments { body } } }`}</code>
        ,posts 返回 3 篇文章;<code>author</code> 和 <code>comments</code> 的
        resolver 各自单独查一次数据库。最坏情况下总共几次数据库查询?
      </>
    ),
    opts: [<>3 次</>, <>4 次</>, <>7 次</>, <>9 次</>],
    correct: 2,
    wrong: [
      <>
        少算了:posts 本身 1 次,然后<b>每篇</b>文章的 author 各 1 次、
        comments 各 1 次 —— 列表字段是乘法,不是加法。
      </>,
      <>
        4 次是只嵌套 author 时的账(1 + 3)。这条 query 里 comments
        也在每篇文章上各查一次,还得加 3。
      </>,
      undefined,
      <>
        多算了:comments 的 resolver 一次把该文章的所有评论查回来,
        body 走默认 resolver 不碰数据库,不用按评论条数再乘。
      </>,
    ],
    why: (
      <>
        posts 1 次 + author 3 次 + comments 3 次 = <b>7 次</b>,也就是 1 + 2N。
        这就是 N+1 的账:文章涨到 100 篇,查询就是 201 次 ——
        而且客户端只要多勾一个嵌套字段,后端零改动就被引爆。
      </>
    ),
  },
  {
    type: "multi",
    q: <>DataLoader 靠哪两大机制拆掉 N+1 这颗雷?(多选)</>,
    opts: [
      <>批处理:同一轮事件循环里的多次 load(id),合并成一次 batch 查询</>,
      <>每请求缓存:同一个请求里重复的 id,只查一次</>,
      <>自动给数据库加索引</>,
      <>把 SQL 数据库换成 NoSQL</>,
    ],
    correct: [0, 1],
    missHint: (
      <>
        还漏了一个 —— 想想 <code>load(9)、load(12)、load(9)</code>{" "}
        这串调用:除了「合并」,那个重复的 9 号还享受了什么待遇?
      </>
    ),
    extraHint: (
      <>
        多选了 —— DataLoader 是个只有几百行的调度小工具,
        不碰你的数据库选型,更不会替你建索引。
      </>
    ),
    why: (
      <>
        <b>批处理</b>把「每人各查各的」变成「攒一批一起查」,
        <b>每请求缓存</b>让重复的 id 连批量查询都不用进 ——
        load(9)、load(12)、load(9) 最终只发一条{" "}
        <code>WHERE id IN (9, 12)</code>。缓存的生命周期是「一次请求」,
        请求结束就扔,不存在跨用户串数据的问题。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        第 05 章里 REST 靠 ETag、Cache-Control 白吃了一路 HTTP 缓存红利。
        GraphQL 为什么吃不到?
      </>
    ),
    opts: [
      <>GraphQL 的响应格式浏览器不认识</>,
      <>
        传统上单端点 + POST + 每次 body 都不一样 ——
        URL 没法再当缓存键,中间层缓存集体失明
      </>,
      <>GraphQL 走的不是 HTTP,缓存机制天然不适用</>,
      <>GraphQL 响应太大,缓存放不下</>,
    ],
    correct: 1,
    wrong: [
      <>
        响应就是普通 JSON,浏览器认得很。问题出在<b>请求</b>这一侧:
        缓存靠什么当键?
      </>,
      undefined,
      <>
        GraphQL 绝大多数时候就跑在 HTTP 上 —— 正因为如此,
        「明明在 HTTP 上却用不上 HTTP 缓存」才格外可惜。
      </>,
      <>
        大小不是问题,CDN 天天缓存几 MB 的图片。
        问题是 POST + 动态 body 让缓存根本认不出「这是同一个请求」。
      </>,
    ],
    why: (
      <>
        HTTP 缓存的世界观是「GET + URL = 缓存键」。GraphQL 传统姿势是所有查询都
        POST 到同一个 /graphql,查询内容藏在 body 里 ——
        浏览器、CDN、代理这些「免费劳动力」全都看不懂,只能干瞪眼。
      </>
    ),
  },
  {
    type: "choice",
    q: <>persisted queries(持久化查询)带来的核心好处是哪组?</>,
    opts: [
      <>让查询执行得更快,因为服务器提前编译成了机器码</>,
      <>
        查询文本换成 SHA-256 哈希:请求变小、能改用 GET 吃 CDN 缓存、
        配成白名单还能当安全防线
      </>,
      <>让客户端不用再写查询,服务器自动猜你要什么</>,
      <>把查询结果永久存进数据库,再也不用重新执行</>,
    ],
    correct: 1,
    wrong: [
      <>
        「编译成机器码」纯属想象 —— 服务器顶多缓存一下解析结果,
        执行该跑的 resolver 一个不少。收益在传输和缓存,不在执行。
      </>,
      undefined,
      <>
        查询还是你写的,只是<b>注册</b>到了服务器,日常请求里用哈希指代它 ——
        没有任何「猜」的成分。
      </>,
      <>
        persisted 的是<b>查询文本</b>,不是查询结果 ——
        数据每次照常现算,新鲜度不受影响。
      </>,
    ],
    why: (
      <>
        文本换哈希,一石三鸟:请求体从几 KB 缩成几十字节;
        哈希 + variables 塞进 URL 就能走 GET,CDN 缓存复活;
        服务器只认注册过的哈希时,顺手就是一张查询白名单 ——
        没注册的恶意查询直接吃闭门羹。
      </>
    ),
  },
  {
    type: "choice",
    q: <>查询深度限制(depth limit)防的是哪种攻击?</>,
    opts: [
      <>SQL 注入</>,
      <>
        利用类型之间的循环引用(文章 → 作者 → 文章 → …)构造深层嵌套查询,
        指数级放大执行量,打爆 CPU 和数据库
      </>,
      <>暴力破解用户密码</>,
      <>防止响应 JSON 缩进太深,前端解析不了</>,
    ],
    correct: 1,
    wrong: [
      <>
        SQL 注入靠参数化/变量来防(第 09 章讲过)。深度限制针对的是
        「查询本身合法,但执行代价爆炸」的另一类攻击。
      </>,
      undefined,
      <>
        破解密码打的是登录接口,限流和锁定来管。深度限制管的是
        query 的<b>形状</b>。
      </>,
      <>
        JSON.parse 不在乎嵌套深浅,几十层眼都不眨。
        遭殃的是服务器 —— 每深一层,resolver 调用量就翻着倍涨。
      </>,
    ],
    why: (
      <>
        schema 里 Post.author 指向 User,User.posts 又指回 Post ——
        循环引用是正常设计,但也给了攻击者素材:百来字节的嵌套查询就可能
        让服务器烧掉几十秒 CPU。深度限制直接限制嵌套的层数,
        配合复杂度打分和超时,才算把门守住。
      </>
    ),
  },
];
