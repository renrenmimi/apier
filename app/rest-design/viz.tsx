"use client";

// 第 04 章 · RESTful 设计实战 —— 本章专属可视化:
//  - HeroBlueprint:hero 里的「图纸」动画,端点行轮流点亮(纯 CSS 驱动)。
//  - UrlClinic:URL 整容室 —— 六个烂 URL,点开看诊断和整容后的样子。
//  - StatusDealer:状态码决策室 —— 八个场景发牌,选码即判,即时讲解。

import { useState, type ReactNode } from "react";
import { Method, type HttpMethod } from "@/lib/kit";

/* ================= HeroBlueprint ================= */

const BP_ROWS: { m: HttpMethod; path: string; code: string }[] = [
  { m: "GET", path: "/posts", code: "200" },
  { m: "POST", path: "/posts", code: "201" },
  { m: "PATCH", path: "/posts/42", code: "200" },
  { m: "DELETE", path: "/posts/42", code: "204" },
];

export function HeroBlueprint() {
  return (
    <div className="rd-bp" aria-hidden>
      <div className="rd-bp-head">
        <span>博客 API · 端点图纸</span>
        <span>DRAFT v0.1</span>
      </div>
      {BP_ROWS.map((r, i) => (
        <div
          key={i}
          className="rd-bp-row"
          style={{ animationDelay: `${i * 2}s` }}
        >
          <Method m={r.m} />
          <span className="path">{r.path}</span>
          <span className="status" data-x={2}>
            {r.code}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================= UrlClinic ================= */

interface UrlCase {
  bad: string;
  problems: string[];
  fixedMethod: HttpMethod;
  fixedPath: string;
  why: ReactNode;
}

const URL_CASES: UrlCase[] = [
  {
    bad: "/getUser?id=1",
    problems: ["动词 get 混进了 URL", "资源没有自己的门牌号,id 沦为查询参数"],
    fixedMethod: "GET",
    fixedPath: "/users/1",
    why: (
      <>
        动作交给方法(GET),URL 只留名词。1 号用户是一个正经资源,
        配得上一个正经地址 —— 而不是挂在问号后面当参数。
      </>
    ),
  },
  {
    bad: "/api/DeletePost?postId=42",
    problems: [
      "动词 Delete 混进 URL",
      "大写驼峰命名",
      "删除动作却可能被 GET 访问 —— 爬虫点一下就删库",
    ],
    fixedMethod: "DELETE",
    fixedPath: "/posts/42",
    why: (
      <>
        删除的语义由 DELETE 方法表达,路径全小写。「爬虫顺着 GET
        链接把数据删光」是真实发生过的事故 —— 把危险动作藏进
        URL,等于把电闸装在门把手上。
      </>
    ),
  },
  {
    bad: "/users/1/posts/2/comments/3/replies",
    problems: ["嵌套整整四层", "客户端要先集齐 3 个 id 才拼得出 URL"],
    fixedMethod: "GET",
    fixedPath: "/comments/3/replies",
    why: (
      <>
        3 号评论的 id 全局唯一,前面两层纯属冗余。嵌套最多两层
        (collection/id/collection),再深就拆平 —— URL
        越长越脆,上游改一层,全线折断。
      </>
    ),
  },
  {
    bad: "/Blog_Posts/List.php",
    problems: ["大写 + 下划线", "暴露实现细节(.php)", "动词 List"],
    fixedMethod: "GET",
    fixedPath: "/posts",
    why: (
      <>
        哪天从 PHP 换成 Node,这个 URL 就作废了?URI 应该只描述资源,
        和实现技术无关 —— 门牌号上不写「本楼为砖混结构」。
      </>
    ),
  },
  {
    bad: "/posts/latest-posts-list",
    problems: ["「latest」「list」是查询条件,不是资源", "路径里混进了排序逻辑"],
    fixedMethod: "GET",
    fixedPath: "/posts?sort=-created_at",
    why: (
      <>
        路径回答「要什么」,query 参数回答「怎么要」。过滤、排序、
        分页统统放问号后面 —— 想换成「最热」时,改个参数就行,
        不用再造一个新地址。
      </>
    ),
  },
  {
    bad: "/createNewComment",
    problems: ["动词 create(还嫌不够,又加了个 New)", "看不出评论挂在哪篇文章下"],
    fixedMethod: "POST",
    fixedPath: "/posts/42/comments",
    why: (
      <>
        创建 = 对集合 POST,POST 本身就是「新建」,URL 里再写 create
        是复读。评论从属于文章,一层嵌套刚好把这层关系说清。
      </>
    ),
  },
];

export function UrlClinic() {
  const [sel, setSel] = useState(0);
  const c = URL_CASES[sel];

  return (
    <div className="viz">
      <div className="viz-title">URL 整容室 —— 点左边的「病号」,看诊断书</div>
      <div className="rd-clinic">
        <div className="rd-url-list" role="group">
          {URL_CASES.map((u, i) => (
            <button
              key={u.bad}
              type="button"
              className={`rd-url-btn${sel === i ? " on" : ""}`}
              onClick={() => setSel(i)}
            >
              <span className="x" aria-hidden>
                ✕
              </span>
              {u.bad}
            </button>
          ))}
        </div>
        <div className="rd-report" aria-live="polite">
          <div className="rd-report-bad">{c.bad}</div>
          <div className="rd-report-h">诊断</div>
          <ul>
            {c.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="rd-report-h">整容后</div>
          <div className="rd-fixed">
            <Method m={c.fixedMethod} />
            {c.fixedPath}
          </div>
          <p className="rd-report-why">{c.why}</p>
        </div>
      </div>
    </div>
  );
}

/* ================= StatusDealer ================= */

const CODES = [201, 204, 400, 401, 403, 404, 409, 422] as const;

const CODE_TEXT: Record<number, string> = {
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Content",
};

const CODE_MEANING: Record<number, string> = {
  201: "201 是「新资源诞生了」的报喜",
  204: "204 是「办成了,但没什么可说的」",
  400: "400 是「请求本身没说利索」—— 比如 JSON 都解析不了",
  401: "401 是「你是谁?先亮凭证」",
  403: "403 是「认识你,但这事你不许做」",
  404: "404 是「查无此物」",
  409: "409 是「和服务器现有状态撞车了」",
  422: "422 是「话通顺,但内容不合理」",
};

interface Scene {
  scene: ReactNode;
  correct: number;
  explain: ReactNode;
  traps?: Partial<Record<number, string>>;
}

const SCENES: Scene[] = [
  {
    scene: (
      <>
        客户端 POST /posts 发来一篇合法的新文章,服务器成功写入,
        正准备把带着新 id 的文章发回去。
      </>
    ),
    correct: 201,
    explain: (
      <>
        「无中生有」就用 201 Created,再配一个 Location: /posts/43
        头,告诉客户端新居的门牌号。
      </>
    ),
    traps: {
      204: "204 是「没内容」—— 可这里明明要回显新资源:id、createdAt 都是服务器生成的,客户端等着用呢。",
    },
  },
  {
    scene: (
      <>
        DELETE /posts/42 执行成功,资源已删干净,服务器没有任何东西
        需要放进响应体。
      </>
    ),
    correct: 204,
    explain: <>删干净了、又无话可说 —— 204 No Content,连响应体都省了。</>,
    traps: {
      404: "404 是「找不到」—— 这次删除是成功的,资源刚才还好端端在那。",
      201: "201 专属于「创建」;删除成功没有任何新资源诞生。",
    },
  },
  {
    scene: (
      <>
        请求体写着 <code>{'{"title": "hi"'}</code> —— 少了个右花括号,
        JSON 解析器当场报错。
      </>
    ),
    correct: 400,
    explain: (
      <>
        解析都过不了,属于「请求本身有毛病」—— 400 Bad Request,
        怪不到业务逻辑头上。
      </>
    ),
    traps: {
      422: "422 的前提是「JSON 能解析、结构合法」;这里连门都没进,轮不到语义检查出场。",
    },
  },
  {
    scene: <>没带任何凭证,直接 POST /posts 想发文章。</>,
    correct: 401,
    explain: (
      <>
        HTTP 的命名有点坑:401 叫 Unauthorized,实际意思是「未认证」——
        先登录,亮明你是谁再说。
      </>
    ),
    traps: {
      403: "403 的前提是「知道你是谁」;现在连你是谁都不知道,得先请你出示凭证。",
    },
  },
  {
    scene: <>一位已登录的普通用户,想 DELETE 一篇别人写的文章。</>,
    correct: 403,
    explain: (
      <>
        身份明确、权限不够 —— 403 Forbidden。顺带一提:有些 API 会故意回
        404 来掩盖「这资源存在」的事实,那是安全考量下的例外。
      </>
    ),
    traps: {
      401: "凭证没问题,服务器认识 ta —— 差的是权限,不是身份,所以轮不到 401。",
    },
  },
  {
    scene: <>GET /posts/9999,数据库里压根没有 9999 号文章。</>,
    correct: 404,
    explain: (
      <>
        404 Not Found:URL 格式没问题、方法没问题,只是要的东西不存在。
      </>
    ),
    traps: {
      400: "请求本身无可挑剔,只是要的东西不存在 —— 这是 404 的本职工作。",
    },
  },
  {
    scene: (
      <>
        POST /users 注册,用户名 ada 一秒钟前刚被别人抢注了。
      </>
    ),
    correct: 409,
    explain: (
      <>
        409 Conflict:请求和服务器<b>当前状态</b>冲突 ——
        同一个请求换个时间发,可能就成功了。
      </>
    ),
    traps: {
      422: "这份数据本身没毛病(昨天发就成功了),错在和服务器现有数据撞车 —— Conflict,409。",
      400: "语法、语义都挑不出错,坏在「撞车」—— 那是 409 的地盘。",
    },
  },
  {
    scene: (
      <>
        POST /users 注册,JSON 合法、字段齐全,但 email 填的是{" "}
        <code>"hello"</code>。
      </>
    ),
    correct: 422,
    explain: (
      <>
        422 Unprocessable Content:语法过关、语义不过关 ——
        校验失败的标准答案。错误细节怎么报得体面,§05 见。
      </>
    ),
    traps: {
      400: "400 管「话没说利索」;这句话语法通顺,只是内容不合理 —— 422 专管这种。",
      409: "没跟任何现有数据撞车,单纯是这个值不合格。",
    },
  },
];

type DealPhase = "picking" | "answered" | "done";

export function StatusDealer() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<DealPhase>("picking");

  const scene = SCENES[idx];
  const isLast = idx === SCENES.length - 1;

  const pick = (code: number) => {
    if (phase !== "picking") return;
    setPicked(code);
    setPhase("answered");
    if (code === scene.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) {
      setPhase("done");
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setPhase("picking");
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setPhase("picking");
  };

  if (phase === "done") {
    return (
      <div className="viz">
        <div className="viz-title">状态码决策室 —— 发牌完毕</div>
        <div className="rd-deal-end">
          <span className="rd-deal-score">
            {score} / {SCENES.length}
          </span>
          <p className="viz-msg">
            {score === SCENES.length ? (
              <>
                八发八中 —— 你的状态码语感已经比不少上岗后端更靠谱了。
              </>
            ) : score >= 6 ? (
              <>
                大局已定,错的那几张多半在 400/422/409
                的边界上 —— 正是最容易混的三兄弟,点「再来一轮」补刀。
              </>
            ) : (
              <>
                别灰心,状态码是肌肉记忆 —— 再来一轮,专门留意
                「解析失败 vs 语义失败 vs 状态冲突」的差别。
              </>
            )}
          </p>
          <button type="button" className="btn btn-sm btn-primary" onClick={restart}>
            ↻ 再来一轮
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="viz">
      <div className="viz-title">
        状态码决策室 —— 场景发牌,你来定夺
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          场景 {idx + 1} / {SCENES.length} · 答对 {score}
        </span>
      </div>
      <div className="rd-scene">{scene.scene}</div>
      <div className="rd-codes" role="group">
        {CODES.map((code) => {
          let cls = "rd-code-btn";
          if (phase === "answered") {
            if (code === scene.correct) cls += " right";
            else if (code === picked) cls += " wrong";
          }
          return (
            <button
              key={code}
              type="button"
              className={cls}
              data-x={Math.floor(code / 100)}
              disabled={phase === "answered"}
              onClick={() => pick(code)}
            >
              {code} {CODE_TEXT[code]}
            </button>
          );
        })}
      </div>
      {phase === "answered" && picked !== null && (
        <>
          <div
            className={`rd-deal-fb ${picked === scene.correct ? "ok" : "no"}`}
            aria-live="polite"
          >
            {picked === scene.correct ? (
              <>✓ {scene.explain}</>
            ) : (
              <>
                ✕{" "}
                {scene.traps?.[picked] ??
                  `${CODE_MEANING[picked]} —— 放在这个场景不对。`}
                <p style={{ marginTop: 6, marginBottom: 0 }}>
                  <b>正确答案 {scene.correct}:</b>
                  {scene.explain}
                </p>
              </>
            )}
          </div>
          <div className="rd-deal-next">
            <button type="button" className="btn btn-sm btn-primary" onClick={next}>
              {isLast ? "看结果 →" : "下一个场景 →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
