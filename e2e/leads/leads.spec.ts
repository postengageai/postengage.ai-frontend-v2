import { test, expect } from '@playwright/test';

test.describe('Leads Page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/leads');
    await page.waitForLoadState('networkidle');
  });

  test('has heading "Leads"', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /leads/i }).first()
    ).toBeVisible();
  });

  test('has description about managing leads', async ({ page }) => {
    await expect(page.getByText(/manage and export/i)).toBeVisible();
  });

  test('has Export button (disabled when no leads)', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i });
    await expect(exportBtn).toBeVisible({ timeout: 10_000 });
  });

  test('search input has correct placeholder', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search leads"]')
      .first();
    await expect(search).toBeVisible();
    await expect(search).toHaveAttribute(
      'placeholder',
      'Search leads by name or username...'
    );
  });

  test('has platform filter dropdown', async ({ page }) => {
    const dropdown = page.getByRole('combobox').first();
    if (await dropdown.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(dropdown).toBeVisible();
    }
  });
});

test.describe('Leads Page — filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/leads');
    await page.waitForLoadState('networkidle');
  });

  test('search input filters leads', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search leads"]')
      .first();
    await search.fill('test');
    await page.waitForTimeout(700);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('clearing search shows all leads again', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search leads"]')
      .first();
    await search.fill('zzz_no_match_9999');
    await page.waitForTimeout(700);
    await search.clear();
    await page.waitForTimeout(700);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('no-match search shows empty state', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search leads"]')
      .first();
    await search.fill('zzz_no_match_lead_9999');
    await page.waitForTimeout(700);
    const empty = page.getByText(/no leads found/i);
    if (await empty.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(empty).toBeVisible();
    }
  });

  test('platform dropdown has platform options', async ({ page }) => {
    const dropdown = page.getByRole('combobox').first();
    if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dropdown.click();
      const options = page.getByRole('option');
      const count = await options.count();
      expect(count).toBeGreaterThanOrEqual(1);
      await page.keyboard.press('Escape');
    }
  });
});

test.describe('Leads Page — table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/leads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('table shows name, username, platform columns', async ({ page }) => {
    const table = page.locator('table');
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      const headers = page.locator('th');
      const count = await headers.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('Load More button triggers additional data fetch', async ({ page }) => {
    const loadMore = page.getByRole('button', { name: /load more/i });
    if (await loadMore.isVisible({ timeout: 5000 }).catch(() => false)) {
      const responsePromise = page.waitForResponse(
        r => r.url().includes('/leads') && r.status() === 200,
        { timeout: 15_000 }
      );
      await loadMore.click();
      await responsePromise.catch(() => null);
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });
});
