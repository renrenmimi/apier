"use client";

// 第 03 章 · REST 的思想 —— 本章专属可视化(双语,英文默认):
//  - HeroCity:hero 里的「城市与信使」循环动画(纯 CSS 驱动)。
//  - RepresentationSwitcher:一个资源,多种表述 —— 切 Accept 看内容协商。
//  - ConstraintFlips:六大约束翻转卡,背面是「没有它会怎样」。
//  - StatelessTheater:有状态 vs 无状态服务器,逐帧对比。
//  - MaturityLadder:Richardson 成熟度阶梯,同一个「订披萨」四种活法。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { useState, type ReactNode } from "react";
import { CodeBlock } from "@/lib/code";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroCity ================= */

export function HeroCity() {
  return (
    <div className="rs-city" aria-hidden>
      <div className="flow-node lit">
        <span className="ico">🧑‍💻</span>
        <T en="Client" zh="客户端" />
      </div>
      <div className="flow-mid rs-city-mid">
        <div className="flow-line" />
        <span className="flow-packet rs-go">GET /posts/42</span>
        <span className="flow-packet back rs-back">
          <T en="200 · one representation" zh="200 · 一份表述" />
        </span>
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
      <T
        en={
          <>
            A representation meant for <b>programs</b>. This is what your{" "}
            <code>fetch</code> code asks for. It is a copy of the resource as it
            is right now, not the resource itself.
          </>
        }
        zh={
          <>
            给<b>程序</b>看的表述 —— 你的 <code>fetch</code> 代码要的就是这份。
            它是资源此刻的一份副本,不是资源本身。
          </>
        }
      />
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
      <T
        en={
          <>
            The same user 42, in a form a <b>browser</b> can display. Nothing
            about the resource changed. Only the representation did.
          </>
        }
        zh={
          <>
            同一个 42 号用户,换成<b>浏览器</b>能直接显示的形式。
            资源没有任何变化,变的只是表述。
          </>
        }
      />
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
      <T
        en={
          <>
            The same user again, this time as XML. Many older banking and
            government systems still use it. <b>Three formats, one resource</b>{" "}
            — this is the evidence that REST does not require JSON.
          </>
        }
        zh={
          <>
            还是同一个用户,这回换成 XML。不少银行和政务系统的老接口至今用它。
            <b>三种格式,一个资源</b> —— 这就是「REST 不等于 JSON」的现场证据。
          </>
        }
      />
    ),
  },
];

export function RepresentationSwitcher() {
  const [sel, setSel] = useState(0);
  const rep = REPS[sel];

  return (
    <div className="viz rs-rep">
      <div className="viz-title">
        <T
          en="One resource, several representations — change the Accept header"
          zh="一个资源,多种表述 —— 换个 Accept,换一种格式"
        />
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
        title={{ en: "Request · the same URI", zh: "请求 · 同一个 URI" }}
        hl={[2]}
        code={`GET /users/42 HTTP/1.1
Accept: ${rep.accept}`}
      />
      <CodeBlock
        lang="http"
        title={{ en: "Response", zh: "响应" }}
        hl={[2]}
        code={rep.response}
      />
      <div className="viz-msg" aria-live="polite">
        {rep.msg}
      </div>
    </div>
  );
}

/* ================= ConstraintFlips ================= */

interface Constraint {
  num: string;
  /** 卡面大标题:中文用术语,英文用一句白话 */
  name: Loc<string>;
  /** 小字体的正式英文术语,两种语言都显示 */
  sub: string;
  front: ReactNode;
  back: ReactNode;
  optional?: boolean;
}

