"use client";

// 第 06 章 · 认证与安全 专属可视化(双语,英文默认):
//  - TrustLadder:hero 里的四级机制图(纯 CSS 进场)。
//  - ProxyFlow:后端代理模式静态流程图(key 永远不下发)。
//  - Base64Lab:btoa/atob 互动 —— 亲眼看到「编码谁都能解」。
//  - JwtDecoder:三段式 JWT 解剖台,点每段看解码结果。
//  - RefreshFlow:短命 access + 可撤销 refresh 四步简图(静态)。
//  - OAuthFlow:授权码 + PKCE 流程逐帧动画(7 帧)。
//  - CorsFlow:CORS 预检对话逐帧动画(7 帧)。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { Fragment, useState, type ReactNode } from "react";
import { FlowStepper, type FlowFrame } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= TrustLadder ================= */

interface Rung {
  ico: string;
  name: string;
  sub: Loc<string>;
}

const RUNGS: Rung[] = [
  {
    ico: "🪪",
    name: "API Key",
    sub: {
      en: "Identifies a project, not a person",
      zh: "认的是项目,不是人",
    },
  },
  {
    ico: "📛",
    name: "Basic",
    sub: {
      en: "Username and password, every request",
      zh: "每个请求都带用户名和密码",
    },
  },
  {
    ico: "🎫",
    name: "JWT",
    sub: {
      en: "A signed token the server need not store",
      zh: "带签名的令牌,服务器不用存也能验",
    },
  },
  {
    ico: "🛂",
    name: "OAuth 2.0",
    sub: {
      en: "Access granted without sharing a password",
      zh: "把访问权限授出去,密码不外传",
    },
  },
];

export function TrustLadder() {
  const L = useL();
  return (
    <div className="au-ladder" aria-hidden>
      {RUNGS.map((r, i) => (
        <div
          key={r.name}
          className="au-rung"
          style={{ animationDelay: `${150 + i * 160}ms` }}
        >
          <span className="ico">{r.ico}</span>
          <b>{r.name}</b>
          <small>{L(r.sub)}</small>
        </div>
      ))}
    </div>
  );
}

/* ================= ProxyFlow(静态) ================= */

