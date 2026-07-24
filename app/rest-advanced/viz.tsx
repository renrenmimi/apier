"use client";

// 05 · REST 进阶模式 专属可视化:
//  - HeroUtils:hero 里的「毛坯房通水电」进场动画(纯 CSS)。
//  - PagingStepper:offset vs cursor 分页逐帧对照(深翻页塌陷 / 插入错位 / 书签接续)。
//  - UrlDissect:一条长 URL 逐段点击拆解(过滤/排序/裁剪/分页)。
//  - EtagFlow:ETag 协商缓存逐帧动画(200+ETag → If-None-Match → 304)。
//  - IdemFlow:幂等键逐帧动画(超时重试不重复扣款)。

import { useState, type ReactNode } from "react";
import { FlowStepper, type FlowFrame } from "@/lib/stepper";

/* ================= HeroUtils ================= */

const UTILS = [
  { ico: "🚰", label: "分页", sub: "水:一次一杯" },
  { ico: "⚡", label: "缓存", sub: "电:别重复烧" },
  { ico: "🔥", label: "幂等", sub: "燃气:重试不炸锅" },
  { ico: "🏷️", label: "版本", sub: "门牌:改建不换址" },
  { ico: "🚦", label: "限流", sub: "电闸:过载就跳" },
  { ico: "📐", label: "OpenAPI", sub: "图纸:机器能读" },
];

