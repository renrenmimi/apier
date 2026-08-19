"use client";

// 终章专属可视化:
//  - HeroArena:hero 裁判席场景 —— 蓝粉两角对峙,裁判席上坐着你。
//  - VersusTable:全维度对决表,11 个回合逐行展开判词。
//  - DecisionRoom:决策室 —— 五个问题出一份判决书,可反悔、可重来。
//  - AdoptionBars:Postman 2025 采用率横条。
//  - HybridDiagram:混合架构示意 —— 一个后厨,两个门面。
//  - ReviewWall:全书 12 章复习卡片墙(章节元数据来自 lib/curriculum.ts)。

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { CHAPTERS, type ChapterId } from "@/lib/curriculum";
import { useL } from "@/lib/i18n";

/* ================= HeroArena ================= */

export function HeroArena() {
  return (
    <div className="sd-arena" aria-hidden>
      <div className="sd-corner sd-corner-rest">
        <span className="sd-corner-tag">蓝方 · EST. 2000</span>
        <span className="sd-corner-name">REST</span>
        <span className="sd-corner-desc">资源 · 缓存 · 遍地都是</span>
      </div>
      <div className="sd-bench">
        <span className="sd-bench-ico">⚖️</span>
        <span className="sd-bench-label">裁判席</span>
        <span className="sd-bench-you">你</span>
      </div>
      <div className="sd-corner sd-corner-gql">
        <span className="sd-corner-tag">粉方 · EST. 2015</span>
        <span className="sd-corner-name">GraphQL</span>
        <span className="sd-corner-desc">契约 · 精确 · 一次取整</span>
      </div>
    </div>
  );
}

/* ================= VersusTable ================= */

type Lean = "rest" | "gql" | "tie";

interface VsRow {
  dim: string;
  rest: string;
  gql: string;
  lean: Lean;
  detail: ReactNode;
}

const LEAN_LABEL: Record<Lean, string> = {
  rest: "这局蓝方拿分",
  gql: "这局粉方拿分",
  tie: "平分秋色",
};

