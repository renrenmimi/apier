"use client";

// 第 01 章 · HTTP —— 动手任务 LABS + 通关测验 QUIZ 数据。
// 双语:所有文案字段都是 { en, zh };代码本身两种语言逐字节相同。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "read-a-request",
    title: {
      en: "Capture a real message",
      zh: "野外抓一份真报文",
    },
    d: "easy",
    tags: {
      en: ["DevTools", "Network", "Headers"],
      zh: ["DevTools", "Network", "Header"],
    },
    task: {
      en: (
        <p>
          Open any content-heavy website. Press F12 (⌘⌥I on a Mac) to open
          DevTools, go to the <b>Network</b> panel, filter by <b>Fetch/XHR</b>,
          and open one request. In the Headers tab, write down three things:
          the request method, the status code, and the name and value of any
          three headers. Then compare them with section 05 and say what each one
          does.
        </p>
      ),
      zh: (
        <p>
          打开任意一个内容多的网站,按 F12(Mac 是 ⌘⌥I)进 <b>Network</b>{" "}
          面板,过滤 <b>Fetch/XHR</b>,挑一条请求点开。在 Headers
          标签里读出三样东西:① 请求方法;② 状态码;③ 任意三个 header
          的名字和值。抄下来,对照本章 §05 想想它们各自在说什么。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          The General block at the top of the Headers tab has Request Method and
          Status Code. Below it are two lists, Response Headers and Request
          Headers. Pick any three.
        </>
      ),
      zh: (
        <>
          Headers 标签最上面的 General 区块里就有 Request Method 和 Status
          Code;往下滚是 Response Headers 和 Request Headers 两大段,随便挑三个。
        </>
      ),
    },
    solution: {
      en: (
        <p>
          A typical result: method <b>GET</b>, status <b>200</b>, and headers
          such as <code>content-type: application/json; charset=utf-8</code>{" "}
          (the format of the response body), <code>cache-control</code> (whether
          the response may be stored), and <code>accept</code> (the formats the
          client will take). DevTools shows every header name in lowercase. That
          is normal, because header names are case-insensitive. If you also
          found <code>etag</code> or <code>authorization</code>, you have now
          seen two of the five headers from section 05 in a real message.
        </p>
      ),
      zh: (
        <p>
          典型的收获长这样:方法 <b>GET</b>,状态码 <b>200</b>,header 比如{" "}
          <code>content-type: application/json; charset=utf-8</code>
          (响应正文是什么格式)、<code>cache-control</code>(这份响应能不能存)、
          <code>accept</code>(客户端能接受什么格式)。注意 DevTools 里 header
          名全显示成小写 —— 这是正常的,header 名本来就不区分大小写。要是你还抄到了{" "}
          <code>etag</code> 或 <code>authorization</code>,§05
          的五位常客你已经在真实报文里见到两位了。
        </p>
      ),
    },
  },
  {
    id: "post-201",
    title: {
      en: "Send a body: POST your first post",
      zh: "寄一封带正文的信:POST 出你的第一篇文章",
    },
    d: "medium",
    tags: { en: ["fetch", "POST", "201"], zh: ["fetch", "POST", "201"] },
    task: {
      en: (
        <p>
          In the browser console, send a <b>POST</b> to{" "}
          <code>https://jsonplaceholder.typicode.com/posts</code> with a JSON
          body describing a new post; any title will do. Check two things. Is
          the status code <b>201</b>? Does the response contain an{" "}
          <code>id</code> that the server assigned?
        </p>
      ),
      zh: (
        <p>
          在 Console 里向 <code>https://jsonplaceholder.typicode.com/posts</code>{" "}
          发一个 <b>POST</b>,请求体是一篇「新文章」的 JSON(随便编个 title)。
          观察两件事:状态码是不是 <b>201</b>?响应里是不是多了一个服务器分配的{" "}
          <code>id</code>?
        </p>
      ),
    },
    hint: {
      en: (
        <>
          The second argument to fetch is an object with <code>method</code>,{" "}
          <code>headers</code>, and <code>body</code>. Remember to run the body
          through <code>JSON.stringify</code> first.
        </>
      ),
      zh: (
        <>
          fetch 的第二个参数传一个对象,里面 <code>method</code>、
          <code>headers</code>、<code>body</code> 三件套 —— body 记得先{" "}
          <code>JSON.stringify</code>。
        </>
      ),
    },
    solution: {
      en: (
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
            201 Created means a new resource was created, and the response body
            carries the id the server assigned. One note: JSONPlaceholder only
            pretends to write. It answers 201 with id 101, but nothing is
            stored, so every POST gets id 101. The request and the response are
            real, which is what you are practising here.
          </p>
        </>
      ),
      zh: (
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
            201 Created 表示新资源已创建,响应体里带着服务器分配的 id。说明:
            JSONPlaceholder 是「假写入」—— 它认真地回你 201 和 id 101,
            但数据并不会真的存下来(所以谁来 POST,id 都是 101)。
            报文一来一回是真的,练手足够了。
          </p>
        </>
      ),
    },
  },
  {
    id: "hit-404",
    title: { en: "Trigger a 404 on purpose", zh: "故意踩一次 404" },
    d: "easy",
    tags: {
      en: ["fetch", "404", "res.ok"],
      zh: ["fetch", "404", "res.ok"],
    },
    task: {
      en: (
        <p>
          In the console, fetch a path that does not exist:{" "}
          <code>https://jsonplaceholder.typicode.com/nothing-here</code>. Print{" "}
          <code>res.status</code> and <code>res.ok</code>. Then answer one
          question: the code reaches the <code>console.log</code> line, so did
          fetch treat this as an error?
        </p>
      ),
      zh: (
        <p>
          在 Console 里 fetch 一个根本不存在的路径:
          <code>https://jsonplaceholder.typicode.com/nothing-here</code>,
          然后打印 <code>res.status</code> 和 <code>res.ok</code>。
          再回答一个问题:代码能顺利走到 <code>console.log</code> 这一行,
          说明 fetch 认为这次调用出错了吗?
        </p>
      ),
    },
    hint: {
      en: (
        <>
          One value is a number and the other is a boolean. Print{" "}
          <code>res.statusText</code> as well.
        </>
      ),
      zh: (
        <>
          两个值一个是数字、一个是布尔值 —— 顺手再打印一个{" "}
          <code>res.statusText</code> 看看。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const res = await fetch("https://jsonplaceholder.typicode.com/nothing-here");
console.log(res.status, res.ok); // 404 false`}
          />
          <p>
            It prints <code>404 false</code>, and fetch <b>did not reject</b>.
            From fetch&apos;s point of view the exchange succeeded: the request
            was delivered and the server replied. The reply happens to say
            &ldquo;not found&rdquo;. This surprises almost everyone the first
            time. Chapter 02 shows how to handle it.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const res = await fetch("https://jsonplaceholder.typicode.com/nothing-here");
console.log(res.status, res.ok); // 404 false`}
          />
          <p>
            打印出 <code>404 false</code> —— 而且 fetch <b>没有抛错</b>。
            在它看来,请求送到了、服务器也回话了,只是回的内容是「查无此物」,
            这就算一次成功的通信。这个反直觉的行为是新手第一大坑,
            第 02 章会专门教你怎么接住它。
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
      en: <>A user posts a new comment. Which HTTP method fits best?</>,
      zh: <>用户在评论区发布一条新评论,最贴切的 HTTP 方法是?</>,
    },
    opts: [<>GET</>, <>POST</>, <>PUT</>, <>DELETE</>],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            GET is a safe method, so it must not create anything on the server.
            The comment text would also end up in the URL, and from there in the
            server logs.
          </>
        ),
        zh: (
          <>
            GET 是安全(只读)方法,不该在服务器上产生任何新东西;
            而且把评论内容塞进 GET 的 URL,还会原样进服务器日志。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            PUT means &ldquo;put this complete resource at this address&rdquo;.
            A new comment has no id yet, and the server assigns it. That is what
            POST is for.
          </>
        ),
        zh: (
          <>
            PUT 的语义是「往已知地址上放一份完整资源」。新评论的 id
            还不存在、要由服务器分配 —— 这是 POST 的活。
          </>
        ),
      },
      {
        en: <>DELETE removes something. The goal here is to create a comment.</>,
        zh: <>方向反了:DELETE 是让东西消失,你要的是让一条评论出现。</>,
      },
    ],
    why: {
      en: (
        <>
          Creating goes to POST: the data is sent to a collection such as{" "}
          <code>/comments</code>, the server processes it and assigns an id, and
          a successful create usually answers 201 Created.
        </>
      ),
      zh: (
        <>
          创建交给 POST:把数据发给集合(如 <code>/comments</code>),
          服务器处理并分配新 id,成功通常回 201 Created。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Which of these methods are <b>idempotent</b> — sending the same
          request many times leaves the server in the same state as sending it
          once? (Select all that apply.)
        </>
      ),
      zh: (
        <>
          下面哪些方法是<b>幂等(idempotent)</b>的 ——
          同一个请求发 N 次,服务器最后的状态和发 1 次一样?(多选)
        </>
      ),
    },
    opts: [<>GET</>, <>POST</>, <>PUT</>, <>PATCH</>, <>DELETE</>],
    correct: [0, 2, 4],
    missHint: {
      en: (
        <>
          One is missing. Look for a method where repeating the request leaves
          the resource in the same state. Do not let the 404 on the second try
          confuse you — idempotence is about the state, not the status code.
        </>
      ),
      zh: (
        <>
          还漏了一个 —— 找那个「重复执行,资源都是同一个下场」的方法。
          别被第二次返回 404 骗了,幂等看的是服务器状态,不是响应码。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One too many. One of the methods you picked can add another record
          every time it repeats, or is simply not promised to be repeatable by
          the specification.
        </>
      ),
      zh: (
        <>
          勾多了 —— 你选的方法里,有一个每重复一次就可能多出一条数据,
          或者规范压根不承诺重复执行结果一致。
        </>
      ),
    },
    why: {
      en: (
        <>
          GET only reads. PUT writes the same body again. DELETE leaves the
          resource gone whether you send it once or five times. The final state
          does not depend on the number of attempts. POST can create a new
          record each time. PATCH is not promised to be idempotent: a patch
          meaning &ldquo;add 10 to the balance&rdquo; adds 10 once and 20 twice.
        </>
      ),
      zh: (
        <>
          GET 只读;PUT 反复写同一份;DELETE 删一次和删五次,资源都是没了 ——
          最终状态不随次数变化,幂等成立。POST 每重复一次都可能多创建一条;PATCH
          规范上不承诺幂等(想想「余额 +10」这种补丁,执行一次加 10,两次就加 20)。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Your token is valid and the server knows who you are. You try to
          delete <b>someone else&apos;s</b> article. What should a correct
          server return?
        </>
      ),
      zh: (
        <>
          你的 token 有效,服务器清楚你是谁。你尝试删除<b>别人</b>的文章,
          规范的服务器应该回什么?
        </>
      ),
    },
    opts: [<>400</>, <>401</>, <>403</>, <>500</>],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            400 means the request itself is malformed, in syntax or in shape.
            This request is well formed; the problem is permission.
          </>
        ),
        zh: (
          <>
            400 是「请求本身有毛病(格式、语法)」—— 你这请求格式没问题,
            问题出在权限。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            401 asks who you are, and applies when the credential is missing or
            invalid. Here the credential is valid and the server knows exactly
            who you are. It simply refuses.
          </>
        ),
        zh: (
          <>
            401 问的是「你是谁?」,用在凭证缺失或无效的时候。
            这里凭证是好的,服务器清清楚楚知道你是谁 —— 它只是不许你干这事。
          </>
        ),
      },
      {
        en: (
          <>
            The server did not fail. It refused the request deliberately, which
            is not a 5xx situation.
          </>
        ),
        zh: <>服务器没出任何错,它是明确地拒绝了这次操作 —— 这不是 5xx 的事。</>,
      },
    ],
    why: {
      en: (
        <>
          403 Forbidden means the server knows who you are and does not allow
          this. 401 asks who you are, and a new login can fix it. 403 says you
          are not allowed, so logging in as the same user changes nothing.
        </>
      ),
      zh: (
        <>
          403 Forbidden = 「认识你,但你不许」。401 问「你是谁」,
          重新登录有救;403 说「你不许」,换谁登录都没用。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>An API returns 503. What is the most reasonable first reaction?</>,
      zh: <>调用某个 API 返回 503,最合理的第一反应是?</>,
    },
    opts: [
      { en: <>Check whether my request is malformed</>, zh: <>检查自己的请求格式是不是写错了</> },
      {
        en: (
          <>
            The server is temporarily unavailable; retry later, and look for a{" "}
            <code>Retry-After</code> header
          </>
        ),
        zh: (
          <>
            服务器那边暂时不可用,稍后重试(顺便看看有没有{" "}
            <code>Retry-After</code> 头)
          </>
        ),
      },
      { en: <>My token expired, so log in again</>, zh: <>我的 token 过期了,重新登录</> },
      { en: <>The URL is wrong and the resource does not exist</>, zh: <>URL 打错了,资源不存在</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A malformed request is a 4xx, usually 400. A code starting with 5
            means the server is reporting that the problem is on its side.
          </>
        ),
        zh: (
          <>
            格式错是 4xx(通常是 400)的事。状态码以 5 开头,
            就是服务器在说「问题在我这边」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A token problem arrives as 401. 503 has nothing to do with your
            identity.
          </>
        ),
        zh: <>token 的问题会以 401 的形式出现 —— 503 和你的身份没有关系。</>,
      },
      {
        en: (
          <>
            A wrong URL usually gives 404. 503 means the server is running but
            cannot serve right now.
          </>
        ),
        zh: <>URL 错通常撞见的是 404;503 是「服务器活着,但现在服务不了」。</>,
      },
    ],
    why: {
      en: (
        <>
          The first digit says whose problem it is: 4xx is the request, 5xx is
          the server. 503 means the service is temporarily unavailable, from
          overload or maintenance, and it often carries a{" "}
          <code>Retry-After</code> header saying when to come back.
        </>
      ),
      zh: (
        <>
          状态码首位就指明了责任方:4xx 请求的问题,5xx 服务器的问题。503 =
          过载或维护导致的临时不可用,常配 <code>Retry-After</code>{" "}
          头告诉你几秒后再来。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A request header says <code>Content-Type: application/json</code>.
          What does it tell the server?
        </>
      ),
      zh: (
        <>
          请求头里写 <code>Content-Type: application/json</code>,
          是在告诉服务器什么?
        </>
      ),
    },
    opts: [
      { en: <>I want you to return JSON to me</>, zh: <>我希望你返回 JSON 给我</> },
      { en: <>The body I am sending you is JSON</>, zh: <>我随请求发给你的正文,是 JSON 格式</> },
      { en: <>I accept any format</>, zh: <>我什么格式都能接受</> },
      { en: <>Please compress the response</>, zh: <>请把响应压缩一下再发</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            &ldquo;What I want back&rdquo; is the Accept header. Keep the pair
            straight: Content-Type describes what I send, Accept describes what
            I want.
          </>
        ),
        zh: (
          <>
            「我想要什么」是 Accept 头的活。记住这一对:Content-Type
            说「我发的」,Accept 说「我想要的」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            &ldquo;Anything&rdquo; is written <code>Accept: */*</code>, which is
            again Accept, not Content-Type.
          </>
        ),
        zh: (
          <>
            「都能接受」的表达是 <code>Accept: */*</code> ——
            还是 Accept 家的事,和 Content-Type 无关。
          </>
        ),
      },
      {
        en: (
          <>
            Compression is negotiated with Accept-Encoding, for example gzip.
            That is a different header.
          </>
        ),
        zh: <>压缩协商用的是 Accept-Encoding(如 gzip),和 Content-Type 是两回事。</>,
      },
    ],
    why: {
      en: (
        <>
          Content-Type describes the format of <b>the body in this message</b>.
          Send JSON without it and the server may parse the body as plain text
          or as form data. The usual result is empty fields, or a 400.
        </>
      ),
      zh: (
        <>
          Content-Type 描述<b>这条报文里正文</b>的格式。发 JSON
          却忘了带它,服务器可能按纯文本或表单去解析 ——
          轻则字段全空,重则直接 400。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          In the URL{" "}
          <code>https://api.shop.com/v1/products/42?sort=price</code>, which
          part is <code>api.shop.com</code>?
        </>
      ),
      zh: (
        <>
          URL <code>https://api.shop.com/v1/products/42?sort=price</code> 中,
          <code>api.shop.com</code> 属于哪个部分?
        </>
      ),
    },
    opts: [
      { en: <>The scheme</>, zh: <>协议(scheme)</> },
      { en: <>The host (domain name)</>, zh: <>域名(host)</> },
      { en: <>The path</>, zh: <>路径</> },
      { en: <>The query string</>, zh: <>查询字符串</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The scheme is <code>https://</code> at the front. It says how the
            message is sent, and whether the connection is encrypted.
          </>
        ),
        zh: (
          <>
            scheme 是最前面的 <code>https://</code> ——
            它规定这条报文怎么传、连接加不加密。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The path is <code>/v1/products/42</code>, the part after the host.
          </>
        ),
        zh: <>路径是域名后面那串 <code>/v1/products/42</code>。</>,
      },
      {
        en: (
          <>
            The query string is <code>sort=price</code>, after the{" "}
            <code>?</code>. It carries options for the result.
          </>
        ),
        zh: (
          <>
            查询字符串是 <code>?</code> 后面的 <code>sort=price</code> ——
            对结果的附加选项。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The host says which server receives the request, and DNS translates it
          into an IP address. The <code>api.</code> prefix is a common
          convention: web pages on <code>www.</code>, the API on{" "}
          <code>api.</code>
        </>
      ),
      zh: (
        <>
          host 回答「这条报文送到哪台服务器」,由 DNS 翻译成 IP 地址。
          前面挂个 <code>api.</code> 子域名是行业惯例:网页住 <code>www.</code>,
          API 住 <code>api.</code>
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>/users/42</code> currently has three fields: name, email, and
          bio. You send <b>PUT</b> with only{" "}
          <code>{'{ "name": "New name" }'}</code>. According to HTTP semantics,
          what happens?
        </>
      ),
      zh: (
        <>
          <code>/users/42</code> 现有 name、email、bio 三个字段。你用 <b>PUT</b>{" "}
          只发了 <code>{'{ "name": "新名字" }'}</code>,按 HTTP 语义,结果是?
        </>
      ),
    },
    opts: [
      {
        en: <>Only name changes; email and bio stay as they are</>,
        zh: <>只有 name 变了,email 和 bio 原样保留</>,
      },
      {
        en: <>The resource is replaced, so email and bio are gone</>,
        zh: <>资源被整体替换:email 和 bio 没了</>,
      },
      { en: <>The server must reject it with 400</>, zh: <>服务器必然拒绝,返回 400</> },
      { en: <>The server treats it as a PATCH</>, zh: <>服务器会自动把它当成 PATCH 处理</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Changing only the fields you send is what PATCH does. PUT says:
            replace the existing resource with the one I send.
          </>
        ),
        zh: (
          <>
            「只改这几个字段」是 PATCH 的行为。PUT 的语义写得很清楚:
            用我给的这份,<b>整体换掉</b>原来那份。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            This is a valid PUT, and most servers will carry it out. It does not
            raise an error, which is exactly why it loses data quietly.
          </>
        ),
        zh: (
          <>
            语义上这是一次完全合法的 PUT,服务器多半会照办 ——
            正因为它不报错,才最容易悄悄弄丢数据。
          </>
        ),
      },
      {
        en: (
          <>
            The method is not converted for you. The request line says PUT, so
            the server applies PUT semantics.
          </>
        ),
        zh: <>方法不会自动转换 —— 请求行上写着 PUT,服务器就按 PUT 办。</>,
      },
    ],
    why: {
      en: (
        <>
          PUT replaces the whole resource and is idempotent. PATCH changes part
          of it and is not promised to be idempotent. Sending half an object
          with PUT is the most common way beginners lose fields. You can
          reproduce it safely on JSONPlaceholder.
        </>
      ),
      zh: (
        <>
          PUT = 整体替换且幂等;PATCH = 部分修改、不承诺幂等。
          用 PUT 传半个对象,是新手弄丢字段最常见的原因 ——
          在 JSONPlaceholder 上可以安全地亲手复现一次。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          A client sends a request with a cache validator (
          <code>If-None-Match</code> plus an ETag). The server finds that the
          resource has not changed, so it returns only a status code and no
          body. That status code is ____ (three digits).
        </>
      ),
      zh: (
        <>
          客户端带着缓存校验信息(<code>If-None-Match</code> + ETag)发起请求,
          服务器发现资源没变,只回状态码、不重发正文 ——
          这个状态码是____(三位数字)。
        </>
      ),
    },
    placeholder: { en: "three digits", zh: "三位数字" },
    answers: ["304"],
    hint: {
      en: (
        <>
          It starts with 3, the family that points you somewhere else. Here it
          points to your own cache.
        </>
      ),
      zh: <>它以 3 开头 —— 属于「去别处」家族,这里指的是你自己的缓存。</>,
    },
    why: {
      en: (
        <>
          304 Not Modified means the copy you already have is still current, so
          the server does not send it again. Only the headers travel. Chapter 05
          covers conditional requests and caching in detail.
        </>
      ),
      zh: (
        <>
          304 Not Modified:「你手上那份还新鲜,我就不重发了。」
          正文全省,一来一回只剩头部 —— 第 05 章会把条件请求和缓存讲透。
        </>
      ),
    },
  },
];
