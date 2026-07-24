"use client";

// 第 02 章 · 第一次调用 API ——
// 驾校毕业,今天上路:Promise 直觉 → res.ok 大坑 → 宝可梦查询器 → POST → DevTools → CORS 预告。

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
import { LABS, QUIZ } from "@/lib/first-call-data";
import { HeroDrive, FetchLab, PokedexWidget, NetworkTour } from "./viz";

/* ---------- §01 两种写法 ---------- */

const THEN_CODE = `// 写法一:.then 链
fetch("https://pokeapi.co/api/v2/pokemon/pikachu")
  .then((res) => res.json())
  .then((data) => {
    console.log(data.name, data.weight);
  });`;

const AWAIT_CODE = `// 写法二:async / await
async function show() {
  const url =
    "https://pokeapi.co/api/v2/pokemon/pikachu";
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.name, data.weight);
}`;

/* ---------- §02 标准错误处理模板 ---------- */

const TEMPLATE_CODE = `async function getJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // 404、500 会走到这里 —— 手动升级成错误
      throw new Error("HTTP " + res.status);
    }
    return await res.json();
  } catch (err) {
    // 网络故障 + 上面抛出的错,都在这兜底
    console.error("请求失败:", err.message);
    throw err;
  }
}`;

/* ---------- §03 宝可梦查询器 ---------- */

const POKE_HTML = `<input id="name" placeholder="输入宝可梦名字,如 pikachu" />
<button id="go">查询</button>
<div id="result"></div>
<script src="app.js"></script>`;

const POKE_JS = `const $ = (id) => document.getElementById(id);

$("go").addEventListener("click", async () => {
  const name = $("name").value.trim().toLowerCase();
  $("result").textContent = "查询中…";

  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + name);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const p = await res.json();

    $("result").innerHTML =
      '<img src="' + p.sprites.front_default + '" alt="' + p.name + '">' +
      "<p>身高 " + p.height / 10 + " 米 · 体重 " + p.weight / 10 + " 公斤</p>";
  } catch (err) {
    $("result").textContent = "查询失败:" + err.message;
  }
});`;

/* ---------- §04 POST ---------- */

const POST_CODE = `const newPost = { title: "上路第一天", body: "hello api", userId: 1 };

const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",                                  // ① 换动词
  headers: { "Content-Type": "application/json" }, // ② 声明正文格式
  body: JSON.stringify(newPost),                   // ③ 对象 → JSON 文本
});

console.log(res.status);          // 201
const created = await res.json();
console.log(created.id);          // 101,服务器分配的新 id`;

