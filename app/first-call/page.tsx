"use client";

// 第 02 章 · 第一次调用 API(双语,英文默认):
// Promise 是什么 → 两次 await 分别等什么 → res.ok 大坑 + res.json() 也会失败 →
// 宝可梦查询器 → POST 三件套 → Network 面板 → CORS 第一面 → 动手 → 测验 → 要点。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。
// 代码块只有注释双语,可执行行两种语言必须逐字节一致。

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
import { T } from "@/lib/i18n";
import { HeroDrive, FetchLab, PokedexWidget, NetworkTour } from "./viz";

/* ---------- §01 两种写法 ---------- */

const THEN_CODE = {
  en: `// Style 1: a chain of .then calls
fetch("https://pokeapi.co/api/v2/pokemon/pikachu")
  .then((res) => res.json())
  .then((data) => {
    console.log(data.name, data.weight);
  });`,
  zh: `// 写法一:.then 链
fetch("https://pokeapi.co/api/v2/pokemon/pikachu")
  .then((res) => res.json())
  .then((data) => {
    console.log(data.name, data.weight);
  });`,
};

const AWAIT_CODE = {
  en: `// Style 2: async / await
async function show() {
  const url =
    "https://pokeapi.co/api/v2/pokemon/pikachu";
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.name, data.weight);
}`,
  zh: `// 写法二:async / await
async function show() {
  const url =
    "https://pokeapi.co/api/v2/pokemon/pikachu";
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.name, data.weight);
}`,
};

/* ---------- §02 标准错误处理模板 ---------- */

const TEMPLATE_CODE = {
  en: `async function getJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // 404 and 500 arrive here. Raise the status into an error.
      throw new Error("HTTP " + res.status);
    }
    return await res.json();
  } catch (err) {
    // Network failures and the error thrown above both land here.
    console.error("Request failed:", err.message);
    throw err;
  }
}`,
  zh: `async function getJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // 404、500 会走到这里,把状态升级成错误
      throw new Error("HTTP " + res.status);
    }
    return await res.json();
  } catch (err) {
    // 网络故障,以及上面抛出的错误,都汇到这里
    console.error("Request failed:", err.message);
    throw err;
  }
}`,
};

/* ---------- §03 宝可梦查询器 ---------- */

const POKE_HTML = `<input id="name" placeholder="Pokemon name, for example pikachu" />
<button id="go">Search</button>
<div id="result"></div>
<script src="app.js"></script>`;

const POKE_JS = `const $ = (id) => document.getElementById(id);

$("go").addEventListener("click", async () => {
  const name = $("name").value.trim().toLowerCase();
  $("result").textContent = "Loading...";

  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + name);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const p = await res.json();

    $("result").innerHTML =
      '<img src="' + p.sprites.front_default + '" alt="' + p.name + '">' +
      "<p>Height " + p.height / 10 + " m · Weight " + p.weight / 10 + " kg</p>";
  } catch (err) {
    $("result").textContent = "Request failed: " + err.message;
  }
});`;

/* ---------- §04 POST ---------- */

const POST_CODE = {
  en: `const newPost = { title: "My first post", body: "hello api", userId: 1 };

const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",                                  // ① change the verb
  headers: { "Content-Type": "application/json" }, // ② declare the body format
  body: JSON.stringify(newPost),                   // ③ object -> JSON text
});

console.log(res.status);          // 201
const created = await res.json();
console.log(created.id);          // 101, the id the server assigned`,
  zh: `const newPost = { title: "My first post", body: "hello api", userId: 1 };

const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",                                  // ① 换动词
  headers: { "Content-Type": "application/json" }, // ② 声明正文格式
  body: JSON.stringify(newPost),                   // ③ 对象转成 JSON 文本
});

console.log(res.status);          // 201
const created = await res.json();
console.log(created.id);          // 101,服务器分配的新 id`,
};

