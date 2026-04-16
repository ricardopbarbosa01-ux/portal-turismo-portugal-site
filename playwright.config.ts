import { defineConfig, devices } from '@playwright/test';

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? 'https://portal-turismo-portugal-site.pages.dev';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // 1 retry locally catches transient network flakes (CDN, Supabase mock timing)
  retries: isCI ? 2 : 1,
  workers: isCI ? 1 : 3,
  reporter: 'html',
  // Default timeout — covers networkidle waits on slow CDN edge responses
  timeout: 35_000,

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Action/expect timeout — Firefox JS engine is slower than Chromium
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox needs more time for JS hydration and form interactions
        actionTimeout: 20_000,
        navigationTimeout: 40_000,
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