const VS_ROWS: VsRow[] = [
  {
    dim: "端点数量",
    rest: "一种资源一条路:/posts、/posts/1、/posts/1/comments……全印在菜单上",
    gql: "就一个 /graphql,菜单写在 schema 里,想吃什么现场点",
    lean: "tie",
    detail: (
      <>
        端点多不全是坏事:每个 URL 都是一个能单独限流、单独缓存、单独打日志的
        「关卡」。但端点也会组合爆炸 —— 每个集成方都想要「刚好这几个字段」,
        定制端点越写越多,GitHub 当年就是被这个逼向 GraphQL 的。
        单端点省了路由,却把复杂度挪进了查询语言。谁也没白赚。
      </>
    ),
  },
  {
    dim: "取数粒度",
    rest: "后厨定分量:/users/42 端上来什么就是什么,吃不完也得端走",
    gql: "勾选制:要 name 和 avatar 就只给这两样,不多一口",
    lean: "gql",
    detail: (
      <>
        REST 的 over-fetching 可以拿 <code>?fields=name,avatar</code>{" "}
        这类参数打补丁,但那是各家自造的方言;GraphQL
        把「按需取数」写进了语言本身,是原生能力不是补丁。
        移动端弱网、按流量计费的场景里,这一条是粉方的立身之本 ——
        它就是为这个痛点被发明出来的。
      </>
    ),
  },
  {
    dim: "往返次数",
    rest: "文章、作者、评论三样数据,老老实实跑三趟(under-fetching)",
    gql: "一棵查询树一次端走,嵌套多深都是一趟",
    lean: "gql",
    detail: (
      <>
        REST 也能靠组合端点(比如 <code>?embed=author,comments</code>
        )减少往返,可每加一种组合就多养一个端点。GraphQL
        一次取整棵树是真省往返 —— 但别忘了第 10 章:省下的往返变成了服务端
        resolver 的活,写不好就是 N+1。成本没有消失,只是从客户端转移到了服务端。
      </>
    ),
  },
  {
    dim: "HTTP 缓存",
    rest: "GET + URL 天然就是缓存键,浏览器、CDN、代理全都白吃红利",
    gql: "默认 POST 单端点,HTTP 缓存直接失明,得自己搭",
    lean: "rest",
    detail: (
      <>
        这是蓝方最硬的一张牌。<code>GET /posts/1</code> 在 CDN 眼里就是一个键,
        ETag、304、max-age 整套白送;GraphQL 每个查询体都不一样,传统 POST
        让中间设备全体罢工。解法是有的 —— 客户端规范化缓存、persisted queries
        换成哈希再走 GET —— 但每一样都是要自己搭的工程,红利变成了工钱。
      </>
    ),
  },
  {
    dim: "类型契约",
    rest: "契约靠自觉:OpenAPI 写不写、写完是否跟着代码更新,全看团队纪律",
    gql: "schema 是运行时的一部分,不写契约,服务器根本起不来",
    lean: "gql",
    detail: (
      <>
        两边都有类型方案,差别在「默认值」:OpenAPI 是后补的文档,
        和代码脱节了没人报警;GraphQL 的 schema 就是执行引擎本身 ——
        文档、校验、codegen、GraphiQL 自动补全全从它长出来,introspection
        保证它永远不说谎。「文档必然是真的」,这在 API 世界是种奢侈。
      </>
    ),
  },
  {
    dim: "文件上传",
    rest: "multipart/form-data 一种方案通用,浏览器原生支持,几十年的老手艺",
    gql: "规范里压根没这回事:要么装 multipart 扩展,要么隔壁开个 REST 端点",
    lean: "rest",
    detail: (
      <>
        GraphQL 的请求体是 JSON,往里塞二进制天生别扭。社区有
        graphql-multipart-request-spec 这类扩展,但主流建议反而是:
        上传这种事,老老实实开个 REST 端点或用预签名 URL。
        混合使用是正当做法 —— §04 会专门讲这种架构。
      </>
    ),
  },
  {
    dim: "错误模型",
    rest: "状态码当场宣判:404 没这人、401 先登录、500 服务端故障,监控一眼就懂",
    gql: "传统上恒 200,错误装进 errors 数组;还有「部分成功」这个新物种",
    lean: "tie",
    detail: (
      <>
        partial data 是把双刃剑:一屏十个模块坏了一个,其他九个照常渲染,
        用户体验赢了;但监控和告警得学会拆响应体,才知道刚才到底出没出事。
        <code>application/graphql-response+json</code>{" "}
        草案正在纠正「恒 200」的老传统,只是生态还没全跟上。
      </>
    ),
  },
  {
    dim: "学习曲线",
    rest: "会 HTTP 就会一半,curl 一敲就能玩",
    gql: "SDL、resolver、变量、fragment、缓存策略、限深……一整本新词表",
    lean: "rest",
    detail: (
      <>
        你自己刚走完这条路,应该有直接感受:REST 那四章基本是在「把 HTTP 用对」,
        GraphQL 四章却是学一门新语言外加一套新后端。团队每来一个新人,
        这笔学费就要重付一次 —— 人的成本,常常比机器的成本更该进决策表。
      </>
    ),
  },
  {
    dim: "服务端成本",
    rest: "路由 + 处理函数,一个端点一段逻辑,想写复杂都难",
    gql: "resolver 树、N+1、DataLoader、深度限制、复杂度预算……这些配套一样都不能少",
    lean: "rest",
    detail: (
      <>
        第 10 章拉开过这块幕布:客户端改个查询,就可能在后端零改动的情况下
        引爆 N+1;不设限深,一个 128 字节的匿名查询能烧掉 10 秒
        CPU(Bessey 的实测)。这些防御在 REST 里大多不需要 ——
        因为端点的形状是你定的,客户端翻不出你的手掌心。
      </>
    ),
  },
  {
    dim: "工具生态",
    rest: "curl、Postman、浏览器、CDN、网关……全世界的基础设施都懂它",
    gql: "GraphiQL 一开,文档补全全自动 —— 圈内工具惊艳,圈子小一号",
    lean: "tie",
    detail: (
      <>
        论「走到哪都有人接得住」,REST 赢:它不需要生态,它就是生态。
        论单项工具的使用体验,GraphQL 的 GraphiQL + codegen 是 REST
        世界羡慕的存在 —— OpenAPI 生态(Swagger UI 等)在追,
        但「工具从契约里自动长出来」这件事,粉方是原生的。
      </>
    ),
  },
  {
    dim: "团队规模",
    rest: "一个人到一个组都好使,起步几乎没有额外成本",
    gql: "一张 schema 多团队共建,规模越大越划算 —— 小团队反而背不动",
    lean: "tie",
    detail: (
      <>
        这一行其实是前面十行的总账:GraphQL 的成本大头是固定成本 ——
        schema 治理、缓存自建、安全加固 —— 端和团队一多就摊薄了,
        Netflix、Shopify 都是这么算的账;单前端小项目摊不薄,
        所以 Bessey 们退回 REST 和 tRPC。成本会摊薄,这是选型的第一性原理。
      </>
    ),
  },
];

