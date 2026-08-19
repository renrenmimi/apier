"use client";

// 序章专属可视化:
//  - HeroLoop:hero 里的请求/响应循环动画(纯 CSS 驱动)。
//  - JourneyFlow:一次完整请求的旅程,逐帧慢放(浏览器 → 服务器 → 数据库 → 回来)。
//  - JsonAnatomy:点一行 JSON,右边告诉你这一行是什么。
//  - LiveFetch:真的向公开 API 发一次请求(断网时降级为内置缓存响应)。
//  - CourseMap:全书 12 章地图,按阵营分组。

import { Fragment, useState, type ReactNode } from "react";
import Link from "next/link";
import { CHAPTERS, type Chapter } from "@/lib/curriculum";
import { FlowStepper, type FlowFrame } from "@/lib/stepper";
import { useL, T, type Loc } from "@/lib/i18n";

/* ================= HeroLoop ================= */

export function HeroLoop() {
  return (
    <div className="hm-loop" aria-hidden>
      <div className="flow-node lit">
        <span className="ico">🖥️</span>
        <T en="Your page" zh="你的网页" />
      </div>
      <div className="flow-mid hm-loop-mid">
        <div className="flow-line" />
        <span className="flow-packet hm-go">GET /menu</span>
        <span className="flow-packet back hm-back">200 OK · JSON</span>
      </div>
      <div className="flow-node">
        <span className="ico">🗄️</span>
        <T en="Server" zh="服务器" />
      </div>
    </div>
  );
}

/* ================= JourneyFlow ================= */

