"use client";

// 第 04 章 · RESTful 设计实战 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "url-makeover",
    title: "修正五个有问题的 URL",
    d: "easy",
    tags: ["URL 设计"],
    task: (
      <>
        <p>
          纸笔或心算都行 —— 给下面五个 URL 写出问题诊断和修改后的写法
          (方法 + 路径):
        </p>
        <p>
          ① <code>GET /getAllUsers</code>
          <br />② <code>POST /user/create</code>
          <br />③ <code>GET /api/fetchPostById?post=7</code>
          <br />④ <code>GET /posts/7/delete</code>
          <br />⑤ <code>POST /Users/7/AddComment</code>
        </p>
      </>
    ),
    hint: (
      <>口诀:动词交给方法,名词留给路径,复数表集合,单数 id 挂在集合后。</>
    ),
    solution: (
      <p>
        ① <code>GET /users</code>(get 与方法重复,All 是多余的)。
        <br />② <code>POST /users</code>(POST 本身就是 create;user 要复数)。
        <br />③ <code>GET /posts/7</code>(fetch、ById 都与方法重复;id 应放进路径)。
        <br />④ <code>DELETE /posts/7</code> ——
        这个最危险:用 GET 做删除,浏览器预加载、爬虫扫一遍,数据就没了。
        <br />⑤ <code>POST /users/7/comments</code>;不过评论一般从属于文章,
        更常见的是 <code>POST /posts/42/comments</code>
        ,评论人放请求体或登录态里。
      </p>
    ),
  },
  {
    id: "put-vs-patch",
    title: "亲手复现 PUT 的「字段蒸发」",
    d: "medium",
    tags: ["fetch", "JSONPlaceholder"],
    task: (
      <p>
        打开浏览器 Console,对{" "}
        <code>https://jsonplaceholder.typicode.com/posts/1</code>{" "}
        发两次请求:先 PUT、后 PATCH,body 都只带{" "}
        <code>{'{ "title": "hi" }'}</code>。对比两次响应,盯住{" "}
        <code>body</code> 和 <code>userId</code> 这两个字段的命运。
      </p>
    ),
    hint: (
      <>
        记得带 <code>Content-Type: application/json</code> 请求头,
        不然服务器不知道你发的是 JSON。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const url = "https://jsonplaceholder.typicode.com/posts/1";
const headers = { "Content-Type": "application/json" };
const body = JSON.stringify({ title: "hi" });

const put = await (await fetch(url, { method: "PUT", headers, body })).json();
console.log(put);   // { id: 1, title: "hi" } —— body、userId 蒸发了

const patch = await (await fetch(url, { method: "PATCH", headers, body })).json();
console.log(patch); // { userId: 1, id: 1, title: "hi", body: "quia et..." }`}
        />
        <p>
          PUT 的响应只剩 <code>id</code> 和 <code>title</code> ——
          你没发的字段,它就当你要删;PATCH 的响应里原字段全都健在。
          (JSONPlaceholder 是演习场,不会真改库,但这套语义演示是真实的。)
        </p>
      </>
    ),
  },
  {
    id: "movie-api",
    title: "电影评分网站的竣工图",
    d: "hard",
    tags: ["API 设计", "综合"],
    task: (
      <p>
        给一个电影评分网站(资源:movies / ratings / users)画端点总表:
        方法、路径、成功码、主要失败码。需求:浏览电影列表(支持按年份过滤)
        、看单部电影、给电影打分(1–5 分,<b>一人一部只能一条</b>)、
        改自己的分、删自己的分、看某部电影的所有评分。
      </p>
    ),
    hint: (
      <>
        「一人一部只能一条」—— 第二次对同一部电影 POST 打分,
        该回哪个状态码?§04 的牌桌上出现过它。
      </>
    ),
    solution: (
      <>
        <p>参考答案(你的不必一模一样):</p>
        <p>
          <code>GET /movies?year=2026</code> → 200(过滤放 query)
          <br />
          <code>GET /movies/42</code> → 200;查无此片 404
          <br />
          <code>GET /movies/42/ratings</code> → 200;查无此片 404
          <br />
          <code>POST /movies/42/ratings</code> → 201;没登录 401;重复打分{" "}
          <b>409</b>;分数写 6 → <b>422</b>
          <br />
          <code>PATCH /ratings/1001</code> → 200;改别人的分 403
          <br />
          <code>DELETE /ratings/1001</code> → 204;再删一次 404
        </p>
        <p>
          三条底线必须成立:动词在方法里、名词在路径里、状态码准确表达结果。
          做到这三条,细节怎么定都算合格设计。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>想要「所有电影」的列表,哪个设计最像样?</>,
    opts: [
      <>
        <code>GET /getMovies</code>
      </>,
      <>
        <code>GET /movies</code>
      </>,
      <>
        <code>GET /movie_list.php</code>
      </>,
      <>
        <code>POST /api/FetchAllMovies</code>
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        动词混进了 URL —— 动作已经由 GET 表达了,路径里再写 get
        属于重复表达。
      </>,
      undefined,
      <>
        三宗罪:暴露实现(.php)、下划线、还是单数。哪天换掉 PHP,
        这个 URL 就成了历史包袱。
      </>,
      <>
        读数据却用 POST:缓存、书签、安全重试全部作废;
        外加动词和大写驼峰,一个 URL 犯了三条规矩。
      </>,
    ],
    why: (
      <>
        名词、复数、全小写、没有动词、不暴露实现 ——{" "}
        <code>GET /movies</code> 五项全中。URL 是「哪儿」,方法是「干嘛」。
      </>
    ),
  },
  {
    type: "choice",
    q: <>给 42 号文章新增一条评论,最标准的请求是?</>,
    opts: [
      <>
        <code>POST /posts/42/comments</code>
      </>,
      <>
        <code>POST /comments/create?postId=42</code>
      </>,
      <>
        <code>PUT /posts/42/comments</code>
      </>,
      <>
        <code>GET /posts/42/addComment</code>
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        create 是动词,POST 本身就是「创建」;postId
        更该进路径去表达从属关系,而不是挂在问号后面。
      </>,
      <>
        PUT 的合同是「把这个 URI 上的东西整个换成我发的」——
        对评论集合做 PUT,等于要求换掉整个评论区。
      </>,
      <>
        GET 带副作用是大忌:它是「安全」方法,爬虫和预加载会随意触发 ——
        扫一遍,你的文章就多出一堆幽灵评论。
      </>,
    ],
    why: (
      <>
        创建 = 对集合 POST。评论从属于文章,
        <code>/posts/42/comments</code> 一层嵌套刚好说清这层关系,
        成功后回 201。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>POST /posts</code> 成功创建了文章,最规范的响应是?
      </>
    ),
    opts: [
      <>
        200 OK,body 里写 <code>{'{"success": true}'}</code>
      </>,
      <>
        201 Created + <code>Location: /posts/43</code> 头 + 回显新资源
      </>,
      <>204 No Content —— 反正客户端知道自己发了什么</>,
      <>301,把客户端重定向到新文章</>,
    ],
    correct: 1,
    wrong: [
      <>
        200 勉强能用,但浪费了 HTTP 专为「无中生有」准备的
        201;success 字段更是画蛇添足 —— 状态码本身就是答案。
      </>,
      undefined,
      <>
        客户端不知道的恰恰是服务器生成的部分:新 id、createdAt —— 204
        把这些全咽回去了,客户端还得再发一次 GET 去要。
      </>,
      <>
        301 是「资源永久搬家」的导航语义,用在这儿等于对刚出生的资源说
        「你搬走了」—— 语义完全对不上。
      </>,
    ],
    why: (
      <>
        创建成功三件套:201 报喜、Location 头指路、body
        回显完整新资源(带上服务器生成的 id 和时间戳)。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        你只想把 43 号文章的<b>标题</b>改掉,其余字段一律保留。发哪个请求?
      </>
    ),
    opts: [
      <>
        <code>PUT /posts/43</code>,body 只带 <code>{"{ title }"}</code>
      </>,
      <>
        <code>PATCH /posts/43</code>,body 只带 <code>{"{ title }"}</code>
      </>,
      <>
        <code>POST /posts/43</code>,body 只带 <code>{"{ title }"}</code>
      </>,
      <>先 DELETE 再重新 POST 一篇</>,
    ],
    correct: 1,
    wrong: [
      <>
        PUT 是整体替换 —— 只发 title,等于宣布「这篇文章从此只有标题」,
        body、createdAt 全会被清掉。新手丢数据的最常见的原因。
      </>,
      undefined,
      <>
        对已存在的单个资源做 POST,没有约定俗成的语义 ——
        读代码的人无法判断它到底要做什么。
      </>,
      <>
        目的能达到,但代价过大:id 变了、createdAt 变了,
        所有引用这篇文章的链接全断 —— 用大炮打蚊子,还打塌了房。
      </>,
    ],
    why: (
      <>
        PATCH = 打补丁:只改你提到的字段,没提的原样保留。
        「部分修改」就是它存在的意义。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        注册接口收到一份<b>语法合法</b>的 JSON,但 email 字段填的是{" "}
        <code>"hello"</code>。回什么状态码最贴切?
      </>
    ),
    opts: [<>400</>, <>409</>, <>422</>, <>500</>],
    correct: 2,
    wrong: [
      <>
        400 说的是「话都没说利索」—— 比如 JSON 解析失败。这份 JSON
        语法正确,问题出在内容语义,那是 422 的领域。
      </>,
      <>
        409 是「和服务器现有状态冲突」,比如用户名被占。
        <code>"hello"</code> 跟谁都不冲突,它单纯不是个邮箱。
      </>,
      undefined,
      <>
        500 表示服务器自身出错。这明明是客户端发来的数据不合格,
        责任不在服务器,不该用 5xx。
      </>,
    ],
    why: (
      <>
        422 Unprocessable Content:语法过关、语义不过关 ——
        校验失败的标准答案,细节用 Problem Details 说清。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        RFC 9457 Problem Details 规定,错误响应的 Content-Type
        应该是____。(完整写出媒体类型)
      </>
    ),
    placeholder: "application/…",
    answers: ["application/problem+json"],
    hint: (
      <>
        在 <code>application/json</code> 中间插一个词 ——「有问题的 JSON」。
      </>
    ),
    why: (
      <>
        <code>application/problem+json</code>。客户端一看这个媒体类型,
        就知道 body 里是 type / title / status / detail / instance
        这套标准错误结构,不用再学各家黑话。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>DELETE /posts/43</code> 第一次返回 204,第二次返回 404。
        DELETE 还算幂等吗?
      </>
    ),
    opts: [
      <>不算 —— 两次响应码都不一样了</>,
      <>
        算 —— 幂等看的是服务器状态:执行一次和执行 N 次,结局都是
        「43 号不存在」
      </>,
      <>只有第一次那下算幂等</>,
      <>取决于服务器的具体实现</>,
    ],
    correct: 1,
    wrong: [
      <>
        这是最常见的误会:幂等的定义对象是「对服务器状态的副作用」,
        不是「响应长得一不一样」。响应码只是每次的答话。
      </>,
      undefined,
      <>
        幂等描述的是「重复执行整组请求」的性质,不存在
        「某一次幂等」的说法。
      </>,
      <>
        RFC 9110 把 DELETE 定义为幂等方法 —— 这是语义契约,
        实现应当遵守,不是各家心情问题。
      </>,
    ],
    why: (
      <>
        删一次和删十次,服务器都停在同一个状态:「43 号不存在」——
        所以 DELETE 幂等。响应码是答话,状态才是合同标的。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>/users/1/posts/2/comments/3/replies/4</code> 这个 URL,
        最该做的手术是?
      </>
    ),
    opts: [
      <>不用动 —— 层级清晰,信息完整</>,
      <>
        拆平:评论、回复的 id 全局唯一,直接{" "}
        <code>/comments/3/replies</code> 或 <code>/replies/4</code>
      </>,
      <>把数字 id 都换成名字</>,
      <>
        改成 <code>POST /api</code>,把路径塞进 body
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        四层嵌套意味着客户端要先集齐 4 个 id 才拼得出 URL ——
        又长又脆,上游改一层,全线折断。
      </>,
      undefined,
      <>
        id 换 slug 是另一个话题(可读性),嵌套过深的结构问题
        一点没解决。
      </>,
      <>
        这是直接退化回成熟度 L0 的「所有请求都打同一个 POST 端点」——
        第 03 章的梯子白爬了。
      </>,
    ],
    why: (
      <>
        嵌套最多两层(collection/id/collection)。更深的资源如果 id
        全局唯一,就让它自立门户 —— URL 短一寸,健壮一分。
      </>
    ),
  },
];
