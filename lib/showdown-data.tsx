"use client";

// 终章 · 动手任务 LABS + 终极测验 QUIZ 数据。
// 测验横跨全书 12 章,难度比章测高一档;每个错误选项都有针对性纠错。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "pick-three",
    title: "选型三连:给三个产品当一回架构师",
    d: "medium",
    tags: ["选型", "架构"],
    task: (
      <>
        <p>
          给下面三个虚构产品各下一个判决(REST / GraphQL / tRPC / gRPC /
          混合都行),每个写三句理由 —— 别拍脑袋,回到 §02
          决策室的五个问题挨个过:
        </p>
        <p>
          <b>A.</b> 独立开发者的菜谱 App:就你一个人,一个 Web 前端 +
          一个小后端,都用 TypeScript。
          <br />
          <b>B.</b> 银行对外开放平台:上百家第三方机构接入,合规审计严格,
          接口十年不能乱动。
          <br />
          <b>C.</b> 电商中台:App、Web、小程序、TV、POS 收银机…… 20
          种客户端形态,后端几十个微服务。
        </p>
      </>
    ),
    hint: (
      <>
        每个产品先问:给谁用?几种端?团队什么形状?—— 三个答案一出,
        判决基本就写完了。别忘了「混合」也是正经选项。
      </>
    ),
    solution: (
      <>
        <p>
          <b>A:REST,或 tRPC。</b>单前端没有 GraphQL 的任何痛点,REST
          起步零成本;既然全栈都是 TS 同一个人写,tRPC
          的端到端类型直通更省心 —— 改个函数签名,前端立刻报错。
          这个规模上 GraphQL,固定成本(缓存自建、限深、授权)没人摊。
        </p>
        <p>
          <b>B:REST + OpenAPI。</b>第三方接入要的是最大公约数:
          版本化策略、状态码语义、网关限流、审计日志,全是 REST
          生态的成熟件;GraphQL 的「任意组合查询」对银行反而是合规和安全噩梦 ——
          攻击面和字段级授权在监管眼里全是风险点。
        </p>
        <p>
          <b>C:GraphQL 当聚合层,内部互调配 gRPC。</b>20
          种端各要各的形状,正是「一张 schema 各自点菜」的主场,
          微服务群靠联邦(federation)分团队共建;文件上传、支付回调这类端点
          保留 REST —— 标准的混合架构,Netflix、Shopify 都是这个方向的活例子。
        </p>
      </>
    ),
  },
  {
    id: "github-dual",
    title: "GitHub 双轨实测:一个数字要花多少字节",
    d: "medium",
    tags: ["REST", "GraphQL", "GitHub"],
    task: (
      <p>
        打开浏览器 Console,匿名请求{" "}
        <code>https://api.github.com/repos/facebook/react</code>。
        你真正想要的只有一个数字:star 数(
        <code>stargazers_count</code>)。量一量整个响应有多少个字符,
        再写出「只要这一个字段」的等价 GraphQL 查询 ——
        GitHub 的 GraphQL 必须带 token(匿名配额为 0),所以只写不跑。
      </p>
    ),
    hint: (
      <>
        先 <code>res.text()</code> 拿原始文本量长度,再{" "}
        <code>JSON.parse</code> 取字段 —— 别 fetch 两次,匿名配额一小时只有 60
        发,省着点用。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console · REST 匿名可调"
          code={`const res = await fetch("https://api.github.com/repos/facebook/react");
const text = await res.text();      // 先拿原始文本,量体重
console.log(text.length);           // 约 6000 个字符
const repo = JSON.parse(text);
console.log(repo.stargazers_count); // 你要的其实只有这一个数字`}
        />
        <CodeBlock
          lang="graphql"
          title="等价的 GraphQL(只写不跑)"
          code={`# POST https://api.github.com/graphql
# 必须带 Authorization: Bearer <token> —— 匿名配额为 0
query {
  repository(owner: "facebook", name: "react") {
    stargazerCount
  }
}`}
          note={
            <>
              体会一下这组对比:REST 为一个数字端上来整只仓库对象(约 6KB),
              但匿名就能吃;GraphQL 一口就是一口,但先验明正身 ——
              任意组合的查询,服务器必须知道找谁算账。取舍,处处是取舍。
            </>
          }
        />
      </>
    ),
  },
  {
    id: "twelve-lights",
    title: "毕业典礼:点亮侧栏全部十二盏绿灯",
    d: "hard",
    tags: ["毕业", "全书"],
    task: (
      <p>
        看一眼侧栏:十二章,每章一盏灯,测验全对才亮。还有暗着的?
        回去把那一章的测验拿下 —— 错了就读纠错讲解,读完重做,直到全对。
        本章下面的终极测验(§07)也算在内。全亮,才算毕业。
      </p>
    ),
    hint: (
      <>
        从错得最多的那章开始 —— 那里才是复习收益最大的地方。
        §05 的卡片墙每章都留了传送门。
      </>
    ),
    solution: (
      <p>
        这题没有代码。进度都存在浏览器的 localStorage 里(
        <code>apier-*</code> 前缀的键),换浏览器不带走,所以就在这台机器上
        打完这场仗。十二盏全亮的那一刻,截个图 —— 从「API
        是什么都不知道」到「能替团队做选型」,这张图就是证书。
      </p>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        深夜,支付服务超时了,网关想自动重试刚才那个请求。按 HTTP
        语义,下面哪组方法可以放心重试(全部幂等)?
      </>
    ),
    opts: [
      <>GET、PUT、DELETE</>,
      <>GET、POST、PUT</>,
      <>POST、PATCH、DELETE</>,
      <>只有 GET,别的都不行</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        POST 混进来了 —— 重试一次 POST 就可能多创建一笔订单、多扣一次款,
        它是最典型的非幂等方法。
      </>,
      <>
        POST 和 PATCH 都不承诺幂等:POST 重复创建;PATCH 如果是「余额
        +10」这种相对补丁,执行两次结果就变了。
      </>,
      <>
        太保守了。PUT 整体替换,执行一次和十次结果相同;DELETE 删一次和删十次,
        资源都是「没了」—— 都幂等。幂等看的是服务器状态,不是第二次返回的 404。
      </>,
    ],
    why: (
      <>
        幂等 = 同一请求执行 1 次和 N 次,服务器状态的副作用相同(RFC 9110)。
        GET/HEAD/OPTIONS 安全且幂等,PUT/DELETE 幂等,POST/PATCH 不承诺 ——
        所以非幂等操作要安全重试,得配 Idempotency-Key(第 05 章)。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        用户登录后把页面开了一整夜,token 早过期了。早上他点「我的订单」,
        服务器最该回什么?
      </>
    ),
    opts: [
      <>
        200,响应体里写 <code>{'{ "error": "token expired" }'}</code>
      </>,
      <>
        401 Unauthorized,带上 <code>WWW-Authenticate</code> 头
      </>,
      <>403 Forbidden</>,
      <>404 Not Found</>,
    ],
    correct: 1,
    wrong: [
      <>
        「恒 200、错误塞 body」是 REST 反模式 —— 缓存、监控、网关全会把它
        当成功处理。(GraphQL 传统上确实这么干,但那是另一套约定,别搬过来。)
      </>,
      undefined,
      <>
        403 是「我知道你是谁,但你没权限」。token 过期意味着服务器
        <b>不再确定你是谁</b> —— 先重新证明身份,这是 401 的领地。
      </>,
      <>
        订单好端端在那儿,不是找不到。404 有时被用来掩盖 403(不泄露资源
        存在性),但从不用来表示「凭证过期」。
      </>,
    ],
    why: (
      <>
        401 = 认证问题(没带、带错、过期 —— 重新登录能解决);403 =
        授权问题(身份明确但不许进)。名字叫 Unauthorized、实际意思是
        Unauthenticated,HTTP 史上最著名的命名事故,毕业前最后背一次。
      </>
    ),
  },
  {
    type: "choice",
    q: <>Fielding 论文里的 REST 六大约束,不包括下面哪一条?</>,
    opts: [
      <>无状态(Stateless)</>,
      <>统一接口(Uniform Interface)</>,
      <>必须使用 JSON 作为数据格式</>,
      <>分层系统(Layered System)</>,
    ],
    correct: 2,
    wrong: [
      <>
        无状态是六约束之一:每个请求自带全部上下文,会话状态放客户端 ——
        JWT 能火,一半功劳归它。
      </>,
      <>
        统一接口恰恰是 REST 区别于其他架构风格的核心约束,HATEOAS
        就是它的四个子约束之一。
      </>,
      undefined,
      <>
        分层系统在列:客户端不需要知道中间隔了几层代理网关 —— CDN
        能随手插进来,靠的就是它。
      </>,
    ],
    why: (
      <>
        六约束:客户端-服务器、无状态、可缓存、统一接口、分层系统、
        按需代码(唯一可选)。REST 对数据格式只字未提 —— JSON 是业界的默契,
        不是 REST 的规定。「REST = JSON over HTTP」是全书第一大误区,
        毕业前最后拆一次。
      </>
    ),
  },
  {
    type: "choice",
    q: <>「取 42 号用户已支付的订单」,哪个设计最经得起同行评审?</>,
    opts: [
      <>
        <code>POST /getUserPaidOrders</code>
      </>,
      <>
        <code>GET /users/42/orders?status=paid</code>
      </>,
      <>
        <code>{"GET /api/orders/getByUser?uid=42&paid=true"}</code>
      </>,
      <>
        <code>GET /users/42/paid-orders-list</code>
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        动词进了 URL,还用 POST 做读取 —— HTTP 方法本身就是动词,GET
        已经在说「取」,URL 只该回答「取什么」。
      </>,
      undefined,
      <>
        getByUser 还是动词;而且「谁的订单」这种从属关系,放路径(
        <code>/users/42/orders</code>)比塞进查询参数清楚得多。
      </>,
      <>
        paid-orders-list 把过滤条件焊死在了资源名里 —— 明天要「未支付的」
        怎么办,再造一个资源?过滤是查询参数的活,资源名保持干净。
      </>,
    ],
    why: (
      <>
        四条口诀:名词复数表集合,路径层级表从属,过滤排序分页交给查询参数,
        动作交给方法。背下来,九成的 URL 评审都能应付。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        信息流表有上亿行,用户会无限下滑。
        <code>{"?page=50000&per_page=20"}</code> 这种 offset
        分页会出什么事,该换成什么?
      </>
    ),
    opts: [
      <>没事,数据库会自动优化深翻页</>,
      <>
        深翻页越来越慢,且中途插入新数据会重复/漏条 ——
        换成 cursor(游标)分页
      </>,
      <>问题只是参数太长,改成 POST 传参就好</>,
      <>offset 反而更快,不用换</>,
    ],
    correct: 1,
    wrong: [
      <>
        OFFSET 1000000 意味着数据库要老老实实数完前一百万行再扔掉 ——
        这是实打实的执行代价,没有魔法能免。
      </>,
      undefined,
      <>
        换传参方式不改变执行方式,数据库照样数一百万行;POST 反而把 GET
        的缓存红利也搭进去了。
      </>,
      <>
        方向反了:offset 的成本随深度线性增长;cursor 是「从上次那条之后再给
        20 条」,再深都是一次索引定位。
      </>,
    ],
    why: (
      <>
        cursor 分页(Stripe 的 starting_after、GraphQL 的 Relay
        Connections)记住「上次读到哪」,天然免疫深翻页塌陷和插入漂移 ——
        无限滚动场景的标准答案。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        同事把用户的身份证号放进了 JWT 的 payload,理由是「JWT
        有签名,很安全」。问题出在哪?
      </>
    ),
    opts: [
      <>没问题,签名会把 payload 加密</>,
      <>
        payload 只是 Base64URL 编码,谁拿到 token 谁就能解码看明文 ——
        签名防篡改,不防偷看
      </>,
      <>JWT 不允许存自定义字段</>,
      <>身份证号太长,超出 JWT 的长度限制</>,
    ],
    correct: 1,
    wrong: [
      <>
        这正是最危险的误解:签名(第三段)只保证内容没被改过;前两段是标准
        Base64URL,往 jwt.io 一粘立刻现原形。
      </>,
      undefined,
      <>
        payload 随便加自定义字段(claims),问题从来不是「能不能存」,
        是「该不该存」。
      </>,
      <>
        规范没有长度限制(太长只是让每个请求变肥)。真正的红线是:payload
        对任何持有者可读,敏感数据一律不进。
      </>,
    ],
    why: (
      <>
        JWT = header.payload.signature,前两段都是可逆的 Base64URL 编码。
        它解决的是「验明正身 + 防篡改」,不负责保密 —— 敏感信息要么不放,
        要么只放个 ID,回数据库查。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        schema 里写着 <code>author: User</code>(没有感叹号)。
        这对客户端意味着什么?
      </>
    ),
    opts: [
      <>author 保证有值,放心用</>,
      <>
        author 可能是 null —— GraphQL 字段默认可空,某处出错时该字段置
        null,其他数据照常返回
      </>,
      <>这是语法错误,类型后面必须带 !</>,
      <>author 出错时会返回空字符串</>,
    ],
    correct: 1,
    wrong: [
      <>
        恰好相反 —— GraphQL 的默认和多数语言的直觉拧着来:不写 !
        就是「可能为 null」。前端不判空,运行时炸给你看。
      </>,
      undefined,
      <>
        不带 ! 完全合法,而且是默认;<code>User!</code> 这种
        Non-Null 才是「额外声明」。
      </>,
      <>
        null 就是 null,类型系统不会替你编造一个空字符串 ——
        造假数据比返回 null 危险多了。
      </>,
    ],
    why: (
      <>
        默认可空是 GraphQL 的失败隔离设计:某个 resolver 炸了,就地置
        null、把错误记进 errors 数组,响应的其余部分照常送达(partial
        data)。Non-Null 会让 null 向上冒泡 —— 契约越硬,炸得越大。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        <code>posts {"{ author }"}</code> 让 20 篇文章触发了 21
        次数据库查询(N+1)。Facebook 开源的那个「攒一批、查一次、
        每请求缓存」的标准解药叫____(一个英文单词)。
      </>
    ),
    placeholder: "小写英文即可",
    answers: ["dataloader", "DataLoader", "data loader"],
    hint: (
      <>
        Data + 装载机 —— 它把同一轮事件循环里的多次 load(id)
        合并成一次批量查询。
      </>
    ),
    why: (
      <>
        DataLoader 把同一 tick 内的 load(1)、load(2)…合并成一次
        batchLoad([1, 2, …]),外加每请求缓存 —— N+1 的标准解法,GraphQL
        服务端的装机必备(第 10 章)。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        同一份文章数据,REST 的 <code>GET /posts/1</code> 能被 CDN
        直接缓存,而默认配置的 GraphQL 查询不能。根本原因是?
      </>
    ),
    opts: [
      <>GraphQL 的响应太大,超出 CDN 的缓存上限</>,
      <>
        REST 的「GET + 唯一 URL」天然是缓存键;GraphQL 默认 POST 单端点,
        查询藏在请求体里,中间设备没东西可当键
      </>,
      <>CDN 厂商故意不支持 GraphQL</>,
      <>GraphQL 的数据是实时的,缓存了会出错</>,
    ],
    correct: 1,
    wrong: [
      <>
        跟大小无关 —— 再小的 POST 响应,HTTP 缓存默认也不存。
        问题在「键」,不在「量」。
      </>,
      undefined,
      <>
        不是不想支持,是没得支持:两个完全不同的查询,URL 一模一样,
        CDN 拿什么区分谁是谁?
      </>,
      <>
        REST 的数据一样会变,照样缓存 —— 新鲜度交给 max-age 和 ETag 管。
        「实时性」是缓存策略问题,不是能不能缓存的问题。
      </>,
    ],
    why: (
      <>
        HTTP 缓存的世界观是「方法 + URL = 键」。GraphQL 想拿回这份红利,
        得把查询变回能当键的东西:persisted queries(查询文本换成哈希)+
        GET,或干脆在客户端做规范化缓存 —— 都行,但都是自己搭。
        这就是那句「GraphQL 的代价在缓存」。
      </>
    ),
  },
  {
    type: "multi",
    q: (
      <>
        毕业判断题:下面哪些场景,GraphQL 是<b>合理的默认选择</b>?(多选)
      </>
    ),
    opts: [
      <>App、Web、小程序、车机四种端,一屏数据要聚合五个微服务</>,
      <>大组织几十个团队共建一张数据图,配联邦(federation)</>,
      <>独立开发者的个人博客:一个 Web 前端 + 一个小后端</>,
      <>对外开放给上万第三方、匿名可调的公开数据 API</>,
      <>移动端为主、弱网流量敏感、各端字段需求差异大的产品</>,
    ],
    correct: [0, 1, 4],
    missHint: (
      <>
        再找找漏掉的 —— 有个场景把「多端、弱网、字段差异大」三大主场全踩中了,
        那正是 GraphQL 的看家本领。
      </>
    ),
    extraHint: (
      <>
        有一项选多了 —— 想想那个场景里,GraphQL 的固定成本
        (缓存自建、限深、字段级授权)由谁来摊?摊不薄的成本就是纯负担。
      </>
    ),
    why: (
      <>
        GraphQL 的账要这么算:收益(按需取数、一张 schema 多端复用、聚合)
        乘以端和团队的数量,减去固定成本(缓存、安全、N+1、可观测性)。
        A、B、E 能把成本摊薄;C 摊不薄,REST/tRPC 更省心;D
        的「匿名 + 任意查询」是攻击面噩梦 —— 连 GitHub 都要求 GraphQL
        必须带 token,而 REST 匿名随便调。
      </>
    ),
  },
];
