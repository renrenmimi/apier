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
import { T } from "@/lib/i18n";
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
        title={{
          en: (
            <>
              What is an <span className="grad">API</span>
            </>
          ),
          zh: (
            <>
              API <span className="grad">是什么</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              You can write HTML and CSS, and you have used some JavaScript. But
              where does the data on a page come from? This chapter answers that
              from the beginning.
            </>
          ),
          zh: (
            <>
              你会写 HTML、CSS,也摸过 JavaScript —— 但页面上的数据从哪来?
              这一章把「前端要数据」这件事,从第一块砖讲起。
            </>
          ),
        }}
        chips={[
          { id: "story", n: "01", label: { en: "A restaurant", zh: "从一顿饭说起" } },
          { id: "journey", n: "02", label: { en: "One call", zh: "一次调用的旅程" } },
          { id: "everywhere", n: "03", label: { en: "APIs everywhere", zh: "生活里全是 API" } },
          { id: "json", n: "04", label: "JSON" },
          { id: "live", n: "05", label: { en: "Try it live", zh: "真调一次" } },
          { id: "map", n: "06", label: { en: "Two routes", zh: "两条路线" } },
          { id: "labs", n: "07", label: { en: "Labs", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroLoop />
      </Hero>

      {/* ================= §01 从一顿饭说起 ================= */}
      <Section
        id="story"
        index="01"
        title={{ en: "Start with a restaurant", zh: "从一顿饭说起" }}
        desc={{
          en: "This is the most useful comparison in the whole course. The other eleven chapters keep coming back to it.",
          zh: "整门课最重要的一个比喻,先把它吃透 —— 后面十一章会反复用到它。",
        }}
      >
        <Callout
          tone="story"
          title={{ en: "You sit down in a restaurant", zh: "你进了一家餐厅" }}
        >
          <T
            en={
              <>
                <p>
                  You want a plate of noodles. You do not walk into the kitchen
                  and cook it yourself. You sit down, open the <b>menu</b>, tell
                  the <b>waiter</b> what you want, and the waiter passes your
                  order to the kitchen. A few minutes later the food arrives.
                </p>
                <p>
                  Software works the same way. Your web page needs data. It
                  cannot go into another company&apos;s database and take it.
                  Instead it follows the format written in the{" "}
                  <b>API documentation (the menu)</b>, hands the request to the{" "}
                  <b>API (the waiter)</b>, and the API gets the data from the{" "}
                  <b>server and database (the kitchen)</b> and brings it back.
                </p>
                <p>
                  API stands for Application Programming Interface. The full
                  name sounds heavy, but the idea is one sentence:{" "}
                  <b>
                    an agreed set of rules for how one program asks another
                    program for something, and how the answer comes back.
                  </b>
                </p>
              </>
            }
            zh={
              <>
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
              </>
            }
          />
        </Callout>

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="The menu" zh="菜单" />
            </div>
            <div className="card-title">
              <T en="API documentation" zh="API 文档" />
            </div>
            <p>
              <T
                en="It lists what you can order, how to order it, and what comes back. Reading the documentation is reading the menu."
                zh="写清楚有哪些「菜」能点、怎么点、端上来长什么样。读文档 = 看菜单。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Ordering" zh="点菜" />
            </div>
            <div className="card-title">
              <T en="The request" zh="请求 Request" />
            </div>
            <p>
              <T
                en="What you say, in the format the menu defines. If the format is wrong, the waiter cannot understand you and no food arrives."
                zh="你按菜单格式说出的那句话。格式错了,服务员听不懂,菜就上不来。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Serving" zh="上菜" />
            </div>
            <div className="card-title">
              <T en="The response" zh="响应 Response" />
            </div>
            <p>
              <T
                en="What comes back. It may be the data you asked for, or a message saying the dish is sold out. Both of those are responses."
                zh="端回来的结果:可能是你要的数据,也可能是一句「卖完了」——两种都是响应。"
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §02 一次调用的旅程 ================= */}
      <Section
        id="journey"
        index="02"
        title={{
          en: "Client, server, and the full trip of one call",
          zh: "客户端、服务器,和一次调用的完整旅程",
        }}
        desc={{
          en: "Who asks, who answers, where the data lives, and whose hands it passes through. The player below shows it one step at a time.",
          zh: "谁问,谁答;数据住在哪,经过谁的手。用播放器一帧一帧看明白。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Two words to remember. The side that starts the request is the{" "}
                <b>client</b>. The side that holds the data and answers is the{" "}
                <b>server</b>. Your browser and your phone apps are clients. A
                server is a computer that stays on, running a program whose only
                job is to listen for requests, do the work, and reply.
              </>
            }
            zh={
              <>
                两个要背下来的词:发起请求的一方叫<b>客户端(client)</b>
                ,守着数据、负责应答的一方叫<b>服务器(server)</b>。
                你的浏览器、手机 App 都是客户端;服务器就是一台永远开机的电脑,
                跑着一段专门「听请求、办事、回话」的程序。
              </>
            }
          />
        </p>

        <JourneyFlow />

        <Callout
          tone="warn"
          title={{
            en: "Why does a web page never connect to the database directly?",
            zh: "为什么网页永远不直接碰数据库?",
          }}
        >
          <T
            en={
              <>
                <p>
                  Because <b>every line of code in the browser is visible</b> to
                  the user. Press F12 and you can read it. A database password
                  written into front-end code is a public password.
                </p>
                <p>
                  There is a second reason. Someone has to decide which user is
                  allowed to see which data. That decision has to happen on a
                  machine the user does not control, and that machine is the API
                  server.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  因为浏览器里的代码,<b>用户按 F12 全都看得见</b>。
                  数据库密码写进前端,等于公开。
                </p>
                <p>
                  还有第二个原因:「谁能看谁的数据」这件事必须有人把关,
                  而且要在用户控制不到的机器上把关 —— 这台机器就是 API 服务器。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 生活里全是 API ================= */}
      <Section
        id="everywhere"
        index="03"
        title={{
          en: "You have already used APIs dozens of times today",
          zh: "你今天已经用过几十次 API 了",
        }}
        desc={{
          en: "An API is not an obscure technical term. It is closer to plumbing: it is everywhere and you rarely see it.",
          zh: "API 不是什么冷僻的技术名词,它是现代生活的自来水管。",
        }}
      >
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-title">
              <T en="☀️ Checking the weather" zh="☀️ 看一眼天气" />
            </div>
            <p>
              <T
                en="A weather app does not measure the atmosphere itself. It calls a weather service API, receives JSON such as city, 26°C, cloudy, and draws an interface from it."
                zh="天气 App 自己不观测大气 —— 它调气象服务的 API,把「杭州,26°C,多云」这份 JSON 要过来,画成漂亮的界面。"
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-title">
              <T en="Paying for coffee" zh="扫码付一杯咖啡" />
            </div>
            <p>
              <T
                en="The card reader calls the payment provider's API: charge this customer 4.50. The beep you hear is an API call that came back successfully."
                zh="收银机调支付平台的 API:「向这位顾客收 28 元」。你听到的那声「叮」,是一次 API 调用成功返回的声音。"
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-title">
              <T en="&quot;Sign in with Google&quot;" zh="「用微信登录」" />
            </div>
            <p>
              <T
                en="A site you have never used does not know who you are, so it asks Google to confirm your identity. Your Google password never leaves Google. That mechanism is OAuth 2.0, covered in chapter 06."
                zh="陌生网站不知道你是谁,它调微信的 API 替你验明正身 —— 你的密码从头到尾没离开过微信。这套机制叫 OAuth 2.0,第 06 章见。"
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-title">
              <T en="Asking an AI a question" zh="问 AI 一个问题" />
            </div>
            <p>
              <T
                en="Your question is packed into a request and sent to the model provider's API. The answer is the response body. Adding AI to a product mostly means calling that API."
                zh="你敲下的问题被打包成请求,发给模型服务商的 API;答案就是响应体。所谓「接入 AI」,本质就是「调它的 API」。"
              />
            </p>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{ en: "A quick test", zh: "一条判断口诀" }}
        >
          <T
            en={
              <>
                <p>
                  Does this feature need <b>data or a service that belongs to
                  someone else</b>? If yes, there is an API behind it. If the
                  device can do the whole job on its own, for example a
                  calculator adding two numbers, there is no API call.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  这个功能需要<b>别人家的数据或服务</b>吗?需要,背后就有 API。
                  自家设备本地就能办的(比如计算器算加法),才不用。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 JSON ================= */}
      <Section
        id="json"
        index="04"
        title={{ en: "What the data looks like: JSON", zh: "数据长什么样:JSON" }}
        desc={{
          en: "More than nine out of ten API responses use this format. Click each line to see what it is.",
          zh: "服务员端上来的「菜」,九成以上是这种格式。点每一行,看它是什么。",
        }}
      >
        <JsonAnatomy />
        <Callout tone="idea" title={{ en: "Why JSON?", zh: "为什么偏偏是 JSON?" }}>
          <T
            en={
              <>
                <p>
                  Early APIs mostly used XML, where every value sits inside a
                  pair of tags. XML is precise but verbose. JSON is smaller,
                  easier to read, and converts to a JavaScript object with
                  almost no work, so it became the common choice on the web.
                  Nearly every public API you meet today returns JSON. Keep one
                  thing in mind for chapter 03:{" "}
                  <b>REST does not require JSON</b>. This is a convention, not a
                  rule.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  早年 API 界流行 XML,标签套标签,精确但啰嗦。JSON 轻、好读、和
                  JS 对象几乎零转换,借着 Web 的东风成了大多数人的选择。
                  今天你看到的公开 API,响应格式几乎清一色是 JSON —— 但记住第 03
                  章会讲的:
                  <b>REST 并没有规定必须用 JSON</b>,这只是惯例,不是规则。
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 真调一次 ================= */}
      <Section
        id="live"
        index="05"
        title={{
          en: "Do not take my word for it. Send a request now",
          zh: "别光听我说 —— 现在就调一次",
        }}
        desc={{
          en: "The demo below is not an animation. Your browser really sends a request to a public server.",
          zh: "下面这个演示不是动画,是你的浏览器真的在向公开服务器发请求。",
        }}
      >
        <LiveFetch />
      </Section>

      {/* ================= §06 两条路线 ================= */}
      <Section
        id="map"
        index="06"
        title={{
          en: "Two ways to order: the main line of this course",
          zh: "两种点菜方式:这门课的主线",
        }}
        desc={{
          en: "The same kitchen can accept orders under two very different sets of rules. Those two are REST and GraphQL.",
          zh: "同一个后厨,可以有两种截然不同的点菜规矩 —— 这就是 REST 和 GraphQL。",
        }}
      >
        <div className="grid-2">
          <div className="card">
            <div className="card-kicker" style={{ color: "oklch(70% 0.14 196)" }}>
              REST
            </div>
            <div className="card-title">
              <T en="Fixed sets" zh="套餐制" />
            </div>
            <p>
              <T
                en="The menu lists fixed dishes. Each URL identifies one resource, and the server decides which fields come back. The rules are simple and the style is used almost everywhere, so REST is the common language of today's APIs."
                zh="菜单上一道道「固定套餐」:每个网址对应一种资源,端上来的分量是后厨定好的。规矩简单、遍地都是,是今天 API 世界的普通话。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker" style={{ color: "oklch(70% 0.16 330)" }}>
              GraphQL
            </div>
            <div className="card-title">
              <T en="Choose your own" zh="自选制" />
            </div>
            <p>
              <T
                en="One order form where you tick what you want: which fields, and how many levels of related data, all stated in a single request. The server returns exactly that. Facebook created it to solve problems in its mobile app."
                zh="一张点菜单,想吃什么勾什么:要哪些字段、要几层关联,一次说清,后厨按单出菜,不多给一口。Facebook 为移动端的痛点发明了它。"
              />
            </p>
          </div>
        </div>
        <p className="sec-desc" style={{ marginTop: 18 }}>
          <T
            en="These two styles cover most APIs in use today, and they are the main line of this course. The full map is below. Start at the top left and work down. The small dots in the sidebar record your progress."
            zh="这两种就是当今最主流的两套 API 风格,也是这门课的全部主线。下面是完整路线图 —— 从左上角出发,一章一章往下走,侧栏的小绿灯会记录你的战绩。"
          />
        </p>
        <CourseMap />
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Labs", zh: "动手任务" }}
        desc={{
          en: "Reading is not the same as knowing. Three tasks, about ten minutes, and you will have made your first API call today.",
          zh: "看会了不算会。三个任务,十分钟,今天就把「第一次调 API」这件事办了。",
        }}
      >
        <LabSet ch="home" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Seven questions. Get them all right to light the dot in the sidebar. Every wrong option has its own explanation.",
          zh: "七道题,全对点亮侧栏绿灯。答错不丢人,每个错误选项都有针对性的解释。",
        }}
      >
        <Quiz ch="home" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                An API is an agreed set of rules for how one program asks
                another for something and how the answer comes back. The menu
                (documentation), the order (request), and the food (response)
                are the three things this course is about.
              </>
            ),
            zh: (
              <>
                API = 两段程序之间约好的「怎么问、怎么答」。菜单(文档)、
                点菜(请求)、上菜(响应),整门课就是这三件事。
              </>
            ),
          },
          {
            en: (
              <>
                The side that sends the request is the client. The side that
                answers is the server. The roles come from who asks and who
                answers, not from the type of device.
              </>
            ),
            zh: (
              <>
                谁发起请求谁是客户端,谁应答谁是服务器 —— 角色由问答关系决定,
                与设备无关。
              </>
            ),
          },
          {
            en: (
              <>
                Front-end code never connects to the database directly. Nothing
                in the browser is secret, so the API server is the checkpoint
                that keeps credentials and decides who may read what.
              </>
            ),
            zh: (
              <>
                前端永远不直接碰数据库:浏览器里没有秘密,API 服务器是那道
                必不可少的关卡,负责保管凭证、决定谁能看什么。
              </>
            ),
          },
          {
            en: (
              <>
                Only text travels over the network. JSON is the common format
                for that text, and <code>response.json()</code> turns it back
                into an object you can use.
              </>
            ),
            zh: (
              <>
                网线上跑的永远是文本。JSON 是那段文本的通用格式,
                <code>response.json()</code> 负责把它复活成对象。
              </>
            ),
          },
          {
            en: (
              <>
                REST serves fixed sets, GraphQL lets the client choose. They are
                two ways of ordering, and neither replaces the other. The final
                chapter shows you how to choose.
              </>
            ),
            zh: (
              <>
                REST 是套餐,GraphQL 是自选 —— 两种点菜规矩,没有谁取代谁,
                终章教你怎么选。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="home" />
    </main>
  );
}
