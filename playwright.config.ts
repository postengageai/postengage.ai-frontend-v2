import { defineConfig, devices } from '@playwright/test';

/**
 * PostEngage.ai E2E Test Configuration
 * Real integration tests — no API mocking.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list'], ['github']],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    // Auth setup — logs in and saves storage state
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    // Auth tests run WITHOUT saved state (test login/signup flows)
    {
      name: 'auth',
      testMatch: /auth\/.+\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // All other tests run WITH saved auth state
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\/.+\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
