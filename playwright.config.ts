import { defineConfig, devices } from "@playwright/test";

// Two projects share one runner: "unit" exercises the mock engine as plain
// TypeScript (no browser, fast), "e2e" drives real Chromium because Service
// Workers and IndexedDB cannot be faked meaningfully.
export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  projects: [
    { name: "unit", testDir: "tests/unit" },
    {
      name: "e2e",
      testDir: "tests/e2e",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3300" },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3300",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
