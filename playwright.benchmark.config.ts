import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/benchmark",
  outputDir: ".tmp-playwright-results",
  fullyParallel: false,
  reporter: "list",
  timeout: 120_000,
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium-benchmark",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.CI ? undefined : "chrome"
      }
    }
  ],
  webServer: {
    command: "npm run preview:test",
    url: "http://127.0.0.1:4321/",
    reuseExistingServer: true,
    timeout: 30_000
  }
});