export function VersusTable() {
  const [open, setOpen] = useState<number | null>(0);
  const tally = VS_ROWS.reduce(
    (acc, r) => {
      acc[r.lean] += 1;
      return acc;
    },
    { rest: 0, gql: 0, tie: 0 } as Record<Lean, number>,
  );

  return (
    <div className="sd-vs">
      <div className="sd-vs-head" aria-hidden>
        <span>维度</span>
        <span className="sd-head-rest">REST 蓝方</span>
        <span className="sd-head-gql">GraphQL 粉方</span>
      </div>
      {VS_ROWS.map((r, i) => {
        const expanded = open === i;
        return (
          <div key={r.dim} className={`sd-vs-row${expanded ? " open" : ""}`}>
            <button
              type="button"
              className="sd-vs-line"
              onClick={() => setOpen(expanded ? null : i)}
              aria-expanded={expanded}
            >
              <span className="sd-vs-dim">
                {r.dim}
                <span className="sd-vs-caret" aria-hidden>
                  ▾
                </span>
              </span>
              <span className="sd-vs-cell">
                <i className="sd-vs-side" data-side="rest">
                  REST
                </i>
                {r.rest}
              </span>
              <span className="sd-vs-cell">
                <i className="sd-vs-side" data-side="gql">
                  GraphQL
                </i>
                {r.gql}
              </span>
            </button>
            {expanded && (
              <div className="sd-vs-detail">
                <span className="sd-lean" data-lean={r.lean}>
                  {LEAN_LABEL[r.lean]}
                </span>
                <p>{r.detail}</p>
              </div>
            )}
          </div>
        );
      })}
      <div className="sd-vs-score">
        比分:蓝 {tally.rest} · 粉 {tally.gql} · 平 {tally.tie} ——
        但裁决从不看总分,看你的场景踩中哪几行。
      </div>
    </div>
  );
}

/* ================= DecisionRoom ================= */

type Contender = "rest" | "graphql" | "trpc" | "grpc";

interface DOption {
  label: string;
  scores: Partial<Record<Contender, number>>;
  reason: string;
}

interface DQuestion {
  q: string;
  opts: DOption[];
}

