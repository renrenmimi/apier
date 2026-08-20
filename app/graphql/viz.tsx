"use client";

// 第 07 章 · GraphQL 初见 —— 本章专属可视化(双语,英文默认):
//  - GqHeroLoop:hero 里的「查询 → 服务器 → 响应」循环动画(纯 CSS)。
//  - OverfetchViz:一份大 JSON 响应,点行标记「用得上」,实时算字节浪费率。
//  - UnderfetchWaterfall:三连瀑布请求逐帧慢放(useStepper)。
//  - QueryBuilder:选字段 → 实时生成 query → 实时生成响应(本章核心)。
//  - GraphiqlTour:GraphiQL 界面地图,点区域看讲解。
//  - AdoptionBars:Postman 2025 使用率对比条。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { useMemo, useState, type ReactNode } from "react";
import { CodeBlock } from "@/lib/code";
import { useStepper, StepControls } from "@/lib/stepper";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= GqHeroLoop ================= */

export function GqHeroLoop() {
  return (
    <div className="gq-loop" aria-hidden>
      <div className="flow-node lit">
        <span className="ico">📝</span>
        <T en="Your query" zh="你写的查询" />
      </div>
      <div className="flow-mid gq-loop-mid">
        <div className="flow-line" />
        <span className="flow-packet gq-go">{"query { name status }"}</span>
        <span className="flow-packet back gq-back">
          {"data: { name, status }"}
        </span>
      </div>
      <div className="flow-node">
        <span className="ico">⚙️</span>
        POST /graphql
      </div>
    </div>
  );
}

/* ================= OverfetchViz ================= */

interface OfField {
  k: string;
  v: string;
}

const OF_FIELDS: OfField[] = [
  { k: "id", v: "9" },
  { k: "name", v: '"Ada Wong"' },
  { k: "avatarUrl", v: '"https://cdn.blog.dev/a/9.png"' },
  { k: "email", v: '"ada@blog.dev"' },
  { k: "phone", v: '"+86-138-0000-1234"' },
  { k: "bio", v: '"Writes code, writes words."' },
  { k: "website", v: '"https://ada.dev"' },
  { k: "company", v: '"Indie Studio"' },
  { k: "location", v: '"Hangzhou, China"' },
  { k: "timezone", v: '"Asia/Shanghai"' },
  { k: "language", v: '"zh-CN"' },
  { k: "followers", v: "1284" },
  { k: "following", v: "77" },
  { k: "postsCount", v: "42" },
  { k: "favoritesCount", v: "310" },
  { k: "theme", v: '"dark"' },
  { k: "emailVerified", v: "true" },
  { k: "twoFactorEnabled", v: "true" },
  { k: "newsletter", v: "false" },
  { k: "lastLoginAt", v: '"2026-07-19T21:03:11Z"' },
  { k: "createdAt", v: '"2021-03-14T08:00:00Z"' },
  { k: "updatedAt", v: '"2026-07-18T10:24:36Z"' },
];

const ofLine = (f: OfField, last: boolean) =>
  `  "${f.k}": ${f.v}${last ? "" : ","}`;

