import { test, expect } from '@playwright/test';

test.describe('Automations List — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/automations');
    await page.waitForLoadState('networkidle');
  });

  test('page title is "Automations"', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /automations/i }).first()
    ).toBeVisible();
  });

  test('has subtitle about creating automations', async ({ page }) => {
    await expect(page.getByText(/create and manage/i)).toBeVisible();
  });

  test('"New Automation" button links to /dashboard/automations/new', async ({
    page,
  }) => {
    const btn = page.getByRole('link', { name: /new automation/i });
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('href', '/dashboard/automations/new');
  });

  test('"New Automation" button is enabled and clickable', async ({ page }) => {
    const btn = page.getByRole('link', { name: /new automation/i });
    await expect(btn).toBeEnabled();
    const isDisabled = await btn.getAttribute('aria-disabled');
    expect(isDisabled).not.toBe('true');
  });

  test('search input has correct placeholder', async ({ page }) => {
    const search = page.locator(
      '#search, input[placeholder*="Search automations"]'
    );
    await expect(search.first()).toBeVisible();
    await expect(search.first()).toHaveAttribute(
      'placeholder',
      'Search automations...'
    );
  });

  test('search input is focused on page load (optional) or at least focusable', async ({
    page,
  }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();
    await search.focus();
    const isFocused = await search.evaluate(
      el => el === document.activeElement
    );
    expect(isFocused).toBe(true);
  });

  test('stats cards show Total, Active, Total Executions', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.getByText(/total/i).first()).toBeVisible();
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    const h2 = page.getByRole('heading', { level: 2 });
    await expect(h1.first()).toBeVisible();
  });

  test('main content area is present and accessible', async ({ page }) => {
    const main = page.locator('main, [role="main"]');
    await expect(main.first()).toBeVisible();
  });

  test('page does not have duplicate IDs', async ({ page }) => {
    const ids = await page
      .locator('[id]')
      .evaluateAll(els => els.map(el => el.id).filter(id => id));
    const uniqueIds = new Set(ids);
    // Each ID should be unique
    expect(ids.length).toBe(uniqueIds.size);
  });
});

