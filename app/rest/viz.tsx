"use client";

// 第 03 章 · REST 的思想 —— 本章专属可视化:
//  - HeroCity:hero 里的「城市与信使」循环动画(纯 CSS 驱动)。
//  - RepresentationSwitcher:一个资源,多种表述 —— 切 Accept 看内容协商。
//  - ConstraintFlips:六大约束翻转卡,背面是「没有它,Web 会塌成什么样」。
//  - StatelessTheater:有状态 vs 无状态服务器,逐帧对比小剧场。
//  - MaturityLadder:Richardson 成熟度阶梯,同一个「订披萨」四种活法。

import { useState, type ReactNode } from "react";
import { CodeBlock } from "@/lib/code";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= HeroCity ================= */

export function HeroCity() {
  return (
    <div className="rs-city" aria-hidden>
      <div className="flow-node lit">
        <span className="ico">🧑‍💻</span>
        客户端
      </div>
      <div className="flow-mid rs-city-mid">
        <div className="flow-line" />
        <span className="flow-packet rs-go">GET /posts/42</span>
        <span className="flow-packet back rs-back">200 · 一份表述</span>
      </div>
      <div className="rs-blocks">
        <div className="rs-block">
          <span className="rs-roof">🏛️</span>
          <span className="rs-addr">/users</span>
        </div>
        <div className="rs-block tall">
          <span className="rs-roof">🏢</span>
          <span className="rs-addr">/posts</span>
        </div>
        <div className="rs-block">
          <span className="rs-roof">🏠</span>
          <span className="rs-addr">/comments</span>
        </div>
      </div>
    </div>
  );
}

/* ================= RepresentationSwitcher ================= */

interface Rep {
  id: string;
  seg: string;
  accept: string;
  response: string;
  msg: ReactNode;
}

