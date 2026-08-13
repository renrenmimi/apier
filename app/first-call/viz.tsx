"use client";

// 第 02 章专属可视化:
//  - HeroDrive:hero 里的「上路」循环动画(你的 JS ↔ 真实世界的 API)。
//  - FetchLab:三种结局亲手踩 —— 正常 / 404 / 断网,真 fetch + 代码分支高亮,失败自动降级。
//  - PokedexWidget:真的能玩的宝可梦查询器(真 fetch PokeAPI,断网降级内置数据)。
//  - NetworkTour:DevTools Network 面板导览(可点的标签页)。

import { useState, type ReactNode } from "react";
import { CodeBlock } from "@/lib/code";
import { Status } from "@/lib/kit";

/* ================= HeroDrive ================= */

export function HeroDrive() {
  return (
    <div className="fc-loop" aria-hidden>
      <div className="flow-node lit">
        <span className="ico">🧑‍💻</span>
        你的 JS
      </div>
      <div className="flow-mid fc-loop-mid">
        <div className="flow-line" />
        <span className="flow-packet fc-go">await fetch(url)</span>
        <span className="flow-packet back fc-back">200 OK · JSON</span>
      </div>
      <div className="flow-node">
        <span className="ico">🌍</span>
        真实世界的 API
      </div>
    </div>
  );
}

/* ================= FetchLab ================= */

const FETCH_CODE = `async function load(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    const data = await res.json();
    console.log("成功:", data);
  } catch (err) {
    console.error("失败:", err.message);
  }
}`;

interface FcScenario {
  id: "ok" | "notfound" | "offline";
  label: string;
  url: string;
  hl: number[];
  path: ReactNode;
}

const SCENARIOS: FcScenario[] = [
  {
    id: "ok",
    label: "① 正常 URL",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    hl: [3, 7, 8],
    path: (
      <>
        第 3 行:fetch 顺利兑现,res.status = 200,res.ok = true ——
        跳过 if,第 7 行解析 JSON,第 8 行打印数据。
        全程没碰 catch,一路绿灯。
      </>
    ),
  },
  {
    id: "notfound",
    label: "② 404 URL",
    url: "https://jsonplaceholder.typicode.com/nothing-here",
    hl: [3, 4, 5, 10],
    path: (
      <>
        第 3 行:注意!fetch <b>还是成功兑现了</b> —— 服务器回了话,
        只是回的是 404。res.ok = false,第 4、5 行手动把它升级成错误,
        第 10 行接住。要是没写这个 if,代码会带着一具「404
        的响应体」继续往下跑,最后在离出错点很远的地方炸出一串 undefined。
      </>
    ),
  },
  {
    id: "offline",
    label: "③ 断网(域名不存在)",
    url: "https://api.no-such-host-anywhere.example/data",
    hl: [3, 9, 10],
    path: (
      <>
        第 3 行:域名都解析不了,信根本寄不出去 —— 这才是 fetch
        亲自 reject 的情形,直接跳进第 9、10 行的 catch,err 是{" "}
        <code>TypeError: Failed to fetch</code>。
        网络层失败才走这条路,404/500 不走。
      </>
    ),
  },
];

const CANNED_POST = `{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident",
  "body": "quia et suscipit\\nsuscipit recusandae…"
}`;

type FcState =
  | { phase: "idle" }
  | { phase: "loading"; sc: FcScenario }
  | {
      phase: "done";
      sc: FcScenario;
      kind: "ok" | "http-error" | "net-error";
      status: number | null;
      body: string | null;
      simulated: boolean;
    };