function Stage({
  lit,
  packet,
  packetAt,
  back,
}: {
  /** 点亮哪个节点:0 浏览器 / 1 服务器 / 2 数据库 */
  lit?: number;
  packet?: ReactNode;
  /** 包裹在哪一段:0 浏览器↔服务器 / 1 服务器↔数据库 */
  packetAt?: number;
  back?: boolean;
}) {
  const nodes = [
    { ico: "🖥️", label: <T en="Browser" zh="浏览器" /> },
    { ico: "🗄️", label: <T en="Server" zh="服务器" /> },
    { ico: "💾", label: <T en="Database" zh="数据库" /> },
  ];
  return (
    <div className="flow hm-journey">
      {nodes.map((n, i) => (
        <Fragment key={i}>
          <div className={`flow-node${lit === i ? " lit" : ""}`}>
            <span className="ico">{n.ico}</span>
            {n.label}
          </div>
          {i < 2 && (
            <div className="flow-mid">
              <div className="flow-line" />
              {packet && packetAt === i && (
                <span className={`flow-packet${back ? " back" : ""}`}>
                  {packet}
                </span>
              )}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

const JOURNEY_FRAMES: FlowFrame[] = [
  {
    stage: <Stage lit={0} />,
    msg: (
      <T
        en={
          <>
            You click &quot;View profile&quot; on the page. Your JavaScript now
            has to <b>get the data</b>. That data is not on your computer. It
            lives on a server somewhere else.
          </>
        }
        zh={
          <>
            你在页面上点了「查看用户资料」。你的 JavaScript 要去帮你
            <b>拿数据</b>了 —— 数据不在你电脑上,在千里之外的服务器里。
          </>
        }
      />
    ),
  },
  {
    stage: <Stage packet="GET /users/42" packetAt={0} />,
    msg: (
      <T
        en={
          <>
            The JavaScript sends a <b>request</b>: give me user 42. The request
            has a strict format. That format is HTTP, and chapter 01 covers it.
          </>
        }
        zh={
          <>
            JS 发出一个<b>请求(request)</b>:「把 42 号用户给我」。
            这句话有严格的格式 —— 这个格式就是 HTTP,第 01 章专门讲它。
          </>
        }
      />
    ),
  },
  {
    stage: <Stage lit={1} />,
    msg: (
      <T
        en={
          <>
            The server receives it. A server is a <b>computer that stays on</b>,
            running one program with one job: listen for requests, do the work,
            and reply.
          </>
        }
        zh={
          <>
            服务器收到了。它是一台<b>一直开着的电脑</b>,上面跑着一段程序,
            整天就干一件事:听请求、办事、回话。
          </>
        }
      />
    ),
  },
  {
    stage: (
      <Stage
        packet={<T en="find user 42" zh="查:42 号用户" />}
        packetAt={1}
      />
    ),
    msg: (
      <T
        en={
          <>
            The server turns to the database, which is where the data actually
            lives. Note that your page <b>never touches the database directly</b>
            . Everything goes through the server. The note below this player
            explains why.
          </>
        }
        zh={
          <>
            服务器转身去问数据库 —— 数据真正住的地方。注意:你的网页
            <b>永远不直接碰数据库</b>,一切都要经过服务器这道关卡。
            为什么?看播放器下面那段说明。
          </>
        }
      />
    ),
  },
  {
    stage: (
      <Stage
        lit={2}
        packet={<T en="user 42 record" zh="42 号的资料" />}
        packetAt={1}
        back
      />
    ),
    msg: (
      <T
        en={<>The database finds user 42 and hands the record back to the server.</>}
        zh={<>数据库翻出 42 号用户的资料,交还给服务器。</>}
      />
    ),
  },
  {
    stage: <Stage lit={1} packet="200 OK + JSON" packetAt={0} back />,
    msg: (
      <T
        en={
          <>
            The server packs the data as <b>JSON</b> (see §04), attaches the
            label <b>200 OK</b>, which means the request succeeded, and sends it
            all back as the <b>response</b>.
          </>
        }
        zh={
          <>
            服务器把数据打包成 <b>JSON</b>(§04 讲),贴上「<b>200 OK</b>
            ,办成了」的标签,作为<b>响应(response)</b>寄回去。
          </>
        }
      />
    ),
  },
  {
    stage: <Stage lit={0} />,
    msg: (
      <T
        en={
          <>
            The response arrives. Your JavaScript reads the JSON and puts the
            values into the page, so the user sees the profile. The whole trip
            usually takes less than a second.{" "}
            <b>One request and one response together make one API call.</b>
          </>
        }
        zh={
          <>
            响应到家。你的 JS 把 JSON 拆开,填进页面 —— 用户看到了资料。
            整趟旅程通常不到一秒。<b>这一来一回,就是一次 API 调用。</b>
          </>
        }
      />
    ),
  },
];

export function JourneyFlow() {
  return (
    <FlowStepper
      title={{
        en: "One API call, played back step by step",
        zh: "一次 API 调用的完整旅程(逐帧慢放)",
      }}
      frames={JOURNEY_FRAMES}
    />
  );
}

/* ================= JsonAnatomy ================= */

interface JsonLine {
  code: string;
  indent: number;
  info: ReactNode;
}

const JSON_LINES: JsonLine[] = [
  {
    code: "{",
    indent: 0,
    info: (
      <T
        en={
          <>
            The opening brace starts an <b>object</b>: a set of key and value
            pairs. It looks the same as an object literal in JavaScript. That is
            not a coincidence. JSON stands for JavaScript Object Notation.
          </>
        }
        zh={
          <>
            花括号开场:这是一个<b>对象(object)</b>,一组「键: 值」对。
            跟你在 JS 里写的对象长得一模一样 —— 这不是巧合,JSON 的全名就是
            JavaScript Object Notation。
          </>
        }
      />
    ),
  },
  {
    code: '"id": 42,',
    indent: 1,
    info: (
      <T
        en={
          <>
            A key must be a <b>string in double quotes</b>. JavaScript allows
            unquoted keys, JSON does not. The value 42 is a number, and numbers
            take no quotes. The comma at the end means another pair follows.
          </>
        }
        zh={
          <>
            键必须是<b>双引号字符串</b>(JS 里可以不带引号,JSON 里必须带)。
            值 42 是数字,数字不加引号。行尾的逗号表示「后面还有」。
          </>
        }
      />
    ),
  },
  {
    code: '"name": "Ada Lovelace",',
    indent: 1,
    info: (
      <T
        en={
          <>
            A string value, wrapped in double quotes. JSON accepts{" "}
            <b>double quotes only</b>. Single quotes are a syntax error. This is
            the first thing beginners get wrong.
          </>
        }
        zh={
          <>
            字符串值,双引号包住。注意 JSON <b>只认双引号</b>,单引号会直接报错 ——
            新手第一坑。
          </>
        }
      />
    ),
  },
  {
    code: '"vip": true,',
    indent: 1,
    info: (
      <T
        en={
          <>
            A boolean: <code>true</code> or <code>false</code>, without quotes.
            There is also <code>null</code>, which means there is no value. That
            is the whole list of JSON types: object, array, string, number,
            boolean, and null.
          </>
        }
        zh={
          <>
            布尔值:<code>true</code> / <code>false</code>,不带引号。还有一个
            <code>null</code> 表示「没有值」。JSON 的全部家当就这么几样:
            对象、数组、字符串、数字、布尔、null。
          </>
        }
      />
    ),
  },
  {
    code: '"tags": ["frontend", "js"],',
    indent: 1,
    info: (
      <T
        en={
          <>
            Square brackets make an <b>array</b>: values in order. An array can
            hold any type, including more objects. When an API returns a list of
            articles or a page of comments, it uses an array.
          </>
        }
        zh={
          <>
            方括号是<b>数组(array)</b>:一串按顺序排的值。数组里可以装任何类型,
            包括再装对象 —— API 返回「一列文章」「一页评论」用的就是它。
          </>
        }
      />
    ),
  },
  {
    code: '"address": { "city": "London" }',
    indent: 1,
    info: (
      <T
        en={
          <>
            A value can also be <b>another object</b>. Real API responses are
            often nested three or four levels deep. Read them one level at a
            time.
          </>
        }
        zh={
          <>
            值也可以是<b>另一个对象</b> —— 对象套对象,像俄罗斯套娃。
            真实 API 的响应经常套三四层,别慌,一层层拆就是了。
          </>
        }
      />
    ),
  },
  {
    code: "}",
    indent: 0,
    info: (
      <T
        en={
          <>
            The closing brace. The important part: JSON is <b>text</b>. Only
            text travels over the network. In your JavaScript you call{" "}
            <code>response.json()</code> or <code>JSON.parse()</code> to turn
            that text back into a real object before you can read fields from
            it.
          </>
        }
        zh={
          <>
            收尾。重要的事:JSON 本质上是<b>一段文本</b>。在网线上跑的永远是文本,
            到了你的 JS 里,要用 <code>response.json()</code> 或{" "}
            <code>JSON.parse()</code> 把文本「复活」成真正的对象,才能用点号取值。
          </>
        }
      />
    ),
  },
];

export function JsonAnatomy() {
  const [sel, setSel] = useState(1);
  const line = JSON_LINES[sel];

  return (
    <div className="hm-json">
      <div className="hm-json-win">
        <div className="codewin-bar">
          <span className="codewin-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="codewin-name">
            <T
              en="response.json · click any line"
              zh="response.json · 点每一行试试"
            />
          </span>
          <span style={{ width: 47 }} aria-hidden />
        </div>
        <div className="hm-json-body">
          {JSON_LINES.map((l, i) => (
            <button
              key={i}
              type="button"
              className={`hm-json-line${sel === i ? " on" : ""}`}
              style={{ paddingLeft: 14 + l.indent * 22 }}
              onClick={() => setSel(i)}
            >
              {l.code}
            </button>
          ))}
        </div>
      </div>
      <div className="hm-json-info" aria-live="polite">
        <div className="hm-json-info-code">{line.code}</div>
        <p>{line.info}</p>
      </div>
    </div>
  );
}

/* ================= LiveFetch ================= */

interface Preset {
  id: string;
  label: Loc<string>;
  url: string;
  /** 断网降级用的缓存响应 */
  fallback: unknown;
}

const PRESETS: Preset[] = [
  {
    id: "user",
    label: { en: "Ask for a user", zh: "要一位用户" },
    url: "https://jsonplaceholder.typicode.com/users/1",
    fallback: {
      id: 1,
      name: "Leanne Graham",
      username: "Bret",
      email: "Sincere@april.biz",
      address: { city: "Gwenborough" },
      phone: "1-770-736-8031 x56442",
      website: "hildegard.org",
    },
  },
  {
    id: "post",
    label: { en: "Ask for an article", zh: "要一篇文章" },
    url: "https://jsonplaceholder.typicode.com/posts/1",
    fallback: {
      userId: 1,
      id: 1,
      title: "sunt aut facere repellat provident",
      body: "quia et suscipit\nsuscipit recusandae consequuntur…",
    },
  },
  {
    id: "product",
    label: { en: "Ask for a product", zh: "要一件商品" },
    url: "https://dummyjson.com/products/1",
    fallback: {
      id: 1,
      title: "Essence Mascara Lash Princess",
      category: "beauty",
      price: 9.99,
      rating: 2.56,
      stock: 99,
      brand: "Essence",
    },
  },
];

type LiveState =
  | { phase: "idle" }
  | { phase: "loading"; preset: Preset }
  | {
      phase: "done";
      preset: Preset;
      status: number | null;
      ms: number;
      body: string;
      offline: boolean;
    };

export function LiveFetch() {
  const L = useL();
  const [st, setSt] = useState<LiveState>({ phase: "idle" });

  const go = async (preset: Preset) => {
    setSt({ phase: "loading", preset });
    const t0 = performance.now();
    try {
      const res = await fetch(preset.url);
      // 服务器回了话就算「通」—— 哪怕是 4xx/5xx。正文按 JSON 解析,
      // 解析不了就原样显示文本,别把「服务器报错」误报成「网络不通」。
      const raw = await res.text();
      let body = raw;
      try {
        body = JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        /* 不是 JSON(常见于错误页),原样贴出来 */
      }
      setSt({
        phase: "done",
        preset,
        status: res.status,
        ms: Math.round(performance.now() - t0),
        body,
        offline: false,
      });
    } catch {
      setSt({
        phase: "done",
        preset,
        status: null,
        ms: Math.round(performance.now() - t0),
        body: JSON.stringify(preset.fallback, null, 2),
        offline: true,
      });
    }
  };

  return (
    <div className="viz hm-live">
      <div className="viz-title">
        <T en="Send a real request now" zh="真枪实弹:现在就发一个请求" />
      </div>
      <div className="hm-live-btns">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`btn btn-sm${
              st.phase !== "idle" && st.preset.id === p.id ? " btn-primary" : ""
            }`}
            disabled={st.phase === "loading"}
            onClick={() => go(p)}
          >
            {L(p.label)}
          </button>
        ))}
      </div>

      {st.phase === "idle" && (
        <div className="viz-msg">
          <T
            en="Click a button. Your browser really does send a request to a public server on the internet, and the response is printed below exactly as it arrives."
            zh="点一个按钮 —— 你的浏览器会真的向互联网上的公开服务器发一次请求,响应原样贴在下面。"
          />
        </div>
      )}

      {st.phase === "loading" && (
        <div className="viz-msg">
          <span className="hm-live-req">GET {st.preset.url}</span>
          <br />
          <T en="Request sent, waiting for the reply…" zh="请求在路上……" />
        </div>
      )}

      {st.phase === "done" && (
        <>
          <div className="hm-live-meta">
            <span className="hm-live-req">GET {st.preset.url}</span>
            {st.status !== null ? (
              <span className="status" data-x={Math.floor(st.status / 100)}>
                {st.status} {st.status === 200 ? "OK" : ""}
              </span>
            ) : (
              <span className="status" data-x={5}>
                <T en="No connection" zh="网络不通" />
              </span>
            )}
            <span className="mono dim">{st.ms} ms</span>
          </div>
          {st.offline && (
            <div className="viz-msg">
              <T
                en="The network is not reachable right now, so this is a saved copy of the same response. The format is identical."
                zh="现在连不上外网,先看一份之前存下来的同款响应 —— 内容格式一模一样。"
              />
            </div>
          )}
          <pre className="hm-live-body">{st.body}</pre>
          <div className="viz-msg">
            <T
              en={
                <>
                  Look closely: the response is a piece of <b>JSON text</b>.
                  Every language and every device receives the same text. That
                  is why an API can connect systems written in different
                  languages.
                </>
              }
              zh={
                <>
                  看清楚了:响应就是一段 <b>JSON 文本</b>。任何语言、任何设备,
                  拿到的都是这段文本 —— 这就是 API 能连接万物的原因。
                </>
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ================= CourseMap ================= */

const CAMPS: { id: Chapter["camp"]; label: Loc<string> }[] = [
  {
    id: "core",
    label: {
      en: "Foundations · three chapters everyone needs",
      zh: "地基 · 人人要过的三关",
    },
  },
  {
    id: "rest",
    label: { en: "REST · a world of resources", zh: "REST 蓝方 · 资源的世界" },
  },
  {
    id: "graphql",
    label: {
      en: "GraphQL · ask for exactly what you need",
      zh: "GraphQL 粉方 · 按需点菜",
    },
  },
  {
    id: "verdict",
    label: { en: "Finale · you make the call", zh: "终章 · 你来做裁判" },
  },
];

export function CourseMap() {
  const L = useL();
  return (
    <div className="hm-map">
      {CAMPS.map((camp) => (
        <div key={camp.id}>
          <div className="hm-map-camp">{L(camp.label)}</div>
          <div className="hm-map-grid">
            {CHAPTERS.filter((c) => c.camp === camp.id).map((c) => (
              <Link
                key={c.id}
                href={c.href}
                className="card hoverable hm-map-card"
                style={{ "--ch-hue": c.hue, "--hue": c.hue } as React.CSSProperties}
              >
                <span className="hm-map-num">{c.num}</span>
                <span className="hm-map-title">{L(c.title)}</span>
                <span className="hm-map-essence">{L(c.essence)}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
