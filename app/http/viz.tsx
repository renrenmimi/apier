"use client";

// 第 01 章专属可视化:
//  - HeroLetter:hero 里那封「写给服务器的信」(纯装饰)。
//  - UrlAnatomy:URL 解剖台 —— 逐段点击,右侧讲解(承自序章 JsonAnatomy 的交互)。
//  - MethodPicker:「场景选方法」小练习,点选即判,答错给针对性解释。
//  - StatusExplorer:状态码格子墙,点一个看「通俗解释 + 典型场景」。
// 所有文案都是双语:模块级常量里用 { en, zh },组件里用 useL() 解析。

import { useState, type ReactNode } from "react";
import { Method, Status, type HttpMethod } from "@/lib/kit";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroLetter ================= */

export function HeroLetter() {
  return (
    <div className="ht-letter" aria-hidden>
      <div className="ht-letter-stamp">HTTP/1.1</div>
      <div className="ht-letter-row">
        <span className="ht-letter-code start">GET /products/42 HTTP/1.1</span>
        <span className="ht-letter-tag">
          <T en="Request line" zh="起始行 · 信封上那句话" />
        </span>
      </div>
      <div className="ht-letter-row">
        <span className="ht-letter-code">Host: api.shop.com</span>
        <span className="ht-letter-tag">
          <T en="Which server" zh="收件人" />
        </span>
      </div>
      <div className="ht-letter-row">
        <span className="ht-letter-code">Accept: application/json</span>
        <span className="ht-letter-tag">
          <T en="Header" zh="信纸抬头" />
        </span>
      </div>
      <div className="ht-letter-row blank">
        <span className="ht-letter-code dim">
          <T en="(blank line)" zh="(空行)" />
        </span>
        <span className="ht-letter-tag">
          <T en="End of the headers" zh="抬头与正文的分界" />
        </span>
      </div>
      <div className="ht-letter-row">
        <span className="ht-letter-code dim">
          <T
            en="(body — a GET request has none)"
            zh="(正文 —— 这封信不用带)"
          />
        </span>
        <span className="ht-letter-tag">
          <T en="Body" zh="信的内容" />
        </span>
      </div>
    </div>
  );
}

/* ================= UrlAnatomy ================= */

interface UrlSeg {
  k: string;
  s: string;
  name: Loc<string>;
  info: Loc<ReactNode>;
}

