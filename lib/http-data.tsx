"use client";

// 第 01 章 · HTTP —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "read-a-request",
    title: "野外抓一份真报文",
    d: "easy",
    tags: ["DevTools", "Network", "Header"],
    task: (
      <p>
        打开任意一个内容多的网站,按 F12(Mac 是 ⌘⌥I)进 <b>Network</b>{" "}
        面板,过滤 <b>Fetch/XHR</b>,挑一条请求点开。在 Headers 标签里读出三样东西:
        ① 请求方法;② 状态码;③ 任意三个 header 的名字和值。
        抄下来,对照本章 §05 想想它们各自在说什么。
      </p>
    ),
    hint: (
      <>
        Headers 标签最上面的 General 区块里就有 Request Method 和 Status
        Code;往下滚是 Response Headers 和 Request Headers 两大段,随便挑三个。
      </>
    ),
    solution: (
      <p>
        典型的收获长这样:方法 <b>GET</b>,状态码 <b>200</b>,header 比如{" "}
        <code>content-type: application/json; charset=utf-8</code>
        (响应正文是什么格式)、<code>cache-control</code>(这份响应能不能缓存)、
        <code>accept</code>(客户端想要什么格式)。注意 DevTools 里 header
        名全显示成小写 —— 没毛病,header 名本来就不区分大小写。要是你还抄到了{" "}
        <code>etag</code> 或 <code>authorization</code>,恭喜,§05
        的五位常客你已经野外目击了两位。
      </p>
    ),
  },
  {
    id: "post-201",
    title: "寄一封带正文的信:POST 出你的第一篇文章",
    d: "medium",
    tags: ["fetch", "POST", "201"],
    task: (
      <p>
        在 Console 里向 <code>https://jsonplaceholder.typicode.com/posts</code>{" "}
        发一个 <b>POST</b>,请求体是一篇「新文章」的 JSON(随便编个 title)。
        观察两件事:状态码是不是 <b>201</b>?响应里是不是多了一个服务器分配的{" "}
        <code>id</code>?
      </p>
    ),
    hint: (
      <>
        fetch 的第二个参数传一个对象,里面 method、headers、body 三件套 ——
        body 记得先 JSON.stringify。
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
  body: JSON.stringify({ title: "hello api", body: "my first post", userId: 1 }),
});
console.log(res.status); // 201
const created = await res.json();
console.log(created.id); // 101`}
        />
        <p>
          201 Created:新资源造好了,响应体里带着服务器分配的 id。说明:
          JSONPlaceholder 是「假写入」—— 它认真地回你 201 和 id 101,
          但数据并不会真的存下来(所以谁来 POST,id 都是 101)。
          报文一来一回是真的,这就够练了。
        </p>
      </>
    ),
  },
  {
    id: "hit-404",
    title: "故意踩一次 404",
    d: "easy",
    tags: ["fetch", "404", "res.ok"],
    task: (
      <p>
        在 Console 里 fetch 一个根本不存在的路径:
        <code>https://jsonplaceholder.typicode.com/nothing-here</code>,
        然后打印 <code>res.status</code> 和 <code>res.ok</code>。
        再回答一个问题:代码能顺利走到 console.log 这一行,
        说明 fetch 报错了吗?
      </p>
    ),
    hint: (
      <>
        两个值一个是数字、一个是布尔值 —— 顺手再打印一个{" "}
        <code>res.statusText</code> 看看。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const res = await fetch("https://jsonplaceholder.typicode.com/nothing-here");
console.log(res.status, res.ok); // 404 false`}
        />
        <p>
          打印出 <code>404 false</code> —— 而且 fetch <b>没有报错</b>。
          在它看来,信寄到了、对方也回了话,只是回的是「查无此物」,
          这就算一次成功的通信。这个反直觉的行为是新手第一大坑,
          第 02 章会专门教你怎么接住它。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: <>用户在评论区发布一条新评论,最贴切的 HTTP 方法是?</>,
    opts: [<>GET</>, <>POST</>, <>PUT</>, <>DELETE</>],
    correct: 1,
    wrong: [
      <>
        GET 是安全(只读)方法,不该在服务器上产生任何新东西;
        而且把评论内容塞进 GET 的 URL,还会原样进服务器日志。
      </>,
      undefined,
      <>
        PUT 的语义是「往已知地址上放一份完整资源」。新评论的 id
        还不存在、要由服务器分配 —— 这活是 POST 的。
      </>,
      <>方向全反了:DELETE 是让东西消失,你是要让一条评论出现。</>,
    ],
    why: (
      <>
        创建交给 POST:把数据交给集合(如 <code>/comments</code>),
        服务器处理并分配新 id,成功通常回 201 Created。
      </>
    ),
  },
  {
    type: "multi",
    q: (
      <>
        下面哪些方法是<b>幂等(idempotent)</b>的 ——
        重复执行 N 次,服务器状态和执行 1 次一样?(多选)
      </>
    ),
    opts: [<>GET</>, <>POST</>, <>PUT</>, <>PATCH</>, <>DELETE</>],
    correct: [0, 2, 4],
    missHint: (
      <>
        还漏了 —— 有个方法「重复执行,资源都是同一个下场」,
        别被第二次返回 404 骗了,幂等看的是服务器状态,不是响应码。
      </>
    ),
    extraHint: (
      <>
        勾多了 —— 有个方法每重复一次就可能多出一条数据(或者规范压根不承诺
        结果一致),它不幂等。
      </>
    ),
    why: (
      <>
        GET 只读、PUT 反复替换成同一份、DELETE 删几次资源都是「没了」——
        状态不随次数变化,幂等成立。POST 重复提交会重复创建;PATCH
        规范上不承诺幂等(想想「余额 +10」这种补丁,执行两次就多扣一次)。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        你登录状态正常(token 有效),尝试删除<b>别人</b>的文章,
        规范的服务器应该回什么?
      </>
    ),
    opts: [<>400</>, <>401</>, <>403</>, <>500</>],
    correct: 2,
    wrong: [
      <>
        400 是「请求本身有毛病(格式、语法)」—— 你这请求格式没问题,
        问题出在权限。
      </>,
      undefined,
      <>
        401 问的是「你是谁?凭证缺失或无效」。这里凭证是好的,
        服务器清清楚楚知道你是谁 —— 它只是不许你干这事。
      </>,
      <>服务器没出任何错,它是清醒且坚定地拒绝了你 —— 这不是 5xx 的事故。</>,
    ],
    why: (
      <>
        403 Forbidden = 「认识你,但你不许」。记口诀:401 问「你是谁」,
        403 说「你不许」—— 401 重新登录有救,403 换谁登录都没用。
      </>
    ),
  },
  {
    type: "choice",
    q: <>调用某个 API 返回 503,最合理的第一反应是?</>,
    opts: [
      <>检查自己的请求格式是不是写错了</>,
      <>服务器那边暂时不可用,稍后重试(顺便看看有没有 Retry-After 头)</>,
      <>我的 token 过期了,重新登录</>,
      <>URL 打错了,资源不存在</>,
    ],
    correct: 1,
    wrong: [
      <>
        格式错是 400 那一家(4xx)的事。状态码以 5 开头,
        就是服务器在说「问题在我这边」。
      </>,
      undefined,
      <>token 的问题会以 401 的形式找上门 —— 503 和你的身份毫无关系。</>,
      <>URL 错通常撞见的是 404;503 是「服务器活着,但现在服务不了」。</>,
    ],
    why: (
      <>
        状态码首位就是「甩锅方向」:4xx 你的问题,5xx 服务器的问题。503 =
        过载或维护中的临时歇业,常配 Retry-After 头告诉你几秒后再来。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        请求头里写 <code>Content-Type: application/json</code>,
        是在告诉服务器什么?
      </>
    ),
    opts: [
      <>我希望你返回 JSON 给我</>,
      <>我随请求发给你的正文,是 JSON 格式</>,
      <>我什么格式都能接受</>,
      <>请把响应压缩一下再发</>,
    ],
    correct: 1,
    wrong: [
      <>
        「我想要什么」是 Accept 头的活。记住这一对:Content-Type
        说「我发的」,Accept 说「我想要的」。
      </>,
      undefined,
      <>
        「都能接受」的表达是 <code>Accept: */*</code> ——
        还是 Accept 家的事,和 Content-Type 无关。
      </>,
      <>压缩协商用的是 Accept-Encoding(如 gzip)—— 另一位专员负责。</>,
    ],
    why: (
      <>
        Content-Type 描述<b>随信附上的正文</b>是什么格式。发 JSON
        却忘了带它,服务器可能按纯文本或表单去解析 ——
        轻则字段全空,重则直接 400。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        URL <code>https://api.shop.com/v1/products/42?sort=price</code> 中,
        <code>api.shop.com</code> 属于哪个部分?
      </>
    ),
    opts: [<>协议</>, <>域名(主机)</>, <>路径</>, <>查询参数</>],
    correct: 1,
    wrong: [
      <>
        协议是最前面的 <code>https://</code> ——
        它规定这封信用什么规矩递送(加不加密)。
      </>,
      undefined,
      <>
        路径是域名后面那串 <code>/v1/products/42</code> ——
        进了大楼之后去哪个房间。
      </>,
      <>
        查询参数是 <code>?</code> 后面的 <code>sort=price</code> ——
        对结果的附加要求。
      </>,
    ],
    why: (
      <>
        域名(host)回答「这封信寄到哪台服务器」,由 DNS 翻译成 IP 地址。
        前面挂个 <code>api.</code> 子域名是行业惯例:网页住 www.,API 住 api.。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>/users/42</code> 现有 name、email、bio 三个字段。你用 <b>PUT</b>{" "}
        只发了 <code>{'{ "name": "新名字" }'}</code>,按 HTTP 语义,结果是?
      </>
    ),
    opts: [
      <>只有 name 变了,email 和 bio 原样保留</>,
      <>资源被整体替换:email 和 bio 没了</>,
      <>服务器必然拒绝,返回 400</>,
      <>服务器会自动把它当成 PATCH 处理</>,
    ],
    correct: 1,
    wrong: [
      <>
        「只改这几个字段」是 PATCH 的行为。PUT 的合同写得很清楚:
        用我给的这份,<b>整体换掉</b>原来那份。
      </>,
      undefined,
      <>
        语义上这是一次完全合法的 PUT,服务器多半会照办 ——
        正因为它不报错,才最容易悄悄弄丢数据。
      </>,
      <>方法不会自动转换 —— 你寄的信封上写着 PUT,服务器就按 PUT 办。</>,
    ],
    why: (
      <>
        PUT = 整体替换且幂等;PATCH = 部分修改、不承诺幂等。
        用 PUT 传半个对象,是新手弄丢字段的头号案发现场 ——
        在 JSONPlaceholder 上可以安全地亲手复现一次。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        客户端带着缓存指纹(<code>If-None-Match</code> + ETag)发起请求,
        服务器发现资源没变,只回状态码、不重发正文 ——
        这个状态码是____(三位数字)。
      </>
    ),
    placeholder: "三位数字",
    answers: ["304"],
    hint: (
      <>
        它以 3 开头 —— 属于「去别处」家族,意思是「去你自己的缓存里拿」。
      </>
    ),
    why: (
      <>
        304 Not Modified:「你手上那份还新鲜,我就不重发了。」
        正文都省掉,一来一回只剩头部 —— 大流量 API 的省钱利器,
        第 05 章会把这套协商缓存讲透。
      </>
    ),
  },
];
