"use client";

// 左侧导航栏:品牌 + 全部章节(每章自己的主题色圆点编号)+ 学习进度。
// 章节清单来自 lib/curriculum.ts;进度来自 lib/progress.tsx。
//
// 960px 以下侧栏是滑出的抽屉。只要它不在屏幕上(抽屉关着,或桌面上折叠了)就是 inert,
// 里面的链接不再是 Tab 停靠点。抽屉打开时,背后的页面 inert 且不滚动,焦点移进抽屉;
// Esc 或点遮罩关闭抽屉,焦点回到菜单按钮。

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CHAPTERS, chapterByPath } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useL, T } from "@/lib/i18n";
import { useShell } from "./theme-provider";
import { BrandMark } from "./logo";

/** 窄屏布局(侧栏是抽屉)时为 true。 */
export function useNarrowLayout() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 960px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const L = useL();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useShell();
  const narrow = useNarrowLayout();
  const asideRef = useRef<HTMLElement>(null);
  const restoreFocus = useRef(false);
  const { ready, chapterState, totalLabs, data } = useProgress();

  const current = chapterByPath(path);
  const doneCh = ready
    ? CHAPTERS.filter((c) => chapterState(c.id) === "done").length
    : 0;
  const progress = Math.round((doneCh / CHAPTERS.length) * 100);
  const quizCount = ready ? Object.keys(data.quiz).length : 0;

  const drawerOpen = narrow && sidebarOpen;
  const offScreen = narrow ? !sidebarOpen : sidebarCollapsed;

  // 点了链接:直接关
  const close = () => setSidebarOpen(false);
  // Esc 或点遮罩:关掉,并把焦点还给菜单按钮
  const dismiss = () => {
    restoreFocus.current = true;
    setSidebarOpen(false);
  };

  // 视口拉宽到断点以上就没有抽屉可开了
  useEffect(() => {
    if (!narrow) setSidebarOpen(false);
  }, [narrow, setSidebarOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      if (restoreFocus.current) {
        restoreFocus.current = false;
        document.getElementById("sidebar-toggle")?.focus();
      }
      return;
    }
    const main = document.querySelector<HTMLElement>(".shell-main");
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    main?.setAttribute("inert", "");
    html.style.overflow = "hidden";
    asideRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        restoreFocus.current = true;
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      main?.removeAttribute("inert");
      html.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, setSidebarOpen]);

  return (
    <>
      <aside
        id="sidebar"
        ref={asideRef}
        inert={offScreen}
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        aria-label={L({ en: "APIer chapter navigation", zh: "APIer 章节导航" })}
      >
        <Link
          href="/"
          className="brand"
          onClick={close}
          prefetch={false}
          onMouseEnter={() => router.prefetch("/")}
          onFocus={() => router.prefetch("/")}
        >
          <span className="brand-mark" aria-hidden>
            <BrandMark />
          </span>
          <span>
            <span className="brand-name">APIer</span>
            <span className="brand-tagline">
              <T en="APIs, explained" zh="把 API 讲透" />
            </span>
          </span>
        </Link>

        <nav className="side-nav" aria-label={L({ en: "Chapters", zh: "章节" })}>
          {CHAPTERS.map((c) => {
            const active = c.id === current?.id;
            const state = ready ? chapterState(c.id) : "new";
            return (
              <Link
                key={c.id}
                href={c.href}
                className={`side-link${active ? " active" : ""}`}
                style={{ "--ch-hue": c.hue } as React.CSSProperties}
                aria-current={active ? "page" : undefined}
                onClick={close}
                // 默认的视口预取会在每次加载后把其余 11 章全部取一遍(约 350 KB JS,
                // 手机上也一样,因为关着的抽屉也算「可见」);改为读者指向某一章时再取。
                prefetch={false}
                onMouseEnter={() => router.prefetch(c.href)}
                onFocus={() => router.prefetch(c.href)}
              >
                <span className="side-num" aria-hidden>
                  {c.num}
                </span>
                <span className="side-title">
                  {L(c.title)}
                  <span className="side-en">{L(c.en)}</span>
                </span>
                <span
                  className={`side-state ${state}`}
                  aria-label={L(
                    state === "done"
                      ? { en: "Completed", zh: "已完成" }
                      : state === "doing"
                        ? { en: "In progress", zh: "进行中" }
                        : { en: "Not started", zh: "未开始" },
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="side-status">
          <div>
            <T
              en={
                <>
                  <b>{totalLabs}</b> {totalLabs === 1 ? "lab" : "labs"} done ·{" "}
                  <b>{quizCount}</b> {quizCount === 1 ? "quiz" : "quizzes"} ·{" "}
                  <b>{doneCh}</b>/{CHAPTERS.length} chapters complete
                </>
              }
              zh={
                <>
                  完成 <b>{totalLabs}</b> 个动手任务 · <b>{quizCount}</b> 个测验 · 通关{" "}
                  <b>{doneCh}</b>/{CHAPTERS.length} 章
                </>
              }
            />
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={L({ en: "Course progress", zh: "全书进度" })}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>

      <div
        className={`scrim${sidebarOpen ? " open" : ""}`}
        aria-hidden
        onClick={dismiss}
      />
    </>
  );
}
