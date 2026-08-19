"use client";

// 顶部工具条:侧栏开关 + 面包屑 + ⌘K + 语言切换 + 主题切换。

import { usePathname } from "next/navigation";
import { chapterByPath } from "@/lib/curriculum";
import { useL, useLang, T } from "@/lib/i18n";
import { useShell, useTheme } from "./theme-provider";

export default function Toolbar() {
  const path = usePathname();
  const ch = chapterByPath(path);
  const L = useL();
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { setSidebarOpen, toggleSidebarCollapsed, setCmdkOpen } = useShell();

  return (
    <header className="toolbar">
      <button
        type="button"
        className="tb-btn"
        aria-label={L({ en: "Toggle sidebar", zh: "切换侧栏" })}
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
          {L(ch.title)}
        </b>
      </div>

      <button
        type="button"
        className="tb-btn"
        onClick={() => setCmdkOpen(true)}
        aria-label={L({ en: "Open the command palette", zh: "打开命令面板" })}
      >
        <T en="Jump to" zh="跳转" /> <span className="tb-kbd">⌘K</span>
      </button>

      <div
        className="seg"
        role="group"
        aria-label={L({ en: "Language", zh: "语言" })}
      >
        <button
          type="button"
          className={`seg-btn${lang === "en" ? " on" : ""}`}
          aria-pressed={lang === "en"}
          onClick={() => setLang("en")}
        >
          EN
        </button>
        <button
          type="button"
          className={`seg-btn${lang === "zh" ? " on" : ""}`}
          aria-pressed={lang === "zh"}
          onClick={() => setLang("zh")}
        >
          中文
        </button>
      </div>

      <button
        type="button"
        className="tb-btn"
        onClick={toggleTheme}
        aria-label={L({ en: "Toggle theme", zh: "切换主题" })}
      >
        {theme === "dark" ? "☾" : "☀"}
      </button>
    </header>
  );
}
