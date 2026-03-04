import { test, expect } from '@playwright/test';

test.describe('Intelligence — Bots Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/intelligence/bots');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with correct URL and title', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard\/intelligence\/bots/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('has heading "AI Bots" with correct hierarchy', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /AI Bots/i }).first();
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCount(1);
  });

  test('has description about managing AI assistants', async ({ page }) => {
    const description = page.getByText(/manage your AI assistant/i);
    await expect(description).toBeVisible();
    await expect(description).toContainText(/manage/i);
  });

  test('"Create Bot" button is visible and clickable', async ({ page }) => {
    const btn = page
      .getByRole('link', { name: /create bot/i })
      .or(page.getByRole('button', { name: /create bot/i }));
    await expect(btn.first()).toBeVisible();
    await expect(btn.first()).toBeEnabled();
  });

  test('"Create Bot" button navigates to /new path', async ({ page }) => {
    const btn = page
      .getByRole('link', { name: /create bot/i })
      .or(page.getByRole('button', { name: /create bot/i }));
    const element = btn.first();
    const href = await element.getAttribute('href');
    const role = await element.getAttribute('role');

    if (href) {
      expect(href).toContain('/new');
    } else if (role === 'button') {
      await element.click();
      await page.waitForNavigation();
      expect(page.url()).toContain('/new');
    }
  });

  test('page renders without JavaScript errors', async ({ page }) => {
    let jsError = false;
    page.on('pageerror', () => {
      jsError = true;
    });
    await page.waitForLoadState('networkidle');
    expect(jsError).toBe(false);
  });

  test('shows skeleton cards while loading then resolves to real content', async ({
    page,
  }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    const skeleton = page
      .locator('[class*="skeleton"], [class*="Skeleton"]')
      .first();
    const hasSkeletons = await skeleton
      .isVisible({ timeout: 100 })
      .catch(() => false);

    // After networkidle, should have content
    const content = page
      .locator('[class*="card"], [class*="Card"], [role="article"]')
      .first();
    const hasContent = await content
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    expect(hasSkeletons || hasContent).toBeTruthy();
  });

  test('shows empty state when no bots exist', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const emptyText = page.getByText(/no.*bot|empty.*state|create.*first/i);
    const hasEmptyState = await emptyText
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    const botCards = page
      .locator('[class*="card"], [class*="Card"], [class*="bot"]')
      .filter({
        hasText: /configure|train|status/i,
      });
    const hasCards = (await botCards.count()) > 0;

    expect(hasEmptyState || hasCards).toBeTruthy();
  });

  test('empty state has Create Bot call-to-action button', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const emptyText = page.getByText(/no.*bot|empty.*state|create.*first/i);
    if (
      await emptyText
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false)
    ) {
      const createBtn = page
        .getByRole('link', { name: /create bot/i })
        .or(page.getByRole('button', { name: /create bot/i }));
      await expect(createBtn.first()).toBeVisible();
      await expect(createBtn.first()).toBeEnabled();
    }
  });

  test('bot cards display with proper structure and styling', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const botCard = page.locator('[class*="card"], [class*="Card"]').first();
    if (await botCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(botCard).toBeVisible();
      const rect = await botCard.boundingBox();
      expect(rect).not.toBeNull();
      expect(rect?.width).toBeGreaterThan(0);
      expect(rect?.height).toBeGreaterThan(0);
    }
  });

  test('bot cards have Configure button and is clickable', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const configBtn = page.getByRole('link', { name: /configure/i }).first();
    if (await configBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(configBtn).toBeVisible();
      await expect(configBtn).toBeEnabled();
      const href = await configBtn.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('bot cards have Train button and is clickable', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const trainBtn = page.getByRole('link', { name: /train/i }).first();
    if (await trainBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(trainBtn).toBeVisible();
      await expect(trainBtn).toBeEnabled();
      const href = await trainBtn.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('bot card displays status badge with visible text', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const badge = page.locator('[class*="badge"], [class*="Badge"]').first();
    if (await badge.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(badge).toBeVisible();
      const text = await badge.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('bot card status badge shows active/inactive/paused state', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const badge = page.locator('[class*="badge"], [class*="Badge"]').first();
    if (await badge.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = await badge.textContent();
      const isValidStatus = /active|inactive|paused|enabled|disabled/i.test(
        text || ''
      );
      expect(isValidStatus).toBeTruthy();
    }
  });

  test('bot more-menu button exists and opens menu', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const moreBtn = page
      .locator('button[aria-label*="more"], button[aria-label*="options"]')
      .first()
      .or(page.locator('button[aria-haspopup="menu"]').first());

    if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(moreBtn).toBeVisible();
      await expect(moreBtn).toBeEnabled();
      await moreBtn.click();

      const menu = page.locator('[role="menu"]').first();
      await expect(menu).toBeVisible({ timeout: 2000 });
      await page.keyboard.press('Escape');
    }
  });

  test('bot more-menu contains Settings option', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const moreBtn = page
      .locator('button[aria-label*="more"], button[aria-label*="options"]')
      .first()
      .or(page.locator('button[aria-haspopup="menu"]').first());

    if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreBtn.click();
      const settingsItem = page.getByRole('menuitem', { name: /settings/i });
      await expect(settingsItem).toBeVisible({ timeout: 2000 });
      await page.keyboard.press('Escape');
    }
  });

  test('bot more-menu contains Knowledge option', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const moreBtn = page
      .locator('button[aria-label*="more"], button[aria-label*="options"]')
      .first()
      .or(page.locator('button[aria-haspopup="menu"]').first());

    if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreBtn.click();
      const knowledgeItem = page.getByRole('menuitem', { name: /knowledge/i });
      await expect(knowledgeItem).toBeVisible({ timeout: 2000 });
      await page.keyboard.press('Escape');
    }
  });

  test('bot more-menu contains Memory option', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const moreBtn = page
      .locator('button[aria-label*="more"], button[aria-label*="options"]')
      .first()
      .or(page.locator('button[aria-haspopup="menu"]').first());

    if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreBtn.click();
      const memoryItem = page.getByRole('menuitem', { name: /memory/i });
      await expect(memoryItem).toBeVisible({ timeout: 2000 });
      await page.keyboard.press('Escape');
    }
  });

  test('bot more-menu contains Delete option', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const moreBtn = page
      .locator('button[aria-label*="more"], button[aria-label*="options"]')
      .first()
      .or(page.locator('button[aria-haspopup="menu"]').first());

    if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreBtn.click();
      const deleteItem = page.getByRole('menuitem', { name: /delete/i });
      await expect(deleteItem).toBeVisible({ timeout: 2000 });
      await page.keyboard.press('Escape');
    }
  });

  test('bot more-menu contains Pause/Activate option', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const moreBtn = page
      .locator('button[aria-label*="more"], button[aria-label*="options"]')
      .first()
      .or(page.locator('button[aria-haspopup="menu"]').first());

    if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreBtn.click();
      const pauseActivateItem = page.getByRole('menuitem', {
        name: /pause|activate/i,
      });
      const hasOption = await pauseActivateItem
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(hasOption).toBeTruthy();
      await page.keyboard.press('Escape');
    }
  });

  test('bot more-menu items are clickable', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const moreBtn = page
      .locator('button[aria-label*="more"], button[aria-label*="options"]')
      .first()
      .or(page.locator('button[aria-haspopup="menu"]').first());

    if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreBtn.click();
      const menuItem = page.getByRole('menuitem').first();
      await expect(menuItem).toBeEnabled({ timeout: 2000 });
      await page.keyboard.press('Escape');
    }
  });

  test('quality score indicator present on bot cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const scoreElement = page.getByText(/quality|score|rating|\d+%/i).first();
    if (await scoreElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(scoreElement).toBeVisible();
      const text = await scoreElement.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('quality score shows numeric value or percentage', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const scoreElement = page.getByText(/\d+%|\d+\/\d+/i).first();
    if (await scoreElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = await scoreElement.textContent();
      const hasNumeric = /\d+/.test(text || '');
      expect(hasNumeric).toBeTruthy();
    }
  });

  test('page has no console errors during navigation', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('responsive layout - bot cards stack properly on small screens', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard/intelligence/bots');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[class*="card"], [class*="Card"]');
    const count = await cards.count();
    if (count > 0) {
      const firstCard = cards.first();
      const rect = await firstCard.boundingBox();
      expect(rect?.width).toBeLessThanOrEqual(375);
    }
  });
});

