"use client";

// The request inspector: "HTTP you can see".
//
// Requests go to /mock-api/*, which this visitor's own Service Worker answers
// from their own IndexedDB. That means no third-party dependency, no CORS, no
// shared rate limit, and no way for one visitor to affect another.
//
// Send stays disabled until the worker has proven it is in control. Falling
// back to the network would reach the real server and return a 404 HTML page,
// which would quietly teach the learner the wrong thing.
//
// Usage: <Inspector presets={[...]} /> -- each chapter supplies the scenarios
// it wants to demonstrate.

import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useL, useLang, T, type Loc } from "@/lib/i18n";
import { CodeLines } from "@/lib/code";
import { MOCK_BASE } from "@/lib/mock/engine";
import { useMockApi } from "@/lib/mock/client";

/** Port that `npm run dev` binds, quoted by the curl tab. */
const DEV_PORT = 3300;

export type InspectorMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface InspectorPreset {
  /** 稳定 id */
  id: string;
  /** 按钮上的字 */
  label: Loc<string>;
  method: InspectorMethod;
  /** 同源路径,如 /api/posts/42 */
  path: string;
  /** 请求体(JSON 字符串);GET/DELETE 留空 */
  body?: string;
  /** 额外请求头 */
  headers?: Record<string, string>;
  /** 这个预设想让学习者看到什么 —— 显示在结果上方 */
  note?: Loc<ReactNode>;
  /**
   * 说明所描述的状态码。实际得到的状态码不在其中时(例如被限流成了 429),
   * 说明换成一句「这次得到的是别的状态码,原因见响应体」,不再讲一个没有发生的结果。
   */
  expect?: number | number[];
}

interface Timing {
  total: number;
  /** 服务器自报的处理耗时(X-Mock-Latency),也就是 mock 人为加的延迟 */
  server: number | null;
}

interface Result {
  method: InspectorMethod;
  status: number;
  statusText: string;
  ok: boolean;
  headers: [string, string][];
  reqHeaders: [string, string][];
  body: string;
  bodyLang: "json" | "http";
  bytes: number;
  timing: Timing;
  /** 保存成 Loc 原值,渲染时再按当前语言解析:发送之后切换语言,说明也跟着换 */
  note?: Loc<ReactNode> | null;
  expect?: number[];
}

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; result: Result }
  | { phase: "error"; message: string };

const METHODS: InspectorMethod[] = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

/** 检查器只访问浏览器里的 mock:别的路径会落到真正的服务器上,得到的不是本章讲的东西。 */
const onMock = (p: string) => p === MOCK_BASE || p.startsWith(`${MOCK_BASE}/`) || p.startsWith(`${MOCK_BASE}?`);

/** 给 shell 用的单引号字面量:内部的 ' 写成 '\'' */
const shellQuote = (s: string) => `'${s.replace(/'/g, "'\\''")}'`;

const TABS = ["body", "res", "req", "curl"] as const;
type Tab = (typeof TABS)[number];

/** 只有这些方法习惯带请求体 */
const TAKES_BODY = new Set(["POST", "PUT", "PATCH"]);

