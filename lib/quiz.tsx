"use client";

// Quiz 引擎 —— 三种题型:
//  - choice:单选,点击即判,答错给「针对性纠错」(每个错误选项一条,禁止通用文案),
//    同时点亮正确项;计分按第一次点击。
//  - multi:多选,勾选后「检查」;漏选/错选分别提示。
//  - fill:填空,回车或按钮判定;可反复尝试,答对为止(计分按最终是否答对)。
// 全部答完 → 结算面板,成绩写入进度系统(取历史最好成绩,决定章节「通关」状态)。

import { useEffect, useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import type { ChapterId } from "@/lib/curriculum";

export type QuizItem =
  | {
      type: "choice";
      q: ReactNode;
      opts: ReactNode[];
      correct: number;
      /** 每个选项的针对性纠错(正确项可留 undefined) */
      wrong?: (ReactNode | undefined)[];
      why: ReactNode;
    }
  | {
      type: "multi";
      q: ReactNode;
      opts: ReactNode[];
      correct: number[];
      missHint: ReactNode;
      extraHint: ReactNode;
      why: ReactNode;
    }
  | {
      type: "fill";
      q: ReactNode;
      placeholder?: string;
      /** 允许的答案(不区分大小写、去空格后比较) */
      answers: string[];
      hint: ReactNode;
      why: ReactNode;
    };

type ItemState =
  | { phase: "idle" }
  | { phase: "right"; first: boolean }
  | { phase: "wrong"; picked: number | null; tries: number };

const KEYS = "ABCDEFGH";

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export function Quiz({ ch, items }: { ch: ChapterId; items: QuizItem[] }) {
  const { reportQuiz } = useProgress();
  const [states, setStates] = useState<ItemState[]>(() =>
    items.map(() => ({ phase: "idle" })),
  );
  const [multiPicks, setMultiPicks] = useState<Record<number, number[]>>({});
  const [fillText, setFillText] = useState<Record<number, string>>({});
  const [reported, setReported] = useState(false);

  const answered = states.filter((s) => s.phase !== "idle").length;
  const firstRight = states.filter(
    (s) => s.phase === "right" && s.first,
  ).length;
  const allDone = answered === items.length;

  // 全部答完 → 上报成绩。放在 effect 里而不是 setStates 的更新函数里:
  // 渲染期间去改 ProgressProvider 的状态是 React 反模式,会报
  // "Cannot update a component while rendering a different component"。
  useEffect(() => {
    if (reported || !allDone) return;
    reportQuiz(ch, firstRight, items.length);
    setReported(true);
  }, [allDone, reported, firstRight, ch, items.length, reportQuiz]);

  const setState = (i: number, st: ItemState) => {
    setStates((prev) => {
      const next = [...prev];
      next[i] = st;
      return next;
    });
  };

  const reset = () => {
    setStates(items.map(() => ({ phase: "idle" })));
    setMultiPicks({});
    setFillText({});
    setReported(false);
  };

  return (
    <div className="quiz">
      {items.map((item, i) => {
        const st = states[i];
        const dataState =
          st.phase === "right" ? "right" : st.phase === "wrong" ? "wrong" : "";
        return (
          <div className="q-item" key={i} data-state={dataState}>
            <div className="q-num">
              QUESTION {String(i + 1).padStart(2, "0")} / {items.length}
            </div>
            <p className="q-text">{item.q}</p>

            {item.type === "choice" && (
              <ChoiceBody
                item={item}
                st={st}
                onPick={(k) => {
                  if (st.phase !== "idle") return;
                  if (k === item.correct)
                    setState(i, { phase: "right", first: true });
                  else setState(i, { phase: "wrong", picked: k, tries: 1 });
                }}
              />
            )}

            {item.type === "multi" && (
              <MultiBody
                item={item}
                st={st}
                picks={multiPicks[i] ?? []}
                onToggle={(k) => {
                  if (st.phase !== "idle") return;
                  setMultiPicks((p) => {
                    const cur = p[i] ?? [];
                    return {
                      ...p,
                      [i]: cur.includes(k)
                        ? cur.filter((x) => x !== k)
                        : [...cur, k],
                    };
                  });
                }}
                onCheck={() => {
                  if (st.phase !== "idle") return;
                  const picks = (multiPicks[i] ?? []).slice().sort();
                  const target = item.correct.slice().sort();
                  const ok =
                    picks.length === target.length &&
                    picks.every((v, j) => v === target[j]);
                  if (ok) setState(i, { phase: "right", first: true });
                  else setState(i, { phase: "wrong", picked: null, tries: 1 });
                }}
              />
            )}

            {item.type === "fill" && (
              <FillBody
                item={item}
                st={st}
                text={fillText[i] ?? ""}
                setText={(v) => setFillText((p) => ({ ...p, [i]: v }))}
                onSubmit={() => {
                  if (st.phase === "right") return;
                  const val = norm(fillText[i] ?? "");
                  if (!val) return;
                  const ok = item.answers.some((a) => norm(a) === val);
                  if (ok)
                    setState(i, {
                      phase: "right",
                      first: st.phase === "idle",
                    });
                  else
                    setState(i, {
                      phase: "wrong",
                      picked: null,
                      tries: st.phase === "wrong" ? st.tries + 1 : 1,
                    });
                }}
              />
            )}
          </div>
        );
      })}

      {allDone && (
        <div className="quiz-score">
          <span className="big">
            {firstRight}/{items.length}
          </span>
          <span>
            {firstRight === items.length ? (
              <>
                <b>全对!本章正式通关</b> —— 侧栏的小绿灯已经为你点亮。
              </>
            ) : (
              <>
                第一次尝试答对 {firstRight} 题。回头看看错题的解释,然后
                <b>重做一遍拿全对</b>,才算真正拿下这一章。
              </>
            )}
          </span>
          <button
            type="button"
            className="btn btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={reset}
          >
            重做测验
          </button>
        </div>
      )}
    </div>
  );
}

function ChoiceBody({
  item,
  st,
  onPick,
}: {
  item: Extract<QuizItem, { type: "choice" }>;
  st: ItemState;
  onPick: (k: number) => void;
}) {
  const locked = st.phase !== "idle";
  return (
    <>
      <div className="q-opts" role="group">
        {item.opts.map((opt, k) => {
          let cls = "q-opt";
          if (locked) {
            if (k === item.correct) cls += " right";
            else if (st.phase === "wrong" && st.picked === k) cls += " wrong";
          }
          return (
            <button
              key={k}
              type="button"
              className={cls}
              disabled={locked}
              onClick={() => onPick(k)}
            >
              <span className="key">{KEYS[k]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {st.phase === "right" && (
        <div className="q-feedback ok">✓ {item.why}</div>
      )}
      {st.phase === "wrong" && st.picked !== null && (
        <div className="q-feedback no">
          ✕ {item.wrong?.[st.picked] ?? item.why}
          <p style={{ marginTop: 6, marginBottom: 0 }}>
            <b>正确答案是 {KEYS[item.correct]}:</b>
            {item.why}
          </p>
        </div>
      )}
    </>
  );
}

function MultiBody({
  item,
  st,
  picks,
  onToggle,
  onCheck,
}: {
  item: Extract<QuizItem, { type: "multi" }>;
  st: ItemState;
  picks: number[];
  onToggle: (k: number) => void;
  onCheck: () => void;
}) {
  const locked = st.phase !== "idle";
  const missed = item.correct.some((c) => !picks.includes(c));
  const extra = picks.some((p) => !item.correct.includes(p));
  return (
    <>
      <div className="q-opts" role="group">
        {item.opts.map((opt, k) => {
          let cls = "q-opt";
          if (!locked && picks.includes(k)) cls += " picked";
          if (locked) {
            if (item.correct.includes(k)) cls += " right";
            else if (picks.includes(k)) cls += " wrong";
          }
          return (
            <button
              key={k}
              type="button"
              className={cls}
              disabled={locked}
              onClick={() => onToggle(k)}
            >
              <span className="key">{picks.includes(k) ? "✓" : KEYS[k]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {!locked && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-sm"
            disabled={picks.length === 0}
            onClick={onCheck}
          >
            检查(多选)
          </button>
        </div>
      )}
      {st.phase === "right" && (
        <div className="q-feedback ok">✓ {item.why}</div>
      )}
      {st.phase === "wrong" && (
        <div className="q-feedback no">
          ✕ {extra ? item.extraHint : missed ? item.missHint : item.why}
          <p style={{ marginTop: 6, marginBottom: 0 }}>
            <b>正确组合:</b>
            {item.correct.map((c) => KEYS[c]).join(" + ")} —— {item.why}
          </p>
        </div>
      )}
    </>
  );
}

function FillBody({
  item,
  st,
  text,
  setText,
  onSubmit,
}: {
  item: Extract<QuizItem, { type: "fill" }>;
  st: ItemState;
  text: string;
  setText: (v: string) => void;
  onSubmit: () => void;
}) {
  const solved = st.phase === "right";
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          className="q-input"
          placeholder={item.placeholder ?? "输入答案…"}
          value={text}
          disabled={solved}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
        />
        <button
          type="button"
          className="btn btn-sm"
          disabled={solved || !text.trim()}
          onClick={onSubmit}
        >
          确认
        </button>
      </div>
      {solved && <div className="q-feedback ok">✓ {item.why}</div>}
      {st.phase === "wrong" && (
        <div className="q-feedback no">
          ✕ 还不对 —— {item.hint}
          {st.tries >= 3 && (
            <p style={{ marginTop: 6, marginBottom: 0 }}>
              <b>参考答案:</b>
              <code>{item.answers[0]}</code>
            </p>
          )}
        </div>
      )}
    </>
  );
}