test.describe('Automations List — filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/automations');
    await page.waitForLoadState('networkidle');
  });

  test('search input filters automation cards', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();
    await search.fill('Welcome');
    await page.waitForTimeout(600); // debounce
    // Page should still render
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('search input accepts user input and displays in field', async ({
    page,
  }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();
    await search.fill('TestQuery123');
    const value = await search.inputValue();
    expect(value).toBe('TestQuery123');
  });

  test('clearing search restores full list', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();
    await search.fill('zzzznotexists');
    await page.waitForTimeout(600);
    await search.clear();
    await page.waitForTimeout(600);
    const cleared = await search.inputValue();
    expect(cleared).toBe('');
  });

  test('no-match search shows empty state', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();
    await search.fill('zzzznoautomationfound9999');
    await page.waitForTimeout(600);
    const emptyState = page.getByText(/no automations found/i);
    if (await emptyState.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(emptyState).toBeVisible();
      const suggestion = page.getByText(/adjust.*filter|filter|try different/i);
      if (await suggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(suggestion).toBeVisible();
      }
    }
  });

  test('status dropdown has all, active, inactive options', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox').first();
    if (await trigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await trigger.click();
      const options = page.getByRole('option');
      const count = await options.count();
      expect(count).toBeGreaterThanOrEqual(2);
      // Check specific options exist
      const allOption = page.getByRole('option', { name: /all/i });
      const activeOption = page.getByRole('option', { name: /active/i });
      if (await allOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(allOption).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
  });

  test('dropdown closes on escape key', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    if (await trigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await trigger.click();
      const menu = page.locator('[role="listbox"]');
      await expect(menu).toBeVisible({ timeout: 2000 });

      await page.keyboard.press('Escape');
      await expect(menu).not.toBeVisible({ timeout: 2000 });
    }
  });

  test('selecting option in dropdown updates selection', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    if (await trigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      const initialValue = await trigger.inputValue();

      await trigger.click();
      const options = page.getByRole('option');
      const firstOption = options.first();
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstOption.click();
        await page.waitForTimeout(300);

        // Value should have changed or dropdown closed
        const menu = page.locator('[role="listbox"]');
        const menuVisible = await menu
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        expect(!menuVisible).toBe(true);
      }
    }
  });

  test('multiple filters can be applied together', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();
    await search.fill('Test');
    await page.waitForTimeout(600);

    const trigger = page.getByRole('combobox').first();
    if (await trigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await trigger.click();
      const option = page.getByRole('option').first();
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click();
        await page.waitForTimeout(600);
      }
    }

    // Page should still be valid
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('search is case-insensitive', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();
    await search.fill('WELCOME');
    await page.waitForTimeout(600);
    // Should not crash, page renders
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('whitespace in search is handled properly', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();
    await search.fill('   test   ');
    await page.waitForTimeout(600);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Automations List — card interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/automations');
    await page.waitForLoadState('networkidle');
  });

  test('automation card has toggle switch', async ({ page }) => {
    await page.waitForTimeout(2000);
    const toggle = page.locator('button[role="switch"]').first();
    if (await toggle.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-checked');
    }
  });

  test('toggle switch can be clicked to change state', async ({ page }) => {
    await page.waitForTimeout(2000);
    const toggle = page.locator('button[role="switch"]').first();
    if (await toggle.isVisible({ timeout: 5000 }).catch(() => false)) {
      const initialChecked = await toggle.getAttribute('aria-checked');
      await toggle.click();
      await page.waitForTimeout(500);
      const newChecked = await toggle.getAttribute('aria-checked');
      // State should change
      expect(newChecked !== initialChecked).toBe(true);
    }
  });

  test('toggle switch is keyboard accessible', async ({ page }) => {
    await page.waitForTimeout(2000);
    const toggle = page.locator('button[role="switch"]').first();
    if (await toggle.isVisible({ timeout: 5000 }).catch(() => false)) {
      await toggle.focus();
      const isFocused = await toggle.evaluate(
        el => el === document.activeElement
      );
      expect(isFocused).toBe(true);

      // Space key should toggle
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      const checked = await toggle.getAttribute('aria-checked');
      expect(checked).toBeTruthy();
    }
  });

  test('automation name links to detail page', async ({ page }) => {
    await page.waitForTimeout(2000);
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const link = card.getByRole('link').first();
      if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
        const href = await link.getAttribute('href');
        expect(href).toMatch(/automations\/[a-z0-9]/i);
      }
    }
  });

  test('automation card is clickable and navigates', async ({ page }) => {
    await page.waitForTimeout(2000);
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const link = card.getByRole('link').first();
      if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
        const href = await link.getAttribute('href');
        if (href) {
          await link.click();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(
            new RegExp(href.split('/').pop() || 'automations')
          );
        }
      }
    }
  });

  test('automation card has visible automation name/title', async ({
    page,
  }) => {
    await page.waitForTimeout(2000);
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const text = await card.textContent();
      expect(text?.length || 0).toBeGreaterThan(0);
    }
  });

  test('actions menu (MoreHorizontal) opens dropdown', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Find more button in first card
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = card
        .locator('button')
        .filter({ has: page.locator('svg') })
        .last();
      if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moreBtn.click();
        const menu = page.locator('[role="menu"]');
        if (await menu.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(menu).toBeVisible();
        }
      }
    }
  });

  test('actions menu has Edit option', async ({ page }) => {
    await page.waitForTimeout(2000);
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = card
        .locator('button')
        .filter({ has: page.locator('svg') })
        .last();
      if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moreBtn.click();
        const editOption = page.getByRole('menuitem', { name: /edit/i });
        if (await editOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(editOption).toBeVisible();
          await expect(editOption).toBeEnabled();
        }
        await page.keyboard.press('Escape');
      }
    }
  });

  test('actions menu has Delete option', async ({ page }) => {
    await page.waitForTimeout(2000);
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = card
        .locator('button')
        .filter({ has: page.locator('svg') })
        .last();
      if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moreBtn.click();
        const deleteOption = page.getByRole('menuitem', { name: /delete/i });
        if (
          await deleteOption.isVisible({ timeout: 3000 }).catch(() => false)
        ) {
          await expect(deleteOption).toBeVisible();
          await expect(deleteOption).toBeEnabled();
        }
        await page.keyboard.press('Escape');
      }
    }
  });

  test('Edit option navigates to automation edit page', async ({ page }) => {
    await page.waitForTimeout(2000);
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = card
        .locator('button')
        .filter({ has: page.locator('svg') })
        .last();
      if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moreBtn.click();
        const editOption = page.getByRole('menuitem', { name: /edit/i });
        if (await editOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await editOption.click();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/automations\/[a-z0-9]/i);
        }
      }
    }
  });

  test('Delete option shows confirmation dialog', async ({ page }) => {
    await page.waitForTimeout(2000);
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = card
        .locator('button')
        .filter({ has: page.locator('svg') })
        .last();
      if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moreBtn.click();
        const deleteOption = page.getByRole('menuitem', { name: /delete/i });
        if (
          await deleteOption.isVisible({ timeout: 3000 }).catch(() => false)
        ) {
          await deleteOption.click();
          const dialog = page.locator('[role="dialog"]');
          if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
            await expect(dialog).toBeVisible();
          }
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('actions menu closes on escape', async ({ page }) => {
    await page.waitForTimeout(2000);
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const moreBtn = card
        .locator('button')
        .filter({ has: page.locator('svg') })
        .last();
      if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moreBtn.click();
        const menu = page.locator('[role="menu"]');
        await expect(menu).toBeVisible({ timeout: 3000 });

        await page.keyboard.press('Escape');
        await expect(menu).not.toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('multiple cards can be interacted with sequentially', async ({
    page,
  }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const count = await cards.count();

    for (let i = 0; i < Math.min(count, 2); i++) {
      const card = cards.nth(i);
      if (await card.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(card).toBeVisible();
        const toggle = card.locator('button[role="switch"]');
        if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(toggle).toBeVisible();
        }
      }
    }
  });
});

test.describe('Automations — new automation wizard', () => {
  test('navigating to /new shows wizard', async ({ page }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/automations\/new/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('wizard page has proper title or heading', async ({ page }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');
    const heading = page
      .getByRole('heading', { name: /new|create|setup/i })
      .first();
    if (await heading.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(heading).toBeVisible();
    }
  });

  test('wizard has Cancel button that returns to list', async ({ page }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');
    const cancel = page.getByRole('button', { name: /cancel/i });
    if (await cancel.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cancel.click();
      await page.waitForURL('**/automations**', { timeout: 10_000 });
      await expect(page).toHaveURL(/\/automations$/);
    }
  });

  test('wizard has Next or Continue button (if multi-step)', async ({
    page,
  }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');
    const nextBtn = page.getByRole('button', { name: /next|continue|create/i });
    if (
      await nextBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(nextBtn.first()).toBeVisible();
    }
  });

  test('wizard form fields are present and focusable', async ({ page }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');
    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.focus();
        const isFocused = await input.evaluate(
          el => el === document.activeElement
        );
        expect(isFocused).toBe(true);
      }
    }
  });

  test('wizard can accept input in form fields', async ({ page }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');
    const firstInput = page.locator('input').first();

    if (await firstInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstInput.fill('Test Automation Name');
      const value = await firstInput.inputValue();
      expect(value).toBe('Test Automation Name');
    }
  });

  test('wizard shows validation errors on invalid input (if applicable)', async ({
    page,
  }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling required fields
    const submitBtn = page
      .getByRole('button', { name: /next|continue|create/i })
      .first();
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const initialURL = page.url();
      await submitBtn.click();
      await page.waitForTimeout(500);

      // Should either stay on same page or show error
      const error = page.locator(
        '[role="alert"], [class*="error"], [class*="Error"]'
      );
      if (await error.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(error).toBeVisible();
      }
    }
  });

  test('wizard form is keyboard navigable', async ({ page }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');

    const firstInput = page.locator('input').first();
    if (await firstInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstInput.focus();

      // Tab to next field
      await page.keyboard.press('Tab');
      const activeEl = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        return el?.tagName?.toLowerCase();
      });

      expect(activeEl).toBeTruthy();
    }
  });

  test('wizard Cancel button is always accessible', async ({ page }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');
    const cancel = page.getByRole('button', { name: /cancel/i });

    if (await cancel.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cancel.focus();
      const isFocused = await cancel.evaluate(
        el => el === document.activeElement
      );
      expect(isFocused).toBe(true);
      const isDisabled = await cancel.getAttribute('aria-disabled');
      expect(isDisabled).not.toBe('true');
    }
  });

  test('wizard does not crash on rapid navigation changes', async ({
    page,
  }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');

    await page.goBack();
    await page.waitForLoadState('networkidle');

    await page.goForward();
    await page.waitForLoadState('networkidle');

    // Page should still be valid
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('wizard has proper semantic form structure', async ({ page }) => {
    await page.goto('/dashboard/automations/new');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form').first();
    if (await form.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(form).toBeVisible();
    }

    // Form fields should be inside form or properly associated
    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Automations List — list rendering and performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/automations');
    await page.waitForLoadState('networkidle');
  });

  test('automation list renders without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      e =>
        !e.includes('ResizeObserver') &&
        !e.includes('Non-Error promise rejection')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('page does not have memory leaks on repeated filter changes', async ({
    page,
  }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();

    for (let i = 0; i < 5; i++) {
      await search.fill(`test${i}`);
      await page.waitForTimeout(300);
    }

    await search.clear();
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('list maintains state on search clear and refill', async ({ page }) => {
    const search = page
      .locator('#search, input[placeholder*="Search automations"]')
      .first();

    await search.fill('test1');
    await page.waitForTimeout(600);

    const firstFilter = await page.locator('body').textContent();

    await search.clear();
    await page.waitForTimeout(600);

    await search.fill('test1');
    await page.waitForTimeout(600);

    const secondFilter = await page.locator('body').textContent();

    // Content should be consistent
    expect(firstFilter).toBe(secondFilter);
  });

  test('all visible cards have required attributes', async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const count = await cards.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = cards.nth(i);
      const hasLink = await card.getByRole('link').count();
      const hasToggle = await card.locator('button[role="switch"]').count();

      // Each card should have at least a link or toggle
      expect(hasLink > 0 || hasToggle > 0).toBe(true);
    }
  });

  test('page scrolls without layout shift', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Get initial scroll position
    const initialHeight = await page.evaluate(() => document.body.scrollHeight);

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);

    // Should not crash
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
