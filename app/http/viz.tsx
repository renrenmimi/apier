"use client";

// 第 01 章专属可视化:
//  - HeroLetter:hero 里那封「写给服务器的信」(纯装饰)。
//  - UrlAnatomy:URL 解剖台 —— 逐段点击,右侧讲解(承自序章 JsonAnatomy 的交互)。
//  - MethodPicker:「场景选方法」小练习,点选即判,答错给针对性解释。
//  - StatusExplorer:状态码格子墙,点一个看「人话解释 + 典型场景」。

import { useState, type ReactNode } from "react";
import { Method, Status, type HttpMethod } from "@/lib/kit";

/* ================= HeroLetter ================= */

export function HeroLetter() {
  return (
    <div className="ht-letter" aria-hidden>
      <div className="ht-letter-stamp">HTTP/1.1</div>
      <div className="ht-letter-row">
        <span className="ht-letter-code start">GET /products/42 HTTP/1.1</span>
        <span className="ht-letter-tag">起始行 · 信封上那句话</span>
      </div>
      <div className="ht-letter-row">
        <span className="ht-letter-code">Host: api.shop.com</span>
        <span className="ht-letter-tag">收件人</span>
      </div>
      <div className="ht-letter-row">
        <span className="ht-letter-code">Accept: application/json</span>
        <span className="ht-letter-tag">信纸抬头</span>
      </div>
      <div className="ht-letter-row blank">
        <span className="ht-letter-code dim">(空行)</span>
        <span className="ht-letter-tag">抬头与正文的分界</span>
      </div>
      <div className="ht-letter-row">
        <span className="ht-letter-code dim">(正文 —— 这封信不用带)</span>
        <span className="ht-letter-tag">信的内容</span>
      </div>
    </div>
  );
}

/* ================= UrlAnatomy ================= */

interface UrlSeg {
  k: string;
  s: string;
  name: string;
  info: ReactNode;
}

const URL_SEGS: UrlSeg[] = [
  {
    k: "proto",
    s: "https://",
    name: "协议(protocol)",
    info: (
      <>
        这封信<b>用什么规矩递送</b>。http 是明文,一路上的中间设备都能偷看;
        https 是加了 TLS 加密的 http,只有收件人拆得开。今天正经的 API
        基本只提供 https —— 毕竟信里经常装着你的 token。
      </>
    ),
  },
  {
    k: "host",
    s: "api.shop.com",
    name: "域名(domain / host)",
    info: (
      <>
        信<b>寄到哪栋楼</b>。DNS 负责把这串人类能记住的名字翻译成 IP 地址。
        开头的 <code>api.</code> 是行业惯例的子域名:很多公司把网页放在
        www.,把 API 单独安置在 api. —— 前后台分开住,互不打扰。
      </>
    ),
  },
  {
    k: "ver",
    s: "/v1",
    name: "路径 · 版本号",
    info: (
      <>
        路径的第一段,这家 API 用它放<b>版本号</b>。将来 API 大改版,推出
        /v2,老用户继续用 /v1 —— 谁也不被突然坑一把。版本化还有别的玩法
        (放 header 里),第 05 章细讲。
      </>
    ),
  },
  {
    k: "coll",
    s: "/products",
    name: "路径 · 资源集合",
    info: (
      <>
        像个文件夹:里面装着<b>所有商品</b>。注意是名词复数 ——
        「查商品」的动词去哪了?动词不写在 URL 里,写在 HTTP 方法里
        (GET /products = 读商品),§03 马上讲。
      </>
    ),
  },
  {
    k: "id",
    s: "/42",
    name: "路径 · 资源 ID",
    info: (
      <>
        集合里的<b>具体某一个</b>。<code>/products/42</code> 连起来读:
        「products 文件夹里的 42 号」。换成 /users/7 就是「7 号用户」——
        这套「集合/编号」的路径写法,你在真实 API 里会见到一万次。
      </>
    ),
  },
  {
    k: "q1",
    s: "?sort=price",
    name: "查询参数(query parameter)",
    info: (
      <>
        <code>?</code> 是分界线:前面回答「找谁」,后面全是<b>附加要求</b>。
        <code>sort=price</code>:按价格排序。查询参数不改变「是哪个资源」,
        只调整「怎么给我」—— 排序、筛选、分页都靠它。
      </>
    ),
  },
  {
    k: "q2",
    s: "&limit=10",
    name: "第二个查询参数",
    info: (
      <>
        第二个及以后的参数用 <code>&amp;</code> 串起来。
        <code>limit=10</code>:只要 10 条,别把整个仓库都搬来。
        多个参数就是多个「键=值」,顺序无所谓 —— 服务器按名字认。
      </>
    ),
  },
];

