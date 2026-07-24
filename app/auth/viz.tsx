"use client";

// 06 · 认证与安全 专属可视化:
//  - TrustLadder:hero 里的「信任阶梯」(纯 CSS 进场)。
//  - ProxyFlow:后端代理模式静态流程图(key 永远不下发)。
//  - Base64Lab:btoa/atob 互动 —— 亲眼看到「编码谁都能解」。
//  - JwtDecoder:三段式 JWT 解剖台,点每段看解码结果。
//  - RefreshFlow:短命 access + refresh 换发四步简图(静态)。
//  - OAuthFlow:授权码流程逐帧动画(7 帧)。
//  - CorsFlow:CORS 预检对话逐帧动画(7 帧)。

import { Fragment, useState, type ReactNode } from "react";
import { FlowStepper, type FlowFrame } from "@/lib/stepper";

/* ================= TrustLadder ================= */

const RUNGS = [
  { ico: "🪪", name: "API Key", sub: "小区门禁卡:认卡不认人" },
  { ico: "📛", name: "Basic", sub: "报名字+密码:必须配 HTTPS" },
  { ico: "🎫", name: "JWT", sub: "防伪工牌:自带签名" },
  { ico: "🛂", name: "OAuth", sub: "访客系统:不交密码只发通行证" },
];

export function TrustLadder() {
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
          <small>{r.sub}</small>
        </div>
      ))}
    </div>
  );
}

/* ================= ProxyFlow(静态) ================= */

export function ProxyFlow() {
  return (
    <div className="viz">
      <div className="viz-title">正解:后端代理 —— 钥匙永远不下发</div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="flow au-proxy">
            <div className="flow-node">
              <span className="ico">🖥️</span>
              浏览器
              <small className="au-node-sub">🚫 手里没有 key</small>
            </div>
            <div className="flow-mid au-proxy-mid">
              <div className="flow-line" />
              <span className="flow-packet">GET /api/weather(不带 key)</span>
            </div>
            <div className="flow-node lit">
              <span className="ico">🏠</span>
              你自己的后端
              <small className="au-node-sub">🔑 key 藏在环境变量</small>
            </div>
            <div className="flow-mid au-proxy-mid">
              <div className="flow-line" />
              <span className="flow-packet">X-API-Key: wk_live_9f8a…</span>
            </div>
            <div className="flow-node">
              <span className="ico">🌐</span>
              第三方 API
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg">
        浏览器只跟<b>你的</b>服务器说话;真正的 key
        由你的服务器代为出示,全程不进前端代码、不进 Network 面板 ——
        顺手还能在中间加缓存和限流。
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
      <div className="viz-title">Base64 加工台:输入 → 编码 → 一键解回来</div>
      <label className="au-b64-label" htmlFor="au-b64-in">
        假装这是你的「用户名:密码」:
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
          ⚠️ btoa 只吃 Latin-1 字符 —— 换成英文字母、数字试试
          (真实世界会先做 UTF-8 转码,这里不展开)。
        </div>
      ) : (
        <>
          <div className="au-b64-out">
            <span className="au-b64-hdr">Authorization:</span> Basic{" "}
            <b>{encoded || "(空)"}</b>
          </div>
          <div className="au-b64-ctl">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={!encoded || revealed}
              onClick={() => setRevealed(true)}
            >
              🔓 一键解回来 atob()
            </button>
          </div>
          {revealed && (
            <div className="au-b64-reveal">
              <code>atob("{encoded}")</code> →{" "}
              <b>"{(() => {
                try {
                  return atob(encoded);
                } catch {
                  return "";
                }
              })()}"</b>
              <p>
                看到了吗?没有钥匙、没有口令,<b>谁捡到这串字符谁就能还原</b>。
                这叫编码(encoding),不是加密(encryption)——
                所以 Basic 认证必须躲在 HTTPS 的加密隧道里跑。
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
  label: string;
  body: ReactNode;
}

const JWT_INFOS: JwtSegInfo[] = [
  {
    k: "h",
    label: "① header · 说明书",
    body: (
      <>
        <pre className="au-jwt-pre">
          {JSON.stringify(JWT_HEADER, null, 2)}
        </pre>
        <p>
          解码回来是一小段 JSON:用什么算法签名(HS256)、我是个
          JWT。就是个说明书,没有秘密。
        </p>
      </>
    ),
  },
  {
    k: "p",
    label: "② payload · 数据舱(明文!)",
    body: (
      <>
        <pre className="au-jwt-pre">
          {JSON.stringify(JWT_PAYLOAD, null, 2)}
        </pre>
        <p>
          <b>看清楚:这是明文。</b>sub 是用户 id,exp 是过期时间(Unix
          秒,这里指向 2027-01-01)。Base64URL 只是「换个穿法」,任何人
          atob 一下就全看见 —— 所以手机号、余额这类敏感数据,
          <b>永远不进 payload</b>。
        </p>
      </>
    ),
  },
  {
    k: "s",
    label: "③ signature · 防伪封条",
    body: (
      <>
        <pre className="au-jwt-pre">{`HMAC-SHA256(
  header + "." + payload,
  服务器密钥  ← 只有服务器知道
)`}</pre>
        <p>
          这段解不开 —— 它不是数据,是拿<b>服务器密钥</b>对前两段算出的
          签名。前两段动一个字,签名就对不上,服务器当场识破。
          防篡改靠它;但它<b>不负责保密</b> —— 前两段照样人人可读。
        </p>
      </>
    ),
  },
];

