"use client";

// 章节页通用原语:
//  - Reveal:滚动进入视口时淡入上移(IntersectionObserver)。
//  - Hero:章节开场(眉题 / 渐变大标题 / 本质一句话 / 巨型编号水印 / 段落跳转 chips)。
//  - Section:编号章节段(§01 · 标题 + 描述 + 右侧徽章),自带 Reveal。
//  - Callout:提示框(idea/warn/deep/story/win 五种语气)。
//  - Method:HTTP 方法徽章。 Status:状态码徽章。 —— API 课的两枚「本站货币」。
//  - KeyPoints:章末要点卡。 ChapterFooter:上一章/下一章。

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { CHAPTERS, prevNext, type ChapterId } from "@/lib/curriculum";

/* ---------- Reveal ---------- */

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${inView ? " in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ---------- Hero ---------- */

export interface HeroChip {
  id: string;
  label: ReactNode;
  n: string;
}

export function Hero({
  ch,
  title,
  essence,
  chips,
  children,
}: {
  ch: ChapterId;
  /** 渐变标题,例如 <>REST 的思想 <span className="grad">REST</span></> */
  title: ReactNode;
  essence: ReactNode;
  chips?: HeroChip[];
  /** hero 右侧/下方的自定义视觉(每章专属动画) */
  children?: ReactNode;
}) {
  const meta = CHAPTERS.find((c) => c.id === ch)!;
  return (
    <header className="hero">
      <div className="hero-watermark" aria-hidden>
        {meta.num}
      </div>
      <div className="hero-eyebrow">
        CHAPTER {meta.num} · {meta.en}
      </div>
      <h1 className="hero-title">{title}</h1>
      <p className="hero-essence">{essence}</p>
      {children}
      {chips && chips.length > 0 && (
        <nav className="hero-nav">
          {chips.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="hero-chip">
              <span className="n">§{c.n}</span>
              {c.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ---------- Section ---------- */

export function Section({
  id,
  index,
  title,
  desc,
  badge,
  children,
}: {
  id?: string;
  index: string;
  title: ReactNode;
  desc?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section className="sec" id={id}>
        <div className="sec-head">
          <span className="sec-index">§{index}</span>
          <h2 className="sec-title">{title}</h2>
          {badge && <span className="sec-badge">{badge}</span>}
        </div>
        {desc && <p className="sec-desc">{desc}</p>}
        {children}
      </section>
    </Reveal>
  );
}

/* ---------- Callout ---------- */

const TONE_ICO: Record<string, string> = {
  idea: "💡",
  warn: "⚠️",
  deep: "🔬",
  story: "📖",
  win: "🏆",
};

export function Callout({
  tone = "idea",
  ico,
  title,
  children,
}: {
  tone?: "idea" | "warn" | "deep" | "story" | "win";
  ico?: string;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="callout" data-tone={tone}>
      <span className="ico" aria-hidden>
        {ico ?? TONE_ICO[tone]}
      </span>
      <div>
        {title && (
          <p>
            <b>{title}</b>
          </p>
        )}
        {typeof children === "string" ? <p>{children}</p> : children}
      </div>
    </div>
  );
}

/* ---------- Method / Status 徽章 ---------- */

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

/** HTTP 方法徽章,按方法着色(样式在 globals.css 的 .method) */
export function Method({ m }: { m: HttpMethod }) {
  return (
    <span className="method" data-m={m}>
      {m}
    </span>
  );
}

/** 状态码徽章,按首位数字着色(样式在 globals.css 的 .status) */
export function Status({ code, text }: { code: number; text?: string }) {
  return (
    <span className="status" data-x={Math.floor(code / 100)}>
      {code}
      {text ? ` ${text}` : ""}
    </span>
  );
}

/* ---------- KeyPoints ---------- */

export function KeyPoints({
  title = "这一章,真正要带走的",
  points,
}: {
  title?: ReactNode;
  points: ReactNode[];
}) {
  return (
    <Reveal>
      <div className="kp">
        <div className="kp-title">
          <span aria-hidden>✦</span>
          {title}
        </div>
        <ul>
          {points.map((p, i) => (
            <li key={i}>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/* ---------- ChapterFooter ---------- */

export function ChapterFooter({ ch }: { ch: ChapterId }) {
  const { prev, next } = prevNext(ch);
  return (
    <nav className="ch-footer" aria-label="章节导航">
      {prev ? (
        <Link
          href={prev.href}
          className="ch-footer-link"
          style={{ "--ch-hue": prev.hue } as CSSProperties}
        >
          <span className="lab">← 上一章</span>
          <span className="name">
            <span className="n">{prev.num}</span>
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="ch-footer-link next"
          style={{ "--ch-hue": next.hue } as CSSProperties}
        >
          <span className="lab">下一章 →</span>
          <span className="name">
            <span className="n">{next.num}</span>
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
