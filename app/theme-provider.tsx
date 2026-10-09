"use client";

// 应用级 client providers。
//  - ThemeProvider:把 data-theme("dark" | "light")镜像到 <html>,localStorage 持久化。
//    首帧前由 <body> 最前面的内联脚本(themeScript)设好,不闪错主题。
//    如果 React 放弃水合、在客户端重新渲染根节点,内联脚本写在 <html> 上的属性会被丢掉;
//    所以属性缺失时改从 localStorage 读,并在挂载后把属性写回去。
//  - ShellProvider:工作台 UI 状态(移动端抽屉侧栏 / 桌面折叠 / ⌘K 面板)。

import {
  createContext,
  useContext,
  useEffect,
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

// 手机浏览器地址栏的颜色(<meta name="theme-color">),按主题区分。
// 深色与 app/layout.tsx 的 viewport.themeColor 一致,浅色是浅色主题的 --bg。
export const THEME_COLOR: Record<Theme, string> = { dark: "#07080f", light: "#f1f0f6" };

/** 存储里的设置;没有,或者存储被禁用时,返回 null。 */
function stored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[t]);
}

// 首帧前执行:读回主题 + 侧栏折叠状态,避免闪烁,并给手机地址栏配上对应颜色。默认深色 + 展开。
export const themeScript = `(function(){var d=document.documentElement;var t="dark";try{if(localStorage.getItem("${THEME_KEY}")==="light"){t="light";}}catch(e){}d.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",t==="light"?"${THEME_COLOR.light}":"${THEME_COLOR.dark}");}try{d.dataset.sidebar=localStorage.getItem("${SIDEBAR_KEY}")==="collapsed"?"collapsed":"expanded";}catch(e){d.dataset.sidebar="expanded";}})();`;

type ThemeCtx = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggleTheme: () => {},
});

// <html data-theme> 是数据源(缺失时回退到 localStorage):首屏由 themeScript 写好,React 读回来。
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
  const v = document.documentElement.dataset.theme;
  if (v === "light" || v === "dark") return v;
  // 属性不在了(客户端重建根节点时被丢掉):回到存储里读。
  return stored(THEME_KEY) === "light" ? "light" : "dark";
}

function themeOnServer(): Theme {
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, themeOnServer);

  // 挂载后把主题写回 <html> 和地址栏颜色:根节点在客户端重建之后,CSS 才拿得到 data-theme。
  // 写入的是 readTheme() 而不是 theme:水合那一轮 theme 还是服务端快照("dark"),
  // 拿它写回会盖掉 themeScript 已经写好的真实主题。
  useEffect(() => {
    applyTheme(readTheme());
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === "light" ? "dark" : "light";
    applyTheme(next);
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
  const v = document.documentElement.dataset.sidebar;
  if (v === "collapsed" || v === "expanded") return v === "collapsed";
  return stored(SIDEBAR_KEY) === "collapsed";
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

  // 与主题相同:挂载后把折叠状态写回 <html data-sidebar>(同样不用服务端快照)。
  useEffect(() => {
    document.documentElement.dataset.sidebar = readSidebarCollapsed() ? "collapsed" : "expanded";
  }, [sidebarCollapsed]);

  const toggleSidebarCollapsed = useCallback(() => {
    const next = !readSidebarCollapsed();
    document.documentElement.dataset.sidebar = next ? "collapsed" : "expanded";
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
