"use client";

// 让浏览器标签页的标题跟随读者的界面语言。
// 服务端按各路由的 metadata 渲染英文标题;metadata 水合时(晚于本组件的第一次 effect)
// 以及每次导航提交时,Next.js 都会再写一次 <title>。所以只要 <title> 的文字在底下被改动,
// 这里就把本地化的标题重新写回去。观察器放在 layout effect 里,离开页面的那次提交中
// 就会先断开,不会和下一页的标题互相覆盖;每个页面只渲染一个 PageTitle。

import { useLayoutEffect } from "react";
import { useLang, type Loc } from "@/lib/i18n";
import { CHAPTERS, SITE_TITLE, type ChapterId } from "@/lib/curriculum";

// 最近挂载的那个 PageTitle 才有权写入,两个同时挂载时不会来回覆盖。
let owner: symbol | null = null;

/** `page` 是页面自己的名字;序章传 null,用站点标题。 */
export function PageTitle({ page }: { page: Loc<string> | null }) {
  const { lang } = useLang();
  const text =
    page === null ? SITE_TITLE[lang] : `${typeof page === "string" ? page : page[lang]} · APIer`;

  useLayoutEffect(() => {
    const me = Symbol();
    owner = me;
    const apply = () => {
      if (owner === me && document.title !== text) document.title = text;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => {
      observer.disconnect();
      if (owner === me) owner = null;
    };
  }, [text]);

  return null;
}

export function ChapterTitle({ id }: { id: ChapterId }) {
  return <PageTitle page={CHAPTERS.find((c) => c.id === id)!.title} />;
}
