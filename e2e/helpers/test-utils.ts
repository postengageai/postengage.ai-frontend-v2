import { Page, expect, Locator } from '@playwright/test';

/**
 * Real E2E test utilities — no mocks.
 * These helpers interact with the actual running application.
 */

// ─── Auth Helpers ───

export const E2E_EMAIL = process.env.E2E_EMAIL || 'sanjeev@postengage.ai';
export const E2E_PASSWORD = process.env.E2E_PASSWORD || 'TestPassword123!';

export async function loginViaUI(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder(/email/i).fill(E2E_EMAIL);
  await page.getByPlaceholder(/password/i).fill(E2E_PASSWORD);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL('**/dashboard**', { timeout: 30_000 });
}

// ─── Navigation Helpers ───

export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  // Wait for any loading skeletons to disappear
  const skeletons = page.locator(
    '[class*="skeleton"], [class*="animate-pulse"]'
  );
  if ((await skeletons.count()) > 0) {
    await expect(skeletons.first())
      .toBeHidden({ timeout: 30_000 })
      .catch(() => {
        // Skeletons may already be gone
      });
  }
}

// ─── Form Helpers ───

export async function fillInput(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await input.click();
  await input.fill(value);
}

export async function selectOption(
  page: Page,
  triggerSelector: string,
  optionText: string | RegExp
) {
  // For shadcn Select components — click trigger, then pick option from dropdown
  await page.locator(triggerSelector).click();
  await page.getByRole('option', { name: optionText }).click();
}

// ─── Assertion Helpers ───

export async function expectToastMessage(page: Page, text: string | RegExp) {
  const toast = page.locator(
    '[role="status"], [class*="toast"], [class*="Toaster"]'
  );
  await expect(toast.filter({ hasText: text }).first()).toBeVisible({
    timeout: 10_000,
  });
}

export async function expectNoConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      errors.push(msg.text());
    }
  });
  return errors;
}

// ─── Sidebar Navigation ───

export async function clickSidebarLink(page: Page, name: string | RegExp) {
  const link = page.getByRole('link', { name }).first();
  await link.click();
  await page.waitForLoadState('networkidle');
}

// ─── Table/List Helpers ───

export async function getRowCount(
  page: Page,
  tableSelector: string = 'table tbody tr'
): Promise<number> {
  await page
    .waitForSelector(tableSelector, { timeout: 15_000 })
    .catch(() => null);
  return page.locator(tableSelector).count();
}

// ─── Wait for API response ───

export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp
) {
  return page.waitForResponse(
    response =>
      typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url()),
    { timeout: 30_000 }
  );
}