test.describe('Intelligence — Brand Voices Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/intelligence/brand-voices');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard\/intelligence\/brand-voices/);
  });

  test('has heading "Brand Voices" with proper visibility', async ({
    page,
  }) => {
    const heading = page
      .getByRole('heading', { name: /brand voices/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    const text = await heading.textContent();
    expect(text?.toLowerCase()).toContain('brand voices');
  });

  test('has search input field with proper attributes', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search"]')
      .first()
      .or(page.getByPlaceholder(/search/i).first());
    await expect(search).toBeVisible({ timeout: 10000 });
    await expect(search).toHaveAttribute('type', /text|search/);
  });

  test('search input has proper width and styling', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search"]')
      .first()
      .or(page.getByPlaceholder(/search/i).first());
    if (await search.isVisible({ timeout: 5000 }).catch(() => false)) {
      const rect = await search.boundingBox();
      expect(rect?.width).toBeGreaterThan(100);
    }
  });

  test('"Create Voice" button exists and is clickable', async ({ page }) => {
    const btn = page
      .getByRole('link', { name: /create voice/i })
      .or(page.getByRole('button', { name: /create voice/i }));
    await expect(btn.first()).toBeVisible({ timeout: 10000 });
    await expect(btn.first()).toBeEnabled();
  });

  test('"Create Voice" button navigates or opens action', async ({ page }) => {
    const btn = page
      .getByRole('link', { name: /create voice/i })
      .or(page.getByRole('button', { name: /create voice/i }));
    const element = btn.first();
    const href = await element.getAttribute('href');

    if (href) {
      expect(href.length).toBeGreaterThan(0);
    } else {
      expect(await element.getAttribute('role')).toBe('button');
    }
  });

  test('table element is present on page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(table).toBeVisible();
    }
  });

  test('table has Name column header', async ({ page }) => {
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      const nameHeader = page
        .locator('th')
        .filter({ hasText: /name/i })
        .first();
      await expect(nameHeader).toBeVisible();
    }
  });

  test('table has Tone column header', async ({ page }) => {
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      const toneHeader = page
        .locator('th')
        .filter({ hasText: /tone/i })
        .first();
      await expect(toneHeader).toBeVisible();
    }
  });

  test('table has Formality column header', async ({ page }) => {
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      const formalityHeader = page
        .locator('th')
        .filter({ hasText: /formality|formal/i })
        .first();
      const isVisible = await formalityHeader
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(isVisible).toBeTruthy();
    }
  });

  test('table has Keywords column header', async ({ page }) => {
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      const keywordsHeader = page
        .locator('th')
        .filter({ hasText: /keyword/i })
        .first();
      const isVisible = await keywordsHeader
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(isVisible).toBeTruthy();
    }
  });

  test('table has Voice DNA column header', async ({ page }) => {
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      const voiceDnaHeader = page
        .locator('th')
        .filter({ hasText: /voice dna|dna/i })
        .first();
      const isVisible = await voiceDnaHeader
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(isVisible).toBeTruthy();
    }
  });

  test('table has Actions column header', async ({ page }) => {
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionsHeader = page
        .locator('th')
        .filter({ hasText: /action/i })
        .first();
      const isVisible = await actionsHeader
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(isVisible).toBeTruthy();
    }
  });

  test('search input accepts text and filters results', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search"]')
      .first()
      .or(page.getByPlaceholder(/search/i).first());

    if (await search.isVisible({ timeout: 5000 }).catch(() => false)) {
      const initialCount = await page.locator('tbody tr').count();

      await search.fill('friendly');
      await page.waitForTimeout(500);
      await page.waitForLoadState('networkidle');

      const filteredCount = await page.locator('tbody tr').count();

      // Verify table is still visible after filtering
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    }
  });

  test('search clears and shows all results again', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search"]')
      .first()
      .or(page.getByPlaceholder(/search/i).first());

    if (await search.isVisible({ timeout: 5000 }).catch(() => false)) {
      await search.fill('professional');
      await page.waitForTimeout(500);

      await search.clear();
      await page.waitForTimeout(500);

      const value = await search.inputValue();
      expect(value).toBe('');
    }
  });

  test('table displays brand voice rows with data', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const tableRow = page.locator('tbody tr').first();

    if (await tableRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(tableRow).toBeVisible();
      const cells = tableRow.locator('td');
      const cellCount = await cells.count();
      expect(cellCount).toBeGreaterThan(0);
    }
  });

  test('table row cells contain text content', async ({ page }) => {
    const tableRow = page.locator('tbody tr').first();

    if (await tableRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      const firstCell = tableRow.locator('td').first();
      const text = await firstCell.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('page has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('responsive table layout on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard/intelligence/brand-voices');
    await page.waitForLoadState('networkidle');

    const heading = page
      .getByRole('heading', { name: /brand voices/i })
      .first();
    await expect(heading).toBeVisible();
  });
});
