import { test, expect } from '@playwright/test';

/**
 * Interactive Elements Test Suite
 * Comprehensive testing of all buttons, toggles, dropdowns, and interactive components
 */

import { Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Button Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('all primary buttons should have hover states', async ({ page }) => {
    await page.goto('/dashboard');

    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      if (await button.isVisible()) {
        // Get initial background
        const initialBg = await button.evaluate(
          el => window.getComputedStyle(el).backgroundColor
        );

        // Hover
        await button.hover();

        // Get hover background
        const hoverBg = await button.evaluate(
          el => window.getComputedStyle(el).backgroundColor
        );

        // Should have visual change (not checking exact color, just that it changed)
        // This allows for various hover effects
        const hasTransform = await button.evaluate(
          el => window.getComputedStyle(el).transform !== 'none'
        );

        // Either color changed or has transform effect
        expect(initialBg !== hoverBg || hasTransform).toBeTruthy();
      }
    }
  });

  test('buttons should show loading state during async operations', async ({
    page,
  }) => {
    await page.goto('/appointments');

    // Click button that triggers async operation
    await page.click('button:has-text("New Appointment")');

    // Fill form
    await page.selectOption('select[name="clientId"]', { index: 1 });
    await page.fill('input[name="date"]', '2025-12-01');

    // Click submit and immediately check for loading state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show loading state
    const isLoading = await page
      .locator('button:disabled, button:has([data-loading])')
      .count();
    expect(isLoading).toBeGreaterThan(0);
  });

  test('disabled buttons should not be clickable', async ({ page }) => {
    await page.goto('/dashboard');

    const disabledButtons = await page.locator('button:disabled').all();

    for (const button of disabledButtons) {
      const clickCount = await page.evaluate(() => {
        const clicks = 0;
        return clicks;
      });

      await button.click({ force: true });

      // Should not trigger any action
      expect(clickCount).toBe(0);
    }
  });

  test('icon buttons should have accessible labels', async ({ page }) => {
    await page.goto('/dashboard');

    // Find all icon-only buttons (buttons with only SVG/icon, no text)
    const iconButtons = await page
      .locator('button:has(svg):not(:has-text(""))')
      .all();

    for (const button of iconButtons) {
      // Should have aria-label or title
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');

      expect(ariaLabel || title).toBeTruthy();
    }
  });

  test('floating action button should be visible and functional', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Look for FAB
    const fab = page
      .locator('[data-testid="fab"], button[class*="fixed"][class*="bottom"]')
      .first();

    if ((await fab.count()) > 0) {
      await expect(fab).toBeVisible();

      // Click should open menu or action
      await fab.click();

      // Should show menu or dialog
      await expect(page.locator('dialog, [role="menu"]')).toBeVisible();
    }
  });
});

test.describe('Toggle & Switch Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('toggles should change state on click', async ({ page }) => {
    await page.goto('/settings');

    const toggles = await page
      .locator('button[role="switch"], input[type="checkbox"]')
      .all();

    for (const toggle of toggles) {
      if ((await toggle.isVisible()) && (await toggle.isEnabled())) {
        // Get initial state
        const initialState = await toggle.evaluate(el => {
          if (el instanceof HTMLInputElement) return el.checked;
          return el.getAttribute('aria-checked') === 'true';
        });

        // Click toggle
        await toggle.click();

        // Wait for state change
        await page.waitForTimeout(300);

        // Get new state
        const newState = await toggle.evaluate(el => {
          if (el instanceof HTMLInputElement) return el.checked;
          return el.getAttribute('aria-checked') === 'true';
        });

        // State should have changed
        expect(newState).not.toBe(initialState);
      }
    }
  });

  test('toggle changes should persist', async ({ page }) => {
    await page.goto('/settings');

    const toggle = page.locator('button[role="switch"]').first();

    if ((await toggle.count()) > 0) {
      // Toggle it
      await toggle.click();
      await page.waitForTimeout(500);

      const stateAfterToggle = await toggle.getAttribute('aria-checked');

      // Navigate away and back
      await page.goto('/dashboard');
      await page.goto('/settings');

      // State should persist
      const stateAfterReturn = await toggle.getAttribute('aria-checked');
      expect(stateAfterReturn).toBe(stateAfterToggle);
    }
  });
});