const D_QUESTIONS: DQuestion[] = [
  {
    q: "这个 API 主要给谁用?",
    opts: [
      {
        label: "对外公开,给第三方开发者",
        scores: { rest: 3 },
        reason:
          "对外公开:第三方只认最通用的约定 —— REST + OpenAPI 是行业普通话,谁来都接得上。",
      },
      {
        label: "自家产品,多端共用(App / Web / 小程序 / TV…)",
        scores: { graphql: 2 },
        reason:
          "自家多端:每种端要的字段都不一样,按需取数正是 GraphQL 被发明出来的理由。",
      },
      {
        label: "自家一个 Web 前端,就这一个客户端",
        scores: { rest: 1, trpc: 2 },
        reason:
          "单前端:没有多端痛点,REST 完全够用;若前后端都写 TypeScript,tRPC 会更顺手。",
      },
    ],
  },
  {
    q: "客户端形态,现在和可见的将来会有几种?",
    opts: [
      {
        label: "三种以上,还会继续冒出来",
        scores: { graphql: 2 },
        reason:
          "端一多,「一张 schema 各自点菜」开始划算 —— 不用为每种端开定制端点。",
      },
      {
        label: "一两种,基本稳定",
        scores: { rest: 1 },
        reason: "端少而稳:端点数量可控,犯不着为它建一个聚合层。",
      },
    ],
  },
  {
    q: "团队长什么形状?",
    opts: [
      {
        label: "前后端一拨人,全 TypeScript,同一个仓库",
        scores: { trpc: 3 },
        reason:
          "TS 全栈同仓库:tRPC 端到端类型直通,后端改个函数签名,前端立刻飘红 —— 无 schema、无 codegen。",
      },
      {
        label: "前后端两拨人,靠契约协作",
        scores: { rest: 1, graphql: 1 },
        reason:
          "跨团队协作:契约就是生命线 —— OpenAPI 或 GraphQL schema,总得有一份能当合同用的东西。",
      },
      {
        label: "后端是多语言、多团队的微服务群",
        scores: { grpc: 2, graphql: 1 },
        reason:
          "多语言微服务:内部互调 gRPC 是标配;对外或对端,再考虑加一层聚合门面。",
      },
    ],
  },
  {
    q: "有弱网或移动端流量敏感的场景吗?",
    opts: [
      {
        label: "有,每个字节都想省",
        scores: { graphql: 2 },
        reason:
          "流量敏感:精确取数直接砍掉 over-fetching —— Facebook 2012 年就是在移动端被这个痛醒的。",
      },
      {
        label: "没有 —— 内网、桌面、服务间调用为主",
        scores: { rest: 1, grpc: 1 },
        reason:
          "内网为主:带宽不是瓶颈,简单比精确更值钱;若大头是服务间互调,二进制的 gRPC 反而最省。",
      },
    ],
  },
  {
    q: "一屏数据,要从几个后端服务拼出来?",
    opts: [
      {
        label: "好几个,聚合是家常便饭",
        scores: { graphql: 2, grpc: 1 },
        reason:
          "聚合是常态:GraphQL 天生适合当聚合层(Netflix 用它联邦了 70+ 个服务);服务之间的内线可以配 gRPC。",
      },
      {
        label: "就一个后端,直接调用",
        scores: { rest: 1 },
        reason: "单体后端:没有聚合需求,别为不存在的问题引入复杂度。",
      },
    ],
  },
];

const CONTENDERS: { id: Contender; name: string }[] = [
  { id: "rest", name: "REST" },
  { id: "graphql", name: "GraphQL" },
  { id: "trpc", name: "tRPC" },
  { id: "grpc", name: "gRPC" },
];

const VERDICTS: Record<
  Contender,
  { title: string; body: string; counter: string }
