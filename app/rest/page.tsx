"use client";

// 第 03 章 · REST 的思想:
// 城市规划比喻 → 风格 vs 协议 → 资源/表述/URI 三件套(内容协商互动)→
// 六大约束翻转卡 + 无状态小剧场 → 成熟度阶梯 → HATEOAS 理想与现实 →
// 动手任务 → 测验 → 要点。

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
import { LABS, QUIZ } from "@/lib/rest-data";
import {
  HeroCity,
  RepresentationSwitcher,
  ConstraintFlips,
  StatelessTheater,
  MaturityLadder,
} from "./viz";

export default function RestPage() {
  return (
    <main className="page" data-ch="rest">
      <Hero
        ch="rest"
        title={
          <>
            REST 的<span className="grad">思想</span>
          </>
        }
        essence={
          <>
            Web 是人类造过的最大的分布式系统。它能长这么大,不是运气好 ——
            是因为背后有一套城市规划。REST,就是把这套规划写下来的名字。
          </>
        }
        chips={[
          { id: "style", n: "01", label: "风格,不是协议" },
          { id: "trio", n: "02", label: "资源 · 表述 · URI" },
          { id: "constraints", n: "03", label: "六大约束" },
          { id: "maturity", n: "04", label: "成熟度阶梯" },
          { id: "hateoas", n: "05", label: "HATEOAS" },
          { id: "labs", n: "06", label: "动手" },
          { id: "quiz", n: "07", label: "测验" },
        ]}
      >
        <HeroCity />
      </Hero>

      {/* ================= §01 风格,不是协议 ================= */}
      <Section
        id="style"
        index="01"
        title="REST 是风格,不是协议"
        desc="进入 REST 世界的第一件事:把「REST = JSON over HTTP」这个流行误解拆掉。"
      >
        <Callout tone="story" title="2000 年,一篇博士论文">
          <p>
            写下 HTTP/1.1 规范的人之一,Roy Fielding,回头审视自己参与建造的
            Web:它凭什么能从几台机器,长成覆盖全球的庞然大物而不散架?
            他把答案总结成一种<b>架构风格</b>,写进博士论文第五章,起名
            REpresentational State Transfer —— 表述性状态转移,缩写 REST。
          </p>
          <p>
            注意这个顺序:<b>不是先有 REST、再照着它造出 Web</b>。是 Web
            先赢了,REST 是对「它为什么赢」的复盘。就像一座城先繁荣起来,
            规划师再把它的成功经验写成《城市规划原理》。
          </p>
        </Callout>

        <p className="sec-desc">
          一座城能从村庄长成千万人口的都市而不瘫痪,靠的从来不是某一条街
          修得漂亮,而是几条不起眼的规划原则:功能分区、道路分级、
          统一的门牌编号。Web 也一样 —— REST 的六条约束,就是它的规划条例。
        </p>

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">协议 protocol</div>
            <div className="card-title">像交通法规</div>
            <p>
              白纸黑字写死,违反就出事。HTTP 是协议:格式错一个字节,
              对方直接看不懂。协议有版本号,有标准文本。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">风格 style</div>
            <div className="card-title">像规划理念</div>
            <p>
              一套原则,没有强制力 —— 遵守得越多,城市越健康。REST 是风格:
              没有版本号,没有官方认证,也没有「REST 报错」这回事。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">RESTful</div>
            <div className="card-title">一个形容词</div>
            <p>
              「遵循 REST 风格的」。说一个 API 很
              RESTful,就像说一个小区「很符合规划」—— 是程度问题,
              不是有无问题。
            </p>
          </div>
        </div>

        <Callout tone="warn" title="所以,这几句都不对">
          <p>
            「REST 就是 JSON over HTTP」「返回 JSON 的就是 REST API」——
            都不对。Fielding 的论文里<b>一个字都没提 JSON</b>
            (那会儿 JSON 还没流行起来)。REST 谈的是架构:资源怎么命名、
            状态怎么流转、缓存怎么生效 —— 跟用什么格式装数据,完全是两层事。
            §02 的互动会给你现场证据。
          </p>
        </Callout>

        <p className="sec-desc">
          顺便报个行情:Postman 2025 年的调查里,<b>93% 的 API 自称 REST</b>
          ,是绝对的业界普通话。但你猜怎么着 —— 按 Fielding
          的原教旨标准,它们大多数都「不合格」。合格线画在哪,§04
          的阶梯上见。
        </p>
      </Section>

      {/* ================= §02 资源、表述、URI ================= */}
      <Section
        id="trio"
        index="02"
        title="三件套:资源、URI、表述"
        desc="名词、门牌号、快照 —— REST 世界观的全部地基,就这三个词。"
      >
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">名词</div>
            <div className="card-title">资源 resource</div>
            <p>
              任何值得命名的事物:42 号用户、这篇文章、今天的杭州天气。
              注意 —— 全是<b>名词</b>。资源是「那个东西本身」,
              一个抽象的概念。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">门牌号</div>
            <div className="card-title">URI</div>
            <p>
              资源的地址。<code>/users/42</code> 指着「42 号用户」这个人,
              而不是某份 JSON 文件。城市要长大,先得把门牌编清楚。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">快照</div>
            <div className="card-title">表述 representation</div>
            <p>
              资源在<b>某一刻</b>、以<b>某种格式</b>拍下的照片。JSON
              是照片,HTML 也是照片 —— 照片可以有很多张,本人只有一个。
            </p>
          </div>
        </div>

        <RepresentationSwitcher />

        <Callout tone="idea" title="REST 这个名字,就是从这来的">
          <p>
            Representational State Transfer,表述性状态转移:客户端手里
            永远只有<b>表述</b>(快照);每跟着一个链接请求一次,
            新的表述传输过来,应用的状态就前进一步。你逛网页的每一次点击,
            都是一次「表述的状态转移」—— 这名字不玄,它在描述你每天做的事。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 六大约束 ================= */}
      <Section
        id="constraints"
        index="03"
        title="约法六章:REST 的六大约束"
        desc="六条规划条例。点卡片翻面,看看「没有它,Web 会塌成什么样」。"
      >
        <ConstraintFlips />

        <Callout tone="deep" title="统一接口,拆开是四条">
          <p>
            统一接口是 REST 的核心区别性约束,内含 4 个子约束:①{" "}
            <b>资源标识</b>:用 URI 给资源指名道姓;②{" "}
            <b>通过表述操纵资源</b>:你改的是快照,寄回服务器让它更新本体;③{" "}
            <b>自描述消息</b>:每条消息自带看懂它的说明书 —— 方法、状态码、
            Content-Type,不需要场外知识;④ <b>HATEOAS</b>,超媒体驱动 ——
            这条戏最多,§05 单独讲。
          </p>
        </Callout>

        <p className="sec-desc">
          六条里最值得加戏的是<b>无状态</b>:它最反直觉 ——
          服务器记住用户,明明很方便啊?可它恰恰是 Web
          能横向长大的那把钥匙。上剧场,看两种服务器的命运:
        </p>

        <StatelessTheater />

        <Callout tone="warn" title="无状态 ≠ 什么都不存">
          <p>
            常见误会:「无状态是不是连数据库都不能有?」当然不是。文章、
            用户这些<b>资源数据</b>照存不误 —— 不存的是<b>会话状态</b>
            (你登没登录、逛到第几页)。那部分请客户端随身带着,
            每次请求自报家门。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 成熟度阶梯 ================= */}
      <Section
        id="maturity"
        index="04"
        title="Richardson 成熟度模型:你离 REST 有多近"
        desc="Leonard Richardson 提出、Martin Fowler 撰文普及的一把卷尺 —— 不是官方标准,但业界都拿它量。"
      >
        <MaturityLadder />

        <Callout tone="idea" title="回收 §01 的伏笔">
          <p>
            那 93% 自称 REST 的 API,绝大多数停在 <b>L2</b>。所以「业界的
            REST」其实是「L2 + JSON」的俗称。这不丢人 —— L2 已经把 HTTP
            的大部分好处(缓存、幂等、通用工具)拿到手了。但你得知道,
            尺子上面还有一格。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 HATEOAS ================= */}
      <Section
        id="hateoas"
        index="05"
        title="HATEOAS:理想与现实"
        desc="L3 的入场券,Fielding 心中「真正的 REST」—— 以及它为什么没能流行。"
      >
        <p className="sec-desc">
          HATEOAS —— Hypermedia As The Engine Of Application State,
          超媒体作为应用状态的引擎。名字唬人,干的事你天天在做:<b>逛网页</b>
          。你从不背 URL,页面给你链接,你点。HATEOAS
          就是让程序也这么活着:响应里带链接,客户端跟着链接走。
        </p>

        <CodeBlock
          lang="http"
          title="理想中的博客 API · GET /posts/42"
          hl={[9, 10, 11]}
          code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 42,
  "title": "REST 的思想",
  "authorId": 1,
  "_links": {
    "self":     { "href": "/posts/42" },
    "author":   { "href": "/users/1" },
    "comments": { "href": "/posts/42/comments" }
  }
}`}
          note={
            <>
              客户端不再自己拼 <b>/posts/42/comments</b> ——
              服务器哪天改了路由,响应里的链接跟着变,客户端毫发无伤。
              这就是超媒体的卖点:解耦。
            </>
          }
        />

        <p className="sec-desc">
          听起来很美,现实呢?你其实见过它的痕迹 —— GitHub API
          的响应里,躺着一排 <code>*_url</code> 字段:
        </p>

        <CodeBlock
          lang="json"
          title="GET https://api.github.com/users/octocat(节选)"
          code={`{
  "login": "octocat",
  "url": "https://api.github.com/users/octocat",
  "followers_url": "https://api.github.com/users/octocat/followers",
  "repos_url": "https://api.github.com/users/octocat/repos",
  "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}"
}`}
          note={
            <>
              这些就是超媒体的活化石 —— GitHub 是早年超媒体驱动 API
              的典型。§06 的第一个动手任务,就是去数它们。
            </>
          }
        />

        <Callout tone="story" title="Fielding 的著名牢骚(2008)">
          <p>
            眼看满世界的「REST API」没几个是超媒体驱动的,Fielding 2008
            年发了篇著名博文《REST APIs must be
            hypertext-driven》,大意是:<b>
              应用状态的引擎如果不是超媒体,那它就不是 REST
            </b>
            —— 要么按规矩来,要么请换个名字。按他的原教旨标准,
            今天绝大多数「REST API」都得改名。
          </p>
        </Callout>

        <p className="sec-desc">
          但现实很骨感:对主流 Web API 的实证研究(arXiv 1902.10514)发现,
          响应里提供相关资源链接的 API <b>不到五分之一</b> —— HATEOAS 是六大
          约束里落地最差的一条。为什么?① 客户端和 API 多半是同一个团队写的,
          「动态发现」没什么用武之地;② 链接让响应膨胀、交互变话痨;③
          没有事实标准 —— HAL、JSON:API、Siren 各行其是;④
          框架和客户端工具的支持一直不温不火。
        </p>

        <Callout tone="win" title="诚实的结论">
          <p>
            业界的「REST」≈ <b>L2 + JSON</b>。这门课接下来也按现实教 ——
            第 04、05 章全是 L2 的手艺。但你现在知道理想长什么样了:
            下次有人聊起 HATEOAS,你能讲清理想与现实的差距,
            以及这个差距是怎么来的。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 动手任务 ================= */}
      <Section
        id="labs"
        index="06"
        title="动手任务"
        desc="三个任务:摸一摸真实世界的超媒体痕迹,再练一练判级和资源建模的眼力。"
      >
        <LabSet ch="rest" items={LABS} />
      </Section>

      {/* ================= §07 通关测验 ================= */}
      <Section
        id="quiz"
        index="07"
        title="通关测验"
        desc="八道题。答完这章,「REST 是什么」这个面试必考题,你能讲出 90% 的人讲不出的层次。"
      >
        <Quiz ch="rest" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            REST 是<b>架构风格</b>,不是协议、不是格式 —— 六条约束,
            遵守得越多,越能搭上 Web 这套基础设施的便车。
          </>,
          <>
            三件套:资源(名词)、URI(门牌号)、表述(快照)。JSON
            只是最流行的表述,换个 Accept 就能换一副面孔 —— REST ≠ JSON。
          </>,
          <>
            无状态 = 每个请求自带全部信息,会话状态客户端随身带 ——
            这是「想加机器就加机器」的水平扩展钥匙。
          </>,
          <>
            成熟度阶梯:L0 单端点 → L1 有资源 → L2 动词+状态码(业界主流)
            → L3 超媒体。业界的「REST」≈ L2 + JSON。
          </>,
          <>
            HATEOAS 是理想国:响应带链接、客户端跟着走。落地不到 1/5,
            但 GitHub 的一排 <code>*_url</code> 是它留下的活化石。
          </>,
        ]}
      />

      <ChapterFooter ch="rest" />
    </main>
  );
}