const URL_SEGS: UrlSeg[] = [
  {
    k: "proto",
    s: "https://",
    name: { en: "Scheme (protocol)", zh: "协议(scheme)" },
    info: {
      en: (
        <>
          The scheme says <b>how the message is sent</b>. <code>http</code>{" "}
          sends plain text, so any device along the path can read it or change
          it. <code>https</code> is the same HTTP wrapped in TLS: the connection
          is encrypted, and the server&apos;s certificate lets the client check
          that it reached the right server. TLS does not identify the user, and
          it does not protect the data once the server has it. Almost every
          public API today is https only, because requests usually carry a
          token.
        </>
      ),
      zh: (
        <>
          scheme 说明这条报文<b>怎么传</b>。<code>http</code>{" "}
          是明文,链路上的任何设备都能读、都能改;<code>https</code> 是把同样的
          HTTP 装进 TLS:连接被加密,服务器的证书还能让客户端确认自己连对了机器。
          TLS 不负责证明「用户是谁」,也保护不了数据进入服务器之后的安全。
          今天的公开 API 基本只提供 https —— 毕竟请求里常常带着 token。
        </>
      ),
    },
  },
  {
    k: "host",
    s: "api.shop.com",
    name: { en: "Host (domain name)", zh: "域名(host)" },
    info: {
      en: (
        <>
          The host says <b>which server</b> receives the request. DNS translates
          this name into an IP address. The <code>api.</code> prefix is a common
          convention: the web pages live on <code>www.</code>, and the API gets
          its own subdomain.
        </>
      ),
      zh: (
        <>
          host 说明这条报文<b>送到哪台服务器</b>。DNS 负责把这串人类能记住的名字
          翻译成 IP 地址。开头的 <code>api.</code> 是行业惯例:网页放在{" "}
          <code>www.</code>,API 单独用一个子域名。
        </>
      ),
    },
  },
  {
    k: "ver",
    s: "/v1",
    name: { en: "Path · version", zh: "路径 · 版本号" },
    info: {
      en: (
        <>
          The first path segment. This API puts its <b>version number</b> here.
          When a change would break existing clients, the new version goes to
          /v2 and old clients keep using /v1. A version can also be carried in a
          header instead. Chapter 05 covers versioning.
        </>
      ),
      zh: (
        <>
          路径的第一段,这家 API 用它放<b>版本号</b>。
          将来某次改动会让老客户端用不了,就把新版本放到 /v2,老客户端继续用
          /v1。版本也可以放在 header 里,第 05 章细讲。
        </>
      ),
    },
  },
  {
    k: "coll",
    s: "/products",
    name: { en: "Path · collection", zh: "路径 · 资源集合" },
    info: {
      en: (
        <>
          A collection of resources: <b>all products</b>. The name is a plural
          noun. There is no verb in the path, because the verb is the HTTP
          method: <code>GET /products</code> means read the products. Section 03
          covers methods.
        </>
      ),
      zh: (
        <>
          一个资源集合:<b>所有商品</b>。名字是名词复数。
          路径里没有动词,因为动词由 HTTP 方法承担:<code>GET /products</code>{" "}
          就是「读商品」。§03 马上讲方法。
        </>
      ),
    },
  },
  {
    k: "id",
    s: "/42",
    name: { en: "Path · resource id", zh: "路径 · 资源 ID" },
    info: {
      en: (
        <>
          <b>One item</b> inside the collection. Read <code>/products/42</code>{" "}
          as &ldquo;product 42&rdquo;. <code>/users/7</code> is user 7. This
          collection-then-id pattern appears in almost every HTTP API.
        </>
      ),
      zh: (
        <>
          集合里的<b>具体某一个</b>。<code>/products/42</code> 读作
          「42 号商品」,<code>/users/7</code> 就是「7 号用户」。
          这套「集合 / 编号」的路径写法,你在真实 API 里会见到无数次。
        </>
      ),
    },
  },
  {
    k: "q1",
    s: "?sort=price",
    name: { en: "Query string", zh: "查询字符串(query string)" },
    info: {
      en: (
        <>
          The <code>?</code> marks the start of the query string.{" "}
          <code>sort=price</code> asks for the results sorted by price. The
          query string is <b>part of the URL</b>, so two different query strings
          are two different URLs and are cached separately. In most APIs it
          carries options for the same collection: sorting, filtering, and
          paging.
        </>
      ),
      zh: (
        <>
          <code>?</code> 之后是查询字符串。<code>sort=price</code>{" "}
          表示按价格排序。查询字符串<b>属于 URL 的一部分</b>
          ,所以两组不同的参数就是两条不同的 URL,缓存也分开算。在大多数 API 里,
          它承载的是同一个集合上的附加选项:排序、筛选、分页。
        </>
      ),
    },
  },
  {
    k: "q2",
    s: "&limit=10",
    name: { en: "A second parameter", zh: "第二个查询参数" },
    info: {
      en: (
        <>
          Parameters after the first are joined with <code>&amp;</code>.{" "}
          <code>limit=10</code> asks for ten items instead of the whole
          collection. Each parameter is one <code>key=value</code> pair, and the
          server reads them by name, so their order does not matter.
        </>
      ),
      zh: (
        <>
          第二个及以后的参数用 <code>&amp;</code> 串起来。<code>limit=10</code>{" "}
          表示只要 10 条,别把整个集合都搬来。每个参数就是一组{" "}
          <code>键=值</code>,服务器按名字取,顺序无所谓。
        </>
      ),
    },
  },
];

export function UrlAnatomy() {
  const L = useL();
  const [sel, setSel] = useState(3);
  const seg = URL_SEGS[sel];

  return (
    <div className="ht-url">
      <div
        className="ht-url-bar"
        role="group"
        aria-label={L({ en: "The parts of a URL", zh: "URL 分段解剖" })}
      >
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
          <b>{L(seg.name)}</b>
        </div>
        <p>{L(seg.info)}</p>
      </div>
    </div>
  );
}

