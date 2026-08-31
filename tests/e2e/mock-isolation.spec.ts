import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// These run in real Chromium because the whole point of the change is that a
// Service Worker plus IndexedDB keep one visitor's mock data away from another's,
// and neither can be simulated honestly.

const CHAPTER = "/http";
const READY_BADGE = '.insp-badge[data-phase="ready"]';

/** Waits until the worker has proven it controls /mock-api. */
async function waitForMock(page: Page) {
  await page.locator(READY_BADGE).first().waitFor({ state: "visible", timeout: 30_000 });
}

/** Reads a post straight from the page's own mock, bypassing the UI. */
async function readPost(page: Page, id: number) {
  return page.evaluate(async (postId) => {
    const res = await fetch(`/mock-api/posts/${postId}`);
    return { status: res.status, scope: res.headers.get("x-mock-scope"), body: await res.json() };
  }, id);
}

/** Mutates a post through the visitor's own mock. */
async function putTitle(page: Page, id: number, title: string) {
  return page.evaluate(
    async ({ postId, newTitle }) => {
      const res = await fetch(`/mock-api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer apier-demo-token",
        },
        body: JSON.stringify({ title: newTitle }),
      });
      return { status: res.status, body: await res.json() };
    },
    { postId: id, newTitle: title },
  );
}

async function openChapter(context: BrowserContext) {
  const page = await context.newPage();
  await page.goto(CHAPTER);
  await waitForMock(page);
  return page;
}

test("the worker answers /mock-api, not the server", async ({ page }) => {
  await page.goto(CHAPTER);
  await waitForMock(page);

  const res = await readPost(page, 42);
  expect(res.status).toBe(200);
  // Only the worker sets this; a network fall-through could not.
  expect(res.scope).toBe("browser-local");
  expect(res.body.id).toBe(42);
});

test("two visitors cannot see each other's mutations", async ({ browser }) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await openChapter(alice);
  const bobPage = await openChapter(bob);

  await putTitle(alicePage, 7, "ALICE WAS HERE");

  const aliceSees = await readPost(alicePage, 7);
  const bobSees = await readPost(bobPage, 7);

  expect(aliceSees.body.title).toBe("ALICE WAS HERE");
  expect(bobSees.body.title).not.toBe("ALICE WAS HERE");
  // Alice's PUT also emptied body; Bob's copy must be untouched.
  expect(bobSees.body.body.length).toBeGreaterThan(0);

  await alice.close();
  await bob.close();
});

test("rate limit budgets are per visitor", async ({ browser }) => {
  const heavy = await browser.newContext();
  const light = await browser.newContext();
  const heavyPage = await openChapter(heavy);
  const lightPage = await openChapter(light);

  await heavyPage.evaluate(async () => {
    for (let i = 0; i < 12; i++) await fetch("/mock-api/posts/1");
  });

  const remaining = await lightPage.evaluate(async () => {
    const res = await fetch("/mock-api/posts/1");
    return Number(res.headers.get("x-ratelimit-remaining"));
  });

  // The light visitor has spent only a handful of requests of their own.
  expect(remaining).toBeGreaterThan(50);

  await heavy.close();
  await light.close();
});

test("state survives a refresh in the same browser", async ({ page }) => {
  await page.goto(CHAPTER);
  await waitForMock(page);

  await putTitle(page, 12, "STILL HERE AFTER RELOAD");

  await page.reload();
  await waitForMock(page);

  const after = await readPost(page, 12);
  expect(after.body.title).toBe("STILL HERE AFTER RELOAD");
});

test("reset restores the seed for this visitor only", async ({ browser }) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await openChapter(alice);
  const bobPage = await openChapter(bob);

  await putTitle(alicePage, 5, "ALICE EDIT");
  await putTitle(bobPage, 5, "BOB EDIT");

  await alicePage.evaluate(() => fetch("/mock-api/reset", { method: "POST" }));

  const aliceAfter = await readPost(alicePage, 5);
  const bobAfter = await readPost(bobPage, 5);

  expect(aliceAfter.body.title).not.toBe("ALICE EDIT");
  expect(aliceAfter.body.body.length).toBeGreaterThan(0);
  // Bob is unaffected by Alice resetting.
  expect(bobAfter.body.title).toBe("BOB EDIT");

  await alice.close();
  await bob.close();
});

test("reset is deterministic: identical data in two fresh visitors", async ({ browser }) => {
  const one = await browser.newContext();
  const two = await browser.newContext();
  const p1 = await openChapter(one);
  const p2 = await openChapter(two);

  await putTitle(p1, 20, "scribble");
  await p1.evaluate(() => fetch("/mock-api/reset", { method: "POST" }));

  const fingerprint = async (page: Page) =>
    page.evaluate(async () => {
      const res = await fetch("/mock-api/posts?per_page=50");
      const body = await res.json();
      return JSON.stringify(body.data);
    });

  expect(await fingerprint(p1)).toBe(await fingerprint(p2));

  await one.close();
  await two.close();
});

test("GraphQL and REST share the visitor's dataset", async ({ page }) => {
  await page.goto(CHAPTER);
  await waitForMock(page);

  await page.evaluate(async () => {
    await fetch("/mock-api/posts/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer apier-demo-token" },
      body: JSON.stringify({ title: "changed via REST" }),
    });
  });

  const viaGraphql = await page.evaluate(async () => {
    const res = await fetch("/mock-api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ post(id: 1) { title } }" }),
    });
    return res.json();
  });

  expect(viaGraphql.data.post.title).toBe("changed via REST");
});

test("the N+1 counter drops when the loader is enabled", async ({ page }) => {
  await page.goto(CHAPTER);
  await waitForMock(page);

  const counts = await page.evaluate(async () => {
    const query = JSON.stringify({ query: "{ posts(limit: 10) { title author { name } } }" });
    const headers = { "Content-Type": "application/json" };
    const naive = await fetch("/mock-api/graphql", { method: "POST", headers, body: query });
    const batched = await fetch("/mock-api/graphql?dataloader=1", { method: "POST", headers, body: query });
    return {
      naive: Number(naive.headers.get("x-resolver-calls")),
      batched: Number(batched.headers.get("x-resolver-calls")),
    };
  });

  expect(counts.naive).toBe(11);
  expect(counts.batched).toBe(2);
});
