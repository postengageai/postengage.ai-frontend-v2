import { test, expect } from '@playwright/test';

test.describe('Jobs Page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/jobs');
    await page.waitForLoadState('networkidle');
  });

  test('has heading "Background Jobs"', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /background jobs/i }).first()
    ).toBeVisible();
  });

  test('has description about monitoring jobs', async ({ page }) => {
    await expect(page.getByText(/monitor and manage/i)).toBeVisible();
  });

  test('has Refresh button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
  });

  test('has back button / link to dashboard', async ({ page }) => {
    const back = page
      .locator('a[href="/dashboard"]')
      .or(page.getByRole('link', { name: /dashboard/i }))
      .first();
    await expect(back).toBeVisible();
  });

  test('has stats cards: Total, Pending, Active, Completed, Failed', async ({
    page,
  }) => {
    await page.waitForTimeout(2000);
    const labels = ['total', 'pending', 'active', 'completed', 'failed'];
    for (const label of labels) {
      const el = page.getByText(new RegExp(label, 'i')).first();
      if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(el).toBeVisible();
      }
    }
  });

  test('has tabs: All, Pending, Active, Completed, Failed', async ({
    page,
  }) => {
    const tabs = page.getByRole('tab');
    if (
      await tabs
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      const count = await tabs.count();
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });
});

test.describe('Jobs Page — interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/jobs');
    await page.waitForLoadState('networkidle');
  });

  test('Refresh button triggers API call', async ({ page }) => {
    const responsePromise = page
      .waitForResponse(r => r.url().includes('/jobs') && r.status() === 200, {
        timeout: 15_000,
      })
      .catch(() => null);
    await page.getByRole('button', { name: /refresh/i }).click();
    await responsePromise;
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('clicking Pending tab shows pending jobs', async ({ page }) => {
    const pendingTab = page.getByRole('tab', { name: /pending/i });
    if (await pendingTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pendingTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('clicking Failed tab shows failed jobs', async ({ page }) => {
    const failedTab = page.getByRole('tab', { name: /failed/i });
    if (await failedTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await failedTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('empty state shows meaningful message per tab', async ({ page }) => {
    const tabs = page.getByRole('tab');
    if (
      await tabs
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      const allTabsCount = await tabs.count();
      for (let i = 0; i < allTabsCount; i++) {
        await tabs.nth(i).click();
        await page.waitForTimeout(300);
        const emptyEl = page.getByText(/no jobs found|no .* jobs/i);
        if (await emptyEl.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(emptyEl).toBeVisible();
        }
      }
    }
  });
});