export function JwtDecoder() {
  const [sel, setSel] = useState<0 | 1 | 2>(1);
  const segs = [b64u(JWT_HEADER), b64u(JWT_PAYLOAD), JWT_SIG];
  const info = JWT_INFOS[sel];

  return (
    <div className="viz au-jwt">
      <div className="viz-title">JWT 解剖台 · 点三段中的任何一段</div>
      <div className="au-jwt-token">
        {segs.map((s, i) => (
          <span key={i}>
            {i > 0 && <span className="au-jwt-dot">.</span>}
            <button
              type="button"
              className={`au-jwt-seg${sel === i ? " on" : ""}`}
              data-k={JWT_INFOS[i].k}
              onClick={() => setSel(i as 0 | 1 | 2)}
            >
              {s}
            </button>
          </span>
        ))}
      </div>
      <div className="au-jwt-info" aria-live="polite">
        <span className="chip" data-tone={info.k === "p" ? "warn" : info.k === "s" ? "ok" : "info"}>
          {info.label}
        </span>
        {info.body}
      </div>
    </div>
  );
}

/* ================= RefreshFlow(静态) ================= */

const REFRESH_STEPS = [
  {
    n: "1",
    t: "平时干活",
    d: "每个请求带 access token(寿命 15 分钟)。短命 = 泄露了损失也有限。",
  },
  {
    n: "2",
    t: "过期被拒",
    d: "服务器回 401。别慌,这不是让用户重新登录 —— 是换钥匙的信号。",
  },
  {
    n: "3",
    t: "静默换发",
    d: "客户端拿出深藏的 refresh token(寿命 30 天),POST 去换一对新令牌。",
  },
  {
    n: "4",
    t: "无感恢复",
    d: "拿新 access token 重发刚才失败的请求 —— 用户全程没看见登录页。",
  },
];

