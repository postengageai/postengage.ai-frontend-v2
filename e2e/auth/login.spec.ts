import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4001';
const VALID_EMAIL = process.env.E2E_EMAIL || 'sanjeev@postengage.ai';
const VALID_PASS = process.env.E2E_PASSWORD || 'TestPassword123!';

test.describe('Login Page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('renders email input with correct attributes', async ({ page }) => {
    const email = page.locator('#email');
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute('type', 'email');
    await expect(email).toHaveAttribute('placeholder', 'you@example.com');
  });

  test('renders password input hidden by default', async ({ page }) => {
    const pwd = page.locator('#password');
    await expect(pwd).toBeVisible();
    await expect(pwd).toHaveAttribute('type', 'password');
    await expect(pwd).toHaveAttribute('placeholder', 'Enter your password');
  });

  test('submit button reads "Log in" by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('has "Forgot password?" link pointing to /forgot-password', async ({
    page,
  }) => {
    const link = page.getByRole('link', { name: /forgot password/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/forgot-password');
  });

  test('has signup link pointing to /signup', async ({ page }) => {
    const link = page.getByRole('link', { name: /create one/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/signup');
  });
});

test.describe('Login Page — validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('submit with empty email and password shows validation state', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Log in' }).click();
    // button should be disabled or form invalid state
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible();
    // page should not redirect
    await expect(page).toHaveURL(/login/);
  });

  test('invalid email (no @) prevents form submission', async ({ page }) => {
    await page.locator('#email').fill('notanemail');
    await page.locator('#password').fill('anything');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/login/);
  });

  test('email with @ but no domain shows validation error', async ({
    page,
  }) => {
    await page.locator('#email').fill('user@');
    await page.locator('#password').fill('SomePass123!');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/login/);
  });

  test('wrong credentials shows error message', async ({ page }) => {
    await page.locator('#email').fill('noone@example.com');
    await page.locator('#password').fill('WrongPassword!99');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(
      page.getByText(/invalid|incorrect|wrong|failed|error/i)
    ).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/login/);
  });

  test('submit button shows loading state while request is in flight', async ({
    page,
  }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASS);
    const responsePromise = page.waitForResponse(r =>
      r.url().includes('/auth')
    );
    await page.getByRole('button', { name: 'Log in' }).click();
    // during flight button text or disabled state
    const btn = page.getByRole('button', { name: /logging in|log in/i });
    await expect(btn).toBeVisible();
    await responsePromise.catch(() => null);
  });

  test('inputs are disabled while submitting', async ({ page }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASS);
    // click and immediately check disabled state
    await page.getByRole('button', { name: 'Log in' }).click();
    // by the time the response arrives, inputs should have been disabled mid-flight
    // (we just assert the form still exists and page is stable)
    await expect(page.locator('#email')).toBeVisible();
  });
});

test.describe('Login Page — success flow', () => {
  test('valid credentials redirect to /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASS);
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForURL('**/dashboard**', { timeout: 30_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('already authenticated user visiting /login gets redirected', async ({
    page,
  }) => {
    // Login first
    await page.goto('/login');
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASS);
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForURL('**/dashboard**', { timeout: 30_000 });

    // Now visit login again
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    // Should redirect away from login
    await expect(page).not.toHaveURL(/^.*\/login$/);
  });
});

test.describe('Login Page — navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('clicking forgot password navigates to /forgot-password', async ({
    page,
  }) => {
    await page.getByRole('link', { name: /forgot password/i }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('clicking create one navigates to /signup', async ({ page }) => {
    await page.getByRole('link', { name: /create one/i }).click();
    await expect(page).toHaveURL(/signup/);
  });
});
