import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./fonts/noto-sans-sc.css";
import "./globals.css";
import {
  ThemeProvider,
  ShellProvider,
  themeScript,
} from "@/app/theme-provider";
import { ProgressProvider } from "@/lib/progress";
import { MockApiProvider } from "@/lib/mock/client";
import { LangProvider, langScript } from "@/lib/i18n";
import { SITE_TITLE } from "@/lib/curriculum";
import Sidebar from "@/app/sidebar";
import Toolbar from "@/app/toolbar";
import CommandPalette from "@/app/command-palette";

// 三套字体:Syne(超大展示字,几何感强)、Space Grotesk(界面/标题)、
// JetBrains Mono(代码/数字),都是 Google Fonts latin 子集的可变字体。
// 中文正文用系统字体(PingFang SC / 苹方等);中文标题另加 Noto Sans SC
// (上面以 @font-face 引入,按 unicode-range 分片),给 900 字重的冲击力
// ——系统 PingFang 最粗仅 600。字体栈在 globals.css 里拼接。
// 全部字体都从 app/fonts 自托管,构建时不再下载字体(见 app/fonts/README.md)。
const syne = localFont({
  src: "./fonts/syne-latin.woff2",
  weight: "600 800",
  variable: "--font-syne",
  display: "swap",
});
const grotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  weight: "400 700",
  variable: "--font-grotesk",
  display: "swap",
});
const jetbrains = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "400 700",
  variable: "--font-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE.en,
    template: "%s · APIer",
  },
  description:
    "An interactive course that starts at \"what is an API\" and covers HTTP, fetch, the six REST constraints, RESTful design, authentication, and the GraphQL type system and performance. Available in English and Chinese.",
};

export const viewport: Viewport = {
  // 深色主题的地址栏颜色(与 theme-provider.tsx 的 THEME_COLOR.dark 一致);
  // 浅色主题由 themeScript 与 ThemeProvider 改写成 THEME_COLOR.light。
  themeColor: "#07080f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${grotesk.variable} ${jetbrains.variable}`}
    >
      <body>
        {/* 这两段脚本在首次绘制之前运行。它们放在 <body> 的最前面,而不是 <head> 里:
            React 还在逐个水合 <head> 里手写的节点时,webpack 运行时可能已经把加载完的
            chunk <script> 从 <head> 里移除,冷加载时水合因此偶尔失败(React #418),整个根节点
            改在客户端重新渲染,内联脚本写在 <html> 上的属性随之丢失。AlgoAlgo 与 DataData
            的外壳和这里相同,把脚本移出 <head> 之后这个故障就消失了。 */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
        <LangProvider>
          <ThemeProvider>
            <ShellProvider>
              <MockApiProvider>
              <ProgressProvider>
                <div className="aurora" aria-hidden>
                  <div className="aurora-a" />
                  <div className="aurora-b" />
                  <div className="aurora-grid" />
                </div>
                <div className="shell">
                  <Sidebar />
                  <div className="shell-main">
                    <Toolbar />
                    <div className="shell-content">{children}</div>
                  </div>
                </div>
                <CommandPalette />
              </ProgressProvider>
            </MockApiProvider>
            </ShellProvider>
          </ThemeProvider>
        </LangProvider>
      </body>
    </html>
  );
}
