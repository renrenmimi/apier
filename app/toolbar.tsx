"use client";

// 顶部工具条:侧栏开关 + 面包屑 + ⌘K + 主题切换。

import { usePathname } from "next/navigation";
import { chapterByPath } from "@/lib/curriculum";
import { useShell, useTheme } from "./theme-provider";

export default function Toolbar() {
  const path = usePathname();
  const ch = chapterByPath(path);
  const { theme, toggleTheme } = useTheme();
  const { setSidebarOpen, toggleSidebarCollapsed, setCmdkOpen } = useShell();

  return (
    <header className="toolbar">
      <button
        type="button"
        className="tb-btn"
        aria-label="切换侧栏"
        onClick={() => {
          if (window.innerWidth <= 960) setSidebarOpen((v) => !v);
          else toggleSidebarCollapsed();
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2 4h12M2 8h12M2 12h12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="tb-crumb">
        <span>APIer</span>
        <span className="sep">/</span>
        <b>
          {ch.num !== "✦" ? `${ch.num} · ` : ""}
          {ch.title}
        </b>
      </div>

      <button
        type="button"
        className="tb-btn"
        onClick={() => setCmdkOpen(true)}
        aria-label="打开命令面板"
      >
        跳转 <span className="tb-kbd">⌘K</span>
      </button>

      <button
        type="button"
        className="tb-btn"
        onClick={toggleTheme}
        aria-label="切换主题"
      >
        {theme === "dark" ? "☾" : "☀"}
      </button>
    </header>
  );
}
