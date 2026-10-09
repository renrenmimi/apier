import { test, expect, type Page } from "@playwright/test";

// One visitor's dataset runs through the whole course, so a write in one
// chapter must never break an experiment in a later one.

const READY_BADGE = '.insp-badge[data-phase="ready"]';

async function runPreset(page: Page, name: RegExp) {
  const inspector = page.locator(".insp", { has: page.getByRole("button", { name }) }).first();
  await inspector.getByRole("button", { name }).click();
  await inspector.locator(".insp-meta").waitFor({ state: "visible", timeout: 15_000 });
  return inspector.locator(".insp-pane");
}

test("the chapter 04 PUT leaves the chapter 10 N+1 experiment intact", async ({ page }) => {
  await page.goto("/rest-design");
  await page.locator(READY_BADGE).first().waitFor({ state: "visible", timeout: 30_000 });
  await runPreset(page, /1 · Look at post 7/);
  const put = await runPreset(page, /2 · PUT only the title/);
  await expect(put).toContainText('"body": ""');

  // No reset in between: the learner skipped step 3.
  await page.goto("/backstage");
  await page.locator(READY_BADGE).first().waitFor({ state: "visible", timeout: 30_000 });
  const naive = await runPreset(page, /10 posts \+ author \(no loader\)/);
  await expect(naive).toContainText('"dbCalls": 11');
  await expect(naive).not.toContainText('"errors"');
  const batched = await runPreset(page, /Same query, loader on/);
  await expect(batched).toContainText('"dbCalls": 2');
});
