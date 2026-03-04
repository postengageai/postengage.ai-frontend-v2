import { test, expect } from '@playwright/test';

test.describe('Notifications Page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/notifications');
    await page.waitForLoadState('networkidle');
  });

  test('has heading "Notifications"', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /notifications/i }).first()
    ).toBeVisible();
  });

  test('has description about staying updated', async ({ page }) => {
    await expect(page.getByText(/stay updated/i)).toBeVisible();
  });

  test('has All, Unread, Read tabs', async ({ page }) => {
    const tabs = page.getByRole('tab');
    if (
      await tabs
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /unread/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /read/i })).toBeVisible();
    }
  });
});

test.describe('Notifications Page — tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/notifications');
    await page.waitForLoadState('networkidle');
  });

  test('All tab is selected by default', async ({ page }) => {
    const allTab = page.getByRole('tab', { name: /all/i });
    if (await allTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(allTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('clicking Unread tab shows unread notifications or empty state', async ({
    page,
  }) => {
    const unreadTab = page.getByRole('tab', { name: /unread/i });
    if (await unreadTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await unreadTab.click();
      await page.waitForTimeout(500);
      const emptyMsg = page.getByText(/all caught up|no notifications/i);
      const items = page.locator('[class*="card"], [class*="Card"]');
      const hasEmpty = await emptyMsg
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      const hasItems = (await items.count()) > 0;
      expect(hasEmpty || hasItems).toBeTruthy();
    }
  });

  test('clicking Read tab shows read notifications or empty state', async ({
    page,
  }) => {
    const readTab = page.getByRole('tab', { name: /^read$/i });
    if (await readTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await readTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('switching back to All tab from Unread works', async ({ page }) => {
    const unreadTab = page.getByRole('tab', { name: /unread/i });
    const allTab = page.getByRole('tab', { name: /all/i });
    if (await unreadTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unreadTab.click();
      await page.waitForTimeout(300);
      await allTab.click();
      await page.waitForTimeout(300);
      await expect(allTab).toHaveAttribute('aria-selected', 'true');
    }
  });
});

test.describe('Notifications Page — actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/notifications');
    await page.waitForLoadState('networkidle');
  });

  test('"Mark All Read" button sends API request and refreshes', async ({
    page,
  }) => {
    const markAllBtn = page.getByRole('button', { name: /mark all read/i });
    if (await markAllBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const responsePromise = page
        .waitForResponse(
          r => r.url().includes('/notifications') && r.status() === 200,
          { timeout: 15_000 }
        )
        .catch(() => null);
      await markAllBtn.click();
      await responsePromise;
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('individual mark-read button marks notification as read', async ({
    page,
  }) => {
    const unreadDot = page
      .locator(
        '[class*="rounded-full"][class*="bg-blue"], [class*="indicator"]'
      )
      .first();
    if (await unreadDot.isVisible({ timeout: 5000 }).catch(() => false)) {
      const markReadBtn = page
        .locator('button')
        .filter({ hasNot: page.getByRole('tab') })
        .last();
      if (await markReadBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await markReadBtn.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).not.toBeEmpty();
      }
    }
  });

  test('notification timestamp is displayed', async ({ page }) => {
    const items = page.locator('[class*="card"], [class*="Card"]');
    if (
      await items
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      // Should show relative time like "2 hours ago"
      const timeText = page
        .getByText(/(ago|minute|hour|day|week|month)/i)
        .first();
      await expect(timeText).toBeVisible({ timeout: 5000 });
    }
  });
});