export function FetchLab() {
  const [st, setSt] = useState<FcState>({ phase: "idle" });

  const run = async (sc: FcScenario) => {
    setSt({ phase: "loading", sc });
    try {
      const res = await fetch(sc.url);
      if (!res.ok) {
        setSt({
          phase: "done",
          sc,
          kind: "http-error",
          status: res.status,
          body: await res.text().catch(() => null),
          simulated: false,
        });
      } else {
        const data = await res.json();
        setSt({
          phase: "done",
          sc,
          kind: "ok",
          status: res.status,
          body: JSON.stringify(data, null, 2),
          simulated: false,
        });
      }
    } catch {
      if (sc.id === "offline") {
        // 这正是本场景想要的结局
        setSt({
          phase: "done",
          sc,
          kind: "net-error",
          status: null,
          body: null,
          simulated: false,
        });
      } else if (sc.id === "ok") {
        // 现在连不上外网 —— 降级为内置的同款响应
        setSt({
          phase: "done",
          sc,
          kind: "ok",
          status: 200,
          body: CANNED_POST,
          simulated: true,
        });
      } else {
        setSt({
          phase: "done",
          sc,
          kind: "http-error",
          status: 404,
          body: "{}",
          simulated: true,
        });
      }
    }
  };

  const active = st.phase !== "idle" ? st.sc : null;

  return (
    <div className="viz fc-lab">
      <div className="viz-title">三种结局,亲手各踩一遍</div>
      <div className="fc-lab-btns">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            type="button"
            className={`btn btn-sm${active?.id === sc.id ? " btn-primary" : ""}`}
            disabled={st.phase === "loading"}
            onClick={() => run(sc)}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {st.phase === "idle" && (
        <div className="viz-msg">
          点一个按钮,你的浏览器会<b>真的</b>发出这个请求,
          下面的代码会高亮出它这次走过的分支。三个都点一遍,坑就认全了。
        </div>
      )}

      {st.phase === "loading" && (
        <div className="viz-msg">
          <span className="fc-lab-url">GET {st.sc.url}</span>
          <br />
          请求在路上……
        </div>
      )}

      {st.phase === "done" && (
        <>
          <div className="fc-lab-meta">
            <span className="fc-lab-url">GET {st.sc.url}</span>
            {st.status !== null ? (
              <Status
                code={st.status}
                text={
                  st.status === 200 ? "OK" : st.status === 404 ? "Not Found" : ""
                }
              />
            ) : (
              <span className="fc-lab-err">TypeError: Failed to fetch</span>
            )}
            {st.simulated && (
              <span className="fc-lab-sim">
                当前连不上外网,以下是内置的同款结果
              </span>
            )}
          </div>
          <CodeBlock
            lang="js"
            title="load.js · 高亮 = 这次走过的行"
            code={FETCH_CODE}
            hl={st.sc.hl}
            note={st.sc.path}
          />
          {st.body !== null && (
            <pre className="fc-lab-body">{st.body}</pre>
          )}
        </>
      )}
    </div>
  );
}

/* ================= PokedexWidget ================= */

interface PokeData {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  sprite: string | null;
}

const POKE_FALLBACK: Record<string, PokeData> = {
  pikachu: {
    id: 25,
    name: "pikachu",
    height: 4,
    weight: 60,
    types: ["electric"],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  },
  ditto: {
    id: 132,
    name: "ditto",
    height: 3,
    weight: 40,
    types: ["normal"],
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png",
  },
};

const POKE_SUGGEST = ["pikachu", "ditto", "eevee", "snorlax"];

type PokeState =
  | { phase: "idle" }
  | { phase: "loading"; name: string }
  | { phase: "ok"; data: PokeData; offline: boolean }
  | { phase: "notfound"; name: string }
  | { phase: "error" };

export function PokedexWidget() {
  const [input, setInput] = useState("pikachu");
  const [st, setSt] = useState<PokeState>({ phase: "idle" });
  const [imgBroken, setImgBroken] = useState(false);

  const go = async (raw?: string) => {
    const name = (raw ?? input).trim().toLowerCase();
    if (!name) return;
    if (raw) setInput(raw);
    setImgBroken(false);
    setSt({ phase: "loading", name });
    try {
      const res = await fetch(
        "https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(name),
      );
      if (res.status === 404) {
        setSt({ phase: "notfound", name });
        return;
      }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const p = await res.json();
      setSt({
        phase: "ok",
        offline: false,
        data: {
          id: p.id,
          name: p.name,
          height: p.height,
          weight: p.weight,
          types: (p.types ?? []).map(
            (t: { type: { name: string } }) => t.type.name,
          ),
          sprite: p.sprites?.front_default ?? null,
        },
      });
    } catch {
      const fb = POKE_FALLBACK[name];
      if (fb) setSt({ phase: "ok", data: fb, offline: true });
      else setSt({ phase: "error" });
    }
  };

  return (
    <div className="viz fc-poke">
      <div className="viz-title">试玩版 · 真的在调 PokeAPI</div>
      <div className="fc-poke-form">
        <input
          className="fc-input"
          value={input}
          placeholder="输入宝可梦英文名,如 pikachu"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") go();
          }}
          disabled={st.phase === "loading"}
        />
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => go()}
          disabled={st.phase === "loading" || !input.trim()}
        >
          {st.phase === "loading" ? "查询中…" : "查询"}
        </button>
      </div>
      <div className="fc-poke-chips">
        {POKE_SUGGEST.map((n) => (
          <button
            key={n}
            type="button"
            className="btn btn-sm"
            disabled={st.phase === "loading"}
            onClick={() => go(n)}
          >
            {n}
          </button>
        ))}
      </div>

      {st.phase === "idle" && (
        <div className="viz-msg">
          输入名字点「查询」,或直接点上面的候选 ——
          浏览器会真的向 <code>pokeapi.co</code> 发一个 GET 请求。
        </div>
      )}

      {st.phase === "loading" && (
        <div className="viz-msg">
          <span className="fc-lab-url">
            GET https://pokeapi.co/api/v2/pokemon/{st.name}
          </span>
          <br />
          请求在路上……
        </div>
      )}

      {st.phase === "notfound" && (
        <div className="viz-msg">
          <Status code={404} text="Not Found" /> —— 没有叫「{st.name}
          」的宝可梦。注意:服务器认真地回了话,这就是状态码的价值。
          试试 pikachu、ditto、eevee 或 snorlax(注意用英文名)。
        </div>
      )}

      {st.phase === "error" && (
        <div className="viz-msg">
          网络好像不通 —— 试试内置缓存了数据的 pikachu 或
          ditto,断网也能看到效果。
        </div>
      )}

      {st.phase === "ok" && (
        <>
          {st.offline && (
            <div className="viz-msg">
              现在连不上外网,展示的是内置的本地数据 ——
              字段和真实响应完全一致。
            </div>
          )}
          <div className="fc-poke-card">
            {st.data.sprite && !imgBroken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="fc-poke-sprite"
                src={st.data.sprite}
                alt={st.data.name}
                onError={() => setImgBroken(true)}
              />
            ) : (
              <div className="fc-poke-sprite fc-poke-sprite-fallback">?</div>
            )}
            <div>
              <div className="fc-poke-name">
                {st.data.name}
                <span className="fc-poke-id">
                  #{String(st.data.id).padStart(3, "0")}
                </span>
              </div>
              <div className="fc-poke-stats">
                <span className="fc-poke-stat">
                  <b>{st.data.height / 10} m</b>身高
                </span>
                <span className="fc-poke-stat">
                  <b>{st.data.weight / 10} kg</b>体重
                </span>
                <span className="fc-poke-stat">
                  <b>{st.data.types.join(" / ") || "?"}</b>属性
                </span>
              </div>
            </div>
          </div>
          <div className="viz-msg">
            数据链路:<code>fetch → res.json() → 改 DOM</code>。
            身高体重的单位是分米和百克 —— 光看数字猜不出来,
            这种事永远以<b>文档</b>为准。
          </div>
        </>
      )}
    </div>
  );
}