export function Inspector({
  presets = [],
  defaultPath = `${MOCK_BASE}/posts/42`,
  defaultMethod = "GET",
  title,
}: {
  presets?: InspectorPreset[];
  defaultPath?: string;
  defaultMethod?: InspectorMethod;
  title?: Loc<ReactNode>;
}) {
  const L = useL();
  const { lang } = useLang();
  // The mock words its messages in the language the visitor is reading.
  const acceptLanguage = lang === "zh" ? "zh-CN" : "en";
  const mock = useMockApi();
  const blocked = mock.phase !== "ready";
  const [method, setMethod] = useState<InspectorMethod>(defaultMethod);
  const [path, setPath] = useState(defaultPath);
  const [body, setBody] = useState("");
  const [extraHeaders, setExtraHeaders] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>("body");
  const [state, setState] = useState<State>({ phase: "idle" });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  // 同步的「正在发送」标记:状态更新要等下一次渲染才生效,连按 Enter 会在那之前再发一次
  const inFlight = useRef(false);
  const uid = useId();
  const pathOk = onMock(path);

  const send = useCallback(
    async (over?: {
      method: InspectorMethod;
      path: string;
      body?: string;
      headers?: Record<string, string>;
      note?: Loc<ReactNode> | null;
      expect?: number | number[];
    }) => {
      // Never reach the network for a /mock-api path: if the worker is not in
      // control the server would answer 404 and the lesson would be a lie.
      if (mock.phase !== "ready" || inFlight.current) return;

      const m = over?.method ?? method;
      const p = over?.path ?? path;
      const b = over?.body ?? body;
      const h = over?.headers ?? extraHeaders;
      // Nor for any other path: the real server would answer instead of the mock.
      if (!onMock(p)) return;
      const note = over?.note ?? null;
      const expect = over?.expect === undefined ? undefined : ([] as number[]).concat(over.expect);

      inFlight.current = true;
      setState({ phase: "loading" });
      const reqHeaders: Record<string, string> = { "Accept-Language": acceptLanguage, ...h };
      if (TAKES_BODY.has(m) && b.trim()) reqHeaders["Content-Type"] = "application/json";

      const t0 = performance.now();
      try {
        const res = await fetch(p, {
          method: m,
          headers: reqHeaders,
          body: TAKES_BODY.has(m) && b.trim() ? b : undefined,
        });
        const text = await res.text();
        const t1 = performance.now();

        // 尽量把 JSON 排版好看;不是 JSON 就原样显示
        let pretty = text;
        let lang: "json" | "http" = "json";
        if (text) {
          try {
            pretty = JSON.stringify(JSON.parse(text), null, 2);
          } catch {
            lang = "http";
          }
        } else {
          pretty = "";
        }

        const serverMs = res.headers.get("x-mock-latency");
        setState({
          phase: "done",
          result: {
            method: m,
            status: res.status,
            statusText: res.statusText,
            ok: res.ok,
            headers: [...res.headers.entries()].sort(([a], [b2]) => a.localeCompare(b2)),
            reqHeaders: Object.entries(reqHeaders),
            body: pretty,
            bodyLang: lang,
            bytes: new Blob([text]).size,
            timing: {
              total: Math.round(t1 - t0),
              server: serverMs ? parseInt(serverMs, 10) : null,
            },
            note,
            expect,
          },
        });
        setTab("body");
      } catch (e) {
        setState({ phase: "error", message: (e as Error).message });
      } finally {
        inFlight.current = false;
      }
    },
    [method, path, body, extraHeaders, mock.phase, acceptLanguage],
  );

  const runPreset = (p: InspectorPreset) => {
    if (blocked) return;
    setMethod(p.method);
    setPath(p.path);
    setBody(p.body ?? "");
    setExtraHeaders(p.headers ?? {});
    setActivePreset(p.id);
    send({
      method: p.method,
      path: p.path,
      body: p.body ?? "",
      headers: p.headers ?? {},
      note: p.note ?? null,
      expect: p.expect,
    });
  };

  // 标签页的键盘操作(WAI-ARIA tabs):左右方向键切换,Home / End 到头尾,焦点跟着走
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.indexOf(tab);
    const next =
      e.key === "ArrowRight" ? TABS[(i + 1) % TABS.length]
      : e.key === "ArrowLeft" ? TABS[(i - 1 + TABS.length) % TABS.length]
      : e.key === "Home" ? TABS[0]
      : e.key === "End" ? TABS[TABS.length - 1]
      : null;
    if (!next) return;
    e.preventDefault();
    setTab(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  // curl cannot reach a Service Worker, so this deliberately targets the
  // server-side mock that a cloned repository runs at /api on the dev port.
  // It is the same engine, but a separate store from the one above.
  const curl = useMemo(() => {
    const localPath = path.startsWith(MOCK_BASE)
      ? `/api${path.slice(MOCK_BASE.length)}`
      : path;
    // 每个参数都用单引号包住:zsh 会把裸露的 ? 当通配符,任何 shell 都会在 & 处断开命令
    const url = shellQuote(`http://localhost:${DEV_PORT}${localPath}`);
    // HEAD 用 -I:-X HEAD 会让 curl 一直等一个永远不会来的响应体
    const parts = [method === "HEAD" ? `curl -I ${url}` : `curl -i -X ${method} ${url}`];
    for (const [k, v] of Object.entries({ "Accept-Language": acceptLanguage, ...extraHeaders })) {
      parts.push(`  -H ${shellQuote(`${k}: ${v}`)}`);
    }
    if (TAKES_BODY.has(method) && body.trim()) {
      parts.push(`  -H 'Content-Type: application/json'`);
      parts.push(`  -d ${shellQuote(body.replace(/\n\s*/g, ""))}`);
    }
    return parts.join(" \\\n");
  }, [method, path, body, extraHeaders, acceptLanguage]);

  return (
    <div className="insp">
      <div className="insp-title">
        {title ? L(title) : <T en="Request inspector" zh="请求检查器" />}
        <span className="insp-badge" data-phase={mock.phase}>
          {mock.phase === "ready" ? (
            <T en="runs in your browser" zh="跑在你的浏览器里" />
          ) : mock.phase === "starting" ? (
            <T en="starting…" zh="启动中…" />
          ) : (
            <T en="unavailable" zh="不可用" />
          )}
        </span>
      </div>

      <MockStatus />

      {presets.length > 0 && (
        <div className="insp-presets">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`btn btn-sm${activePreset === p.id ? " btn-primary" : ""}`}
              onClick={() => runPreset(p)}
              disabled={blocked || state.phase === "loading"}
            >
              {L(p.label)}
            </button>
          ))}
        </div>
      )}

      {/* 请求行:方法 + 路径 + 发送 */}
      <div className="insp-line">
        <select
          className="insp-method"
          data-m={method}
          value={method}
          onChange={(e) => setMethod(e.target.value as InspectorMethod)}
          disabled={blocked}
          aria-label={L({ en: "HTTP method", zh: "HTTP 方法" })}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          className="insp-path"
          value={path}
          spellCheck={false}
          onChange={(e) => setPath(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          disabled={blocked}
          aria-label={L({ en: "Request path", zh: "请求路径" })}
          aria-invalid={!pathOk}
          aria-describedby={pathOk ? undefined : `${uid}-path-hint`}
        />
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => send()}
          disabled={blocked || state.phase === "loading" || !pathOk}
        >
          {state.phase === "loading" ? (
            <T en="Sending…" zh="发送中…" />
          ) : (
            <T en="Send" zh="发送" />
          )}
        </button>
      </div>

      {!pathOk && (
        <div className="insp-err" id={`${uid}-path-hint`}>
          <T
            en={<>This inspector only reaches the mock API in your browser, so the path must start with <code>{MOCK_BASE}</code>.</>}
            zh={<>这个检查器只能访问你浏览器里的 Mock API,路径必须以 <code>{MOCK_BASE}</code> 开头。</>}
          />
        </div>
      )}

      {TAKES_BODY.has(method) && (
        <textarea
          className="insp-body-in"
          value={body}
          spellCheck={false}
          rows={3}
          disabled={blocked}
          aria-label={L({ en: "Request body (JSON)", zh: "请求体(JSON)" })}
          placeholder={L({
            en: 'Request body (JSON), e.g. {"title":"hello"}',
            zh: '请求体(JSON),例如 {"title":"hello"}',
          })}
          onChange={(e) => setBody(e.target.value)}
        />
      )}

      {Object.keys(extraHeaders).length > 0 && (
        <div className="insp-chips">
          {Object.entries(extraHeaders).map(([k, v]) => (
            <span key={k} className="insp-chip" title={`${k}: ${v}`}>
              {k}: <b>{v.length > 28 ? v.slice(0, 28) + "…" : v}</b>
            </span>
          ))}
        </div>
      )}

      {/* ---- 结果 ---- */}
      {state.phase === "error" && (
        <div className="insp-err">
          <T
            en={<>The request failed before the mock API could answer it: {state.message}.</>}
            zh={<>请求在 Mock API 作答之前就失败了:{state.message}。</>}
          />
        </div>
      )}

      {state.phase === "done" && (
        <div className="insp-result">
          {state.result.note &&
            (!state.result.expect || state.result.expect.includes(state.result.status) ? (
              <div className="insp-note">{L(state.result.note)}</div>
            ) : (
              <div className="insp-note">
                <T
                  en={
                    <>
                      This time the answer was <b>{state.result.status} {statusName(state.result.status)}</b>, not the{" "}
                      {state.result.expect.join(" or ")} this step is about. The response body says why.
                    </>
                  }
                  zh={
                    <>
                      这一次得到的是 <b>{state.result.status} {statusName(state.result.status)}</b>,而不是这一步要演示的 {state.result.expect.join(" 或 ")}。原因写在响应体里。
                    </>
                  }
                />
              </div>
            ))}

          <div className="insp-meta">
            <span className="status" data-x={Math.floor(state.result.status / 100)}>
              {state.result.status} {state.result.statusText || statusName(state.result.status)}
            </span>
            <span className="insp-timing" title={L({ en: "round trip", zh: "往返总耗时" })}>
              {state.result.timing.total} ms
            </span>
            {state.result.timing.server !== null && (
              <span className="insp-dim">
                <span
                  title={L({
                    en: "Simulated server time (X-Mock-Latency); change it with ?delay=",
                    zh: "模拟的服务器耗时(X-Mock-Latency),可用 ?delay= 调整",
                  })}
                >
                  <T en="server" zh="服务器" /> {state.result.timing.server} ms
                </span>{" "}
                ·{" "}
                <span
                  title={L({
                    en: "The rest: the Service Worker, IndexedDB and the page. The request never leaves your browser.",
                    zh: "其余时间花在 Service Worker、IndexedDB 和页面上;请求没有离开你的浏览器。",
                  })}
                >
                  <T en="in the browser" zh="浏览器内" />{" "}
                  {Math.max(0, state.result.timing.total - state.result.timing.server)} ms
                </span>
              </span>
            )}
            <span className="insp-dim">{formatBytes(state.result.bytes)}</span>
          </div>

          <div className="insp-tabs" role="tablist" aria-label={L({ en: "Result", zh: "结果" })}>
            {(
              [
                ["body", { en: "Response body", zh: "响应体" }],
                ["res", { en: `Response headers (${state.result.headers.length})`, zh: `响应头 (${state.result.headers.length})` }],
                ["req", { en: "Request", zh: "请求" }],
                ["curl", { en: "curl", zh: "curl" }],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                id={`${uid}-tab-${k}`}
                type="button"
                role="tab"
                aria-selected={tab === k}
                aria-controls={`${uid}-panel`}
                tabIndex={tab === k ? 0 : -1}
                className={`insp-tab${tab === k ? " on" : ""}`}
                onClick={() => setTab(k)}
                onKeyDown={onTabKey}
              >
                {L(label)}
              </button>
            ))}
          </div>

          <div
            className="insp-pane"
            role="tabpanel"
            id={`${uid}-panel`}
            aria-labelledby={`${uid}-tab-${tab}`}
            tabIndex={0}
          >
            {tab === "body" &&
              (state.result.body ? (
                <CodeLines code={state.result.body} lang={state.result.bodyLang} />
              ) : (
                <div className="insp-empty">
                  {state.result.method === "HEAD" ? (
                    <T
                      en={<>No response body — HEAD asks for the headers only.</>}
                      zh={<>没有响应体 —— HEAD 只要响应头。</>}
                    />
                  ) : (
                    <T
                      en={
                        <>
                          No response body — that is the point of{" "}
                          <b>{state.result.status}</b>.
                        </>
                      }
                      zh={
                        <>
                          没有响应体 —— <b>{state.result.status}</b> 的含义就在这里。
                        </>
                      }
                    />
                  )}
                </div>
              ))}

            {tab === "res" && <HeaderTable rows={state.result.headers} />}

            {tab === "req" && (
              <>
                <div className="insp-sub">
                  <T en="Headers the inspector sent" zh="检查器发出的请求头" />
                </div>
                <HeaderTable rows={state.result.reqHeaders} />
                <div className="insp-foot">
                  <T
                    en={
                      <>
                        <code>Accept-Language</code> follows the interface
                        language, which is why the mock&apos;s messages are in
                        the language you are reading. The browser silently adds more (<code>Host</code>,{" "}
                        <code>User-Agent</code>, <code>Accept</code>…). JavaScript
                        cannot read those — only DevTools can show them.
                      </>
                    }
                    zh={
                      <>
                        <code>Accept-Language</code>{" 跟随界面语言,所以 mock 返回的提示文字与你正在阅读的语言一致。"}
                        浏览器还会偷偷加上一堆(<code>Host</code>、
                        <code>User-Agent</code>、<code>Accept</code>…)。JavaScript 读不到它们,只有 DevTools 能看见。
                      </>
                    }
                  />
                </div>
              </>
            )}

            {tab === "curl" && (
              <>
                <div className="insp-sub">
                  <T en="Run against a local clone" zh="在本地克隆上运行" />
                </div>
                <CodeLines code={curl} lang="bash" />
                <div className="insp-foot">
                  <T
                    en={
                      <>
                        Same HTTP message, sent from a terminal. It cannot reach
                        the request above: that one is answered by a Service
                        Worker inside your browser, and curl is a separate
                        program with no access to it. This command targets{" "}
                        <code>/api</code> on a cloned repository running{" "}
                        <code>npm run dev</code> — the same engine, its own
                        separate data.
                      </>
                    }
                    zh={
                      <>
                        同一份 HTTP 报文,换到终端里发。它<b>到不了</b>上面那个请求
                        —— 上面是你浏览器里的 Service Worker 答的,而 curl
                        是另一个程序,碰不到它。这条命令打的是本地克隆跑起
                        <code>npm run dev</code> 之后的 <code>/api</code>:同一套引擎,另一份独立数据。
                      </>
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Explains the mock's state in plain language. It is deliberately visible in
 * every phase except the healthy one, so a learner is never left guessing why
 * Send is greyed out.
 */
function MockStatus() {
  const mock = useMockApi();

  if (mock.phase === "ready") {
    if (mock.durable) return null;
    return (
      <div className="insp-state" data-tone="warn">
        <T
          en={
            <>
              Ready, but this browser is not allowing local storage, so your
              changes will be lost when you refresh. Private windows often do
              this.
            </>
          }
          zh={
            <>
              可以用了,但这个浏览器不让写本地存储,所以刷新之后你的改动会丢失。无痕窗口常常这样。
            </>
          }
        />
      </div>
    );
  }

  if (mock.phase === "starting") {
    return (
      <div className="insp-state" data-tone="wait">
        <T
          en={<>Starting the mock API inside your browser…</>}
          zh={<>正在你的浏览器里启动 Mock API…</>}
        />
      </div>
    );
  }

  if (mock.phase === "unsupported") {
    return (
      <div className="insp-state" data-tone="bad">
        <T
          en={
            <>
              This browser cannot run the mock API, because it has no Service
              Worker support in this context. Sending is disabled rather than
              quietly falling back to a server, which would return something
              different from what this chapter describes. The code samples
              below are still accurate.
            </>
          }
          zh={
            <>
              这个浏览器在当前环境下不支持 Service Worker,跑不了 Mock API。发送按钮已禁用 —— 我们不会偷偷改打服务器,那样返回的东西和本章讲的不是一回事。下面的代码示例依然准确。
            </>
          }
        />
      </div>
    );
  }

  return (
    <div className="insp-state" data-tone="bad">
      <T
        en={
          <>
            The mock API did not start{mock.reason ? ` (${mock.reason})` : ""}.
            Reload the page to try again. Sending stays disabled so you are
            never shown a server response pretending to be your local one.
          </>
        }
        zh={
          <>
            Mock API 没能启动{mock.reason ? `(${mock.reason})` : ""}。刷新页面可以重试。发送保持禁用 ——
            免得把服务器的响应冒充成你本地的那份给你看。
          </>
        }
      />
    </div>
  );
}

function HeaderTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="insp-headers">
      {rows.map(([k, v]) => (
        <div key={k} className="insp-hrow">
          <span className="insp-hk">{k}</span>
          <span className="insp-hv">{v}</span>
        </div>
      ))}
    </div>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

/** fetch 拿不到 statusText 时的兜底(HTTP/2 起就不传原因短语了) */
function statusName(code: number) {
  const m: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    409: "Conflict",
    422: "Unprocessable Content",
    429: "Too Many Requests",
    500: "Internal Server Error",
    501: "Not Implemented",
  };
  return m[code] ?? "";
}
