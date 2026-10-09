import { test, expect, type Page } from "@playwright/test";
import { CHAPTERS, SITE_TITLE } from "../../lib/curriculum";

// The shell around every chapter: titles, the 404 page, settings that must
// survive a client re-render, progress shared between tabs, and content that
// must not depend on JavaScript.

const en = (v: string | { en: string; zh: string }) => (typeof v === "string" ? v : v.en);
const zh = (v: string | { en: string; zh: string }) => (typeof v === "string" ? v : v.zh);

async function useChinese(page: Page) {
  await page.getByRole("button", { name: "中文", exact: true }).click();
}

test("every page has its own title, in the reader's language", async ({ page }) => {
  const titles: string[] = [];
  for (const c of CHAPTERS) {
    await page.goto(c.href);
    const expected = c.href === "/" ? SITE_TITLE.en : `${en(c.title)} · APIer`;
    await expect(page).toHaveTitle(expected);
    titles.push(await page.title());
  }
  expect(new Set(titles).size).toBe(CHAPTERS.length);

  const http = CHAPTERS.find((c) => c.id === "http")!;
  await page.goto("/http");
  await useChinese(page);
  await expect(page).toHaveTitle(`${zh(http.title)} · APIer`);
  // Navigating keeps the language: the next page's title is Chinese too.
  await page.goto("/");
  await expect(page).toHaveTitle(SITE_TITLE.zh);
});

test("an unknown path gets a bilingual 404 that highlights no chapter", async ({ page }) => {
  const res = await page.goto("/no-such-chapter");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("This page does not exist");
  await expect(page.locator(".tb-crumb")).toContainText("Page not found");
  await expect(page.locator(".side-link.active")).toHaveCount(0);
  await expect(page).toHaveTitle("Page not found · APIer");

  await useChinese(page);
  await expect(page.locator("h1")).toHaveText("这个页面不存在");
  await expect(page.locator(".tb-crumb")).toContainText("页面不存在");
  await expect(page).toHaveTitle("页面不存在 · APIer");
});

test("settings come back from storage when the pre-paint scripts did not run", async ({ page, context }) => {
  // Reproduces what a failed hydration leaves behind: <html> without the
  // attributes the inline scripts write. The providers must restore them.
  await context.addInitScript(() => {
    localStorage.setItem("apier-lang", "zh");
    localStorage.setItem("apier-theme", "light");
    localStorage.setItem("apier-sidebar", "collapsed");
  });
  await page.route("**/http", async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace(/<script>\(function\(\)\{var d=document\.documentElement;.*?<\/script>/g, "");
    await route.fulfill({ response: res, body });
  });
  await page.goto("/http");

  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-lang", "zh");
  await expect(html).toHaveAttribute("lang", "zh-CN");
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(html).toHaveAttribute("data-sidebar", "collapsed");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#f1f0f6");
  await expect(page.getByRole("button", { name: "中文", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("the pre-paint scripts run from <body>, and the address bar follows the theme", async ({ page }) => {
  await page.goto("/http");
  const inHead = await page.evaluate(() =>
    [...document.head.querySelectorAll("script:not([src])")].some((s) => s.textContent?.includes("dataset.theme")),
  );
  expect(inHead).toBe(false);

  const meta = page.locator('meta[name="theme-color"]');
  await expect(meta).toHaveAttribute("content", "#07080f");
  await page.getByRole("button", { name: /Toggle theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(meta).toHaveAttribute("content", "#f1f0f6");
});

test("two tabs never overwrite each other's progress", async ({ context }) => {
  const a = await context.newPage();
  const b = await context.newPage();
  await a.goto("/http");
  await b.goto("/rest");

  await a.locator(".prob-check").nth(0).click();
  await expect(a.locator(".side-status")).toContainText("1 lab done");
  await b.locator(".prob-check").nth(0).click();
  // Tab A hears about tab B's change without a reload.
  await expect(a.locator('.side-link[href="/rest"] .side-state')).toHaveAttribute("aria-label", "In progress");
  await a.locator(".prob-check").nth(1).click();

  const stored = await a.evaluate(() => JSON.parse(localStorage.getItem("apier-progress-v1") ?? "{}"));
  const labs = Object.keys(stored.labs ?? {});
  expect(labs.filter((k) => k.startsWith("http/"))).toHaveLength(2);
  expect(labs.filter((k) => k.startsWith("rest/"))).toHaveLength(1);
  await expect(a.locator(".side-status")).toContainText("3 labs done");
});

test("without JavaScript every section is visible", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/http");
  const hidden = await page.evaluate(
    () => [...document.querySelectorAll(".reveal")].filter((el) => getComputedStyle(el).opacity !== "1").length,
  );
  expect(await page.locator(".reveal").count()).toBeGreaterThan(0);
  expect(hidden).toBe(0);
  await context.close();
});
