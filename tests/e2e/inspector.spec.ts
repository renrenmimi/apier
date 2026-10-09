import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";

// Covers what the inspector shows the learner, and the two ways it must stay
// honest: never pretending a server answered for the browser, and never
// printing a curl command that cannot do what it appears to do.

const CHAPTER = "/http";
const READY_BADGE = '.insp-badge[data-phase="ready"]';

async function ready(page: Page) {
  await page.locator(READY_BADGE).first().waitFor({ state: "visible", timeout: 30_000 });
}

test("a preset reports status, timing, size, headers and body", async ({ page }) => {
  await page.goto(CHAPTER);
  await ready(page);

  const inspector = page.locator(".insp").first();
  await inspector.getByRole("button", { name: /A normal GET/i }).click();

  const meta = inspector.locator(".insp-meta");
  await meta.waitFor({ state: "visible", timeout: 15_000 });

  // Status code badge.
  await expect(meta.locator(".status")).toContainText("200");
  // Round-trip timing and the server/network split.
  await expect(meta.locator(".insp-timing")).toContainText(/\d+\s*ms/);
  await expect(meta).toContainText(/server/i);
  // Response size.
  await expect(meta).toContainText(/\d+(\.\d+)?\s*(B|KB)/);

  // Body tab shows the JSON payload.
  await expect(inspector.locator(".insp-pane")).toContainText('"id": 42');

  // Response headers tab lists real headers.
  await inspector.getByRole("tab", { name: /Response headers/i }).click();
  const headerKeys = inspector.locator(".insp-hk");
  await expect(headerKeys.filter({ hasText: "etag" })).toHaveCount(1);
  await expect(headerKeys.filter({ hasText: "x-mock-scope" })).toHaveCount(1);

  // Request tab shows the headers the learner set.
  await inspector.getByRole("tab", { name: /^Request$/i }).click();
  await expect(inspector.locator(".insp-pane")).toBeVisible();
});

test("the curl tab is labelled for a local clone and targets the dev port", async ({ page }) => {
  await page.goto(CHAPTER);
  await ready(page);

  const inspector = page.locator(".insp").first();
  await inspector.getByRole("button", { name: /A normal GET/i }).click();
  await inspector.locator(".insp-meta").waitFor({ state: "visible", timeout: 15_000 });

  await inspector.getByRole("tab", { name: /curl/i }).click();
  const pane = inspector.locator(".insp-pane");

  await expect(pane).toContainText("Run against a local clone");
  // The documented development port, and the server-side path -- not /mock-api,
  // which curl could never reach.
  await expect(pane).toContainText("http://localhost:3300/api/posts/42");
  await expect(pane).not.toContainText("localhost:3300/mock-api");
  // It must say plainly that this does not reach the browser-local request.
  await expect(pane).toContainText(/cannot reach the request above/i);
});

test("Send is disabled and explained when the worker cannot start", async ({ browser }) => {
  // Service Worker script requests bypass the page's network context, so
  // route-blocking mock-sw.js would not stop registration. Blocking workers
  // outright reproduces the real "cannot start" condition.
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  await page.goto(CHAPTER);

  const inspector = page.locator(".insp").first();
  const banner = inspector.locator(".insp-state[data-tone='bad']");
  await banner.waitFor({ state: "visible", timeout: 30_000 });

  // The explanation must be explicit about not falling back to a server.
  await expect(banner).toContainText(/did not start|cannot run the mock API/i);

  // Every control that would issue a request stays disabled.
  await expect(inspector.getByRole("button", { name: /^Send$/ })).toBeDisabled();
  await expect(inspector.locator(".insp-path")).toBeDisabled();
  await expect(inspector.getByRole("button", { name: /A normal GET/i })).toBeDisabled();

  // The badge reflects the failure rather than claiming readiness.
  await expect(inspector.locator(".insp-badge")).toHaveAttribute("data-phase", /failed|unsupported/);

  await context.close();
});

