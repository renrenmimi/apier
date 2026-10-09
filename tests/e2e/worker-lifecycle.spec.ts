import { test, expect } from "@playwright/test";

// How the page and the mock worker find each other. Chromium only: a hard
// reload is driven through the DevTools protocol, the same way Shift+Reload
// reaches the browser.

const READY_BADGE = '.insp-badge[data-phase="ready"]';

test("a first visit never sends the readiness probe to the network", async ({ page }) => {
  const fromNetwork: string[] = [];
  page.on("response", (res) => {
    if (res.url().includes("/mock-api/") && !res.fromServiceWorker()) {
      fromNetwork.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.goto("/http");
  await page.locator(READY_BADGE).first().waitFor({ state: "visible", timeout: 30_000 });

  // Before control is established a probe would reach the server and 404.
  expect(fromNetwork).toEqual([]);
});

test("a hard reload is taken over again instead of leaving the mock unavailable", async ({
  page,
  context,
}) => {
  await page.goto("/http");
  await page.locator(READY_BADGE).first().waitFor({ state: "visible", timeout: 30_000 });

  // Shift+Reload loads the page without a controller; the worker is already
  // active and will not see `activate` again.
  const cdp = await context.newCDPSession(page);
  await cdp.send("Page.reload", { ignoreCache: true });
  await page.waitForLoadState("domcontentloaded");

  await page.locator(READY_BADGE).first().waitFor({ state: "visible", timeout: 15_000 });
  const probe = await page.evaluate(async () => {
    const res = await fetch("/mock-api/__ready");
    return {
      controlled: navigator.serviceWorker.controller !== null,
      scope: res.headers.get("x-mock-scope"),
    };
  });
  expect(probe).toEqual({ controlled: true, scope: "browser-local" });
});
