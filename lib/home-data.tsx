"use client";

// 序章 · 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";
import { T } from "@/lib/i18n";

export const LABS: Lab[] = [
  {
    id: "spy-network",
    title: { en: "Watch a real request go out", zh: "偷看一次真实请求" },
    d: "easy",
    tags: { en: ["DevTools", "Network"], zh: ["DevTools", "Network"] },
    task: (
      <T
        en={
          <p>
            Open any site with a lot of content (a news site, GitHub, or a video
            site works well). Press F12 (⌥⌘I on a Mac) to open the developer
            tools, switch to the <b>Network</b> panel, reload the page, and
            scroll down twice. Find a request whose type is <b>fetch/xhr</b> and
            open it. What does its URL look like? Is the response JSON?
          </p>
        }
        zh={
          <p>
            随便打开一个内容多的网站(微博、知乎、B 站都行),按 F12(Mac 是
            ⌥⌘I)打开开发者工具,切到 <b>Network(网络)</b> 面板,刷新页面,
            往下滚两屏。找到一条类型是 <b>fetch/xhr</b> 的请求,点开看看:
            它的 URL 长什么样?响应是不是 JSON?
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The Network panel has a filter bar at the top. Click
            &quot;Fetch/XHR&quot; to hide images and scripts and leave only data
            requests.
          </>
        }
        zh={
          <>
            在 Network 面板顶部有个过滤栏,点「Fetch/XHR」就能滤掉图片和脚本,
            只剩数据请求。
          </>
        }
      />
    ),
    solution: (
      <T
        en={
          <p>
            Select a request and the <b>Headers</b> tab on the right shows the
            full URL, the method (usually GET or POST), and the status code
            (usually 200). The <b>Response</b> tab shows the JSON the server
            returned. What you just watched is the site&apos;s own front end
            calling its own API. Every site you visit runs on requests like
            these.
          </p>
        }
        zh={
          <p>
            点中一条请求后,右侧 <b>Headers</b> 标签能看到完整 URL、方法(多半是
            GET 或 POST)和状态码(多半是 200);<b>Response</b>{" "}
            标签里就是服务器返回的 JSON。你刚才「偷看」的,就是这个网站自己的前端
            在调自己的 API —— 你每天访问的每个网站,底下都是这样一条条请求在跑。
          </p>
        }
      />
    ),
  },
  {
    id: "first-fetch",
    title: { en: "Your first line of fetch", zh: "你的第一行 fetch" },
    d: "easy",
    tags: { en: ["fetch", "Console"], zh: ["fetch", "Console"] },
    task: (
      <T
        en={
          <p>
            Stay in the developer tools and switch to the <b>Console</b> tab.
            Type the code below (type it out rather than pasting it), press
            Enter, and see what it prints.
          </p>
        }
        zh={
          <p>
            还是开发者工具,这次切到 <b>Console(控制台)</b>。把下面这行代码
            敲进去(建议手敲,别复制),回车,看看打印出什么。
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            If the console prints a Promise, that is expected. The data only
            arrives inside the later <code>.then</code>.
          </>
        }
        zh={
          <>
            如果打印出来的是 Promise,这是正常的 —— 数据要到后面的 .then
            里才拿得到。
          </>
        }
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`fetch("https://jsonplaceholder.typicode.com/users/1")
  .then((res) => res.json())
  .then((data) => console.log(data.name, data.email));`}
        />
        <T
          en={
            <p>
              It should print <code>Leanne Graham Sincere@april.biz</code>. You
              have just made your first API call as a developer.
            </p>
          }
          zh={
            <p>
              应该打印出 <code>Leanne Graham Sincere@april.biz</code>。恭喜,
              你刚刚以开发者的身份,完成了人生第一次 API 调用。
            </p>
          }
        />
      </>
    ),
  },
  {
    id: "pikachu",
    title: {
      en: "A different kitchen: measure Pikachu",
      zh: "换一家餐厅:量一量皮卡丘",
    },
    d: "medium",
    tags: { en: ["fetch", "PokeAPI"], zh: ["fetch", "PokeAPI"] },
    task: (
      <T
        en={
          <p>
            Try a different real API: <b>PokeAPI</b>, a free Pokémon database
            that needs no registration. In the Console, request{" "}
            <code>https://pokeapi.co/api/v2/pokemon/pikachu</code>. Find
            Pikachu&apos;s <code>height</code> and <code>weight</code> in the
            response, then ask yourself what units those two numbers could be
            in.
          </p>
        }
        zh={
          <p>
            换一个真实世界的 API:<b>PokeAPI</b>(宝可梦资料库,免费免注册)。
            在 Console 里请求{" "}
            <code>https://pokeapi.co/api/v2/pokemon/pikachu</code>
            ,从响应里找出皮卡丘的身高(height)和体重(weight),并想一想:
            这两个数字的单位可能是什么?
          </p>
        }
      />
    ),
    hint: (
      <T
        en={
          <>
            The response is large. Print the whole object with console.log and
            expand it in the console to find these two fields.
          </>
        }
        zh={<>响应很大,直接 console.log 整个对象,然后在控制台里展开找这两个字段。</>}
      />
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const res = await fetch("https://pokeapi.co/api/v2/pokemon/pikachu");
const pika = await res.json();
console.log(pika.height, pika.weight); // 4 60`}
        />
        <T
          en={
            <p>
              The answer is 4 and 60. The units are <b>decimetres</b> and{" "}
              <b>hectograms</b>, so 0.4 m and 6 kg. There is an important lesson
              here: <b>a number alone does not tell you its unit. Read the
              documentation.</b> API documentation is the menu, and chapter 01
              shows you how to read it.
            </p>
          }
          zh={
            <p>
              答案是 4 和 60 —— 单位是<b>分米</b>和<b>百克</b>(0.4 米、6 公斤)。
              这里有个重要教训:<b>光看数字猜不出单位,得读文档</b>。API
              文档就是餐厅的菜单,第 01 章会教你怎么读。
            </p>
          }
        />
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: <>What does the word &quot;interface&quot; in API really mean here?</>,
      zh: <>API 这个词里的「接口(Interface)」,最贴切的理解是哪种?</>,
    },
    opts: [
      {
        en: <>How a website looks on screen</>,
        zh: <>网站的界面长什么样、好不好看</>,
      },
      {
        en: <>An agreed set of rules for how to ask and how to answer</>,
        zh: <>双方事先约好的一套「怎么问、怎么答」的规矩</>,
      },
      {
        en: <>A programming language more advanced than JavaScript</>,
        zh: <>一种比 JavaScript 更高级的编程语言</>,
      },
      {
        en: <>A table in the database that stores interfaces</>,
        zh: <>数据库里专门存接口的一张表</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is the UI, the user interface. An API is not made for human
            eyes. It is an agreement between two programs.
          </>
        ),
        zh: (
          <>
            那是 UI(User Interface,用户界面)。API 面向的不是人眼,是程序 ——
            两段代码之间的约定。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            An API is not a language. Any language can call an API, because an
            API is only an agreement, and any language can follow it.
          </>
        ),
        zh: (
          <>
            API 不是语言。任何语言都能调 API ——
            因为它只是一套约定,约定用什么语言都能遵守。
          </>
        ),
      },
      {
        en: (
          <>
            A database stores the data itself. An API is the service window in
            front of the database, and it exists so that you do not touch the
            database directly.
          </>
        ),
        zh: (
          <>
            数据库里存的是数据本身。API 是站在数据库前面的「服务窗口」,
            恰恰是为了不让你直接碰它。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          An interface is an agreement. A menu agrees on what you can order and
          what will arrive. An API agrees on what requests you can send and what
          shape the response takes.
        </>
      ),
      zh: (
        <>
          接口 = 约定。菜单约定了「你能点什么、菜端上来长什么样」,API
          约定了「你能发什么请求、响应长什么格式」。记住这个,后面一切都顺了。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You open a weather app on your phone and it shows 26°C. In this
          situation, which side is the client and which is the server?
        </>
      ),
      zh: (
        <>
          你在手机上刷天气 App,看到「杭州 26°C」。这个场景里,谁是客户端,
          谁是服务器?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            The app is the client, and the program in the weather company&apos;s
            data centre is the server
          </>
        ),
        zh: <>App 是客户端,天气公司机房里的那台程序是服务器</>,
      },
      {
        en: <>The phone is the server, because the data appears on the phone</>,
        zh: <>手机是服务器,因为数据显示在手机上</>,
      },
      {
        en: <>Both are clients; the satellite sends the data directly</>,
        zh: <>都是客户端,天气数据是卫星直接发的</>,
      },
      {
        en: <>There is no client or server here; it is all local computation</>,
        zh: <>这个场景没有客户端和服务器,只是本地计算</>,
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            That is the wrong way round. The side that displays the data is the
            one placing the order. The side that provides the data is the
            kitchen. The phone asks, the data centre answers.
          </>
        ),
        zh: (
          <>
            方向反了:显示数据的一方是「点菜的」,提供数据的一方才是「后厨」。
            手机发问,机房作答。
          </>
        ),
      },
      {
        en: (
          <>
            Satellites collect raw observations, but your app receives data that
            a weather company has processed and published through an API. A
            server is always in the middle.
          </>
        ),
        zh: (
          <>
            卫星收集原始观测,但你的 App 拿到的是天气服务商整理后、通过 API
            发出的数据 —— 中间必有服务器。
          </>
        ),
      },
      {
        en: (
          <>
            A phone cannot compute the weather for the whole world. The number
            26°C had to be requested from somewhere, and one request plus one
            answer is exactly the client and server relationship.
          </>
        ),
        zh: (
          <>
            手机自己算不出全球天气 —— 26°C 这个数字一定是从别人那里「要」来的,
            一问一答就是客户端-服务器。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Whoever sends the request is the client. Whoever listens and responds
          is the server. The roles come from who asks and who answers, not from
          the size or price of the device.
        </>
      ),
      zh: (
        <>
          谁发起请求,谁就是客户端(client);谁监听并响应,谁就是服务器
          (server)。角色由「谁问谁答」决定,跟设备大小、贵贱无关。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>Which statement about JSON is correct?</>,
      zh: <>下面对 JSON 的说法,哪个是对的?</>,
    },
    opts: [
      {
        en: <>JSON is only for JavaScript; Python and Java cannot read it</>,
        zh: <>JSON 是 JavaScript 专用的,Python 和 Java 读不了</>,
      },
      { en: <>JSON is a kind of database</>, zh: <>JSON 是一种数据库</> },
      {
        en: (
          <>JSON is a text format that almost every programming language can
            read and write</>
        ),
        zh: <>JSON 是一种文本格式,几乎所有编程语言都能读写</>,
      },
      {
        en: <>In JSON, strings may use either single or double quotes</>,
        zh: <>JSON 里字符串用单引号双引号都行</>,
      },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            The name only tells you where the format came from. Python has the
            json module and Java has Jackson. Every language can read and write
            it.
          </>
        ),
        zh: (
          <>
            名字里带 JavaScript 只说明它的来源,不代表只有 JavaScript 能用。
            Python 有 json 模块,Java 有 Jackson —— 谁都能读写。
          </>
        ),
      },
      {
        en: (
          <>
            A database stores data. JSON carries it. The data starts in a
            database and travels over the network as JSON text.
          </>
        ),
        zh: (
          <>
            数据库负责「存」,JSON 负责「运」。数据从数据库出发,打包成 JSON
            文本在网上跑。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            JSON accepts double quotes only. A single quote is a syntax error.
            This is one of the places where JSON is stricter than a JavaScript
            object literal.
          </>
        ),
        zh: (
          <>
            JSON 只认双引号 —— 单引号直接语法错误。
            这是它比 JS 对象「严格」的地方之一。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The strength of JSON is that anyone can use it. It is plain text with
          rules simple enough to list in one line: object, array, string,
          number, boolean, and null. That is why it became the common format for
          APIs.
        </>
      ),
      zh: (
        <>
          JSON 的本事恰恰在于它「谁家都能用」:一段纯文本,规则简单到六种类型
          讲完,所以成了 API 世界的通用语。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Why does your web page go through an API server instead of connecting
          to the database directly? The main reason is:
        </>
      ),
      zh: (
        <>
          为什么你的网页不直接连数据库,非要经过服务器(API)这一道?
          最核心的原因是:
        </>
      ),
    },
    opts: [
      {
        en: <>It is technically impossible; a browser has no network access</>,
        zh: <>技术上做不到,浏览器没有网线</>,
      },
      {
        en: (
          <>
            Security: everything in the browser can be read by the user, so a
            database password there is public, and someone still has to decide
            who may see which data
          </>
        ),
        zh: (
          <>
            安全:浏览器里的代码人人可见,数据库密码一放进去就等于公开;
            而且谁该看什么数据,得有人把关
          </>
        ),
      },
      {
        en: <>Databases are slow, and the server exists to speed them up</>,
        zh: <>数据库太慢,服务器是用来加速的</>,
      },
      {
        en: <>It is a habit from the past; direct connections are fine now</>,
        zh: <>历史习惯,现在其实可以直连了</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A browser can use the network; <code>fetch</code> proves it. The
            question is not whether it can connect, but whether it should be
            allowed to.
          </>
        ),
        zh: (
          <>
            浏览器有网络能力(fetch 就是),问题不是「能不能连」,
            是「敢不敢让你连」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A server does sometimes add caching, but that is a side benefit.
            Even an infinitely fast database must not be exposed to the browser.
          </>
        ),
        zh: (
          <>
            服务器有时确实做缓存,但那是附带好处。就算数据库无限快,
            也不能把它裸露给浏览器。
          </>
        ),
      },
      {
        en: (
          <>
            The opposite is true. Connecting a browser straight to a database is
            treated as a serious security failure today. The API checkpoint is
            always needed.
          </>
        ),
        zh: (
          <>
            恰恰相反,直连数据库在今天是一票否决的安全事故。API 这道关卡永远需要。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Front-end code runs on the user&apos;s machine, so it can hold no
          secrets. The API server sits in the middle: it keeps the credentials,
          checks who the caller is, validates the data, and passes through only
          what is allowed.
        </>
      ),
      zh: (
        <>
          前端代码在用户手里,里面藏不住任何秘密。API 服务器站在中间:
          保管密码、验明身份、校验数据、只放行该放行的 ——
          就像餐厅不让顾客进后厨。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Which of these everyday actions almost certainly involve an API call?
          (Select all that apply.)
        </>
      ),
      zh: <>下面哪些日常场景的背后,几乎必然有 API 调用?(多选)</>,
    },
    opts: [
      {
        en: <>Paying by card and hearing the reader beep</>,
        zh: <>扫码付款,商家「叮」一声收到钱</>,
      },
      {
        en: <>Clicking &quot;Sign in with Google&quot; on a new site</>,
        zh: <>在陌生网站点「用微信登录」</>,
      },
      {
        en: <>Adding 3 + 4 in the built-in calculator app</>,
        zh: <>用系统自带计算器算 3 + 4</>,
      },
      {
        en: <>Clicking &quot;Load more&quot; and seeing new comments appear</>,
        zh: <>评论区点「加载更多」,新评论冒出来</>,
      },
    ],
    correct: [0, 1, 3],
    missHint: {
      en: (
        <>
          Look again. In one of these the data clearly lives on someone
          else&apos;s server, and you left it out.
        </>
      ),
      zh: <>再想想 —— 有个场景里,数据明明在别人家的服务器上,你漏选了它。</>,
    },
    extraHint: {
      en: (
        <>
          One of these needs no network at all. The data and the calculation are
          both on your own device.
        </>
      ),
      zh: <>有一项完全不需要联网 —— 数据和计算都在你手机本地,谁也不用问。</>,
    },
    why: {
      en: (
        <>
          The test is one question:{" "}
          <b>does this need data or a service that belongs to someone else?</b>{" "}
          Paying asks the bank, signing in asks Google, loading comments asks the
          site&apos;s server. Adding 3 + 4 needs no one.
        </>
      ),
      zh: (
        <>
          判断标准就一条:<b>这件事需要「别人家的数据或服务」吗?</b>
          支付要问银行,登录要问微信,加载评论要问网站服务器 —— 都是 API。
          本地算 3+4,自己就能办,不用发请求。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          The built-in function most often used in browser JavaScript to send a
          network request is called ____ (lowercase, five letters).
        </>
      ),
      zh: (
        <>
          浏览器 JavaScript 里发网络请求最常用的内置函数,名字是____
          (小写,五个字母)。
        </>
      ),
    },
    answers: ["fetch", "fetch()"],
    hint: {
      en: <>The word means to go and bring something back.</>,
      zh: <>这个词的英文本义是「取回来」—— 狗狗接飞盘那个动作。</>,
    },
    why: {
      en: (
        <>
          <code>fetch</code> goes and brings the data back. It is built into
          every modern browser, and this course uses it from start to finish.
          Chapter 02 covers it in full.
        </>
      ),
      zh: (
        <>
          fetch:去把数据「取回来」。它是现代浏览器的标配,也是这门课从头用到尾
          的工具 —— 第 02 章整章都是它。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          In what form does the JSON from the server travel across the network,
          and what must you do first before you can read{" "}
          <code>data.name</code> in JavaScript?
        </>
      ),
      zh: (
        <>
          服务器回给你的 JSON,在网线上跑的时候是什么形态?到了你的 JS 里,
          要先做什么才能 <code>data.name</code> 这样取值?
        </>
      ),
    },
    opts: [
      {
        en: <>It travels as a JS object and can be used as soon as it arrives</>,
        zh: <>跑的时候就是 JS 对象,拿到直接用</>,
      },
      {
        en: (
          <>
            It travels as text, and you must parse it into an object with
            response.json()
          </>
        ),
        zh: <>跑的时候是文本,要先用 response.json() 解析成对象</>,
      },
      { en: <>It travels as an image and must be decoded</>, zh: <>跑的时候是图片,要先转码</> },
      {
        en: <>It travels as encrypted binary and must be decrypted by your code</>,
        zh: <>跑的时候是加密二进制,要先解密</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A live object cannot leave memory. Only bytes travel over a network,
            so the object is flattened into text and rebuilt at the other end.
          </>
        ),
        zh: (
          <>
            「活的对象」出不了内存 —— 网线上只能跑字节。对象要先「拍扁」成文本,
            到站再「复活」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            An image is a different kind of response with a different
            Content-Type. A JSON response is text from beginning to end.
          </>
        ),
        zh: <>图片是另一种响应类型(Content-Type 不同)。JSON 响应从头到尾都是文本。</>,
      },
      {
        en: (
          <>
            HTTPS does encrypt the data in transit, but that is invisible to
            your code. Your JavaScript receives text that is already decrypted,
            so all that remains is parsing it.
          </>
        ),
        zh: (
          <>
            HTTPS 确实会在传输层加密,但那对你的代码透明 —— 你的 JS
            拿到的仍是解好密的文本,要做的只是解析。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Remember this rule: <b>only text (bytes) travels over the network</b>.{" "}
          <code>response.json()</code> turns that text into an object. Skip this
          step and every field you read will be undefined.
        </>
      ),
      zh: (
        <>
          记住这条铁律:<b>网络上跑的永远是文本(字节)</b>。response.json()
          做的事就是「文本 → 对象」,这一步漏掉,后面全是 undefined。
        </>
      ),
    },
  },
];
