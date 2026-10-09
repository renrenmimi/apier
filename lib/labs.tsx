"use client";

// 动手任务清单(LabSet)—— 代替姊妹项目的 LeetCode 题单。
// 每个任务:勾选框(写入全站进度)+ 编号 + 标题 + 难度徽章 + 标签;
// 展开后是「任务说明」「提示」(先自己想)和「参考做法」(可附代码窗)。
// pid = `${章节 id}/${lab id}`,进度全站互通。
//
// 每一行是两个并列的按钮:勾选框和展开按钮。二者不能嵌套:勾选框放在可点击的整行里,
// Enter / Space 会被整行接走,键盘用户就永远没法把任务记为完成。

import { useId, useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import { useL, type Loc } from "@/lib/i18n";
import type { ChapterId } from "@/lib/curriculum";

export interface Lab {
  /** 稳定 id,进度键的一部分,别改名 */
  id: string;
  title: Loc<ReactNode>;
  d: "easy" | "medium" | "hard";
  tags: Loc<string[]>;
  /** 任务说明 —— 要做什么、去哪做(浏览器 Console / 在线工具) */
  task: Loc<ReactNode>;
  /** 一句话提示 —— 不剧透完整做法 */
  hint: Loc<ReactNode>;
  /** 参考做法 —— 可以是文字 + <CodeBlock /> */
  solution: Loc<ReactNode>;
}

const D_LABEL = { easy: "EASY", medium: "MEDIUM", hard: "HARD" } as const;

export function LabSet({ ch, items }: { ch: ChapterId; items: Lab[] }) {
  const L = useL();
  const { isDone, toggleLab, ready } = useProgress();
  const [open, setOpen] = useState<string | null>(null);
  const listId = useId();

  return (
    <div className="plist">
      {items.map((p, i) => {
        const pid = `${ch}/${p.id}`;
        const done = ready && isDone(pid);
        const expanded = open === p.id;
        const num = String(i + 1).padStart(2, "0");
        const bodyId = `${listId}-${p.id}`;
        return (
          <div
            key={p.id}
            className={`prob${done ? " done" : ""}${expanded ? " open" : ""}`}
            data-d={p.d}
          >
            <div className="prob-head">
              <button
                type="button"
                role="checkbox"
                className="prob-check"
                aria-checked={done}
                aria-label={L({ en: `Mark LAB ${num} as done`, zh: `将 LAB ${num} 标记为已完成` })}
                onClick={() => toggleLab(pid)}
              >
                ✓
              </button>
              {/* 可访问名称只取编号和标题;标签和难度只会让读屏念得更长 */}
              <button
                type="button"
                className="prob-toggle"
                aria-expanded={expanded}
                aria-controls={expanded ? bodyId : undefined}
                aria-labelledby={`${bodyId}-n ${bodyId}-t`}
                onClick={() => setOpen(expanded ? null : p.id)}
              >
                <span className="prob-id" id={`${bodyId}-n`}>
                  LAB {num}
                </span>
                <span className="prob-title" id={`${bodyId}-t`}>
                  {L(p.title)}
                </span>
                <span className="prob-tags">
                  {L(p.tags).map((tag) => (
                    <span key={tag} className="prob-tag">
                      {tag}
                    </span>
                  ))}
                </span>
                <span className="lc-badge" data-d={p.d}>
                  {D_LABEL[p.d]}
                </span>
                <span className="prob-caret" aria-hidden>
                  ▼
                </span>
              </button>
            </div>
            {expanded && (
              <div className="prob-body" id={bodyId}>
                <div>{L(p.task)}</div>
                <div className="prob-hint-label">
                  {L({
                    en: "Hint · try it yourself first",
                    zh: "提示 · 先自己想一分钟",
                  })}
                </div>
                <p>{L(p.hint)}</p>
                <div className="prob-hint-label">
                  {L({ en: "One way to do it", zh: "参考做法" })}
                </div>
                <div>{L(p.solution)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
