// 服务端布局:给本章自己的 <title> 和 description(章节页本身是客户端组件,不能导出 metadata)。

import type { ReactNode } from "react";
import { chapterMetadata } from "@/lib/curriculum";
import { ChapterTitle } from "@/app/page-title";

export const metadata = chapterMetadata("rest-design");

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ChapterTitle id="rest-design" />
      {children}
    </>
  );
}
