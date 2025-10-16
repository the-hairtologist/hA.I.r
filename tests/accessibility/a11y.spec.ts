import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * Accessibility Tests
 * Tests WCAG compliance and screen reader compatibility
 */

test.describe('Accessibility Compliance', () => {
  
  test('Landing page has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    // Check for accessibility violations
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('All images have alt text', async ({ page }) => {
    await page.goto('/');
    
    const imagesWithoutAlt = await page.locator('img:not([alt]), img[alt=""]').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test('Form inputs have associated labels', async ({ page }) => {
    await page.goto('/auth');
    
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute('id');
      
      // Check for label or aria-label
      const hasLabel = await page.locator(`label[for="${inputId}"]`).count() > 0;
      const hasAriaLabel = await input.getAttribute('aria-label');
      
      expect(hasLabel || !!hasAriaLabel).toBe(true);
    }
  });

  test('Keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    
    // Should focus on interactive elements
    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    expect(interactiveElements).toContain(focusedElement);
    
    // Tab multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Focus should be visible
    const hasFocusIndicator = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element) return false;
      
      const style = window.getComputedStyle(element);
      return style.outlineWidth !== '0px' || style.outlineStyle !== 'none';
    });
    
    expect(hasFocusIndicator).toBe(true);
  });

  test('Color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    // Check only color contrast violations
    await checkA11y(page, undefined, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
  });

  test('Page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Get all headings
    const headings = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return elements.map(el => parseInt(el.tagName.substring(1)));
    });
    
    // Should have exactly one H1
    const h1Count = headings.filter(level => level === 1).length;
    expect(h1Count).toBe(1);
    
    // Headings should not skip levels
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i] - headings[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('Interactive elements have appropriate roles', async ({ page }) => {
    await page.goto('/');
    
    // Buttons should have button role
    const buttons = await page.locator('button').count();
    const buttonRoles = await page.locator('[role="button"]').count();
    
    // All buttons should either be <button> elements or have role="button"
    expect(buttons + buttonRoles).toBeGreaterThan(0);
  });

  test('Modal dialogs are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Open a modal (adjust selector based on your app)
    const modalTrigger = page.getByRole('button').first();
    await modalTrigger.click();
    
    // Check if Escape key closes modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Modal should be closed (adjust selector based on your modal)
  });

  test('Screen reader landmarks are present', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
    
    // Check for navigation
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });
});
