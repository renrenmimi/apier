"use client";

// 05 · REST in production 专属可视化(双语,英文默认):
//  - HeroUtils:hero 里的六项机制进场动画(纯 CSS)。
//  - PagingStepper:offset vs cursor 分页逐帧对照(深翻页塌陷 / 插入错位 / 书签接续)。
//  - UrlDissect:一条长 URL 逐段点击拆解(过滤/排序/裁剪/分页)。
//  - EtagFlow:ETag 重新校验逐帧动画(200+ETag → If-None-Match → 304)。
//  - IdemFlow:幂等键逐帧动画(超时重试不重复扣款)。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { useState, type ReactNode } from "react";
import { FlowStepper, type FlowFrame } from "@/lib/stepper";
import { useL, type Loc } from "@/lib/i18n";

/* ================= HeroUtils ================= */

const UTILS: { ico: string; label: Loc<string>; sub: Loc<string> }[] = [
  {
    ico: "🚰",
    label: { en: "Pagination", zh: "分页" },
    sub: { en: "One page at a time", zh: "一次只给一页" },
  },
  {
    ico: "⚡",
    label: { en: "Caching", zh: "缓存" },
    sub: { en: "Do not send the same body twice", zh: "同一份正文不发两遍" },
  },
  {
    ico: "🔥",
    label: { en: "Idempotency", zh: "幂等" },
    sub: { en: "Retry without paying twice", zh: "重试不会扣两次" },
  },
  {
    ico: "🏷️",
    label: { en: "Versioning", zh: "版本化" },
    sub: { en: "Change without breaking clients", zh: "改接口不砸老客户端" },
  },
  {
    ico: "🚦",
    label: { en: "Rate limits", zh: "限流" },
    sub: { en: "Refuse clearly when overloaded", zh: "过载时明确地拒绝" },
  },
  {
    ico: "📐",
    label: { en: "OpenAPI", zh: "OpenAPI" },
    sub: { en: "A description machines can read", zh: "机器能读的接口定义" },
  },
];