export function OverfetchViz() {
  const L = useL();
  const [used, setUsed] = useState<Set<string>>(
    () => new Set(["id", "name", "avatarUrl"]),
  );

  const { total, mine } = useMemo(() => {
    let total = 0;
    let mine = 0;
    OF_FIELDS.forEach((f, i) => {
      const n = ofLine(f, i === OF_FIELDS.length - 1).length;
      total += n;
      if (used.has(f.k)) mine += n;
    });
    return { total, mine };
  }, [used]);

  const waste = total === 0 ? 0 : Math.round(((total - mine) / total) * 100);

  const toggle = (k: string) =>
    setUsed((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <div className="viz gq-of">
      <div className="viz-title">
        <T
          en="Over-fetching: the page needs a name and a picture, and the endpoint returns all of this"
          zh="over-fetching 体检:页面只要名字和头像,端点却返回了这么多"
        />
      </div>
      <div className="gq-of-grid">
        <div className="gq-of-win">
          <div className="codewin-bar">
            <span className="codewin-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="codewin-name">
              {L({
                en: "GET /api/users/9 · click a line to mark it used",
                zh: "GET /api/users/9 · 点行标记「用得上」",
              })}
            </span>
            <span style={{ width: 47 }} aria-hidden />
          </div>
          <div className="gq-of-body">
            <div className="gq-of-brace">{"{"}</div>
            {OF_FIELDS.map((f, i) => {
              const on = used.has(f.k);
              return (
                <button
                  key={f.k}
                  type="button"
                  className={`gq-of-line${on ? " on" : ""}`}
                  onClick={() => toggle(f.k)}
                  aria-pressed={on}
                >
                  <span className="gq-of-k">&quot;{f.k}&quot;</span>
                  {": "}
                  {f.v}
                  {i === OF_FIELDS.length - 1 ? "" : ","}
                </button>
              );
            })}
            <div className="gq-of-brace">{"}"}</div>
          </div>
        </div>
        <div className="gq-of-side">
          <div className="gq-of-big" aria-live="polite">
            {waste}%
          </div>
          <div className="gq-of-cap">
            <T en="Bytes wasted" zh="字节浪费率" />
          </div>
          <div className="gq-of-stats">
            <div>
              <span>
                <T en="All fields" zh="字段字节合计" />
              </span>
              <b>{total} B</b>
            </div>
            <div>
              <span>
                <T en="Fields you use" zh="你真正用的" />
              </span>
              <b>{mine} B</b>
            </div>
            <div>
              <span>
                <T en="Sent for nothing" zh="白传一趟的" />
              </span>
              <b>{total - mine} B</b>
            </div>
          </div>
          <p>
            <T
              en={
                <>
                  And that is <b>one</b> author. A list of 20 posts means 20
                  responses like this one. On a mobile connection, the greyed-out
                  lines still cost data, battery, and waiting time.
                </>
              }
              zh={
                <>
                  而这还只是<b>一个</b>作者。列表页 20 篇文章,
                  就是 20 份这样的响应。在移动网络下,
                  那些灰掉的行照样在消耗流量、电量和等待时间。
                </>
              }
            />
          </p>
          <p className="gq-of-tip">
            <T
              en="Click any line on the left to change which fields you use, and watch the percentage move."
              zh="点左边任意一行,改改「用得上」的字段,看浪费率怎么动。"
            />
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= UnderfetchWaterfall ================= */

interface WfReq {
  path: string;
  start: number;
  badge: ReactNode;
}

const WF_REQS: WfReq[] = [
  {
    path: "GET /posts/1",
    start: 0,
    badge: <T en={'only "authorId": 9'} zh={'只有 "authorId": 9'} />,
  },
  {
    path: "GET /users/9",
    start: 300,
    badge: <T en={'now "name": "Ada Wong"'} zh={'才拿到 "name": "Ada Wong"'} />,
  },
  {
    path: "GET /posts/1/comments",
    start: 600,
    badge: <T en="12 comments" zh="评论 12 条" />,
  },
];

interface WfFrame {
  /** 已出现的请求条数(含在途) */
  upTo: number;
  /** 正在飞的请求下标 */
  lit: number | null;
  /** 是否显示 GraphQL 对照条 */
  gq: boolean;
  msg: ReactNode;
}

const WF_FRAMES: WfFrame[] = [
  {
    upTo: 0,
    lit: null,
    gq: false,
    msg: (
      <T
        en={
          <>
            A post page needs three things: <b>the post</b>,{" "}
            <b>the author card</b>, and <b>the comment list</b>. In the blog API
            from chapter 04 they live at three endpoints, and each request can
            ask only one of them.
          </>
        }
        zh={
          <>
            帖子页需要三样数据:<b>正文</b>、<b>作者卡片</b>、<b>评论列表</b>。
            在第 04 章设计的博客 API 里,它们分住三个端点,一次只能问一个。
          </>
        }
      />
    ),
  },
  {
    upTo: 1,
    lit: 0,
    gq: false,
    msg: (
      <T
        en={
          <>
            Request 1 goes out: <b>GET /posts/1</b>. Assume 300ms for one round
            trip on a slow connection. The page can only show a loading state
            until it comes back.
          </>
        }
        zh={
          <>
            第 1 程出发:<b>GET /posts/1</b>。弱网下一来一回按 300ms 算,
            这段时间页面只能停在加载状态。
          </>
        }
      />
    ),
  },
  {
    upTo: 1,
    lit: null,
    gq: false,
    msg: (
      <T
        en={
          <>
            The post arrives, but the author field holds only{" "}
            <b>authorId: 9</b>, not a name. Only now can the URL of request 2 be
            built. It could not have been sent earlier.
          </>
        }
        zh={
          <>
            帖子到手,可作者栏里只有 <b>authorId: 9</b>,没有名字。
            第 2 程的 URL 到这一刻才拼得出来 —— 之前想发也发不了。
          </>
        }
      />
    ),
  },
  {
    upTo: 2,
    lit: 1,
    gq: false,
    msg: (
      <T
        en={
          <>
            Request 2: <b>GET /users/9</b>. Another 300ms. This one also returns
            the full user record with all its unused fields, so both problems
            appear in the same request.
          </>
        }
        zh={
          <>
            第 2 程:<b>GET /users/9</b>。又是 300ms。
            而且这一程还会把完整的 user 记录连同用不上的字段一起返回 ——
            两个问题叠在了同一次请求里。
          </>
        }
      />
    ),
  },
  {
    upTo: 3,
    lit: 2,
    gq: false,
    msg: (
      <T
        en={
          <>
            Request 3: <b>GET /posts/1/comments</b>. Three requests, one after
            another, each waiting for the one before it. This pattern has a
            name: a <b>request waterfall</b>.
          </>
        }
        zh={
          <>
            第 3 程:<b>GET /posts/1/comments</b>。三程只能排队,
            一个等一个 —— 这个队形有个名字:<b>请求瀑布(waterfall)</b>。
          </>
        }
      />
    ),
  },
  {
    upTo: 3,
    lit: null,
    gq: true,
    msg: (
      <T
        en={
          <>
            <b>900ms</b> before the page can start rendering. The same data in
            GraphQL is one query on one round trip: <b>300ms</b>.
          </>
        }
        zh={
          <>
            合计 <b>900ms</b>,页面才能开始渲染。同样的数据,GraphQL
            写成一次查询、一趟往返:<b>300ms</b>。
          </>
        }
      />
    ),
  },
];

export function UnderfetchWaterfall() {
  const s = useStepper(WF_FRAMES.length, 2000);
  const f = WF_FRAMES[s.step];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Under-fetching: three requests in sequence for one post page (step through it)"
          zh="under-fetching 现场:一篇帖子页的三连瀑布(逐帧慢放)"
        />
      </div>
      <div className="gq-wf">
        <div className="gq-wf-axis" aria-hidden>
          {[0, 300, 600, 900].map((t) => (
            <span key={t} style={{ left: `${(t / 900) * 100}%` }}>
              {t}ms
            </span>
          ))}
        </div>
        {WF_REQS.map((r, i) => {
          const visible = i < f.upTo;
          const inFlight = f.lit === i;
          return (
            <div className="gq-wf-row" key={r.path}>
              <span className="gq-wf-label">{r.path}</span>
              <div className="gq-wf-track">
                {visible && (
                  <span
                    className={`gq-wf-bar${inFlight ? " lit" : ""}`}
                    style={{
                      left: `${(r.start / 900) * 100}%`,
                      width: `${(300 / 900) * 100}%`,
                    }}
                  >
                    300ms
                  </span>
                )}
                {visible && !inFlight && (
                  <span
                    className="gq-wf-badge"
                    style={{ left: `${((r.start + 300) / 900) * 100}%` }}
                  >
                    {r.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {f.gq && (
          <div className="gq-wf-row gq-wf-vs">
            <span className="gq-wf-label">POST /graphql</span>
            <div className="gq-wf-track">
              <span
                className="gq-wf-bar gq"
                style={{ left: 0, width: `${(300 / 900) * 100}%` }}
              >
                <T en="300ms · one query" zh="300ms · 一次查询" />
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={WF_FRAMES.length} />
    </div>
  );
}

/* ================= QueryBuilder ================= */

interface QbField {
  id: string;
  /** 复选框上显示的名字 */
  label: string;
  /** 顶层字段名 */
  key: string;
  /** 嵌套子字段(origin.name 这类) */
  sub?: string;
  /** 假响应里的值 */
  value: string | { [k: string]: string };
}

const QB_FIELDS: QbField[] = [
  { id: "name", label: "name", key: "name", value: "Rick Sanchez" },
  { id: "status", label: "status", key: "status", value: "Alive" },
  { id: "species", label: "species", key: "species", value: "Human" },
  { id: "gender", label: "gender", key: "gender", value: "Male" },
  {
    id: "origin",
    label: "origin.name",
    key: "origin",
    sub: "name",
    value: { name: "Earth (C-137)" },
  },
  {
    id: "location",
    label: "location.name",
    key: "location",
    sub: "name",
    value: { name: "Citadel of Ricks" },
  },
  {
    id: "image",
    label: "image",
    key: "image",
    value: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  },
];

/** 没选任何字段时:一个不合法的查询,以及服务器真实的报错响应。
 *  两种语言只有注释不同,可执行的行完全一致。 */
const QB_EMPTY_QUERY: Loc<string> = {
  en: `{
  character(id: 1)
  # No field selected yet. GraphQL has no
  # "give me everything" — you must name fields.
}`,
  zh: `{
  character(id: 1)
  # 还没有选任何字段。GraphQL 没有「全都要」
  # 这种写法 —— 字段必须一个个点名。
}`,
};

const QB_EMPTY_RESPONSE = `{
  "errors": [
    {
      "message": "Field 'character' of type 'Character' must have a selection of subfields"
    }
  ]
}`;

export function QueryBuilder() {
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(["name", "status", "species"]),
  );

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const { queryText, responseText } = useMemo((): {
    queryText: Loc<string>;
    responseText: string;
  } => {
    const sel = QB_FIELDS.filter((f) => picked.has(f.id));
    if (sel.length === 0) {
      return { queryText: QB_EMPTY_QUERY, responseText: QB_EMPTY_RESPONSE };
    }
    const qLines: string[] = ["{", "  character(id: 1) {"];
    for (const f of sel) {
      if (f.sub) {
        qLines.push(`    ${f.key} {`, `      ${f.sub}`, "    }");
      } else {
        qLines.push(`    ${f.key}`);
      }
    }
    qLines.push("  }", "}");

    const obj: Record<string, unknown> = {};
    for (const f of sel) obj[f.key] = f.value;

    return {
      queryText: qLines.join("\n"),
      responseText: JSON.stringify({ data: { character: obj } }, null, 2),
    };
  }, [picked]);

  return (
    <div className="viz gq-qb-viz">
      <div className="viz-title">
        <T
          en="Select fields, and watch the query and the response follow"
          zh="选字段,看查询和响应怎么跟着变"
        />
        <span className="chip" style={{ marginLeft: "auto" }}>
          <T
            en={`${picked.size} / ${QB_FIELDS.length} selected`}
            zh={`已选 ${picked.size} / ${QB_FIELDS.length}`}
          />
        </span>
      </div>
      <div className="gq-qb">
        <div className="gq-qb-menu">
          <div className="gq-qb-menu-head">
            <T en="Fields on Character" zh="Character 的字段" />
          </div>
          {QB_FIELDS.map((f) => {
            const on = picked.has(f.id);
            return (
              <button
                key={f.id}
                type="button"
                className={`gq-qb-item${on ? " on" : ""}`}
                onClick={() => toggle(f.id)}
                aria-pressed={on}
              >
                <span className="gq-qb-box" aria-hidden>
                  {on ? "✓" : ""}
                </span>
                <span className="mono">{f.label}</span>
              </button>
            );
          })}
          <div className="gq-qb-actions">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setPicked(new Set(QB_FIELDS.map((f) => f.id)))}
            >
              <T en="Select all" zh="全选" />
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setPicked(new Set())}
            >
              <T en="Clear" zh="清空" />
            </button>
          </div>
        </div>
        <div className="gq-qb-code">
          <CodeBlock
            lang="graphql"
            title={{ en: "The query you wrote", zh: "你写的查询" }}
            code={queryText}
          />
        </div>
        <div className="gq-qb-code">
          <CodeBlock
            lang="json"
            title={{ en: "The server's response", zh: "服务器的响应" }}
            code={responseText}
          />
        </div>
      </div>
      <div className="viz-msg">
        {picked.size === 0 ? (
          <T
            en={
              <>
                Even the empty case teaches something. GraphQL has no{" "}
                <b>SELECT *</b>. If you select no field on an object type, the
                query is not valid and the server rejects it before executing
                anything — the response on the right is the real error.
              </>
            }
            zh={
              <>
                连空的情况都有得学:GraphQL 没有 <b>SELECT *</b>。
                如果你在一个对象类型上一个字段都不选,这个查询就不合法,
                服务器在执行之前就会拒绝它 —— 右边就是真实的报错响应。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Compare the two sides. Every field in the query has a field with
                the same name under <b>data</b>, and the nested{" "}
                <code>origin</code> lines up too. You asked for these fields, so
                you got these fields.
              </>
            }
            zh={
              <>
                左右对照:查询里的每个字段,在 <b>data</b>{" "}
                下都有一个同名字段,嵌套的 <code>origin</code>{" "}
                也一一对应。你要了哪些字段,就拿到哪些字段。
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

/* ================= GraphiqlTour ================= */

interface GiqlZone {
  id: "docs" | "editor" | "result";
  name: Loc<string>;
  desc: ReactNode;
}

const GIQL_ZONES: GiqlZone[] = [
  {
    id: "docs",
    name: { en: "Docs panel", zh: "文档面板" },
    desc: (
      <T
        en={
          <>
            Click the book icon and the whole schema becomes browsable: which
            types exist, which fields each type has, and which arguments those
            fields take. The documentation is not a separate site —{" "}
            <b>the server describes itself</b>. That mechanism is called
            introspection, and chapter 08 covers it.
          </>
        }
        zh={
          <>
            点开书本图标,整个 schema
            都可以翻阅:有哪些类型、每个类型有哪些字段、字段又收哪些参数。
            文档不在另一个站点上 —— <b>服务器自己描述自己</b>。
            这个机制叫内省(introspection),第 08 章展开讲。
          </>
        }
      />
    ),
  },
  {
    id: "editor",
    name: { en: "Editor", zh: "编辑区" },
    desc: (
      <T
        en={
          <>
            Where you write the query. Press Ctrl+Space to open autocomplete. It
            knows which type you are currently inside and which fields that type
            has, and it marks a misspelled field name immediately.
          </>
        }
        zh={
          <>
            写查询的地方。按 Ctrl+Space 呼出自动补全 ——
            它知道你此刻站在哪个类型里、这个类型有哪些字段,
            字段名拼错会当场标出来。
          </>
        }
      />
    ),
  },
  {
    id: "result",
    name: { en: "Result", zh: "结果区" },
    desc: (
      <T
        en={
          <>
            Press ▶ to run, and the response appears here. Its shape always
            matches the query on the left, wrapped in <b>data</b>. If something
            failed, an <code>errors</code> array appears next to{" "}
            <code>data</code>.
          </>
        }
        zh={
          <>
            按 ▶ 运行,响应就出现在这里。它的形状永远和左边的查询一一对应,
            外面套一层 <b>data</b>。如果出了问题,<code>data</code> 旁边会多出一个{" "}
            <code>errors</code> 数组。
          </>
        }
      />
    ),
  },
];

export function GraphiqlTour() {
  const L = useL();
  const [sel, setSel] = useState<GiqlZone["id"]>("editor");
  const zone = GIQL_ZONES.find((z) => z.id === sel)!;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="The GraphiQL window: click an area to see what it does"
          zh="GraphiQL 界面地图:点每块区域看它是干什么的"
        />
      </div>
      <div className="gq-giql">
        <div className="gq-giql-bar">
          <span className="codewin-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="codewin-name">
            GraphiQL · rickandmortyapi.com/graphql
          </span>
          <span style={{ width: 47 }} aria-hidden />
        </div>
        <div className="gq-giql-body">
          <button
            type="button"
            className={`gq-giql-pane docs${sel === "docs" ? " on" : ""}`}
            onClick={() => setSel("docs")}
          >
            <span className="gq-giql-name">📖 Docs</span>
            <span className="gq-giql-code">
              {"Query\n└ character(id: ID!)\n  └ Character\n    ├ name: String\n    ├ status: String\n    └ origin: Location"}
            </span>
          </button>
          <button
            type="button"
            className={`gq-giql-pane editor${sel === "editor" ? " on" : ""}`}
            onClick={() => setSel("editor")}
          >
            <span className="gq-giql-name">
              ✏️ <T en="Editor" zh="编辑区" />
            </span>
            <span className="gq-giql-code">
              {"{\n  character(id: 1) {\n    name\n    st▌\n  }\n}"}
            </span>
            <span className="gq-giql-pop" aria-hidden>
              {"status ✓\nspecies"}
            </span>
          </button>
          <button
            type="button"
            className={`gq-giql-pane result${sel === "result" ? " on" : ""}`}
            onClick={() => setSel("result")}
          >
            <span className="gq-giql-name">
              📦 <T en="Result" zh="结果区" />
            </span>
            <span className="gq-giql-code">
              {'{\n  "data": {\n    "character": {\n      "name": "Rick Sanchez"\n    }\n  }\n}'}
            </span>
          </button>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        <b>{L(zone.name)}</b> — {zone.desc}
      </div>
    </div>
  );
}

/* ================= AdoptionBars ================= */

const ADOPTION = [
  { name: "REST", v: 93, cls: "rest" },
  { name: "GraphQL", v: 33, cls: "gql" },
];

export function AdoptionBars() {
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Which API styles teams work with, 2025"
          zh="团队实际在用什么:2025 年的数据"
        />
      </div>
      <div className="gq-adopt">
        {ADOPTION.map((a) => (
          <div className="gq-adopt-row" key={a.name}>
            <span className="gq-adopt-name">{a.name}</span>
            <div className="gq-adopt-track">
              <span
                className={`gq-adopt-bar ${a.cls}`}
                style={{ width: `${a.v}%` }}
              />
            </div>
            <span className="gq-adopt-val">{a.v}%</span>
          </div>
        ))}
      </div>
      <div className="viz-msg">
        <T
          en={
            <>
              Source: Postman, 2025 State of the API. 93% of teams work with
              REST APIs and 33% work with GraphQL. Respondents could select more
              than one style, so the numbers do not add up to 100% — most teams
              that use GraphQL <b>also</b> use REST. GraphQL is an additional
              tool for about a third of teams, not a replacement.
            </>
          }
          zh={
            <>
              数据来源:Postman《2025 State of the API》。93% 的团队在使用 REST
              API,33% 在使用 GraphQL。这是多选题,所以两个数字加起来不等于
              100% —— 用 GraphQL 的团队大多<b>同时</b>还在用 REST。
              对大约三分之一的团队来说,GraphQL 是一件补充工具,不是替代品。
            </>
          }
        />
      </div>
    </div>
  );
}
