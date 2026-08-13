"use client";

// 06 · 认证与安全 —— 信任的阶梯:
// 认证 vs 授权 → API Key → Basic → JWT → OAuth → CORS → 安全清单 →
// 动手任务 → 测验 → 要点。

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
        title={
          <>
            认证与<span className="grad">安全</span>
          </>
        }
        essence={
          <>
            小区门禁卡刷不开银行金库 —— 凭证是有分量的。这一章从最轻的 API
            Key 一路爬到 OAuth,顺手把第 02 章欠你的 CORS 之谜也一并揭晓。
          </>
        }
        chips={[
          { id: "authn-authz", n: "01", label: "认证 vs 授权" },
          { id: "api-key", n: "02", label: "API Key" },
          { id: "basic", n: "03", label: "Basic" },
          { id: "jwt", n: "04", label: "JWT" },
          { id: "oauth", n: "05", label: "OAuth 2.0" },
          { id: "cors", n: "06", label: "CORS" },
          { id: "checklist", n: "07", label: "安全清单" },
          { id: "labs", n: "08", label: "动手" },
          { id: "quiz", n: "09", label: "测验" },
        ]}
      >
        <TrustLadder />
      </Hero>

      {/* ================= §01 认证 vs 授权 ================= */}
      <Section
        id="authn-authz"
        index="01"
        title="认证 vs 授权:保安的两连问"
        desc="两个词长得像,干的完全是两件事 —— 分不清它们,后面全乱。"
      >
        <Callout tone="story" title="写字楼门口的保安">
          <p>
            第一问:「你是谁?」—— 你亮出工牌,保安核对照片。这是
            <b>认证(authentication)</b>,验明正身。
          </p>
          <p>
            第二问:「你要去哪?」—— 你说去机房,保安查了下名单:
            「你的工牌进不了机房。」这是<b>授权(authorization)</b>
            ,查你能干嘛。
          </p>
          <p>
            注意顺序:<b>先认证,后授权</b> ——
            不知道你是谁,谈何查你的权限。
          </p>
        </Callout>

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">AUTHENTICATION</div>
            <div className="card-title">
              认证 · 你是谁 <Status code={401} />
            </div>
            <p>
              出问题时回 401:没带凭证、带错了、过期了。潜台词是
              「去重新登录/换个凭证,还有救」。顺带一句老梗:401 明明写着
              Unauthorized,干的却是 Unauthenticated 的活 ——
              历史遗留,背下来就好。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">AUTHORIZATION</div>
            <div className="card-title">
              授权 · 你能干嘛 <Status code={403} />
            </div>
            <p>
              出问题时回 403:我认识你,但这事你不能干。潜台词是
              「登一百次也没用,找管理员开权限去」。普通用户删管理员的帖子,
              吃的就是它。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §02 API Key ================= */}
      <Section
        id="api-key"
        index="02"
        title="API Key:最简单的一把钥匙"
        desc="一串字符,认卡不认人 —— 够用的时候很香,用错地方是事故。"
      >
        <p className="sec-desc">
          <b>API Key</b> 是信任阶梯的第一级:服务商发你一串随机字符,
          请求时带上,它就知道「是这个账号在调用」——
          方便计费、限流、封禁。注意它<b>只认 key 不认人</b>:
          key 背后是你团队十个人还是一个爬虫,服务商不知道也不关心。
        </p>

        <CodeBlock
          lang="http"
          title="API Key 的正确姿势:放 Header"
          hl={[3]}
          code={`GET /v1/weather?city=hangzhou HTTP/1.1
Host: api.weather.example
X-API-Key: wk_live_9f8a7b6c5d4e

`}
          note={
            <>
              别放 query(<code>?key=…</code>):URL
              会进服务器日志、浏览器历史,转发个链接就把 key 送人了。
              Header 不会出现在这些地方。
            </>
          }
        />

        <Callout tone="warn" title="致命规矩:前端藏不住任何秘密">
          <p>
            把 key 写进浏览器代码 = 公开发行。F12 看源码、Network
            面板看请求、打包产物里搜字符串 —— 条条大路通你的 key。
            混淆没用(请求发出去时是原文),HTTPS 也没用
            (它防路上的窃听者,防不了终点的用户本人)。
          </p>
          <p>
            正解只有一个:key 留在<b>自己的后端</b>,让它代为调用 ——
          </p>
        </Callout>

        <ProxyFlow />
      </Section>

      {/* ================= §03 Basic 认证 ================= */}
      <Section
        id="basic"
        index="03"
        title="Basic 认证:把「用户名:密码」直接报上去"
        desc="HTTP 自带的最古老认证方式 —— 顺便破除一个流传最广的误会。"
      >
        <p className="sec-desc">
          <b>Basic 认证</b>把 <code>用户名:密码</code> 用 base64
          编码后塞进 Authorization 头:
        </p>

        <CodeBlock
          lang="http"
          title="Basic 认证的请求"
          hl={[2]}
          code={`GET /admin/posts HTTP/1.1
Authorization: Basic c3R1ZGVudDpzZWNyZXQxMjM=

`}
          note={
            <>
              那串「乱码」看起来挺唬人 —— 用下面的加工台亲手试试,
              它到底能不能保守秘密。
            </>
          }
        />

        <Base64Lab />

        <Callout tone="warn" title="base64 是编码,不是加密">
          <p>
            <b>编码(encoding)</b>是公开的变形规则,人人可逆,
            目的是「能在管道里安全运输」;<b>加密(encryption)</b>
            需要密钥才能还原,目的是「不让别人看」。base64 属于前者 ——
            所以 Basic 认证的安全性<b>全靠 HTTPS 兜底</b>,
            明文 HTTP 下用 Basic,等于把密码写在明信片上寄。
          </p>
          <p>
            别急着嘲笑它老:Twilio 到今天还在用 Basic(AccountSid:AuthToken
            配 HTTPS)—— 简单、无状态、工具全支持,场景对了就不丢人。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 JWT ================= */}
      <Section
        id="jwt"
        index="04"
        title="JWT 解剖台:一枚自带防伪的工牌"
        desc="三段 base64,一个点号隔一段 —— 拆开看,它比你想的诚实,也比你想的暴露。"
      >
        <p className="sec-desc">
          登录成功后,服务器怎么在后续请求里认出你?传统做法是服务器开一间
          「会话储物柜」(session),发你号码牌。<b>JWT(JSON Web
          Token)</b>反过来:把身份信息直接写在一枚<b>带签名的工牌</b>上发给你,
          服务器<b>什么都不用存</b>,每次验一下签名就知道工牌是不是真的 ——
          这叫<b>无状态会话</b>,和 REST 的 Stateless 约束一拍即合。
        </p>

        <JwtDecoder />

        <CodeBlock
          lang="http"
          title="带着 JWT 干活:Bearer 方案"
          hl={[2]}
          code={`GET /me/drafts HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiJ9.kXbG…

`}
          note={
            <>
              Bearer 直译「持有者」:谁拿着(bear)这枚 token,谁就是主人
              —— 所以泄露即失守,HTTPS 依旧是前提。
            </>
          }
        />

        <Callout tone="warn" title="无状态的代价:发出去的工牌收不回">
          <p>
            服务器不存会话,也就<b>没法单独注销某一枚 token</b> ——
            在过期之前,它一直有效。业界的标配解法是两枚一组:
            access token 故意短命,refresh token 深藏换发:
          </p>
        </Callout>

        <RefreshFlow />
      </Section>

      {/* ================= §05 OAuth 2.0 ================= */}
      <Section
        id="oauth"
        index="05"
        title="OAuth 2.0:「用微信登录」的幕后"
        desc="序章 §03 埋的那颗种子,在这里开花:不交密码,只发受限的临时通行证。"
      >
        <p className="sec-desc">
          核心问题:第三方应用想访问你在微信里的数据(头像、昵称),
          但你<b>绝不能把微信密码告诉它</b>。OAuth 2.0
          的答案是引入一个发钥匙的中间人。先记住四个角色:
        </p>

        <div className="grid-4">
          <div className="card">
            <div className="card-kicker">RESOURCE OWNER</div>
            <div className="card-title">资源所有者</div>
            <p>你。头像是你的,给不给别人看,你说了算。</p>
          </div>
          <div className="card">
            <div className="card-kicker">CLIENT</div>
            <div className="card-title">客户端</div>
            <p>想借数据的第三方应用。它是「客」,不是主人。</p>
          </div>
          <div className="card">
            <div className="card-kicker">AUTHORIZATION SERVER</div>
            <div className="card-title">授权服务器</div>
            <p>发钥匙的:验你的密码、征你的同意、签发 token。</p>
          </div>
          <div className="card">
            <div className="card-kicker">RESOURCE SERVER</div>
            <div className="card-title">资源服务器</div>
            <p>守数据的:见 token 放行,只开 token 允许的门。</p>
          </div>
        </div>

        <OAuthFlow />

        <Callout tone="deep" title="PKCE 一句话,和 2026 年的现状">
          <p>
            <b>PKCE</b>(读 pixy):发起授权时先交一个「暗号的哈希」,
            换 token 时再对暗号 —— 就算授权码半路被截,截走的人没有暗号,
            也换不到 token。移动端和纯前端应用没地方藏
            client_secret,全靠它。
          </p>
          <p>
            现状:OAuth 2.1(仍是草案)已经把方向钉死 —— Implicit
            流程和密码模式<b>正式淘汰</b>,所有客户端强制
            PKCE。今天的标准答案就六个字:<b>授权码 + PKCE</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 CORS ================= */}
      <Section
        id="cors"
        index="06"
        title="CORS 讲透:浏览器保安的规矩"
        desc="第 02 章那个莫名其妙的红色报错,今天连本带利讲清楚。"
      >
        <p className="sec-desc">
          浏览器有条祖训叫<b>同源策略</b>:A 网站的 JS,默认不许读 B
          网站的响应。「同源」= 协议 + 域名 + 端口<b>三者全同</b>
          ,差一个都算跨域。这是为了保护你 —— 不然你逛着恶意网站,
          它的 JS 就能悄悄用<b>你的登录态</b>去读你的邮箱。
          <b>CORS(跨域资源共享)</b>是这条祖训的「开闸机制」:
          服务器明确表态欢迎谁,浏览器才放行。走一遍最完整的剧本:
        </p>

        <CorsFlow />

        <div className="grid-3">
          <div className="card">
            <div className="card-title">报错 ≠ API 挂了</div>
            <p>
              CORS 报错时,请求往往已经到了服务器、甚至被处理了 ——
              只是响应被浏览器扣下不给 JS。该修的是服务器的响应头,
              不是你的 fetch。
            </p>
          </div>
          <div className="card">
            <div className="card-title">curl / Postman 不受管</div>
            <p>
              保安只住在浏览器里。命令行和调试工具直连畅通 ——
              所以「Postman 能通、网页不行」恰恰是 CORS 的铁证。
            </p>
          </div>
          <div className="card">
            <div className="card-title">它不是安全防线</div>
            <p>
              CORS 保护的是用户,防的是别的网站冒用浏览器身份。
              挡爬虫、挡攻击者?人家根本不用浏览器。
              服务端的认证授权一样都不能省。
            </p>
          </div>
        </div>

        <Callout tone="idea" title="什么样的请求要预检?">
          <p>
            <b>简单请求</b>(GET/HEAD/POST + 常规头 + 表单类
            Content-Type)直接发,浏览器只在响应时把关;一旦带上
            Authorization 头、<code>Content-Type: application/json</code>
            ,或用了 <Method m="PUT" />/<Method m="DELETE" />
            ,就得先过 <Method m="OPTIONS" /> 预检。是的 ——
            你以后每天写的 JSON 请求,几乎全都要预检,习惯就好。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 安全清单 ================= */}
      <Section
        id="checklist"
        index="07"
        title="安全清单:上线前的六连勾"
        desc="没有银弹,只有习惯。这六条养成肌肉记忆,能躲开九成低级事故。"
      >
        <div className="au-checks">
          <div className="au-check">
            <span className="ico">🔒</span>
            <div>
              <b>一律 HTTPS</b>
              <p>
                明文 HTTP 下,Header 里的 token、key
                全是明文传输。现代 API 只该有 https:// 一种形态。
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🙈</span>
            <div>
              <b>密钥不进前端,不进 git</b>
              <p>
                用环境变量或密钥管理服务;不小心提交了就立刻作废换新
                (轮换),别抱侥幸 —— 扫仓库找 key 的爬虫比你勤快。
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🤐</span>
            <div>
              <b>错误信息别多嘴</b>
              <p>
                堆栈、SQL、内部路径,都是给攻击者画的地图。对外只说
                RFC 9457 那种体面的错误,细节留给自己的日志。
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🎯</span>
            <div>
              <b>最小权限</b>
              <p>
                token 的 scope 能小则小:只读就别给写,
                两小时够用就别发三十天。泄露时的损失由权限大小决定。
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">⏳</span>
            <div>
              <b>凭证要会过期</b>
              <p>
                短命 access + refresh 换发;长生不老的 token
                是埋在系统里的定时炸弹。
              </p>
            </div>
          </div>
          <div className="au-check">
            <span className="ico">🧾</span>
            <div>
              <b>敏感数据不进 JWT payload</b>
              <p>
                它只是编码,谁解谁看。手机号、余额、身份证号 ——
                一律只放 id,数据留在服务器里按需查。
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title="动手任务"
        desc="三个任务:解一次 base64、剖一枚 JWT、亲手撞一次 CORS 墙。"
      >
        <LabSet ch="auth" items={LABS} />
      </Section>

      {/* ================= §09 通关测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title="通关测验"
        desc="八道题,验一验你的信任阶梯爬到了哪一级。"
      >
        <Quiz ch="auth" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            认证问「你是谁」,授权问「你能干嘛」—— 401 是前者出事,
            403 是后者说不,顺序永远认证在前。
          </>,
          <>
            前端藏不住任何秘密:API key 进了浏览器就等于公开。
            要藏,藏在自己的后端代理里。
          </>,
          <>
            base64 是编码不是加密,谁都能解 —— Basic
            认证的安全全靠 HTTPS 兜底。
          </>,
          <>
            JWT 三段式:payload 明文可读(敏感数据别进去),
            签名只防篡改;无状态的代价用「短命 access + refresh 换发」来付。
          </>,
          <>
            OAuth 的精髓:密码只交给授权服务器,第三方拿到的是受限、
            会过期的 token;当代标准答案是「授权码 + PKCE」。
          </>,
          <>
            CORS 是浏览器的规矩:报错 ≠ API 挂了;curl/Postman 不受管;
            它保护用户,不是你的安全防线。
          </>,
        ]}
      />

      <ChapterFooter ch="auth" />
    </main>
  );
}
