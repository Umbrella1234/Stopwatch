import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "/tmp/opencode/playwright-results",
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173/Stopwatch/",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173/Stopwatch/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
