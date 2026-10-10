import { mkdirSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Keep browser profiles and traces inside the worktree (or an explicit scratch
// directory), including on machines whose default temp directory is off limits.
const tempDir = process.env.TMPDIR || path.resolve(".cache/playwright");
mkdirSync(tempDir, { recursive: true });
process.env.TMPDIR = tempDir;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: "list",
  outputDir: "./test-results",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    serviceWorkers: "block",
  },
  projects: [{
    name: "chromium",
    use: { ...devices["Desktop Chrome"], channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  }],
  webServer: {
    command: "pnpm start --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    env: {
      TMPDIR: tempDir,
      NEXT_TELEMETRY_DISABLED: "1",
      BACKEND_URL: "",
      LUMINA_CONTROL_URL: "http://127.0.0.1:9",
      DATA_HUB_URL: "http://127.0.0.1:9",
      OPENROUTER_BASE_URL: "http://127.0.0.1:9",
      OPENROUTER_API_KEY: "",
      OPENAI_API_KEY: "",
      DATA_HUB_API_KEY: "",
    },
  },
});
