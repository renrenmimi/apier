"use client";

// 应用级 client providers。
//  - ThemeProvider:把 data-theme("dark" | "light")镜像到 <html>,localStorage 持久化。
//    首帧前由 <head> 里的内联脚本(themeScript)设好,不闪错主题。
//  - ShellProvider:工作台 UI 状态(移动端抽屉侧栏 / 桌面折叠 / ⌘K 面板)。

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type Theme = "dark" | "light";

const THEME_KEY = "apier-theme";
const SIDEBAR_KEY = "apier-sidebar";

// 首帧前执行:读回主题 + 侧栏折叠状态,避免闪烁。默认深色 + 展开。
export const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t="dark";}d.dataset.theme=t;}catch(e){d.dataset.theme="dark";}try{d.dataset.sidebar=localStorage.getItem("${SIDEBAR_KEY}")==="collapsed"?"collapsed":"expanded";}catch(e){d.dataset.sidebar="expanded";}})();`;

type ThemeCtx = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggleTheme: () => {},
});

// <html data-theme> 是唯一数据源:首屏由 themeScript 写好,React 读回来。
// useSyncExternalStore 允许服务端快照与客户端快照不同,所以不用在 effect
// 里补一次 setState 才追上真实主题 —— 那会让首屏白白多渲染一轮。
const themeListeners = new Set<() => void>();

function subscribeTheme(onChange: () => void) {
  themeListeners.add(onChange);
  return () => {
    themeListeners.delete(onChange);
  };
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function themeOnServer(): Theme {
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, themeOnServer);

  const toggleTheme = useCallback(() => {
    const d = document.documentElement;
    const next: Theme = d.dataset.theme === "light" ? "dark" : "light";
    d.dataset.theme = next;
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
    themeListeners.forEach((notify) => notify());
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// ---------- Shell UI 状态 ----------

type ShellCtx = {
  sidebarOpen: boolean; // 移动端抽屉(≤960px 遮罩滑入)
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  sidebarCollapsed: boolean; // 桌面端折叠
  toggleSidebarCollapsed: () => void;
  cmdkOpen: boolean;
  setCmdkOpen: Dispatch<SetStateAction<boolean>>;
};

const ShellContext = createContext<ShellCtx>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  sidebarCollapsed: false,
  toggleSidebarCollapsed: () => {},
  cmdkOpen: false,
  setCmdkOpen: () => {},
});

// 侧栏折叠同样以 <html data-sidebar> 为准,理由与主题相同。
const sidebarListeners = new Set<() => void>();

function subscribeSidebar(onChange: () => void) {
  sidebarListeners.add(onChange);
  return () => {
    sidebarListeners.delete(onChange);
  };
}

function readSidebarCollapsed(): boolean {
  return document.documentElement.dataset.sidebar === "collapsed";
}

function sidebarOnServer(): boolean {
  return false;
}

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebar,
    readSidebarCollapsed,
    sidebarOnServer,
  );

  const toggleSidebarCollapsed = useCallback(() => {
    const d = document.documentElement;
    const next = d.dataset.sidebar !== "collapsed";
    d.dataset.sidebar = next ? "collapsed" : "expanded";
    try {
      window.localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
    } catch {
      /* ignore */
    }
    sidebarListeners.forEach((notify) => notify());
  }, []);

  return (
    <ShellContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        toggleSidebarCollapsed,
        cmdkOpen,
        setCmdkOpen,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export const useShell = () => useContext(ShellContext);