> = {
  rest: {
    title: "本庭判决:REST",
    body:
      "你的场景里没有出现 GraphQL 赖以立足的痛点 —— 不多端、不聚合、流量不金贵。这时最通用、最省心、缓存白送的 REST 就是正确答案。行业数据也站这边:Postman 2025,93% 的团队在用 REST。默认选项之所以是默认,是有原因的。",
    counter:
      "粉方律师抗辩:哪天客户端形态多起来、一屏要拼好几个服务的数据了,GraphQL 可以作为聚合层直接加在现有 REST 前面 —— 不必推倒重来,两个门面并存(见 §04)。另外,如果前后端是同一拨 TS 工程师,tRPC 的开发体验会比手写 REST 客户端爽得多。",
  },
  graphql: {
    title: "本庭判决:GraphQL",
    body:
      "多端、聚合、按需取数 —— 你的场景踩中的正是 GraphQL 的主场。一张 schema 当契约,各端自己点菜,不用为谁开定制端点。GitHub、Netflix、Shopify 都在这条路上验证过它,你不是第一个吃螃蟹的。",
    counter:
      "蓝方律师最后陈词:上 GraphQL 前,把四张账单放进排期 —— 攻击面(限深 + 复杂度预算)、字段级授权、N+1(DataLoader 全覆盖)、可观测性改造;外加 HTTP 缓存要自建。Bessey 用了六年才把这些账算明白,你最好第一天就算。团队没有余力填这些坑,宁可先 REST。",
  },
  trpc: {
    title: "本庭判决:tRPC 值得一看",
    body:
      "前后端一拨人、全 TypeScript、单前端 —— 你们之间根本不需要一份「对外合同」。tRPC 让前端直接获得后端函数的类型:无 schema、无 codegen,改签名即报错,v11 已稳定,Next.js 生态里顺滑得像本地调用。",
    counter:
      "它的边界也很硬:只活在 TypeScript 世界 —— 第三方开发者、iOS 原生、别家团队统统用不了。将来要对外开放,还得在旁边立一个 REST 或 GraphQL 门面。tRPC 是团队内部的密语,不是对外的普通话。",
  },
  grpc: {
    title: "本庭判决:这里有 gRPC 的位置",
    body:
      "多语言微服务之间的内部互调,gRPC(Protobuf + HTTP/2)是行业标配:二进制编码小而快,.proto 契约给各语言生成客户端,流式调用原生支持 —— 机房内网的高速专线。",
    counter:
      "注意它的定位:内线,不是门面 —— 浏览器不能直连 gRPC(要 grpc-web 转换),第三方也不会为你装 Protobuf 工具链。对外、对端的那一层,仍然是 REST 或 GraphQL 的事;gRPC 负责的是它们身后的服务间通话。",
  },
};

