"use client";

// 第 02 章 · 第一次调用 API —— 动手任务 LABS + 通关测验 QUIZ 数据(双语,英文默认)。
// 代码示例只有一份(英文示例数据),两种语言共用,保证可执行行完全一致。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

/* ---------- 共用代码示例(两种语言共用同一份字符串) ---------- */

const DITTO_CODE = `const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
if (!res.ok) throw new Error("HTTP " + res.status);
const p = await res.json();

console.log(p.height, p.weight); // 3 40
console.log(p.types.map((t) => t.type.name).join(", ")); // normal`;

const POST_LAB_CODE = `const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "My first post", body: "hello", userId: 1 }),
});
console.log(res.status); // 201
const created = await res.json();
console.log(created); // { title: "My first post", ..., id: 101 }`;

const WEATHER_CODE = `const url =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=30.25&longitude=120.17&current_weather=true";

const res = await fetch(url);
if (!res.ok) throw new Error("HTTP " + res.status);
const data = await res.json();
console.log(data.current_weather.temperature + "°C");`;

export const LABS: Lab[] = [
  {
    id: "ditto-fields",
    title: {
      en: "Show one more field in the Pokemon lookup",
      zh: "给宝可梦查询器多显示一个字段",
    },
    d: "medium",
    tags: { en: ["PokeAPI", "DOM", "fetch"], zh: ["PokeAPI", "DOM", "fetch"] },
    task: {
      en: (
        <p>
          Copy the code from §03 into an HTML file, or work directly in the
          browser console. Change it to look up <code>ditto</code>, and show{" "}
          <b>one more field</b> besides height and weight. <code>types</code> or{" "}
          <code>base_experience</code> are good choices. Start by printing the
          whole response object with <code>console.log</code> to see which fields
          exist.
        </p>
      ),
      zh: (
        <p>
          把 §03 的代码抄进一个 HTML 文件,或者直接在浏览器 Console 里做。
          改成查 <code>ditto</code>,并在身高体重之外<b>多显示一个字段</b> ——{" "}
          <code>types</code> 或 <code>base_experience</code> 都可以。
          先用 <code>console.log</code> 把整个响应对象打印出来,看看有哪些字段。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          <code>types</code> is an array, and each element looks like{" "}
          <code>{'{ type: { name: "normal" } }'}</code>. Use{" "}
          <code>map</code> to pull the names out, then <code>join</code> them.
        </>
      ),
      zh: (
        <>
          <code>types</code> 是数组,每个元素长这样:
          <code>{'{ type: { name: "normal" } }'}</code> —— 用 <code>map</code>{" "}
          把名字取出来,再 <code>join</code> 起来。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock lang="js" title="console" code={DITTO_CODE} />
          <p>
            In the page version, add one more piece to the innerHTML string:{" "}
            <code>
              {'"<p>Type: " + p.types.map((t) => t.type.name).join(", ") + "</p>"'}
            </code>
            . Real API responses are often nested several levels deep. Printing
            the object first and following the path down is what front-end work
            looks like most days.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock lang="js" title="console" code={DITTO_CODE} />
          <p>
            页面版只要给 innerHTML 多拼一段:
            <code>
              {'"<p>Type: " + p.types.map((t) => t.type.name).join(", ") + "</p>"'}
            </code>
            。真实 API 的响应经常嵌套好几层,先打印、再顺着路径往下找,
            是前端每天都在做的事。
          </p>
        </>
      ),
    },
  },
  {
    id: "post-first-data",
    title: {
      en: "Send data for the first time: POST an article",
      zh: "第一次往服务器寄数据:POST 一篇文章",
    },
    d: "easy",
    tags: { en: ["POST", "JSON", "201"], zh: ["POST", "JSON", "201"] },
    task: {
      en: (
        <p>
          In the console, use the three parts from §04 to POST an article you
          make up to{" "}
          <code>https://jsonplaceholder.typicode.com/posts</code>. Check two
          things. Is <code>res.status</code> <b>201</b>? Does the response
          contain an <code>id</code> that the server assigned?
        </p>
      ),
      zh: (
        <p>
          在 Console 里,用 §04 的三件套向{" "}
          <code>https://jsonplaceholder.typicode.com/posts</code> POST
          一篇自己编的文章。验证两件事:<code>res.status</code> 是不是{" "}
          <b>201</b>?响应里有没有服务器分配的 <code>id</code>?
        </p>
      ),
    },
    hint: {
      en: (
        <>
          The three parts: <code>method</code>, <code>Content-Type</code> inside{" "}
          <code>headers</code>, and a <code>body</code> that went through{" "}
          <code>JSON.stringify</code>. Leaving out any one of them causes a
          different problem.
        </>
      ),
      zh: (
        <>
          三件套:<code>method</code>、<code>headers</code> 里的{" "}
          <code>Content-Type</code>、以及 <code>JSON.stringify</code> 过的{" "}
          <code>body</code>。少任何一件,出的问题都不一样。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock lang="js" title="console" code={POST_LAB_CODE} />
          <p>
            201 Created and a new id: the standard reply when a resource has been
            created. JSONPlaceholder only pretends to store it — the id is always
            101 and nothing is saved — but the request and the response are real.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock lang="js" title="console" code={POST_LAB_CODE} />
          <p>
            201 Created 加一个新 id,就是「创建成功」的标准回应。
            JSONPlaceholder 只是假装保存(id 永远是 101,数据不落库),
            但这一来一回的请求和响应是真的。
          </p>
        </>
      ),
    },
  },
  {
    id: "open-meteo",
    title: {
      en: "Read a real temperature from Open-Meteo",
      zh: "查一次真天气:用 Open-Meteo 取当前气温",
    },
    d: "medium",
    tags: {
      en: ["Open-Meteo", "real data"],
      zh: ["Open-Meteo", "真实数据"],
    },
    task: {
      en: (
        <p>
          Call a real weather API that is free and needs no account:
          <code>
            https://api.open-meteo.com/v1/forecast?latitude=30.25&amp;longitude=120.17&amp;current_weather=true
          </code>
          . Take the <b>current temperature</b> out of the response and print it
          as &quot;xx°C&quot;. Those coordinates are Hangzhou. Once it works, try
          the coordinates of your own city.
        </p>
      ),
      zh: (
        <p>
          调用真实的天气 API(免费免注册):
          <code>
            https://api.open-meteo.com/v1/forecast?latitude=30.25&amp;longitude=120.17&amp;current_weather=true
          </code>
          ,从响应里取出<b>当前气温</b>,打印成「xx°C」。
          这个坐标是杭州 —— 跑通之后,换成你所在城市的经纬度再来一次。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          Print the whole response first to find the path. The temperature is
          inside the <code>current_weather</code> object.
        </>
      ),
      zh: (
        <>
          先把整个响应打印出来找路径 —— 气温埋在{" "}
          <code>current_weather</code> 对象里面。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock lang="js" title="console" code={WEATHER_CODE} />
          <p>
            Look at the query parameters here: <code>latitude</code>,{" "}
            <code>longitude</code>, and <code>current_weather</code>. That is the
            URL structure from chapter 01, used by a real API. You have now run
            the same kind of data path that production code uses.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock lang="js" title="console" code={WEATHER_CODE} />
          <p>
            注意这次的查询参数:<code>latitude</code>、<code>longitude</code>、
            <code>current_weather</code> —— 第 01 章讲的 URL 结构,
            在真实 API 里就是这么用的。到这里,
            你已经跑通了一条和生产环境同款的数据链路。
          </p>
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          At the instant <code>const p = fetch(url)</code> runs, what is in the
          variable <code>p</code>?
        </>
      ),
      zh: (
        <>
          执行 <code>const p = fetch(url)</code> 的那一瞬间,变量{" "}
          <code>p</code> 里装的是什么?
        </>
      ),
    },
    opts: [
      { en: <>The data the server returned</>, zh: <>服务器返回的数据</> },
      {
        en: (
          <>A Promise: an object standing for a result that has not arrived yet</>
        ),
        zh: <>一个 Promise:代表一个还没到手的结果</>,
      },
      { en: <>The parsed JSON object</>, zh: <>解析好的 JSON 对象</> },
      {
        en: <>true or false, showing whether the call worked</>,
        zh: <>true 或 false,表示成功与否</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A round trip over the network takes tens or hundreds of
            milliseconds. JavaScript does not stop and wait, so what you get
            immediately can only be a stand-in, not the data.
          </>
        ),
        zh: (
          <>
            一次网络往返要几十上百毫秒,JavaScript 不会停在原地等 ——
            立刻拿到的只能是一个替身,不是数据本身。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The JSON exists only after the response has arrived and{" "}
            <code>res.json()</code> has parsed it. At this instant the response
            has not come back.
          </>
        ),
        zh: (
          <>
            JSON 要等响应到达、再经 <code>res.json()</code> 解析才有 ——
            这一瞬间响应还没回来。
          </>
        ),
      },
      {
        en: (
          <>
            fetch does not return a boolean. Whether the call succeeded is known
            only when the Promise settles.
          </>
        ),
        zh: <>fetch 不返回布尔值;成功与否要等 Promise 有结果才见分晓。</>,
      },
    ],
    why: {
      en: (
        <>
          fetch starts the request and returns a Promise <b>immediately</b>. The
          response arrives later. <code>await</code> and <code>.then</code> are
          two ways of taking the value out of that Promise once it settles.
        </>
      ),
      zh: (
        <>
          fetch 发起请求后<b>立刻</b>返回一个 Promise,真正的响应之后才到。
          <code>await</code> 和 <code>.then</code>{" "}
          是从这个 Promise 里取值的两种写法。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          When is <code>res.ok</code> true?
        </>
      ),
      zh: (
        <>
          <code>res.ok</code> 什么时候为 true?
        </>
      ),
    },
    opts: [
      {
        en: <>Whenever the server replied at all</>,
        zh: <>只要服务器回复了,就是 true</>,
      },
      {
        en: <>When the status code is between 200 and 299</>,
        zh: <>状态码在 200–299 之间时</>,
      },
      {
        en: <>Only when the status code is exactly 200</>,
        zh: <>只有状态码恰好是 200 时</>,
      },
      {
        en: <>When the response body is valid JSON</>,
        zh: <>响应体是合法 JSON 时</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A 404 is a reply too, but <code>ok</code> is false.{" "}
            <code>ok</code> looks at which range the status code falls in, not at
            whether an answer came back.
          </>
        ),
        zh: (
          <>
            回个 404 也算「回复了」,但 <code>ok</code> 是 false ——
            <code>ok</code> 看的是状态码落在哪个区间,不是有没有回信。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            201 Created and 204 No Content are successes too, and{" "}
            <code>ok</code> is true for both. The whole 2xx family counts.
          </>
        ),
        zh: (
          <>
            201 Created、204 No Content 也是成功,<code>ok</code> 同样为 true
            —— 整个 2xx 家族都算。
          </>
        ),
      },
      {
        en: (
          <>
            <code>res.ok</code> looks only at the status code. It has nothing to
            do with the format of the body.
          </>
        ),
        zh: <>
          <code>res.ok</code> 只看状态码,与正文是什么格式毫无关系。
        </>,
      },
    ],
    why: {
      en: (
        <>
          <code>res.ok</code> is shorthand for{" "}
          <code>{"status >= 200 && status <= 299"}</code>. One property instead
          of a comparison.
        </>
      ),
      zh: (
        <>
          <code>res.ok</code> 就是{" "}
          <code>{"status >= 200 && status <= 299"}</code> 的简写 ——
          一个属性顶一行判断。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          In which case does the Promise from fetch reject, so that execution
          goes straight to <code>catch</code>?
        </>
      ),
      zh: (
        <>
          什么情况下 fetch 的 Promise 才会 reject(直接跳进{" "}
          <code>catch</code>)?
        </>
      ),
    },
    opts: [
      { en: <>When the server returns 404</>, zh: <>服务器返回 404 时</> },
      { en: <>When the server returns 500</>, zh: <>服务器返回 500 时</> },
      {
        en: (
          <>
            When the request fails at the network level, such as no connection or
            a hostname that does not resolve
          </>
        ),
        zh: <>断网、域名解析失败这类网络层故障时</>,
      },
      {
        en: <>When the JSON body contains an error field</>,
        zh: <>响应 JSON 里带 error 字段时</>,
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            To fetch, a 404 is a <b>successful exchange</b>: the request arrived
            and the server answered. The answer happens to say &quot;not
            found&quot;.
          </>
        ),
        zh: (
          <>
            在 fetch 看来,404 是一次<b>成功的交互</b>:
            请求送到了,服务器也回了话,只是回的是「查无此物」。
          </>
        ),
      },
      {
        en: (
          <>
            Same for 500. Bad news is still news. The reply came back, so fetch
            considers its own job done.
          </>
        ),
        zh: <>500 同理:坏消息也是消息 —— 回信收到了,fetch 就认为自己完工了。</>,
      },
      undefined,
      {
        en: (
          <>
            fetch never looks inside the body. Errors described in the data are
            yours to detect after parsing.
          </>
        ),
        zh: <>fetch 根本不拆正文看内容 —— 数据里描述的错误,要你解析后自己判断。</>,
      },
    ],
    why: {
      en: (
        <>
          fetch only cares whether the request went out and a response came back.
          If one did, the Promise resolves, whatever the status. It rejects when
          the request cannot complete: no connection, a hostname that does not
          resolve, an aborted request, or a response blocked by CORS. That is why
          you write <code>if (!res.ok)</code> yourself.
        </>
      ),
      zh: (
        <>
          fetch 只关心请求有没有发出去、回应有没有收到。收到了,
          不管状态码好坏都 resolve;请求没法完成才 reject:连不上、
          域名解析不了、请求被中止、响应被 CORS 拦下。所以{" "}
          <code>if (!res.ok)</code> 必须你自己写。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          After <code>const a = await res.json();</code> you write another line,{" "}
          <code>const b = await res.json();</code>. What happens on the second
          line?
        </>
      ),
      zh: (
        <>
          <code>const a = await res.json();</code> 之后又写了一行{" "}
          <code>const b = await res.json();</code>,第二行会发生什么?
        </>
      ),
    },
    opts: [
      { en: <>b gets the same data as a</>, zh: <>b 拿到和 a 一样的数据</> },
      {
        en: <>It throws: the body stream has already been read</>,
        zh: <>报错:响应正文这条流已经被读过了</>,
      },
      { en: <>b is null</>, zh: <>b 是 null</> },
      {
        en: <>The browser sends the request again automatically</>,
        zh: <>浏览器自动重新发一次请求</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A stream does not rewind. If you want the same data, use the variable{" "}
            <code>a</code>. It is still there.
          </>
        ),
        zh: (
          <>
            流读完不会自动倒带 —— 想要同样的数据,直接用变量 <code>a</code>,
            它还在那儿。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            It does not quietly hand you null. It throws (
            <code>TypeError: body stream already read</code>), which makes the
            problem easy to find.
          </>
        ),
        zh: (
          <>
            不是悄悄塞给你一个 null,而是明确抛错(
            <code>TypeError: body stream already read</code>),便于定位问题。
          </>
        ),
      },
      {
        en: (
          <>
            <code>res</code> only wraps that one response. Nothing you do to it
            starts a new network request.
          </>
        ),
        zh: (
          <>
            <code>res</code> 只是那一次响应的封装,
            再怎么折腾它也不会触发新的网络请求。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A response body is a stream that passes by once. To use it twice, store
          it the first time: <code>const data = await res.json()</code>.{" "}
          <code>res.clone()</code> makes a second copy, but only if you call it
          before the body is read.
        </>
      ),
      zh: (
        <>
          响应正文是一条只流过一次的流。要用两次,第一次就存起来:
          <code>const data = await res.json()</code>。<code>res.clone()</code>{" "}
          可以复制一份,但必须在正文被读之前调用。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          You want to send a piece of JSON data to a server with fetch. Which of
          these are required? (Select all that apply.)
        </>
      ),
      zh: <>用 fetch 向服务器发送一段 JSON 数据,下面哪些是必须写的?(多选)</>,
    },
    opts: [
      <>
        <code>method: &quot;POST&quot;</code>
      </>,
      <>
        <code>{'headers: { "Content-Type": "application/json" }'}</code>
      </>,
      <>
        <code>body: JSON.stringify(data)</code>
      </>,
      {
        en: (
          <>A manual setTimeout of three seconds, to give the server time to work</>
        ),
        zh: <>手动 setTimeout 等三秒,给服务器留出处理时间</>,
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: (
        <>
          One of the three parts is still missing: change the method, declare the
          format, serialize the body.
        </>
      ),
      zh: <>三件套还没凑齐 —— 换方法、声明格式、序列化正文,少了哪件?</>,
    },
    extraHint: {
      en: (
        <>
          One of your choices is unnecessary. The Promise from fetch already
          waits for the response; you never time anything yourself.
        </>
      ),
      zh: (
        <>
          有一项纯属多余 —— fetch 返回的 Promise 自己会等响应,
          不需要你手动计时。
        </>
      ),
    },
    why: {
      en: (
        <>
          Each part has a job. <code>method</code> changes the verb; the default
          is GET, and fetch refuses a GET that carries a body.{" "}
          <code>Content-Type</code> tells the server to parse the body as JSON.{" "}
          <code>JSON.stringify</code> turns the object into text that can be
          sent. Leave one out and that job is not done.
        </>
      ),
      zh: (
        <>
          三件套各管一段:<code>method</code> 换方法(默认是 GET,而 GET
          带正文会被 fetch 直接拒绝);<code>Content-Type</code> 让服务器按 JSON
          解析正文;<code>JSON.stringify</code> 把对象变成能发出去的文本。
          缺哪件,哪件的活就没人干。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          The method that turns a JavaScript object into JSON text is
          JSON.____ (9 letters).
        </>
      ),
      zh: <>把 JavaScript 对象转换成 JSON 文本的方法,是 JSON.____(9 个字母)。</>,
    },
    placeholder: { en: "9 lowercase letters", zh: "9 个小写字母" },
    answers: ["stringify", "stringify()"],
    hint: {
      en: (
        <>
          The word means &quot;turn into a string&quot;. It goes in the opposite
          direction from <code>parse</code>.
        </>
      ),
      zh: (
        <>
          这个词的意思是「变成字符串」—— 它是 <code>parse</code> 的反方向。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>JSON.stringify</code>: object to text, used before sending.{" "}
          <code>JSON.parse</code>: text to object, used after receiving — inside
          fetch, <code>res.json()</code> does that step for you.
        </>
      ),
      zh: (
        <>
          <code>JSON.stringify</code>:对象转文本,发出去之前用。
          <code>JSON.parse</code>:文本转对象,收进来之后用 —— 在 fetch 里,
          这一步由 <code>res.json()</code> 代劳。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          fetch in the browser reports a CORS error for an API, but{" "}
          <code>curl</code> gets a normal response from the same address. Who
          stopped the data?
        </>
      ),
      zh: (
        <>
          浏览器里 fetch 某个 API 报了 CORS 错误,但用 <code>curl</code>{" "}
          请求同一地址一切正常。数据是被谁拦下的?
        </>
      ),
    },
    opts: [
      {
        en: <>The API server refused to handle the request</>,
        zh: <>API 服务器拒绝处理这个请求</>,
      },
      {
        en: <>Your own browser, applying the same-origin policy</>,
        zh: <>你自己的浏览器,依据同源策略</>,
      },
      { en: <>The network provider</>, zh: <>网络运营商</> },
      { en: <>A bug in the fetch function</>, zh: <>fetch 函数的 bug</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The server usually handled it and replied; you can even see the
            request in the Network panel. The response was stopped after it
            reached the browser.
          </>
        ),
        zh: (
          <>
            服务器多半正常处理并返回了(Network 面板里甚至能看到这个请求)——
            响应是到了浏览器门口才被扣下的。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Network providers have nothing to do with this. curl worked, so the
            connection itself is fine.
          </>
        ),
        zh: <>运营商不管这事 —— curl 都通了,说明链路本身没问题。</>,
      },
      {
        en: (
          <>
            XMLHttpRequest and axios report the same thing. The browser applies
            the rule, whichever function you use.
          </>
        ),
        zh: (
          <>
            换 XMLHttpRequest、换 axios 一样报错 ——
            这条规则由浏览器执行,与用哪个函数无关。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The same-origin policy is a browser rule that protects the user: a
          script from site A may not read a response from site B unless B allows
          it with <code>Access-Control-Allow-Origin</code>. curl is not a
          browser, so the rule does not apply to it. Chapter 06 goes into the
          details.
        </>
      ),
      zh: (
        <>
          同源策略(same-origin policy)是浏览器保护用户的规则:A
          网站的脚本不能读 B 域名的响应,除非 B 用{" "}
          <code>Access-Control-Allow-Origin</code> 点头。curl
          不是浏览器,这条规则管不到它。细节在第 06 章。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>async function f() {"{ return 42; }"}</code>. You call{" "}
          <code>f()</code>. What do you get back?
        </>
      ),
      zh: (
        <>
          <code>async function f() {"{ return 42; }"}</code>,直接调用{" "}
          <code>f()</code>,拿到的是什么?
        </>
      ),
    },
    opts: [
      { en: <>The number 42</>, zh: <>数字 42</> },
      { en: <>A Promise that resolves to 42</>, zh: <>一个兑现值为 42 的 Promise</> },
      { en: <>undefined</>, zh: <>undefined</> },
      { en: <>The string &quot;42&quot;</>, zh: <>字符串 &quot;42&quot;</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            42 is in there, wrapped in a Promise. You need{" "}
            <code>await f()</code> or <code>f().then(...)</code> to get it out.
          </>
        ),
        zh: (
          <>
            42 确实在里面,但外面裹了一层 Promise —— 要{" "}
            <code>await f()</code> 或 <code>f().then(...)</code> 才能取出来。
          </>
        ),
      },
      undefined,
      {
        en: <>The function does return a value. It is not lost, only wrapped.</>,
        zh: <>函数确实 return 了 —— 值没丢,只是被包进了 Promise。</>,
      },
      {
        en: <>No conversion happens. 42 is still a number.</>,
        zh: <>没有发生任何类型转换,42 还是数字。</>,
      },
    ],
    why: {
      en: (
        <>
          An async function <b>always</b> returns a Promise, whatever is returned
          inside it. That is why callers usually have to await it as well, and
          why async spreads outward along the call chain.
        </>
      ),
      zh: (
        <>
          async 函数的返回值<b>一定</b>是 Promise,不管里面 return
          了什么。所以调用它的人通常也要 await,async
          也因此会沿着调用链一路往外传。
        </>
      ),
    },
  },
];
