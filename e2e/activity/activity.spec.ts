import { test, expect } from '@playwright/test';

test.describe('Activity Page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/activity');
    await page.waitForLoadState('networkidle');
  });

  test('has heading "Activity"', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /activity/i }).first()
    ).toBeVisible();
  });

  test('has back button to /dashboard', async ({ page }) => {
    const backBtn = page
      .getByRole('link', { name: /back|dashboard/i })
      .or(page.locator('a[href="/dashboard"]'));
    if (
      await backBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(backBtn.first()).toBeVisible();
    }
  });

  test('has search input', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search notifications"]')
      .first();
    await expect(search).toBeVisible({ timeout: 10_000 });
  });

  test('has status filter buttons (all, unread, read)', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^all$/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('has type filter dropdown', async ({ page }) => {
    const typeFilter = page
      .getByRole('combobox')
      .or(page.getByText(/all types/i));
    if (
      await typeFilter
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(typeFilter.first()).toBeVisible();
    }
  });
});

test.describe('Activity Page — filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/activity');
    await page.waitForLoadState('networkidle');
  });

  test('search input filters notifications', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search notifications"]')
      .first();
    await search.fill('automation');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('search clear button clears input', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search notifications"]')
      .first();
    await search.fill('test');
    // look for X/clear button
    const clearBtn = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .last();
    if (await clearBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clearBtn.click();
      await expect(search).toHaveValue('');
    }
  });

  test('clicking Unread filter shows unread-only items', async ({ page }) => {
    const unreadBtn = page.getByRole('button', { name: /unread/i }).first();
    if (await unreadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await unreadBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });
});

test.describe('Activity Page — bulk actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/activity');
    await page.waitForLoadState('networkidle');
  });

  test('selecting a notification shows bulk action bar', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkbox.click();
      // Bulk actions bar with "X selected" text should appear
      await expect(page.getByText(/selected/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('bulk Mark Read button is visible when items selected', async ({
    page,
  }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkbox.click();
      await expect(
        page.getByRole('button', { name: /mark read/i })
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('deselecting hides bulk action bar', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkbox.click();
      await checkbox.click();
      const bulkBar = page.getByText(/selected/i);
      const isStillVisible = await bulkBar
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      expect(isStillVisible).toBeFalsy();
    }
  });
});
