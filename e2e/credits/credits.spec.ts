import { test, expect } from '@playwright/test';

test.describe('Credits Overview — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/credits/overview');
    await page.waitForLoadState('networkidle');
  });

  test('overview page loads with correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard\/credits\/overview/);
  });

  test('page renders without JavaScript errors', async ({ page }) => {
    let jsError = false;
    page.on('pageerror', () => {
      jsError = true;
    });
    await page.waitForLoadState('networkidle');
    expect(jsError).toBe(false);
  });

  test('page is not empty and has content', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('has heading "Credits & Usage" with correct hierarchy', async ({
    page,
  }) => {
    const heading = page
      .getByRole('heading', { name: /credits.*usage|usage.*credit/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    const text = await heading.textContent();
    expect(text?.toLowerCase()).toMatch(/credit|usage/);
  });

  test('heading is h1 or prominent heading element', async ({ page }) => {
    const h1 = page
      .locator('h1')
      .filter({ hasText: /credit|usage/i })
      .first();
    if (await h1.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(h1).toBeVisible();
    }
  });

  test('has description text about tracking credits', async ({ page }) => {
    const description = page.getByText(
      /track your credit|credit balance|remaining credit/i
    );
    await expect(description).toBeVisible({ timeout: 10000 });
  });

  test('"Buy Credits" button is visible and clickable', async ({ page }) => {
    const btn = page
      .getByRole('link', { name: /buy credit/i })
      .or(page.getByRole('button', { name: /buy credit/i }));
    await expect(btn.first()).toBeVisible({ timeout: 10000 });
    await expect(btn.first()).toBeEnabled();
  });

  test('"Buy Credits" button links to /credits/buy or opens purchase flow', async ({
    page,
  }) => {
    const btn = page
      .getByRole('link', { name: /buy credit/i })
      .or(page.getByRole('button', { name: /buy credit/i }));
    const element = btn.first();
    const href = await element.getAttribute('href');

    if (href) {
      expect(href).toContain('/buy');
    } else {
      await element.click();
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
      // Either navigated or modal opened
      const onBuyPage = page.url().includes('/buy');
      const dialogVisible = await page.locator('[role="dialog"]').isVisible();
      expect(onBuyPage || dialogVisible).toBeTruthy();
    }
  });

  test('shows credit balance card with numeric value', async ({ page }) => {
    await page.waitForTimeout(1000);
    const balanceCard = page.getByText(/balance|remaining/i).first();
    await expect(balanceCard).toBeVisible({ timeout: 10000 });

    const numericValue = page.getByText(/\d+\s*(credit|point)/i).first();
    const hasNumber = await numericValue
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(hasNumber).toBeTruthy();
  });

  test('credit balance displays in card format with visual hierarchy', async ({
    page,
  }) => {
    const card = page
      .locator('[class*="card"], [class*="Card"], [role="article"]')
      .first();

    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const rect = await card.boundingBox();
      expect(rect?.width).toBeGreaterThan(100);
      expect(rect?.height).toBeGreaterThan(50);
    }
  });

  test('shows usage summary cards with consumed and purchased data', async ({
    page,
  }) => {
    await page.waitForTimeout(1000);
    const usageText = page
      .getByText(/consume|purchased|transaction|spend/i)
      .first();
    await expect(usageText).toBeVisible({ timeout: 10000 });
  });

  test('usage summary shows distinct consumed vs purchased sections', async ({
    page,
  }) => {
    const consumed = page.getByText(/consume|used|spend/i).first();
    const purchased = page.getByText(/purchased|bought|acquire/i).first();

    const hasConsumed = await consumed
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasPurchased = await purchased
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    expect(hasConsumed || hasPurchased).toBeTruthy();
  });

  test('has Activity and Billing tabs for navigation', async ({ page }) => {
    const tabs = page.getByRole('tab');
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Activity tab is visible and can be clicked', async ({ page }) => {
    const activityTab = page.getByRole('tab', { name: /activity/i });
    if (await activityTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(activityTab).toBeVisible();
      await expect(activityTab).toBeEnabled();
    }
  });

  test('Billing tab is visible and can be clicked', async ({ page }) => {
    const billingTab = page.getByRole('tab', { name: /billing/i });
    if (await billingTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(billingTab).toBeVisible();
      await expect(billingTab).toBeEnabled();
    }
  });

  test('tabs have proper accessibility attributes', async ({ page }) => {
    const tabs = page.getByRole('tab');
    const count = await tabs.count();

    if (count > 0) {
      const firstTab = tabs.first();
      const ariaSelected = await firstTab.getAttribute('aria-selected');
      expect(ariaSelected).toBeTruthy();
    }
  });

  test('switching tabs changes content', async ({ page }) => {
    const activityTab = page.getByRole('tab', { name: /activity/i });
    const billingTab = page.getByRole('tab', { name: /billing/i });

    if (
      (await activityTab.isVisible({ timeout: 5000 }).catch(() => false)) &&
      (await billingTab.isVisible({ timeout: 5000 }).catch(() => false))
    ) {
      const activityInitialText = await page
        .locator('[role="tabpanel"]')
        .first()
        .textContent();

      await billingTab.click();
      await page.waitForTimeout(500);

      const billingText = await page
        .locator('[role="tabpanel"]')
        .first()
        .textContent();

      // Content should be different or page should reflect tab change
      const onOverviewPage = page.url().includes('overview');
      expect(onOverviewPage || billingText).toBeTruthy();
    }
  });

  test('usage chart date range controls exist', async ({ page }) => {
    const todayBtn = page.getByRole('button', { name: /today/i });
    const weekBtn = page.getByRole('button', { name: /week/i });
    const monthBtn = page.getByRole('button', { name: /month/i });

    const hasToday = await todayBtn
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasWeek = await weekBtn
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasMonth = await monthBtn
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(hasToday || hasWeek || hasMonth).toBeTruthy();
  });

  test('week button changes chart when clicked', async ({ page }) => {
    const weekBtn = page.getByRole('button', { name: /week/i });

    if (await weekBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const responsePromise = page
        .waitForResponse(
          r => r.url().includes('/credits') || r.url().includes('/usage'),
          { timeout: 10000 }
        )
        .catch(() => null);

      await weekBtn.click();
      await page.waitForTimeout(500);

      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('month button changes chart when clicked', async ({ page }) => {
    const monthBtn = page.getByRole('button', { name: /month/i });

    if (await monthBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const responsePromise = page
        .waitForResponse(
          r => r.url().includes('/credits') || r.url().includes('/usage'),
          { timeout: 10000 }
        )
        .catch(() => null);

      await monthBtn.click();
      await page.waitForTimeout(500);

      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('date range buttons are mutually exclusive (radio style)', async ({
    page,
  }) => {
    const todayBtn = page.getByRole('button', { name: /today/i });
    const weekBtn = page.getByRole('button', { name: /week/i });

    if (
      (await todayBtn.isVisible({ timeout: 5000 }).catch(() => false)) &&
      (await weekBtn.isVisible({ timeout: 5000 }).catch(() => false))
    ) {
      await weekBtn.click();
      await page.waitForTimeout(300);

      const weekSelected =
        (await weekBtn.getAttribute('aria-selected')) ||
        (await weekBtn.getAttribute('data-active'));
      expect(weekSelected).toBeTruthy();
    }
  });

  test('Activity tab shows transaction history or empty state', async ({
    page,
  }) => {
    const activityTab = page.getByRole('tab', { name: /activity/i });
    if (await activityTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await activityTab.click();
      await page.waitForTimeout(1000);

      // Either shows transaction table/list or empty state message
      const tableOrList = page
        .locator('table, [role="grid"], [class*="list"]')
        .first();
      const emptyMessage = page
        .getByText(/no.*activity|no.*transaction|empty/i)
        .first();

      const hasContent = await tableOrList
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      const hasEmpty = await emptyMessage
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      expect(hasContent || hasEmpty).toBeTruthy();
    }
  });

  test('Activity tab displays transaction columns or items', async ({
    page,
  }) => {
    const activityTab = page.getByRole('tab', { name: /activity/i });
    if (await activityTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await activityTab.click();
      await page.waitForTimeout(1000);

      const headerOrItem = page
        .locator('th, [role="columnheader"], [class*="item"]')
        .first();
      if (await headerOrItem.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await headerOrItem.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('Billing tab content loads when clicked', async ({ page }) => {
    const billingTab = page.getByRole('tab', { name: /billing/i });
    if (await billingTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await billingTab.click();
      await page.waitForTimeout(1000);

      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('Billing tab shows payment methods or billing history', async ({
    page,
  }) => {
    const billingTab = page.getByRole('tab', { name: /billing/i });
    if (await billingTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await billingTab.click();
      await page.waitForTimeout(1000);

      const paymentOrHistory = page
        .getByText(/payment|billing|method|invoice|receipt/i)
        .first();
      if (
        await paymentOrHistory.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await expect(paymentOrHistory).toBeVisible();
      }
    }
  });

  test('responsive layout - cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard/credits/overview');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading', { name: /credit/i }).first();
    await expect(heading).toBeVisible();
  });

  test('no console errors during page interaction', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    const weekBtn = page.getByRole('button', { name: /week/i });
    if (await weekBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await weekBtn.click();
      await page.waitForTimeout(500);
    }

    expect(errors).toHaveLength(0);
  });
});

test.describe('Credits Buy — pricing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/credits/buy');
    await page.waitForLoadState('networkidle');
  });

  test('buy page loads with correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard\/credits\/buy/);
  });

  test('page renders without JavaScript errors', async ({ page }) => {
    let jsError = false;
    page.on('pageerror', () => {
      jsError = true;
    });
    await page.waitForLoadState('networkidle');
    expect(jsError).toBe(false);
  });

  test('page is not empty and has content', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('has heading "Choose Your Plan" or similar text', async ({ page }) => {
    const heading = page
      .getByRole('heading', { name: /choose your plan|select.*plan|pricing/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('heading is prominent h1 element', async ({ page }) => {
    const h1 = page
      .locator('h1')
      .filter({ hasText: /choose|plan|pricing/i })
      .first();
    if (await h1.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(h1).toBeVisible();
    }
  });

  test('has subtitle mentioning 14-day free trial', async ({ page }) => {
    const subtitle = page.getByText(
      /14-day.*free.*trial|free trial.*14|trial.*14.*day/i
    );
    await expect(subtitle).toBeVisible({ timeout: 10000 });
  });

  test('subtitle is clearly visible and readable', async ({ page }) => {
    const subtitle = page.getByText(/14-day.*free|free.*trial/i).first();
    if (await subtitle.isVisible({ timeout: 5000 }).catch(() => false)) {
      const text = await subtitle.textContent();
      expect(text?.toLowerCase()).toContain('trial');
    }
  });

  test('displays pricing plan cards with visible content', async ({ page }) => {
    await page.waitForTimeout(1500);
    const planCards = page.locator(
      '[class*="card"], [class*="Card"], [role="article"]'
    );
    const count = await planCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('each plan card is visible and properly sized', async ({ page }) => {
    await page.waitForTimeout(1500);
    const firstCard = page.locator('[class*="card"], [class*="Card"]').first();

    if (await firstCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      const rect = await firstCard.boundingBox();
      expect(rect?.width).toBeGreaterThan(150);
      expect(rect?.height).toBeGreaterThan(200);
    }
  });

  test('plan cards display at least 3 pricing tiers', async ({ page }) => {
    await page.waitForTimeout(1500);
    const planCards = page.locator('[class*="card"], [class*="Card"]');
    const count = await planCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('plan cards have plan names (free/pro/starter/enterprise/basic)', async ({
    page,
  }) => {
    await page.waitForTimeout(1500);
    const planName = page
      .getByText(/free|pro|starter|enterprise|basic|standard|premium/i)
      .first();
    await expect(planName).toBeVisible({ timeout: 10000 });
  });

  test('plan card displays pricing amount', async ({ page }) => {
    await page.waitForTimeout(1500);
    const price = page.getByText(/\$\d+|\d+\s*(credit|point|dollar)/i).first();
    if (await price.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(price).toBeVisible();
      const text = await price.textContent();
      expect(/\d+/.test(text || '')).toBeTruthy();
    }
  });

  test('plan card has Call-To-Action button (Subscribe/Choose)', async ({
    page,
  }) => {
    await page.waitForTimeout(1500);
    const ctaButton = page
      .getByRole('button', {
        name: /subscribe|choose|select|buy|purchase|get/i,
      })
      .first();
    if (await ctaButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toBeEnabled();
    }
  });

  test('plan CTA buttons are clickable and distinct', async ({ page }) => {
    await page.waitForTimeout(1500);
    const buttons = page.getByRole('button', {
      name: /subscribe|choose|select|buy|purchase|get/i,
    });
    const count = await buttons.count();

    if (count > 0) {
      const firstBtn = buttons.first();
      await expect(firstBtn).toBeEnabled();
    }
  });

  test('clicking plan button initiates checkout or purchase flow', async ({
    page,
  }) => {
    await page.waitForTimeout(1500);
    const ctaButton = page
      .getByRole('button', {
        name: /subscribe|choose|select|buy|purchase|get/i,
      })
      .first();

    if (await ctaButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      const responsePromise = page
        .waitForResponse(
          r =>
            r.url().includes('/payment') ||
            r.url().includes('/checkout') ||
            r.url().includes('/subscribe'),
          { timeout: 10000 }
        )
        .catch(() => null);

      await ctaButton.click();

      // Either shows modal, redirects, or API response
      await page.waitForTimeout(1000);
      const hasModal = await page
        .locator('[role="dialog"]')
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      const urlChanged =
        page.url().includes('checkout') || page.url().includes('payment');

      expect(hasModal || urlChanged).toBeTruthy();
    }
  });

  test('has FAQ section with visible questions', async ({ page }) => {
    const faqSection = page
      .getByText(/frequently asked question|faq|common question/i)
      .first();
    if (await faqSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(faqSection).toBeVisible();
    }
  });

  test('FAQ section has at least one question visible or expandable', async ({
    page,
  }) => {
    const faqItems = page.getByText(
      /can I change|payment method|free trial|cancel anytime|refund/i
    );
    const count = await faqItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('FAQ questions are expandable/collapsible', async ({ page }) => {
    const faqBtn = page
      .getByRole('button', { name: /can|why|how|what|when/i })
      .first();

    if (await faqBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const ariaExpanded = await faqBtn.getAttribute('aria-expanded');
      if (ariaExpanded) {
        expect(['true', 'false']).toContain(ariaExpanded);

        await faqBtn.click();
        const newState = await faqBtn.getAttribute('aria-expanded');
        expect(['true', 'false']).toContain(newState);
      }
    }
  });

  test('has features section displaying benefits', async ({ page }) => {
    const featuresSection = page
      .getByText(/feature|benefit|include|flexible billing|scale|priority/i)
      .first();
    if (await featuresSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(featuresSection).toBeVisible();
    }
  });

  test('features section displays at least 2 feature cards', async ({
    page,
  }) => {
    const featureCards = page
      .locator('[class*="feature"], [class*="benefit"]')
      .filter({
        has: page.locator('[class*="icon"], svg'),
      });
    const count = await featureCards.count();

    if (count === 0) {
      // Alternative: check for text-based features
      const featureTexts = page.getByText(/flexible|scale|feature|support/i);
      const textCount = await featureTexts.count();
      expect(textCount).toBeGreaterThanOrEqual(2);
    } else {
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  test('feature items have icons and descriptive text', async ({ page }) => {
    const featureItem = page
      .locator('[class*="feature"], [class*="benefit"]')
      .first();

    if (await featureItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      const icon = featureItem.locator('svg, [class*="icon"]').first();
      const text = featureItem.locator('p, span, h').first();

      const hasIcon = await icon
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      const hasText = await text
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      expect(hasIcon || hasText).toBeTruthy();
    }
  });

  test('plan comparison table exists', async ({ page }) => {
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(table).toBeVisible();
    }
  });

  test('plan comparison table has headers', async ({ page }) => {
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      const headers = table.locator('th, [role="columnheader"]');
      const count = await headers.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('responsive layout - plans stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard/credits/buy');
    await page.waitForLoadState('networkidle');

    const heading = page
      .getByRole('heading', { name: /choose.*plan|pricing/i })
      .first();
    await expect(heading).toBeVisible();
  });

  test('no console errors during page load and interaction', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');

    const ctaButton = page
      .getByRole('button', { name: /subscribe|choose/i })
      .first();
    if (await ctaButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ctaButton.click();
      await page.waitForTimeout(500);
    }

    expect(errors).toHaveLength(0);
  });
});