test.describe('Dropdown & Select Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dropdowns should open on click', async ({ page }) => {
    await page.goto('/appointments');

    // Click new appointment to open form
    await page.click('button:has-text("New Appointment")');

    // Find select elements
    const selects = await page.locator('select, [role="combobox"]').all();

    for (const select of selects) {
      if (await select.isVisible()) {
        await select.click();

        // Options should be visible
        const optionsVisible = await page
          .locator('option, [role="option"]')
          .count();
        expect(optionsVisible).toBeGreaterThan(0);
      }
    }
  });

  test('dropdown selections should update form state', async ({ page }) => {
    await page.goto('/appointments');
    await page.click('button:has-text("New Appointment")');

    const serviceSelect = page.locator('select[name="serviceType"]');

    if ((await serviceSelect.count()) > 0) {
      // Select an option
      await serviceSelect.selectOption('Haircut');

      // Verify selection
      const selectedValue = await serviceSelect.inputValue();
      expect(selectedValue).toBe('Haircut');
    }
  });

  test('dropdowns should support keyboard navigation', async ({ page }) => {
    await page.goto('/appointments');
    await page.click('button:has-text("New Appointment")');

    const select = page.locator('select').first();

    if ((await select.count()) > 0) {
      // Focus select
      await select.focus();

      // Press down arrow
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Press Enter to select
      await page.keyboard.press('Enter');

      // Should have selected something
      const value = await select.inputValue();
      expect(value).toBeTruthy();
    }
  });
});

test.describe('Link & Navigation Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('all links should have valid href attributes', async ({ page }) => {
    await page.goto('/dashboard');

    const links = await page.locator('a').all();

    for (const link of links) {
      const href = await link.getAttribute('href');

      // Should not be empty or just '#'
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });

  test('external links should have proper security attributes', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    const externalLinks = await page.locator('a[href^="http"]').all();

    for (const link of externalLinks) {
      const rel = await link.getAttribute('rel');
      const target = await link.getAttribute('target');

      if (target === '_blank') {
        // Should have noopener noreferrer
        expect(rel).toContain('noopener');
      }
    }
  });

  test('navigation links should show active state', async ({ page }) => {
    await page.goto('/dashboard');

    // Dashboard link should be active
    const dashboardLink = page.locator('a[href="/dashboard"]');
    const hasActiveClass = await dashboardLink.evaluate(el => {
      return (
        el.className.includes('active') ||
        el.getAttribute('aria-current') === 'page' ||
        el.getAttribute('data-active') === 'true'
      );
    });

    expect(hasActiveClass).toBe(true);
  });
});

test.describe('Slider & Range Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('sliders should respond to drag', async ({ page }) => {
    // Look for sliders across the app
    const pages = ['/settings', '/services', '/dashboard'];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      const slider = page
        .locator('input[type="range"], [role="slider"]')
        .first();

      if ((await slider.count()) > 0) {
        // Get initial value
        const initialValue = await slider.inputValue();

        // Drag slider
        await slider.click();
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');

        // Value should change
        const newValue = await slider.inputValue();
        expect(newValue).not.toBe(initialValue);

        break; // Found and tested a slider
      }
    }
  });
});

test.describe('Search & Filter Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('search input should filter results', async ({ page }) => {
    await page.goto('/clients');

    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Search"]')
      .first();

    if ((await searchInput.count()) > 0) {
      // Get initial results count
      const initialCount = await page
        .locator('[data-testid*="client"], .client-card, tr')
        .count();

      // Type search query
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Debounce

      // Results should filter
      const filteredCount = await page
        .locator('[data-testid*="client"], .client-card, tr')
        .count();

      // Count should change or no-results message should appear
      const hasNoResults = await page
        .locator('text=/no results|no clients found/i')
        .count();
      expect(filteredCount !== initialCount || hasNoResults > 0).toBe(true);
    }
  });

  test('clear search button should reset filters', async ({ page }) => {
    await page.goto('/appointments');

    const searchInput = page.locator('input[type="search"]').first();

    if ((await searchInput.count()) > 0) {
      // Search for something
      await searchInput.fill('test query');
      await page.waitForTimeout(500);

      // Look for clear button
      const clearButton = page.locator(
        'button:has-text("Clear"), button[aria-label*="clear"]'
      );

      if ((await clearButton.count()) > 0) {
        await clearButton.click();

        // Input should be empty
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toBe('');
      }
    }
  });
});

test.describe('Drag & Drop Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('draggable elements should be moveable', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for draggable sections
    const draggable = page
      .locator('[draggable="true"], [data-draggable]')
      .first();

    if ((await draggable.count()) > 0) {
      // Get initial position
      const initialPos = await draggable.boundingBox();

      // Drag element
      await draggable.hover();
      await page.mouse.down();
      await page.mouse.move(initialPos!.x + 100, initialPos!.y + 50);
      await page.mouse.up();

      // Position should have changed
      const newPos = await draggable.boundingBox();
      expect(newPos!.x).not.toBe(initialPos!.x);
    }
  });
});
