import { test, expect } from '@playwright/test';

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
  });

  test('renders email input with correct placeholder', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#email')).toHaveAttribute(
      'placeholder',
      'you@example.com'
    );
  });

  test('renders Send reset link button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /send reset link/i })
    ).toBeVisible();
  });

  test('has back to login link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /back.*login|sign in/i });
    await expect(backLink).toBeVisible();
  });

  test('submitting with invalid email stays on page', async ({ page }) => {
    await page.locator('#email').fill('notanemail');
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('submitting valid email shows success state', async ({ page }) => {
    await page.locator('#email').fill('sanjeev@postengage.ai');
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Success state: message about email sent
    await expect(
      page.getByText(
        /sent.*password.*reset|reset.*instructions|check.*spam|arrive.*within/i
      )
    ).toBeVisible({ timeout: 15_000 });
  });

  test('success state shows expire notice', async ({ page }) => {
    await page.locator('#email').fill('sanjeev@postengage.ai');
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByText(/expire.*1 hour|1 hour.*expire/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('clicking back to login navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: /back.*login|sign in/i }).click();
    await expect(page).toHaveURL(/login/);
  });
});
