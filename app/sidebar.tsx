"use client";

// 左侧导航栏:品牌 + 全部章节(每章自己的主题色圆点编号)+ 学习进度。
// 章节清单来自 lib/curriculum.ts;进度来自 lib/progress.tsx。

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CHAPTERS, chapterByPath } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useShell } from "./theme-provider";
import { BrandMark } from "./logo";

export default function Sidebar() {
  const path = usePathname();
  const { sidebarOpen, setSidebarOpen } = useShell();
  const { ready, chapterState, totalLabs, data } = useProgress();

  const current = chapterByPath(path);
  const doneCh = ready
    ? CHAPTERS.filter((c) => chapterState(c.id) === "done").length
    : 0;
  const progress = Math.round((doneCh / CHAPTERS.length) * 100);
  const quizCount = ready ? Object.keys(data.quiz).length : 0;

  const close = () => setSidebarOpen(false);

  return (
    <>
      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        aria-label="APIer 章节导航"
      >
        <Link href="/" className="brand" onClick={close} aria-label="APIer">
          <span className="brand-mark" aria-hidden>
            <BrandMark />
          </span>
          <span>
            <span className="brand-name">APIer</span>
            <span className="brand-tagline">把 API 讲透</span>
          </span>
        </Link>

        <nav className="side-nav" aria-label="章节">
          {CHAPTERS.map((c) => {
            const active = c.id === current.id;
            const state = ready ? chapterState(c.id) : "new";
            return (
              <Link
                key={c.id}
                href={c.href}
                className={`side-link${active ? " active" : ""}`}
                style={{ "--ch-hue": c.hue } as React.CSSProperties}
                aria-current={active ? "page" : undefined}
                onClick={close}
              >
                <span className="side-num" aria-hidden>
                  {c.num}
                </span>
                <span className="side-title">
                  {c.title}
                  <span className="side-en">{c.en}</span>
                </span>
                <span
                  className={`side-state ${state}`}
                  aria-label={
                    state === "done"
                      ? "已完成"
                      : state === "doing"
                        ? "进行中"
                        : "未开始"
                  }
                />
              </Link>
            );
          })}
        </nav>

        <div className="side-status">
          <div>
            完成 <b>{totalLabs}</b> 个动手任务 · <b>{quizCount}</b> 个测验 ·
            通关 <b>{doneCh}</b>/{CHAPTERS.length} 章
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="全书进度"
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>

      <div
        className={`scrim${sidebarOpen ? " open" : ""}`}
        aria-hidden
        onClick={close}
      />
    </>
  );
}
