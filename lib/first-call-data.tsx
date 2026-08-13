"use client";

// 第 02 章 · 第一次调用 API —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "ditto-fields",
    title: "改装宝可梦查询器:查 ditto,多显示一个字段",
    d: "medium",
    tags: ["PokeAPI", "DOM", "fetch"],
    task: (
      <p>
        把 §03 那份宝可梦查询器代码抄进一个 html 文件(或直接在 Console 里做),
        改成查 <code>ditto</code>,并在身高体重之外<b>多显示一个字段</b> ——
        推荐 <code>types</code>(属性)或 <code>base_experience</code>。
        提示:先把整个响应对象 console.log 出来,看看还有什么宝贝。
      </p>
    ),
    hint: (
      <>
        <code>types</code> 是个数组,每个元素长这样:
        <code>{'{ type: { name: "normal" } }'}</code> —— 得用 map
        把名字捞出来再 join。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
if (!res.ok) throw new Error("HTTP " + res.status);
const p = await res.json();

console.log(p.height, p.weight); // 3 40
console.log(p.types.map((t) => t.type.name).join(", ")); // normal`}
        />
        <p>
          页面版只需给 innerHTML 多拼一行:
          <code>
            {'"<p>属性:" + p.types.map((t) => t.type.name).join(", ") + "</p>"'}
          </code>
          。真实 API 的响应经常套好几层 —— 像这样先打印再顺藤摸瓜,
          是每个前端每天都在干的事。
        </p>
      </>
    ),
  },
  {
    id: "post-first-data",
    title: "第一次往服务器寄数据:POST 一篇文章",
    d: "easy",
    tags: ["POST", "JSON", "201"],
    task: (
      <p>
        在 Console 里,用 §04 的三件套向{" "}
        <code>https://jsonplaceholder.typicode.com/posts</code> POST
        一篇自己编的文章。验证两件事:<code>res.status</code> 是不是{" "}
        <b>201</b>?响应里有没有服务器分配的 <code>id</code>?
      </p>
    ),
    hint: (
      <>
        三件套:method、headers 里的 Content-Type、JSON.stringify 过的
        body —— 少一个都会出怪事。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "上路第一天", body: "hello", userId: 1 }),
});
console.log(res.status); // 201
const created = await res.json();
console.log(created); // { title: "上路第一天", ..., id: 101 }`}
        />
        <p>
          201 Created + 一个新 id —— 这就是「创建成功」的标准剧本。
          JSONPlaceholder 是假写入(id 永远 101,数据不落库),
          但请求和响应的来回是货真价实的。
        </p>
      </>
    ),
  },
  {
    id: "open-meteo",
    title: "查一次真天气:Open-Meteo 取当前气温",
    d: "medium",
    tags: ["Open-Meteo", "真实数据"],
    task: (
      <p>
        调用真实的天气 API(免费免注册):
        <code>
          https://api.open-meteo.com/v1/forecast?latitude=30.25&amp;longitude=120.17&amp;current_weather=true
        </code>
        ,从响应里取出<b>当前气温</b>并打印成「xx°C」。
        这个坐标是杭州 —— 打印完可以换成你所在城市的经纬度再来一次。
      </p>
    ),
    hint: (
      <>
        先把整个响应打印出来找路径 —— 气温埋在{" "}
        <code>current_weather</code> 对象里面。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const url =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=30.25&longitude=120.17&current_weather=true";

const res = await fetch(url);
if (!res.ok) throw new Error("HTTP " + res.status);
const data = await res.json();
console.log(data.current_weather.temperature + "°C");`}
        />
        <p>
          注意这次的查询参数(latitude、longitude、current_weather)——
          第 01 章 URL 解剖台讲的东西,在真实 API 里就这么用。恭喜:
          你已经跑通了一条和生产环境同款的数据链路。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        执行 <code>const p = fetch(url)</code> 的那一瞬间,变量 p
        里装的是什么?
      </>
    ),
    opts: [
      <>服务器返回的数据</>,
      <>一张「取餐码」:Promise,数据以后凭它兑现</>,
      <>解析好的 JSON 对象</>,
      <>true 或 false,表示成功与否</>,
    ],
    correct: 1,
    wrong: [
      <>
        网络一来一回要几十上百毫秒,JS 不会原地罚站等它 ——
        立刻拿到的只能是「凭证」,不是货。
      </>,
      undefined,
      <>
        JSON 要等响应到货、再经 res.json() 解析才有 ——
        这一瞬间八字还没一撇。
      </>,
      <>
        fetch 不返回布尔值;成败要等 Promise 兑现那一刻才见分晓。
      </>,
    ],
    why: (
      <>
        fetch 发起请求后<b>立刻</b>返回一个 Promise(取餐码),
        真正的响应之后才到。await 和 .then 都是「凭码取餐」的方式。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>res.ok</code> 什么时候为 true?
      </>
    ),
    opts: [
      <>只要服务器回复了,就是 true</>,
      <>状态码在 200–299 之间时</>,
      <>只有状态码恰好是 200 时</>,
      <>响应体是合法 JSON 时</>,
    ],
    correct: 1,
    wrong: [
      <>
        回个 404 也算「回复了」,但 ok 是 false —— ok
        看的是状态码的段位,不是有没有回信。
      </>,
      undefined,
      <>
        201 Created、204 No Content 也是成功,ok 同样为 true ——
        整个 2xx 家族都算。
      </>,
      <>res.ok 只看状态码,跟正文是什么格式毫无关系。</>,
    ],
    why: (
      <>
        <code>res.ok</code> 就是{" "}
        <code>{"status >= 200 && status <= 299"}</code> 的语法糖 ——
        一个属性顶一行判断。
      </>
    ),
  },
  {
    type: "choice",
    q: <>什么情况下 fetch 的 Promise 才会 reject(直接跳进 catch)?</>,
    opts: [
      <>服务器返回 404 时</>,
      <>服务器返回 500 时</>,
      <>断网、域名解析失败这类网络层故障时</>,
      <>响应 JSON 里带 error 字段时</>,
    ],
    correct: 2,
    wrong: [
      <>
        404 在 fetch 眼里是一次<b>成功的通信</b>:信寄到了、对方回了话,
        只是回的是「查无此物」。
      </>,
      <>
        500 同理:坏消息也是消息 —— 回信收到了,fetch 就认为自己完工了。
      </>,
      undefined,
      <>
        fetch 根本不拆正文看内容 —— 业务层的错误,要你自己解析后判断。
      </>,
    ],
    why: (
      <>
        fetch 只关心「信寄没寄到、回信收没收到」。收到了,无论好坏都
        resolve;寄不出去(断网、域名不存在、CORS 拦截)才 reject。
        所以 <code>if (!res.ok)</code> 必须自己写。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>const a = await res.json();</code> 之后又写了一行{" "}
        <code>const b = await res.json();</code>,第二行会发生什么?
      </>
    ),
    opts: [
      <>b 拿到和 a 一样的数据</>,
      <>报错:响应体这条流已经被读过了</>,
      <>b 是 null</>,
      <>浏览器自动重新发一次请求</>,
    ],
    correct: 1,
    wrong: [
      <>
        流读完不会自动倒带 —— 想要同样的数据,直接用变量 a 就好,
        它又不会跑。
      </>,
      undefined,
      <>
        不是悄悄塞给你个 null,是明确抛错(TypeError: body stream
        already read)—— 这点还算厚道。
      </>,
      <>
        res 只是那一次响应的封装,再怎么折腾它,也不会触发新的网络请求。
      </>,
    ],
    why: (
      <>
        响应体是一条<b>只能流过一次</b>的水管。要复用,第一次就{" "}
        <code>const data = await res.json()</code> 存进变量 ——
        这就是模板里那样写的原因。
      </>
    ),
  },
  {
    type: "multi",
    q: <>用 fetch 向服务器发送一段 JSON 数据,下面哪些是必须写的?(多选)</>,
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
      <>手动 setTimeout 等三秒,给服务器留出处理时间</>,
    ],
    correct: [0, 1, 2],
    missHint: (
      <>
        三件套还没凑齐 —— 换动词、声明格式、序列化正文,少了哪件?
      </>
    ),
    extraHint: (
      <>
        有一项纯属多余 —— fetch 返回的 Promise 自己会等响应,
        轮不到你掐秒表。
      </>
    ),
    why: (
      <>
        三件套各管一段:method 换动词(默认 GET,而 GET 带 body 会被
        fetch 直接拒收);Content-Type 告诉服务器按 JSON 解析;JSON.stringify
        把对象拍扁成能上网线的文本。缺谁,谁的岗位就出事。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        把 JS 对象转换成 JSON 文本的方法,是 JSON.____(9 个字母)。
      </>
    ),
    placeholder: "9 个小写字母",
    answers: ["stringify", "stringify()"],
    hint: (
      <>这个词的意思是「变成字符串」—— 它是 parse 的反方向。</>
    ),
    why: (
      <>
        JSON.stringify:对象 → 文本,发出去之前用;JSON.parse:文本 →
        对象,收进来之后用(fetch 里这步由 res.json() 代劳)。
        一出一进,正好一对。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        浏览器里 fetch 某个 API 报了 CORS 错误,但用 curl
        请求同一地址一切正常。数据是被谁拦下的?
      </>
    ),
    opts: [
      <>API 服务器拒绝处理这个请求</>,
      <>你自己的浏览器,依据同源策略</>,
      <>网络运营商</>,
      <>fetch 函数的 bug</>,
    ],
    correct: 1,
    wrong: [
      <>
        服务器多半正常处理并返回了(Network 面板里甚至能看到请求)——
        是响应送到浏览器门口时被扣下的。
      </>,
      undefined,
      <>运营商不管这事 —— curl 都通了,说明链路根本没问题。</>,
      <>
        换 XMLHttpRequest、换 axios 一样报错 ——
        规矩是浏览器定的,不是哪个函数的锅。
      </>,
    ],
    why: (
      <>
        同源策略(same-origin policy)是浏览器保护用户的铁律:B
        域名的响应默认不给 A 网站的脚本读,除非 B 用
        Access-Control-Allow-Origin 点头。curl 没有这条规矩,所以畅通。
        详细拆解在第 06 章。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>async function f() {"{ return 42; }"}</code>,直接调用{" "}
        <code>f()</code>,拿到的是什么?
      </>
    ),
    opts: [
      <>数字 42</>,
      <>一个 Promise,兑现值是 42</>,
      <>undefined</>,
      <>字符串 &quot;42&quot;</>,
    ],
    correct: 1,
    wrong: [
      <>
        42 确实在里面,但隔着一层 Promise 包装 —— 要{" "}
        <code>await f()</code> 或 <code>f().then(...)</code> 才能拆出来。
      </>,
      undefined,
      <>函数明明 return 了 —— 值没丢,只是被包进了 Promise。</>,
      <>没有任何类型转换发生,42 还是数字。</>,
    ],
    why: (
      <>
        async 函数的返回值<b>永远</b>被自动包成 Promise ——
        所以调用它的人也常常要 await。async/await
        是会「传染」的,坦然接受即可。
      </>
    ),
  },
];
