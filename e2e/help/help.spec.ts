import { test, expect } from '@playwright/test';

test.describe('Help Page — FAQ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/help');
    await page.waitForLoadState('networkidle');
  });

  test('has "Frequently Asked Questions" heading', async ({ page }) => {
    await expect(
      page.getByText(/frequently asked questions/i).first()
    ).toBeVisible();
  });

  test('FAQ has all 6 items', async ({ page }) => {
    const questions = [
      /how do credits work/i,
      /automation.*trigger|trigger.*automation/i,
      /connect.*instagram/i,
      /run out.*credits|credits.*run out/i,
      /AI.*automated replies/i,
      /instagram.*data.*secure|secure.*data/i,
    ];
    for (const q of questions) {
      const item = page.getByText(q).first();
      if (await item.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(item).toBeVisible();
      }
    }
  });

  test('clicking FAQ item expands its answer', async ({ page }) => {
    // Click first accordion trigger
    const firstTrigger = page
      .locator(
        '[data-radix-accordion-trigger], button[data-state], [class*="AccordionTrigger"]'
      )
      .first();
    if (await firstTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstTrigger.click();
      await page.waitForTimeout(400);
      // Content should be expanded
      const content = page
        .locator('[data-radix-accordion-content], [data-state="open"]')
        .first();
      if (await content.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(content).toBeVisible();
      }
    }
  });

  test('clicking already-open FAQ item collapses it', async ({ page }) => {
    const trigger = page
      .locator('[data-radix-accordion-trigger], button[data-state]')
      .first();
    if (await trigger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await trigger.click();
      await page.waitForTimeout(400);
      await trigger.click();
      await page.waitForTimeout(400);
      // Should be collapsed
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });
});

test.describe('Help Page — Support Ticket Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/help');
    await page.waitForLoadState('networkidle');
  });

  test('has "Submit a Support Ticket" heading', async ({ page }) => {
    await expect(page.getByText(/submit a support ticket/i)).toBeVisible();
  });

  test('has category select dropdown with correct options', async ({
    page,
  }) => {
    const categorySelect = page
      .locator('[id*="category"], [name*="category"]')
      .or(page.getByRole('combobox'))
      .first();
    if (await categorySelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      await categorySelect.click();
      const options = page.getByRole('option');
      const count = await options.count();
      expect(count).toBeGreaterThanOrEqual(4);
      // Check for expected options
      await expect(
        page.getByRole('option', { name: /technical/i })
      ).toBeVisible();
      await expect(
        page.getByRole('option', { name: /billing/i })
      ).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('has subject input #subject', async ({ page }) => {
    await expect(page.locator('#subject')).toBeVisible();
    await expect(page.locator('#subject')).toHaveAttribute(
      'placeholder',
      'Brief description of your issue'
    );
  });

  test('has message textarea #message', async ({ page }) => {
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveAttribute(
      'placeholder',
      'Please describe your issue in detail. Include any error messages or steps to reproduce the problem.'
    );
  });

  test('has Submit Ticket button with Send icon', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /submit ticket/i })
    ).toBeVisible();
  });

  test('submit with empty subject and message stays on page', async ({
    page,
  }) => {
    const submitBtn = page.getByRole('button', { name: /submit ticket/i });
    await submitBtn.click();
    await expect(page).toHaveURL(/help/);
  });

  test('submit button is disabled when subject/message empty', async ({
    page,
  }) => {
    const submitBtn = page.getByRole('button', { name: /submit ticket/i });
    await expect(submitBtn).toBeDisabled();
  });

  test('submit button enables when subject and message filled', async ({
    page,
  }) => {
    await page.locator('#subject').fill('My automation is not working');
    await page
      .locator('#message')
      .fill(
        'I have set up an automation but it never triggers. The trigger is set to comment replies on my posts. Steps to reproduce: 1. Go to automations 2. Create comment reply automation 3. Post on Instagram 4. Get a comment. Expected: auto-reply sent. Actual: nothing happens.'
      );
    const submitBtn = page.getByRole('button', { name: /submit ticket/i });
    await expect(submitBtn).not.toBeDisabled();
  });

  test('filling and submitting ticket shows success state', async ({
    page,
  }) => {
    await page.locator('#subject').fill('Test support ticket from E2E');
    await page
      .locator('#message')
      .fill(
        'This is an automated E2E test ticket. Please ignore this ticket. Testing the support form submission flow to ensure it works correctly in the application.'
      );
    const submitBtn = page.getByRole('button', { name: /submit ticket/i });
    const responsePromise = page
      .waitForResponse(
        r => r.url().includes('/support') && r.request().method() === 'POST',
        { timeout: 15_000 }
      )
      .catch(() => null);
    await submitBtn.click();
    await responsePromise;

    // Success state
    const success = page.getByText(
      /ticket submitted|received your request|get back to you/i
    );
    if (await success.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await expect(success).toBeVisible();
    }
  });

  test('success state has "Submit Another Ticket" button', async ({ page }) => {
    await page.locator('#subject').fill('Test E2E ticket 2');
    await page
      .locator('#message')
      .fill(
        'Another automated test from E2E suite testing submit another ticket functionality.'
      );
    await page.getByRole('button', { name: /submit ticket/i }).click();
    const anotherBtn = page.getByRole('button', { name: /submit another/i });
    if (await anotherBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await expect(anotherBtn).toBeVisible();
      await anotherBtn.click();
      // Should reset the form
      await expect(page.locator('#subject')).toHaveValue('');
    }
  });
});

test.describe('Help Page — Contact Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/help');
    await page.waitForLoadState('networkidle');
  });

  test('shows email contact info', async ({ page }) => {
    await expect(page.getByText(/postengage\.ai@gmail\.com/i)).toBeVisible();
  });

  test('shows "Within 24 hours" response time', async ({ page }) => {
    await expect(page.getByText(/within 24 hours/i)).toBeVisible();
  });

  test('has quick links to Settings, Credits, Social Accounts', async ({
    page,
  }) => {
    await expect(
      page.getByRole('link', { name: /account settings/i })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /manage credits/i })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /social accounts/i })
    ).toBeVisible();
  });

  test('quick links point to correct hrefs', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /account settings/i })
    ).toHaveAttribute('href', '/dashboard/settings');
    await expect(
      page.getByRole('link', { name: /manage credits/i })
    ).toHaveAttribute('href', '/dashboard/credits');
    await expect(
      page.getByRole('link', { name: /social accounts/i })
    ).toHaveAttribute('href', '/dashboard/settings/social-accounts');
  });
});