/* ================= NetworkTour ================= */

interface DtTab {
  id: string;
  label: string;
  title: string;
  body: ReactNode;
}

const DT_TABS: DtTab[] = [
  {
    id: "headers",
    label: "Headers",
    title: "这次对话的信封与抬头",
    body: (
      <>
        <p>
          分三段:<b>General</b>(完整 URL、请求方法、状态码 ——
          第 01 章的主角们都在这)、<b>Response Headers</b>(服务器回信的抬头)、
          <b>Request Headers</b>(你寄出去的抬头)。
        </p>
        <p>
          查 Content-Type 对不对、缓存头给了没、带没带
          Authorization —— 第一站永远是这里。
        </p>
      </>
    ),
  },
  {
    id: "payload",
    label: "Payload",
    title: "你随请求寄出去的东西",
    body: (
      <>
        <p>
          两样:URL 里的<b>查询参数</b>(Query String Parameters,
          已经帮你拆成一行一个),和 POST/PUT 的<b>请求体</b>(Request
          Payload)。
        </p>
        <p>
          「明明传了参数怎么没生效?」—— 来这一看,大概率是名字拼错了、
          或者 JSON.stringify 忘了。排查参数问题的第一站。
        </p>
      </>
    ),
  },
  {
    id: "response",
    label: "Response",
    title: "服务器回的正文原文",
    body: (
      <>
        <p>
          一字不差的响应体。旁边的 <b>Preview</b>{" "}
          标签是同一份东西的折叠树视图,大 JSON 用它看更舒服。
        </p>
        <p>
          前端说「接口没返回这个字段」,后端说「明明有」——
          打开这里看响应原文,几秒就能确认。
        </p>
      </>
    ),
  },
  {
    id: "timing",
    label: "Timing",
    title: "这一趟时间都花在哪了",
    body: (
      <>
        <p>
          排队、DNS 解析、建立连接、<b>等待服务器首字节(TTFB)</b>、
          下载内容 —— 每一段各花了几毫秒,瀑布图一目了然。
        </p>
        <p>
          接口慢,先看是「等」慢(服务器处理久,TTFB 长)还是「传」慢
          (响应太大,下载久)—— 药方完全不同。
        </p>
      </>
    ),
  },
];

export function NetworkTour() {
  const [sel, setSel] = useState(0);
  const tab = DT_TABS[sel];

  return (
    <div className="fc-dt">
      <div className="fc-dt-bar" role="tablist" aria-label="Network 面板标签页">
        {DT_TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={sel === i}
            className={`fc-dt-tab${sel === i ? " on" : ""}`}
            onClick={() => setSel(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="fc-dt-panel" aria-live="polite">
        <div className="fc-dt-name">{tab.title}</div>
        {tab.body}
      </div>
    </div>
  );
}
