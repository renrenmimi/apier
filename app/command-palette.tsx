"use client";

// ⌘K 命令面板:模糊搜索章节(标题 / 英文名 / 标签),回车跳转。
// 全局键盘监听挂在这里;Esc 关闭,↑↓ 选择。
// 它是一个模态对话框,用 combobox 模式:焦点始终留在搜索框里(Tab 离不开对话框),
// 结果是 listbox,当前选项通过 aria-activedescendant 播报;背后的页面不滚动,
// 关闭后焦点回到打开它之前的位置。

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CHAPTERS, searchText } from "@/lib/curriculum";
import { useL, T } from "@/lib/i18n";
import { useShell } from "./theme-provider";

export default function CommandPalette() {
  const { cmdkOpen, setCmdkOpen } = useShell();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      } else if (e.key === "Escape") {
        setCmdkOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCmdkOpen]);

  // 关掉就卸载,打开就是一次全新挂载 —— 搜索词和选中项因此天然回到初始值,
  // 不用在 effect 里手工清一遍。
  if (!cmdkOpen) return null;
  return <Palette close={() => setCmdkOpen(false)} />;
}

function Palette({ close }: { close: () => void }) {
  const L = useL();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 挂载即聚焦。此时 overlay 已经在 DOM 里了,不必再等一帧。
  // 卸载(关闭)时把焦点还给打开面板之前的元素,并恢复页面滚动。
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      html.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  // 两种语言的标题/副标/标签一起进搜索池 —— 英文界面下输中文也能命中。
  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHAPTERS;
    return CHAPTERS.filter((c) => searchText(c).includes(q));
  }, [query]);

  const go = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <div
      className="cmdk-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="cmdk"
        role="dialog"
        aria-modal="true"
        aria-label={L({ en: "Jump to a chapter", zh: "快速跳转" })}
        onKeyDown={(e) => {
          // 焦点只待在搜索框里;Tab 不能离开对话框
          if (e.key === "Tab") {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          className="cmdk-input"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          aria-autocomplete="list"
          aria-activedescendant={hits[sel] ? `cmdk-opt-${hits[sel].id}` : undefined}
          aria-label={L({ en: "Search chapters", zh: "搜索章节" })}
          placeholder={L({
            en: "Search chapters, concepts, tags…",
            zh: "搜索章节、概念、标签…",
          })}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            } else if (e.key === "Enter" && hits[sel]) {
              go(hits[sel].href);
            }
          }}
        />
        <div
          className="cmdk-list"
          id="cmdk-list"
          role="listbox"
          aria-label={L({ en: "Chapters", zh: "章节" })}
        >
          {hits.length === 0 && (
            <div className="cmdk-empty">
              <T
                en="No chapter matches that. Try another keyword."
                zh="没有匹配的章节 —— 换个关键词?"
              />
            </div>
          )}
          {hits.map((c, i) => (
            <button
              key={c.id}
              id={`cmdk-opt-${c.id}`}
              type="button"
              role="option"
              aria-selected={i === sel}
              tabIndex={-1}
              className={`cmdk-item${i === sel ? " sel" : ""}`}
              style={{ "--ch-hue": c.hue } as React.CSSProperties}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(c.href)}
            >
              <span className="side-num">{c.num}</span>
              <span style={{ flex: 1 }}>
                {L(c.title)}
                <span className="side-en">{L(c.en)}</span>
              </span>
              <span className="dim" style={{ fontSize: 11 }}>
                {L(c.tags).slice(0, 2).join(" · ")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
