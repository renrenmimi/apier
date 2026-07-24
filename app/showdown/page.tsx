"use client";

// 终章 ✦ · 对决与选型 —— 全书压轴:
// 裁判席比喻 → 全维度对决表 → 决策室(五问出判决)→ 真实世界判例 →
// 混合架构 → 全书复习墙 → 动手任务 → 终极测验 → 毕业寄语 → 全书要点。

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
import { LABS, QUIZ } from "@/lib/showdown-data";
import {
  HeroArena,
  VersusTable,
  DecisionRoom,
  AdoptionBars,
  HybridDiagram,
  ReviewWall,
} from "./viz";

export default function ShowdownPage() {
  return (
    <main className="page" data-ch="showdown">
      <Hero
        ch="showdown"
        title={
          <>
            终局:<span className="grad">对决与选型</span>
          </>
        }
        essence={
          <>
            十一章下来,蓝方的底细和粉方的脾气你都摸透了。今天你不坐观众席,
            坐裁判席 —— 这一章不教新咒语,只练一个最值钱的判断:
            什么场景,用什么。没有银弹,只有取舍。
          </>
        }
        chips={[
          { id: "versus", n: "01", label: "全维度对决" },
          { id: "decision", n: "02", label: "决策室" },
          { id: "cases", n: "03", label: "真实判例" },
          { id: "hybrid", n: "04", label: "混合架构" },
          { id: "review", n: "05", label: "全书复习" },
          { id: "labs", n: "06", label: "动手" },
          { id: "quiz", n: "07", label: "终极测验" },
          { id: "grad", n: "08", label: "毕业寄语" },
        ]}
      >
        <HeroArena />
      </Hero>

      {/* ================= §01 全维度对决 ================= */}
      <Section
        id="versus"
        index="01"
        title="全维度对决:十一个回合"
        desc="同一个后厨(博客数据),两种点菜规矩。逐行点开看判词 —— 每一行都是你亲手学过的章节在打分。"
      >
        <Callout tone="story" title="开庭陈词">
          <p>
            回想整门课:蓝方拿这套数据端出了 <code>/posts</code>、
            <code>/users/42/orders</code>,靠六大约束和 HTTP 缓存吃遍天下;
            粉方拿同一套数据写了一张 schema,靠精确取数和类型契约后来居上。
            十一章的恩怨,今天摆上台面 —— 但先说好:
            <b>打分的从来不是技术本身,是你的场景。</b>
          </p>
        </Callout>
        <VersusTable />
      </Section>

      {/* ================= §02 决策室 ================= */}
      <Section
        id="decision"
        index="02"
        title="决策室:五个问题,一份判决书"
        desc="选型会上最怕的不是不懂技术,是说不出理由。这个房间练的就是「有理有据」。"
      >
        <p className="sec-desc">
          进决策室之前,先认识两位场外选手 —— 它们不参加蓝粉对决,
          但真实世界的选型会上,它们经常坐在旁听席举手。
        </p>

        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">第三选项 A · RPC 流派</div>
            <div className="card-title">tRPC:TS 全栈的密语</div>
            <p>
              RPC(Remote Procedure Call,远程过程调用)的思路是:别管什么资源
              什么查询语言,前端直接「调用后端的函数」。tRPC 把这事做到极致:
              前后端同一个 TypeScript 仓库时,后端写好函数,前端自动获得完整
              类型 —— 无 schema、无 codegen,改签名即报错。v11 已稳定,
              Next.js 生态的宠儿。
            </p>
            <p>
              边界也硬:出了 TS 世界立刻失效,对外公开 API 用不了 ——
              它是团队内部的密语,不是普通话。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">第三选项 B · 微服务内线</div>
            <div className="card-title">gRPC:机房里的高速专线</div>
            <p>
              Google 出品:契约用 Protobuf(Protocol Buffers,二进制序列化
              格式)来写,跑在 HTTP/2 上 —— 小、快、原生支持流式,还能给
              各种语言生成客户端。多语言微服务之间互调,它是行业标配。
            </p>
            <p>
              但浏览器不能直连(要 grpc-web 转换),所以它几乎只活在内网:
              对外的门面,还是 REST 或 GraphQL 的事。
            </p>
          </div>
        </div>

        <DecisionRoom />

        <Callout tone="idea" title="一句能背下来的选型口诀">
          <p>
            对外公开 → REST;多端聚合、大组织多团队 → GraphQL(+ 联邦);
            TS 全栈单团队 → tRPC;内部微服务高性能互调 → gRPC。
            口诀管八成场景,剩下两成 —— 相信你自己的判决书。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 真实判例 ================= */}
      <Section
        id="cases"
        index="03"
        title="真实世界的判例"
        desc="理论讲完了,看看真金白银的公司怎么判 —— 判例比教条诚实。"
      >
        <Callout tone="story" title="判例一 · GitHub:上了 GraphQL,但没下 REST">
          <p>
            2016 年,GitHub 公开 GraphQL API,自述是「抛弃 XML 拥抱 JSON
            以来最大的变化」。动机很实在:REST 端点组合爆炸 ——
            每个集成方都想「刚好要这几个字段」,定制端点越写越多;GraphQL
            让集成方自己挑。但十年过去,REST 并没有退役:两套 API
            至今<b>并行双轨</b>,官方还专门写了一页文档教你怎么选。
          </p>
          <p>
            最有味道的细节:REST 匿名就能调(60 次/小时),GraphQL
            必须带 token(匿名配额为 0)——
            任意组合的查询,服务器必须知道找谁算账。这本身就是一堂免费的安全课。
          </p>
        </Callout>

        <CodePair
          left={
            <CodeBlock
              lang="http"
              title="REST · GET /repos/facebook/react(匿名可调)"
              hl={[9]}
              code={`HTTP/1.1 200 OK
content-type: application/json
x-ratelimit-limit: 60

{
  "id": 10270250,
  "name": "react",
  "full_name": "facebook/react",
  "stargazers_count": 237000,
  "forks_count": 49000,
  "open_issues_count": 700,
  "...": "还有 100 多个你没要的字段"
}`}
              note={
                <>
                  想要一个数字,附赠六千字符(数字为示意)——
                  over-fetching 的日常。但胜在:谁都能调,CDN 还能缓存。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="graphql"
              title="GraphQL · POST /graphql(必须认证)"
              code={`# 同一个数字,一个字段搞定
query {
  repository(owner: "facebook", name: "react") {
    stargazerCount
  }
}`}
              note={
                <>
                  精确取数很香,但服务器坚持先验明正身 ——
                  自由是有押金的。
                </>
              }
            />
          }
        />

        <Callout tone="story" title="判例二 · Shopify:最激进的 all-in">
          <p>
            2024 年 10 月 1 日,Shopify 把 REST Admin API 标记为
            legacy(遗留);2025 年 4 月 1 日起,新提交到应用商店的公共 App
            <b>只准用 GraphQL</b>。为什么敢这么狠?Shopify 的 API
            用户是海量第三方 App 开发者,商品、订单、库存的数据形状千变万化 ——
            与其养两套,不如把力气全押在表达力更强的那套上。
            官方博文的标题就叫《All-in on GraphQL》,没有一点犹豫。
          </p>
        </Callout>

        <Callout tone="story" title="判例三 · Netflix:GraphQL 当聚合层">
          <p>
            Netflix 内部的 Studio API(影视制作系统)用联邦(federation)
            把 <b>70 多个微服务、上百个团队</b>接进同一张图:每个团队维护
            自己的子图(subgraph),路由器负责拼装查询。2021 年他们把配套的
            Spring Boot 框架 DGS 开了源。这是「GraphQL 站在微服务前面当
            点菜台」的教科书案例 —— 没人直接调 70 个服务,大家调一张图。
          </p>
        </Callout>

        <Callout tone="warn" title="反方判例 · Bessey:六年之后,我受够了 GraphQL">
          <p>
            2024 年,用了六年 GraphQL 的 Matt Bessey 写下《Why, after 6
            years, I&apos;m over GraphQL》,把 Hacker News 吵翻了天。
            四条账单,每条都扎实:<b>① 攻击面</b> —— 一个 128
            字节的匿名查询烧掉他 10 秒 CPU;<b>② 字段级授权</b> ——
            任何字段都可能被任意路径够到,授权必须做到字段级,成本爆炸;
            <b>③ N+1</b> —— 客户端改个查询,后端零改动也会被引爆;
            <b>④ 可观测性</b> —— 恒 200 加万物 POST,传统监控两眼一抹黑。
          </p>
          <p>
            这篇文章之后,「小团队退回 REST / tRPC」成了一股肉眼可见的潮流。
            注意:他没说 GraphQL 不行,他说的是 ——
            这些成本,他的团队摊不薄。
          </p>
        </Callout>

        <p className="sec-desc">
          最后让数据说话。Postman 每年问几千个团队「你们在用什么」,
          2025 年的答卷长这样:
        </p>

        <AdoptionBars />

        <Callout tone="deep" title="怎么读这组数字">
          <p>
            GraphQL 没有死 —— 对一门 2015 年才开源的技术,33%
            的占有率相当能打;但它也没有「取代」谁:REST 的 93%
            说明它仍是无可争议的默认。真实的故事是<b>定位收窄</b>:
            多端、多团队、聚合层,GraphQL 依然强;单前端小项目,
            已经没人劝你上它了。
          </p>
        </Callout>

        <Callout tone="warn" title="毕业前拆掉最后一个误区">
          <p>
            「GraphQL 是 REST 的升级版」—— 错。它们是<b>取舍关系</b>,
            不是版本关系:GitHub 双轨并行,Shopify 全押粉方,Bessey
            退回蓝方,三个都是理性决定。学完 GraphQL 就鄙视 REST 的人,
            和只会 REST 就拒绝 GraphQL 的人,犯的是同一个错误:
            拿着锤子找钉子。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 混合架构 ================= */}
      <Section
        id="hybrid"
        index="04"
        title="混合架构:不是二选一"
        desc="裁判可以判平局 —— 同一个后厨,完全可以开两个门面。"
      >
        <p className="sec-desc">
          整章看下来你应该发现了:对外公开的场景蓝方强,自家多端的场景粉方强。
          那如果一家公司两种场景都有呢?答案不是抓阄,是<b>都要</b>:
          对外开一个 REST 门面(第三方要的是稳定、通用、好缓存),
          对内开一个 GraphQL 门面(自家多端要的是灵活、按需)——
          GitHub 就是这么活的。
        </p>

        <HybridDiagram />

        <Callout tone="idea" title="BFF:GraphQL 最常见的落位">
          <p>
            这个「对内门面」有个正式名字:BFF(Backend for
            Frontend,面向前端的后端)—— 在通用后端和特定前端之间,
            加一层专为前端服务的聚合后端,按前端的需要拼装数据。
            GraphQL 不必替代你的微服务、不必碰你的数据库,
            它就站在它们前面当点菜台 —— Netflix 的 70 个服务,
            就是这么被一张图罩住的。
          </p>
        </Callout>

        <Callout tone="deep" title="成熟架构像工具箱,不像教派">
          <p>
            文件上传走 REST,实时推送走 WebSocket / subscription,
            服务间互调走 gRPC,聚合查询走 GraphQL,对外公开走 REST + OpenAPI ——
            每样工具干它最擅长的活。听到「我们全站只用 X」的时候,
            先问一句:是场景真的单一,还是锤子只有一把?
          </p>
        </Callout>
      </Section>

      {/* ================= §05 全书复习 ================= */}
      <Section
        id="review"
        index="05"
        title="全书复习:十二章,一张地图"
        desc="以毕业生的视角重走一遍。每章一句灵魂总结 —— 哪句读着心虚,点卡片回去补课。"
      >
        <ReviewWall />
      </Section>

      {/* ================= §06 动手任务 ================= */}
      <Section
        id="labs"
        index="06"
        title="动手任务"
        desc="裁判也要下场。三个任务:判三个案子、量一次字节、点亮全部绿灯。"
      >
        <LabSet ch="showdown" items={LABS} />
      </Section>

      {/* ================= §07 终极测验 ================= */}
      <Section
        id="quiz"
        index="07"
        title="终极测验"
        desc="十道题横跨全书十二章,难度比章测高一档。全对,才配得上裁判这个位置。"
      >
        <Quiz ch="showdown" items={QUIZ} />
      </Section>

      {/* ================= §08 毕业寄语 ================= */}
      <Section
        id="grad"
        index="08"
        title="毕业寄语,和接下来的路"
        desc="课程到这里就讲完了。但「学透」的最后一步,从来都在课程外面。"
      >
        <Callout tone="win" title="你已经毕业了">
          <p>
            序章那天,你还在问「页面上的数据从哪来」。现在你能读懂 RFC
            的状态码语义,能设计一套同事挑不出毛病的 URL,能解释 JWT
            为什么不防偷看,能写出带 DataLoader 的 resolver,还能在选型会上
            有理有据地说出「这个场景该用什么」。这十二章没有白走。
          </p>
        </Callout>

        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">路线一 · 动手</div>
            <div className="card-title">把博客 API 真做出来</div>
            <p>
              用 Express 或 Hono 写一套博客 API,数据就存一个 JSON
              文件 —— 不丢人。CRUD 映射、cursor 分页、RFC 9457
              错误格式、Idempotency-Key,把学过的全用上。
            </p>
            <p>
              做完,再给<b>同一份数据</b>套一个 GraphQL 门面(GraphQL Yoga
              或 Apollo Server 5),亲手体会「一个后厨,两个门面」。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">路线二 · 深潜</div>
            <div className="card-title">去读原典</div>
            <p>
              二手资料会骗人,规范不会:OpenAPI 3.2 在{" "}
              <code>spec.openapis.org</code>;GraphQL 官方教程在{" "}
              <code>graphql.org/learn</code>;Apollo 全家桶文档在{" "}
              <code>apollographql.com/docs</code>;HTTP 语义的老家是 RFC
              9110,<code>rfc-editor.org/rfc/rfc9110</code>。
            </p>
            <p>你现在的水平,读它们不再费劲 —— 这就是这门课给你的入场券。</p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">路线三 · 实战</div>
            <div className="card-title">做一个拿得出手的小作品</div>
            <p>
              挑一个公开 API:Open-Meteo 做天气面板,PokeAPI 做宝可梦图鉴,
              Rick and Morty(REST 和 GraphQL 双供)最妙 ——
              同一个作品,两种风格各写一遍,写完你对这章的对决表会有全新的体感。
            </p>
            <p>作品比证书有说服力。</p>
          </div>
        </div>

        <div className="sd-farewell">
          <span className="sd-farewell-mark" aria-hidden>
            ✦
          </span>
          <p>
            最后说句真心话。这门课教的不是 REST,也不是 GraphQL ——
            是<b>看穿取舍的眼睛</b>:它解决什么痛?代价是什么?我的场景踩中了吗?
            往后一定会有新的 API 风格出现,大概率还会有人喊「XX 已死」。
            到那天,你不会慌 —— 因为你手里有尺子。
            从「听说过」到「能上手、能设计、能选型」,这就是把一件事学透的样子。
          </p>
          <p>
            <b>去吧,裁判。</b>
          </p>
        </div>
      </Section>

      <KeyPoints
        title="这一整本书,真正要带走的"
        points={[
          <>
            API 的本质是<b>约定</b>:菜单、点菜、上菜。REST、GraphQL、tRPC、
            gRPC,都只是这份约定的不同写法。
          </>,
          <>
            HTTP 是共同的地基:方法、状态码、Header、缓存语义。REST
            把它用到十成,GraphQL 至少借走了运输层 —— 地基不牢,
            学什么风格都是空中楼阁。
          </>,
          <>
            REST = 资源 + 统一接口。红利在「简单」和「白吃 HTTP 缓存」,
            所以它是对外公开 API 的默认 —— 93% 的占有率不是惯性,是性价比。
          </>,
          <>
            GraphQL = 类型契约 + 精确取数。强在多端与聚合,代价在缓存自建与
            服务端复杂度(N+1、限深、字段级授权)——
            收益要摊在足够多的端和团队上才划算。
          </>,
          <>
            选型 = 场景说了算:给谁用、几种端、团队什么形状、聚不聚合。
            没有银弹,只有取舍 —— 能把取舍讲清楚的人,
            就是会议室里最懂 API 的人。
          </>,
        ]}
      />

      <ChapterFooter ch="showdown" />
    </main>
  );
}
