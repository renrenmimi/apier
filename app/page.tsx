"use client";

// 序章 · API 是什么 —— 全书的样板章:
// 餐厅比喻 → 客户端/服务器 + 请求旅程(逐帧)→ 生活案例 → JSON 解剖 →
// 真实 fetch 演示 → REST/GraphQL 预告 + 全书地图 → 动手任务 → 测验 → 要点。

import "./home.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/home-data";
import {
  HeroLoop,
  JourneyFlow,
  JsonAnatomy,
  LiveFetch,
  CourseMap,
} from "./home-viz";

export default function HomePage() {
  return (
    <main className="page" data-ch="home">
      <Hero
        ch="home"
        title={
          <>
            API <span className="grad">是什么</span>
          </>
        }
        essence={
          <>
            你会写 HTML、CSS,也摸过 JavaScript —— 但页面上的数据从哪来?
            这一章把「前端要数据」这件事,从第一块砖讲起。
          </>
        }
        chips={[
          { id: "story", n: "01", label: "从一顿饭说起" },
          { id: "journey", n: "02", label: "一次调用的旅程" },
          { id: "everywhere", n: "03", label: "生活里全是 API" },
          { id: "json", n: "04", label: "JSON" },
          { id: "live", n: "05", label: "真调一次" },
          { id: "map", n: "06", label: "两条路线" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <HeroLoop />
      </Hero>

      {/* ================= §01 从一顿饭说起 ================= */}
      <Section
        id="story"
        index="01"
        title="从一顿饭说起"
        desc="整门课最重要的一个比喻,先把它吃透 —— 后面十一章会反复用到它。"
      >
        <Callout tone="story" title="你进了一家餐厅">
          <p>
            你想吃鱼香肉丝。你不会自己冲进后厨翻锅碗瓢盆 —— 你坐下,翻开
            <b>菜单</b>,把菜名告诉<b>服务员</b>,服务员进后厨传话,
            过一会儿把菜端到你面前。
          </p>
          <p>
            软件世界一模一样。你的网页想要数据,不能自己冲进人家的数据库,
            而是照着<b>API 文档(菜单)</b>的写法,把请求交给
            <b> API(服务员)</b>,API 去<b>服务器/数据库(后厨)</b>
            取来,再端回给你。
          </p>
          <p>
            API 的全名是 Application Programming Interface,应用程序编程接口。
            别被这串词吓到,拆开就是一句话:
            <b>两段程序之间,事先约好的一套「怎么问、怎么答」的规矩。</b>
          </p>
        </Callout>

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">菜单</div>
            <div className="card-title">API 文档</div>
            <p>写清楚有哪些「菜」能点、怎么点、端上来长什么样。读文档 = 看菜单。</p>
          </div>
          <div className="card">
            <div className="card-kicker">点菜</div>
            <div className="card-title">请求 Request</div>
            <p>你按菜单格式说出的那句话。格式错了,服务员听不懂,菜就上不来。</p>
          </div>
          <div className="card">
            <div className="card-kicker">上菜</div>
            <div className="card-title">响应 Response</div>
            <p>
              端回来的结果:可能是你要的数据,也可能是一句「卖完了」——
              两种都是响应。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §02 一次调用的旅程 ================= */}
      <Section
        id="journey"
        index="02"
        title="客户端、服务器,和一次调用的完整旅程"
        desc="谁问,谁答;数据住在哪,经过谁的手。用播放器一帧一帧看明白。"
      >
        <p className="sec-desc">
          两个要背下来的词:发起请求的一方叫<b>客户端(client)</b>
          ,守着数据、负责应答的一方叫<b>服务器(server)</b>。
          你的浏览器、手机 App 都是客户端;服务器就是一台永远开机的电脑,
          跑着一段专门「听请求、办事、回话」的程序。
        </p>

        <JourneyFlow />

        <Callout tone="warn" title="为什么网页永远不直接碰数据库?">
          <p>
            因为浏览器里的代码,<b>用户按 F12 全都看得见</b>。数据库密码写进前端,
            等于贴在大门上。而且「谁能看谁的数据」这种事,总得有个明白人把关 ——
            这个明白人就是 API 服务器。餐厅不让顾客进后厨,不是怕你偷师,
            是怕你乱来。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 生活里全是 API ================= */}
      <Section
        id="everywhere"
        index="03"
        title="你今天已经用过几十次 API 了"
        desc="API 不是什么冷僻的技术名词,它是现代生活的自来水管。"
      >
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-title">☀️ 看一眼天气</div>
            <p>
              天气 App 自己不观测大气 —— 它调气象服务的 API,把「杭州,26°C,
              多云」这份 JSON 要过来,画成漂亮的界面。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-title">💳 扫码付一杯咖啡</div>
            <p>
              收银机调支付平台的 API:「向这位顾客收 28 元」。你听到的那声
              「叮」,是一次 API 调用成功返回的声音。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-title">🔑 「用微信登录」</div>
            <p>
              陌生网站不知道你是谁,它调微信的 API 替你验明正身 ——
              你的密码从头到尾没离开过微信。这套机制叫 OAuth,第 06 章见。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-title">🤖 问 AI 一个问题</div>
            <p>
              你敲下的问题被打包成请求,发给模型服务商的 API;答案就是响应体。
              所谓「接入 AI」,本质就是「调它的 API」。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="一条判断口诀">
          <p>
            这个功能需要<b>别人家的数据或服务</b>吗?需要,背后就有 API。
            自家设备本地就能办的(比如计算器算加法),才不用。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 JSON ================= */}
      <Section
        id="json"
        index="04"
        title="数据长什么样:JSON"
        desc="服务员端上来的「菜」,九成以上是这种格式。点每一行,看它是什么。"
      >
        <JsonAnatomy />
        <Callout tone="idea" title="为什么偏偏是 JSON?">
          <p>
            早年 API 界流行 XML,标签套标签,又重又啰嗦。JSON 轻、好读、和 JS
            对象几乎零转换,借着 Web 的东风把 XML 挤成了少数派。今天你看到的
            公开 API,响应格式几乎清一色是 JSON —— 但记住第 03 章会讲的:
            <b>REST 并没有规定必须用 JSON</b>,这只是大家不约而同的选择。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 真调一次 ================= */}
      <Section
        id="live"
        index="05"
        title="别光听我说 —— 现在就调一次"
        desc="下面这个演示不是动画,是你的浏览器真的在向公开服务器发请求。"
      >
        <LiveFetch />
      </Section>

      {/* ================= §06 两条路线 ================= */}
      <Section
        id="map"
        index="06"
        title="两种点菜方式:这门课的主线"
        desc="同一个后厨,可以有两种截然不同的点菜规矩 —— 这就是 REST 和 GraphQL。"
      >
        <div className="grid-2">
          <div className="card">
            <div className="card-kicker" style={{ color: "oklch(70% 0.14 196)" }}>
              REST
            </div>
            <div className="card-title">套餐制</div>
            <p>
              菜单上一道道「固定套餐」:每个网址对应一种资源,端上来的分量是
              后厨定好的。规矩简单、遍地都是,是今天 API 世界的普通话。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker" style={{ color: "oklch(70% 0.16 330)" }}>
              GraphQL
            </div>
            <div className="card-title">自选制</div>
            <p>
              一张点菜单,想吃什么勾什么:要哪些字段、要几层关联,一次说清,
              后厨按单出菜,不多给一口。Facebook 为移动端的痛点发明了它。
            </p>
          </div>
        </div>
        <p className="sec-desc" style={{ marginTop: 18 }}>
          这两种就是当今最主流的两套 API 风格,也是这门课的全部主线。
          下面是完整路线图 —— 从左上角出发,一章一章往下走,
          侧栏的小绿灯会记录你的战绩。
        </p>
        <CourseMap />
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="看会了不算会。三个任务,十分钟,今天就把「第一次调 API」这件事办了。"
      >
        <LabSet ch="home" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="七道题,全对点亮侧栏绿灯。答错不丢人,每个错误选项都有针对性的解释。"
      >
        <Quiz ch="home" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            API = 两段程序之间约好的「怎么问、怎么答」。菜单(文档)、
            点菜(请求)、上菜(响应),整门课就是这三件事。
          </>,
          <>
            谁发起请求谁是客户端,谁应答谁是服务器 —— 角色由问答关系决定,
            与设备无关。
          </>,
          <>
            前端永远不直接碰数据库:浏览器里没有秘密,API 服务器是那道
            必不可少的关卡。
          </>,
          <>
            网线上跑的永远是文本。JSON 是那段文本的通用格式,
            <code>response.json()</code> 负责把它复活成对象。
          </>,
          <>
            REST 是套餐,GraphQL 是自选 —— 两种点菜规矩,没有谁取代谁,
            终章教你怎么选。
          </>,
        ]}
      />

      <ChapterFooter ch="home" />
    </main>
  );
}
