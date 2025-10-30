import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have accessibility violations on auth page', async ({
    page,
  }) => {
    await page.goto('/auth');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on dashboard', async ({
    page,
  }) => {
    // Login first
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#toast-container') // Exclude toast notifications
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check that headings don't skip levels
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const level = parseInt(tagName.substring(1));

      if (previousLevel > 0) {
        expect(level - previousLevel).toBeLessThanOrEqual(1);
      }
      previousLevel = level;
    }
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
      expect(alt?.trim()).not.toBe('');
    }
  });

  test('all buttons should have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();

      // Button should have either aria-label or visible text
      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
  });

  test('focus indicators should be visible', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.getByLabel(/email/i);
    await emailInput.focus();

    // Check for focus ring
    const outlineWidth = await emailInput.evaluate(el =>
      window.getComputedStyle(el).getPropertyValue('outline-width')
    );

    expect(outlineWidth).not.toBe('0px');
  });

  test('dialog should trap focus', async ({ page }) => {
    await page.goto('/dashboard');

    // Open a dialog
    await page.getByRole('button', { name: /new appointment/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Get all focusable elements in dialog
    const focusableElements = await dialog
      .locator(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      .all();

    expect(focusableElements.length).toBeGreaterThan(0);

    // Tab through all elements
    for (let i = 0; i < focusableElements.length + 1; i++) {
      await page.keyboard.press('Tab');
    }

    // Focus should have wrapped back to first element
    const activeElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(activeElement);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/auth');

    // Tab to email input
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email/i)).toBeFocused();

    // Fill with keyboard
    await page.keyboard.type('test@example.com');

    // Tab to password
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/password/i)).toBeFocused();

    await page.keyboard.type('password123');

    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused();

    // Submit with Enter
    await page.keyboard.press('Enter');
  });

  test('should have minimum tap target sizes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const buttons = await page.locator('button, a').all();

    for (const button of buttons) {
      const box = await button.boundingBox();

      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44); // Minimum 44px height
        expect(box.width).toBeGreaterThanOrEqual(44); // Minimum 44px width
      }
    }
  });

  test('should have adequate color contrast', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