/* ================= MethodPicker ================= */

const MP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface MpScenario {
  id: string;
  q: Loc<ReactNode>;
  answer: HttpMethod;
  why: Loc<ReactNode>;
  wrong: Partial<Record<HttpMethod, Loc<ReactNode>>>;
}

const MP_SCENARIOS: MpScenario[] = [
  {
    id: "view",
    q: {
      en: <>Open a product page and show the details of product 42.</>,
      zh: <>打开商品详情页,展示 42 号商品的信息。</>,
    },
    answer: "GET",
    why: {
      en: (
        <>
          This only reads data. GET is safe and idempotent, so reloading the
          page a hundred times changes nothing.
        </>
      ),
      zh: (
        <>
          这只是读取数据。GET 安全又幂等,页面刷新一百次也不会出事。
        </>
      ),
    },
    wrong: {
      POST: {
        en: (
          <>
            POST sends data for the server to process. Here there is nothing to
            send; the client only wants to read.
          </>
        ),
        zh: <>POST 是「把数据交给服务器处理」。这里没有数据要交,只是想读。</>,
      },
      PUT: {
        en: (
          <>
            PUT replaces the resource with the body you send. Nothing is being
            changed here.
          </>
        ),
        zh: <>PUT 会用你的请求体整体替换资源 —— 这里压根没打算改它。</>,
      },
      PATCH: {
        en: <>PATCH changes some fields. This request changes no field at all.</>,
        zh: <>PATCH 是改几个字段用的 —— 这里一个字段都不动,纯读。</>,
      },
      DELETE: {
        en: (
          <>
            DELETE removes the product. Opening a page must not delete anything.
          </>
        ),
        zh: <>DELETE 会真的删掉这件商品 —— 打开详情页不该产生删除动作。</>,
      },
    },
  },
  {
    id: "signup",
    q: {
      en: <>A user fills in the form and creates a new account.</>,
      zh: <>用户填完表单,注册一个新账号。</>,
    },
    answer: "POST",
    why: {
      en: (
        <>
          The new account has no id yet; the server assigns it. Creating
          something new is what POST is for, and a successful create usually
          answers 201 Created.
        </>
      ),
      zh: (
        <>
          新账号还没有 id,得由服务器分配。「创建一个新的」是 POST 的活,
          成功通常回 201 Created。
        </>
      ),
    },
    wrong: {
      GET: {
        en: (
          <>
            GET is safe, so it must not create an account. The form data would
            also go into the URL, and the password would be written into the
            server logs.
          </>
        ),
        zh: (
          <>
            GET 是安全方法,不该造出新账号;而且表单数据得塞进 URL,
            密码会原样写进服务器日志。
          </>
        ),
      },
      PUT: {
        en: (
          <>
            PUT puts a resource at an address you already know. A new account
            has no address yet, so the server has to assign one. That is POST.
          </>
        ),
        zh: (
          <>
            PUT 适合「往已知地址放一份资源」。新账号连地址(id)都还没有,
            要服务器来分配 —— 这是 POST 的活。
          </>
        ),
      },
      PATCH: {
        en: (
          <>There is no account yet, so there is nothing to change partially.</>
        ),
        zh: <>账号还不存在,谈不上「部分修改」—— 先得有,才能改。</>,
      },
      DELETE: {
        en: <>DELETE removes an account. This request creates one.</>,
        zh: <>DELETE 是注销账号,方向反了。</>,
      },
    },
  },
  {
    id: "replace",
    q: {
      en: <>Replace the whole profile of user 42 with a new, complete one.</>,
      zh: <>把 42 号用户的整份资料,用新的一份完整覆盖。</>,
    },
    answer: "PUT",
    why: {
      en: (
        <>
          Replacing the resource at a known address is exactly what PUT means.
          It is also idempotent: sending the same profile twice leaves the same
          state.
        </>
      ),
      zh: (
        <>
          「整体替换已知地址上的资源」正是 PUT 的语义。
          而且它幂等:同一份资料放两次,状态一样。
        </>
      ),
    },
    wrong: {
      PATCH: {
        en: (
          <>
            PATCH changes only the fields you send. This task replaces the whole
            profile.
          </>
        ),
        zh: <>PATCH 只改你传的那几个字段。这里要的是整份覆盖。</>,
      },
      POST: {
        en: (
          <>
            POST is not idempotent, so a repeated request can create a second
            record. For replacing a resource that already exists, PUT states the
            intent exactly.
          </>
        ),
        zh: (
          <>
            POST 不幂等,重复提交可能多出一条数据。
            覆盖一个已存在的资源,PUT 的语义更准。
          </>
        ),
      },
      GET: {
        en: <>GET only reads. It cannot change anything.</>,
        zh: <>GET 只读,改不了任何东西。</>,
      },
      DELETE: {
        en: <>This replaces the profile. DELETE would remove user 42 entirely.</>,
        zh: <>这是覆盖,不是清除 —— DELETE 会让 42 号直接消失。</>,
      },
    },
  },
  {
    id: "nickname",
    q: {
      en: (
        <>
          A user wants to change only the nickname and leave every other field
          as it is.
        </>
      ),
      zh: <>用户只想改个昵称,其他字段一律不动。</>,
    },
    answer: "PATCH",
    why: {
      en: (
        <>
          This is a partial change, which is what PATCH is for. The body carries
          only <code>nickname</code>, and the other fields stay as they are.
        </>
      ),
      zh: (
        <>
          这是部分修改,正是 PATCH 的本职:请求体里只带 <code>nickname</code>{" "}
          一个字段,其他原样保留。
        </>
      ),
    },
    wrong: {
      PUT: {
        en: (
          <>
            A PUT that carries only the nickname replaces the whole resource, so{" "}
            <b>the other fields are removed</b>. This is a common way to lose
            data by accident — see the warning in section 03.
          </>
        ),
        zh: (
          <>
            用 PUT 只传昵称,按语义是整体替换,<b>其他字段会被清掉</b> ——
            这是新手弄丢数据最常见的原因,§03 的警告牌就是为它立的。
          </>
        ),
      },
      POST: {
        en: <>Nothing new is created here. This edits an existing user.</>,
        zh: <>不是要造新用户,是修改一个已有的 —— 创建才找 POST。</>,
      },
      GET: {
        en: <>GET cannot change any value.</>,
        zh: <>GET 连一个字符都改不了。</>,
      },
      DELETE: {
        en: <>The nickname changes; the account stays.</>,
        zh: <>昵称是要改,不是要销号。</>,
      },
    },
  },
  {
    id: "remove",
    q: {
      en: <>A moderator removes a comment that breaks the rules.</>,
      zh: <>管理员删除一条违规评论。</>,
    },
    answer: "DELETE",
    why: {
      en: (
        <>
          Removing a resource is what DELETE means. It is idempotent: after one
          delete or two the comment is gone, so retrying after a timeout is
          safe.
        </>
      ),
      zh: (
        <>
          让资源消失正是 DELETE 的语义。它还幂等:删一次和删两次,
          评论都是没了,超时重试也不慌。
        </>
      ),
    },
    wrong: {
      POST: {
        en: (
          <>
            Older APIs do use <code>POST /comments/7/delete</code>, usually
            because some clients could not send DELETE. DELETE states the intent
            directly.
          </>
        ),
        zh: (
          <>
            确实有老 API 写成 <code>POST /comments/7/delete</code>,
            多半是因为当年有些客户端发不了 DELETE。语义上 DELETE 才是正牌。
          </>
        ),
      },
      GET: {
        en: (
          <>
            Using GET to delete has caused real incidents: a crawler follows
            every link, and the data disappears page by page. GET must not
            change anything.
          </>
        ),
        zh: (
          <>
            用 GET 干删除是真实发生过的事故:爬虫顺着链接一路「读」,
            数据一路没 —— GET 必须无害,这是铁律。
          </>
        ),
      },
      PUT: {
        en: <>PUT replaces the comment with new content. The task is to remove it.</>,
        zh: <>PUT 是用新内容替换这条评论。这里要的是让它消失。</>,
      },
      PATCH: {
        en: <>PATCH edits fields and the comment stays. The task is to remove it.</>,
        zh: <>PATCH 改完字段,评论还在。你要的是「没了」。</>,
      },
    },
  },
];