export default function FirstCallPage() {
  return (
    <main className="page" data-ch="first-call">
      <Hero
        ch="first-call"
        title={
          <>
            第一次<span className="grad">调用 API</span>
          </>
        }
        essence={
          <>
            前两章是驾校理论课,今天正式上路。十行 JavaScript,
            把真实世界的数据拿进你的网页 ——
            路上有一个几乎人人都栽的坑,这次我们提前踩给你看。
          </>
        }
        chips={[
          { id: "promise", n: "01", label: "fetch 与取餐码" },
          { id: "resok", n: "02", label: "最大的坑:res.ok" },
          { id: "pokedex", n: "03", label: "从数据到页面" },
          { id: "post", n: "04", label: "发送数据:POST" },
          { id: "network", n: "05", label: "Network 面板" },
          { id: "cors", n: "06", label: "CORS 第一面" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <HeroDrive />
      </Hero>

      {/* ================= §01 fetch 全家福 ================= */}
      <Section
        id="promise"
        index="01"
        title="fetch 全家福:先把 Promise 的直觉立住"
        desc="fetch 不直接给你数据,它给你一张「取餐码」。想通这一层,后面全是顺水推舟。"
      >
        <Callout tone="story" title="奶茶店的取餐码">
          <p>
            你在奶茶店下单,店员不会让你在柜台前罚站盯着摇 ——
            给你一张<b>取餐码</b>,你先该干嘛干嘛,叫到号再来拿。
          </p>
          <p>
            fetch 一模一样。网络一来一回动辄几百毫秒,JS 又是单线程,
            不可能原地傻等。所以 <code>fetch(url)</code> 一执行,
            <b>立刻</b>还你一张取餐码 —— 术语叫{" "}
            <b>Promise(承诺)</b>:「东西还没好,但我保证之后给你个结果,
            或好或坏。」真正的响应到货后,你凭码取餐。
          </p>
        </Callout>

        <p className="sec-desc">
          「凭码取餐」有两种写法,效果完全等价 —— 左边是老派的 .then
          链,右边是现在的主流:
        </p>
        <CodePair
          left={<CodeBlock lang="js" title="then.js" code={THEN_CODE} />}
          right={
            <CodeBlock
              lang="js"
              title="await.js"
              code={AWAIT_CODE}
              note={
                <>
                  <b>await = 「等这张码兑现,再走下一行」。</b>
                  读起来像同步代码,出错好排查 ——{" "}
                  本书从这里起统一用 await。
                </>
              }
            />
          }
        />

        <Callout tone="idea" title="为什么要 await 两次?">
          <p>
            第一次 <code>await fetch(url)</code> 等的是「响应头到货」——
            这时你已经能看 <code>res.status</code> 了;第二次{" "}
            <code>await res.json()</code> 等的是「正文全部下载完并解析成对象」——
            它自己也是个 Promise。两张码,分两次兑。
          </p>
          <p>
            三条附则:① await 只能写在 async 函数里(现代浏览器的 Console
            和 JS 模块顶层也行,所以 Labs 里可以直接敲);② async
            函数的返回值<b>永远</b>被自动包成 Promise;③ 所以调用它的人
            往往也得 await —— async 会「传染」,这是正常现象。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 res.ok ================= */}
      <Section
        id="resok"
        index="02"
        title="最大的坑:fetch 对 404 不报错"
        desc="第一次调 API 的人,十个有九个栽在这。今天把它一次性踩平。"
      >
        <Callout tone="warn" title="fetch 的「成功」和你想的不一样">
          <p>
            你以为 404、500 会跳进 catch?不会。在 fetch 眼里,
            <b>「信寄到了、对方回了话」就算成功</b> ——
            哪怕回的是 404。只有网络层失败(断网、域名解析不了、CORS
            拦截)它才 reject。
          </p>
          <p>
            所以必须自己检查 <code>res.ok</code>(状态码 200–299 时为
            true),不查,404 的响应体就会被你当正常数据往下传,
            最后在离案发现场很远的地方炸出一串 undefined。
          </p>
        </Callout>

        <CodeBlock
          lang="js"
          title="标准错误处理模板 · 建议背下来"
          code={TEMPLATE_CODE}
          hl={[4, 5, 6]}
          note={
            <>
              高亮三行是整个模板的灵魂:把「HTTP 层面的坏消息」手动升级成
              JS 错误,让所有失败最终都汇进 catch。
              这套 <b>try → if (!res.ok) throw → catch</b>{" "}
              三段式,本书后面的代码全长这样。
            </>
          }
        />

        <FetchLab />
      </Section>

      {/* ================= §03 从数据到页面 ================= */}
      <Section
        id="pokedex"
        index="03"
        title="从数据到页面:宝可梦查询器"
        desc="拿到 JSON 只是半场 —— 把它变成用户看得见的界面,才算一次完整的前端调用。"
      >
        <p className="sec-desc">
          完整小项目:输入名字 → fetch <b>PokeAPI</b>(免费免注册的宝可梦资料库)
          → 把身高体重和小图渲染到页面。两个文件,整段可抄:
        </p>

        <CodeBlock
          lang="bash"
          title="index.html"
          code={POKE_HTML}
          note={
            <>
              页面就三个角色:输入框、按钮、结果容器 ——
              留好 id,JS 靠它们找人。
            </>
          }
        />
        <CodeBlock
          lang="js"
          title="app.js"
          code={POKE_JS}
          hl={[5, 12, 13, 14, 16]}
          note={
            <>
              高亮的就是「改 DOM」的那几行:请求前先写一句「查询中…」
              给用户交代;数据到手,把 JSON 里的字段拼成 HTML 塞进{" "}
              <code>innerHTML</code>;失败了也要说人话。
              <b>fetch → res.json() → 改 DOM</b>,前端的日常三步,就这么多。
            </>
          }
        />

        <p className="sec-desc" style={{ marginTop: 18 }}>
          光抄不过瘾 —— 下面这个是真的能玩的,和上面同一套逻辑:
        </p>
        <PokedexWidget />
      </Section>

      {/* ================= §04 发送数据 ================= */}
      <Section
        id="post"
        index="04"
        title="发送数据:POST 三件套"
        desc="前面都是「要数据」,现在轮到「交数据」—— 注册、发帖、下单,全是这个姿势。"
      >
        <CodeBlock
          lang="js"
          title="post.js"
          code={POST_CODE}
          hl={[4, 5, 6]}
          note={
            <>
              fetch 的第二个参数是「选项对象」,高亮的三行就是{" "}
              <b>POST 三件套</b>:换动词、声明格式、序列化正文。
              回来的 201 + 新 id,正是第 01 章讲过的「创建成功」标准剧本。
            </>
          }
        />

        <Callout tone="warn" title="三件套,一件都不能少">
          <p>
            <b>忘了 JSON.stringify?</b>fetch 会把对象硬转成字符串,
            服务器收到的正文是 <code>[object Object]</code> ——
            一个字段都解析不出来。
            <b>忘了 Content-Type?</b>服务器可能按纯文本或表单去解析你的
            JSON,轻则字段全空,重则直接 400。
            <b>忘了 method?</b>默认是 GET,而 GET 根本不带请求体 ——
            你的数据压根没上车。
          </p>
          <p>
            以后遇到「明明传了数据服务器说没收到」,先按这个顺序查一遍,
            十有八九三件套缺了一件。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 Network 面板 ================= */}
      <Section
        id="network"
        index="05"
        title="DevTools Network 面板:你的行车记录仪"
        desc="代码说不清的,报文说得清。F12 → Network,每一次请求的完整档案都在这里。点标签逛一圈。"
      >
        <NetworkTour />

        <Callout tone="warn" title="补一刀:响应体只能读一次">
          <p>
            <code>res.json()</code> 读的是一条<b>流(stream)</b> ——
            水管里的水流过就没了。对同一个 res 调第二次{" "}
            <code>res.json()</code>,直接报错:
            <code>body stream already read</code>。想复用?第一次就{" "}
            <code>const data = await res.json()</code> 存进变量。
            (DevTools 里能反复查看,是浏览器另外替你留了底,
            不是你的代码有第二次机会。)
          </p>
        </Callout>
      </Section>

      {/* ================= §06 CORS 第一面 ================= */}
      <Section
        id="cors"
        index="06"
        title="CORS 第一面:是规矩,不是故障"
        desc="总有一天你会撞上它 —— 提前认个脸,到时候不慌。"
      >
        <p className="sec-desc">
          某天你调一个新 API:curl 通,Postman 通,偏偏浏览器里的 fetch
          报一堆红字,里面有 <b>CORS policy</b> 几个词。第一反应往往是
          「API 挂了?」—— 不,API 好好的,是<b>你自己的浏览器</b>把响应扣下了。
        </p>
        <Callout tone="deep" title="一句话讲清同源策略">
          <p>
            浏览器有条铁律叫<b>同源策略(same-origin policy)</b>:A
            网站的脚本,默认不许读取 B 域名的响应 —— 除非 B 在响应头里明确点头
            (那个头叫 <code>Access-Control-Allow-Origin</code>)。
            这套「跨域资源共享」规矩就是{" "}
            <b>CORS(Cross-Origin Resource Sharing)</b>。
            它是保护用户的安全机制,不是 API 的防火墙,更不是故障。
          </p>
          <p>
            本章用的 PokeAPI、JSONPlaceholder、Open-Meteo 都是「点过头」的
            公开 API,所以一路畅通。谁在拦、怎么放行、OPTIONS
            预检请求又是怎么回事 —— 第 06 章连同认证一起讲透。
            现在只需记住:<b>CORS 报错 ≠ API 挂了,curl 能通就说明链路没问题。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="驾照到手,上真路。三个任务全用免费免注册的真 API,Console 里就能跑。"
      >
        <LabSet ch="first-call" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="八道题,专考本章的坑 —— 全对说明你真的绕过去了。"
      >
        <Quiz ch="first-call" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            fetch 立刻返回的是 <b>Promise(取餐码)</b>,await
            负责「等到货再往下走」;async 函数的返回值也永远是 Promise。
          </>,
          <>
            fetch 只有网络层失败才 reject —— 404、500
            是「正常收到的坏消息」。<b>try → if (!res.ok) throw → catch</b>{" "}
            三段式当模板背下来。
          </>,
          <>
            数据到页面就三步:fetch → res.json() → 改 DOM。
            响应体是流,只能读一次,要复用先存变量。
          </>,
          <>
            POST 三件套:method、Content-Type: application/json、
            JSON.stringify(body) —— 缺一件,数据就到不了对岸。
          </>,
          <>
            说不清的问题去 Network 面板对质:Headers 看信封、Payload
            看寄出的、Response 看收到的、Timing 看时间花在哪。
          </>,
          <>
            CORS 报错是浏览器在执行同源策略,不是 API 挂了 ——
            第 06 章见分晓。
          </>,
        ]}
      />

      <ChapterFooter ch="first-call" />
    </main>
  );
}
