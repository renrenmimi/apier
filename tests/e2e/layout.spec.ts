import { test, expect, type Page } from "@playwright/test";

// The page clips horizontal overflow (html, body { overflow-x: clip }), so
// anything wider than the screen is silently cut off rather than scrollable.
// And panels that stay dark in the light theme must not inherit the light
// theme's dark text colours.

async function clipped(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    for (const el of document.querySelectorAll("main *")) {
      const box = el.getBoundingClientRect();
      if (!box.width || box.right <= vw + 1) continue;
      const parent = el.parentElement;
      if (!parent || parent.getBoundingClientRect().right > vw + 1) continue;
      let contained = false;
      for (let a: HTMLElement | null = parent; a && a !== document.body; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX;
        if (ox === "auto" || ox === "scroll" || ((ox === "hidden" || ox === "clip") && a.getBoundingClientRect().right <= vw + 1)) {
          contained = true;
          break;
        }
      }
      if (!contained) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} "${el.textContent?.trim().slice(0, 30)}"`);
    }
    return out;
  });
}

test("nothing is cut off at 360 px", async ({ browser }) => {
  for (const lang of ["en", "zh"]) {
    const context = await browser.newContext({ viewport: { width: 360, height: 800 }, reducedMotion: "reduce" });
    await context.addInitScript((l) => localStorage.setItem("apier-lang", l), lang);
    const page = await context.newPage();
    for (const path of ["/http", "/rest", "/rest-design", "/operations", "/backstage"]) {
      await page.goto(path);
      // The Chinese text replaces the English server HTML at hydration, and the
      // tab title turns Chinese at the same moment: measure after that.
      if (lang === "zh") await page.waitForFunction(() => /[\u4e00-\u9fff]/.test(document.title));
      expect(await clipped(page), `${lang} ${path}`).toEqual([]);
    }
    await context.close();
  }
});

test("text in always-dark panels stays readable in the light theme", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  await context.addInitScript(() => localStorage.setItem("apier-theme", "light"));
  const page = await context.newPage();
  const cases: [string, string][] = [
    ["/http", ".codewin .tk-com"],
    ["/graphql", ".gq-of-line:not(.on)"],
    ["/rest-advanced", ".ra-url-meth"],
    ["/schema", ".sc-hero-seal"],
    ["/auth", ".au-b64-hdr"],
    ["/auth", ".au-jwt-seg"],
  ];
  for (const [path, selector] of cases) {
    await page.goto(path);
    const ratio = await page.locator(selector).first().evaluate((el) => {
      // Computed colours may be oklch(); a canvas converts any CSS colour to sRGB.
      const ctx = document.createElement("canvas").getContext("2d")!;
      const srgb = (css: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data];
      };
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      let bg: number[] | null = null;
      for (let a: Element | null = el; a && !bg; a = a.parentElement) {
        const c = srgb(getComputedStyle(a).backgroundColor);
        if (c[3] === 255) bg = c;
      }
      const fg = lum(srgb(getComputedStyle(el).color));
      const back = lum(bg ?? [255, 255, 255]);
      return (Math.max(fg, back) + 0.05) / (Math.min(fg, back) + 0.05);
    });
    expect(ratio, `${path} ${selector}`).toBeGreaterThanOrEqual(4.5);
  }
  await context.close();
});
