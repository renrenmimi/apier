"use client";

// 第 07 章 · GraphQL 初见 —— 本章专属可视化:
//  - GqHeroLoop:hero 里的「点菜单 → 后厨」循环动画(纯 CSS)。
//  - OverfetchViz:一份大 JSON 响应,点行标记「用得上」,实时算字节浪费率。
//  - UnderfetchWaterfall:三连瀑布请求逐帧慢放(useStepper)。
//  - QueryBuilder:勾字段 → 实时生成 query → 实时生成响应(本章核心)。
//  - GraphiqlTour:GraphiQL 界面地图,点区域看讲解。
//  - AdoptionBars:Postman 2025 使用率对比条。

import { useMemo, useState, type ReactNode } from "react";
import { CodeBlock } from "@/lib/code";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= GqHeroLoop ================= */

export function GqHeroLoop() {
  return (
    <div className="gq-loop" aria-hidden>
      <div className="flow-node lit">
        <span className="ico">📝</span>
        你的点菜单
      </div>
      <div className="flow-mid gq-loop-mid">
        <div className="flow-line" />
        <span className="flow-packet gq-go">{"query { name status }"}</span>
        <span className="flow-packet back gq-back">
          {'data: { name, status }'}
        </span>
      </div>
      <div className="flow-node">
        <span className="ico">🍳</span>
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
        over-fetching 体检:你只想要名字和头像,套餐却端来这些
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
              GET /api/users/9 · 点行标记「用得上」
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
          <div className="gq-of-cap">字节浪费率</div>
          <div className="gq-of-stats">
            <div>
              <span>字段字节合计</span>
              <b>{total} B</b>
            </div>
            <div>
              <span>你真正用的</span>
              <b>{mine} B</b>
            </div>
            <div>
              <span>白跑一趟的</span>
              <b>{total - mine} B</b>
            </div>
          </div>
          <p>
            这还只是<b>一个</b>作者。列表页 20 篇文章就是 20 份这样的套餐 ——
            移动端的流量、电量、弱网下的等待,全在为灰掉的字段买单。
          </p>
          <p className="gq-of-tip">
            点左边任意一行,改改「用得上」的字段,看浪费率怎么动。
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= UnderfetchWaterfall ================= */

const WF_REQS = [
  {
    path: "GET /posts/1",
    start: 0,
    badge: '响应里只有 "authorId": 9',
  },
  {
    path: "GET /users/9",
    start: 300,
    badge: '这才拿到 "name": "Ada Wong"',
  },
  {
    path: "GET /posts/1/comments",
    start: 600,
    badge: "评论 12 条到手",
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
      <>
        帖子页要三样数据:<b>正文</b>、<b>作者卡片</b>、<b>评论列表</b> ——
        在第 04 章设计的博客 API 里,它们分住三个端点,一次只能问一个。
      </>
    ),
  },
  {
    upTo: 1,
    lit: 0,
    gq: false,
    msg: (
      <>
        第 1 程出发:<b>GET /posts/1</b>。弱网下一来一回按 300ms 算 ——
        这段时间页面只能转圈圈。
      </>
    ),
  },
  {
    upTo: 1,
    lit: null,
    gq: false,
    msg: (
      <>
        帖子到手,可作者栏里只有 <b>authorId: 9</b>,没有名字。第 2 程的 URL
        现在才凑得出来 —— 之前想发也发不了,只能干等。
      </>
    ),
  },
  {
    upTo: 2,
    lit: 1,
    gq: false,
    msg: (
      <>
        第 2 程:<b>GET /users/9</b>。又是一整个 300ms,而且这一程还会把
        上面那份 40 字段的大套餐整个端回来 —— 两种痛叠加了。
      </>
    ),
  },
  {
    upTo: 3,
    lit: 2,
    gq: false,
    msg: (
      <>
        第 3 程:<b>GET /posts/1/comments</b>。三程只能排队,
        一格接一格 —— 这个队形有个名字:<b>瀑布(waterfall)</b>。
      </>
    ),
  },
  {
    upTo: 3,
    lit: null,
    gq: true,
    msg: (
      <>
        合计 <b>900ms</b> 页面才能开始渲染。同样的数据,GraphQL
        把三个问题写进一张单子,一程说清:<b>300ms</b>。
      </>
    ),
  },
];

export function UnderfetchWaterfall() {
  const s = useStepper(WF_FRAMES.length, 2000);
  const f = WF_FRAMES[s.step];

  return (
    <div className="viz">
      <div className="viz-title">
        under-fetching 现场:一篇帖子页的三连瀑布(逐帧慢放)
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
                300ms · 一张单子全说清
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

  const { queryText, responseText } = useMemo(() => {
    const sel = QB_FIELDS.filter((f) => picked.has(f.id));
    if (sel.length === 0) {
      return {
        queryText: `{
  character(id: 1) {
    # 菜单还空着 —— GraphQL 里
    # 不存在「全都要」,必须点名
  }
}`,
        responseText: `{
  "errors": [
    {
      "message": "Field 'character' of type 'Character' must have a selection of subfields"
    }
  ]
}`,
      };
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
        亲手点一次菜:勾字段,看 query 和响应怎么长
        <span className="chip" style={{ marginLeft: "auto" }}>
          已点 {picked.size} / {QB_FIELDS.length}
        </span>
      </div>
      <div className="gq-qb">
        <div className="gq-qb-menu">
          <div className="gq-qb-menu-head">character 的菜单</div>
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
              全都要
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setPicked(new Set())}
            >
              清空
            </button>
          </div>
        </div>
        <div className="gq-qb-code">
          <CodeBlock lang="graphql" title="你写的 query" code={queryText} />
        </div>
        <div className="gq-qb-code">
          <CodeBlock lang="json" title="服务器的响应" code={responseText} />
        </div>
      </div>
      <div className="viz-msg">
        {picked.size === 0 ? (
          <>
            连「清空」都有课上:GraphQL 没有 <b>SELECT *</b>,
            一个字段不点,服务器直接拒单 —— 右边就是真实的报错响应。
          </>
        ) : (
          <>
            左右对照:查询里每个字段,在 <b>data</b>{" "}
            里都有一个同名的影子;嵌套的 origin 连缩进都对得上 ——
            要什么给什么,不多不少。
          </>
        )}
      </div>
    </div>
  );
}

/* ================= GraphiqlTour ================= */

const GIQL_ZONES = [
  {
    id: "docs",
    name: "文档面板",
    desc: (
      <>
        点开书本图标,整个 schema 像字典一样任你翻:有哪些类型、每个类型
        有哪些字段、参数长什么样。<b>不用出门找文档 —— 文档长在服务器身上</b>,
        这背后的机制叫内省(introspection),第 08 章拆开讲。
      </>
    ),
  },
  {
    id: "editor",
    name: "编辑区",
    desc: (
      <>
        写查询的地方。按 Ctrl+Space 呼出自动补全 —— 它知道你此刻站在哪个类型里、
        能点哪些字段,拼错的字段名当场标红。第一次用的人都会「哇」一声。
      </>
    ),
  },
  {
    id: "result",
    name: "结果区",
    desc: (
      <>
        按 ▶ 运行,响应原样贴在这里。注意看:形状永远和左边的查询一一对应,
        外面套一层 <b>data</b> 壳;出错了则多一个 errors 数组。
      </>
    ),
  },
] as const;

export function GraphiqlTour() {
  const [sel, setSel] = useState<(typeof GIQL_ZONES)[number]["id"]>("editor");
  const zone = GIQL_ZONES.find((z) => z.id === sel)!;

  return (
    <div className="viz">
      <div className="viz-title">GraphiQL 界面地图:点每块区域看它是干嘛的</div>
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
            <span className="gq-giql-name">✏️ 编辑区</span>
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
            <span className="gq-giql-name">📦 结果区</span>
            <span className="gq-giql-code">
              {'{\n  "data": {\n    "character": {\n      "name": "Rick Sanchez"\n    }\n  }\n}'}
            </span>
          </button>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        <b>{zone.name}</b> —— {zone.desc}
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
      <div className="viz-title">谁在用什么:2025 年的真实占比</div>
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
        数据:Postman《2025 State of the API》,5700+ 名开发者作答,多选。
        REST 仍是默认选项,GraphQL 是三分之一团队工具箱里的<b>补充手段</b> ——
        不是谁取代谁的剧本。
      </div>
    </div>
  );
}