export function RefreshFlow() {
  return (
    <div className="au-refresh">
      {REFRESH_STEPS.map((s) => (
        <div key={s.n} className="au-rstep">
          <span className="au-rstep-n">{s.n}</span>
          <b>{s.t}</b>
          <p>{s.d}</p>
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
  msg: ReactNode;
}

const OAUTH_NODES = [
  { ico: "🧑", label: "你(浏览器)", sub: "资源所有者" },
  { ico: "🖨️", label: "PhotoPrint", sub: "客户端(第三方)" },
  { ico: "🛂", label: "授权服务器", sub: "微信 · 发钥匙" },
  { ico: "🗄️", label: "资源服务器", sub: "微信 · 存头像" },
];

const OAUTH_FRAMES: OauthFrameDef[] = [
  {
    lit: [0],
    packetAt: 0,
    packet: "点「用微信登录」",
    msg: (
      <>
        你在 PhotoPrint(一个想帮你打印微信头像的第三方应用)
        点了「用微信登录」。它不认识你,但它认识微信。
      </>
    ),
  },
  {
    lit: [0, 2],
    packetAt: 1,
    packet: "302 → 跳转到微信授权页",
    msg: (
      <>
        浏览器被<b>重定向</b>到微信自家的授权页面。划重点:
        接下来输密码,输在<b>微信的页面</b>上 —— PhotoPrint 全程看不见。
      </>
    ),
  },
  {
    lit: [2],
    consent: true,
    msg: (
      <>
        微信问你:「PhotoPrint 想读取你的头像和昵称,同意吗?」——
        这个勾选范围叫 <b>scope</b>,能勾多小勾多小。你点了同意。
      </>
    ),
  },
  {
    lit: [1],
    packetAt: 1,
    packet: "回跳 + code=SplxlO…(一次性小票)",
    back: true,
    msg: (
      <>
        微信把浏览器送回 PhotoPrint 的回调地址,并塞给它一张
        <b>授权码(code)</b> —— 一张短命、只能用一次的小票。
        它还不是钥匙。
      </>
    ),
  },
  {
    lit: [1, 2],
    packetAt: 1,
    packet: "code + client_secret(后端直连)",
    msg: (
      <>
        PhotoPrint 的<b>后端</b>拿小票 + 自己的 client_secret
        直接找授权服务器换真钥匙 —— 这一步<b>不经过浏览器</b>,
        secret 永远不见天日。
      </>
    ),
  },
  {
    lit: [1],
    packetAt: 1,
    packet: "access_token(限头像昵称 · 2 小时)",
    back: true,
    msg: (
      <>
        验明正身,发钥匙:一枚<b>受限、会过期</b>的 access token ——
        只能开「头像和昵称」这两扇门,两小时后自动作废。
      </>
    ),
  },
  {
    lit: [1, 3],
    packetAt: 2,
    packet: "GET /me · Authorization: Bearer …",
    msg: (
      <>
        PhotoPrint 带着 token 调资源服务器的 API,拿到头像。复盘全程:
        <b>你的微信密码从未离开微信</b> —— 这就是 OAuth 的全部意义。
      </>
    ),
  },
];

function OauthStage({ f }: { f: OauthFrameDef }) {
  return (
    <div className="flow au-oauth">
      {OAUTH_NODES.map((n, i) => (
        <Fragment key={n.label}>
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
            {n.label}
            <small className="au-node-sub">{n.sub}</small>
            {i === 2 && f.consent && (
              <small className="au-consent">☑ 允许读取:头像、昵称</small>
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
      title="授权码流程:「用微信登录」的幕后(逐帧)"
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
  guard?: string;
  msg: ReactNode;
}

const CORS_NODES = [
  { ico: "📄", label: "你的 JS", sub: "localhost:3000" },
  { ico: "🛡️", label: "浏览器", sub: "同源策略保安" },
  { ico: "🌐", label: "api.example.com", sub: "跨域服务器" },
];

const CORS_FRAMES: CorsFrameDef[] = [
  {
    lit: [0],
    packetAt: 0,
    packet: "fetch(…) + Authorization",
    msg: (
      <>
        你的页面站在 http://localhost:3000,想拿
        https://api.example.com 的数据 ——
        协议、域名、端口任一不同就是<b>跨域(cross-origin)</b>。
        浏览器的同源策略开始上岗。
      </>
    ),
  },
  {
    lit: [1],
    guard: "🚧 拦下:先预检",
    msg: (
      <>
        这个请求带了 Authorization 头 → 不算「简单请求」。
        浏览器保安:「先别急,我派个侦察兵去问问」——
        这就是<b>预检(preflight)</b>。
      </>
    ),
  },
  {
    lit: [1, 2],
    packetAt: 1,
    packet: "OPTIONS + Origin + Request-Method/-Headers",
    msg: (
      <>
        预检是一条 <b>OPTIONS</b> 请求,<b>浏览器自动发出</b>
        ,你的代码里根本没写它。内容三句话:我从哪来(Origin)、
        想用什么方法、想带什么头。
      </>
    ),
  },
  {
    lit: [2],
    packetAt: 1,
    packet: "Access-Control-Allow-Origin / -Methods / -Headers",
    back: true,
    msg: (
      <>
        服务器表态:这个来源可以、这个方法可以、这些头可以;再附一句{" "}
        <b>Access-Control-Max-Age: 86400</b> ——
        一天之内同样的组合别再问了。
      </>
    ),
  },
  {
    lit: [1, 2],
    packetAt: 1,
    packet: "GET /posts + Authorization(真请求)",
    guard: "✅ 放行",
    msg: <>侦察兵带回好消息,保安放行 —— 真请求这才出发。</>,
  },
  {
    lit: [0],
    packetAt: 1,
    packet: "200 + JSON + Allow-Origin",
    back: true,
    msg: (
      <>
        响应回来,浏览器再核对一次 Allow-Origin,合格才把数据交给你的
        JS。服务器少写一个头,你的 JS 就两手空空 ——
        <b>哪怕状态码明明是 200</b>。
      </>
    ),
  },
  {
    lit: [1],
    guard: "🛡️ 规矩只在浏览器里",
    msg: (
      <>
        三连收尾:① CORS 报错 ≠ API 挂了,是服务器没开门、浏览器守规矩;
        ② curl / Postman 不是浏览器,不受管;③ CORS 不是安全防线 ——
        它保护的是<b>用户</b>,防的是别的网站冒用你的浏览器身份,
        想挡爬虫?它管不着。
      </>
    ),
  },
];

function CorsStage({ f }: { f: CorsFrameDef }) {
  return (
    <div className="flow au-cors">
      {CORS_NODES.map((n, i) => (
        <Fragment key={n.label}>
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
            {n.label}
            <small className="au-node-sub">{n.sub}</small>
            {i === 1 && f.guard && (
              <small className="au-consent">{f.guard}</small>
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
      title="CORS 预检对话:保安、侦察兵与放行(逐帧)"
      frames={frames}
    />
  );
}
