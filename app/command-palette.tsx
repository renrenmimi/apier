"use client";

// ⌘K 命令面板:模糊搜索章节(标题 / 英文名 / 标签),回车跳转。
// 全局键盘监听挂在这里;Esc 关闭,↑↓ 选择。

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CHAPTERS } from "@/lib/curriculum";
import { useShell } from "./theme-provider";

export default function CommandPalette() {
  const { cmdkOpen, setCmdkOpen } = useShell();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  useEffect(() => {
    if (cmdkOpen) {
      setQuery("");
      setSel(0);
      // 等 overlay 渲染完再聚焦
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [cmdkOpen]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHAPTERS;
    return CHAPTERS.filter((c) =>
      [c.title, c.en, c.num, ...c.tags].some((s) =>
        s.toLowerCase().includes(q),
      ),
    );
  }, [query]);

  if (!cmdkOpen) return null;

  const go = (href: string) => {
    setCmdkOpen(false);
    router.push(href);
  };

  return (
    <div
      className="cmdk-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setCmdkOpen(false);
      }}
    >
      <div className="cmdk" role="dialog" aria-label="快速跳转">
        <input
          ref={inputRef}
          className="cmdk-input"
          placeholder="搜索章节、概念、标签…"
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
        <div className="cmdk-list">
          {hits.length === 0 && (
            <div className="cmdk-empty">没有匹配的章节 —— 换个关键词?</div>
          )}
          {hits.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`cmdk-item${i === sel ? " sel" : ""}`}
              style={{ "--ch-hue": c.hue } as React.CSSProperties}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(c.href)}
            >
              <span className="side-num">{c.num}</span>
              <span style={{ flex: 1 }}>
                {c.title}
                <span className="side-en">{c.en}</span>
              </span>
              <span className="dim" style={{ fontSize: 11 }}>
                {c.tags.slice(0, 2).join(" · ")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
