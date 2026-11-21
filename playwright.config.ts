import { defineConfig } from "@playwright/test";
import path from "node:path";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:3100",
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run db:migrate && npm run db:bootstrap && npm run dev -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_PATH: path.join(process.cwd(),"data","e2e.db"),
      AUTH_SECRET: "e2e-test-secret-not-for-production",
      ADMIN_EMAIL: "admin@example.test",
      ADMIN_PASSWORD: "test-password-12345",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
    },
  },
});