export function HeroUtils() {
  return (
    <div className="ra-utils" aria-hidden>
      {UTILS.map((u, i) => (
        <div
          key={u.label}
          className="ra-util"
          style={{ animationDelay: `${120 + i * 110}ms` }}
        >
          <span className="ico">{u.ico}</span>
          <span>
            {u.label}
            <small>{u.sub}</small>
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
  /** 书签钉在哪条记录上 */
  mark?: number;
  st?: Record<number, CellSt>;
  /** 「…」尾巴亮起(表示数据库正在数后面的几十万行) */
  tailLit?: boolean;
  msg: ReactNode;
}

const PG_FRAMES: PgFrame[] = [
  {
    mode: "OFFSET",
    msg: (
      <>
        库里躺着一百万篇文章,客户端说:每页给我 3 条(演示用,真实世界一般
        20–100)。offset 的思路最直白:<b>「跳过前 N 行,给我接下来 3 行」</b>
        。注意每格下面的「行号」—— 它是 offset 的全部世界观。
      </>
    ),
  },
  {
    mode: "OFFSET",
    url: "GET /posts?page=1&per_page=3",
    time: { label: "3 ms" },
    st: { 1: "take", 2: "take", 3: "take" },
    msg: (
      <>
        第 1 页:跳过 0 行,取 #1–#3。索引一摸就到,快得很 ——
        浅翻页时 offset 一点毛病没有。
      </>
    ),
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
    msg: (
      <>
        第 300000 页:数据库要先<b>老老实实数过 899,997 行、全部扔掉</b>
        ,才能取出那 3 条。数过的行 = 白干的活,页码越深越慢 ——
        这就是深翻页的性能塌陷。
      </>
    ),
  },
  {
    mode: "OFFSET",
    inserted: true,
    st: { 0: "new" },
    msg: (
      <>
        另一个坑:你刚看完第 1 页(#1–#3),这时有人发了篇新文章
        <b> #0</b>,插到队首 —— 看下面的行号,
        <b>所有记录都被往后挤了一位</b>。
      </>
    ),
  },
  {
    mode: "OFFSET",
    url: "GET /posts?page=2&per_page=3",
    inserted: true,
    st: { 3: "dup", 4: "take", 5: "take" },
    msg: (
      <>
        翻第 2 页 = 要「第 4–6 行」= 现在的 #3、#4、#5。可 <b>#3
        你在第 1 页已经看过了 —— 重复!</b>反过来,如果有人删了一条,
        就会有一条被悄悄跳过 —— 漏掉。offset 认「位置」,位置会动。
      </>
    ),
  },
  {
    mode: "CURSOR",
    mark: 3,
    st: { 1: "take", 2: "take", 3: "take" },
    msg: (
      <>
        cursor(游标)换个思路:第 1 页除了 #1–#3,响应里还给你一枚
        <b>书签</b> —— <code>starting_after=post_3</code>
        ,意思是「你读到 post_3 了」。书签是不透明字符串,别去猜里面是什么。
      </>
    ),
  },
  {
    mode: "CURSOR",
    url: "GET /posts?limit=3&starting_after=post_3",
    time: { label: "4 ms" },
    mark: 3,
    st: { 4: "take", 5: "take", 6: "take" },
    msg: (
      <>
        下一页:服务器拿书签走索引<b>直接定位</b>到
        post_3,取它后面 3 条(#4–#6)—— 前面的行一行都不用数。
        翻到第一百万行,速度也是这样。
      </>
    ),
  },
  {
    mode: "CURSOR",
    inserted: true,
    mark: 3,
    st: { 0: "new", 4: "take", 5: "take", 6: "take" },
    msg: (
      <>
        这时插入 #0?无所谓。书签钉在 post_3 这条<b>记录</b>上,
        不是「第 4 行」这个<b>位置</b>上 —— 接续点纹丝不动,不重不漏。
        Stripe 全家的 API 都这么翻页。
      </>
    ),
  },
];

function PgStage({ f }: { f: PgFrame }) {
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
            <span className="ra-pgcell-pos">行{i + 1}</span>
          </div>
        ))}
        <div className={`ra-pgcell ra-pgcell-tail${f.tailLit ? " lit" : ""}`}>
          …<span className="ra-pgcell-pos">99 万+</span>
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
      title="分页两条路:offset 数行号,cursor 钉书签(逐帧)"
      frames={frames}
    />
  );
}

/* ================= UrlDissect ================= */

interface UrlSeg {
  code: string;
  tag: string;
  info: ReactNode;
}

const URL_SEGS: UrlSeg[] = [
  {
    code: "/posts",
    tag: "资源",
    info: (
      <>
        主语还是资源:文章集合。后面那一长串 query
        参数全是「修饰语」—— 过滤哪些、什么顺序、带哪些字段、取哪一页。
        修饰语再多,主语不变,URL 依然指向同一个集合。
      </>
    ),
  },
  {
    code: "status=published",
    tag: "过滤 filter",
    info: (
      <>
        <b>过滤(filter)</b>:只要已发布的。字段名直接当参数名,
        是最常见的约定;多个条件就再 & 一个,比如{" "}
        <code>&author=42</code> —— 条件之间是「并且」的关系。
      </>
    ),
  },
  {
    code: "sort=-created_at",
    tag: "排序 sort",
    info: (
      <>
        <b>排序(sort)</b>:按创建时间<b>倒序</b>,最新在前 —— 前缀{" "}
        <code>-</code> 表示「倒过来」,这是 JSON:API 的约定。也有 API 写成{" "}
        <code>sort=created_at&order=desc</code>,一个意思,读文档为准。
      </>
    ),
  },
  {
    code: "fields=title,likes",
    tag: "字段裁剪",
    info: (
      <>
        <b>字段裁剪(sparse fieldsets)</b>:响应里每篇文章只带 title 和
        likes 两个字段,正文、评论统统不要 —— 移动端弱网的救星。
        是不是有点「按需点菜」的味道?GraphQL 把这件事做到了极致,第 07 章见。
      </>
    ),
  },
  {
    code: "page=2&per_page=10",
    tag: "分页",
    info: (
      <>
        <b>分页(pagination)</b>:第 2 页,每页 10 条 —— §01
        刚讲过的 offset 风格。四类参数可以自由组合,
        服务器按「先过滤 → 再排序 → 再切页 → 最后裁字段」的顺序处理。
      </>
    ),
  },
];

export function UrlDissect() {
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
          <span className="codewin-name">一条长 URL · 点每一段试试</span>
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
        <span className="chip">{seg.tag}</span>
        <p>{seg.info}</p>
      </div>
    </div>
  );
}

/* ================= EtagFlow ================= */

interface EtagFrameDef {
  packet?: string;
  back?: boolean;
  litClient?: boolean;
  litServer?: boolean;
  /** 浏览器缓存芯片内容;undefined = 空缓存 */
  cache?: string;
  cacheLit?: boolean;
  /** 服务器侧资源指纹 */
  ver: string;
  verLit?: boolean;
  msg: ReactNode;
}

const ETAG_FRAMES: EtagFrameDef[] = [
  {
    packet: "GET /users/42",
    litClient: true,
    ver: '"abc"',
    msg: (
      <>
        第一次见面:浏览器手里什么都没有,老老实实要全量数据 ——
        一个普普通通的 GET。
      </>
    ),
  },
  {
    packet: '200 + ETag:"abc" + 2 KB 正文',
    back: true,
    litServer: true,
    ver: '"abc"',
    verLit: true,
    msg: (
      <>
        服务器给正文,顺手盖了个「版本指纹」:<b>ETag: "abc"</b> ——
        内容变了,指纹才会变。怎么算的?浏览器不需要懂,收好就行。
      </>
    ),
  },
  {
    litClient: true,
    cache: '正文 + "abc"',
    cacheLit: true,
    ver: '"abc"',
    msg: (
      <>
        浏览器把「正文 + 指纹」一起收进缓存。到这里花的流量:2 KB,
        跟没有 ETag 时一模一样 —— 红利在下一次。
      </>
    ),
  },
  {
    packet: 'GET + If-None-Match:"abc"',
    litClient: true,
    cache: '正文 + "abc"',
    ver: '"abc"',
    msg: (
      <>
        第二次要同一资源,浏览器带上指纹问:「我手里是 "abc",变了吗?」
        —— 这叫<b>条件请求(conditional request)</b>,协商缓存的问句。
      </>
    ),
  },
  {
    packet: "304 Not Modified(0 B)",
    back: true,
    litServer: true,
    cache: '正文 + "abc"',
    cacheLit: true,
    ver: '"abc"',
    verLit: true,
    msg: (
      <>
        指纹对上了 → <b>304,一个字节的正文都不传</b>。
        浏览器直接用缓存里的旧正文 —— 内容一致,流量趋近于零。
      </>
    ),
  },
  {
    packet: '200 + ETag:"xyz" + 新正文',
    back: true,
    litServer: true,
    cache: '正文 + "xyz"',
    cacheLit: true,
    ver: '"xyz"',
    verLit: true,
    msg: (
      <>
        哪天资源真变了,指纹对不上 → 老老实实回 200 + 新正文 + 新指纹,
        缓存换新。整套机制客户端零配置 —— <b>GET + URL 天然是缓存键</b>
        ,这是 REST 的巨大红利。
      </>
    ),
  },
];

function EtagStage({ f }: { f: EtagFrameDef }) {
  return (
    <div className="ra-duo">
      <div className="ra-duo-side">
        <div className={`flow-node${f.litClient ? " lit" : ""}`}>
          <span className="ico">🖥️</span>
          浏览器
        </div>
        <div className={`ra-sidechip${f.cacheLit ? " lit" : ""}`}>
          缓存:{f.cache ?? "空"}
        </div>
      </div>
      <div className="flow-mid ra-duo-mid">
        <div className="flow-line" />
        {f.packet && (
          <span className={`flow-packet${f.back ? " back" : ""}`}>
            {f.packet}
          </span>
        )}
      </div>
      <div className="ra-duo-side">
        <div className={`flow-node${f.litServer ? " lit" : ""}`}>
          <span className="ico">🗄️</span>
          服务器
        </div>
        <div className={`ra-sidechip${f.verLit ? " lit" : ""}`}>
          资源指纹:{f.ver}
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
      title="ETag 协商缓存:先拿指纹,再带指纹问(逐帧)"
      frames={frames}
    />
  );
}

/* ================= IdemFlow ================= */

interface IdemFrameDef {
  scene: "第一幕 · 没有幂等键" | "第二幕 · 带上幂等键";
  packet?: string;
  back?: boolean;
  /** 响应在半路丢了 */
  lost?: boolean;
  litClient?: boolean;
  litServer?: boolean;
  /** 客户端状态芯片 */
  client?: { label: string; tone?: "bad" | "ok" };
  /** 已扣款次数 */
  charged: number;
  /** 账本条目 */
  ledger?: string;
  ledgerLit?: boolean;
  msg: ReactNode;
}

const IDEM_FRAMES: IdemFrameDef[] = [
  {
    scene: "第一幕 · 没有幂等键",
    packet: "POST /payments ¥99",
    litServer: true,
    charged: 1,
    msg: (
      <>
        你点了「支付 ¥99」。请求顺利到达,服务器也真扣了款 ——
        到这里一切正常。
      </>
    ),
  },
  {
    scene: "第一幕 · 没有幂等键",
    packet: "200 OK",
    back: true,
    lost: true,
    client: { label: "⏳ 超时…", tone: "bad" },
    charged: 1,
    msg: (
      <>
        但响应在回程丢了。客户端只看到「超时」,它<b>分不清</b>
        是「没办成」还是「办成了但没听见答复」。重发?可能扣两次。
        不重发?可能丢单。两头都是坑 —— 无解。
      </>
    ),
  },
  {
    scene: "第二幕 · 带上幂等键",
    packet: "POST /payments + Idempotency-Key: pay-7f3a",
    litClient: true,
    charged: 0,
    msg: (
      <>
        重开一局。这次客户端先生成一个唯一键(随机 UUID 就行),放进{" "}
        <b>Idempotency-Key</b> 头,随请求出发。
      </>
    ),
  },
  {
    scene: "第二幕 · 带上幂等键",
    litServer: true,
    charged: 1,
    ledger: "pay-7f3a → 已扣款 ¥99,订单 #661",
    ledgerLit: true,
    msg: (
      <>
        服务器先翻账本:pay-7f3a?没见过 → 正常扣款,
        并把「这个 key + 处理结果」记进账本。
      </>
    ),
  },
  {
    scene: "第二幕 · 带上幂等键",
    packet: "200 OK",
    back: true,
    lost: true,
    client: { label: "⏳ 又超时了", tone: "bad" },
    charged: 1,
    ledger: "pay-7f3a → 已扣款 ¥99,订单 #661",
    msg: (
      <>
        响应又双叒丢了(演示需要,见谅)。但这次客户端心里有底:
        <b>同一个 key,原样重发就是了</b>,天塌不下来。
      </>
    ),
  },
  {
    scene: "第二幕 · 带上幂等键",
    packet: "POST /payments + Idempotency-Key: pay-7f3a(重试)",
    litServer: true,
    charged: 1,
    ledger: "pay-7f3a → 已扣款 ¥99,订单 #661",
    ledgerLit: true,
    msg: (
      <>
        服务器再翻账本:pay-7f3a?<b>办过了!</b>这次碰都不碰银行卡,
        直接把上次记下的结果取出来,原样回给你。
      </>
    ),
  },
  {
    scene: "第二幕 · 带上幂等键",
    packet: "200 「支付成功」",
    back: true,
    litClient: true,
    client: { label: "✅ 支付成功", tone: "ok" },
    charged: 1,
    ledger: "pay-7f3a → 已扣款 ¥99,订单 #661",
    msg: (
      <>
        客户端终于收到「支付成功」。重试了两次,<b>扣款只有一次</b> ——
        非幂等的 POST,被一枚小小的 key 改造成了可安全重试的操作。
      </>
    ),
  },
];

function IdemStage({ f }: { f: IdemFrameDef }) {
  return (
    <div className="ra-idem">
      <div className="ra-idem-top">
        <span className="chip" data-tone={f.scene.startsWith("第一幕") ? "warn" : "ok"}>
          {f.scene}
        </span>
      </div>
      <div className="ra-duo">
        <div className="ra-duo-side">
          <div className={`flow-node${f.litClient ? " lit" : ""}`}>
            <span className="ico">📱</span>
            客户端
          </div>
          <div
            className={`ra-sidechip${
              f.client ? ` ${f.client.tone === "ok" ? "ok" : "bad"}` : ""
            }`}
          >
            {f.client?.label ?? "等待响应…"}
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
              {f.packet}
            </span>
          )}
        </div>
        <div className="ra-duo-side">
          <div className={`flow-node${f.litServer ? " lit" : ""}`}>
            <span className="ico">🏦</span>
            支付服务器
          </div>
          <div className={`ra-sidechip${f.charged > 1 ? " bad" : ""}`}>
            已扣款:¥99 × {f.charged}
          </div>
        </div>
      </div>
      <div className={`ra-ledger${f.ledgerLit ? " lit" : ""}`}>
        📒 服务器账本:{f.ledger ?? "(空)"}
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
      title="幂等键:超时重试,只扣一次钱(逐帧)"
      frames={frames}
    />
  );
}
