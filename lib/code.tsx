"use client";

// 代码窗口组件。
//  - CodeBlock:单窗代码(mac 三色点 + 文件名 + 行号 + 可高亮行 + 底部注释)。
//  - CodePair:两窗并排对照(窄屏自动上下叠),REST vs GraphQL 的招牌排版。
// 语言支持见 lib/highlight.tsx:js / json / graphql / bash / http。

import { useMemo, type ReactNode } from "react";
import { highlight, type CodeLangId } from "@/lib/highlight";

const LANG_LABEL: Record<CodeLangId, string> = {
  js: "JavaScript",
  json: "JSON",
  graphql: "GraphQL",
  bash: "Terminal",
  http: "HTTP",
};

export function CodeLines({
  code,
  lang,
  hl,
}: {
  code: string;
  lang: CodeLangId;
  hl?: number[];
}) {
  const lines = useMemo(() => highlight(code.trimEnd(), lang), [code, lang]);
  const hlSet = useMemo(() => new Set(hl ?? []), [hl]);
  return (
    <div className="codewin-body">
      {lines.map((toks, i) => (
        <div key={i} className={`cl${hlSet.has(i + 1) ? " hl" : ""}`}>
          <span className="cl-n">{i + 1}</span>
          <span className="cl-c">
            {toks.map((tok, j) =>
              tok.t ? (
                <span key={j} className={`tk-${tok.t}`}>
                  {tok.s}
                </span>
              ) : (
                <span key={j}>{tok.s}</span>
              ),
            )}
            {toks.length === 0 && " "}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CodeBlock({
  code,
  lang,
  title,
  hl,
  note,
}: {
  code: string;
  lang: CodeLangId;
  title?: string;
  hl?: number[];
  note?: ReactNode;
}) {
  return (
    <div className="codewin">
      <div className="codewin-bar">
        <span className="codewin-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="codewin-name">{title ?? LANG_LABEL[lang]}</span>
        <span style={{ width: 47 }} aria-hidden />
      </div>
      <CodeLines code={code} lang={lang} hl={hl} />
      {note && <div className="codewin-note">{note}</div>}
    </div>
  );
}

/** 两窗并排(≥880px),窄屏自动竖排。left/right 直接传 <CodeBlock />。 */
export function CodePair({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="codepair">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