export default function FirstCallPage() {
  return (
    <main className="page" data-ch="first-call">
      <Hero
        ch="first-call"
        title={{
          en: (
            <>
              Your first <span className="grad">API call</span>
            </>
          ),
          zh: (
            <>
              第一次<span className="grad">调用 API</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Chapter 01 described what an HTTP request looks like. This chapter
              sends one. About ten lines of JavaScript are enough to bring real
              data from a public server into your page. One step in the middle
              catches almost every beginner, so this chapter covers it early.
            </>
          ),
          zh: (
            <>
              第 01 章讲了 HTTP 请求长什么样,这一章真的发一个出去。
              十来行 JavaScript,就能把真实服务器上的数据取进你的网页。
              中间有一步几乎人人都会踩,所以这一章早早把它讲清楚。
            </>
          ),
        }}
        chips={[
          {
            id: "promise",
            n: "01",
            label: { en: "fetch and Promises", zh: "fetch 与 Promise" },
          },
          {
            id: "resok",
            n: "02",
            label: { en: "The res.ok trap", zh: "最大的坑:res.ok" },
          },
          {
            id: "pokedex",
            n: "03",
            label: { en: "From data to page", zh: "从数据到页面" },
          },
          {
            id: "post",
            n: "04",
            label: { en: "Sending data: POST", zh: "发送数据:POST" },
          },
          {
            id: "network",
            n: "05",
            label: { en: "The Network panel", zh: "Network 面板" },
          },
          {
            id: "cors",
            n: "06",
            label: { en: "A first look at CORS", zh: "CORS 第一面" },
          },
          { id: "labs", n: "07", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroDrive />
      </Hero>

      {/* ================= §01 fetch 与 Promise ================= */}
      <Section
        id="promise"
        index="01"
        title={{
          en: "fetch and the Promise it returns",
          zh: "fetch 与它返回的 Promise",
        }}
        desc={{
          en: "fetch does not give you the data. It gives you an object that stands for data which has not arrived yet.",
          zh: "fetch 不直接给你数据,它给你一个「代表将来某个结果」的对象。",
        }}
      >
        <Callout
          tone="story"
          title={{ en: "A ticket at the counter", zh: "柜台的取餐码" }}
        >
          <p>
            <T
              en={
                <>
                  You order a drink at a counter. The staff do not make you stand
                  there and watch. They hand you a numbered ticket, you do
                  something else, and you come back when your number is called.
                </>
              }
              zh={
                <>
                  在柜台点一杯饮料,店员不会让你站在那儿盯着看,
                  而是给你一张取餐码 —— 你先去做别的,叫到号再回来取。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  fetch works the same way. One round trip over the network often
                  takes hundreds of milliseconds, and JavaScript runs on a single
                  thread, so it cannot stop and wait. The moment{" "}
                  <code>fetch(url)</code> runs, it returns an object that stands
                  for a result which has not arrived yet and which will later
                  either succeed or fail. That object is called a{" "}
                  <b>Promise</b>. When the response arrives, the Promise settles:
                  it either <b>resolves</b> with a value or <b>rejects</b> with
                  an error.
                </>
              }
              zh={
                <>
                  fetch 也是这样。一次网络往返动辄几百毫秒,
                  而 JavaScript 只有一条线程,不能停下来干等。所以{" "}
                  <code>fetch(url)</code> 一执行,立刻返回一个对象:
                  它代表一个还没到手、将来会成功或失败的结果。这个对象叫{" "}
                  <b>Promise</b>。响应到达时,这个 Promise 就有了结果 ——
                  要么带着值<b>兑现(resolve)</b>,要么带着错误
                  <b>失败(reject)</b>。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                There are two ways to get the value out of a Promise, and they do
                the same thing. On the left is the older <code>.then</code>{" "}
                chain. On the right is <code>async</code> / <code>await</code>,
                which is what most code uses now.
              </>
            }
            zh={
              <>
                从 Promise 里取值有两种写法,效果完全一样。左边是更早的{" "}
                <code>.then</code> 链,右边是现在多数代码用的 <code>async</code>{" "}
                / <code>await</code>。
              </>
            }
          />
        </p>
        <CodePair
          left={<CodeBlock lang="js" title="then.js" code={THEN_CODE} />}
          right={
            <CodeBlock
              lang="js"
              title="await.js"
              code={AWAIT_CODE}
              note={{
                en: (
                  <>
                    <b>
                      await pauses the surrounding async function until the
                      Promise settles, then gives you its value.
                    </b>{" "}
                    It does not block the browser: other code, clicks, and
                    animations keep running while that function is paused.
                    async/await is a shorter way to write Promise code, not a way
                    to make it synchronous. The rest of this book uses await.
                  </>
                ),
                zh: (
                  <>
                    <b>
                      await 会暂停它所在的 async 函数,直到 Promise
                      有了结果,再把值交给你。
                    </b>
                    它不会阻塞浏览器:函数暂停期间,其他代码、点击和动画照常运行。
                    async/await 只是写 Promise 的更短写法,
                    并没有把异步变成同步。本书之后统一用 await。
                  </>
                ),
              }}
            />
          }
        />

        <Callout
          tone="idea"
          title={{ en: "Why two awaits?", zh: "为什么要 await 两次?" }}
        >
          <p>
            <T
              en={
                <>
                  The two awaits wait for two different things. The first one,{" "}
                  <code>await fetch(url)</code>, resolves as soon as the{" "}
                  <b>response headers</b> have arrived. At that point you can
                  read <code>res.status</code> and <code>res.headers</code>, but
                  the body may still be downloading. The second one,{" "}
                  <code>await res.json()</code>, reads the body and parses it
                  into a JavaScript value. Reading the body is a separate
                  asynchronous step, so <code>res.json()</code> returns a Promise
                  of its own.
                </>
              }
              zh={
                <>
                  两次 await 等的不是同一件事。第一次{" "}
                  <code>await fetch(url)</code>,在<b>响应头</b>到达时就兑现了 ——
                  这时你已经能读 <code>res.status</code> 和{" "}
                  <code>res.headers</code>,但正文可能还在下载。第二次{" "}
                  <code>await res.json()</code>,才是把正文读完并解析成
                  JavaScript 的值。读正文是另一个异步步骤,所以{" "}
                  <code>res.json()</code> 自己也返回一个 Promise。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Three notes. ① <code>await</code> normally has to be inside an{" "}
                  <code>async</code> function; ES modules and the browser console
                  also allow it at the top level, which is why you can type it
                  straight into the console for the practice tasks. ② An async
                  function <b>always</b> returns a Promise, whatever value you
                  return inside it. ③ So whoever calls it usually has to await it
                  too. async spreads outward along the call chain. That is
                  expected, not a mistake.
                </>
              }
              zh={
                <>
                  三点补充:① <code>await</code> 通常必须写在 <code>async</code>{" "}
                  函数里;ES 模块和浏览器 Console 也允许顶层 await,
                  所以动手任务可以直接在 Console 里敲。② async 函数的返回值
                  <b>一定</b>是 Promise,不管你在里面 return
                  了什么。③ 因此调用它的人通常也要 await。async
                  会沿着调用链一路往外传,这是正常现象,不是写错了。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 res.ok ================= */}
      <Section
        id="resok"
        index="02"
        title={{
          en: "The main trap: fetch does not reject on 404",
          zh: "最大的坑:fetch 对 404 不报错",
        }}
        desc={{
          en: "This is the mistake almost everyone makes on their first API call. It is easier to learn it now than to debug it later.",
          zh: "第一次调 API 的人几乎都栽在这里。现在讲清楚,好过将来慢慢排查。",
        }}
      >
        <Callout
          tone="warn"
          title={{
            en: "'Success' means something narrower than you expect",
            zh: "fetch 说的「成功」比你想的窄",
          }}
        >
          <p>
            <T
              en={
                <>
                  You might expect 404 and 500 to jump into <code>catch</code>.
                  They do not. For fetch, the call succeeded if the request
                  reached the server and a response came back — even when that
                  response says 404. The Promise from fetch rejects only when the
                  request fails at the <b>network level</b>: no connection, a
                  hostname that does not resolve, a request that was aborted, or
                  a response the browser blocked under the CORS rules.
                </>
              }
              zh={
                <>
                  你可能以为 404、500 会跳进 <code>catch</code>,其实不会。
                  在 fetch 看来,只要请求送到了服务器、并且收到了回应,
                  这次调用就算成功 —— 哪怕回应写着 404。fetch 返回的 Promise
                  只在<b>网络层</b>失败时才 reject:连不上、域名解析不了、
                  请求被中止,或者响应被浏览器按 CORS 规则拦下。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  So you have to check the status yourself. <code>res.ok</code>{" "}
                  is true when the status code is between 200 and 299. Skip that
                  check and the body of a 404 response gets passed along as if it
                  were normal data. The program then fails much later, far from
                  the real cause, usually with a string of{" "}
                  <code>undefined</code>.
                </>
              }
              zh={
                <>
                  所以状态必须你自己检查。<code>res.ok</code> 在状态码落在
                  200–299 时为 true。不查这一步,404
                  响应的正文就会被当成正常数据继续往下传,
                  程序往往在离出错点很远的地方才崩,而且崩出一串{" "}
                  <code>undefined</code>。
                </>
              }
            />
          </p>
        </Callout>

        <CodeBlock
          lang="js"
          title={{
            en: "The standard error-handling shape",
            zh: "标准错误处理模板",
          }}
          code={TEMPLATE_CODE}
          hl={[4, 5, 6]}
          note={{
            en: (
              <>
                The three highlighted lines are what makes this work. A bad HTTP
                status is not an error by itself, so you raise it into one. After
                that, every kind of failure ends up in the same{" "}
                <code>catch</code>. The shape{" "}
                <b>try → if (!res.ok) throw → catch</b> is used by every fetch
                example in this book.
              </>
            ),
            zh: (
              <>
                高亮的三行是这个模板的关键:HTTP 状态本身不是错误,
                所以你把它手动升级成错误。这样一来,各种失败最后都汇进同一个{" "}
                <code>catch</code>。<b>try → if (!res.ok) throw → catch</b>{" "}
                这个结构,本书后面的 fetch 例子都长这样。
              </>
            ),
          }}
        />

        <Callout
          tone="deep"
          title={{
            en: "res.json() can fail on its own",
            zh: "res.json() 自己也会失败",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>res.json()</code> reads the response body and parses it
                  as JSON. If the body is not valid JSON, the Promise it returns
                  rejects with a <code>SyntaxError</code>. This happens more
                  often than you would expect. A misconfigured server can answer
                  with an HTML error page and still send status 200, so{" "}
                  <code>res.ok</code> is true and the parse fails. An empty body
                  does the same: a 204 No Content response has no body, so
                  calling <code>res.json()</code> on it fails.
                </>
              }
              zh={
                <>
                  <code>res.json()</code> 读取响应正文,并按 JSON 解析。
                  如果正文不是合法的 JSON,它返回的 Promise 就会以{" "}
                  <code>SyntaxError</code> 失败。这种情况比想象中常见:
                  配置有问题的服务器可能返回一个 HTML 错误页,状态码却仍然是
                  200 —— <code>res.ok</code> 是 true,解析却过不去。
                  空正文同理:204 No Content 没有正文,对它调用{" "}
                  <code>res.json()</code> 一样会失败。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Notice that the example above writes{" "}
                  <code>return await res.json()</code>, not{" "}
                  <code>return res.json()</code>. With the await, the parse
                  happens inside the <code>try</code> block, so this error lands
                  in the same <code>catch</code> as everything else. Without it,
                  the Promise would leave the function before <code>try</code>{" "}
                  could see it fail.
                </>
              }
              zh={
                <>
                  注意上面的例子写的是 <code>return await res.json()</code>,
                  不是 <code>return res.json()</code>。加了 await,解析就发生在{" "}
                  <code>try</code> 里面,这类错误也会落进同一个{" "}
                  <code>catch</code>。不加,这个 Promise 会在 <code>try</code>{" "}
                  还没看到它失败时就被返回出去。
                </>
              }
            />
          </p>
        </Callout>

        <FetchLab />
      </Section>

      {/* ================= §03 从数据到页面 ================= */}
      <Section
        id="pokedex"
        index="03"
        title={{
          en: "From data to page: a Pokemon lookup",
          zh: "从数据到页面:宝可梦查询器",
        }}
        desc={{
          en: "JSON in a variable is only half the job. What a user sees is the page, so the last step is putting the data into the DOM.",
          zh: "拿到 JSON 只完成了一半。用户看到的是页面,所以最后一步是把数据写进 DOM。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                A small but complete project: type a name, request it from{" "}
                <b>PokeAPI</b> (a free Pokemon database that needs no account),
                and show the height, the weight, and a picture. Two files.
              </>
            }
            zh={
              <>
                一个完整的小项目:输入名字,向 <b>PokeAPI</b>
                (免费、免注册的宝可梦资料库)请求数据,
                再把身高、体重和图片显示出来。两个文件。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="bash"
          title="index.html"
          code={POKE_HTML}
          note={{
            en: (
              <>
                Three elements: an input, a button, and an empty container for
                the result. Each one has an <code>id</code>, which is how the
                JavaScript finds it.
              </>
            ),
            zh: (
              <>
                三个元素:输入框、按钮,以及一个装结果的空容器。每个都有{" "}
                <code>id</code>,JavaScript 靠 id 找到它们。
              </>
            ),
          }}
        />
        <CodeBlock
          lang="js"
          title="app.js"
          code={POKE_JS}
          hl={[5, 12, 13, 14, 16]}
          note={{
            en: (
              <>
                The highlighted lines are the ones that change the page. Before
                the request, the container says <code>Loading...</code> so the
                user knows something is happening. When the data arrives, fields
                from the JSON are written into the container. When it fails, the
                message says so. <b>fetch → res.json() → update the DOM</b> is
                the whole loop. One caution: <code>innerHTML</code> runs whatever
                HTML it is given, so use <code>textContent</code> for values you
                only want to show as text.
              </>
            ),
            zh: (
              <>
                高亮的几行就是改页面的地方。请求发出前先把容器写成{" "}
                <code>Loading...</code>,让用户知道正在进行;数据到手,
                把 JSON 里的字段拼进容器;失败了,也要给出看得懂的提示。
                <b>fetch → res.json() → 改 DOM</b>,整个循环就这三步。
                一点提醒:<code>innerHTML</code> 会执行传给它的 HTML,
                所以只想当文本显示的值,请用 <code>textContent</code>。
              </>
            ),
          }}
        />

        <p className="sec-desc" style={{ marginTop: 18 }}>
          <T
            en={
              <>
                The widget below runs the same logic for real. Try it.
              </>
            }
            zh={<>下面这个用的是同一套逻辑,而且是真的能跑的:</>}
          />
        </p>
        <PokedexWidget />
      </Section>

      {/* ================= §04 发送数据 ================= */}
      <Section
        id="post"
        index="04"
        title={{
          en: "Sending data: the three parts of a POST",
          zh: "发送数据:POST 的三件套",
        }}
        desc={{
          en: "Every request so far has asked for data. Registering, posting, and ordering send data instead.",
          zh: "前面每个请求都是「要数据」。注册、发帖、下单,则是「送数据」。",
        }}
      >
        <CodeBlock
          lang="js"
          title="post.js"
          code={POST_CODE}
          hl={[4, 5, 6]}
          note={{
            en: (
              <>
                The second argument to fetch is an options object. The three
                highlighted lines are the three parts of a POST: change the
                method, declare the format of the body, and turn the object into
                text. The 201 and the new <code>id</code> that come back are the
                standard reply to a successful creation, described in chapter 01.
              </>
            ),
            zh: (
              <>
                fetch 的第二个参数是选项对象。高亮的三行就是 POST 的三件套:
                换方法、声明正文格式、把对象转成文本。回来的 201 和那个新{" "}
                <code>id</code>,正是第 01 章讲过的「创建成功」的标准回应。
              </>
            ),
          }}
        />

        <Callout
          tone="warn"
          title={{
            en: "Leave one part out and it breaks",
            zh: "三件套,少一件都不行",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>Without JSON.stringify</b>, fetch converts the object to a
                  string the ordinary JavaScript way, and the server receives the
                  text <code>[object Object]</code>. Not one field can be read
                  out of it. <b>Without Content-Type</b>, the server may try to
                  parse your JSON as plain text or as form data; the fields come
                  out empty, or the server answers 400.{" "}
                  <b>Without method</b>, the request is a GET, and a GET is not
                  allowed to carry a body, so fetch throws a{" "}
                  <code>TypeError</code> before anything is sent. The wording
                  differs between browsers; Chrome says{" "}
                  <code>Request with GET/HEAD method cannot have body</code>.
                  That one is easy to notice, because it lands in{" "}
                  <code>catch</code> immediately. The first two are much quieter.
                </>
              }
              zh={
                <>
                  <b>忘了 JSON.stringify</b>:fetch 会按 JavaScript
                  的普通规则把对象转成字符串,服务器收到的正文是{" "}
                  <code>[object Object]</code>,一个字段都读不出来。
                  <b>忘了 Content-Type</b>:服务器可能把你的 JSON
                  当纯文本或表单去解析,轻则字段全空,重则直接回 400。
                  <b>忘了 method</b>:请求就是 GET,而 GET 不允许带正文,
                  fetch 会在发出去之前抛出 <code>TypeError</code>。
                  各浏览器措辞不同,Chrome 的说法是{" "}
                  <code>Request with GET/HEAD method cannot have body</code>。
                  这一个反而好发现,因为它立刻掉进 <code>catch</code>;
                  前两个要安静得多。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  When a server says it received nothing, check these three
                  first. Most of the time one of them is missing.
                </>
              }
              zh={
                <>
                  以后遇到「明明传了数据,服务器却说没收到」,
                  先按这三件查一遍,多半是缺了其中一件。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 Network 面板 ================= */}
      <Section
        id="network"
        index="05"
        title={{
          en: "The Network panel in DevTools",
          zh: "DevTools 的 Network 面板",
        }}
        desc={{
          en: "When the code does not explain the problem, the messages do. Press F12, open Network, and every request is recorded there. Click through the tabs.",
          zh: "代码说不清的事,报文说得清。按 F12 打开 Network,每一次请求都记录在这里。点开标签逛一圈。",
        }}
      >
        <NetworkTour />

        <Callout
          tone="warn"
          title={{
            en: "A response body can only be read once",
            zh: "响应正文只能读一次",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>res.json()</code> reads the body as a <b>stream</b>: the
                  data passes through once and is then gone. Calling{" "}
                  <code>res.json()</code> a second time on the same response
                  throws <code>TypeError: body stream already read</code>. If you
                  need the data twice, store it the first time:{" "}
                  <code>const data = await res.json()</code>. If you really need
                  to read the raw body twice, <code>res.clone()</code> gives you
                  a second copy, but you have to call it before either copy is
                  read. DevTools can show you the body again because the browser
                  kept its own copy, not because your code gets a second chance.
                </>
              }
              zh={
                <>
                  <code>res.json()</code> 是把正文当作<b>流(stream)</b>
                  来读的:数据流过一次就没了。对同一个响应第二次调用{" "}
                  <code>res.json()</code>,会抛出{" "}
                  <code>TypeError: body stream already read</code>。
                  要用两次,第一次就存起来:
                  <code>const data = await res.json()</code>。
                  如果确实需要把原始正文读两遍,可以用 <code>res.clone()</code>{" "}
                  复制一份,但必须在两份都还没被读之前调用。
                  DevTools 之所以能反复看正文,是因为浏览器自己留了一份,
                  不是你的代码有第二次机会。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 CORS 第一面 ================= */}
      <Section
        id="cors"
        index="06"
        title={{
          en: "A first look at CORS: a browser rule, not a failure",
          zh: "CORS 第一面:是浏览器的规则,不是故障",
        }}
        desc={{
          en: "You will meet it sooner or later. It helps to recognize it in advance.",
          zh: "早晚会遇上它。提前认个脸,到时候不慌。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                One day you call a new API. <code>curl</code> works. Postman
                works. But fetch in the browser prints a long red message
                containing the words <b>CORS policy</b>. The first reaction is
                usually &quot;the API is down&quot;. It is not. The API answered.
                Your own browser refused to let your script read the answer.
              </>
            }
            zh={
              <>
                某天你调一个新 API:<code>curl</code> 通,Postman 通,
                偏偏浏览器里的 fetch 打出一大段红字,里面有 <b>CORS policy</b>{" "}
                几个词。第一反应往往是「API 挂了?」——
                并没有。API 回答了,是你自己的浏览器不让脚本读这份回答。
              </>
            }
          />
        </p>
        <Callout
          tone="deep"
          title={{
            en: "The same-origin policy in one paragraph",
            zh: "一段话讲清同源策略",
          }}
        >
          <p>
            <T
              en={
                <>
                  Browsers follow a rule called the{" "}
                  <b>same-origin policy</b>: a script loaded from one origin may
                  not read a response from a different origin, unless that
                  response says it is allowed. The response says so with a
                  header, <code>Access-Control-Allow-Origin</code>. The set of
                  rules around that header is called{" "}
                  <b>CORS (Cross-Origin Resource Sharing)</b>.
                </>
              }
              zh={
                <>
                  浏览器有一条规则叫<b>同源策略(same-origin policy)</b>:
                  从一个源加载的脚本,不能读取另一个源的响应,
                  除非那份响应明确表示允许。表示允许的方式是一个响应头:
                  <code>Access-Control-Allow-Origin</code>。
                  围绕这个头的一整套规则,就叫{" "}
                  <b>CORS(Cross-Origin Resource Sharing,跨域资源共享)</b>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Two things follow from this. First, the <b>browser</b> enforces
                  the rule, so it protects the user, not the server:{" "}
                  <code>curl</code>, Postman, and any program running on a server
                  ignore CORS entirely, and the header keeps nobody out. Second,
                  a CORS failure is <b>not an HTTP error status</b>. There is no
                  CORS status code. The response may well have been 200; the
                  browser simply did not hand it to your code, so the fetch
                  Promise rejects and the explanation is printed in the console.
                </>
              }
              zh={
                <>
                  由此有两个推论。第一,规则由<b>浏览器</b>执行,
                  所以它保护的是用户,不是服务器:<code>curl</code>、Postman
                  以及任何跑在服务器上的程序根本不看 CORS,
                  加了这个头也拦不住谁。第二,CORS 失败
                  <b>不是一个 HTTP 错误状态</b>,并不存在什么「CORS 状态码」。
                  响应很可能就是 200,只是浏览器没把它交给你的代码,
                  于是 fetch 的 Promise reject,原因打印在 Console 里。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The public APIs used in this chapter — PokeAPI, JSONPlaceholder,
                  and Open-Meteo — all send the header, so they work from a page.
                  Who blocks what, how a server allows an origin, and what an
                  OPTIONS preflight request is are covered in chapter 06,
                  together with authentication.
                </>
              }
              zh={
                <>
                  本章用到的 PokeAPI、JSONPlaceholder、Open-Meteo
                  都发了这个头,所以在网页里能直接用。谁在拦、服务器怎么放行、
                  OPTIONS 预检请求又是怎么回事 —— 第 06 章会连同认证一起讲。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Three tasks, all using real APIs that are free and need no account. You can run every one of them in the browser console.",
          zh: "三个任务都用真实的、免费免注册的 API,在浏览器 Console 里就能跑完。",
        }}
      >
        <LabSet ch="first-call" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions, all about the traps in this chapter.",
          zh: "八道题,专考本章讲过的坑。",
        }}
      >
        <Quiz ch="first-call" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                fetch returns a <b>Promise</b> immediately: an object standing
                for a result that has not arrived. <code>await</code> pauses the
                surrounding async function until it settles, without blocking the
                browser. An async function always returns a Promise.
              </>
            ),
            zh: (
              <>
                fetch 立刻返回一个 <b>Promise</b>:代表一个还没到手的结果。
                <code>await</code> 让所在的 async
                函数暂停到它有结果为止,并不阻塞浏览器。async
                函数的返回值一定是 Promise。
              </>
            ),
          },
          {
            en: (
              <>
                Two awaits, two steps. The first resolves when the{" "}
                <b>response headers</b> arrive. <code>res.json()</code> is a
                second asynchronous step that reads and parses the body, and it
                can fail on its own when the body is not valid JSON.
              </>
            ),
            zh: (
              <>
                两次 await,两个步骤:第一次在<b>响应头</b>到达时兑现;
                <code>res.json()</code> 是第二个异步步骤,负责读取并解析正文,
                正文不是合法 JSON 时它自己也会失败。
              </>
            ),
          },
          {
            en: (
              <>
                fetch rejects only on a network-level failure. 404 and 500 are
                responses that arrived normally, so you check{" "}
                <code>res.ok</code> yourself. Keep the shape{" "}
                <b>try → if (!res.ok) throw → catch</b>.
              </>
            ),
            zh: (
              <>
                fetch 只在网络层失败时 reject。404、500 是正常收到的响应,
                所以 <code>res.ok</code> 要你自己查。记住这个结构:
                <b>try → if (!res.ok) throw → catch</b>。
              </>
            ),
          },
          {
            en: (
              <>
                Getting data onto the page is three steps:{" "}
                <code>fetch → res.json() → update the DOM</code>. The body is a
                stream and can be read once, so store the result if you need it
                twice.
              </>
            ),
            zh: (
              <>
                把数据放上页面就三步:
                <code>fetch → res.json() → 改 DOM</code>。
                正文是流,只能读一次,要用两次就先存进变量。
              </>
            ),
          },
          {
            en: (
              <>
                A POST needs three things: <code>method</code>,{" "}
                <code>Content-Type: application/json</code>, and{" "}
                <code>JSON.stringify(body)</code>. Leave one out and the data
                does not arrive as JSON.
              </>
            ),
            zh: (
              <>
                一个 POST 需要三样东西:<code>method</code>、
                <code>Content-Type: application/json</code>、
                <code>JSON.stringify(body)</code>。少一样,
                数据就不会以 JSON 的形式到达。
              </>
            ),
          },
          {
            en: (
              <>
                When descriptions do not match, open the Network panel:{" "}
                <b>Headers</b> for the metadata, <b>Payload</b> for what you
                sent, <b>Response</b> for what came back, <b>Timing</b> for where
                the time went.
              </>
            ),
            zh: (
              <>
                说不清的时候就开 Network 面板:<b>Headers</b> 看元数据,
                <b>Payload</b> 看寄出去的,<b>Response</b> 看收回来的,
                <b>Timing</b> 看时间花在哪。
              </>
            ),
          },
          {
            en: (
              <>
                A CORS error is the browser enforcing the same-origin policy. It
                is not an API failure, and it is not an HTTP status. Chapter 06
                covers it.
              </>
            ),
            zh: (
              <>
                CORS 报错是浏览器在执行同源策略,不是 API 挂了,
                也不是一个 HTTP 状态码。第 06 章会细讲。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="first-call" />
    </main>
  );
}