const CONSTRAINTS: Constraint[] = [
  {
    num: "01",
    name: { en: "Client and server are separate", zh: "客户端-服务器" },
    sub: "Client-Server",
    front: (
      <T
        en={
          <>
            The client owns the user interface. The server owns the data. Each
            side can change without the other.
          </>
        }
        zh={
          <>
            界面归客户端,数据归服务器。两边各自演化,互不牵制。
          </>
        }
      />
    ),
    back: (
      <T
        en={
          <>
            The interface and the data would be one program. A website, a phone
            app, and a watch app could not share one backend — each would need
            its own.
          </>
        }
        zh={
          <>
            界面和数据长在同一个程序里:网页、App、手表想共用同一份后端?
            做不到,每一端都得自己写一套。
          </>
        }
      />
    ),
  },
  {
    num: "02",
    name: { en: "The server keeps no session memory", zh: "无状态" },
    sub: "Stateless",
    front: (
      <T
        en={
          <>
            Every request carries all the information needed to understand it.
            The server keeps no session state between requests.
          </>
        }
        zh={
          <>
            每个请求自带理解它所需的全部信息。两次请求之间,
            服务器不保留任何会话状态。
          </>
        }
      />
    ),
    back: (
      <T
        en={
          <>
            Your session would live in the memory of one specific server. If
            that server restarts, you are logged out. Adding a second server to
            share the load would not help.
          </>
        }
        zh={
          <>
            你的会话被锁在某一台服务器的内存里:它一重启你就被登出,
            加机器分担流量也帮不上忙。下面的对比专门演这一幕。
          </>
        }
      />
    ),
  },
  {
    num: "03",
    name: { en: "Responses say whether they can be cached", zh: "可缓存" },
    sub: "Cache",
    front: (
      <T
        en={
          <>
            Every response must be marked, explicitly or implicitly, as
            cacheable or not — and for how long.
          </>
        }
        zh={
          <>
            每个响应都要标明(显式或隐式)自己能不能被缓存、能存多久。
          </>
        }
      />
    ),
    back: (
      <T
        en={
          <>
            Every page load would have to reach the origin server. Browser
            caches and CDNs could not exist, and the web would be much slower.
          </>
        }
        zh={
          <>
            每次访问都得回到源站取数据,浏览器缓存和 CDN 都无从存在 ——
            Web 会慢得多。
          </>
        }
      />
    ),
  },
  {
    num: "04",
    name: { en: "One interface for every resource", zh: "统一接口" },
    sub: "Uniform Interface",
    front: (
      <T
        en={
          <>
            Every resource is accessed the same way. This is the constraint that
            distinguishes REST from other styles, and it has four parts.
          </>
        }
        zh={
          <>
            所有资源都用同一套方式访问。这是把 REST 与其他风格区分开的约束,
            它内含 4 个子约束。
          </>
        }
      />
    ),
    back: (
      <T
        en={
          <>
            Every site would define its own request format. Browsers could not
            be general-purpose, and caches, proxies, and crawlers could not be
            written at all.
          </>
        }
        zh={
          <>
            每个站点自定一套私有格式:浏览器没法通用,缓存、代理、
            爬虫也根本写不出来。
          </>
        }
      />
    ),
  },
  {
    num: "05",
    name: { en: "The client sees only one layer", zh: "分层系统" },
    sub: "Layered System",
    front: (
      <T
        en={
          <>
            A client talks to the layer in front of it and cannot tell how many
            layers are behind it.
          </>
        }
        zh={
          <>
            客户端只与它面前的那一层对话,无法也不需要知道背后还有几层。
          </>
        }
      />
    ),
    back: (
      <T
        en={
          <>
            Adding a load balancer, a gateway, or a CDN in the middle would
            require changing every client. The architecture would be fixed on
            day one.
          </>
        }
        zh={
          <>
            想在中间加负载均衡、网关或 CDN?所有客户端都得改代码 ——
            架构从第一天起就定死了。
          </>
        }
      />
    ),
  },
  {
    num: "06",
    name: { en: "The server may send code to run", zh: "按需代码" },
    sub: "Code-on-Demand",
    front: (
      <T
        en={
          <>
            The server may send code, such as JavaScript, for the client to run.
          </>
        }
        zh={<>服务器可以把代码(比如 JavaScript)下发给客户端执行。</>}
      />
    ),
    back: (
      <T
        en={
          <>
            Nothing breaks. This is the only optional constraint. Even so, the
            JavaScript your browser downloads and runs on every page is exactly
            this constraint in use.
          </>
        }
        zh={
          <>
            什么也不会坏 —— 它是六条里唯一可选的。不过你每天打开网页时,
            浏览器下载并执行的那些 JavaScript,正是这条约束本身。
          </>
        }
      />
    ),
    optional: true,
  },
];

