"use client";

// 序章 · 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "spy-network",
    title: "偷看一次真实请求",
    d: "easy",
    tags: ["DevTools", "Network"],
    task: (
      <p>
        随便打开一个内容多的网站(微博、知乎、B 站都行),按 F12(Mac 是
        ⌘⌥I)打开开发者工具,切到 <b>Network(网络)</b> 面板,刷新页面,
        往下滚两屏。找到一条类型是 <b>fetch/xhr</b> 的请求,点开看看:
        它的 URL 长什么样?响应是不是 JSON?
      </p>
    ),
    hint: (
      <>
        在 Network 面板顶部有个过滤栏,点「Fetch/XHR」就能滤掉图片和脚本,
        只剩数据请求。
      </>
    ),
    solution: (
      <p>
        点中一条请求后,右侧 <b>Headers</b> 标签能看到完整 URL、方法(多半是
        GET 或 POST)和状态码(多半是 200);<b>Response</b>{" "}
        标签里就是服务器返回的 JSON。你刚才「偷看」的,就是这个网站自己的前端
        在调自己的 API —— 你每天访问的每个网站,底下都是这样一条条请求在跑。
      </p>
    ),
  },
  {
    id: "first-fetch",
    title: "你的第一行 fetch",
    d: "easy",
    tags: ["fetch", "Console"],
    task: (
      <p>
        还是开发者工具,这次切到 <b>Console(控制台)</b>。把下面这行代码
        敲进去(建议手敲,别复制),回车,看看打印出什么。
      </p>
    ),
    hint: <>如果打印出来的是 Promise,这是正常的 —— 数据要到后面的 .then 里才拿得到。</>,
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`fetch("https://jsonplaceholder.typicode.com/users/1")
  .then((res) => res.json())
  .then((data) => console.log(data.name, data.email));`}
        />
        <p>
          应该打印出 <code>Leanne Graham Sincere@april.biz</code>。恭喜,
          你刚刚以开发者的身份,完成了人生第一次 API 调用。
        </p>
      </>
    ),
  },
  {
    id: "pikachu",
    title: "换一家餐厅:量一量皮卡丘",
    d: "medium",
    tags: ["fetch", "PokeAPI"],
    task: (
      <p>
        换一个真实世界的 API:<b>PokeAPI</b>(宝可梦资料库,免费免注册)。
        在 Console 里请求 <code>https://pokeapi.co/api/v2/pokemon/pikachu</code>
        ,从响应里找出皮卡丘的身高(height)和体重(weight),并想一想:
        这两个数字的单位可能是什么?
      </p>
    ),
    hint: (
      <>响应很大,直接 console.log 整个对象,然后在控制台里展开找这两个字段。</>
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
        <p>
          答案是 4 和 60 —— 单位是<b>分米</b>和<b>百克</b>(0.4 米、6 公斤)。
          这里有个重要教训:<b>光看数字猜不出单位,得读文档</b>。API
          文档就是餐厅的菜单,第 01 章会教你怎么读。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>API 这个词里的「接口(Interface)」,最贴切的理解是哪种?</>,
    opts: [
      <>网站的界面长什么样、好不好看</>,
      <>双方事先约好的一套「怎么问、怎么答」的规矩</>,
      <>一种比 JavaScript 更高级的编程语言</>,
      <>数据库里专门存接口的一张表</>,
    ],
    correct: 1,
    wrong: [
      <>
        那是 UI(User Interface,用户界面)。API 面向的不是人眼,是程序 ——
        两段代码之间的约定。
      </>,
      undefined,
      <>
        API 不是语言。任何语言都能调 API ——
        因为它只是一套约定,约定用什么语言都能遵守。
      </>,
      <>
        数据库里存的是数据本身。API 是站在数据库前面的「服务窗口」,
        恰恰是为了不让你直接碰它。
      </>,
    ],
    why: (
      <>
        接口 = 约定。菜单约定了「你能点什么、菜端上来长什么样」,API
        约定了「你能发什么请求、响应长什么格式」。记住这个,后面一切都顺了。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        你在手机上刷天气 App,看到「杭州 26°C」。这个场景里,谁是客户端,
        谁是服务器?
      </>
    ),
    opts: [
      <>App 是客户端,天气公司机房里的那台程序是服务器</>,
      <>手机是服务器,因为数据显示在手机上</>,
      <>都是客户端,天气数据是卫星直接发的</>,
      <>这个场景没有客户端和服务器,只是本地计算</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        方向反了:显示数据的一方是「点菜的」,提供数据的一方才是「后厨」。
        手机发问,机房作答。
      </>,
      <>
        卫星收集原始观测,但你的 App 拿到的是天气服务商整理后、通过 API
        发出的数据 —— 中间必有服务器。
      </>,
      <>
        手机自己算不出全球天气 —— 26°C 这个数字一定是从别人那里「要」来的,
        一问一答就是客户端-服务器。
      </>,
    ],
    why: (
      <>
        谁发起请求,谁就是客户端(client);谁监听并响应,谁就是服务器
        (server)。角色由「谁问谁答」决定,跟设备大小、贵贱无关。
      </>
    ),
  },
  {
    type: "choice",
    q: <>下面对 JSON 的说法,哪个是对的?</>,
    opts: [
      <>JSON 是 JavaScript 专用的,Python 和 Java 读不了</>,
      <>JSON 是一种数据库</>,
      <>JSON 是一种文本格式,几乎所有编程语言都能读写</>,
      <>JSON 里字符串用单引号双引号都行</>,
    ],
    correct: 2,
    wrong: [
      <>
        名字里带 JavaScript 只说明它的来源,不代表只有 JavaScript 能用。Python 有 json 模块,Java 有
        Jackson —— 谁都能读写。
      </>,
      <>
        数据库负责「存」,JSON 负责「运」。数据从数据库出发,打包成 JSON
        文本在网上跑。
      </>,
      undefined,
      <>JSON 只认双引号 —— 单引号直接语法错误。这是它比 JS 对象「严格」的地方之一。</>,
    ],
    why: (
      <>
        JSON 的本事恰恰在于它「谁家都能用」:一段纯文本,规则简单到六种类型
        讲完,所以成了 API 世界的通用语。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        为什么你的网页不直接连数据库,非要经过服务器(API)这一道?
        最核心的原因是:
      </>
    ),
    opts: [
      <>技术上做不到,浏览器没有网线</>,
      <>
        安全:浏览器里的代码人人可见,数据库密码一放进去就等于公开;
        而且谁该看什么数据,得有人把关
      </>,
      <>数据库太慢,服务器是用来加速的</>,
      <>历史习惯,现在其实可以直连了</>,
    ],
    correct: 1,
    wrong: [
      <>
        浏览器有网络能力(fetch 就是),问题不是「能不能连」,是「敢不敢让你连」。
      </>,
      undefined,
      <>
        服务器有时确实做缓存,但那是附带好处。就算数据库无限快,
        也不能把它裸露给浏览器。
      </>,
      <>
        恰恰相反,直连数据库在今天是一票否决的安全事故。API 这道关卡永远需要。
      </>,
    ],
    why: (
      <>
        前端代码在用户手里,里面藏不住任何秘密。API 服务器站在中间:
        保管密码、验明身份、校验数据、只放行该放行的 ——
        就像餐厅不让顾客进后厨。
      </>
    ),
  },
  {
    type: "multi",
    q: <>下面哪些日常场景的背后,几乎必然有 API 调用?(多选)</>,
    opts: [
      <>扫码付款,商家「叮」一声收到钱</>,
      <>在陌生网站点「用微信登录」</>,
      <>用系统自带计算器算 3 + 4</>,
      <>评论区点「加载更多」,新评论冒出来</>,
    ],
    correct: [0, 1, 3],
    missHint: (
      <>再想想 —— 有个场景里,数据明明在别人家的服务器上,你漏选了它。</>
    ),
    extraHint: (
      <>有一项完全不需要联网 —— 数据和计算都在你手机本地,谁也不用问。</>
    ),
    why: (
      <>
        判断标准就一条:<b>这件事需要「别人家的数据或服务」吗?</b>
        支付要问银行,登录要问微信,加载评论要问网站服务器 —— 都是 API。
        本地算 3+4,自己就能办,不用发请求。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        浏览器 JavaScript 里发网络请求最常用的内置函数,名字是____
        (小写,五个字母)。
      </>
    ),
    answers: ["fetch", "fetch()"],
    hint: <>这个词的英文本义是「取回来」—— 狗狗接飞盘那个动作。</>,
    why: (
      <>
        fetch:去把数据「取回来」。它是现代浏览器的标配,也是这门课从头用到尾
        的工具 —— 第 02 章整章都是它。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        服务器回给你的 JSON,在网线上跑的时候是什么形态?到了你的 JS 里,
        要先做什么才能 <code>data.name</code> 这样取值?
      </>
    ),
    opts: [
      <>跑的时候就是 JS 对象,拿到直接用</>,
      <>跑的时候是文本,要先用 response.json() 解析成对象</>,
      <>跑的时候是图片,要先转码</>,
      <>跑的时候是加密二进制,要先解密</>,
    ],
    correct: 1,
    wrong: [
      <>
        「活的对象」出不了内存 —— 网线上只能跑字节。对象要先「拍扁」成文本,
        到站再「复活」。
      </>,
      undefined,
      <>图片是另一种响应类型(Content-Type 不同)。JSON 响应从头到尾都是文本。</>,
      <>
        HTTPS 确实会在传输层加密,但那对你的代码透明 —— 你的 JS
        拿到的仍是解好密的文本,要做的只是解析。
      </>,
    ],
    why: (
      <>
        记住这条铁律:<b>网络上跑的永远是文本(字节)</b>。response.json()
        做的事就是「文本 → 对象」,这一步漏掉,后面全是 undefined。
      </>
    ),
  },
];
