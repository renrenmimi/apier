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
    default: "APIer — HTTP, REST and GraphQL explained",
    template: "%s · APIer",
  },
  description:
    "An interactive course that starts at \"what is an API\" and covers HTTP, fetch, the six REST constraints, RESTful design, authentication, and the GraphQL type system and performance. Available in English and Chinese.",
};

export const viewport: Viewport = {
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body>
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