export function UrlAnatomy() {
  const [sel, setSel] = useState(3);
  const seg = URL_SEGS[sel];

  return (
    <div className="ht-url">
      <div className="ht-url-bar" role="group" aria-label="URL 分段解剖">
        {URL_SEGS.map((s, i) => (
          <button
            key={s.k}
            type="button"
            data-k={s.k}
            className={`ht-url-seg${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            {s.s}
          </button>
        ))}
      </div>
      <div className="ht-url-info" aria-live="polite">
        <div className="ht-url-info-head">
          <span className="ht-url-info-code">{seg.s}</span>
          <b>{seg.name}</b>
        </div>
        <p>{seg.info}</p>
      </div>
    </div>
  );
}

/* ================= MethodPicker ================= */

const MP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface MpScenario {
  id: string;
  q: ReactNode;
  answer: HttpMethod;
  why: ReactNode;
  wrong: Partial<Record<HttpMethod, ReactNode>>;
}

const MP_SCENARIOS: MpScenario[] = [
  {
    id: "view",
    q: <>打开商品详情页,展示 42 号商品的信息。</>,
    answer: "GET",
    why: (
      <>
        纯读取,不改任何东西 —— GET 的本职工作。安全又幂等,
        刷新一百次也不会出事。
      </>
    ),
    wrong: {
      POST: (
        <>
          POST 是「把数据交给服务器处理」。你两手空空,只想看一眼 ——
          没有数据要交。
        </>
      ),
      PUT: <>PUT 会拿你的请求体去整体替换资源 —— 你压根没打算改它。</>,
      PATCH: <>PATCH 是改几个字段用的 —— 这里一个字段都不想动,纯看。</>,
      DELETE: <>点进详情页商品就没了?用户怕是要报警。</>,
    },
  },
  {
    id: "signup",
    q: <>用户填完表单,注册一个新账号。</>,
    answer: "POST",
    why: (
      <>
        新账号的 id 还不存在、由服务器分配 —— 「造一个新的」交给
        POST,成功通常回 201 Created。
      </>
    ),
    wrong: {
      GET: (
        <>
          GET 是只读的,不该造出新账号;而且表单数据得塞进 URL,
          密码会原样躺进服务器日志 —— 事故。
        </>
      ),
      PUT: (
        <>
          PUT 适合「往已知地址放东西」。新账号连地址(id)都还没有,
          让服务器分配 —— 这是 POST 的活。
        </>
      ),
      PATCH: <>还没有这个账号,谈不上「部分修改」—— 先得有,才能改。</>,
      DELETE: <>注册变注销,方向全反了。</>,
    },
  },
  {
    id: "replace",
    q: <>把 42 号用户的整份资料,用新的一份完整覆盖。</>,
    answer: "PUT",
    why: (
      <>
        「整体替换已知地址上的资源」—— PUT 的教科书场景。
        而且幂等:同一份资料放两次,结果一样。
      </>
    ),
    wrong: {
      PATCH: (
        <>
          PATCH 是「只改这几个字段」。题目说的是整份覆盖 ——
          整份的活归 PUT。
        </>
      ),
      POST: (
        <>
          POST 不承诺幂等,重复提交可能多出一条数据;
          覆盖一个已存在的资源,PUT 语义更准。
        </>
      ),
      GET: <>GET 只读,改不了任何东西。</>,
      DELETE: <>是覆盖,不是清除 —— DELETE 会让 42 号直接消失。</>,
    },
  },
  {
    id: "nickname",
    q: <>用户只想改个昵称,其他字段一律不动。</>,
    answer: "PATCH",
    why: (
      <>
        部分修改 —— PATCH 的本职:请求体里只带 <code>nickname</code>{" "}
        一个字段,其他原样保留。
      </>
    ),
    wrong: {
      PUT: (
        <>
          用 PUT 只传昵称,按语义<b>其他字段会被清掉</b> ——
          这是新手弄丢数据的头号姿势,§03 的警告牌就是为它立的。
        </>
      ),
      POST: <>不是要造新用户,是修一下旧的 —— 创建的事才找 POST。</>,
      GET: <>GET 连一个标点都改不了。</>,
      DELETE: <>昵称是要改,不是要销号。</>,
    },
  },
  {
    id: "remove",
    q: <>管理员删除一条违规评论。</>,
    answer: "DELETE",
    why: (
      <>
        让资源消失 —— DELETE 的本职。它还是幂等的:删两次,
        评论都是「没了」,超时重试也不慌。
      </>
    ),
    wrong: {
      POST: (
        <>
          确实见过 <code>POST /comments/7/delete</code> 这种老 API,
          但那是历史包袱 —— 语义上 DELETE 才是正牌。
        </>
      ),
      GET: (
        <>
          用 GET 干删除是真实发生过的事故:爬虫顺着链接一路「看」,
          数据一路没 —— GET 必须无害,这是铁律。
        </>
      ),
      PUT: <>你不是要改评论内容,是要让它整个消失。</>,
      PATCH: <>改半天字段,评论还在 —— 你要的是「没了」。</>,
    },
  },
];

export function MethodPicker() {
  const [picks, setPicks] = useState<Record<string, HttpMethod>>({});
  const solved = MP_SCENARIOS.filter((s) => picks[s.id] === s.answer).length;

  return (
    <div className="viz ht-mp">
      <div className="viz-title">
        场景选方法:五道现场判断题
        <span className="mono dim ht-mp-score">
          答对 {solved} / {MP_SCENARIOS.length}
        </span>
      </div>
      <div className="ht-mp-list">
        {MP_SCENARIOS.map((sc, i) => {
          const picked = picks[sc.id];
          const isRight = picked === sc.answer;
          return (
            <div
              key={sc.id}
              className={`ht-mp-item${isRight ? " solved" : ""}`}
            >
              <p className="ht-mp-q">
                <span className="ht-mp-n">{i + 1}</span>
                {sc.q}
              </p>
              <div className="ht-mp-btns">
                {MP_METHODS.map((m) => {
                  let cls = "ht-mp-btn";
                  if (picked === m) cls += m === sc.answer ? " right" : " wrong";
                  return (
                    <button
                      key={m}
                      type="button"
                      className={cls}
                      onClick={() =>
                        setPicks((p) => ({ ...p, [sc.id]: m }))
                      }
                    >
                      <Method m={m} />
                    </button>
                  );
                })}
              </div>
              {picked && (
                <div
                  className={`ht-mp-fb ${isRight ? "ok" : "no"}`}
                  aria-live="polite"
                >
                  {isRight ? (
                    <>✓ {sc.why}</>
                  ) : (
                    <>
                      ✕ {sc.wrong[picked]}
                      <span className="ht-mp-again">换一个方法再试试 —— 答案就在里面。</span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= StatusExplorer ================= */

interface StatusInfo {
  code: number;
  text: string;
  human: string;
  scene: ReactNode;
}

const STATUSES: StatusInfo[] = [
  {
    code: 200,
    text: "OK",
    human: "办成了,东西在响应体里。",
    scene: (
      <>
        <code>GET /products/42</code> 成功返回商品 JSON —— API
        世界的日常,你见得最多的就是它。
      </>
    ),
  },
  {
    code: 201,
    text: "Created",
    human: "新资源造好了。",
    scene: (
      <>
        POST 创建成功的标准答复。讲究的服务器还会带一个{" "}
        <code>Location</code> 头,告诉你新资源住在哪(比如{" "}
        <code>/products/43</code>)。
      </>
    ),
  },
  {
    code: 204,
    text: "No Content",
    human: "办成了,但没什么要给你的。",
    scene: (
      <>
        DELETE 成功、PUT 更新成功的常见答复 —— 响应<b>没有正文</b>。
        千万别再对它调 <code>res.json()</code>,会解析出一个错来。
      </>
    ),
  },
  {
    code: 301,
    text: "Moved Permanently",
    human: "这地址永久搬家了。",
    scene: (
      <>
        新地址写在 <code>Location</code> 头里,浏览器和多数客户端会自动跟过去。
        老 API 停服、域名迁移时常见 —— 有些被弃用的 API 就是先给你回 301,
        再引到一页「此版本已弃用」。
      </>
    ),
  },
  {
    code: 304,
    text: "Not Modified",
    human: "你缓存的那份还新鲜,我不重发了。",
    scene: (
      <>
        前提是你带了 <code>If-None-Match</code>(值是上次拿到的 ETag 指纹)。
        服务器一比对,资源没变,只回一句「没变」,正文全省 ——
        省流量利器,第 05 章细讲。
      </>
    ),
  },
  {
    code: 400,
    text: "Bad Request",
    human: "你这请求我读不懂。",
    scene: (
      <>
        JSON 少个引号、参数类型不对、该有的字段没有 —— 都是它。
        看到 400,先低头检查自己发出去的东西。
      </>
    ),
  },
  {
    code: 401,
    text: "Unauthorized",
    human: "你是谁?没带(或带错)通行证。",
    scene: (
      <>
        名字叫 Unauthorized,真实含义其实是「未认证」:凭证缺失、
        过期或无效。响应会附 <code>WWW-Authenticate</code> 头提示怎么认证 ——
        带上有效 token 再来,有救。
      </>
    ),
  },
  {
    code: 403,
    text: "Forbidden",
    human: "认识你,但你不许进。",
    scene: (
      <>
        凭证没问题、身份很明确,就是权限不够 —— 重新登录也没用。
        和 401 是两回事,右边的警告牌单独说它俩。
      </>
    ),
  },
  {
    code: 404,
    text: "Not Found",
    human: "查无此物。",
    scene: (
      <>
        URL 打错、资源被删,都是它。另外留个心眼:有些 API 会拿 404
        <b>掩盖 403</b>,不让你探知「这东西存在但你没权限」—— GitHub API
        就这么干。
      </>
    ),
  },
  {
    code: 405,
    text: "Method Not Allowed",
    human: "这地址在,但不吃你这个方法。",
    scene: (
      <>
        比如对一个只读资源发 DELETE。规范要求响应带 <code>Allow</code> 头
        (如 <code>Allow: GET, HEAD</code>),明说这里支持什么。
      </>
    ),
  },
  {
    code: 409,
    text: "Conflict",
    human: "和资源现在的状态打架了。",
    scene: (
      <>
        重复创建同名资源、两个人同时改一条数据撞了版本 —— 都是它。
        解法通常是先拉最新状态,再重试。
      </>
    ),
  },
  {
    code: 422,
    text: "Unprocessable Content",
    human: "格式读懂了,但内容说不通。",
    scene: (
      <>
        典型:字段校验失败 —— 邮箱少了 @、年龄填了 -3。和 400 的分工:
        400 是「读不懂」,422 是「读懂了但办不了」。
      </>
    ),
  },
  {
    code: 429,
    text: "Too Many Requests",
    human: "你问得太勤了,歇会儿。",
    scene: (
      <>
        触发了限流(rate limit)。响应常带 <code>Retry-After</code>{" "}
        头告诉你几秒后再来 —— 写循环调用和爬虫时,最容易撞见的就是它。
      </>
    ),
  },
  {
    code: 500,
    text: "Internal Server Error",
    human: "我这边出错了,不怪你。",
    scene: (
      <>
        服务器代码自己崩了。作为调用方,你改请求没用 ——
        能做的是重试、上报,或者去催后端同事。
      </>
    ),
  },
  {
    code: 502,
    text: "Bad Gateway",
    human: "我是个二传手,后面那位给的答复没法用。",
    scene: (
      <>
        网关/反向代理从上游服务拿到了无效响应 ——
        常见剧情:后端真身崩了,门口的网关还活着,只好替它道歉。
      </>
    ),
  },
  {
    code: 503,
    text: "Service Unavailable",
    human: "暂时服务不了:过载或维护中。",
    scene: (
      <>
        和 502 的区别:这是服务器<b>主动</b>说「现在不行」,
        而不是二传失败。也常配 <code>Retry-After</code>,过会儿再来。
      </>
    ),
  },
];

export function StatusExplorer() {
  const [sel, setSel] = useState(0);
  const st = STATUSES[sel];

  return (
    <div className="ht-st">
      <div className="ht-st-grid" role="group" aria-label="状态码格子墙">
        {STATUSES.map((s, i) => (
          <button
            key={s.code}
            type="button"
            data-x={Math.floor(s.code / 100)}
            className={`ht-st-cell${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            <b>{s.code}</b>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
      <div className="ht-st-detail" aria-live="polite">
        <div className="ht-st-detail-head">
          <Status code={st.code} text={st.text} />
        </div>
        <p className="ht-st-human">「{st.human}」</p>
        <p className="ht-st-scene">{st.scene}</p>
      </div>
    </div>
  );
}
