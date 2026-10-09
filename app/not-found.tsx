// 课程之外的任何路径都显示这一页。根布局照常渲染侧栏和工具条(面包屑显示「页面不存在」),
// 页面列出全部章节,读者可以从这里继续。

import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/lib/i18n";
import { CHAPTERS, PAGE_NOT_FOUND } from "@/lib/curriculum";
import { PageTitle } from "@/app/page-title";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="page" data-ch="home">
      <PageTitle page={PAGE_NOT_FOUND.title} />
      <section className="hero">
        <div className="hero-eyebrow">404</div>
        <h1 className="hero-title">
          <T en="This page does not exist" zh="这个页面不存在" />
        </h1>
        <p className="hero-essence">
          <T
            en="The address may be mistyped, or the page may have moved. Pick a chapter to continue."
            zh="地址可能输错了,也可能页面已经移动。请选择一个章节继续学习。"
          />
        </p>
      </section>
      <section aria-labelledby="not-found-chapters">
        <h2 className="sec-title" id="not-found-chapters">
          <T en="All chapters" zh="全部章节" />
        </h2>
        <div className="grid-3" style={{ marginTop: 16 }}>
          {CHAPTERS.map((c) => (
            <Link key={c.id} href={c.href} className="card hoverable">
              <div className="card-kicker">{c.num}</div>
              <div className="card-title">
                {typeof c.title === "string" ? c.title : <T en={c.title.en} zh={c.title.zh} />}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
