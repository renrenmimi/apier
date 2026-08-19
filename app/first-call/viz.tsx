"use client";

// 第 02 章专属可视化(双语,英文默认):
//  - HeroDrive:hero 里的循环动画(你的 JavaScript ↔ 真实世界的 API)。
//  - FetchLab:三种结局亲手踩 —— 正常 / 404 / 域名不存在,真 fetch + 代码分支高亮,失败自动降级。
//  - PokedexWidget:真的能玩的宝可梦查询器(真 fetch PokeAPI,断网降级内置数据)。
//  - NetworkTour:DevTools Network 面板导览(可点的标签页)。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { useState, type ReactNode } from "react";
import { CodeBlock } from "@/lib/code";
import { Status } from "@/lib/kit";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroDrive ================= */

export function HeroDrive() {
  return (
    <div className="fc-loop" aria-hidden>
      <div className="flow-node lit">
        <span className="ico">🧑‍💻</span>
        <T en="Your JavaScript" zh="你的 JS" />
      </div>
      <div className="flow-mid fc-loop-mid">
        <div className="flow-line" />
        <span className="flow-packet fc-go">await fetch(url)</span>
        <span className="flow-packet back fc-back">200 OK · JSON</span>
      </div>
      <div className="flow-node">
        <span className="ico">🌍</span>
        <T en="A real API" zh="真实世界的 API" />
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
    console.log("ok:", data);
  } catch (err) {
    console.error("failed:", err.message);
  }
}`;

interface FcScenario {
  id: "ok" | "notfound" | "offline";
  label: Loc<string>;
  url: string;
  hl: number[];
  path: ReactNode;
}

const SCENARIOS: FcScenario[] = [
  {
    id: "ok",
    label: { en: "① A working URL", zh: "① 正常 URL" },
    url: "https://jsonplaceholder.typicode.com/posts/1",
    hl: [3, 7, 8],
    path: (
      <T
        en={
          <>
            Line 3: the fetch Promise resolves, <code>res.status</code> is 200
            and <code>res.ok</code> is true, so the <code>if</code> is skipped.
            Line 7 parses the body, line 8 prints it. The{" "}
            <code>catch</code> block is never reached.
          </>
        }
        zh={
          <>
            第 3 行:fetch 的 Promise 兑现,<code>res.status</code> 是 200,
            <code>res.ok</code> 是 true,跳过 <code>if</code>。
            第 7 行解析正文,第 8 行打印。全程没进 <code>catch</code>。
          </>
        }
      />
    ),
  },
  {
    id: "notfound",
    label: { en: "② A URL that returns 404", zh: "② 404 的 URL" },
    url: "https://jsonplaceholder.typicode.com/nothing-here",
    hl: [3, 4, 5, 9, 10],
    path: (
      <T
        en={
          <>
            Line 3: notice that the fetch Promise <b>still resolved</b>. The
            server answered; the answer happens to be 404. So{" "}
            <code>res.ok</code> is false, lines 4 and 5 raise that status into an
            error, and the <code>catch</code> on lines 9 and 10 receives it.
            Without that <code>if</code>, the
            program would carry on with the body of a 404 response and fail much
            later, far from the real cause.
          </>
        }
        zh={
          <>
            第 3 行:注意,fetch 的 Promise <b>照样兑现了</b> ——
            服务器回了话,只是回的是 404。所以 <code>res.ok</code> 是 false,
            第 4、5 行把这个状态升级成错误,第 9、10 行的 <code>catch</code>{" "}
            接住。要是不写这个 <code>if</code>,程序会带着 404 的响应正文继续往下跑,
            在离出错点很远的地方才失败。
          </>
        }
      />
    ),
  },
  {
    id: "offline",
    label: {
      en: "③ A hostname that does not exist",
      zh: "③ 域名不存在",
    },
    url: "https://api.no-such-host-anywhere.example/data",
    hl: [3, 9, 10],
    path: (
      <T
        en={
          <>
            Line 3: the hostname does not resolve, so the request never leaves
            the machine. This is the case where fetch rejects on its own.
            Execution jumps to the <code>catch</code> on lines 9 and 10, and{" "}
            <code>err</code> is <code>TypeError: Failed to fetch</code>. Only
            network-level failures take this path. 404 and 500 do not.
          </>
        }
        zh={
          <>
            第 3 行:域名解析不了,请求根本发不出去。这才是 fetch 自己
            reject 的情形,直接跳到第 9、10 行的 <code>catch</code>,
            <code>err</code> 是 <code>TypeError: Failed to fetch</code>。
            只有网络层失败会走这条路,404、500 不会。
          </>
        }
      />
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
  const L = useL();
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
      <div className="viz-title">
        <T
          en="Three outcomes, run each one yourself"
          zh="三种结局,亲手各跑一遍"
        />
      </div>
      <div className="fc-lab-btns">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            type="button"
            className={`btn btn-sm${active?.id === sc.id ? " btn-primary" : ""}`}
            disabled={st.phase === "loading"}
            onClick={() => run(sc)}
          >
            {L(sc.label)}
          </button>
        ))}
      </div>

      {st.phase === "idle" && (
        <div className="viz-msg">
          <T
            en={
              <>
                Press a button. Your browser <b>really</b> sends that request,
                and the code below highlights the lines this run went through.
                Try all three.
              </>
            }
            zh={
              <>
                点一个按钮,你的浏览器会<b>真的</b>发出这个请求,
                下面的代码会高亮出这次走过的行。三个都点一遍。
              </>
            }
          />
        </div>
      )}

      {st.phase === "loading" && (
        <div className="viz-msg">
          <span className="fc-lab-url">GET {st.sc.url}</span>
          <br />
          <T en="Request in flight…" zh="请求在路上……" />
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
                <T
                  en="No internet connection right now, so this is a built-in copy of the same result."
                  zh="当前连不上外网,以下是内置的同款结果"
                />
              </span>
            )}
          </div>
          <CodeBlock
            lang="js"
            title={{
              en: "load.js · highlighted = the lines this run used",
              zh: "load.js · 高亮 = 这次走过的行",
            }}
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
  const L = useL();
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
      <div className="viz-title">
        <T
          en="Live demo · this really calls PokeAPI"
          zh="试玩版 · 真的在调 PokeAPI"
        />
      </div>
      <div className="fc-poke-form">
        <input
          className="fc-input"
          value={input}
          placeholder={L({
            en: "Pokemon name, for example pikachu",
            zh: "输入宝可梦英文名,如 pikachu",
          })}
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
          {st.phase === "loading"
            ? L({ en: "Searching…", zh: "查询中…" })
            : L({ en: "Search", zh: "查询" })}
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
          <T
            en={
              <>
                Type a name and press Search, or use one of the buttons above.
                The browser really sends a GET request to{" "}
                <code>pokeapi.co</code>.
              </>
            }
            zh={
              <>
                输入名字点「查询」,或者直接点上面的候选 ——
                浏览器会真的向 <code>pokeapi.co</code> 发一个 GET 请求。
              </>
            }
          />
        </div>
      )}

      {st.phase === "loading" && (
        <div className="viz-msg">
          <span className="fc-lab-url">
            GET https://pokeapi.co/api/v2/pokemon/{st.name}
          </span>
          <br />
          <T en="Request in flight…" zh="请求在路上……" />
        </div>
      )}

      {st.phase === "notfound" && (
        <div className="viz-msg">
          <Status code={404} text="Not Found" />{" "}
          <T
            en={
              <>
                — there is no Pokemon called &quot;{st.name}&quot;. The server
                answered clearly, which is exactly what a status code is for. Try
                pikachu, ditto, eevee, or snorlax. Names have to be in English.
              </>
            }
            zh={
              <>
                —— 没有叫「{st.name}」的宝可梦。服务器认真地回答了,
                这正是状态码的用处。试试 pikachu、ditto、eevee 或
                snorlax,名字要用英文。
              </>
            }
          />
        </div>
      )}

      {st.phase === "error" && (
        <div className="viz-msg">
          <T
            en="The network does not seem to be reachable. Try pikachu or ditto: their data is built into this page, so the demo still works offline."
            zh="网络好像不通。试试 pikachu 或 ditto —— 它们的数据内置在本页,断网也能看到效果。"
          />
        </div>
      )}

      {st.phase === "ok" && (
        <>
          {st.offline && (
            <div className="viz-msg">
              <T
                en="No internet connection right now, so this is built-in local data. The fields are the same as in the real response."
                zh="当前连不上外网,这里显示的是内置的本地数据 —— 字段和真实响应完全一致。"
              />
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
                  <b>{st.data.height / 10} m</b>
                  <T en="Height" zh="身高" />
                </span>
                <span className="fc-poke-stat">
                  <b>{st.data.weight / 10} kg</b>
                  <T en="Weight" zh="体重" />
                </span>
                <span className="fc-poke-stat">
                  <b>{st.data.types.join(" / ") || "?"}</b>
                  <T en="Type" zh="属性" />
                </span>
              </div>
            </div>
          </div>
          <div className="viz-msg">
            <T
              en={
                <>
                  The path was <code>fetch → res.json() → update the DOM</code>.
                  The units in the response are decimeters and hectograms, which
                  is why both numbers are divided by 10. You cannot guess that
                  from the numbers alone. For this kind of detail the{" "}
                  <b>documentation</b> is the only reliable source.
                </>
              }
              zh={
                <>
                  这条链路是 <code>fetch → res.json() → 改 DOM</code>。
                  响应里的单位是分米和百克,所以两个数字都除以了 10。
                  光看数字猜不出来,这种事只能以<b>文档</b>为准。
                </>
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ================= NetworkTour ================= */

interface DtTab {
  id: string;
  /** DevTools 里的标签名,不翻译 */
  label: string;
  title: ReactNode;
  body: ReactNode;
}

const DT_TABS: DtTab[] = [
  {
    id: "headers",
    label: "Headers",
    title: (
      <T en="The metadata of this exchange" zh="这次交互的元数据" />
    ),
    body: (
      <>
        <p>
          <T
            en={
              <>
                Three groups: <b>General</b> (the full URL, the request method,
                and the status code), <b>Response Headers</b> (what the server
                sent back), and <b>Request Headers</b> (what your browser sent).
                Chapter 01 explains what these headers mean.
              </>
            }
            zh={
              <>
                分三组:<b>General</b>(完整 URL、请求方法、状态码)、
                <b>Response Headers</b>(服务器回的头)、
                <b>Request Headers</b>(浏览器发出的头)。
                这些头分别是什么意思,第 01 章讲过。
              </>
            }
          />
        </p>
        <p>
          <T
            en={
              <>
                Checking whether Content-Type is right, whether a caching header
                was sent, or whether Authorization was included: this tab is
                always the first place to look.
              </>
            }
            zh={
              <>
                查 Content-Type 对不对、缓存头有没有给、有没有带上 Authorization
                —— 第一站永远是这里。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "payload",
    label: "Payload",
    title: <T en="What you sent with the request" zh="你随请求寄出去的东西" />,
    body: (
      <>
        <p>
          <T
            en={
              <>
                Two things: the <b>query string parameters</b> from the URL,
                already split into one line each, and the <b>request body</b> of
                a POST or a PUT.
              </>
            }
            zh={
              <>
                两样:URL 里的<b>查询参数</b>(已经按一行一个拆好),
                以及 POST 或 PUT 的<b>请求正文</b>。
              </>
            }
          />
        </p>
        <p>
          <T
            en={
              <>
                &quot;I sent the parameter but nothing changed&quot; usually ends
                here. Most of the time the name is misspelled, or
                JSON.stringify was left out. Start here for any parameter
                problem.
              </>
            }
            zh={
              <>
                「参数明明传了却没生效」的问题一般在这里收场:
                多半是名字拼错了,或者忘了 JSON.stringify。
                查参数问题就从这里开始。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "response",
    label: "Response",
    title: (
      <T
        en="The body the server sent, exactly as it arrived"
        zh="服务器回的正文原文"
      />
    ),
    body: (
      <>
        <p>
          <T
            en={
              <>
                The response body, character for character. The <b>Preview</b>{" "}
                tab beside it shows the same content as a collapsible tree, which
                is easier to read for a large JSON document.
              </>
            }
            zh={
              <>
                一字不差的响应正文。旁边的 <b>Preview</b>{" "}
                标签是同一份内容的折叠树视图,大段 JSON 用它看更省力。
              </>
            }
          />
        </p>
        <p>
          <T
            en={
              <>
                When the front end says a field is missing and the back end says
                it is there, this tab settles it in seconds.
              </>
            }
            zh={
              <>
                前端说「接口没返回这个字段」,后端说「明明有」——
                打开这里看原文,几秒就能定论。
              </>
            }
          />
        </p>
      </>
    ),
  },
  {
    id: "timing",
    label: "Timing",
    title: <T en="Where the time went" zh="时间都花在哪了" />,
    body: (
      <>
        <p>
          <T
            en={
              <>
                Queueing, DNS lookup, connection setup,{" "}
                <b>waiting for the first byte from the server (TTFB)</b>, and
                downloading the content, each with its own duration in
                milliseconds.
              </>
            }
            zh={
              <>
                排队、DNS 解析、建立连接、
                <b>等待服务器的第一个字节(TTFB)</b>、下载内容 ——
                每一段各花了几毫秒,一目了然。
              </>
            }
          />
        </p>
        <p>
          <T
            en={
              <>
                When a request is slow, this tells you whether the server took a
                long time to answer (a large TTFB) or the response was large and
                took a long time to download. The two problems have different
                fixes.
              </>
            }
            zh={
              <>
                接口慢的时候,这里能告诉你是服务器答得慢(TTFB 长),
                还是响应太大、下载得慢。两种问题的解法完全不同。
              </>
            }
          />
        </p>
      </>
    ),
  },
];

export function NetworkTour() {
  const L = useL();
  const [sel, setSel] = useState(0);
  const tab = DT_TABS[sel];

  return (
    <div className="fc-dt">
      <div
        className="fc-dt-bar"
        role="tablist"
        aria-label={L({
          en: "Network panel tabs",
          zh: "Network 面板标签页",
        })}
      >
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