const REPS: Rep[] = [
  {
    id: "json",
    seg: "JSON",
    accept: "application/json",
    response: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 42,
  "name": "Ada Lovelace",
  "email": "ada@example.com"
}`,
    msg: (
      <>
        给<b>程序</b>看的表述 —— 你的 fetch 代码要的就是这份。但记住:
        它只是资源在此刻的一张快照,不是资源本身。
      </>
    ),
  },
  {
    id: "html",
    seg: "HTML",
    accept: "text/html",
    response: `HTTP/1.1 200 OK
Content-Type: text/html

<article class="user">
  <h1>Ada Lovelace</h1>
  <p>ada@example.com</p>
</article>`,
    msg: (
      <>
        同一个 42 号用户,换了一副给<b>浏览器</b>看的面孔。
        资源一个字没变,变的只是表述。
      </>
    ),
  },
  {
    id: "xml",
    seg: "XML",
    accept: "application/xml",
    response: `HTTP/1.1 200 OK
Content-Type: application/xml

<user id="42">
  <name>Ada Lovelace</name>
  <email>ada@example.com</email>
</user>`,
    msg: (
      <>
        还是它,这回穿上了老派西装 —— 不少银行、政务系统的老接口至今说
        XML。<b>三副面孔,一个资源</b>:这就是「REST ≠ JSON」的现场证据。
      </>
    ),
  },
];

export function RepresentationSwitcher() {
  const [sel, setSel] = useState(0);
  const rep = REPS[sel];

  return (
    <div className="viz rs-rep">
      <div className="viz-title">
        一个资源,多种表述 —— 换个 Accept,换副面孔
        <span className="seg" role="group">
          {REPS.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={`seg-btn${sel === i ? " on" : ""}`}
              onClick={() => setSel(i)}
            >
              {r.seg}
            </button>
          ))}
        </span>
      </div>
      <CodeBlock
        lang="http"
        title="请求 · 同一个门牌号"
        hl={[2]}
        code={`GET /users/42 HTTP/1.1
Accept: ${rep.accept}`}
      />
      <CodeBlock lang="http" title="响应" hl={[2]} code={rep.response} />
      <div className="viz-msg" aria-live="polite">
        {rep.msg}
      </div>
    </div>
  );
}

/* ================= ConstraintFlips ================= */

interface Constraint {
  num: string;
  name: string;
  en: string;
  front: ReactNode;
  back: ReactNode;
  optional?: boolean;
}

const CONSTRAINTS: Constraint[] = [
  {
    num: "01",
    name: "客户端-服务器",
    en: "Client–Server",
    front: <>界面归客户端,数据归服务器,各管各的、各演化各的。</>,
    back: (
      <>
        前端和后端长死在一起:网页、App、手表想共用同一份数据?
        对不起,每一家都得重写一遍后端。
      </>
    ),
  },
  {
    num: "02",
    name: "无状态",
    en: "Stateless",
    front: <>每个请求自带理解它所需的全部信息,服务器不留会话记忆。</>,
    back: (
      <>
        你的会话被锁死在某一台服务器上:它一重启你就「被登出」,
        想加机器分担流量也无从谈起。下面的小剧场专门演这出。
      </>
    ),
  },
  {
    num: "03",
    name: "可缓存",
    en: "Cache",
    front: <>每个响应都要说清:我能不能被缓存、能存多久。</>,
    back: (
      <>
        每次刷新都得跨半个地球回源站取数据,CDN 无从存在 ——
        Web 会慢到没法用。
      </>
    ),
  },
  {
    num: "04",
    name: "统一接口",
    en: "Uniform Interface",
    front: (
      <>
        所有资源用同一套规矩访问 —— REST 的招牌约束,内含 4 个子约束。
      </>
    ),
    back: (
      <>
        每个网站一套私有暗号:浏览器没法通用,缓存、代理、爬虫全都写不出来
        —— Web 退化成一堆互不相通的孤岛。
      </>
    ),
  },
  {
    num: "05",
    name: "分层系统",
    en: "Layered System",
    front: <>客户端只管对面那一层,不必知道背后还有几层。</>,
    back: (
      <>
        想在中间加个负载均衡、网关或 CDN?所有客户端都得改代码 ——
        架构从出生那天起就焊死了。
      </>
    ),
  },
  {
    num: "06",
    name: "按需代码",
    en: "Code-on-Demand",
    front: <>服务器可以把代码(比如 JS)下发给客户端执行。</>,
    back: (
      <>
        没有它也没事 —— 它是六条里唯一可选的。但你每天打开的网页,
        那些从服务器下发的 JavaScript,就是它本尊。
      </>
    ),
    optional: true,
  },
];

export function ConstraintFlips() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="rs-cons">
      {CONSTRAINTS.map((c, i) => {
        const on = flipped.has(i);
        return (
          <button
            key={c.num}
            type="button"
            className={`rs-flip${on ? " on" : ""}`}
            onClick={() => toggle(i)}
            aria-pressed={on}
          >
            <span className="rs-flip-inner">
              <span className="rs-face front">
                <span className="rs-cons-num">
                  约束 {c.num}
                  {c.optional && <em className="rs-cons-flag">唯一可选</em>}
                </span>
                <span className="rs-cons-name">{c.name}</span>
                <span className="rs-cons-en">{c.en}</span>
                <span className="rs-cons-line">{c.front}</span>
                <span className="rs-flip-hint">点我翻面 → 没有它会怎样?</span>
              </span>
              <span className="rs-face back">
                <span className="rs-cons-noit">没有它,Web 会 ——</span>
                <span className="rs-cons-line">{c.back}</span>
                <span className="rs-flip-hint">再点一下翻回去</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ================= StatelessTheater ================= */

interface SFFrame {
  packet?: ReactNode;
  back?: boolean;
  litA?: boolean;
  litB?: boolean;
  deadA?: boolean;
  showB?: boolean;
  memA?: string;
  bubbleB?: string;
  msg: ReactNode;
}

const STATEFUL_FRAMES: SFFrame[] = [
  {
    packet: "「我是 Ada,给我第 1 页」",
    litA: true,
    memA: "Ada · 已登录 · 第 1 页",
    msg: (
      <>
        服务器 A 收下请求,顺手把「Ada 看到第 1 页」记在自己的<b>小本本</b>
        (内存里的会话)上。
      </>
    ),
  },
  {
    packet: "「下一页!」",
    litA: true,
    memA: "Ada · 已登录 · 第 2 页",
    msg: (
      <>
        请求短得只有三个字 —— 因为 A 的小本本记得你的进度。
        此刻很省事,但隐患已经埋下。
      </>
    ),
  },
  {
    deadA: true,
    showB: true,
    msg: (
      <>
        流量一大,A 宕机了。运维紧急拉起服务器 B 顶班 ——
        可小本本在 A 的内存里,<b>跟着 A 一起没了</b>。
      </>
    ),
  },
  {
    packet: "「下一页!」",
    deadA: true,
    showB: true,
    litB: true,
    bubbleB: "你谁啊?",
    msg: (
      <>
        B 翻遍全身也不知道你是谁、看到哪页 —— 会话丢失,你被迫重新登录。
        <b>会话跟服务器绑死,就是有状态的代价。</b>
      </>
    ),
  },
];

const STATELESS_FRAMES: SFFrame[] = [
  {
    packet: "GET /posts?page=2 + token",
    litA: true,
    msg: (
      <>
        每个请求<b>自报家门</b>:我是谁(token)、要哪页(page=2)——
        全部信息随身带。啰嗦一点,但不欠任何人情。
      </>
    ),
  },
  {
    packet: "200 OK · 第 2 页",
    back: true,
    litA: true,
    msg: <>A 答完就忘 —— 它本来就没记任何东西,天生没有小本本。</>,
  },
  {
    deadA: true,
    showB: true,
    msg: <>A 照样可能宕机。但这次,丢的只是一台机器,不是你的会话。</>,
  },
  {
    packet: "GET /posts?page=3 + token",
    deadA: true,
    showB: true,
    litB: true,
    msg: (
      <>
        B 无缝接手 —— 答案只取决于请求本身,谁接都一样。想扛十倍流量?
        加十台机器就行。<b>无状态,就是水平扩展的钥匙。</b>
      </>
    ),
  },
];

export function StatelessTheater() {
  const [mode, setMode] = useState<"stateful" | "stateless">("stateful");
  const frames = mode === "stateful" ? STATEFUL_FRAMES : STATELESS_FRAMES;
  const stepper = useStepper(frames.length);
  const f = frames[stepper.step];

  const switchMode = (m: "stateful" | "stateless") => {
    setMode(m);
    stepper.reset();
  };

  return (
    <div className="viz">
      <div className="viz-title">
        小剧场:服务器该不该记住你?
        <span className="seg" role="group">
          <button
            type="button"
            className={`seg-btn${mode === "stateful" ? " on" : ""}`}
            onClick={() => switchMode("stateful")}
          >
            有状态(反面)
          </button>
          <button
            type="button"
            className={`seg-btn${mode === "stateless" ? " on" : ""}`}
            onClick={() => switchMode("stateless")}
          >
            无状态(REST)
          </button>
        </span>
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="rs-sf">
            <div className="flow-node lit">
              <span className="ico">🧑‍💻</span>
              客户端
            </div>
            <div className="rs-sf-mid">
              <div className="flow-line" />
              {f.packet && (
                <span className={`flow-packet${f.back ? " back" : ""}`}>
                  {f.packet}
                </span>
              )}
            </div>
            <div className="rs-sf-servers">
              <div
                className={`flow-node${f.litA ? " lit" : ""}${
                  f.deadA ? " rs-dead" : ""
                }`}
              >
                <span className="ico">{f.deadA ? "💥" : "🗄️"}</span>
                服务器 A
                {f.memA && <span className="rs-mem">📒 {f.memA}</span>}
                {mode === "stateless" && !f.deadA && (
                  <span className="rs-mem empty">没有小本本</span>
                )}
              </div>
              {f.showB && (
                <div className={`flow-node rs-server-b${f.litB ? " lit" : ""}`}>
                  {f.bubbleB && <span className="rs-bubble">{f.bubbleB}</span>}
                  <span className="ico">🗄️</span>
                  服务器 B
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}

/* ================= MaturityLadder ================= */

interface Level {
  lv: string;
  name: string;
  tag: string;
  emoji: string;
  detail: ReactNode;
}

const LEVELS: Level[] = [
  {
    lv: "L3",
    name: "超媒体",
    tag: "the glory of REST",
    emoji: "✨",
    detail: (
      <>
        <CodeBlock
          lang="http"
          title="L3 · 查订单,响应里带着「下一步」"
          hl={[8, 9, 10]}
          code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 66,
  "status": "baking",
  "_links": {
    "self":   { "href": "/orders/66" },
    "cancel": { "href": "/orders/66/cancellation" },
    "track":  { "href": "/orders/66/tracking" }
  }
}`}
        />
        <p className="rs-detail-note">
          响应亲口告诉你:接下来能取消、能追踪。客户端不再硬编码 URL 规则,
          跟着链接走 —— Fowler 说,到这里才算 the glory of
          REST。它为什么好看又不流行?§05 展开。
        </p>
      </>
    ),
  },
  {
    lv: "L2",
    name: "动词 + 状态码",
    tag: "业界主流停在这",
    emoji: "🏙️",
    detail: (
      <>
        <CodeBlock
          lang="http"
          title="L2 · 取消订单 = 对订单资源做 DELETE"
          code={`DELETE /orders/66 HTTP/1.1`}
        />
        <CodeBlock
          lang="http"
          title="L2 · 服务器用状态码回话"
          code={`HTTP/1.1 204 No Content`}
        />
        <p className="rs-detail-note">
          下单 = POST /orders,成功回 201;查单 = GET /orders/66;查无此单回
          404。<b>动作交给方法,结果交给状态码</b> —— 这就是业界主流的
          「REST」,93% 的自称者绝大多数到这级为止。
        </p>
      </>
    ),
  },
  {
    lv: "L1",
    name: "有资源了",
    tag: "门牌有了,规矩没立",
    emoji: "🏗️",
    detail: (
      <>
        <CodeBlock
          lang="http"
          title="L1 · 取消订单:URL 分开了,动作还在 body 里"
          code={`POST /orders/66 HTTP/1.1
Content-Type: application/json

{ "action": "cancel" }`}
        />
        <p className="rs-detail-note">
          进步:世界被拆成了一个个资源,66 号订单有了自己的门牌号。
          但动作还是塞在 body 的 action 字段里,方法依旧 POST 一把梭 ——
          门牌有了,规矩还没立。
        </p>
      </>
    ),
  },
  {
    lv: "L0",
    name: "POST 一把梭",
    tag: "the swamp of POX",
    emoji: "🐊",
    detail: (
      <>
        <CodeBlock
          lang="http"
          title="L0 · 干什么都发同一个地址"
          code={`POST /pizzaService HTTP/1.1
Content-Type: application/json

{
  "action": "orderPizza",
  "size": "L",
  "toppings": ["mushroom"]
}`}
        />
        <p className="rs-detail-note">
          查订单?还是 POST /pizzaService,body 里换成
          「checkOrder」。取消?再换一个 action。URL 永远只有一个,
          方法永远是 POST,响应永远 200,错误藏在 body 里 —— HTTP
          沦为一根传数据的管子。Fowler 管这叫 the swamp of POX(沼泽)。
        </p>
      </>
    ),
  },
];

export function MaturityLadder() {
  const [sel, setSel] = useState(3); // 默认从 L0 沼泽出发
  const level = LEVELS[sel];

  return (
    <div className="viz">
      <div className="viz-title">
        成熟度阶梯:同一个「订披萨」,四种活法 —— 从沼泽往上爬
      </div>
      <div className="rs-ladder">
        <div className="rs-rungs">
          {LEVELS.map((l, i) => (
            <button
              key={l.lv}
              type="button"
              className={`rs-rung${sel === i ? " on" : ""}`}
              style={{ marginLeft: i * 14 }}
              onClick={() => setSel(i)}
            >
              <span className="lv">{l.lv}</span>
              <span>
                <span className="rs-rung-name">
                  {l.emoji} {l.name}
                </span>
                <span className="rs-rung-tag">{l.tag}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="rs-detail" aria-live="polite">
          {level.detail}
        </div>
      </div>
    </div>
  );
}
