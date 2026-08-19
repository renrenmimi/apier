import type { Metadata, Viewport } from "next";
import {
  Syne,
  Space_Grotesk,
  JetBrains_Mono,
  Noto_Sans_SC,
} from "next/font/google";
import "./globals.css";
import {
  ThemeProvider,
  ShellProvider,
  themeScript,
} from "@/app/theme-provider";
import { ProgressProvider } from "@/lib/progress";
import { LangProvider, langScript } from "@/lib/i18n";
import Sidebar from "@/app/sidebar";
import Toolbar from "@/app/toolbar";
import CommandPalette from "@/app/command-palette";

// 三套字体:Syne(超大展示字,几何感强)、Space Grotesk(界面/标题)、
// JetBrains Mono(代码/数字)。中文回落到 PingFang SC / 苹方,globals.css 里拼接。
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jb",
  display: "swap",
});
// 中文黑体:给标题 900 字重的冲击力(系统 PingFang 最粗仅 600)。
// CJK 字形按 unicode-range 分片,浏览器只下载页面用到的字。
const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sc",
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
      className={`${syne.variable} ${grotesk.variable} ${jetbrains.variable} ${notoSC.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body>
        <LangProvider>
          <ThemeProvider>
            <ShellProvider>
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
            </ShellProvider>
          </ThemeProvider>
        </LangProvider>
      </body>
    </html>
  );
}