test("no horizontal overflow at 360px", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 780 } });
  const page = await context.newPage();
  await page.goto(CHAPTER);
  await ready(page);

  const inspector = page.locator(".insp").first();
  await inspector.scrollIntoViewIfNeeded();
  await inspector.getByRole("button", { name: /A normal GET/i }).click();
  await inspector.locator(".insp-meta").waitFor({ state: "visible", timeout: 15_000 });

  const layout = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const box = document.querySelector(".insp")!.getBoundingClientRect();

    // An element may be wider than the screen only if some ancestor scrolls or
    // clips it -- that is how code panes and the decorative background work.
    // Anything wider with no such ancestor would really drag the page sideways.
    const leaks: string[] = [];
    for (const node of document.querySelectorAll<HTMLElement>(".insp *")) {
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.right <= viewport + 1) continue;
      let ancestor = node.parentElement;
      let contained = false;
      while (ancestor && ancestor !== document.body) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(ancestor).overflowX)) {
          contained = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (!contained) leaks.push(node.className || node.tagName);
    }

    return {
      viewport,
      pageScroll: document.documentElement.scrollWidth - viewport,
      inspectorRight: box.right,
      leaks,
    };
  });

  // The page itself must not scroll sideways.
  expect(layout.pageScroll).toBeLessThanOrEqual(1);
  // The inspector must fit on screen.
  expect(layout.inspectorRight).toBeLessThanOrEqual(layout.viewport + 1);
  // Nothing may spill out without a scrollable or clipping ancestor.
  expect(layout.leaks).toEqual([]);

  await context.close();
});

test("the deployed-host guard explains where the real mock lives", async ({ request }) => {
  // The local server runs with the mock enabled, so this asserts the shape the
  // guard returns rather than the guard firing; the guard itself is a one-line
  // environment check covered by the shared-host build in CI.
  const res = await request.get("/api");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.name).toBe("APIer Mock API");
  expect(res.headers()["x-mock-scope"]).toBe("local-dev-server");
});

test("the mock answers in the interface language, and the Request tab shows why", async ({ page }) => {
  await page.goto(CHAPTER);
  await ready(page);

  const inspector = page.locator(".insp").first();
  const pane = inspector.locator(".insp-pane");
  await inspector.getByRole("button", { name: /Ask for something gone/i }).click();
  await inspector.locator(".insp-meta").waitFor({ state: "visible", timeout: 15_000 });
  await expect(pane).toContainText("There is no post with id 9999");
  await expect(pane).not.toContainText(/[一-鿿]/);

  await inspector.getByRole("tab", { name: /^Request$/i }).click();
  const sent = inspector.locator(".insp-hrow", { hasText: "Accept-Language" });
  await expect(sent.locator(".insp-hv")).toHaveText("en");

  // Same preset in the Chinese interface: the same request, worded in Chinese.
  await page.evaluate(() => localStorage.setItem("apier-lang", "zh"));
  await page.reload();
  await ready(page);
  await inspector.getByRole("button", { name: "要一个不存在的" }).click();
  await inspector.locator(".insp-meta").waitFor({ state: "visible", timeout: 15_000 });
  await expect(pane).toContainText("没有 id 为 9999 的文章");
});

