import { test, expect } from "@playwright/test";

// Keyboard and screen-reader paths through the shared components: labs, the
// sidebar drawer, the command palette, the quiz and scrollable panes.

test("a lab can be marked done from the keyboard, and its row expands separately", async ({ page }) => {
  await page.goto("/http");
  const check = page.locator(".prob-check").first();
  await check.focus();
  await page.keyboard.press("Enter");
  await expect(check).toHaveAttribute("aria-checked", "true");
  const stored = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("apier-progress-v1") ?? "{}").labs ?? {}));
  expect(stored).toHaveLength(1);
  await page.keyboard.press("Space");
  await expect(check).toHaveAttribute("aria-checked", "false");

  const toggle = page.locator(".prob-toggle").first();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(`[id="${await toggle.getAttribute("aria-controls")}"]`)).toBeVisible();

  // The box stays 20 px, but a tap 5 px outside it still lands on the checkbox.
  const box = (await check.boundingBox())!;
  const hit = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest(".prob-check") !== null,
    { x: box.x - 5, y: box.y + box.height / 2 },
  );
  expect(hit).toBe(true);
});

test("the closed drawer is out of the tab order; open, it takes focus and Esc gives it back", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/http");
  const toggle = page.locator("#sidebar-toggle");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#sidebar a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#sidebar")).toHaveAttribute("inert", "");
  await expect(toggle).toBeFocused();
  await context.close();
});

test("the command palette keeps focus inside and returns it on close", async ({ page }) => {
  await page.goto("/http");
  const opener = page.getByRole("button", { name: /Open the command palette/ });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: /Jump to a chapter/ });
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  const input = dialog.getByRole("combobox");
  await expect(input).toBeFocused();
  for (let i = 0; i < 5; i++) await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", /cmdk-opt-/);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("answering keeps focus, the verdict is in a live region, and fill-in fields are named", async ({ page }) => {
  await page.goto("/http");
  const first = page.locator(".q-item").first();
  const option = first.locator(".q-opt").first();
  await option.focus();
  await page.keyboard.press("Enter");
  await expect(option).toBeFocused();
  await expect(option).toHaveAttribute("aria-disabled", "true");
  const live = await first.locator(".q-feedback").evaluate((el) => el.closest("[aria-live]")?.getAttribute("aria-live"));
  expect(live).toBe("polite");

  const fill = page.locator(".q-input").first();
  const question = await fill.evaluate((el) => {
    const id = el.getAttribute("aria-labelledby");
    return id ? document.getElementById(id)?.textContent?.trim() ?? "" : "";
  });
  expect(question.length).toBeGreaterThan(10);
});

test("a code pane that overflows can be focused and scrolled by keyboard", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/http");
  const panes = await page.locator(".codewin-body").evaluateAll((els) =>
    els.map((el) => ({
      overflows: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
      tabindex: el.getAttribute("tabindex"),
      role: el.getAttribute("role"),
      label: el.getAttribute("aria-label"),
    })),
  );
  expect(panes.some((p) => p.overflows)).toBe(true);
  for (const p of panes) {
    if (p.overflows) expect(p).toMatchObject({ tabindex: "0", role: "region", label: "Code" });
    else expect(p.tabindex).toBeNull();
  }
  await context.close();
});