export function HeroUtils() {
  const L = useL();
  return (
    <div className="ra-utils" aria-hidden>
      {UTILS.map((u, i) => (
        <div
          key={u.ico}
          className="ra-util"
          style={{ animationDelay: `${120 + i * 110}ms` }}
        >
          <span className="ico">{u.ico}</span>
          <span>
            {L(u.label)}
            <small>{L(u.sub)}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================= PagingStepper ================= */

type CellSt = "take" | "skip" | "dup" | "new" | undefined;

interface PgFrame {
  mode: "OFFSET" | "CURSOR";
  url?: string;
  time?: { label: string; bad?: boolean };
  /** 队首插入了新记录 #0 */
  inserted?: boolean;
  /** 游标钉在哪条记录上 */
  mark?: number;
  st?: Record<number, CellSt>;
  /** 「…」尾巴亮起(表示数据库正在数后面的几十万行) */
  tailLit?: boolean;
  msg: Loc<ReactNode>;
}

const PG_FRAMES: PgFrame[] = [
  {
    mode: "OFFSET",
    msg: {
      en: (
        <>
          The table holds one million posts. The client asks for 3 per page (3
          keeps this picture small; real APIs usually return 20 to 100). Offset
          pagination answers the request directly: <b>skip the first N rows,
          then return the next 3</b>. Watch the row number under each cell —
          that position is the only thing offset pagination knows about a
          record.
        </>
      ),
      zh: (
        <>
          库里躺着一百万篇文章,客户端要求每页 3 条(演示用,真实世界一般
          20–100)。offset 分页的思路最直白:<b>跳过前 N 行,再给接下来 3 行</b>
          。注意每格下面的行号 —— 这个「位置」就是 offset
          分页对一条记录知道的全部。
        </>
      ),
    },
  },
  {
    mode: "OFFSET",
    url: "GET /posts?page=1&per_page=3",
    time: { label: "3 ms" },
    st: { 1: "take", 2: "take", 3: "take" },
    msg: {
      en: (
        <>
          Page 1: skip 0 rows, return #1 to #3. The database reads the index and
          stops. Near the start of a list, offset pagination has no problem at
          all.
        </>
      ),
      zh: (
        <>
          第 1 页:跳过 0 行,取 #1–#3。数据库沿索引一摸就到。
          在列表开头翻页时,offset 一点毛病都没有。
        </>
      ),
    },
  },
  {
    mode: "OFFSET",
    url: "GET /posts?page=300000&per_page=3",
    time: { label: "1.8 s", bad: true },
    st: {
      1: "skip",
      2: "skip",
      3: "skip",
      4: "skip",
      5: "skip",
      6: "skip",
      7: "skip",
      8: "skip",
      9: "skip",
    },
    tailLit: true,
    msg: {
      en: (
        <>
          Page 300000: the database has to <b>walk over 899,997 rows and throw
          them away</b> before it reaches the 3 rows you asked for. Every row it
          counts is wasted work, so the deeper the page, the slower the request.
        </>
      ),
      zh: (
        <>
          第 300000 页:数据库要先<b>逐行走过 899,997 行并全部丢弃</b>
          ,才能取到你要的那 3 条。数过的行都是白干的活,页码越深越慢。
        </>
      ),
    },
  },
  {
    mode: "OFFSET",
    inserted: true,
    st: { 0: "new" },
    msg: {
      en: (
        <>
          There is a second problem. You have just read page 1 (#1 to #3). Now
          someone publishes a new post, <b>#0</b>, and it goes to the front of
          the list. Look at the row numbers: <b>every record moved down one
          position</b>.
        </>
      ),
      zh: (
        <>
          还有第二个问题。你刚看完第 1 页(#1–#3),这时有人发了一篇新文章
          <b> #0</b>,排到了队首 —— 看下面的行号,
          <b>每条记录都往后挪了一位</b>。
        </>
      ),
    },
  },
  {
    mode: "OFFSET",
    url: "GET /posts?page=2&per_page=3",
    inserted: true,
    st: { 3: "dup", 4: "take", 5: "take" },
    msg: {
      en: (
        <>
          Page 2 means rows 4 to 6, which are now #3, #4 and #5. You already saw{" "}
          <b>#3 on page 1, so it appears twice</b>. A deletion does the opposite:
          the records move up, and one of them is skipped without anyone
          noticing. Offset pagination points at a position, and positions move.
        </>
      ),
      zh: (
        <>
          翻第 2 页 = 要第 4–6 行 = 现在的 #3、#4、#5。可 <b>#3
          在第 1 页已经看过了 —— 重复</b>。删除则相反:记录整体前移,
          有一条会被悄悄跳过,谁都不会发现。offset 指的是位置,而位置会动。
        </>
      ),
    },
  },
  {
    mode: "CURSOR",
    mark: 3,
    st: { 1: "take", 2: "take", 3: "take" },
    msg: {
      en: (
        <>
          Cursor pagination (also called keyset pagination) points at a{" "}
          <b>record</b> instead. Page 1 returns #1 to #3 and one extra value:{" "}
          <code>starting_after=post_3</code>, meaning &ldquo;you have read up to
          post_3&rdquo;. Treat a cursor as an opaque string. Do not parse it or
          build one yourself.
        </>
      ),
      zh: (
        <>
          cursor(游标)分页换了个对象:它指向一条<b>记录</b>。第 1 页除了
          #1–#3,还会多给一个值 <code>starting_after=post_3</code>
          ,意思是「你已经读到 post_3」。游标是不透明字符串,
          既不要去解析它,也不要自己拼一个。
        </>
      ),
    },
  },
  {
    mode: "CURSOR",
    url: "GET /posts?limit=3&starting_after=post_3",
    time: { label: "4 ms" },
    mark: 3,
    st: { 4: "take", 5: "take", 6: "take" },
    msg: {
      en: (
        <>
          Next page: the server uses the cursor to find post_3 <b>through the
          index</b> and reads the 3 records after it. No rows are counted and
          discarded, so page 300000 costs about the same as page 2. The price
          for that: there is no page number, so you cannot jump straight to page
          8. You can only ask for the next page.
        </>
      ),
      zh: (
        <>
          下一页:服务器拿游标<b>走索引直接定位</b>到 post_3,取它后面 3
          条(#4–#6),前面的行一行都不用数,所以第 300000 页和第 2
          页耗时接近。代价是:没有页码,你没法直接跳到第 8 页,只能一页页往下要。
        </>
      ),
    },
  },
  {
    mode: "CURSOR",
    inserted: true,
    mark: 3,
    st: { 0: "new", 4: "take", 5: "take", 6: "take" },
    msg: {
      en: (
        <>
          Now insert #0 again. Nothing changes. The cursor is attached to the
          record post_3, not to &ldquo;row 4&rdquo;, so the continuation point
          does not move: nothing is repeated and nothing is skipped. This is how
          Stripe&apos;s list endpoints work.
        </>
      ),
      zh: (
        <>
          这时再插入 #0,毫无影响。游标钉在 post_3 这条<b>记录</b>上,
          而不是「第 4 行」这个<b>位置</b>上,接续点纹丝不动,不重不漏。
          Stripe 的列表接口就是这么翻页的。
        </>
      ),
    },
  },
];

function PgStage({ f }: { f: PgFrame }) {
  const L = useL();
  const ids = f.inserted
    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <div className="ra-pg">
      <div className="ra-pg-top">
        <span className="chip" data-tone={f.mode === "OFFSET" ? "warn" : "ok"}>
          {f.mode}
        </span>
        {f.url && <code className="ra-pg-url">{f.url}</code>}
        {f.time && (
          <span className={`ra-pg-time${f.time.bad ? " bad" : ""}`}>
            ⏱ {f.time.label}
          </span>
        )}
      </div>
      <div className="ra-pg-rows">
        {ids.map((id, i) => (
          <div key={id} className="ra-pgcell" data-st={f.st?.[id]}>
            #{id}
            {f.mark === id && (
              <span className="ra-pgcell-mark" aria-hidden>
                🔖
              </span>
            )}
            <span className="ra-pgcell-pos">
              {L({ en: `row ${i + 1}`, zh: `行${i + 1}` })}
            </span>
          </div>
        ))}
        <div className={`ra-pgcell ra-pgcell-tail${f.tailLit ? " lit" : ""}`}>
          …
          <span className="ra-pgcell-pos">
            {L({ en: "+900k", zh: "99 万+" })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PagingStepper() {
  const frames: FlowFrame[] = PG_FRAMES.map((f) => ({
    stage: <PgStage f={f} />,
    msg: f.msg,
  }));
  return (
    <FlowStepper
      title={{
        en: "Two ways to paginate: offset counts rows, a cursor points at a record",
        zh: "分页两条路:offset 数行号,cursor 钉记录(逐帧)",
      }}
      frames={frames}
    />
  );
}

/* ================= UrlDissect ================= */

interface UrlSeg {
  code: string;
  tag: Loc<string>;
  info: Loc<ReactNode>;
}

const URL_SEGS: UrlSeg[] = [
  {
    code: "/posts",
    tag: { en: "Resource", zh: "资源" },
    info: {
      en: (
        <>
          The path still names the resource: the collection of posts. Everything
          after it describes <b>how you want that collection</b> — which items,
          in which order, with which fields, and which page. However many
          parameters you add, the URL still points at the same collection.
        </>
      ),
      zh: (
        <>
          路径指的仍然是资源本身:文章集合。后面那一长串参数描述的是
          <b>你想怎么要这个集合</b> —— 要哪些、什么顺序、带哪些字段、取哪一页。
          参数再多,这条 URL 指向的还是同一个集合。
        </>
      ),
    },
  },
  {
    code: "status=published",
    tag: { en: "Filtering", zh: "过滤 filter" },
    info: {
      en: (
        <>
          <b>Filtering</b> narrows the collection: only published posts. Using
          the field name as the parameter name is the most common convention.
          Add another condition with <code>&</code>, for example{" "}
          <code>&author=42</code>. Conditions written this way are combined with
          &ldquo;and&rdquo;.
        </>
      ),
      zh: (
        <>
          <b>过滤(filter)</b>把集合收窄:只要已发布的文章。
          直接拿字段名当参数名是最常见的约定;多加一个条件就再 <code>&</code>{" "}
          一个,比如 <code>&author=42</code>。这样写出来的条件之间是「并且」。
        </>
      ),
    },
  },
  {
    code: "sort=-created_at",
    tag: { en: "Sorting", zh: "排序 sort" },
    info: {
      en: (
        <>
          <b>Sorting</b>: by creation time, newest first. The leading{" "}
          <code>-</code> means descending. That is the JSON:API convention;
          other APIs write <code>sort=created_at&order=desc</code> for the same
          thing. Neither form is required by a standard, so read the API
          documentation.
        </>
      ),
      zh: (
        <>
          <b>排序(sort)</b>:按创建时间倒序,最新在前。前缀 <code>-</code>{" "}
          表示降序 —— 这是 JSON:API 的约定;也有 API 写成{" "}
          <code>sort=created_at&order=desc</code>,一个意思。
          两种写法都不是标准强制的,以文档为准。
        </>
      ),
    },
  },
  {
    code: "fields=title,likes",
    tag: { en: "Field selection", zh: "字段裁剪" },
    info: {
      en: (
        <>
          <b>Field selection</b> (JSON:API calls it sparse fieldsets): each post
          in the response carries only <code>title</code> and <code>likes</code>
          , not the body or the comments. This matters on a slow mobile
          connection. The client is choosing the shape of the response, which is
          exactly what GraphQL is built around — chapter 07.
        </>
      ),
      zh: (
        <>
          <b>字段裁剪</b>(JSON:API 叫 sparse fieldsets):响应里每篇文章只带{" "}
          <code>title</code> 和 <code>likes</code>,正文和评论都不带 ——
          在移动端弱网下差别很明显。这已经是「由客户端决定响应的形状」,
          而 GraphQL 整个设计就围绕这件事,第 07 章会讲。
        </>
      ),
    },
  },
  {
    code: "page=2&per_page=10",
    tag: { en: "Pagination", zh: "分页" },
    info: {
      en: (
        <>
          <b>Pagination</b>: page 2, 10 items per page — the offset style from
          §01. The four kinds of parameter combine freely. A server usually
          applies them in this order: filter the rows, sort them, cut out the
          page, then drop the fields that were not requested.
        </>
      ),
      zh: (
        <>
          <b>分页</b>:第 2 页,每页 10 条 —— 就是 §01 的 offset 风格。
          这四类参数可以自由组合。服务器通常按这个顺序处理:先过滤、再排序、
          再切出这一页、最后去掉没被要求的字段。
        </>
      ),
    },
  },
];

export function UrlDissect() {
  const L = useL();
  const [sel, setSel] = useState(1);
  const seg = URL_SEGS[sel];

  return (
    <div className="ra-url">
      <div className="ra-url-win">
        <div className="codewin-bar">
          <span className="codewin-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="codewin-name">
            {L({
              en: "One long URL — click any part",
              zh: "一条长 URL · 点每一段试试",
            })}
          </span>
          <span style={{ width: 47 }} aria-hidden />
        </div>
        <div className="ra-url-line">
          <span className="ra-url-meth">GET</span>{" "}
          {URL_SEGS.map((s, i) => (
            <span key={s.code}>
              {i === 1 && <span className="ra-url-sep">?</span>}
              {i > 1 && <span className="ra-url-sep">&</span>}
              <button
                type="button"
                className={`ra-url-seg${sel === i ? " on" : ""}`}
                onClick={() => setSel(i)}
              >
                {s.code}
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="ra-url-info" aria-live="polite">
        <span className="chip">{L(seg.tag)}</span>
        <p>{L(seg.info)}</p>
      </div>
    </div>
  );
}

/* ================= EtagFlow ================= */

interface EtagFrameDef {
  packet?: Loc<string>;
  back?: boolean;
  litClient?: boolean;
  litServer?: boolean;
  /** 浏览器缓存芯片内容;undefined = 空缓存 */
  cache?: Loc<string>;
  cacheLit?: boolean;
  /** 服务器侧资源指纹 */
  ver: string;
  verLit?: boolean;
  msg: Loc<ReactNode>;
}

const ETAG_FRAMES: EtagFrameDef[] = [
  {
    packet: "GET /users/42",
    litClient: true,
    ver: '"abc"',
    msg: {
      en: (
        <>
          First request. The browser has no copy of this resource, so it asks
          for the whole thing. This is an ordinary GET, with no caching headers
          on it yet.
        </>
      ),
      zh: (
        <>
          第一次请求。浏览器手里没有这个资源的任何副本,只能要全量数据 ——
          一条普通的 GET,还没有任何缓存相关的头。
        </>
      ),
    },
  },
  {
    packet: {
      en: '200 + ETag: "abc" + 2 KB body',
      zh: '200 + ETag: "abc" + 2 KB 正文',
    },
    back: true,
    litServer: true,
    ver: '"abc"',
    verLit: true,
    msg: {
      en: (
        <>
          The server returns the body and adds a version identifier:{" "}
          <b>ETag: &quot;abc&quot;</b>. The value changes when the
          representation changes. The browser does not need to know how the
          server computes it; it only needs to store it and send it back later.
        </>
      ),
      zh: (
        <>
          服务器返回正文,并加上一个版本标识:<b>ETag: &quot;abc&quot;</b> ——
          表述变了,这个值就会变。浏览器不需要知道它是怎么算出来的,
          存下来、以后原样带回去就行。
        </>
      ),
    },
  },
  {
    litClient: true,
    cache: { en: 'body + "abc"', zh: '正文 + "abc"' },
    cacheLit: true,
    ver: '"abc"',
    msg: {
      en: (
        <>
          The browser stores the body together with the ETag. So far it has
          transferred the same 2 KB as it would without an ETag. Nothing has
          been saved yet — the saving happens on the next request.
        </>
      ),
      zh: (
        <>
          浏览器把正文和 ETag 一起存进缓存。到这里传输量还是 2 KB,
          跟没有 ETag 时一样,一点也没省 —— 省在下一次。
        </>
      ),
    },
  },
  {
    packet: 'GET + If-None-Match: "abc"',
    litClient: true,
    cache: { en: 'body + "abc"', zh: '正文 + "abc"' },
    ver: '"abc"',
    msg: {
      en: (
        <>
          The browser needs the resource again. Instead of asking for it
          outright, it sends the stored ETag back in <code>If-None-Match</code>:
          &ldquo;mine is &quot;abc&quot; — send the body only if it is now
          something else.&rdquo; A request that carries a validator like this is
          called a <b>conditional request</b>.
        </>
      ),
      zh: (
        <>
          浏览器又要这个资源了。它不直接要正文,而是把存下的 ETag 放进{" "}
          <code>If-None-Match</code> 带回去:「我手上是 &quot;abc&quot;,
          如果现在不是它,再把正文给我。」带着这类校验值的请求叫
          <b>条件请求(conditional request)</b>。
        </>
      ),
    },
  },
  {
    packet: {
      en: "304 Not Modified (0 bytes of body)",
      zh: "304 Not Modified(正文 0 字节)",
    },
    back: true,
    litServer: true,
    cache: { en: 'body + "abc"', zh: '正文 + "abc"' },
    cacheLit: true,
    ver: '"abc"',
    verLit: true,
    msg: {
      en: (
        <>
          The ETag still matches, so the server answers{" "}
          <b>304 Not Modified with no body</b> — headers only. The browser
          serves the copy it already had. The body that was never sent is where
          the whole saving comes from.
        </>
      ),
      zh: (
        <>
          ETag 对得上,服务器回 <b>304 Not Modified,不带正文</b>,只有头部。
          浏览器直接用缓存里那份。省下来的,正是这次没有传输的正文。
        </>
      ),
    },
  },
  {
    packet: {
      en: '200 + ETag: "xyz" + new body',
      zh: '200 + ETag: "xyz" + 新正文',
    },
    back: true,
    litServer: true,
    cache: { en: 'body + "xyz"', zh: '正文 + "xyz"' },
    cacheLit: true,
    ver: '"xyz"',
    verLit: true,
    msg: {
      en: (
        <>
          When the resource does change, the ETag no longer matches, so the
          server answers 200 with the new body and a new ETag, and the browser
          replaces its copy. The client writes no extra code for any of this:{" "}
          <b>a GET and its URL already form a cache key</b>, so browsers,
          proxies, and CDNs can all take part.
        </>
      ),
      zh: (
        <>
          等资源真的变了,ETag 对不上,服务器就回 200 + 新正文 + 新
          ETag,浏览器替换掉旧副本。这一整套客户端不用写任何额外代码:
          <b>一次 GET 加它的 URL 本身就是缓存键</b>,浏览器、代理、CDN
          都能参与进来。
        </>
      ),
    },
  },
];

function EtagStage({ f }: { f: EtagFrameDef }) {
  const L = useL();
  return (
    <div className="ra-duo">
      <div className="ra-duo-side">
        <div className={`flow-node${f.litClient ? " lit" : ""}`}>
          <span className="ico">🖥️</span>
          {L({ en: "Browser", zh: "浏览器" })}
        </div>
        <div className={`ra-sidechip${f.cacheLit ? " lit" : ""}`}>
          {L({ en: "Cache: ", zh: "缓存:" })}
          {f.cache ? L(f.cache) : L({ en: "empty", zh: "空" })}
        </div>
      </div>
      <div className="flow-mid ra-duo-mid">
        <div className="flow-line" />
        {f.packet && (
          <span className={`flow-packet${f.back ? " back" : ""}`}>
            {L(f.packet)}
          </span>
        )}
      </div>
      <div className="ra-duo-side">
        <div className={`flow-node${f.litServer ? " lit" : ""}`}>
          <span className="ico">🗄️</span>
          {L({ en: "Server", zh: "服务器" })}
        </div>
        <div className={`ra-sidechip${f.verLit ? " lit" : ""}`}>
          {L({ en: "Current ETag: ", zh: "当前 ETag:" })}
          {f.ver}
        </div>
      </div>
    </div>
  );
}

export function EtagFlow() {
  const frames: FlowFrame[] = ETAG_FRAMES.map((f) => ({
    stage: <EtagStage f={f} />,
    msg: f.msg,
  }));
  return (
    <FlowStepper
      title={{
        en: "Revalidating with an ETag: take the tag, then ask with it",
        zh: "用 ETag 重新校验:先拿到标识,再带着它问",
      }}
      frames={frames}
    />
  );
}

/* ================= IdemFlow ================= */

interface IdemFrameDef {
  /** 1 = 没有幂等键的那一幕,2 = 带幂等键的那一幕 */
  act: 1 | 2;
  packet?: Loc<string>;
  back?: boolean;
  /** 响应在半路丢了 */
  lost?: boolean;
  litClient?: boolean;
  litServer?: boolean;
  /** 客户端状态芯片 */
  client?: { label: Loc<string>; tone?: "bad" | "ok" };
  /** 已扣款次数 */
  charged: number;
  /** 服务器记录 */
  ledger?: Loc<string>;
  ledgerLit?: boolean;
  msg: Loc<ReactNode>;
}

const ACT_LABEL: Record<1 | 2, Loc<string>> = {
  1: { en: "Act 1 · No idempotency key", zh: "第一幕 · 没有幂等键" },
  2: { en: "Act 2 · With an idempotency key", zh: "第二幕 · 带上幂等键" },
};

const LEDGER_ROW: Loc<string> = {
  en: "pay-7f3a → charged $99, order #661",
  zh: "pay-7f3a → 已扣款 $99,订单 #661",
};

const IDEM_FRAMES: IdemFrameDef[] = [
  {
    act: 1,
    packet: "POST /payments $99",
    litServer: true,
    charged: 1,
    msg: {
      en: (
        <>
          You tap &ldquo;Pay $99&rdquo;. The request arrives, and the server
          really does charge the card. Up to this point everything is correct.
        </>
      ),
      zh: (
        <>
          你点了「支付 $99」。请求顺利到达,服务器也确实扣了款 ——
          到这一步为止一切正常。
        </>
      ),
    },
  },
  {
    act: 1,
    packet: "200 OK",
    back: true,
    lost: true,
    client: { label: { en: "⏳ Timed out…", zh: "⏳ 超时…" }, tone: "bad" },
    charged: 1,
    msg: {
      en: (
        <>
          The response is lost on the way back. The client sees only a timeout,
          and it <b>cannot tell</b> whether the payment failed or succeeded with
          the answer lost. Retrying may charge the card twice. Not retrying may
          lose the order. Neither choice is safe.
        </>
      ),
      zh: (
        <>
          响应在回程丢了。客户端只看到超时,它<b>分不清</b>
          是「没办成」还是「办成了但答复丢了」。重试可能扣两次,
          不重试可能丢单 —— 两条路都不安全。
        </>
      ),
    },
  },
  {
    act: 2,
    packet: "POST /payments + Idempotency-Key: pay-7f3a",
    litClient: true,
    charged: 0,
    msg: {
      en: (
        <>
          Start again. This time the client first generates a key that is unique
          to this one operation — a random UUID is enough — and sends it in the{" "}
          <b>Idempotency-Key</b> header.
        </>
      ),
      zh: (
        <>
          重来一次。这次客户端先为这一笔操作生成一个唯一的键(随机 UUID
          就够),放进 <b>Idempotency-Key</b> 头一起发出去。
        </>
      ),
    },
  },
  {
    act: 2,
    litServer: true,
    charged: 1,
    ledger: LEDGER_ROW,
    ledgerLit: true,
    msg: {
      en: (
        <>
          Before doing anything, the server looks the key up. pay-7f3a is new,
          so it charges the card once and <b>stores the key together with the
          response it produced</b>.
        </>
      ),
      zh: (
        <>
          服务器动手之前先查这个键:pay-7f3a 没见过,于是正常扣款一次,
          并把<b>这个键和它产生的响应一起记下来</b>。
        </>
      ),
    },
  },
  {
    act: 2,
    packet: "200 OK",
    back: true,
    lost: true,
    client: {
      label: { en: "⏳ Timed out again", zh: "⏳ 又超时了" },
      tone: "bad",
    },
    charged: 1,
    ledger: LEDGER_ROW,
    msg: {
      en: (
        <>
          The response is lost again. This time the client is not stuck: it
          resends the same request with <b>the same key</b>.
        </>
      ),
      zh: (
        <>
          响应又丢了。但这次客户端不必纠结:<b>用同一个键</b>
          把同一个请求原样重发就行。
        </>
      ),
    },
  },
  {
    act: 2,
    packet: "POST /payments + Idempotency-Key: pay-7f3a (retry)",
    litServer: true,
    charged: 1,
    ledger: LEDGER_ROW,
    ledgerLit: true,
    msg: {
      en: (
        <>
          The server looks the key up again: pay-7f3a is <b>already
          recorded</b>. It does not touch the card. It returns the stored
          response from the first attempt.
        </>
      ),
      zh: (
        <>
          服务器再查一次:pay-7f3a <b>已经有记录了</b>。
          它不再碰这张卡,直接把第一次存下的响应原样返回。
        </>
      ),
    },
  },
  {
    act: 2,
    packet: { en: "200 Payment succeeded", zh: "200 「支付成功」" },
    back: true,
    litClient: true,
    client: {
      label: { en: "✅ Payment confirmed", zh: "✅ 支付成功" },
      tone: "ok",
    },
    charged: 1,
    ledger: LEDGER_ROW,
    msg: {
      en: (
        <>
          The client finally receives the confirmation. The request was sent
          twice and the card was charged <b>once</b>. One header turns a POST,
          which is not idempotent by itself, into an operation the client can
          retry safely.
        </>
      ),
      zh: (
        <>
          客户端终于收到确认。请求发了两次,款只扣了<b>一次</b>。
          一个请求头,就把本身不幂等的 POST 变成了可以安全重试的操作。
        </>
      ),
    },
  },
];

function IdemStage({ f }: { f: IdemFrameDef }) {
  const L = useL();
  return (
    <div className="ra-idem">
      <div className="ra-idem-top">
        <span className="chip" data-tone={f.act === 1 ? "warn" : "ok"}>
          {L(ACT_LABEL[f.act])}
        </span>
      </div>
      <div className="ra-duo">
        <div className="ra-duo-side">
          <div className={`flow-node${f.litClient ? " lit" : ""}`}>
            <span className="ico">📱</span>
            {L({ en: "Client", zh: "客户端" })}
          </div>
          <div
            className={`ra-sidechip${
              f.client ? ` ${f.client.tone === "ok" ? "ok" : "bad"}` : ""
            }`}
          >
            {f.client
              ? L(f.client.label)
              : L({ en: "Waiting for a response…", zh: "等待响应…" })}
          </div>
        </div>
        <div className="flow-mid ra-duo-mid">
          <div className="flow-line" />
          {f.packet && (
            <span
              className={`flow-packet${f.back ? " back" : ""}${
                f.lost ? " ra-lost" : ""
              }`}
            >
              {f.lost ? "✕ " : ""}
              {L(f.packet)}
            </span>
          )}
        </div>
        <div className="ra-duo-side">
          <div className={`flow-node${f.litServer ? " lit" : ""}`}>
            <span className="ico">🏦</span>
            {L({ en: "Payment server", zh: "支付服务器" })}
          </div>
          <div className={`ra-sidechip${f.charged > 1 ? " bad" : ""}`}>
            {L({ en: "Charged: ", zh: "已扣款:" })}$99 × {f.charged}
          </div>
        </div>
      </div>
      <div className={`ra-ledger${f.ledgerLit ? " lit" : ""}`}>
        📒 {L({ en: "Server record: ", zh: "服务器记录:" })}
        {f.ledger ? L(f.ledger) : L({ en: "(empty)", zh: "(空)" })}
      </div>
    </div>
  );
}

export function IdemFlow() {
  const frames: FlowFrame[] = IDEM_FRAMES.map((f) => ({
    stage: <IdemStage f={f} />,
    msg: f.msg,
  }));
  return (
    <FlowStepper
      title={{
        en: "An idempotency key: retry after a timeout, charge once",
        zh: "幂等键:超时后重试,只扣一次款",
      }}
      frames={frames}
    />
  );
}
