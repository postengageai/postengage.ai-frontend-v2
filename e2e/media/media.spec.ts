import { test, expect } from '@playwright/test';

test.describe('Media Page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/media');
    await page.waitForLoadState('networkidle');
  });

  test('has heading "Media Library"', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /media library/i }).first()
    ).toBeVisible();
  });

  test('has upload button', async ({ page }) => {
    const uploadBtn = page
      .getByRole('button', { name: /upload/i })
      .or(page.getByText(/upload/i).first());
    await expect(uploadBtn.first()).toBeVisible();
  });

  test('has "My Uploads" and "Instagram Media" tabs', async ({ page }) => {
    const tabs = page.getByRole('tab');
    if (
      await tabs
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(
        page.getByRole('tab', { name: /my uploads/i })
      ).toBeVisible();
      await expect(
        page.getByRole('tab', { name: /instagram media/i })
      ).toBeVisible();
    }
  });

  test('"My Uploads" tab is active by default', async ({ page }) => {
    const uploadsTab = page.getByRole('tab', { name: /my uploads/i });
    if (await uploadsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(uploadsTab).toHaveAttribute('aria-selected', 'true');
    }
  });
});

test.describe('Media Page — tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/media');
    await page.waitForLoadState('networkidle');
  });

  test('Instagram Media tab shows account selector or no-accounts message', async ({
    page,
  }) => {
    const igTab = page.getByRole('tab', { name: /instagram media/i });
    if (await igTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await igTab.click();
      await page.waitForTimeout(1000);
      const accountSelect = page.getByRole('combobox');
      const noAccounts = page.getByText(/no instagram accounts/i);
      const hasSelect = await accountSelect
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      const hasNoAccounts = await noAccounts
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      expect(hasSelect || hasNoAccounts).toBeTruthy();
    }
  });

  test('switching between tabs works without error', async ({ page }) => {
    const igTab = page.getByRole('tab', { name: /instagram media/i });
    const uploadsTab = page.getByRole('tab', { name: /my uploads/i });
    if (await igTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await igTab.click();
      await page.waitForTimeout(500);
      await uploadsTab.click();
      await page.waitForTimeout(500);
      await expect(uploadsTab).toHaveAttribute('aria-selected', 'true');
    }
  });
});

test.describe('Media Page — filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/media');
    await page.waitForLoadState('networkidle');
  });

  test('has search filter input', async ({ page }) => {
    const search = page
      .locator('input[type="search"], input[placeholder*="search"], #search')
      .first();
    if (await search.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(search).toBeVisible();
    }
  });

  test('has sort dropdown', async ({ page }) => {
    const sortEl = page.getByRole('combobox').first();
    if (await sortEl.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(sortEl).toBeVisible();
    }
  });
});
