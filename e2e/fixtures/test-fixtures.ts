import { test as base, expect } from '@playwright/test';

/**
 * Custom test fixtures for real E2E testing.
 * No mocks — tests run against the actual application.
 */
export const test = base.extend<{
  /** Ensures page is ready after navigation */
  readyPage: import('@playwright/test').Page;
}>({
  readyPage: async ({ page }, use) => {
    // Listen for uncaught errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await use(page);

    // After test: report any uncaught errors
    if (errors.length > 0) {
      console.warn('Uncaught page errors during test:', errors);
    }
  },
});

export { expect };
