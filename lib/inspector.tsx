"use client";

// 请求检查器 —— 全站共享的「看得见的 HTTP」。
// 打的是同源的 /api/*(本地 Mock API),所以:不依赖第三方服务、不会被限流、
// 不会撞 CORS、断网也能用。学习者点一下就能看到真实的状态码、响应头、
// 计时分解和报文正文 —— DevTools Network 面板的教学版。
//
// 用法:<Inspector presets={[…]} />;预设由各章自己给,想演示什么就配什么。

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { useL, T, type Loc } from "@/lib/i18n";
import { CodeLines } from "@/lib/code";

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
}

interface Timing {
  total: number;
  /** 服务器自报的处理耗时(X-Mock-Latency) */
  server: number | null;
  /** 首字节:从发出到响应头到达 */
  ttfb: number | null;
  /** 下载正文耗时 */
  download: number | null;
}

interface Result {
  status: number;
  statusText: string;
  ok: boolean;
  headers: [string, string][];
  reqHeaders: [string, string][];
  body: string;
  bodyLang: "json" | "http";
  bytes: number;
  timing: Timing;
  note?: ReactNode;
}

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; result: Result }
  | { phase: "error"; message: string };

const METHODS: InspectorMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

/** 只有这些方法习惯带请求体 */
const TAKES_BODY = new Set(["POST", "PUT", "PATCH"]);

