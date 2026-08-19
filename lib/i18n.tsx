"use client";

// 双语底座 —— 英文默认,中文可切。
//  - Loc<T>:一个值可以写成 { en, zh } 对,也可以写成单值(两种语言共用)。
//  - langScript:首帧前跑,把语言写到 <html data-lang>,避免闪错语言。
//  - LangProvider / useLang:当前语言 + 切换器(localStorage 持久化)。
//  - useL():把 Loc<T> 解析成当前语言的值,用于 props(string / ReactNode)。
//  - <T en={…} zh={…} />:JSX 里内联切换,可写在模块级常量里
//    (常量只是被「渲染」在 Provider 内,所以合法)。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  isValidElement,
  type ReactNode,
} from "react";

export type Lang = "en" | "zh";

/** A value that may be given per language. Plain values pass through unchanged. */
export type Loc<T> = T | { en: T; zh: T };

const KEY = "apier-lang";

/** Runs before first paint so the page never flashes the wrong language. */
export const langScript = `(function(){var d=document.documentElement;var l="en";try{var s=localStorage.getItem("${KEY}");if(s==="zh")l="zh";}catch(e){}d.dataset.lang=l;d.lang=l==="zh"?"zh-CN":"en";})();`;

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>("en");

  useEffect(() => {
    const d = document.documentElement.dataset.lang;
    if (d === "zh" || d === "en") set(d);
  }, []);

  const setLang = useCallback((l: Lang) => {
    set(l);
    const d = document.documentElement;
    d.dataset.lang = l;
    d.lang = l === "zh" ? "zh-CN" : "en";
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* private mode */
    }
  }, []);

  return (
    <LangContext.Provider
      value={useMemo(() => ({ lang, setLang }), [lang, setLang])}
    >
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

/** True for `{ en, zh }` pairs — never for React elements or arrays. */
function isPair<T>(v: Loc<T>): v is { en: T; zh: T } {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    !isValidElement(v) &&
    "en" in v &&
    "zh" in v
  );
}

/** Resolver hook: `const L = useL(); L(node)` picks the current language. */
export function useL() {
  const { lang } = useLang();
  return useCallback(<V,>(v: Loc<V>): V => (isPair(v) ? v[lang] : v), [lang]);
}

/** Inline switch usable anywhere in JSX, including module-level constants. */
export function T({ en, zh }: { en: ReactNode; zh: ReactNode }) {
  const { lang } = useLang();
  return <>{lang === "zh" ? zh : en}</>;
}