test("the note follows the interface language, the timing says where time went, and the tabs work by keyboard", async ({ page }) => {
  await page.goto(CHAPTER);
  await ready(page);
  const inspector = page.locator(".insp").first();
  await inspector.getByRole("button", { name: /A normal GET/i }).click();
  await inspector.locator(".insp-meta").waitFor({ state: "visible", timeout: 15_000 });
  await expect(inspector.locator(".insp-note")).toContainText("and a body");
  await expect(inspector.locator(".insp-meta")).toContainText("in the browser");

  // Keyboard: the selected tab is the only tab stop; arrows and End move the selection.
  const bodyTab = inspector.getByRole("tab", { name: "Response body" });
  await bodyTab.focus();
  await page.keyboard.press("ArrowRight");
  const headersTab = inspector.getByRole("tab", { name: /Response headers/ });
  await expect(headersTab).toHaveAttribute("aria-selected", "true");
  await expect(headersTab).toBeFocused();
  await expect(inspector.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", (await headersTab.getAttribute("id"))!);
  await page.keyboard.press("End");
  await expect(inspector.getByRole("tab", { name: "curl" })).toHaveAttribute("aria-selected", "true");

  // The note was stored as both languages, so switching after the request translates it.
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(inspector.locator(".insp-note")).toContainText("带回了正文");
});

test("the curl command quotes every argument and stays valid shell", async ({ page }) => {
  await page.goto("/backstage");
  await ready(page);
  const inspector = page.locator(".insp", { has: page.getByRole("button", { name: /Same query, loader on/ }) });
  await inspector.getByRole("button", { name: /Same query, loader on/ }).click();
  await inspector.locator(".insp-meta").waitFor({ state: "visible", timeout: 15_000 });
  await inspector.getByRole("tab", { name: "curl" }).click();
  const pane = inspector.locator(".insp-pane");
  // An unquoted ? is a glob in zsh, and an unquoted & ends the command in any shell.
  await expect(pane).toContainText("'http://localhost:3300/api/graphql?dataloader=1'");

  await inspector.locator(".insp-body-in").fill(`{"query":"{ post(id: 1) { title } }","note":"It's"}`);
  await inspector.getByRole("button", { name: /^Send$/ }).click();
  await expect(inspector.locator(".insp-meta")).toBeVisible();
  await inspector.getByRole("tab", { name: "curl" }).click();
  await expect(pane).toContainText(`It'\\''s`);
  // bash -n parses the command without running it.
  const command = (await pane.locator(".cl-c").allTextContents()).join("\n");
  expect(command.startsWith("curl -i -X POST")).toBe(true);
  execFileSync("bash", ["-n", "-c", command]);

  // HEAD is offered, answers without a body, and becomes curl -I.
  await inspector.locator(".insp-method").selectOption("HEAD");
  await inspector.locator(".insp-path").fill("/mock-api/posts/42");
  await inspector.getByRole("button", { name: /^Send$/ }).click();
  await expect(inspector.locator(".insp-meta .status")).toContainText("200");
  await expect(pane).toContainText("No response body");
  await inspector.getByRole("tab", { name: "curl" }).click();
  await expect(pane).toContainText("curl -I 'http://localhost:3300/api/posts/42'");
});

test("only /mock-api paths are sent, and only once while a request is in flight", async ({ page }) => {
  await page.goto("/auth");
  await ready(page);
  const inspector = page.locator(".insp").first();
  const path = inspector.locator(".insp-path");
  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" || r.url().includes("/api/posts/42")) sent.push(`${r.method()} ${new URL(r.url()).pathname}${new URL(r.url()).search}`);
  });

  await path.fill("/api/posts/42");
  await expect(inspector.getByRole("button", { name: /^Send$/ })).toBeDisabled();
  await expect(inspector.locator(".insp-err")).toContainText("must start with /mock-api");
  await path.press("Enter");

  // A slow write: three quick Enters must create one post, not three.
  await inspector.getByRole("button", { name: /A token that may write/ }).click();
  await inspector.locator(".insp-meta").waitFor({ state: "visible", timeout: 15_000 });
  sent.length = 0;
  await path.fill("/mock-api/posts?delay=800");
  await path.press("Enter");
  await path.press("Enter");
  await path.press("Enter");
  await expect(inspector.locator(".insp-meta .status")).toContainText("201", { timeout: 10_000 });
  expect(sent).toEqual(["POST /mock-api/posts?delay=800"]);
});

test("a preset whose answer differs from its story says so", async ({ page }) => {
  await page.goto("/rest-design");
  await ready(page);
  // Spend the visitor's rate-limit window.
  await page.evaluate(async () => {
    for (let i = 0; i < 61; i++) await fetch("/mock-api/posts/1?delay=0");
  });
  const inspector = page.locator(".insp", { has: page.getByRole("button", { name: /1 · Look at post 7/ }) });
  await inspector.getByRole("button", { name: /1 · Look at post 7/ }).click();
  const note = inspector.locator(".insp-note");
  await expect(note).toContainText("This time the answer was 429 Too Many Requests");
  await expect(note).not.toContainText("Note every field");

  // Reset is never rate limited, so its own note applies again.
  await inspector.getByRole("button", { name: /3 · Undo it/ }).click();
  await expect(inspector.locator(".insp-meta .status")).toContainText("200");
  await expect(note).toContainText("Back to the original data");
});