export function ProxyFlow() {
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="The fix: your own backend calls the third party"
          zh="正解:由你自己的后端去调第三方"
        />
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="flow au-proxy">
            <div className="flow-node">
              <span className="ico">🖥️</span>
              <T en="Browser" zh="浏览器" />
              <small className="au-node-sub">
                <T en="🚫 has no key" zh="🚫 手里没有 key" />
              </small>
            </div>
            <div className="flow-mid au-proxy-mid">
              <div className="flow-line" />
              <span className="flow-packet">GET /api/weather</span>
            </div>
            <div className="flow-node lit">
              <span className="ico">🏠</span>
              <T en="Your backend" zh="你自己的后端" />
              <small className="au-node-sub">
                <T en="🔑 key in an env var" zh="🔑 key 存在环境变量里" />
              </small>
            </div>
            <div className="flow-mid au-proxy-mid">
              <div className="flow-line" />
              <span className="flow-packet">X-API-Key: wk_live_9f8a…</span>
            </div>
            <div className="flow-node">
              <span className="ico">🌐</span>
              <T en="Third-party API" zh="第三方 API" />
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg">
        <T
          en={
            <>
              The browser only talks to <b>your</b> server. Your server holds
              the key and presents it. The key never reaches the page, so it
              never appears in the Network panel. The same hop is also where you
              can add caching and rate limiting.
            </>
          }
          zh={
            <>
              浏览器只跟<b>你自己的</b>服务器说话,真正的 key
              由你的服务器出示。key 不进页面,也就不会出现在 Network
              面板里。顺带一提,缓存和限流也可以加在这一跳上。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= Base64Lab ================= */

export function Base64Lab() {
  const [raw, setRaw] = useState("student:secret123");
  const [revealed, setRevealed] = useState(false);

  let encoded = "";
  let err = false;
  try {
    encoded = typeof btoa !== "undefined" ? btoa(raw) : "";
  } catch {
    err = true;
  }

  return (
    <div className="viz au-b64">
      <div className="viz-title">
        <T
          en="Base64 bench: type it, encode it, decode it back"
          zh="Base64 加工台:输入 → 编码 → 一键解回来"
        />
      </div>
      <label className="au-b64-label" htmlFor="au-b64-in">
        <T
          en="Pretend this is your username and password:"
          zh="假装这是你的「用户名:密码」:"
        />
      </label>
      <input
        id="au-b64-in"
        className="au-input"
        value={raw}
        maxLength={48}
        onChange={(e) => {
          setRaw(e.target.value);
          setRevealed(false);
        }}
      />
      {err ? (
        <div className="viz-msg">
          <T
            en={
              <>
                ⚠️ btoa only accepts Latin-1 characters. Try letters and digits.
                Real clients encode the text as UTF-8 first.
              </>
            }
            zh={
              <>
                ⚠️ btoa 只吃 Latin-1 字符,换成英文字母和数字试试。
                真实客户端会先把文本转成 UTF-8 再编码。
              </>
            }
          />
        </div>
      ) : (
        <>
          <div className="au-b64-out">
            <span className="au-b64-hdr">Authorization:</span> Basic{" "}
            <b>{encoded || <T en="(empty)" zh="(空)" />}</b>
          </div>
          <div className="au-b64-ctl">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={!encoded || revealed}
              onClick={() => setRevealed(true)}
            >
              <T en="🔓 Decode it back with atob()" zh="🔓 一键解回来 atob()" />
            </button>
          </div>
          {revealed && (
            <div className="au-b64-reveal">
              <code>atob("{encoded}")</code> →{" "}
              <b>
                "
                {(() => {
                  try {
                    return atob(encoded);
                  } catch {
                    return "";
                  }
                })()}
                "
              </b>
              <p>
                <T
                  en={
                    <>
                      No key, no password, no secret of any kind was involved.{" "}
                      <b>Anyone who sees this string can reverse it.</b> That is
                      what encoding means, and it is not encryption. Basic
                      authentication only stays private because HTTPS encrypts
                      the whole request.
                    </>
                  }
                  zh={
                    <>
                      全程没有密钥、没有口令,什么秘密都没参与。
                      <b>谁看到这串字符,谁就能还原它。</b>
                      这就是编码(encoding),不是加密(encryption)。Basic
                      认证之所以还能保密,靠的是 HTTPS 把整个请求加密了。
                    </>
                  }
                />
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ================= JwtDecoder ================= */

const b64u = (obj: unknown) =>
  (typeof btoa !== "undefined" ? btoa(JSON.stringify(obj)) : "")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const JWT_HEADER = { alg: "HS256", typ: "JWT" };
const JWT_PAYLOAD = {
  sub: "42",
  name: "Ada Lovelace",
  role: "editor",
  exp: 1798761600,
};
const JWT_SIG = "kXbGV0aGFsX3NpZ25hdHVyZV9oZXJl";

interface JwtSegInfo {
  k: "h" | "p" | "s";
  label: Loc<string>;
  body: ReactNode;
}

const JWT_INFOS: JwtSegInfo[] = [
  {
    k: "h",
    label: {
      en: "① header · which algorithm",
      zh: "① header · 用什么算法",
    },
    body: (
      <>
        <pre className="au-jwt-pre">
          {JSON.stringify(JWT_HEADER, null, 2)}
        </pre>
        <p>
          <T
            en={
              <>
                Decoded, it is a small JSON object: the signing algorithm
                (HS256) and the token type. Nothing here is secret.{" "}
                <b>
                  The server must not take the algorithm from this header.
                </b>{" "}
                It has to check the token against the algorithm it expects.
                Otherwise an attacker can send <code>alg: none</code> and drop
                the signature, or send a token signed with HS256 using the
                server&apos;s public RSA key as the HMAC secret on a server that
                expected RS256. Both attacks are old, both still appear.
              </>
            }
            zh={
              <>
                解码回来是一小段 JSON:签名算法(HS256)和令牌类型,
                没有任何秘密。<b>服务器不能拿这个 header 里的算法去验签</b>,
                必须按自己预期的算法来验。否则攻击者可以把
                <code>alg</code> 改成 <code>none</code> 直接去掉签名;
                或者对一台预期 RS256 的服务器,改用 HS256 签名、
                拿服务器的 RSA 公钥当 HMAC 密钥。这两种攻击都很老,
                但至今仍能打中人。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    k: "p",
    label: {
      en: "② payload · the data (readable)",
      zh: "② payload · 数据舱(可读)",
    },
    body: (
      <>
        <pre className="au-jwt-pre">
          {JSON.stringify(JWT_PAYLOAD, null, 2)}
        </pre>
        <p>
          <T
            en={
              <>
                <b>This part is not encrypted.</b> <code>sub</code> is the user
                id and <code>exp</code> is the expiry time in Unix seconds
                (2027-01-01 here). Base64URL is only a way of writing bytes as
                URL-safe text, so anyone holding the token can decode it. Put no
                phone number, no balance, and no government id in here — store
                an id and look the rest up on the server.
              </>
            }
            zh={
              <>
                <b>这一段没有加密。</b>
                <code>sub</code> 是用户 id,<code>exp</code> 是过期时间(Unix
                秒,这里指向 2027-01-01)。Base64URL
                只是把字节写成 URL 安全文本的一种方式,
                拿到令牌的人都能解开。手机号、余额、身份证号一律别放进来
                —— 只放一个 id,其余的到服务器上查。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    k: "s",
    label: {
      en: "③ signature · proof it was not changed",
      zh: "③ signature · 防篡改的证明",
    },
    body: (
      <>
        <pre className="au-jwt-pre">
          <T
            en={`HMAC-SHA256(
  header + "." + payload,
  key          ← the server has this
)`}
            zh={`HMAC-SHA256(
  header + "." + payload,
  key          ← 只有服务器有它
)`}
          />
        </pre>
        <p>
          <T
            en={
              <>
                This part does not decode into anything readable. It is not
                data. It is a signature computed over the first two parts with a
                key that only the server has. Change one character in the header
                or the payload and the signature no longer matches, so the
                server rejects the token. That is all a signature proves: the
                token was issued by someone holding the key, and it has not been
                altered. It says <b>nothing</b> about keeping the contents
                private.
              </>
            }
            zh={
              <>
                这一段解不出可读内容,因为它不是数据,
                而是用只有服务器掌握的密钥、对前两段算出的签名。
                header 或 payload 改一个字符,签名就对不上,服务器直接拒收。
                签名能证明的只有两件事:令牌由持有密钥的一方签发,
                且签发之后没被改过。它<b>完全不负责</b>保密。
              </>
            }
          />
        </p>
      </>
    ),
  },
];

export function JwtDecoder() {
  const L = useL();
  const [sel, setSel] = useState<0 | 1 | 2>(1);
  const segs = [b64u(JWT_HEADER), b64u(JWT_PAYLOAD), JWT_SIG];
  const info = JWT_INFOS[sel];

  return (
    <div className="viz au-jwt">
      <div className="viz-title">
        <T
          en="JWT bench: click any of the three parts"
          zh="JWT 解剖台:点三段中的任何一段"
        />
      </div>
      <div className="au-jwt-token">
        {segs.map((s, i) => (
          <span key={i}>
            {i > 0 && <span className="au-jwt-dot">.</span>}
            <button
              type="button"
              className={`au-jwt-seg${sel === i ? " on" : ""}`}
              data-k={JWT_INFOS[i].k}
              aria-label={L(JWT_INFOS[i].label)}
              onClick={() => setSel(i as 0 | 1 | 2)}
            >
              {s}
            </button>
          </span>
        ))}
      </div>
      <div className="au-jwt-info" aria-live="polite">
        <span
          className="chip"
          data-tone={
            info.k === "p" ? "warn" : info.k === "s" ? "ok" : "info"
          }
        >
          {L(info.label)}
        </span>
        {info.body}
      </div>
    </div>
  );
}

/* ================= RefreshFlow(静态) ================= */

interface RefreshStep {
  n: string;
  t: Loc<string>;
  d: Loc<ReactNode>;
}

const REFRESH_STEPS: RefreshStep[] = [
  {
    n: "1",
    t: { en: "Normal requests", zh: "平时干活" },
    d: {
      en: "Every request carries the access token. It expires in about 15 minutes, so a stolen copy is useful for a short time only.",
      zh: "每个请求都带上 access token。它 15 分钟左右就过期,所以就算被人拿走,能用的时间也很短。",
    },
  },
  {
    n: "2",
    t: { en: "It expires", zh: "过期被拒" },
    d: {
      en: "The API answers 401. This is not a signal to send the user back to the login page. It is a signal to get a new token.",
      zh: "API 回 401。这不是让用户重新登录的信号,而是该换一枚新令牌的信号。",
    },
  },
  {
    n: "3",
    t: { en: "Exchange it", zh: "静默换发" },
    d: {
      en: "The client posts the refresh token, which the server does store and can revoke, and receives a new pair.",
      zh: "客户端把 refresh token 提交上去,换回新的一对令牌。refresh token 是服务器存着的,可以随时作废。",
    },
  },
  {
    n: "4",
    t: { en: "Retry", zh: "无感恢复" },
    d: {
      en: "The failed request is sent again with the new access token. The user sees nothing.",
      zh: "拿新的 access token 把刚才失败的请求重发一次,用户全程无感。",
    },
  },
];

export function RefreshFlow() {
  const L = useL();
  return (
    <div className="au-refresh">
      {REFRESH_STEPS.map((s) => (
        <div key={s.n} className="au-rstep">
          <span className="au-rstep-n">{s.n}</span>
          <b>{L(s.t)}</b>
          <p>{L(s.d)}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= OAuthFlow ================= */

interface OauthFrameDef {
  lit: number[];
  packetAt?: 0 | 1 | 2;
  packet?: string;
  back?: boolean;
  consent?: boolean;
  msg: Loc<ReactNode>;
}

const OAUTH_NODES: { ico: string; label: Loc<string>; sub: Loc<string> }[] = [
  {
    ico: "🧑",
    label: { en: "You (browser)", zh: "你(浏览器)" },
    sub: { en: "Resource owner", zh: "资源所有者" },
  },
  {
    ico: "🖨️",
    label: { en: "PhotoPrint", zh: "PhotoPrint" },
    sub: { en: "Client (third party)", zh: "客户端(第三方应用)" },
  },
  {
    ico: "🛂",
    label: { en: "Authorization server", zh: "授权服务器" },
    sub: { en: "photos.example · issues tokens", zh: "photos.example · 发令牌" },
  },
  {
    ico: "🗄️",
    label: { en: "Resource server", zh: "资源服务器" },
    sub: { en: "photos.example · holds photos", zh: "photos.example · 存照片" },
  },
];

const OAUTH_CONSENT: Loc<string> = {
  en: "☑ Allow: read photos",
  zh: "☑ 允许:读取照片",
};

const OAUTH_FRAMES: OauthFrameDef[] = [
  {
    lit: [0],
    packetAt: 0,
    packet: "Connect my photo library",
    msg: {
      en: (
        <>
          Your photos live at photos.example. PhotoPrint is a separate service
          that prints them. It needs to read your photos, and you must not give
          it your photos.example password. That is the problem OAuth 2.0 solves.
        </>
      ),
      zh: (
        <>
          你的照片存在 photos.example。PhotoPrint 是另一家做冲印的服务,
          它需要读取这些照片,而你绝不能把 photos.example
          的密码给它。这就是 OAuth 2.0 要解决的问题。
        </>
      ),
    },
  },
  {
    lit: [0, 2],
    packetAt: 1,
    packet: "302 → /authorize?…&code_challenge=…",
    msg: {
      en: (
        <>
          The browser is redirected to the authorization server at
          photos.example. The URL carries the client id, the redirect URI, the
          requested <b>scope</b>, a random <code>state</code> value, and a{" "}
          <code>code_challenge</code>. You type your password{" "}
          <b>on the photos.example page</b>. PhotoPrint never sees it.
        </>
      ),
      zh: (
        <>
          浏览器被重定向到 photos.example 的授权服务器。URL
          里带着 client id、回调地址、申请的<b>权限范围(scope)</b>、
          一个随机的 <code>state</code>,以及一个{" "}
          <code>code_challenge</code>。接下来你在
          <b>photos.example 自己的页面上</b>输密码,PhotoPrint 全程看不见。
        </>
      ),
    },
  },
  {
    lit: [2],
    consent: true,
    msg: {
      en: (
        <>
          photos.example asks you: PhotoPrint wants to read your photos, do you
          allow it? The list of permissions being requested is the{" "}
          <b>scope</b>. Ask for the smallest scope that does the job. You
          approve.
        </>
      ),
      zh: (
        <>
          photos.example 问你:PhotoPrint 想读取你的照片,同意吗?
          这份申请的权限清单就叫 <b>scope</b>,能申请多小就申请多小。
          你点了同意。
        </>
      ),
    },
  },
  {
    lit: [1],
    packetAt: 1,
    packet: "redirect + code=SplxlO…",
    back: true,
    msg: {
      en: (
        <>
          The browser is sent back to PhotoPrint&apos;s registered redirect URI,
          carrying an <b>authorization code</b>. The code is short-lived and can
          be used once. It is not a token, and on its own it is not enough to
          get one.
        </>
      ),
      zh: (
        <>
          浏览器被送回 PhotoPrint 事先登记的回调地址,并带上一个
          <b>授权码(code)</b>。这个码寿命很短、只能用一次;
          它不是令牌,单凭它也换不到令牌。
        </>
      ),
    },
  },
  {
    lit: [1, 2],
    packetAt: 1,
    packet: "POST /token · code + code_verifier",
    msg: {
      en: (
        <>
          PhotoPrint sends the code straight to the authorization server, not
          through the browser, together with the <code>code_verifier</code> —
          the secret whose hash it sent earlier as the{" "}
          <code>code_challenge</code>. This is <b>PKCE</b>: someone who
          intercepts the code cannot exchange it, because they do not have the
          verifier. A client that can keep a secret also authenticates itself
          here.
        </>
      ),
      zh: (
        <>
          PhotoPrint 把这个码直接发给授权服务器 —— 不经过浏览器 ——
          同时附上 <code>code_verifier</code>,也就是刚才那个{" "}
          <code>code_challenge</code> 的原文。这就是 <b>PKCE</b>:
          半路截到码的人没有 verifier,换不到令牌。
          能保管密钥的客户端还会在这一步验证自己的身份。
        </>
      ),
    },
  },
  {
    lit: [1],
    packetAt: 1,
    packet: "access_token · scope=photos.read",
    back: true,
    msg: {
      en: (
        <>
          The authorization server returns an <b>access token</b>. It is limited
          to the approved scope and it expires. Read what it actually says: it
          says what the holder may do. It does not say who you are.
        </>
      ),
      zh: (
        <>
          授权服务器发回一枚 <b>access token</b>:
          权限被限制在刚才同意的 scope 内,而且会过期。
          注意它到底说了什么 —— 它说的是「持有者可以做什么」,
          不是「你是谁」。
        </>
      ),
    },
  },
  {
    lit: [1, 3],
    packetAt: 2,
    packet: "GET /photos · Authorization: Bearer …",
    msg: {
      en: (
        <>
          PhotoPrint calls the resource server with the token in the
          Authorization header and reads the photos. Look back at the whole
          exchange: <b>your password never left photos.example</b>, the access
          is limited to reading photos, and it expires on its own.
        </>
      ),
      zh: (
        <>
          PhotoPrint 带着令牌调资源服务器的 API,读到照片。回看整个过程:
          <b>你的密码从未离开 photos.example</b>,
          授出去的权限只有「读照片」,而且会自动过期。
        </>
      ),
    },
  },
];

function OauthStage({ f }: { f: OauthFrameDef }) {
  const L = useL();
  return (
    <div className="flow au-oauth">
      {OAUTH_NODES.map((n, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <div className="flow-mid au-oauth-mid">
              <div className="flow-line" />
              {f.packetAt === i - 1 && f.packet && (
                <span className={`flow-packet${f.back ? " back" : ""}`}>
                  {f.packet}
                </span>
              )}
            </div>
          )}
          <div className={`flow-node${f.lit.includes(i) ? " lit" : ""}`}>
            <span className="ico">{n.ico}</span>
            {L(n.label)}
            <small className="au-node-sub">{L(n.sub)}</small>
            {i === 2 && f.consent && (
              <small className="au-consent">{L(OAUTH_CONSENT)}</small>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export function OAuthFlow() {
  const frames: FlowFrame[] = OAUTH_FRAMES.map((f) => ({
    stage: <OauthStage f={f} />,
    msg: f.msg,
  }));
  return (
    <FlowStepper
      title={{
        en: "Authorization Code with PKCE, one step at a time",
        zh: "授权码 + PKCE 流程,逐帧走一遍",
      }}
      frames={frames}
    />
  );
}

/* ================= CorsFlow ================= */

interface CorsFrameDef {
  lit: number[];
  packetAt?: 0 | 1;
  packet?: string;
  back?: boolean;
  guard?: Loc<string>;
  msg: Loc<ReactNode>;
}

const CORS_NODES: { ico: string; label: Loc<string>; sub: Loc<string> }[] = [
  {
    ico: "📄",
    label: { en: "Your script", zh: "你的 JS" },
    sub: { en: "localhost:3000", zh: "localhost:3000" },
  },
  {
    ico: "🛡️",
    label: { en: "Browser", zh: "浏览器" },
    sub: { en: "Applies the same-origin policy", zh: "执行同源策略" },
  },
  {
    ico: "🌐",
    label: { en: "api.example.com", zh: "api.example.com" },
    sub: { en: "A different origin", zh: "另一个源" },
  },
];

const CORS_FRAMES: CorsFrameDef[] = [
  {
    lit: [0],
    packetAt: 0,
    packet: "fetch(…) + Authorization",
    msg: {
      en: (
        <>
          Your page is served from http://localhost:3000 and wants data from
          https://api.example.com. The scheme, the host, or the port differs, so
          this is a <b>cross-origin</b> request. The browser applies the
          same-origin policy to it.
        </>
      ),
      zh: (
        <>
          你的页面来自 http://localhost:3000,想拿
          https://api.example.com 的数据。协议、域名、端口只要有一个不同,
          这就是一个<b>跨源(cross-origin)</b>请求,
          浏览器会对它执行同源策略。
        </>
      ),
    },
  },
  {
    lit: [1],
    guard: { en: "🚧 Preflight first", zh: "🚧 先预检" },
    msg: {
      en: (
        <>
          The request carries an Authorization header, so it is not a{" "}
          <b>simple request</b>. Before sending it, the browser asks the server
          whether such a request is allowed. That question is the{" "}
          <b>preflight</b>.
        </>
      ),
      zh: (
        <>
          这个请求带了 Authorization 头,所以它不是<b>简单请求</b>。
          发送之前,浏览器会先问服务器一句「这样的请求你收不收」——
          这一问就是<b>预检(preflight)</b>。
        </>
      ),
    },
  },
  {
    lit: [1, 2],
    packetAt: 1,
    packet: "OPTIONS + Origin + Request-Method/-Headers",
    msg: {
      en: (
        <>
          The preflight is an <b>OPTIONS</b> request that{" "}
          <b>the browser sends by itself</b> — it is nowhere in your code. It
          states three things: where the page came from (<code>Origin</code>),
          which method the real request will use, and which headers it will
          carry.
        </>
      ),
      zh: (
        <>
          预检是一条 <b>OPTIONS</b> 请求,由<b>浏览器自动发出</b>,
          你的代码里根本没写它。它说明三件事:页面来自哪里(
          <code>Origin</code>)、真请求会用什么方法、会带哪些头。
        </>
      ),
    },
  },
  {
    lit: [2],
    packetAt: 1,
    packet: "Access-Control-Allow-Origin / -Methods / -Headers",
    back: true,
    msg: {
      en: (
        <>
          The server answers: this origin is allowed, this method is allowed,
          these headers are allowed. It can add{" "}
          <b>Access-Control-Max-Age: 86400</b>, which asks the browser not to
          repeat the preflight for the same combination for a day. Browsers cap
          that value at their own limit, so treat it as a request, not a
          guarantee.
        </>
      ),
      zh: (
        <>
          服务器回答:这个来源可以,这个方法可以,这些头可以。
          它还可以加一句 <b>Access-Control-Max-Age: 86400</b>,
          请求浏览器在一天之内不要为同样的组合重复预检。
          浏览器会按自己的上限截断这个值,所以它是请求,不是保证。
        </>
      ),
    },
  },
  {
    lit: [1, 2],
    packetAt: 1,
    packet: "GET /posts + Authorization",
    guard: { en: "✅ Allowed", zh: "✅ 放行" },
    msg: {
      en: (
        <>
          The answer was positive, so the browser now sends the real request.
          Note the cost: a non-simple cross-origin call is two round trips, not
          one, unless the preflight result is still cached.
        </>
      ),
      zh: (
        <>
          回答是肯定的,浏览器这才发出真正的请求。注意这里的代价:
          一个非简单的跨源调用是两次往返,不是一次 ——
          除非上一次的预检结果还在缓存里。
        </>
      ),
    },
  },
  {
    lit: [0],
    packetAt: 1,
    packet: "200 + JSON + Allow-Origin",
    back: true,
    msg: {
      en: (
        <>
          The response arrives and the browser checks{" "}
          <code>Access-Control-Allow-Origin</code> once more before handing the
          body to your script. If the server left that header out, your script
          gets nothing — <b>even though the status is 200</b>.
        </>
      ),
      zh: (
        <>
          响应回来,浏览器在把正文交给你的脚本之前,
          再核对一次 <code>Access-Control-Allow-Origin</code>。
          服务器要是漏了这个头,你的脚本什么也拿不到 ——
          <b>哪怕状态码明明是 200</b>。
        </>
      ),
    },
  },
  {
    lit: [1],
    guard: { en: "🛡️ Browsers only", zh: "🛡️ 只在浏览器里" },
    msg: {
      en: (
        <>
          Three things to keep: a CORS error does not mean the API is down, it
          means the server did not say your origin is allowed; curl and any
          server-side code are not browsers, so the rule does not apply to them;
          and CORS is not a way to protect an API. It decides whether{" "}
          <b>page script</b> may read a cross-origin response, which protects
          the user. Your own authentication and authorization checks still have
          to be there.
        </>
      ),
      zh: (
        <>
          三条要记住:CORS 报错不等于 API 挂了,
          只是服务器没说你的来源可以;curl
          和任何跑在服务器上的代码都不是浏览器,这条规则管不到它们;
          CORS 也不是保护 API 的手段 —— 它决定的是<b>页面脚本</b>
          能不能读取跨源响应,保护的是用户。
          服务端该做的认证和授权,一样都不能省。
        </>
      ),
    },
  },
];

function CorsStage({ f }: { f: CorsFrameDef }) {
  const L = useL();
  return (
    <div className="flow au-cors">
      {CORS_NODES.map((n, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <div className="flow-mid au-cors-mid">
              <div className="flow-line" />
              {f.packetAt === i - 1 && f.packet && (
                <span className={`flow-packet${f.back ? " back" : ""}`}>
                  {f.packet}
                </span>
              )}
            </div>
          )}
          <div className={`flow-node${f.lit.includes(i) ? " lit" : ""}`}>
            <span className="ico">{n.ico}</span>
            {L(n.label)}
            <small className="au-node-sub">{L(n.sub)}</small>
            {i === 1 && f.guard && (
              <small className="au-consent">{L(f.guard)}</small>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export function CorsFlow() {
  const frames: FlowFrame[] = CORS_FRAMES.map((f) => ({
    stage: <CorsStage f={f} />,
    msg: f.msg,
  }));
  return (
    <FlowStepper
      title={{
        en: "A preflight, step by step",
        zh: "CORS 预检对话,逐帧走一遍",
      }}
      frames={frames}
    />
  );
}
