"use client";

// 第 06 章 · 认证与安全(双语,英文默认):
// 认证 vs 授权 → API Key → Basic → JWT → OAuth 2.0 → CORS → 安全清单 →
// 动手任务 → 测验 → 要点。
// 文案一律走 <T en zh /> 或 Loc<…>,不要写 lang === "en" ? … : …。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
  Method,
  Status,
} from "@/lib/kit";
import { CodeBlock } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/auth-data";
import { T } from "@/lib/i18n";
import {
  TrustLadder,
  ProxyFlow,
  Base64Lab,
  JwtDecoder,
  RefreshFlow,
  OAuthFlow,
  CorsFlow,
} from "./viz";

export default function AuthPage() {
  return (
    <main className="page" data-ch="auth">
      <Hero
        ch="auth"
        title={{
          en: (
            <>
              Authentication and <span className="grad">security</span>
            </>
          ),
          zh: (
            <>
              认证与<span className="grad">安全</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A server has two separate questions to answer about every request:
              who sent it, and what is that caller allowed to do. This chapter
              works through four mechanisms that answer them, and then finishes
              the CORS explanation that chapters 01 and 02 left open.
            </>
          ),
          zh: (
            <>
              对每个请求,服务器要分开回答两个问题:是谁发来的,
              以及这个调用方能做什么。这一章走过回答它们的四种机制,
              最后把第 01、02 章欠下的 CORS 讲完。
            </>
          ),
        }}
        chips={[
          {
            id: "authn-authz",
            n: "01",
            label: { en: "Authn vs authz", zh: "认证 vs 授权" },
          },
          { id: "api-key", n: "02", label: { en: "API keys", zh: "API Key" } },
          { id: "basic", n: "03", label: { en: "Basic", zh: "Basic" } },
          { id: "jwt", n: "04", label: { en: "JWT", zh: "JWT" } },
          { id: "oauth", n: "05", label: { en: "OAuth 2.0", zh: "OAuth 2.0" } },
          { id: "cors", n: "06", label: { en: "CORS", zh: "CORS" } },
          {
            id: "checklist",
            n: "07",
            label: { en: "Checklist", zh: "安全清单" },
          },
          { id: "labs", n: "08", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "09", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <TrustLadder />
      </Hero>

      {/* ================= §01 认证 vs 授权 ================= */}
      <Section
        id="authn-authz"
        index="01"
        title={{
          en: "Authentication is not authorization",
          zh: "认证不等于授权",
        }}
        desc={{
          en: "The two words look alike and mean different things. Mixing them up makes everything after this section confusing.",
          zh: "两个词长得像,说的是两件事。分不清它们,后面全乱。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "Two questions at the door",
            zh: "门口的两个问题",
          }}
        >
          <p>
            <T
              en={
                <>
                  The first question is <b>who are you</b>. You show a badge and
                  the guard checks that it is yours. That is{" "}
                  <b>authentication</b>, often written <b>authn</b>: proving an
                  identity.
                </>
              }
              zh={
                <>
                  第一个问题是<b>「你是谁」</b>。你出示工牌,门卫核对它是不是你的。
                  这是<b>认证(authentication,常写作 authn)</b>:证明身份。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The second question is <b>what may you do</b>. You say you are
                  going to the server room, and the guard checks a list. Your
                  badge is genuine, and it still does not open that door. That is{" "}
                  <b>authorization</b>, often written <b>authz</b>: deciding
                  what an identity is permitted to do.
                </>
              }
              zh={
                <>
                  第二个问题是<b>「你能做什么」</b>。你说要去机房,
                  门卫查了名单:工牌是真的,但这扇门它开不了。
                  这是<b>授权(authorization,常写作 authz)</b>:
                  决定一个身份被允许做什么。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The order never changes: <b>authenticate first, authorize
                  second</b>. Until the server knows who is calling, there is
                  nothing to check permissions against.
                </>
              }
              zh={
                <>
                  顺序永远不变:<b>先认证,后授权</b>。
                  服务器不知道是谁在调用,也就无从查它的权限。
                </>
              }
            />
          </p>
        </Callout>

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">AUTHENTICATION</div>
            <div className="card-title">
              <T en="Who are you" zh="你是谁" /> <Status code={401} />
            </div>
            <p>
              <T
                en={
                  <>
                    Return 401 when the credential is missing, malformed,
                    expired, or wrong. HTTP requires a 401 response to carry a{" "}
                    <code>WWW-Authenticate</code> header naming the scheme the
                    client should use, for example{" "}
                    <code>WWW-Authenticate: Bearer</code>. The name of the status
                    code is &quot;Unauthorized&quot;, which is a historical
                    mistake — it is the unauthenticated case. Read it as &quot;I
                    do not know who you are&quot;.
                  </>
                }
                zh={
                  <>
                    凭证缺失、格式不对、过期或错误时,回 401。
                    HTTP 规定 401 响应必须带一个 <code>WWW-Authenticate</code>{" "}
                    头,说明客户端该用哪种认证方式,例如{" "}
                    <code>WWW-Authenticate: Bearer</code>。
                    这个状态码的名字叫 Unauthorized,是历史遗留的口误 ——
                    它表达的其实是「未认证」。就当它在说「我不知道你是谁」。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">AUTHORIZATION</div>
            <div className="card-title">
              <T en="What may you do" zh="你能做什么" /> <Status code={403} />
            </div>
            <p>
              <T
                en={
                  <>
                    Return 403 when the caller is authenticated and still not
                    permitted. Logging in again changes nothing; someone has to
                    grant the permission. An ordinary user trying to delete
                    another user&apos;s post gets a 403, not a 401.
                  </>
                }
                zh={
                  <>
                    调用方身份没问题、但这件事不许它做时,回 403。
                    重新登录一百次也没用,得由人去授予权限。
                    普通用户去删别人的帖子,吃到的是 403,不是 401。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §02 API Key ================= */}
      <Section
        id="api-key"
        index="02"
        title={{
          en: "API keys: the simplest credential",
          zh: "API Key:最简单的一种凭证",
        }}
        desc={{
          en: "One long string that identifies the caller. Enough for some jobs, and an incident when it is used for the wrong one.",
          zh: "一串字符,标识调用方是谁。用对场景够用,用错场景是事故。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                An <b>API key</b> is a random string the provider issues to you.
                You send it with every request, and the provider can tell which
                account is calling: enough to meter usage, apply rate limits, and
                block an abusive caller. Note what it identifies. A key
                identifies a <b>project or client application</b>, not a person.
                Whether ten people on your team or one script is behind that key,
                the provider cannot tell. If you need to know which user is
                acting, a key is the wrong tool.
              </>
            }
            zh={
              <>
                <b>API Key</b> 是服务商发给你的一串随机字符。
                每个请求都带上它,服务商就知道是哪个账号在调用 ——
                足够用来计量、限流和封禁。注意它标识的是什么:
                key 标识的是<b>一个项目或一个客户端程序</b>,不是一个人。
                key 背后是你团队的十个人还是一个脚本,服务商分不出来。
                需要知道「是哪个用户在操作」时,key 就是错的工具。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="http"
          title={{ en: "Send the key in a header", zh: "把 key 放在 Header 里" }}
          hl={[3]}
          code={`GET /v1/weather?city=berlin HTTP/1.1
Host: api.weather.example
X-API-Key: wk_live_9f8a7b6c5d4e

`}
          note={{
            en: (
              <>
                Do not put it in the query string (<code>?key=…</code>). URLs
                end up in server logs, browser history, and{" "}
                <code>Referer</code> headers, and a shared link then carries the
                key with it. Headers do not travel that way.
              </>
            ),
            zh: (
              <>
                别把它放进 query(<code>?key=…</code>)。URL
                会进服务器日志、浏览器历史和 <code>Referer</code> 头,
                转发一个链接就等于把 key 一起送出去。Header 不会这样流传。
              </>
            ),
          }}
        />

        <Callout
          tone="warn"
          title={{
            en: "Code that runs in a browser cannot keep a secret",
            zh: "跑在浏览器里的代码保不住秘密",
          }}
        >
          <p>
            <T
              en={
                <>
                  Putting a key in browser code publishes it. The user can read
                  the source, watch the request in the Network panel, and search
                  the bundle for strings. Minifying and obfuscating do not help,
                  because the request goes out with the key in plain text. HTTPS
                  does not help either: it protects the traffic from third
                  parties on the network, not from the person operating the
                  browser.
                </>
              }
              zh={
                <>
                  把 key 写进浏览器代码,等于把它公开发布。
                  用户可以看源码、在 Network 面板里看请求、在打包产物里搜字符串。
                  压缩和混淆都没用,因为请求发出去时 key 就是明文。
                  HTTPS 也没用:它防的是网络上的第三方,
                  防不了操作浏览器的这个人本身。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  There is one fix. Keep the key on <b>your own server</b> and
                  let it make the call.
                </>
              }
              zh={
                <>
                  解法只有一个:key 留在<b>你自己的服务器</b>上,由它去调用。
                </>
              }
            />
          </p>
        </Callout>

        <ProxyFlow />
      </Section>

      {/* ================= §03 Basic 认证 ================= */}
      <Section
        id="basic"
        index="03"
        title={{
          en: "Basic authentication: sending the password itself",
          zh: "Basic 认证:直接把密码报上去",
        }}
        desc={{
          en: "The oldest scheme built into HTTP, and the source of one very common misunderstanding.",
          zh: "HTTP 自带的最古老的认证方式,也是一个最常见误会的源头。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                <b>Basic authentication</b> puts{" "}
                <code>username:password</code> into the Authorization header,
                encoded with base64:
              </>
            }
            zh={
              <>
                <b>Basic 认证</b>把 <code>username:password</code> 用 base64
                编码后放进 Authorization 头:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="http"
          title={{ en: "The request", zh: "请求" }}
          hl={[2]}
          code={`GET /admin/posts HTTP/1.1
Authorization: Basic c3R1ZGVudDpzZWNyZXQxMjM=

`}
          note={{
            en: (
              <>
                That string looks unreadable. Use the bench below to find out
                whether it actually keeps anything private.
              </>
            ),
            zh: (
              <>
                那串字符看起来挺唬人。用下面的加工台亲手试试,
                它到底能不能保住秘密。
              </>
            ),
          }}
        />

        <Base64Lab />

        <Callout
          tone="warn"
          title={{
            en: "base64 is encoding, not encryption",
            zh: "base64 是编码,不是加密",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>Encoding</b> is a public, reversible way of rewriting data
                  so it survives transport. Anyone can undo it, and no key is
                  involved. <b>Encryption</b> needs a key to undo, and its
                  purpose is to keep the content from being read. base64 is the
                  first kind. Basic authentication therefore has{" "}
                  <b>no confidentiality of its own</b>: it relies entirely on
                  HTTPS. Over plain HTTP it sends the password to anyone
                  watching the connection.
                </>
              }
              zh={
                <>
                  <b>编码(encoding)</b>是一套公开、可逆的改写规则,
                  目的是让数据能安全地在管道里运输;谁都能还原它,不需要密钥。
                  <b>加密(encryption)</b>则需要密钥才能还原,
                  目的是不让别人读到内容。base64 属于前者。所以 Basic
                  认证<b>自身不提供任何保密性</b>,完全依赖 HTTPS;
                  跑在明文 HTTP 上,等于把密码交给线路上的任何人。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  It is not obsolete, though. Twilio still uses Basic today
                  (AccountSid and AuthToken over HTTPS). It is simple, stateless,
                  and supported by every tool.
                </>
              }
              zh={
                <>
                  但它并没有过时。Twilio 今天仍在用 Basic(AccountSid 和
                  AuthToken,跑在 HTTPS 上)。它简单、无状态,所有工具都支持。
                </>
              }
            />
          </p>
        </Callout>

        <CodeBlock
          lang="http"
          title={{
            en: "How the server asks for credentials",
            zh: "服务器怎么索要凭证",
          }}
          hl={[2]}
          code={`HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Staff area"

`}
          note={{
            en: (
              <>
                This is the 401 from section 01, with the header that belongs on
                it. The header names the scheme the client should use.{" "}
                <code>realm</code> is a label for the protected area, shown by
                the browser in its password prompt.
              </>
            ),
            zh: (
              <>
                这就是 §01 说的那个 401,配上它该带的头。
                这个头说明客户端该用哪种认证方式;
                <code>realm</code> 是受保护区域的名字,
                浏览器会把它显示在弹出的密码框里。
              </>
            ),
          }}
        />

        <Callout
          tone="idea"
          title={{
            en: "What the server compares the password against",
            zh: "服务器拿密码去比对什么",
          }}
        >
          <p>
            <T
              en={
                <>
                  Whatever scheme sends the password, the server must not store
                  it as text, and must not encrypt it either — anything
                  encrypted can be decrypted by whoever holds the key. Store a{" "}
                  <b>hash</b>: a one-way value computed from the password that
                  cannot be turned back into it. Use an algorithm designed for
                  passwords, which is deliberately slow and salts each password
                  with random bytes: <b>bcrypt</b>, <b>scrypt</b>, or{" "}
                  <b>Argon2</b>. A plain SHA-256 is the wrong choice here,
                  because it is fast, and fast is exactly what an attacker
                  guessing billions of passwords wants.
                </>
              }
              zh={
                <>
                  不管密码是怎么传过来的,服务器都不能把它按原文存下来,
                  也不该加密存储 —— 加密的东西,拿到密钥的人就能解回来。
                  要存<b>哈希</b>:由密码算出、无法反推回密码的单向值。
                  而且要用专为密码设计的算法 ——
                  它们故意很慢,并且给每个密码加一段随机盐:<b>bcrypt</b>、
                  <b>scrypt</b> 或 <b>Argon2</b>。单纯的 SHA-256
                  在这里是错的选择,因为它很快,
                  而「快」正是那个要暴力猜上十亿次的攻击者想要的。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 JWT ================= */}
      <Section
        id="jwt"
        index="04"
        title={{ en: "JWT, part by part", zh: "JWT 解剖台" }}
        desc={{
          en: "Three base64url parts separated by dots. Opened up, it is more readable than most people expect.",
          zh: "三段 base64url,用点号隔开。拆开看,它比多数人以为的要透明得多。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                After a successful login, how does the server recognize you on
                the next request? The traditional answer is a{" "}
                <b>session</b>: the server stores the login state and gives you
                an id that points at it. A{" "}
                <b>JWT (JSON Web Token)</b> turns that around. The claims about
                you are written into the token itself, the server signs it, and
                the server stores nothing. On each request it verifies the
                signature and reads the claims. That removes the shared session
                store, which is convenient when many servers handle the same
                user. It also gives something up. The callout below says what.
              </>
            }
            zh={
              <>
                登录成功之后,服务器靠什么在下一个请求里认出你?
                传统答案是<b>会话(session)</b>:服务器把登录状态存下来,
                发给你一个指向它的 id。<b>JWT(JSON Web Token)</b>
                反过来做:把关于你的声明直接写进令牌,由服务器签名,
                服务器自己什么都不存。每次请求验一下签名、读一下声明就行。
                这样就不再需要一个共享的会话存储,
                多台服务器共同服务同一个用户时很方便。
                它也放弃了一些东西,下面的提示框会讲清楚是什么。
              </>
            }
          />
        </p>

        <JwtDecoder />

        <CodeBlock
          lang="http"
          title={{ en: "Sending a token", zh: "带着令牌发请求" }}
          hl={[2]}
          code={`GET /me/drafts HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiJ9.kXbG…

`}
          note={{
            en: (
              <>
                <b>Bearer</b> means the holder. Whoever presents this token is
                treated as the user, with no further proof required. That is
                what makes it convenient, and it is also why the token must
                travel over HTTPS and be stored carefully.
              </>
            ),
            zh: (
              <>
                <b>Bearer</b> 的意思是「持有者」:谁出示这枚令牌,
                谁就被当成那个用户,不需要再证明别的。
                这既是它方便的原因,也是它必须走 HTTPS、
                必须小心存放的原因。
              </>
            ),
          }}
        />

        <Callout
          tone="warn"
          title={{
            en: "The real trade-off: a stateless token cannot be taken back",
            zh: "真正的取舍:发出去的无状态令牌收不回来",
          }}
        >
          <p>
            <T
              en={
                <>
                  A session lives on the server, so the server can delete it. The
                  next request with that session id fails immediately. A signed
                  JWT is checked by recomputing the signature, not by looking
                  anything up, so there is nothing to delete. Until{" "}
                  <code>exp</code> passes, every server
                  holding the key will accept it. If a user logs out, changes
                  their password, or has their token stolen, the token is still
                  valid.
                </>
              }
              zh={
                <>
                  会话存在服务器上,所以服务器可以删掉它:
                  下一个带着这个会话 id 的请求立刻就失败。
                  而签名的 JWT 是靠重算一遍签名来验证的,不查任何表,
                  也就没有可删的东西。
                  在 <code>exp</code> 到点之前,
                  每一台持有密钥的服务器都会接受它 ——
                  哪怕用户已经登出、改了密码,或者令牌已经被人偷走。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  So JWT is not simply &quot;better than sessions&quot;. It
                  trades revocation for not having to store state. The usual way
                  to buy some of that back is two tokens: a short-lived access
                  token, plus a refresh token that the server does store and can
                  revoke. Some systems also keep a deny list of token ids — which
                  is server-side state again, and that is the point.
                </>
              }
              zh={
                <>
                  所以 JWT 并不是简单地「比 session 更好」,
                  它是用「可撤销」换来了「不用存状态」。
                  想把撤销能力买回来一部分,通常的做法是发两枚令牌:
                  一枚短命的 access token,加一枚服务器存着、
                  可以随时作废的 refresh token。
                  有些系统还会维护一份被禁令牌 id 的名单 ——
                  那又是服务端状态了,这恰恰说明了问题所在。
                </>
              }
            />
          </p>
        </Callout>

        <RefreshFlow />

        <Callout
          tone="idea"
          title={{
            en: "Where a browser should keep the token",
            zh: "浏览器该把令牌放在哪",
          }}
        >
          <p>
            <T
              en={
                <>
                  There is no storage option that is simply safe. In{" "}
                  <code>localStorage</code>, the token is readable by any script
                  running on the page, so a single cross-site scripting (XSS)
                  bug — in your code or in a dependency — lets an attacker read
                  it and send it away. In a cookie marked{" "}
                  <code>HttpOnly</code>, script cannot read it, which removes
                  that path. But the browser then attaches the cookie to
                  requests automatically, including requests started by another
                  site, so you need cross-site request forgery (CSRF)
                  protection: <code>SameSite=Lax</code> or{" "}
                  <code>Strict</code>, or a separate anti-CSRF token.
                </>
              }
              zh={
                <>
                  没有哪种存法是「安全」的,只有取舍。放在{" "}
                  <code>localStorage</code> 里,页面上任何脚本都能读到它,
                  所以只要出现一个 XSS(跨站脚本)漏洞 ——
                  你自己的代码里的,或者某个依赖里的 ——
                  攻击者就能读走并发送它。
                  放在带 <code>HttpOnly</code> 标记的 Cookie 里,
                  脚本读不到,这条路就堵上了;
                  但浏览器会自动把这个 Cookie 附在请求上,
                  包括由别的站点发起的请求,
                  所以你必须防 CSRF(跨站请求伪造):用{" "}
                  <code>SameSite=Lax</code> 或 <code>Strict</code>,
                  或者另发一个防 CSRF 的令牌。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Pick one and handle its weakness on purpose. Saying &quot;we
                  use cookies, so we are secure&quot; is how the second problem
                  gets forgotten.
                </>
              }
              zh={
                <>
                  选定一种,然后有意识地补上它的短板。
                  「我们用 Cookie,所以是安全的」这种说法,
                  恰恰是第二类问题被漏掉的原因。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 OAuth 2.0 ================= */}
      <Section
        id="oauth"
        index="05"
        title={{
          en: "OAuth 2.0: giving access without giving the password",
          zh: "OAuth 2.0:不交密码,也能把访问权给出去",
        }}
        desc={{
          en: "A framework for delegating access to your data. Read the name carefully: it is about authorization.",
          zh: "一套把「访问你的数据」这件事授权出去的框架。名字要读准:它管的是授权。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                The problem: another application wants to read data that belongs
                to you and is held by a service you already use — your photos,
                your calendar, your repositories. You must not hand it your
                password for that service, because a password grants everything,
                forever. OAuth 2.0 answers this by adding a party that issues
                limited, expiring tokens. Four roles first:
              </>
            }
            zh={
              <>
                问题是这样的:另一个应用想读取属于你的数据,
                而这些数据存在你已经在用的服务里 —— 照片、日历、代码仓库。
                你不能把那个服务的密码交给它,因为密码给出的是全部权限,
                而且是永久的。OAuth 2.0 的解法是引入一个专门签发
                「受限、会过期」令牌的角色。先认四个角色:
              </>
            }
          />
        </p>

        <div className="grid-4">
          <div className="card">
            <div className="card-kicker">RESOURCE OWNER</div>
            <div className="card-title">
              <T en="Resource owner" zh="资源所有者" />
            </div>
            <p>
              <T
                en="You. The data is yours, so granting access is your decision."
                zh="你。数据是你的,给不给别人访问,由你决定。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">CLIENT</div>
            <div className="card-title">
              <T en="Client" zh="客户端" />
            </div>
            <p>
              <T
                en="The application that wants access. It is a guest here, not the owner."
                zh="想要访问权限的那个应用。它在这里是客人,不是主人。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">AUTHORIZATION SERVER</div>
            <div className="card-title">
              <T en="Authorization server" zh="授权服务器" />
            </div>
            <p>
              <T
                en="Checks your password, asks for your consent, and issues tokens."
                zh="验你的密码、征求你的同意、签发令牌。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">RESOURCE SERVER</div>
            <div className="card-title">
              <T en="Resource server" zh="资源服务器" />
            </div>
            <p>
              <T
                en="Holds the data. It accepts a token and serves only what that token allows."
                zh="守着数据。它接受令牌,并且只提供该令牌允许的那部分。"
              />
            </p>
          </div>
        </div>

        <OAuthFlow />

        <Callout
          tone="warn"
          title={{
            en: "OAuth 2.0 is not a login protocol",
            zh: "OAuth 2.0 不是登录协议",
          }}
        >
          <p>
            <T
              en={
                <>
                  This is the most common mistake made about OAuth. An access
                  token is an answer to <b>what may the bearer do</b>. It is not
                  an answer to <b>who is this user</b>. Nothing in OAuth 2.0
                  requires the token to identify anybody, and a resource server
                  that treats &quot;this token works&quot; as proof of identity
                  can be fooled by a token that was issued to a different
                  application.
                </>
              }
              zh={
                <>
                  这是关于 OAuth 最常见的误解。access token
                  回答的是<b>「持有者可以做什么」</b>,
                  不是<b>「这个用户是谁」</b>。OAuth 2.0
                  里没有任何东西要求令牌标识某个人;
                  如果资源服务器把「这枚令牌能用」当成身份证明,
                  那么一枚发给别的应用的令牌就可能骗过它。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The identity layer built on top of OAuth 2.0 is{" "}
                  <b>OpenID Connect (OIDC)</b>. It adds a second token, the{" "}
                  <b>ID token</b>, which is a JWT the client is meant to
                  validate, containing who the user is, who issued the claim,
                  which client it was issued for, and when it was issued. When a
                  site offers &quot;sign in with Google&quot;, that is OIDC. The
                  underlying exchange is the same one you stepped through above.
                </>
              }
              zh={
                <>
                  建在 OAuth 2.0 之上的身份层叫{" "}
                  <b>OpenID Connect(OIDC)</b>。它多发一枚令牌 ——
                  <b>ID token</b>,一枚要求客户端去校验的 JWT ——
                  里面写着用户是谁、这个声明是谁签发的、
                  签发给哪个客户端、什么时候签发的。
                  网站上的「用 Google 账号登录」,用的就是 OIDC;
                  底层跑的还是你刚才逐帧看过的那套流程。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="deep"
          title={{
            en: "Which flow to use, as of today",
            zh: "今天该用哪种流程",
          }}
        >
          <p>
            <T
              en={
                <>
                  Use <b>Authorization Code with PKCE</b>. PKCE (pronounced
                  &quot;pixy&quot;) is the step you saw: the client generates a
                  random secret, sends its hash when starting the flow, and
                  sends the secret itself when exchanging the code. An
                  authorization code that is intercepted is then useless on its
                  own. PKCE was introduced for clients that cannot keep a
                  secret, such as mobile and browser applications, but the
                  current recommendation is to use it for{" "}
                  <b>every client, including ones that do have a client
                  secret</b>.
                </>
              }
              zh={
                <>
                  用<b>授权码流程 + PKCE</b>。PKCE(读作 pixy)
                  就是你刚才看到的那一步:客户端生成一个随机的秘密值,
                  发起流程时先发它的哈希,换令牌时再发秘密值本身。
                  这样一来,半路被截走的授权码单独没有用。PKCE
                  最初是为「保不住密钥」的客户端设计的,
                  比如移动应用和纯浏览器应用;
                  但现在的建议是<b>所有客户端都用,
                  包括那些确实有 client secret 的</b>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Two older options are no longer options. The{" "}
                  <b>implicit flow</b>, which returned the token directly in the
                  redirect URL, is deprecated: URLs leak into history, logs, and
                  referrers. The <b>resource owner password credentials</b>{" "}
                  grant, where the application collects the user&apos;s password
                  itself, is also deprecated — it defeats the reason OAuth
                  exists. If a tutorial presents either one as a normal choice,
                  it is out of date.
                </>
              }
              zh={
                <>
                  有两种老做法已经不再是选项。<b>隐式流程(implicit)</b>
                  ——直接在重定向 URL 里返回令牌——已被废弃:
                  URL 会流进历史记录、日志和 Referer。
                  <b>密码模式(resource owner password credentials)</b>
                  ——由应用自己去收集用户密码——同样已被废弃,
                  它把 OAuth 存在的理由整个否定了。
                  如果哪份教程还把这两种当成正常选择,那它已经过时了。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 CORS ================= */}
      <Section
        id="cors"
        index="06"
        title={{
          en: "CORS: a rule the browser applies",
          zh: "CORS:一条由浏览器执行的规则",
        }}
        desc={{
          en: "The red console message from chapter 02, explained completely this time.",
          zh: "第 02 章那段红色报错,这次讲完整。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Browsers apply the <b>same-origin policy</b>: script loaded from
                one origin may not read a response from a different origin. An{" "}
                <b>origin</b> is the scheme, the host, and the port together — if
                any of the three differs, it is a different origin. The rule
                protects you as a user. Without it, a page you visit could use{" "}
                <b>the cookies your browser already holds</b> to read your mail
                from another site. <b>CORS (Cross-Origin Resource Sharing)</b>{" "}
                is how a server opts out of that restriction: it states, in
                response headers, which origins may read its responses. Here is
                the full exchange:
              </>
            }
            zh={
              <>
                浏览器执行一条<b>同源策略(same-origin policy)</b>:
                从一个源加载的脚本,不能读取另一个源的响应。
                这里的<b>源(origin)</b>是协议、主机、端口三者的组合 ——
                只要有一个不同,就是不同的源。这条规则保护的是你这个用户:
                没有它,你打开的某个页面就能利用
                <b>浏览器里已有的 Cookie</b> 去读你在别处的邮件。
                <b>CORS(跨源资源共享)</b>是服务器主动放宽这条限制的方式:
                它在响应头里声明,哪些源可以读它的响应。完整走一遍:
              </>
            }
          />
        </p>

        <CorsFlow />

        <div className="grid-3">
          <div className="card">
            <div className="card-title">
              <T
                en="A CORS error is not a broken API"
                zh="CORS 报错不等于 API 挂了"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    When a CORS error appears, the request has usually reached
                    the server and may already have been processed. The browser
                    withheld the response from your script. What needs changing
                    is the server&apos;s response headers, not your fetch call.
                  </>
                }
                zh={
                  <>
                    出现 CORS 报错时,请求通常已经到达服务器,
                    甚至已经被处理了,只是浏览器没把响应交给你的脚本。
                    该改的是服务器的响应头,不是你的 fetch。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T
                en="curl and Postman are not affected"
                zh="curl 和 Postman 不受影响"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    The rule is enforced by browsers. Command line tools and any
                    code running on a server ignore it. &quot;It works in
                    Postman but not in the page&quot; is the clearest sign that
                    you are looking at a CORS problem.
                  </>
                }
                zh={
                  <>
                    这条规则由浏览器执行。命令行工具、
                    以及任何跑在服务器上的代码都不看它。
                    「Postman 能通、网页不行」正是 CORS 问题最明显的信号。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T
                en="It does not protect your API"
                zh="它保护不了你的 API"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    CORS decides whether page script may read a cross-origin
                    response. It protects users from other web pages. It stops
                    no scraper and no attacker, because neither needs a browser.
                    Authentication and authorization on the server are still
                    required.
                  </>
                }
                zh={
                  <>
                    CORS 决定的是页面脚本能不能读跨源响应,
                    它保护用户不被别的网页利用。
                    它挡不住爬虫,也挡不住攻击者 —— 这两者都不需要浏览器。
                    服务端的认证和授权,一样都不能省。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="idea"
          title={{
            en: "Which requests are preflighted",
            zh: "哪些请求需要预检",
          }}
        >
          <p>
            <T
              en={
                <>
                  A <b>simple request</b> goes straight out, and the browser
                  only checks the response. It has to be{" "}
                  <Method m="GET" />, <Method m="HEAD" />, or{" "}
                  <Method m="POST" />, carry no headers beyond a small allowed
                  set, and if it has a body, its{" "}
                  <code>Content-Type</code> must be one of three form types.
                  Anything else is preflighted: an Authorization header,{" "}
                  <code>Content-Type: application/json</code>, a custom header
                  such as <code>X-API-Key</code>, or a method like{" "}
                  <Method m="PUT" /> or <Method m="DELETE" />. So most JSON
                  requests you write are preflighted with an{" "}
                  <Method m="OPTIONS" /> request first.
                </>
              }
              zh={
                <>
                  <b>简单请求</b>直接发出去,浏览器只在收到响应时把关。
                  它必须是 <Method m="GET" />、<Method m="HEAD" /> 或{" "}
                  <Method m="POST" />,不带那一小份允许清单之外的头;
                  如果有正文,<code>Content-Type</code> 必须是三种表单类型之一。
                  其余的一律要预检:带 Authorization 头、
                  <code>Content-Type: application/json</code>、
                  <code>X-API-Key</code> 这样的自定义头,
                  或者用了 <Method m="PUT" />、<Method m="DELETE" /> 之类的方法。
                  也就是说,你日常写的 JSON 请求,大多要先走一条{" "}
                  <Method m="OPTIONS" /> 预检。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Notice what the same-origin policy does and does not stop. It
                  stops your script from <b>reading</b> the response. It does not
                  stop a simple request from being <b>sent</b>, and the server
                  may act on it. That is why CSRF protection is a separate job
                  from CORS.
                </>
              }
              zh={
                <>
                  注意同源策略拦的是什么:它拦的是你的脚本<b>读取</b>响应,
                  并不拦一个简单请求<b>发出去</b>,服务器也可能照做不误。
                  所以防 CSRF 是一件独立于 CORS 的工作。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "Credentials change the rules",
            zh: "带上凭证,规则就变了",
          }}
        >
          <p>
            <T
              en={
                <>
                  If the request is made with <code>credentials: &quot;include&quot;</code>{" "}
                  so that cookies are sent, the server must answer with{" "}
                  <code>Access-Control-Allow-Credentials: true</code> and must
                  name the origin explicitly. The wildcard{" "}
                  <code>Access-Control-Allow-Origin: *</code> is{" "}
                  <b>rejected</b> in that case; the browser refuses the response
                  even though the header is present. The same applies to a
                  wildcard in <code>-Headers</code> and <code>-Methods</code>.
                  Echoing back whichever origin asked, to work around this, means
                  allowing every site — do not do it without a checked list.
                </>
              }
              zh={
                <>
                  如果请求用了 <code>credentials: &quot;include&quot;</code>、
                  会带上 Cookie,那么服务器必须回{" "}
                  <code>Access-Control-Allow-Credentials: true</code>,
                  并且必须明确写出那个源。此时通配符{" "}
                  <code>Access-Control-Allow-Origin: *</code> 会被
                  <b>拒绝</b> —— 头虽然在,浏览器照样不收这份响应。
                  <code>-Headers</code> 和 <code>-Methods</code>{" "}
                  里的通配符同理。为了绕过这条限制而「来什么源就回什么源」,
                  等于对所有站点开放 —— 没有一份核对过的名单,别这么做。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 安全清单 ================= */}
      <Section
        id="checklist"
        index="07"
        title={{ en: "A checklist before you ship", zh: "上线前的清单" }}
        desc={{
          en: "There is no single measure that makes an API secure. These eight habits prevent most of the common mistakes.",
          zh: "没有哪一条措施能让 API「变安全」。下面八个习惯,能挡掉大多数常见错误。",
        }}
      >
        <div className="au-checks">
          <div className="au-check">
            <span className="ico">🔒</span>
            <div>
              <b>
                <T en="HTTPS everywhere" zh="一律走 HTTPS" />
              </b>
              <p>
                <T
                  en="Over plain HTTP, every token, key, and password in the headers travels in the clear. A modern API should have no http:// form at all."
                  zh="走明文 HTTP 时,Header 里的令牌、key 和密码全是明文。现代 API 不该存在 http:// 这种形态。"
                />
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🙈</span>
            <div>
              <b>
                <T
                  en="Keys stay out of the frontend and out of git"
                  zh="密钥不进前端,也不进 git"
                />
              </b>
              <p>
                <T
                  en="Use environment variables or a secret manager. If a key is committed by accident, replace it — the scanners that search public repositories for keys are faster than you are."
                  zh="用环境变量或密钥管理服务。万一不小心提交了,立刻作废换新 —— 扫公开仓库找 key 的程序比你快。"
                />
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🤐</span>
            <div>
              <b>
                <T en="Error messages say little" zh="错误信息别多说" />
              </b>
              <p>
                <T
                  en="Stack traces, SQL, and internal paths describe your system to an attacker. Return the plain error format from chapter 04 and keep the detail in your own logs."
                  zh="堆栈、SQL 和内部路径,等于把你的系统画给攻击者看。对外返回第 04 章那种规整的错误格式,细节留在自己的日志里。"
                />
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🎯</span>
            <div>
              <b>
                <T en="Least privilege" zh="最小权限" />
              </b>
              <p>
                <T
                  en="Give a token the smallest scope that does the job, and the shortest lifetime that is workable. The scope decides how much a leak costs."
                  zh="令牌的 scope 够用就好,寿命能短就短。泄露时损失多大,由权限范围决定。"
                />
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">⏳</span>
            <div>
              <b>
                <T en="Credentials expire" zh="凭证要会过期" />
              </b>
              <p>
                <T
                  en="Short access token, revocable refresh token. A token that never expires is one you can never take back."
                  zh="短命的 access token,配一枚可以作废的 refresh token。永不过期的令牌,就是永远收不回来的令牌。"
                />
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🧾</span>
            <div>
              <b>
                <T
                  en="No sensitive data in a JWT payload"
                  zh="敏感数据不进 JWT payload"
                />
              </b>
              <p>
                <T
                  en="The payload is encoded, not encrypted. Anyone holding the token can read it. Put an id in, and look the rest up on the server."
                  zh="payload 是编码的,不是加密的,拿到令牌的人都能读。里面只放一个 id,其余的到服务器上查。"
                />
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🧮</span>
            <div>
              <b>
                <T
                  en="Pin the algorithm when verifying a token"
                  zh="验签时锁定算法"
                />
              </b>
              <p>
                <T
                  en="Verify against the algorithm you expect, never the one named in the token header. Configure your library to accept exactly one, and reject alg: none."
                  zh="按你预期的算法验签,绝不按令牌 header 里写的那个。给你的库配一个明确的算法白名单,并拒绝 alg: none。"
                />
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🧂</span>
            <div>
              <b>
                <T
                  en="Store passwords as a slow, salted hash"
                  zh="密码存成慢速加盐的哈希"
                />
              </b>
              <p>
                <T
                  en="bcrypt, scrypt, or Argon2. Not plain text, not encryption, and not a bare SHA-256, which is far too fast to slow an attacker down."
                  zh="用 bcrypt、scrypt 或 Argon2。不要明文,不要加密,也不要单纯的 SHA-256 —— 它太快了,拖不住攻击者。"
                />
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Three tasks: decode a base64 credential, take a JWT apart, and cause a CORS error on purpose.",
          zh: "三个任务:解一次 base64 凭证、拆一枚 JWT、故意制造一次 CORS 报错。",
        }}
      >
        <LabSet ch="auth" items={LABS} />
      </Section>

      {/* ================= §09 通关测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Nine questions on the distinctions this chapter depends on.",
          zh: "九道题,考的都是这一章赖以成立的那些区分。",
        }}
      >
        <Quiz ch="auth" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                Authentication asks who you are; authorization asks what you may
                do. 401 means the server does not know who you are, and it must
                name the scheme to use in <code>WWW-Authenticate</code>; 403
                means it knows and still refuses.
              </>
            ),
            zh: (
              <>
                认证问「你是谁」,授权问「你能做什么」。401
                表示服务器不知道你是谁,并且必须用{" "}
                <code>WWW-Authenticate</code> 说明该用哪种认证方式;403
                表示它知道你是谁,但仍然拒绝。
              </>
            ),
          },
          {
            en: (
              <>
                Code running in a browser cannot keep a secret. An API key that
                reaches the page is public. Keep it on your own server and call
                the third party from there.
              </>
            ),
            zh: (
              <>
                跑在浏览器里的代码保不住秘密:API key 一旦进了页面就是公开的。
                把它留在你自己的服务器上,由服务器去调第三方。
              </>
            ),
          },
          {
            en: (
              <>
                base64 is encoding, not encryption. Anyone can reverse it, so
                Basic authentication is private only because HTTPS carries it.
              </>
            ),
            zh: (
              <>
                base64 是编码,不是加密,谁都能还原。所以 Basic
                认证之所以还能保密,靠的是外面那层 HTTPS。
              </>
            ),
          },
          {
            en: (
              <>
                A JWT is <b>signed, not encrypted</b>. The payload is readable by
                anyone holding the token. The signature proves the token came
                from a holder of the key and was not altered — and the server
                must check it against the algorithm it expects, not the one in
                the header.
              </>
            ),
            zh: (
              <>
                JWT 是<b>签名的,不是加密的</b>:
                payload 谁拿到令牌谁都能读。
                签名证明的是「由持有密钥的一方签发、之后没被改过」;
                而且服务器必须按自己预期的算法验签,
                不能按 header 里写的那个。
              </>
            ),
          },
          {
            en: (
              <>
                A session can be deleted; a signed token stays valid until it
                expires. That is the trade-off. Pay for it with a short access
                token plus a refresh token the server can revoke.
              </>
            ),
            zh: (
              <>
                会话可以删掉,而签名令牌在过期之前一直有效 ——
                这就是那笔取舍。补的办法是:短命的 access token,
                加一枚服务器可以作废的 refresh token。
              </>
            ),
          },
          {
            en: (
              <>
                OAuth 2.0 delegates <b>access</b>, not identity. An access token
                says what the bearer may do. OpenID Connect adds the ID token
                that says who the user is. Use Authorization Code with PKCE;
                implicit is deprecated.
              </>
            ),
            zh: (
              <>
                OAuth 2.0 授出去的是<b>访问权限</b>,不是身份:access token
                说的是持有者能做什么。说明用户是谁的是 OpenID Connect 的 ID
                token。流程用授权码 + PKCE,隐式流程已被废弃。
              </>
            ),
          },
          {
            en: (
              <>
                CORS is a browser rule, not a server-side security boundary. It
                decides
                whether page script may read a cross-origin response. curl
                ignores it, non-simple requests are preflighted with{" "}
                <Method m="OPTIONS" />, and{" "}
                <code>Access-Control-Allow-Origin: *</code> cannot be used with
                credentials.
              </>
            ),
            zh: (
              <>
                CORS 是浏览器的规则,不是服务端的防线 ——
                它决定的是页面脚本能不能读跨源响应。curl 不受它管;
                非简单请求要先走 <Method m="OPTIONS" /> 预检;
                <code>Access-Control-Allow-Origin: *</code> 不能和凭证一起用。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="auth" />
    </main>
  );
}