export function ConstraintFlips() {
  const L = useL();
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
                  <T
                    en={<>CONSTRAINT {c.num}</>}
                    zh={<>约束 {c.num}</>}
                  />
                  {c.optional && (
                    <em className="rs-cons-flag">
                      <T en="optional" zh="唯一可选" />
                    </em>
                  )}
                </span>
                <span className="rs-cons-name">{L(c.name)}</span>
                <span className="rs-cons-en">{c.sub}</span>
                <span className="rs-cons-line">{c.front}</span>
                <span className="rs-flip-hint">
                  <T
                    en="Flip the card → what happens without it"
                    zh="点我翻面 → 没有它会怎样?"
                  />
                </span>
              </span>
              <span className="rs-face back">
                <span className="rs-cons-noit">
                  <T en="IF IT WERE MISSING" zh="没有它,会怎样" />
                </span>
                <span className="rs-cons-line">{c.back}</span>
                <span className="rs-flip-hint">
                  <T en="Click again to flip back" zh="再点一下翻回去" />
                </span>
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
  memA?: ReactNode;
  bubbleB?: ReactNode;
  msg: ReactNode;
}

const STATEFUL_FRAMES: SFFrame[] = [
  {
    packet: (
      <T en={`"I am Ada, give me page 1"`} zh="「我是 Ada,给我第 1 页」" />
    ),
    litA: true,
    memA: <T en="Ada · logged in · page 1" zh="Ada · 已登录 · 第 1 页" />,
    msg: (
      <T
        en={
          <>
            Server A accepts the request and writes &quot;Ada is on page
            1&quot; into <b>its own memory</b> as a session.
          </>
        }
        zh={
          <>
            服务器 A 收下请求,顺手把「Ada 看到第 1 页」记进
            <b>自己的内存</b>(会话)里。
          </>
        }
      />
    ),
  },
  {
    packet: <T en={`"Next page!"`} zh="「下一页!」" />,
    litA: true,
    memA: <T en="Ada · logged in · page 2" zh="Ada · 已登录 · 第 2 页" />,
    msg: (
      <T
        en={
          <>
            The request is two words long, because A remembers where you were.
            Convenient right now. The problem shows up later.
          </>
        }
        zh={
          <>
            请求短得只剩三个字 —— 因为 A 记得你的进度。此刻很省事,
            问题稍后才出现。
          </>
        }
      />
    ),
  },
  {
    deadA: true,
    showB: true,
    msg: (
      <T
        en={
          <>
            Traffic rises and A crashes. Server B is started to take over. The
            session was in A&apos;s memory, so it is <b>gone with A</b>.
          </>
        }
        zh={
          <>
            流量一大,A 宕机了。运维紧急拉起服务器 B 顶班 ——
            可会话在 A 的内存里,<b>跟着 A 一起没了</b>。
          </>
        }
      />
    ),
  },
  {
    packet: <T en={`"Next page!"`} zh="「下一页!」" />,
    deadA: true,
    showB: true,
    litB: true,
    bubbleB: <T en="Who are you?" zh="你是谁?" />,
    msg: (
      <T
        en={
          <>
            B has no record of who you are or which page you were on. The
            session is lost and you have to log in again.{" "}
            <b>
              That is the cost of keeping session state on one server.
            </b>
          </>
        }
        zh={
          <>
            B 完全不知道你是谁、看到哪一页 —— 会话丢失,你被迫重新登录。
            <b>这就是把会话状态放在单台服务器上的代价。</b>
          </>
        }
      />
    ),
  },
];

