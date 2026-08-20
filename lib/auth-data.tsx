"use client";

// 第 06 章 · 认证与安全 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语,英文默认)。
// 代码块只写一份英文示例数据;只有注释分 en/zh,可执行行两边必须逐字节相同。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "base64-not-crypto",
    title: {
      en: "Check for yourself that encoding is not encryption",
      zh: "亲手验一遍:编码不是加密",
    },
    d: "easy",
    tags: ["btoa", "Basic", "Console"],
    task: {
      en: (
        <p>
          Open the browser console. Run{" "}
          <code>btoa(&quot;student:secret123&quot;)</code> to get the string
          that Basic authentication sends, then run <code>atob()</code> on the
          result to get it back. Did you supply a key at any point? Answer that
          question and you have understood the security model of Basic
          authentication.
        </p>
      ),
      zh: (
        <p>
          打开浏览器 Console,运行{" "}
          <code>btoa(&quot;student:secret123&quot;)</code>,
          得到 Basic 认证实际发送的那串字符,再对结果运行 <code>atob()</code>{" "}
          还原回来。全程你提供过密钥吗?想清楚这个问题,
          你就懂了 Basic 认证的安全模型。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          btoa is &quot;binary to ASCII&quot; and atob is the reverse. Notice
          that neither takes a key. That is exactly the point.
        </>
      ),
      zh: (
        <>
          btoa 是 binary to ASCII,atob 是它的反向操作。
          注意:两者都不接受密钥参数 —— 关键正在这里。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const encoded = btoa("student:secret123");
console.log(encoded); // "c3R1ZGVudDpzZWNyZXQxMjM="
console.log(atob(encoded)); // "student:secret123" — no key needed`}
          />
          <p>
            That string is exactly what Basic authentication puts on the wire.
            Anyone who captures the header can <b>reverse it without a key</b>.
            So Basic without HTTPS hands the password to whoever is watching the
            connection.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const encoded = btoa("student:secret123");
console.log(encoded); // "c3R1ZGVudDpzZWNyZXQxMjM="
console.log(atob(encoded)); // "student:secret123" —— 不需要任何密钥`}
          />
          <p>
            这串字符就是 Basic 认证在网线上传输的样子。
            任何截到这个 header 的人都能<b>无需密钥地还原</b>它。
            所以 Basic 一旦离开 HTTPS,就等于把密码交给线路上的任何人。
          </p>
        </>
      ),
    },
  },
  {
    id: "jwt-io",
    title: {
      en: "Take a real token apart on jwt.io",
      zh: "去 jwt.io 拆一枚真令牌",
    },
    d: "medium",
    tags: ["JWT", "jwt.io"],
    task: {
      en: (
        <>
          <p>
            Run the code below in the console to build a token in the same shape
            as the one in section 04. Paste the printed token into the{" "}
            <b>Encoded</b> box on <b>jwt.io</b> and compare the decoded result
            with what you saw on the bench.
          </p>
          <CodeBlock
            lang="js"
            title="console"
            code={`const b64u = (obj) =>
  btoa(JSON.stringify(obj))
    .replace(/=+$/, "").replace(/\\+/g, "-").replace(/\\//g, "_");

const token =
  b64u({ alg: "HS256", typ: "JWT" }) + "." +
  b64u({ sub: "42", name: "Ada Lovelace", role: "editor",
         exp: 1798761600 }) + "." +
  "signature-goes-here";
console.log(token);`}
          />
        </>
      ),
      zh: (
        <>
          <p>
            在 Console 里跑下面的代码,造一枚和 §04
            解剖台同款结构的令牌。把打印出来的 token 粘进 <b>jwt.io</b> 的{" "}
            <b>Encoded</b> 输入框,再把解码结果和解剖台上看到的对照一遍。
          </p>
          <CodeBlock
            lang="js"
            title="console"
            code={`const b64u = (obj) =>
  btoa(JSON.stringify(obj))
    .replace(/=+$/, "").replace(/\\+/g, "-").replace(/\\//g, "_");

const token =
  b64u({ alg: "HS256", typ: "JWT" }) + "." +
  b64u({ sub: "42", name: "Ada Lovelace", role: "editor",
         exp: 1798761600 }) + "." +
  "signature-goes-here";
console.log(token);`}
          />
        </>
      ),
    },
    hint: {
      en: (
        <>
          jwt.io will show <b>Invalid Signature</b> in red. Work out why. That
          red line is the most important idea in this chapter.
        </>
      ),
      zh: (
        <>
          jwt.io 会用红字显示 <b>Invalid Signature</b>。想想为什么 ——
          那行红字正是这一章最重要的知识点。
        </>
      ),
    },
    solution: {
      en: (
        <p>
          The three parts are colored on the left, and on the right the header
          and the payload appear <b>in full</b>. You produced them with{" "}
          <code>btoa</code> and jwt.io reads them back without any key, which
          shows again that the payload is not encrypted. &quot;Invalid
          Signature&quot; appears because a valid signature has to be computed
          with the <b>server&apos;s key</b>, and we typed a placeholder instead.
          A server checks the same way and rejects a forged token. One more
          thing to try:{" "}
          <code>new Date(1798761600 * 1000)</code> shows that{" "}
          <code>exp</code> points at 2027-01-01. After that moment the token is
          rejected.
        </p>
      ),
      zh: (
        <p>
          左边三段被分色显示,右边的 header 和 payload <b>完整现形</b>。
          它们是你用 <code>btoa</code> 造出来的,jwt.io
          不需要任何密钥就读了回来 —— 再一次说明 payload 没有加密。
          红字「Invalid Signature」出现,是因为合法签名必须用
          <b>服务器的密钥</b>算出来,而我们随手填了一个占位串。
          服务器也是这样验的,伪造的令牌当场就会被拒。再顺手跑一句{" "}
          <code>new Date(1798761600 * 1000)</code>:<code>exp</code> 指向
          2027-01-01,过了那一刻,这枚令牌就会被拒收。
        </p>
      ),
    },
  },
  {
    id: "cors-error",
    title: {
      en: "Cause a CORS error on purpose, then read it",
      zh: "故意制造一次 CORS 报错,再把它读懂",
    },
    d: "medium",
    tags: ["CORS", "fetch", "Console"],
    task: {
      en: (
        <p>
          Open the console on any page, including this one. Run{" "}
          <code>fetch(&quot;https://www.google.com&quot;)</code> and read the red
          message line by line. Then run{" "}
          <code>
            fetch(&quot;https://jsonplaceholder.typicode.com/posts/1&quot;)
          </code>{" "}
          and compare. One is blocked and one is not. What is different?
        </p>
      ),
      zh: (
        <p>
          在任意页面(本站也行)打开 Console,先运行{" "}
          <code>fetch(&quot;https://www.google.com&quot;)</code>,
          把那段红字逐句读一遍;再运行{" "}
          <code>
            fetch(&quot;https://jsonplaceholder.typicode.com/posts/1&quot;)
          </code>{" "}
          对比。一个被拦,一个通过,差别在哪?
        </p>
      ),
    },
    hint: {
      en: (
        <>
          Two phrases in the red text: <code>blocked by CORS policy</code> and{" "}
          <code>No &apos;Access-Control-Allow-Origin&apos; header</code>. Ask{" "}
          <b>who</b> is doing the blocking, and <b>who</b> would have to add the
          missing header.
        </>
      ),
      zh: (
        <>
          红字里有两个关键短语:<code>blocked by CORS policy</code> 和{" "}
          <code>No &apos;Access-Control-Allow-Origin&apos; header</code>。
          问两个问题:是<b>谁</b>在拦?那个缺失的头,该由<b>谁</b>来加?
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`// First call: blocked
fetch("https://www.google.com").catch((e) => console.log(e.message));
// The message says the response was blocked by the CORS policy,
// because it carries no Access-Control-Allow-Origin header

// Second call: allowed
const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
console.log(res.status); // 200`}
          />
          <p>
            google.com does not send the header, because it does not want other
            pages&apos; scripts reading its responses. jsonplaceholder does send{" "}
            <code>Access-Control-Allow-Origin: *</code>, which is normal for a
            public practice API. Note where the error happens:{" "}
            <b>in your browser</b>. The request very likely reached
            google&apos;s servers; the browser simply refused to hand your script
            the response. The same URL through curl produces no error at all,
            because curl is not a browser.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`// First call: blocked
fetch("https://www.google.com").catch((e) => console.log(e.message));
// 报错大意:响应被 CORS 策略拦下,
// 因为它没有带 Access-Control-Allow-Origin 头

// Second call: allowed
const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
console.log(res.status); // 200`}
          />
          <p>
            google.com 不发这个头,因为它并不想让别家页面的脚本读它的响应;
            jsonplaceholder 发了 <code>Access-Control-Allow-Origin: *</code>,
            这是公共练习 API 的常规做法。注意报错发生在哪:
            <b>你自己的浏览器里</b>。请求很可能已经到达 google 的服务器,
            只是浏览器拒绝把响应交给你的脚本。同样的地址用 curl 跑,
            则完全没有这个问题 —— curl 不是浏览器。
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
      en: <>How do authentication and authorization divide the work?</>,
      zh: <>认证(authentication)和授权(authorization)各管什么?</>,
    },
    opts: [
      {
        en: <>Authentication asks who you are; authorization asks what you may do</>,
        zh: <>认证问「你是谁」,授权问「你能做什么」</>,
      },
      {
        en: <>Authentication asks what you may do; authorization asks who you are</>,
        zh: <>认证问「你能做什么」,授权问「你是谁」</>,
      },
      {
        en: <>They are two words for the same thing and can be used interchangeably</>,
        zh: <>两个词说的是同一件事,可以混着用</>,
      },
      {
        en: <>Authentication is for human users; authorization is for programs</>,
        zh: <>认证给人类用户用,授权给程序用</>,
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            The two are swapped. Identity is established first
            (authentication), then permissions are checked (authorization). The
            order never changes.
          </>
        ),
        zh: (
          <>
            正好说反了。先确定身份(认证),再查权限(授权),
            顺序永远是这样。
          </>
        ),
      },
      {
        en: (
          <>
            HTTP keeps them apart with two status codes: 401 for
            authentication, 403 for authorization. Two codes means two
            different problems.
          </>
        ),
        zh: (
          <>
            HTTP 用两个状态码把它们分开:401 管认证,403 管授权。
            分别配一个状态码,说明它们是两件事。
          </>
        ),
      },
      {
        en: (
          <>
            It makes no difference whether the caller is a person or a program.
            A program calling an API also proves its identity first and then has
            its permissions checked.
          </>
        ),
        zh: (
          <>
            跟调用方是人还是程序无关。程序调 API
            一样要先证明身份,再被检查权限,两步一步不少。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Two questions at the door: &quot;who are you&quot; is
          authentication, &quot;may you enter this room&quot; is authorization.
          Once you keep them apart, 401 and 403 and OAuth scopes all follow.
        </>
      ),
      zh: (
        <>
          门口的两个问题:「你是谁」是认证,「这个房间你能不能进」是授权。
          把这两个词分清,401 和 403、OAuth 的 scope 就都顺下来了。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A user is <b>logged in normally</b> and tries to delete another
          user&apos;s post. What should the server answer?
        </>
      ),
      zh: (
        <>
          一位用户<b>已经正常登录</b>,却试图删除别人的帖子。
          服务器最恰当的回应是?
        </>
      ),
    },
    opts: [
      { en: <>401 — the user has no permission</>, zh: <>401 —— 他没有权限</> },
      {
        en: <>403 — the server knows who this is and still refuses</>,
        zh: <>403 —— 服务器知道他是谁,但仍然拒绝</>,
      },
      { en: <>404 — pretend the post does not exist</>, zh: <>404 —— 假装帖子不存在</> },
      {
        en: (
          <>
            200 — with <code>&quot;error&quot;: true</code> in the body
          </>
        ),
        zh: (
          <>
            200 —— 但 body 里写 <code>&quot;error&quot;: true</code>
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            401 is about the credential: missing, malformed, or expired. This
            user&apos;s credential is fine. The refusal is about permission, and
            that is 403.
          </>
        ),
        zh: (
          <>
            401 说的是凭证有问题:没带、格式不对或过期。
            这位用户的凭证没问题,卡住的是权限 —— 那是 403 的地盘。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Answering 404 instead of 403 is a real practice — GitHub does it, so
            that a refusal does not reveal that a private resource exists. But
            that is a deliberate choice for a specific threat, not the default
            answer.
          </>
        ),
        zh: (
          <>
            用 404 代替 403 确实是真实做法 —— GitHub 就这么干,
            为的是不让一次拒绝暴露出某个私有资源的存在。
            但那是针对特定威胁的取舍,不是默认答案。
          </>
        ),
      },
      {
        en: (
          <>
            Always returning 200 and hiding the error in the body is the
            anti-pattern named in chapter 04. The status code exists for this;
            let it do its job.
          </>
        ),
        zh: (
          <>
            一律回 200、把错误藏进 body,是第 04 章点过名的反模式。
            状态码就是干这个用的,让它干活。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          401 means &quot;I do not know who you are&quot; — a new credential can
          fix it, and the response should say which scheme to use in{" "}
          <code>WWW-Authenticate</code>. 403 means &quot;I know who you are and
          the answer is no&quot; — logging in again changes nothing.
        </>
      ),
      zh: (
        <>
          401 的意思是「我不知道你是谁」——
          换一份凭证可能就好了,响应里还应该用{" "}
          <code>WWW-Authenticate</code> 说明该用哪种认证方式。403
          的意思是「我知道你是谁,但不行」—— 再登一百次也一样。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>Authorization: Basic c3R1ZGVudDpzZWNyZXQxMjM=</code> — what is
          that string?
        </>
      ),
      zh: (
        <>
          <code>Authorization: Basic c3R1ZGVudDpzZWNyZXQxMjM=</code> ——
          这串字符的本质是什么?
        </>
      ),
    },
    opts: [
      {
        en: <>An encrypted password that cannot be read without the key</>,
        zh: <>加密后的密码,没有密钥读不出来</>,
      },
      {
        en: (
          <>
            base64 encoding. Anyone can run <code>atob()</code> on it and get
            back <code>student:secret123</code>
          </>
        ),
        zh: (
          <>
            只是 base64 编码。任何人 <code>atob()</code> 一下就能还原出{" "}
            <code>student:secret123</code>
          </>
        ),
      },
      { en: <>A hash of the password, which cannot be reversed</>, zh: <>密码的哈希值,不可逆</> },
      { en: <>A random session id issued by the server</>, zh: <>服务器发的随机会话 id</> },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            No key is involved anywhere. btoa and atob are a public, published
            transformation. Encoding changes how bytes are written; it provides
            no confidentiality at all.
          </>
        ),
        zh: (
          <>
            全程没有任何密钥参与。btoa 和 atob 是公开的变换规则。
            编码改变的只是字节的书写方式,不提供任何保密性。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A hash is one-way and cannot be turned back into the input. This
            string turns back perfectly, so it is not a hash.
          </>
        ),
        zh: (
          <>
            哈希是单向的,还原不回输入。而这串字符能完美还原,
            所以它不是哈希。
          </>
        ),
      },
      {
        en: (
          <>
            The client computes it on its own by encoding the username and
            password. The server takes no part in producing it. That is exactly
            how plain Basic authentication is.
          </>
        ),
        zh: (
          <>
            它是客户端自己算的:把用户名和密码编码一下而已,
            服务器根本没参与。Basic 认证就是这么简陋。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          base64 solves a transport problem — writing arbitrary bytes as text
          that fits in a header. It provides no confidentiality. That is why
          Basic authentication must run over HTTPS, which is what actually keeps
          it private.
        </>
      ),
      zh: (
        <>
          base64 解决的是运输问题:把任意字节写成能塞进 header 的文本。
          它不提供任何保密性。所以 Basic 认证必须跑在 HTTPS 上 ——
          真正负责保密的是 HTTPS。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>Which statement about the three parts of a JWT is correct?</>,
      zh: <>关于 JWT 的三段结构,下面哪句是对的?</>,
    },
    opts: [
      {
        en: <>The payload is encrypted, so only the server can read it</>,
        zh: <>payload 是加密的,只有服务器能读</>,
      },
      {
        en: (
          <>
            The signature shows the first two parts were not altered, but anyone
            holding the token can decode the payload
          </>
        ),
        zh: (
          <>
            签名能证明前两段没被改过,但拿到令牌的人都能解码 payload
          </>
        ),
      },
      {
        en: <>You can edit a field in the payload and the server will not notice</>,
        zh: <>改掉 payload 里的字段再发回去,服务器发现不了</>,
      },
      {
        en: <>All three parts are random strings with no internal structure</>,
        zh: <>三段都是随机字符串,没有内部结构</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The payload is Base64URL encoded, not encrypted. Paste a token into
            jwt.io and it is on screen. This is why sensitive data does not
            belong in it.
          </>
        ),
        zh: (
          <>
            payload 是 Base64URL 编码的,不是加密的。
            把令牌粘进 jwt.io 就全在屏幕上了 ——
            这正是敏感数据不该放进去的原因。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            It is caught immediately. The signature is computed over the first
            two parts with the server&apos;s key, so one changed character makes
            verification fail — as long as the server pins the algorithm it
            expects instead of trusting the header, which is the mistake that{" "}
            <code>alg: none</code> attacks rely on.
          </>
        ),
        zh: (
          <>
            当场就会被抓住。签名是用服务器密钥对前两段算出来的,
            改一个字符就验不过 —— 前提是服务器按自己预期的算法验签,
            而不是听信 header 里写的那个。<code>alg: none</code>{" "}
            这类攻击,吃的就是后一种疏忽。
          </>
        ),
      },
      {
        en: (
          <>
            Each part has a job: the header names the algorithm, the payload
            carries the claims, the signature protects both. The first two
            decode back into readable JSON.
          </>
        ),
        zh: (
          <>
            三段各有分工:header 说明算法,payload 装声明,signature
            保护前两段。前两段都能解码回可读的 JSON。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A JWT is <b>signed, not encrypted</b>. The signature proves the token
          came from a holder of the key and was not altered. It does not keep
          anything private. If content must stay private, either leave it out or
          encrypt the token itself, which is a different format called JWE.
        </>
      ),
      zh: (
        <>
          JWT 是<b>签名的,不是加密的</b>。签名证明的是「令牌由持有密钥的一方签发、
          之后没被改过」,它不负责保密。真有内容需要保密,
          要么别放进去,要么把令牌整体加密 —— 那是另一种格式,叫 JWE。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Access tokens are issued with a short life on purpose, from minutes to
          a few hours. When one expires, the client does not interrupt the user.
          It sends the longer-lived ____ token it is holding and receives a new
          pair. (one English word)
        </>
      ),
      zh: (
        <>
          access token 是故意发得短命的,几分钟到几小时。它过期后,
          客户端不去打扰用户,而是把手里那枚寿命更长的 ____ token
          提交上去,换回新的一对令牌。(填英文单词)
        </>
      ),
    },
    placeholder: { en: "Type one English word…", zh: "输入英文单词…" },
    answers: ["refresh", "refresh token", "refreshtoken"],
    hint: {
      en: <>The word means to renew something. It is also the name of the F5 key.</>,
      zh: <>这个词的意思是「刷新」,也就是键盘上 F5 键的英文。</>,
    },
    why: {
      en: (
        <>
          A short access token plus a refresh token is the standard way to make
          stateless tokens workable. A leaked access token expires quickly, and
          the refresh token is stored on the server, so it can be revoked — which
          is how you get back the revocation that a plain signed token gives up.
        </>
      ),
      zh: (
        <>
          「短命 access + refresh 换发」是让无状态令牌可用的标准做法:
          access token 就算泄露也很快过期,而 refresh token 存在服务器上、
          可以随时作废 —— 纯签名令牌放弃掉的撤销能力,就是这样买回来的。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Five steps of the authorization code flow: ① you approve the request
          on the authorization server&apos;s page ② the client sends the code
          and its <code>code_verifier</code> to the token endpoint and receives
          an access token ③ you click &quot;connect my photo library&quot; and
          the browser is redirected to the authorization server ④ the client
          calls the resource server with the token ⑤ the authorization server
          sends the browser back to the client with a code. What is the correct
          order?
        </>
      ),
      zh: (
        <>
          授权码流程的五步:① 你在授权服务器的页面上点了同意 ② 客户端把
          code 和 <code>code_verifier</code> 发到令牌端点,换回 access token ③
          你点「连接我的相册」,浏览器被重定向到授权服务器 ④
          客户端带着令牌去调资源服务器 ⑤ 授权服务器把浏览器送回客户端,
          并带上一个 code。正确顺序是?
        </>
      ),
    },
    opts: [
      { en: <>③ → ① → ⑤ → ② → ④</>, zh: <>③ → ① → ⑤ → ② → ④</> },
      { en: <>③ → ① → ② → ⑤ → ④</>, zh: <>③ → ① → ② → ⑤ → ④</> },
      { en: <>① → ③ → ⑤ → ② → ④</>, zh: <>① → ③ → ⑤ → ② → ④</> },
      { en: <>③ → ⑤ → ① → ④ → ②</>, zh: <>③ → ⑤ → ① → ④ → ②</> },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            The code has to reach the client first (⑤) before the client can
            exchange it (②). The exchange is a direct request from the client to
            the token endpoint, not something that happens in the browser.
          </>
        ),
        zh: (
          <>
            code 得先随浏览器回到客户端手里(⑤),客户端才能拿它去换(②)。
            这一次交换是客户端直连令牌端点发出的,不在浏览器里发生。
          </>
        ),
      },
      {
        en: (
          <>
            You cannot approve a request before you are on the page that asks
            for it. ③ has to put you on the authorization server first.
          </>
        ),
        zh: (
          <>
            还没到那个页面,你上哪儿点同意?
            必须先由 ③ 把你送到授权服务器,① 才有地方发生。
          </>
        ),
      },
      {
        en: (
          <>
            Out of order in two places: without your consent (①) the server
            issues no code, and without the token (②) there is nothing to call
            the API with (④).
          </>
        ),
        zh: (
          <>
            两处都乱了:没有你的同意(①),服务器不会发 code;
            没换到令牌(②),也没法去调 API(④)。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          The chain is: redirect, consent, code, exchange, call. The code is
          short-lived and single-use; the token is the thing that grants access.
          The exchange happens on a direct request, and PKCE ties it to the
          secret the client generated at the start, so a stolen code is not
          enough.
        </>
      ),
      zh: (
        <>
          这条链是:跳转 → 同意 → 发码 → 换票 → 取数。code
          短命且只能用一次,真正给出访问权限的是令牌。
          换票走的是直连请求,而 PKCE
          把它和客户端一开始生成的秘密绑在一起 —— 单靠一个偷来的 code 不够用。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A resource server receives a valid OAuth 2.0 access token. What does
          the token establish?
        </>
      ),
      zh: (
        <>
          资源服务器收到一枚有效的 OAuth 2.0 access token。这枚令牌证明了什么?
        </>
      ),
    },
    opts: [
      {
        en: <>That the bearer was granted the permissions listed in it</>,
        zh: <>持有者被授予了令牌上写明的那些权限</>,
      },
      {
        en: <>That the resource server has verified the user&apos;s identity</>,
        zh: <>资源服务器已经核实了用户的身份</>,
      },
      {
        en: (
          <>
            That the bearer is the user it refers to, because nobody else could
            have obtained it
          </>
        ),
        zh: <>持有者就是令牌所指的那个用户,因为别人拿不到它</>,
      },
      { en: <>Nothing, until the payload is decrypted</>, zh: <>什么也证明不了,除非先把 payload 解密</> },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            The resource server verified a token, not a person. OAuth 2.0
            delegates access. Establishing who the user is belongs to OpenID
            Connect, which adds an ID token for exactly that.
          </>
        ),
        zh: (
          <>
            资源服务器验的是一枚令牌,不是一个人。OAuth 2.0 授出去的是访问权限。
            「用户是谁」由 OpenID Connect 负责,
            它正是为此多发了一枚 ID token。
          </>
        ),
      },
      {
        en: (
          <>
            A bearer token means possession is sufficient. A leaked token, or one
            issued to a different application, still presents as valid. Identity
            claims belong in an ID token that the client validates.
          </>
        ),
        zh: (
          <>
            bearer 令牌意味着「拿到就算数」。
            泄露出去的令牌,或者本来发给别的应用的令牌,照样验得过。
            身份声明该放在由客户端校验的 ID token 里。
          </>
        ),
      },
      {
        en: (
          <>
            An access token may be an opaque random string or a signed JWT.
            Either way there is nothing encrypted for the resource server to
            decrypt.
          </>
        ),
        zh: (
          <>
            access token 可能是一串不透明的随机字符,也可能是一枚签名的 JWT。
            两种情况里都没有什么加密内容等着资源服务器去解。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          OAuth 2.0 is a framework for <b>delegated authorization</b>. The access
          token answers what the bearer may do. OpenID Connect is the identity
          layer built on top of it, and its ID token answers who the user is.
          Treating an access token as proof of identity is the most common
          mistake made with OAuth.
        </>
      ),
      zh: (
        <>
          OAuth 2.0 是一套<b>委托授权</b>框架:access token
          回答的是「持有者能做什么」。建在它之上的身份层是 OpenID Connect,
          由 ID token 回答「用户是谁」。
          把 access token 当身份证明用,是 OAuth 最常见的错误。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: <>Which statements about CORS are correct? (select all that apply)</>,
      zh: <>关于 CORS,下面哪些说法是对的?(多选)</>,
    },
    opts: [
      {
        en: <>The browser withholds the response from your script, not the server</>,
        zh: <>扣下响应、不交给你的脚本的是浏览器,不是服务器</>,
      },
      { en: <>curl and Postman are subject to CORS too</>, zh: <>curl 和 Postman 也受 CORS 管</> },
      {
        en: (
          <>
            Before a non-simple request, such as one with an Authorization header
            or a JSON body, the browser sends an OPTIONS preflight on its own
          </>
        ),
        zh: (
          <>
            对于非简单请求(比如带 Authorization 头或 JSON 正文的),
            浏览器会自己先发一条 OPTIONS 预检
          </>
        ),
      },
      {
        en: (
          <>
            When a CORS error appears, the request may already have reached the
            server and been processed
          </>
        ),
        zh: <>出现 CORS 报错时,请求可能已经到达服务器并被正常处理了</>,
      },
    ],
    correct: [0, 2, 3],
    missHint: {
      en: (
        <>
          One is missing. Think about who sends the preflight, and about whether
          the request actually left the machine when the error appeared.
        </>
      ),
      zh: (
        <>
          漏了一条。想想预检是谁发出的,
          以及报错的时候那个请求究竟出没出门。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One of your picks does not belong. Ask <b>who</b> applies the CORS
          rules — there is no browser inside a command line tool.
        </>
      ),
      zh: (
        <>
          有一项不该选。想想 CORS 的规则是<b>谁</b>在执行 ——
          命令行工具里根本没有浏览器。
        </>
      ),
    },
    why: {
      en: (
        <>
          CORS is how a server relaxes the same-origin policy that browsers
          apply. Only browsers apply it, so curl and Postman are unaffected. The
          server may well have answered 200; the browser simply did not hand the
          body to your script. Those three points diagnose most CORS problems on
          their own.
        </>
      ),
      zh: (
        <>
          CORS 是服务器放宽「浏览器执行的同源策略」的方式。
          只有浏览器执行它,所以 curl 和 Postman 不受影响。
          服务器很可能已经回了 200,只是浏览器没把正文交给你的脚本。
          想通这三点,大多数 CORS 问题都能自己诊断出来。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You have a key for a paid weather API and plan to put it directly in
          your frontend JavaScript. Is that workable?
        </>
      ),
      zh: (
        <>
          你拿到一个收费天气 API 的 key,打算直接写进前端 JavaScript 里调用。
          这个方案可行吗?
        </>
      ),
    },
    opts: [
      {
        en: <>Yes — the bundler obfuscates the key, so nobody can find it</>,
        zh: <>可行 —— 打包器会混淆它,没人找得到</>,
      },
      { en: <>Yes — as long as everything is over HTTPS, nobody can take it</>, zh: <>可行 —— 只要全程 HTTPS,没人偷得走</> },
      {
        en: (
          <>
            No — code in a browser is readable by the user, so the key is
            public. Call the API from your own backend instead
          </>
        ),
        zh: (
          <>
            不可行 —— 浏览器里的代码用户都能读,key 等于公开。
            应该由你自己的后端去调用
          </>
        ),
      },
      { en: <>No, but moving the key into a query parameter fixes it</>, zh: <>不可行,但把 key 挪到 query 参数里就行了</> },
    ],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            Obfuscation only renames variables. The moment the request goes out,
            the key is in the header or the URL in plain text, and the Network
            panel shows it.
          </>
        ),
        zh: (
          <>
            混淆只是把变量名改丑。请求一发出去,key
            就以明文出现在 header 或 URL 里,Network 面板一看就有。
          </>
        ),
      },
      {
        en: (
          <>
            HTTPS protects the traffic from third parties on the network. It does
            not protect it from the person operating the browser, and the key was
            delivered to that browser.
          </>
        ),
        zh: (
          <>
            HTTPS 防的是网络上的第三方,防不了操作浏览器的这个人 ——
            而 key 正是发到他浏览器里的。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A query parameter is worse than a header: URLs end up in server logs,
            browser history, and <code>Referer</code> headers, so sharing a link
            can share the key.
          </>
        ),
        zh: (
          <>
            query 参数比 header 更糟:URL 会进服务器日志、浏览器历史和{" "}
            <code>Referer</code> 头,转发一个链接就可能把 key 一起送出去。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Code running in a browser cannot keep a secret. The working pattern is
          a backend proxy: the page calls your API, and your server, holding the
          key in an environment variable, calls the third party. That hop is also
          a good place for caching and rate limiting.
        </>
      ),
      zh: (
        <>
          跑在浏览器里的代码保不住秘密。可行的做法是后端代理:
          页面调你自己的 API,你的服务器(key 存在环境变量里)再去调第三方。
          这一跳顺便还是加缓存和限流的好位置。
        </>
      ),
    },
  },
];
