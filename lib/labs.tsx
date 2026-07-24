"use client";

// 动手任务清单(LabSet)—— 代替姊妹项目的 LeetCode 题单。
// 每个任务:勾选框(写入全站进度)+ 编号 + 标题 + 难度徽章 + 标签;
// 展开后是「任务说明」「提示」(先自己想)和「参考做法」(可附代码窗)。
// pid = `${章节 id}/${lab id}`,进度全站互通。

import { useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import type { ChapterId } from "@/lib/curriculum";

export interface Lab {
  /** 稳定 id,进度键的一部分,别改名 */
  id: string;
  title: ReactNode;
  d: "easy" | "medium" | "hard";
  tags: string[];
  /** 任务说明 —— 要做什么、去哪做(浏览器 Console / 在线工具) */
  task: ReactNode;
  /** 一句话提示 —— 不剧透完整做法 */
  hint: ReactNode;
  /** 参考做法 —— 可以是文字 + <CodeBlock /> */
  solution: ReactNode;
}

const D_LABEL = { easy: "EASY", medium: "MEDIUM", hard: "HARD" } as const;

export function LabSet({ ch, items }: { ch: ChapterId; items: Lab[] }) {
  const { isDone, toggleLab, ready } = useProgress();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="plist">
      {items.map((p, i) => {
        const pid = `${ch}/${p.id}`;
        const done = ready && isDone(pid);
        const expanded = open === p.id;
        return (
          <div
            key={p.id}
            className={`prob${done ? " done" : ""}${expanded ? " open" : ""}`}
            data-d={p.d}
          >
            <div
              className="prob-head"
              onClick={() => setOpen(expanded ? null : p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(expanded ? null : p.id);
                }
              }}
              aria-expanded={expanded}
            >
              <button
                type="button"
                className="prob-check"
                aria-label={done ? "标记为未完成" : "做完了,勾掉它"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLab(pid);
                }}
              >
                ✓
              </button>
              <span className="prob-id">LAB {String(i + 1).padStart(2, "0")}</span>
              <span className="prob-title">{p.title}</span>
              <span className="prob-tags">
                {p.tags.map((tag) => (
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
            </div>
            {expanded && (
              <div className="prob-body">
                <div>{p.task}</div>
                <div className="prob-hint-label">提示 · 先自己想一分钟</div>
                <p>{p.hint}</p>
                <div className="prob-hint-label">参考做法</div>
                <div>{p.solution}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
