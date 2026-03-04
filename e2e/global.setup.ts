import { test as setup, expect } from '@playwright/test';

/**
 * Global setup: Perform real login and save browser state.
 * Requires the backend + frontend to be running.
 *
 * Set E2E_EMAIL and E2E_PASSWORD env vars, or use defaults.
 */
const E2E_EMAIL = process.env.E2E_EMAIL || 'sanjeev@postengage.ai';
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'TestPassword123!';

setup('authenticate', async ({ page }) => {
  // Navigate to login
  await page.goto('/login');

  // Fill login form
  await page.getByPlaceholder(/email/i).fill(E2E_EMAIL);
  await page.getByPlaceholder(/password/i).fill(E2E_PASSWORD);

  // Submit
  await page.getByRole('button', { name: /sign in|log in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 30_000 });
  await expect(page).toHaveURL(/dashboard/);

  // Save signed-in state
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
