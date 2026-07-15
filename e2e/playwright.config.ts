import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // All tests share a single CRA dev server + single backend instance (see
  // webServer below), so running workers in parallel just contends for the
  // same dev server and causes spurious page.goto timeouts under load rather
  // than speeding anything up. Keep this serial until the app is served by
  // something that can handle concurrent load (e.g. a production build).
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  globalSetup: require.resolve('./global-setup'),

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Only the frontend is auto-booted here. Backend + Postgres must already
  // be running and seeded — see README.md for the precondition.
  webServer: {
    command: 'npm start',
    cwd: '../frontend',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { BROWSER: 'none' },
  },
});
