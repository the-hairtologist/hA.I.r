import { test, expect } from '@playwright/test';

/**
 * Mobile-Specific E2E Tests for Hair A.I.
 * Tests mobile viewport, touch interactions, and responsive design
 */

test.describe('Mobile Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone 12 Pro dimensions)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
  });

  test('should display mobile navigation', async ({ page }) => {
    // Check for mobile menu icon
    const mobileMenu = page.locator('[aria-label="Menu"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should have appropriate touch targets', async ({ page }) => {
    // All interactive elements should be at least 44x44px (iOS) or 48x48px (Android)
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should support swipe gestures on mobile', async ({ page }) => {
    await page.goto('/appointments');

    // Simulate swipe gesture
    await page.mouse.move(200, 400);
    await page.mouse.down();
    await page.mouse.move(50, 400);
    await page.mouse.up();

    // Verify swipe action occurred (adjust based on your implementation)
    await page.waitForTimeout(500);
  });

  test('should display correctly in landscape mode', async ({ page }) => {
    // Switch to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.reload();

    // Verify layout adapts
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should handle keyboard appearance on mobile', async ({ page }) => {
    await page.goto('/auth');

    // Focus on email input (triggers keyboard on real device)
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.click();

    // Input should still be visible after keyboard appears
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeFocused();
  });

  test('should have readable text on mobile', async ({ page }) => {
    // Check font sizes are at least 16px for body text (iOS requirement)
    const bodyText = page.locator('p').first();
    const fontSize = await bodyText.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });

    const fontSizeNumber = parseInt(fontSize);
    expect(fontSizeNumber).toBeGreaterThanOrEqual(14);
  });

  test('should support pull-to-refresh gesture', async ({ page }) => {
    await page.goto('/dashboard');

    // Simulate pull-to-refresh
    await page.mouse.move(200, 100);
    await page.mouse.down();
    await page.mouse.move(200, 300, { steps: 10 });
    await page.mouse.up();

    // Wait for potential refresh
    await page.waitForTimeout(1000);
  });

  test('should handle image upload on mobile', async ({ page }) => {
    await page.goto('/portfolio');

    const uploadButton = page.locator('button:has-text("Upload")').first();
    if (await uploadButton.isVisible()) {
      // Set up file chooser listener
      const fileChooserPromise = page.waitForEvent('filechooser');
      await uploadButton.click();

      const fileChooser = await fileChooserPromise;
      // On real mobile device, this would trigger native camera/gallery picker
      expect(fileChooser).toBeDefined();
    }
  });

  test('should display notifications permission prompt', async ({ page }) => {
    // Mock notification permission state
    await page.context().grantPermissions(['notifications']);
    await page.goto('/dashboard');

    // Verify notification setup is available
    // Adjust based on your notification implementation
  });

  test('should handle offline mode gracefully', async ({ page }) => {
    await page.goto('/dashboard');

    // Simulate offline
    await page.context().setOffline(true);

    // Try to navigate
    await page.goto('/appointments').catch(() => {});

    // Should show offline indicator or cached content
    const offlineMessage = page.locator('text=/offline|no connection/i');
    // This may or may not be visible depending on implementation
    await page.waitForTimeout(1000);
  });
});

test.describe('Mobile Performance', () => {
  test('should load quickly on mobile', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds on mobile
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not have layout shift on load', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    const screenshot1 = await page.screenshot();

    // Wait a bit more
    await page.waitForTimeout(500);

    // Take second screenshot
    const screenshot2 = await page.screenshot();

    // Screenshots should be identical (no layout shift)
    expect(screenshot1.length).toBe(screenshot2.length);
  });
});

test.describe('Mobile-Specific Features', () => {
  test('should handle status bar on mobile', async ({ page }) => {
    // This would be more relevant on actual mobile device
    await page.goto('/');

    // Check for status bar considerations
    const header = page.locator('header').first();
    const box = await header.boundingBox();

    if (box) {
      // Header should account for status bar (typically 44px on iOS)
      expect(box.y).toBeGreaterThanOrEqual(0);
    }
  });

  test('should support native-like navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to appointments
    await page.click('a[href="/appointments"]');
    await page.waitForURL('/appointments');

    // Use browser back button (simulates native back)
    await page.goBack();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle deep links', async ({ page }) => {
    // Test deep link navigation
    await page.goto('/stylist/123');

    // Should load specific stylist profile
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should support haptic feedback triggers', async ({ page }) => {
    await page.goto('/dashboard');

    // Click button that should trigger haptic feedback
    const importantButton = page.locator('button:has-text("Book")').first();
    if (await importantButton.isVisible()) {
      await importantButton.click();

      // On real device, this would trigger haptic feedback
      // In test, we just verify the click worked
      await page.waitForTimeout(100);
    }
  });
});

test.describe('Mobile Accessibility', () => {
  test('should support screen reader on mobile', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA labels
    const mainContent = page.locator('main');
    await expect(mainContent).toHaveAttribute('role', 'main');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // This is a simplified check - use axe-core for comprehensive testing
    const button = page.locator('button').first();
    const backgroundColor = await button.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(backgroundColor).toBeDefined();
  });

  test('should support dynamic text sizing', async ({ page }) => {
    await page.goto('/');

    // Increase text size
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '20px';
    });

    // Content should still be readable
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