export function DecisionRoom() {
  const [picks, setPicks] = useState<(number | null)[]>(
    D_QUESTIONS.map(() => null),
  );
  const [showCounter, setShowCounter] = useState(false);

  const answered = picks.filter((p) => p !== null).length;
  const done = answered === D_QUESTIONS.length;

  const scores: Record<Contender, number> = {
    rest: 0,
    graphql: 0,
    trpc: 0,
    grpc: 0,
  };
  const reasons: string[] = [];
  picks.forEach((p, qi) => {
    if (p === null) return;
    const opt = D_QUESTIONS[qi].opts[p];
    for (const c of CONTENDERS) {
      scores[c.id] += opt.scores[c.id] ?? 0;
    }
    reasons.push(opt.reason);
  });

  const winner = CONTENDERS.reduce((best, c) =>
    scores[c.id] > scores[best.id] ? c : best,
  );
  const top = Math.max(1, scores[winner.id]);
  const verdict = VERDICTS[winner.id];

  const reset = () => {
    setPicks(D_QUESTIONS.map(() => null));
    setShowCounter(false);
  };

  return (
    <div className="sd-dr">
      <div className="sd-dr-head">
        <span className="sd-dr-head-ico" aria-hidden>
          ⚖️
        </span>
        决策室 —— 回答五个问题,本庭当场宣判(答案随时可以反悔,判决实时更新)
      </div>

      {D_QUESTIONS.map((q, qi) => (
        <div className="sd-dr-q" key={qi}>
          <div className="sd-dr-qt">
            <span className="sd-dr-qn">Q{qi + 1}</span>
            {q.q}
          </div>
          <div className="sd-dr-opts" role="group">
            {q.opts.map((opt, oi) => (
              <button
                key={oi}
                type="button"
                className={`sd-dr-opt${picks[qi] === oi ? " on" : ""}`}
                onClick={() => {
                  setPicks((prev) => {
                    const next = [...prev];
                    next[qi] = next[qi] === oi ? null : oi;
                    return next;
                  });
                  setShowCounter(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!done && (
        <div className="sd-dr-pending">
          还差 {D_QUESTIONS.length - answered} 问 —— 全部答完,判决书自动送达。
        </div>
      )}

      {done && (
        <div className="sd-dr-result">
          <div className="sd-dr-bars">
            {CONTENDERS.map((c) => (
              <div className="sd-dr-bar" key={c.id}>
                <span className="sd-dr-bar-name">{c.name}</span>
                <span className="sd-dr-track">
                  <span
                    className="sd-dr-fill"
                    data-c={c.id}
                    style={{ width: `${(scores[c.id] / top) * 100}%` }}
                  />
                </span>
                <span className="sd-dr-bar-val">{scores[c.id]}</span>
              </div>
            ))}
          </div>

          <div className="sd-dr-verdict">
            <h4>{verdict.title}</h4>
            <p>{verdict.body}</p>
            <ul className="sd-dr-reasons">
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            {showCounter && <div className="sd-dr-counter">{verdict.counter}</div>}
            <div className="sd-dr-actions">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setShowCounter((v) => !v)}
              >
                {showCounter ? "收起反方理由" : "不服?看看反方理由"}
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={reset}>
                ↻ 重新来一次
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= AdoptionBars ================= */

const ADOPTION: { name: string; v: number; tone: "rest" | "gql" | "dim" }[] = [
  { name: "REST", v: 93, tone: "rest" },
  { name: "Webhooks", v: 50, tone: "dim" },
  { name: "WebSockets", v: 35, tone: "dim" },
  { name: "GraphQL", v: 33, tone: "gql" },
];

export function AdoptionBars() {
  return (
    <div className="sd-poll">
      {ADOPTION.map((a) => (
        <div className="sd-poll-row" key={a.name}>
          <span className="sd-poll-name">{a.name}</span>
          <span className="sd-poll-track">
            <span
              className="sd-poll-fill"
              data-tone={a.tone}
              style={{ width: `${a.v}%` }}
            />
          </span>
          <span className="sd-poll-val">{a.v}%</span>
        </div>
      ))}
      <div className="sd-poll-cap">
        「你的团队在用哪些 API 风格?」(多选)—— Postman《2025 State of the
        API》,5700+ 名受访者。
      </div>
    </div>
  );
}

/* ================= HybridDiagram ================= */

export function HybridDiagram() {
  return (
    <div className="sd-hybrid" role="img" aria-label="混合架构:一个后厨,两个门面">
      <div className="sd-hy-node sd-hy-c1">
        <span className="sd-hy-ico" aria-hidden>
          🌍
        </span>
        第三方集成方
        <small>别人家的服务器和脚本</small>
      </div>
      <div className="sd-hy-link sd-hy-l1">
        <span className="sd-hy-proto" data-side="rest">
          GET /v1/posts
        </span>
        <span className="sd-hy-arrow" aria-hidden>
          ⟶
        </span>
      </div>
      <div className="sd-hy-node sd-hy-facade sd-hy-rest sd-hy-f1">
        REST 公开门面
        <small>版本化 · CDN 缓存 · 限流 · OpenAPI</small>
      </div>

      <div className="sd-hy-node sd-hy-c2">
        <span className="sd-hy-ico" aria-hidden>
          📱
        </span>
        自家 App · Web · 小程序
        <small>你自己的多端前端</small>
      </div>
      <div className="sd-hy-link sd-hy-l2">
        <span className="sd-hy-proto" data-side="gql">
          POST /graphql
        </span>
        <span className="sd-hy-arrow" aria-hidden>
          ⟶
        </span>
      </div>
      <div className="sd-hy-node sd-hy-facade sd-hy-gql sd-hy-f2">
        GraphQL BFF
        <small>按需聚合 · 一张 schema 伺候所有端</small>
      </div>

      <div className="sd-hy-link sd-hy-l3">
        <span className="sd-hy-proto">内部调用(可用 gRPC)</span>
        <span className="sd-hy-arrow" aria-hidden>
          ⟶
        </span>
      </div>
      <div className="sd-hy-link sd-hy-l4">
        <span className="sd-hy-proto">内部调用(可用 gRPC)</span>
        <span className="sd-hy-arrow" aria-hidden>
          ⟶
        </span>
      </div>

      <div className="sd-hy-node sd-hy-core">
        <span className="sd-hy-ico" aria-hidden>
          🍳
        </span>
        同一个后厨
        <small>核心服务 + 数据库 —— 博客数据只有一份</small>
      </div>
    </div>
  );
}

/* ================= ReviewWall ================= */

const REVIEW: Record<ChapterId, { soul: string; keys: string[] }> = {
  home: {
    soul: "API = 事先约好的问答规矩。菜单、点菜、上菜 —— 全书的世界观从这张餐桌开始。",
    keys: ["客户端/服务器", "请求-响应", "JSON"],
  },
  http: {
    soul: "方法表达意图,状态码表达结果,Header 补充细节。REST 用足了这门母语,GraphQL 至少也借走了运输层。",
    keys: ["GET/POST", "状态码", "Header"],
  },
  "first-call": {
    soul: "fetch 只有断网才 reject,4xx/5xx 要自己查 res.ok —— 第一次调用教会你的,是读响应的习惯。",
    keys: ["fetch", "async/await", "DevTools"],
  },
  rest: {
    soul: "REST 不是协议是风格:六条约束,换来一个可缓存、可分层、能长到今天这么大的 Web。",
    keys: ["六大约束", "资源", "无状态"],
  },
  "rest-design": {
    soul: "URL 用名词,动作交给方法,错误交给状态码 + RFC 9457 —— 设计的好坏,同行一眼就能看出来。",
    keys: ["名词复数", "CRUD 映射", "Problem Details"],
  },
  "rest-advanced": {
    soul: "分页、缓存、幂等键、版本策略 —— 玩具 API 和生产 API 的差距,全在这一章。",
    keys: ["cursor 分页", "ETag/304", "Idempotency-Key"],
  },
  auth: {
    soul: "401 是「不认识你」,403 是「不许你进」;JWT 是自带签名的通行证,OAuth 是不交密码的授权。",
    keys: ["JWT", "OAuth + PKCE", "CORS"],
  },
  graphql: {
    soul: "over-fetching 与 under-fetching 两种痛,催生了「一个端点 + 一种查询语言」的新点菜法。",
    keys: ["单端点", "精确取数", "查询语言"],
  },
  schema: {
    soul: "schema 是先写好的合同:类型、可空性、废弃字段白纸黑字,introspection 保证文档不说谎。",
    keys: ["SDL", "Non-Null(!)", "introspection"],
  },
  operations: {
    soul: "读 query、写 mutation、听 subscription;变量和 fragment 把查询拼成乐高。",
    keys: ["三种操作", "变量", "fragment"],
  },
  backstage: {
    soul: "每个字段背后一个 resolver;N+1 是 GraphQL 的原罪,DataLoader 是标准解法。",
    keys: ["resolver", "N+1", "DataLoader"],
  },
  showdown: {
    soul: "没有银弹,只有取舍 —— 你现在坐的位置,叫裁判席。",
    keys: ["选型", "混合架构", "取舍"],
  },
};

export function ReviewWall() {
  const L = useL();
  return (
    <div className="sd-wall">
      {CHAPTERS.map((c) => {
        const r = REVIEW[c.id];
        return (
          <Link
            key={c.id}
            href={c.href}
            className="card hoverable sd-wall-card"
            style={{ "--hue": c.hue, "--ch-hue": c.hue } as CSSProperties}
          >
            <span className="sd-wall-num">
              {c.num} · {L(c.en)}
            </span>
            <span className="sd-wall-title">{L(c.title)}</span>
            <span className="sd-wall-soul">{r.soul}</span>
            <span className="sd-wall-keys">
              {r.keys.map((k) => (
                <span key={k} className="chip">
                  {k}
                </span>
              ))}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
