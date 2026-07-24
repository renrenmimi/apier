"use client";

// 第 07 章 · GraphQL 初见:
// 自选点菜单比喻 → REST 两种痛(over/under-fetching)→ GraphQL 的答案(CodePair)→
// QueryBuilder 亲手点菜 → 一个端点的心理落差(揭魅:就是 HTTP POST)→
// GraphiQL → 别急着站队 → 动手任务 → 测验 → 要点。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  Method,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/graphql-data";
import {
  GqHeroLoop,
  OverfetchViz,
  UnderfetchWaterfall,
  QueryBuilder,
  GraphiqlTour,
  AdoptionBars,
} from "./viz";

export default function GraphqlPage() {
  return (
    <main className="page" data-ch="graphql">
      <Hero
        ch="graphql"
        title={
          <>
            GraphQL <span className="grad">初见</span>
          </>
        }
        essence={
          <>
            REST 的固定套餐吃了六章,今天换一家店:这里递给你一张单子,
            想要什么勾什么,后厨照单出菜 —— 不多给一口,也不少上一道。
          </>
        }
        chips={[
          { id: "rest-pain", n: "01", label: "REST 的两种痛" },
          { id: "answer", n: "02", label: "GraphQL 的答案" },
          { id: "builder", n: "03", label: "玩起来" },
          { id: "endpoint", n: "04", label: "一个端点" },
          { id: "graphiql", n: "05", label: "GraphiQL" },
          { id: "no-sides", n: "06", label: "别急着站队" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <GqHeroLoop />
      </Hero>

      {/* ================= §01 REST 的两种痛 ================= */}
      <Section
        id="rest-pain"
        index="01"
        title="REST 的两种痛"
        desc="不是 REST 不好 —— 是有两种账,套餐制天生算不划算。还是用第 04 章那套博客 API 说话。"
      >
        <Callout tone="story" title="2012 年,一间会议室里的流量账">
          <p>
            Facebook 决定把越来越卡的移动版 News Feed 推倒,用原生 App 重写。
            可当年的移动网络是 2G/3G:一次往返动辄几百毫秒,流量按 KB 收费。
            工程师们盯着 REST 响应发愁 —— 一份份「固定套餐」端上来,
            大半字段根本用不上,而一屏内容又得串好几个端点才凑得齐。
          </p>
          <p>
            于是 Lee Byron、Nick Schrock、Dan Schafer 三个人琢磨出一种新点菜法:
            客户端把想要的字段写成一张清单交上去,服务器照单出菜。2015 年它开源,
            起名 GraphQL;2018 年移交给中立的 GraphQL Foundation;
            规范最新正式版是 <b>September 2025 Edition</b> ——
            距上一版隔了整整四年,这门语言还在长个儿。
          </p>
        </Callout>

        <p className="sec-desc">
          第一种痛:<b>over-fetching(过度获取)</b>。文章页要显示作者署名,
          你只想要名字和头像,可 <code>GET /users/9</code>{" "}
          是道固定套餐 —— 后厨把整个 user 都给你端来了。
        </p>

        <OverfetchViz />

        <p className="sec-desc">
          第二种痛:<b>under-fetching(不足获取)</b>。一个端点给的不够,
          就得再跑一趟 —— 而且下一趟的地址,常常要等上一趟的响应回来才知道。
        </p>

        <UnderfetchWaterfall />

        <Callout tone="warn" title="别把锅甩给 REST 的设计者">
          <p>
            你可能想说:那给 <code>/posts/1</code> 加个参数,把作者和评论一起带上
            不就行了?可以 —— 但每来一种新页面就得加一种「定制套餐」,
            端点越改越多、越改越怪,后厨迟早疯掉。<b>问题不在手艺,在点菜制度</b>:
            只要「响应形状由服务器预先定死」,拿多与拿少就总有一头堵不住。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 GraphQL 的答案 ================= */}
      <Section
        id="answer"
        index="02"
        title="GraphQL 的答案:把需求一次说清"
        desc="同一个帖子页,左边是 REST 的三趟跑腿,右边是 GraphQL 的一张单子。"
      >
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title="REST · 三次请求"
              code={`GET /posts/1 HTTP/1.1
GET /users/9 HTTP/1.1
GET /posts/1/comments HTTP/1.1`}
              note={
                <>
                  三趟,只能排队跑(第二趟的 URL 依赖第一趟的响应),
                  每趟还都是固定套餐。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="graphql"
              title="GraphQL · 一次查询"
              code={`{
  post(id: 1) {
    title
    body
    author {
      name
      avatarUrl
    }
    comments {
      body
      author { name }
    }
  }
}`}
              note={
                <>
                  帖子、作者、评论、评论的作者 —— 嵌套几层都写在一张单子里,
                  一趟往返全带回来。
                </>
              }
            />
          }
        />

        <p className="sec-desc">
          再看一条 GraphQL 最好记的规律:<b>查询长什么样,响应就长什么样</b>。
          左右两个窗口逐行对一遍 ——
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="graphql"
              title="查询(你写的)"
              code={`{
  post(id: 1) {
    title
    author {
      name
    }
    comments {
      body
    }
  }
}`}
              hl={[4, 5, 6]}
            />
          }
          right={
            <CodeBlock
              lang="json"
              title="响应(你收到的)"
              code={`{
  "data": {
    "post": {
      "title": "GraphQL 初体验",
      "author": {
        "name": "Ada Wong"
      },
      "comments": [
        { "body": "讲得真透!" },
        { "body": "收藏了" }
      ]
    }
  }
}`}
              hl={[5, 6, 7]}
            />
          }
        />

        <Callout tone="idea" title="为什么这条规律这么值钱?">
          <p>
            写前端时,你<b>看着查询就知道数据长什么样</b>,不用翻文档、
            不用 console.log 猜结构;唯一多出来的是最外层那个 <code>data</code>{" "}
            壳,以及列表字段(comments)会变成数组。这条规律记住了,
            GraphQL 就学会了一半。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 玩起来 ================= */}
      <Section
        id="builder"
        index="03"
        title="玩起来:亲手点一次菜"
        desc="左边是 Rick and Morty API 的 character 字段菜单。勾勾选选,中间的 query 和右边的响应会跟着你长。"
      >
        <QueryBuilder />
        <Callout tone="idea" title="体会到了吗?">
          <p>
            REST 里「省流量」是后端的事 —— 你只能求后厨改套餐;GraphQL 里是
            <b>你自己的事</b>:列表页只勾 name 和 image,详情页再把七个字段全点上,
            同一个 API,两张不同的单子。这就是「要什么给什么,不多不少」。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 一个端点 ================= */}
      <Section
        id="endpoint"
        index="04"
        title="一个端点的心理落差"
        desc="学完 REST 你满脑子都是 URL,一进 GraphQL 的门却发现:路只有一条。"
      >
        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">REST 的世界</div>
            <div className="card-title">一张越写越长的 URL 清单</div>
            <div className="gq-ep-list">
              <div>
                <Method m="GET" /> <code>/posts</code>
              </div>
              <div>
                <Method m="POST" /> <code>/posts</code>
              </div>
              <div>
                <Method m="GET" /> <code>/posts/1</code>
              </div>
              <div>
                <Method m="PATCH" /> <code>/posts/1</code>
              </div>
              <div>
                <Method m="GET" /> <code>/posts/1/comments</code>
              </div>
              <div>
                <Method m="GET" /> <code>/users/9</code>
              </div>
              <div className="gq-ep-more">……每种需求一个门牌号</div>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">GraphQL 的世界</div>
            <div className="card-title">一扇门</div>
            <div className="gq-ep-one">
              <Method m="POST" /> <code>/graphql</code>
            </div>
            <p>
              所有需求都从这扇门进,门后站着 schema。「去哪个 URL」的问题,
              变成了「在查询里点哪些字段」。
            </p>
          </div>
        </div>

        <p className="sec-desc">
          「那我的路由都去哪了?」—— 没消失,是换了个地方住:
        </p>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>你在 REST 里熟悉的</th>
                <th>到了 GraphQL 变成</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>一批端点(URL)</td>
                <td>
                  <b>一个端点</b> <code>/graphql</code>
                </td>
              </tr>
              <tr>
                <td>资源 —— 用 URL 定位</td>
                <td>
                  <b>类型(type)</b> —— 在 schema 里定义
                </td>
              </tr>
              <tr>
                <td>「调哪个端点、什么方法」</td>
                <td>
                  <b>「在查询里选哪些字段」</b>
                </td>
              </tr>
              <tr>
                <td>OpenAPI 文档(外挂)</td>
                <td>
                  <b>schema + 内省</b>(自带,第 08 章)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="sec-desc">
          最后揭个魅。把 DevTools 打开看一眼,GraphQL 请求在网线上长这样 ——
        </p>

        <CodePair
          left={
            <CodeBlock
              lang="http"
              title="请求报文"
              code={`POST /graphql HTTP/1.1
Host: rickandmortyapi.com
Content-Type: application/json

{
  "query": "{ character(id: 1) { name status } }"
}`}
              hl={[6]}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title="响应报文"
              code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "character": {
      "name": "Rick Sanchez",
      "status": "Alive"
    }
  }
}`}
              hl={[1]}
            />
          }
        />

        <Callout tone="deep" title="揭魅:GraphQL 就是披着查询语言外衣的 HTTP POST">
          <p>
            没有新协议、没有魔法:一个普通的 POST,body 是 JSON,查询语句是里面的
            一个字符串。你前六章学的 fetch、Header、DevTools 全部继续有效。
          </p>
          <p>
            但注意响应第一行:<b>传统上 GraphQL 恒回 200</b> ——
            哪怕查询写错了,HTTP 层面照样「成功」,真正的错误藏在 body 的{" "}
            <code>errors</code> 数组里。所以在 GraphQL 世界别拿{" "}
            <code>res.ok</code> 判断成败,这个坑第 09、10 章还会细说。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 GraphiQL ================= */}
      <Section
        id="graphiql"
        index="05"
        title="GraphiQL:自带的菜单浏览器"
        desc="多出来的那个 i 读作 graphical。它是官方出的浏览器操作台,也是你练手的主场。"
      >
        <GraphiqlTour />
        <Callout tone="idea" title="自动补全和文档是哪来的?">
          <p>
            REST 的文档要人手写、外挂在别处(OpenAPI);GraphQL 的类型系统
            长在语言里,工具向服务器发一句「自我介绍一下」的元查询,
            就能拿回完整菜单 —— 这机制叫<b>内省(introspection)</b>,
            第 08 章拆开讲。
          </p>
          <p>
            两个免注册的在线练习场,现在就能开:
            <code>rickandmortyapi.com/graphql</code> 和{" "}
            <code>countries.trevorblades.com</code> —— 下面的动手任务全在这俩上做。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 别急着站队 ================= */}
      <Section
        id="no-sides"
        index="06"
        title="别急着站队"
        desc="看完前五节你可能已经想把 REST 扔了 —— 慢着,先看看真实世界的账本。"
      >
        <AdoptionBars />
        <div className="grid-2">
          <div className="card">
            <div className="card-title">GraphQL 什么时候香</div>
            <p>
              多端(iOS/Android/Web 各要各的字段)、一屏聚合多种数据、
              前端想快速迭代不求后端改接口 —— 点菜自由的价值全在这些场景兑现。
            </p>
          </div>
          <div className="card">
            <div className="card-title">代价也真实存在</div>
            <p>
              HTTP 缓存基本失效、服务器要防「恶意点菜」、N+1 查询等着你 ——
              这些账第 10 章一笔笔算。GitHub 至今 REST 与 GraphQL 双轨并行,
              不是没有原因。
            </p>
          </div>
        </div>
        <Callout tone="win" title="这门课的立场">
          <p>
            接下来三章把 GraphQL 学透:契约(第 08 章)、三种操作(第 09 章)、
            后台与性能(第 10 章)。然后终章摆开擂台,你自己当裁判 ——
            <b>两边都吃透的人,才有资格替团队做选型。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="三个任务,两个在线练习场加一次裸 fetch —— 今天就把第一句 query 发出去。"
      >
        <LabSet ch="graphql" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="八道题。答错不丢人,每个错误选项都有针对性的解释。"
      >
        <Quiz ch="graphql" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            GraphQL 为移动端弱网而生,专治 REST 的两种痛:
            over-fetching(拿多了)和 under-fetching(拿不够、要多跑几趟)。
          </>,
          <>
            查询长什么形状,<code>data</code> 就长什么形状 ——
            要什么给什么,不多不少;没有 SELECT *,字段必须点名。
          </>,
          <>
            惯例只有一个端点 <code>POST /graphql</code>:资源变成类型,
            「调哪个端点」变成「点哪些字段」。
          </>,
          <>
            揭魅:GraphQL 就是普通 HTTP POST,fetch 一行就能发;
            但传统上响应恒 200,错误在 body 里 —— 别拿 res.ok 判断成败。
          </>,
          <>
            GraphiQL 的补全和文档来自内省;REST 93% vs GraphQL 33%,
            两者是取舍关系,不是替代关系 —— 终章再做裁判。
          </>,
        ]}
      />

      <ChapterFooter ch="graphql" />
    </main>
  );
}