export function MethodPicker() {
  const L = useL();
  const [picks, setPicks] = useState<Record<string, HttpMethod>>({});
  const solved = MP_SCENARIOS.filter((s) => picks[s.id] === s.answer).length;

  return (
    <div className="viz ht-mp">
      <div className="viz-title">
        <T
          en="Pick the method: five situations"
          zh="场景选方法:五道现场判断题"
        />
        <span className="mono dim ht-mp-score">
          <T
            en={<>{solved} / {MP_SCENARIOS.length} correct</>}
            zh={<>答对 {solved} / {MP_SCENARIOS.length}</>}
          />
        </span>
      </div>
      <div className="ht-mp-list">
        {MP_SCENARIOS.map((sc, i) => {
          const picked = picks[sc.id];
          const isRight = picked === sc.answer;
          return (
            <div key={sc.id} className={`ht-mp-item${isRight ? " solved" : ""}`}>
              <p className="ht-mp-q">
                <span className="ht-mp-n">{i + 1}</span>
                {L(sc.q)}
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
                      onClick={() => setPicks((p) => ({ ...p, [sc.id]: m }))}
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
                    <>✓ {L(sc.why)}</>
                  ) : (
                    <>
                      ✕ {L(sc.wrong[picked] ?? sc.why)}
                      <span className="ht-mp-again">
                        <T
                          en="Try another method — one of them is right."
                          zh="换一个方法再试试 —— 答案就在里面。"
                        />
                      </span>
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
  /** 原因短语是协议的一部分,两种语言都保持英文原文 */
  text: string;
  human: Loc<string>;
  scene: Loc<ReactNode>;
}

const STATUSES: StatusInfo[] = [
  {
    code: 200,
    text: "OK",
    human: {
      en: "It worked, and the result is in the body.",
      zh: "「办成了,东西在响应体里。」",
    },
    scene: {
      en: (
        <>
          <code>GET /products/42</code> returns the product as JSON. This is the
          most common response in any API.
        </>
      ),
      zh: (
        <>
          <code>GET /products/42</code> 成功返回商品 JSON —— API
          世界的日常,你见得最多的就是它。
        </>
      ),
    },
  },
  {
    code: 201,
    text: "Created",
    human: { en: "A new resource was created.", zh: "「新资源已创建。」" },
    scene: {
      en: (
        <>
          The standard answer to a successful POST. The response should carry a{" "}
          <code>Location</code> header with the address of the new resource, for
          example <code>/products/43</code>.
        </>
      ),
      zh: (
        <>
          POST 创建成功的标准答复。响应应该带一个 <code>Location</code> 头,
          给出新资源的地址(比如 <code>/products/43</code>)。
        </>
      ),
    },
  },
  {
    code: 204,
    text: "No Content",
    human: {
      en: "It worked, and there is nothing to send back.",
      zh: "「办成了,但没有内容要给你。」",
    },
    scene: {
      en: (
        <>
          A common answer to a successful DELETE or PUT. The response{" "}
          <b>has no body</b>. Do not call <code>res.json()</code> on it —
          parsing an empty body throws an error.
        </>
      ),
      zh: (
        <>
          DELETE 成功、PUT 更新成功的常见答复。响应<b>没有正文</b>,
          所以别对它调 <code>res.json()</code> —— 解析空正文会抛错。
        </>
      ),
    },
  },
  {
    code: 301,
    text: "Moved Permanently",
    human: {
      en: "This address has moved permanently.",
      zh: "「这个地址永久搬家了。」",
    },
    scene: {
      en: (
        <>
          The new address is in the <code>Location</code> header, and browsers
          and most clients follow it automatically. Watch the method: with 301
          and 302, clients have historically changed the follow-up request to
          GET. 308 and 307 were defined to keep the original method and body.
        </>
      ),
      zh: (
        <>
          新地址写在 <code>Location</code> 头里,浏览器和多数客户端会自动跟过去。
          注意方法:遇到 301 和 302,客户端历史上会把后续请求改成 GET;
          308 和 307 就是为了「保持原方法和原正文」才定义出来的。
        </>
      ),
    },
  },
  {
    code: 304,
    text: "Not Modified",
    human: {
      en: "Your cached copy is still current, so I am not sending it again.",
      zh: "「你缓存的那份还新鲜,我就不重发了。」",
    },
    scene: {
      en: (
        <>
          This requires the request to carry <code>If-None-Match</code> with the
          ETag from the previous response. The server compares them, finds no
          change, and answers 304 with no body. Chapter 05 covers this in
          detail.
        </>
      ),
      zh: (
        <>
          前提是请求带了 <code>If-None-Match</code>(值是上次拿到的 ETag)。
          服务器一比对,资源没变,就只回一句「没变」,正文全省 ——
          第 05 章细讲。
        </>
      ),
    },
  },
  {
    code: 400,
    text: "Bad Request",
    human: {
      en: "I cannot understand this request.",
      zh: "「你这请求我读不懂。」",
    },
    scene: {
      en: (
        <>
          A missing quote in the JSON, a parameter of the wrong type, a required
          field that is absent. When you see 400, check what you sent.
        </>
      ),
      zh: (
        <>
          JSON 少个引号、参数类型不对、该有的字段没有 —— 都是它。
          看到 400,先检查自己发出去的东西。
        </>
      ),
    },
  },
  {
    code: 401,
    text: "Unauthorized",
    human: {
      en: "Who are you? The credential is missing or invalid.",
      zh: "「你是谁?凭证没带,或者带错了。」",
    },
    scene: {
      en: (
        <>
          The name says Unauthorized, but the meaning is &ldquo;not
          authenticated&rdquo;: the credential is missing, expired, or invalid.
          The response must carry a <code>WWW-Authenticate</code> header saying
          how to authenticate. Send a valid token and the request can succeed.
        </>
      ),
      zh: (
        <>
          名字叫 Unauthorized,真实含义其实是「未认证」:凭证缺失、过期或无效。
          规范要求响应必须带 <code>WWW-Authenticate</code> 头,说明该怎么认证 ——
          带上有效凭证再来,请求就能成功。
        </>
      ),
    },
  },
  {
    code: 403,
    text: "Forbidden",
    human: {
      en: "I know who you are, and you are not allowed.",
      zh: "「认识你,但你不许。」",
    },
    scene: {
      en: (
        <>
          The credential is valid and the identity is clear; the permission is
          missing. Logging in again does not help. The warning box below
          compares 403 with 401.
        </>
      ),
      zh: (
        <>
          凭证没问题、身份很明确,就是权限不够,重新登录也没用。
          下面的警告牌专门比较它和 401。
        </>
      ),
    },
  },
  {
    code: 404,
    text: "Not Found",
    human: { en: "There is nothing here.", zh: "「查无此物。」" },
    scene: {
      en: (
        <>
          A wrong URL, or a resource that was deleted. Also note: some APIs
          answer 404 where <b>403 would be correct</b>, so that you cannot find
          out that the resource exists. The GitHub API does this for private
          repositories.
        </>
      ),
      zh: (
        <>
          URL 打错、资源被删,都是它。另外留个心眼:有些 API 会在该回 403 的地方
          <b>回 404</b>,不让你探知「这东西存在但你没权限」—— GitHub API 就这么干。
        </>
      ),
    },
  },
  {
    code: 405,
    text: "Method Not Allowed",
    human: {
      en: "The address exists, but not with this method.",
      zh: "「地址在,但不接受这个方法。」",
    },
    scene: {
      en: (
        <>
          For example, sending DELETE to a read-only resource. The response must
          include an <code>Allow</code> header listing the supported methods,
          such as <code>Allow: GET, HEAD</code>.
        </>
      ),
      zh: (
        <>
          比如对一个只读资源发 DELETE。规范要求响应必须带 <code>Allow</code> 头,
          列出支持的方法(例如 <code>Allow: GET, HEAD</code>)。
        </>
      ),
    },
  },
  {
    code: 409,
    text: "Conflict",
    human: {
      en: "This conflicts with the current state of the resource.",
      zh: "「和资源现在的状态冲突了。」",
    },
    scene: {
      en: (
        <>
          Creating a resource whose unique name is taken, or two clients editing
          the same record and hitting a version conflict. The usual fix is to
          read the current state and try again.
        </>
      ),
      zh: (
        <>
          创建一个重名的唯一资源,或者两个客户端同时改一条数据撞了版本 ——
          都是它。解法通常是先拉最新状态,再重试。
        </>
      ),
    },
  },
  {
    code: 422,
    text: "Unprocessable Content",
    human: {
      en: "I understood the format, but the content does not make sense.",
      zh: "「格式读懂了,内容说不通。」",
    },
    scene: {
      en: (
        <>
          Typically a validation failure: an email address without{" "}
          <code>@</code>, an age of -3. Compare with 400: 400 means the request
          could not be parsed, 422 means it was parsed and the values were
          rejected.
        </>
      ),
      zh: (
        <>
          典型是字段校验失败:邮箱少了 <code>@</code>、年龄填了 -3。和 400 的分工:
          400 是「解析不了」,422 是「解析出来了,但值不合法」。
        </>
      ),
    },
  },
  {
    code: 429,
    text: "Too Many Requests",
    human: {
      en: "You are sending too many requests.",
      zh: "「你请求得太频繁了。」",
    },
    scene: {
      en: (
        <>
          A rate limit was reached. The response often carries{" "}
          <code>Retry-After</code>, which says how long to wait. Loops and
          crawlers meet this one first.
        </>
      ),
      zh: (
        <>
          触发了限流(rate limit)。响应常带 <code>Retry-After</code> 头,
          告诉你等多久再来 —— 写循环调用和爬虫时最容易撞见它。
        </>
      ),
    },
  },
  {
    code: 500,
    text: "Internal Server Error",
    human: {
      en: "Something failed on my side.",
      zh: "「我这边出错了,不怪你。」",
    },
    scene: {
      en: (
        <>
          The server code raised an error. Changing your request will not help.
          You can retry, report it, or fix the server.
        </>
      ),
      zh: (
        <>
          服务器代码自己抛错了。作为调用方,你改请求没用 ——
          能做的是重试、上报,或者去修服务端。
        </>
      ),
    },
  },
  {
    code: 502,
    text: "Bad Gateway",
    human: {
      en: "I am a proxy, and the server behind me gave an invalid reply.",
      zh: "「我只是个中转,后面那台给的响应没法用。」",
    },
    scene: {
      en: (
        <>
          A gateway or reverse proxy received an invalid response from the
          upstream server. A related code is 504 Gateway Timeout, which means
          the upstream did not answer in time.
        </>
      ),
      zh: (
        <>
          网关或反向代理从上游服务拿到了无效响应。相近的还有 504 Gateway
          Timeout:上游在规定时间内根本没回话。
        </>
      ),
    },
  },
  {
    code: 503,
    text: "Service Unavailable",
    human: {
      en: "Temporarily unable to serve: overloaded or under maintenance.",
      zh: "「暂时服务不了:过载或维护中。」",
    },
    scene: {
      en: (
        <>
          The difference from 502: here the server itself reports that it cannot
          serve right now, rather than a proxy failing to get a usable answer.
          It often carries <code>Retry-After</code> as well.
        </>
      ),
      zh: (
        <>
          和 502 的区别:这是服务器<b>自己</b>说「现在不行」,
          而不是中转拿不到可用的响应。它也常带 <code>Retry-After</code>。
        </>
      ),
    },
  },
];

export function StatusExplorer() {
  const L = useL();
  const [sel, setSel] = useState(0);
  const st = STATUSES[sel];

  return (
    <div className="ht-st">
      <div
        className="ht-st-grid"
        role="group"
        aria-label={L({ en: "Status codes", zh: "状态码格子墙" })}
      >
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
        <p className="ht-st-human">{L(st.human)}</p>
        <p className="ht-st-scene">{L(st.scene)}</p>
      </div>
    </div>
  );
}