const STATELESS_FRAMES: SFFrame[] = [
  {
    packet: "GET /posts?page=2 + token",
    litA: true,
    msg: (
      <T
        en={
          <>
            Every request <b>identifies itself</b>: who you are (the token) and
            what you want (<code>page=2</code>). Longer to send, but it depends
            on nothing the server remembers.
          </>
        }
        zh={
          <>
            每个请求都<b>自报家门</b>:我是谁(token)、要哪一页(
            <code>page=2</code>)。写起来啰嗦一点,
            但它不依赖服务器记住任何事。
          </>
        }
      />
    ),
  },
  {
    packet: <T en="200 OK · page 2" zh="200 OK · 第 2 页" />,
    back: true,
    litA: true,
    msg: (
      <T
        en={
          <>
            A answers and keeps nothing, because it stored nothing to begin
            with.
          </>
        }
        zh={<>A 答完就忘 —— 它本来就没存过任何东西。</>}
      />
    ),
  },
  {
    deadA: true,
    showB: true,
    msg: (
      <T
        en={
          <>
            A can still crash. This time only one machine is lost, not your
            session.
          </>
        }
        zh={<>A 照样可能宕机。但这次丢的只是一台机器,不是你的会话。</>}
      />
    ),
  },
  {
    packet: "GET /posts?page=3 + token",
    deadA: true,
    showB: true,
    litB: true,
    msg: (
      <T
        en={
          <>
            B takes over with no handover. The answer depends only on the
            request, so any server can produce it. To handle ten times the
            traffic, add ten machines.{" "}
            <b>This is why statelessness allows horizontal scaling.</b>
          </>
        }
        zh={
          <>
            B 无缝接手 —— 答案只取决于请求本身,谁接都一样。想扛十倍流量?
            加十台机器就行。<b>这就是无状态能横向扩展的原因。</b>
          </>
        }
      />
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
        <T
          en="Should the server remember you?"
          zh="对照演示:服务器该不该记住你?"
        />
        <span className="seg" role="group">
          <button
            type="button"
            className={`seg-btn${mode === "stateful" ? " on" : ""}`}
            onClick={() => switchMode("stateful")}
          >
            <T en="Stateful (the problem)" zh="有状态(反面)" />
          </button>
          <button
            type="button"
            className={`seg-btn${mode === "stateless" ? " on" : ""}`}
            onClick={() => switchMode("stateless")}
          >
            <T en="Stateless (REST)" zh="无状态(REST)" />
          </button>
        </span>
      </div>
      <div className="viz-stage">
        <div className="viz-scroll">
          <div className="rs-sf">
            <div className="flow-node lit">
              <span className="ico">🧑‍💻</span>
              <T en="Client" zh="客户端" />
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
                <T en="Server A" zh="服务器 A" />
                {f.memA && <span className="rs-mem">📒 {f.memA}</span>}
                {mode === "stateless" && !f.deadA && (
                  <span className="rs-mem empty">
                    <T en="no session stored" zh="没有会话记录" />
                  </span>
                )}
              </div>
              {f.showB && (
                <div className={`flow-node rs-server-b${f.litB ? " lit" : ""}`}>
                  {f.bubbleB && <span className="rs-bubble">{f.bubbleB}</span>}
                  <span className="ico">🗄️</span>
                  <T en="Server B" zh="服务器 B" />
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
  name: Loc<string>;
  tag: Loc<string>;
  emoji: string;
  detail: ReactNode;
}

const LEVELS: Level[] = [
  {
    lv: "L3",
    name: { en: "Hypermedia", zh: "超媒体" },
    tag: { en: "the glory of REST", zh: "the glory of REST" },
    emoji: "✨",
    detail: (
      <>
        <CodeBlock
          lang="http"
          title={{
            en: "L3 · read an order; the response carries the next steps",
            zh: "L3 · 查订单,响应里带着「下一步」",
          }}
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
          <T
            en={
              <>
                The response states what you can do next: cancel it or track it.
                The client no longer builds URLs from rules written into its own
                code; it follows the links it is given. Fowler calls this level{" "}
                <b>the glory of REST</b>. Why it looks good but is rarely built
                is the subject of §05.
              </>
            }
            zh={
              <>
                响应亲口告诉你:接下来可以取消、可以追踪。
                客户端不再按自己代码里写死的规则拼 URL,而是跟着给出的链接走。
                Fowler 把这一级叫作 <b>the glory of REST</b>。
                它为什么好看却很少有人做?§05 展开。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    lv: "L2",
    name: { en: "Methods and status codes", zh: "动词 + 状态码" },
    tag: { en: "where most APIs stop", zh: "业界主流停在这" },
    emoji: "🏙️",
    detail: (
      <>
        <CodeBlock
          lang="http"
          title={{
            en: "L2 · cancel an order by deleting the order resource",
            zh: "L2 · 取消订单 = 对订单资源做 DELETE",
          }}
          code={`DELETE /orders/66 HTTP/1.1`}
        />
        <CodeBlock
          lang="http"
          title={{
            en: "L2 · the server answers with a status code",
            zh: "L2 · 服务器用状态码回话",
          }}
          code={`HTTP/1.1 204 No Content`}
        />
        <p className="rs-detail-note">
          <T
            en={
              <>
                Creating an order is <code>POST /orders</code>, which returns{" "}
                <code>201 Created</code> with a <code>Location</code> header
                pointing at the new order. Reading it is{" "}
                <code>GET /orders/66</code>. An order that does not exist
                returns <code>404</code>.{" "}
                <b>
                  The method says what to do; the status code says what
                  happened.
                </b>{" "}
                This is what the industry usually means by REST. One caveat:{" "}
                <code>DELETE /orders/66</code> removes the order. If the
                business needs to keep cancelled orders on record, model the
                cancellation as its own resource, as L3 does above.
              </>
            }
            zh={
              <>
                下单是 <code>POST /orders</code>,成功返回{" "}
                <code>201 Created</code>,并在 <code>Location</code> 头里给出
                新订单的地址;查单是 <code>GET /orders/66</code>;
                订单不存在则返回 <code>404</code>。
                <b>动作交给方法,结果交给状态码</b> ——
                这就是业界通常所说的「REST」。一个提醒:
                <code>DELETE /orders/66</code> 删掉的是订单本身。
                如果业务需要保留「已取消」的记录,
                就该把「取消」建模成一个独立资源,像上面 L3 那样。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    lv: "L1",
    name: { en: "Resources", zh: "有资源了" },
    tag: { en: "addresses, but no shared rules", zh: "地址有了,规矩没立" },
    emoji: "🏗️",
    detail: (
      <>
        <CodeBlock
          lang="http"
          title={{
            en: "L1 · cancel an order: separate URL, action still in the body",
            zh: "L1 · 取消订单:URL 分开了,动作还在 body 里",
          }}
          code={`POST /orders/66 HTTP/1.1
Content-Type: application/json

{ "action": "cancel" }`}
        />
        <p className="rs-detail-note">
          <T
            en={
              <>
                Progress: the system is split into resources, and order 66 has
                its own address. But the action is still a field in the body,
                and the method is always <code>POST</code>. There are addresses,
                but no shared vocabulary for what to do with them.
              </>
            }
            zh={
              <>
                进步在于:系统被拆成了一个个资源,66 号订单有了自己的地址。
                但动作依旧塞在 body 的 <code>action</code> 字段里,
                方法一律用 <code>POST</code> —— 地址有了,
                「怎么操作它」还没有共同语言。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    lv: "L0",
    name: { en: "One endpoint", zh: "单端点 POST" },
    tag: { en: "the swamp of POX", zh: "the swamp of POX" },
    emoji: "🐊",
    detail: (
      <>
        <CodeBlock
          lang="http"
          title={{
            en: "L0 · every operation goes to the same address",
            zh: "L0 · 干什么都发同一个地址",
          }}
          code={`POST /pizzaService HTTP/1.1
Content-Type: application/json

{
  "action": "orderPizza",
  "size": "L",
  "toppings": ["mushroom"]
}`}
        />
        <p className="rs-detail-note">
          <T
            en={
              <>
                Reading an order? Still <code>POST /pizzaService</code>, with{" "}
                <code>action</code> set to <code>checkOrder</code>. Cancelling?
                Another action value. One URL, one method, always{" "}
                <code>200</code>, and errors hidden inside the body. HTTP is
                reduced to a tunnel for moving data. Fowler calls this the swamp
                of POX (plain old XML).
              </>
            }
            zh={
              <>
                查订单?还是 <code>POST /pizzaService</code>,
                把 <code>action</code> 换成 <code>checkOrder</code>。取消?
                再换一个 action 值。URL 永远只有一个,方法永远是{" "}
                <code>POST</code>,响应永远 <code>200</code>,
                错误藏在 body 里 —— HTTP 沦为一根传数据的管子。
                Fowler 管这一级叫 the swamp of POX(plain old XML)。
              </>
            }
          />
        </p>
      </>
    ),
  },
];

export function MaturityLadder() {
  const L = useL();
  const [sel, setSel] = useState(3); // 默认从 L0 出发,一级一级往上爬
  const level = LEVELS[sel];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="One task — ordering a pizza — built four ways, from the swamp upward"
          zh="成熟度阶梯:同一个「订披萨」,四种做法 —— 从沼泽往上爬"
        />
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
                  {l.emoji} {L(l.name)}
                </span>
                <span className="rs-rung-tag">{L(l.tag)}</span>
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