export function Inspector({
  presets = [],
  defaultPath = "/api/posts/42",
  defaultMethod = "GET",
  title,
}: {
  presets?: InspectorPreset[];
  defaultPath?: string;
  defaultMethod?: InspectorMethod;
  title?: Loc<ReactNode>;
}) {
  const L = useL();
  const [method, setMethod] = useState<InspectorMethod>(defaultMethod);
  const [path, setPath] = useState(defaultPath);
  const [body, setBody] = useState("");
  const [extraHeaders, setExtraHeaders] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"body" | "res" | "req" | "curl">("body");
  const [state, setState] = useState<State>({ phase: "idle" });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const noteRef = useRef<ReactNode>(null);

  const send = useCallback(
    async (over?: { method: InspectorMethod; path: string; body?: string; headers?: Record<string, string>; note?: ReactNode }) => {
      const m = over?.method ?? method;
      const p = over?.path ?? path;
      const b = over?.body ?? body;
      const h = over?.headers ?? extraHeaders;
      noteRef.current = over?.note ?? null;

      setState({ phase: "loading" });
      const reqHeaders: Record<string, string> = { ...h };
      if (TAKES_BODY.has(m) && b.trim()) reqHeaders["Content-Type"] = "application/json";

      const t0 = performance.now();
      try {
        const res = await fetch(p, {
          method: m,
          headers: reqHeaders,
          body: TAKES_BODY.has(m) && b.trim() ? b : undefined,
        });
        const tHeaders = performance.now();
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
              ttfb: Math.round(tHeaders - t0),
              download: Math.round(t1 - tHeaders),
            },
            note: noteRef.current,
          },
        });
        setTab("body");
      } catch (e) {
        setState({ phase: "error", message: (e as Error).message });
      }
    },
    [method, path, body, extraHeaders],
  );

  const runPreset = (p: InspectorPreset) => {
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
      note: p.note ? L(p.note) : null,
    });
  };

  const curl = useMemo(() => {
    const parts = [`curl -i -X ${method} http://localhost:3300${path}`];
    for (const [k, v] of Object.entries(extraHeaders)) parts.push(`  -H '${k}: ${v}'`);
    if (TAKES_BODY.has(method) && body.trim()) {
      parts.push(`  -H 'Content-Type: application/json'`);
      parts.push(`  -d '${body.replace(/\n\s*/g, "")}'`);
    }
    return parts.join(" \\\n");
  }, [method, path, body, extraHeaders]);

  return (
    <div className="insp">
      <div className="insp-title">
        {title ? L(title) : <T en="Request inspector" zh="请求检查器" />}
        <span className="insp-badge">
          <T en="local · same-origin" zh="本地 · 同源" />
        </span>
      </div>

      {presets.length > 0 && (
        <div className="insp-presets">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`btn btn-sm${activePreset === p.id ? " btn-primary" : ""}`}
              onClick={() => runPreset(p)}
              disabled={state.phase === "loading"}
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
          aria-label={L({ en: "Request path", zh: "请求路径" })}
        />
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => send()}
          disabled={state.phase === "loading"}
        >
          {state.phase === "loading" ? (
            <T en="Sending…" zh="发送中…" />
          ) : (
            <T en="Send" zh="发送" />
          )}
        </button>
      </div>

      {TAKES_BODY.has(method) && (
        <textarea
          className="insp-body-in"
          value={body}
          spellCheck={false}
          rows={3}
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
            en={<>Request failed: {state.message}. Is the dev server running?</>}
            zh={<>请求失败:{state.message}。开发服务器还开着吗?</>}
          />
        </div>
      )}

      {state.phase === "done" && (
        <div className="insp-result">
          {state.result.note && <div className="insp-note">{state.result.note}</div>}

          <div className="insp-meta">
            <span className="status" data-x={Math.floor(state.result.status / 100)}>
              {state.result.status} {state.result.statusText || statusName(state.result.status)}
            </span>
            <span className="insp-timing" title={L({ en: "round trip", zh: "往返总耗时" })}>
              {state.result.timing.total} ms
            </span>
            {state.result.timing.server !== null && (
              <span className="insp-dim">
                <T en="server" zh="服务器" /> {state.result.timing.server} ms ·{" "}
                <T en="network" zh="网络" />{" "}
                {Math.max(0, state.result.timing.total - state.result.timing.server)} ms
              </span>
            )}
            <span className="insp-dim">{formatBytes(state.result.bytes)}</span>
          </div>

          <div className="insp-tabs" role="tablist">
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
                type="button"
                role="tab"
                aria-selected={tab === k}
                className={`insp-tab${tab === k ? " on" : ""}`}
                onClick={() => setTab(k)}
              >
                {L(label)}
              </button>
            ))}
          </div>

          <div className="insp-pane">
            {tab === "body" &&
              (state.result.body ? (
                <CodeLines code={state.result.body} lang={state.result.bodyLang} />
              ) : (
                <div className="insp-empty">
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
                </div>
              ))}

            {tab === "res" && <HeaderTable rows={state.result.headers} />}

            {tab === "req" && (
              <>
                <div className="insp-sub">
                  <T en="Headers you set" zh="你设置的请求头" />
                </div>
                {state.result.reqHeaders.length ? (
                  <HeaderTable rows={state.result.reqHeaders} />
                ) : (
                  <div className="insp-empty">
                    <T en="None — a bare GET needs no headers." zh="一个都没设 —— 裸 GET 本来就不需要。" />
                  </div>
                )}
                <div className="insp-foot">
                  <T
                    en={
                      <>
                        The browser silently adds more (<code>Host</code>,{" "}
                        <code>User-Agent</code>, <code>Accept</code>…). JavaScript
                        cannot read those — only DevTools can show them.
                      </>
                    }
                    zh={
                      <>
                        浏览器还会偷偷加上一堆(<code>Host</code>、
                        <code>User-Agent</code>、<code>Accept</code>…)。
                        JavaScript 读不到它们,只有 DevTools 能看见。
                      </>
                    }
                  />
                </div>
              </>
            )}

            {tab === "curl" && (
              <>
                <CodeLines code={curl} lang="bash" />
                <div className="insp-foot">
                  <T
                    en="Same request, from a terminal. Tools change; the message on the wire does not."
                    zh="同一个请求,换到终端里发。工具千变,线上跑的报文不变。"
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
    409: "Conflict",
    422: "Unprocessable Content",
    429: "Too Many Requests",
    500: "Internal Server Error",
  };
  return m[code] ?? "";
}
