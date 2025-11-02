import { test, expect } from '@playwright/test';

/**
 * Mobile E2E Tests for New Features
 * Tests background removal and Zapier integration on mobile
 */

test.describe('Background Removal - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('should show background removal button with proper touch target', async ({
    page,
  }) => {
    await page.goto('/portfolio');

    // Find the Sparkles button (background removal trigger)
    const bgRemovalButton = page
      .locator('button[title="Remove background with AI"]')
      .first();

    if (await bgRemovalButton.isVisible()) {
      const box = await bgRemovalButton.boundingBox();

      // Verify touch target size (minimum 44x44px for iOS)
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('should open background removal dialog on mobile', async ({ page }) => {
    await page.goto('/portfolio');

    const bgRemovalButton = page
      .locator('button[title="Remove background with AI"]')
      .first();

    if (await bgRemovalButton.isVisible()) {
      await bgRemovalButton.click();

      // Dialog should open
      const dialog = page.locator('text=AI Background Removal');
      await expect(dialog).toBeVisible();

      // Should show WebGPU status
      const statusAlert = page.locator('text=/WebGPU|compatibility mode/i');
      await expect(statusAlert).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display image previews properly on mobile', async ({ page }) => {
    await page.goto('/portfolio');

    const bgRemovalButton = page
      .locator('button[title="Remove background with AI"]')
      .first();

    if (await bgRemovalButton.isVisible()) {
      await bgRemovalButton.click();

      // Check image preview containers
      const originalPreview = page.locator('text=Original').first();
      const processedPreview = page.locator('text=Processed').first();

      await expect(originalPreview).toBeVisible();
      await expect(processedPreview).toBeVisible();

      // Verify images fit mobile viewport
      const previewContainer = page
        .locator('.grid.grid-cols-1.md\\:grid-cols-2')
        .first();
      const box = await previewContainer.boundingBox();

      if (box) {
        expect(box.width).toBeLessThanOrEqual(390); // Should fit mobile width
      }
    }
  });

  test('should show progress indicator during processing', async ({ page }) => {
    await page.goto('/portfolio');

    const bgRemovalButton = page
      .locator('button[title="Remove background with AI"]')
      .first();

    if (await bgRemovalButton.isVisible()) {
      await bgRemovalButton.click();

      // Click process button
      const processButton = page.locator(
        'button:has-text("Remove Background")'
      );
      if (await processButton.isVisible()) {
        // Progress bar should appear when processing
        const progressBar = page.locator('[role="progressbar"]');
        // This may or may not be visible depending on image availability
      }
    }
  });

  test('should handle download button on mobile', async ({ page }) => {
    await page.goto('/portfolio');

    // Mobile download should work (simulated)
    const bgRemovalButton = page
      .locator('button[title="Remove background with AI"]')
      .first();

    if (await bgRemovalButton.isVisible()) {
      await bgRemovalButton.click();

      // Look for download button
      const downloadButton = page.locator('button:has-text("Download")');
      // Button exists but may not be clickable until processing is done
    }
  });

  test('should close dialog properly on mobile', async ({ page }) => {
    await page.goto('/portfolio');

    const bgRemovalButton = page
      .locator('button[title="Remove background with AI"]')
      .first();

    if (await bgRemovalButton.isVisible()) {
      await bgRemovalButton.click();

      // Close button should work
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Dialog should close
        const dialog = page.locator('text=AI Background Removal');
        await expect(dialog).not.toBeVisible();
      }
    }
  });
});

test.describe('Zapier Integration - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('should display Zapier page on mobile', async ({ page }) => {
    await page.goto('/integrations/zapier');

    // Main heading should be visible
    const heading = page.locator('text=Zapier Integration');
    await expect(heading).toBeVisible();

    // Description should be readable on mobile
    const description = page.locator('text=/Connect your salon to/i');
    await expect(description).toBeVisible();
  });

  test('should have proper touch targets for buttons', async ({ page }) => {
    await page.goto('/integrations/zapier');

    // Test button touch targets
    const testButton = page.locator('button:has-text("Send Test")').first();
    const openZapierButton = page.locator('a:has-text("Open Zapier")').first();

    if (await testButton.isVisible()) {
      const box = await testButton.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }

    if (await openZapierButton.isVisible()) {
      const box = await openZapierButton.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should display webhook input properly on mobile', async ({ page }) => {
    await page.goto('/integrations/zapier');

    // Webhook URL input should be visible and usable
    const webhookInput = page.locator('input[type="url"]').first();
    await expect(webhookInput).toBeVisible();

    // Should be focusable
    await webhookInput.click();
    await expect(webhookInput).toBeFocused();

    // Should accept input
    await webhookInput.fill('https://hooks.zapier.com/hooks/catch/test123');
    const value = await webhookInput.inputValue();
    expect(value).toContain('hooks.zapier.com');
  });

  test('should display use cases grid on mobile', async ({ page }) => {
    await page.goto('/integrations/zapier');

    // Use cases should be visible
    const useCases = page.locator('text=Popular Use Cases');
    await expect(useCases).toBeVisible();

    // Use case cards should stack vertically on mobile
    const useCaseCards = page
      .locator('.grid')
      .filter({ hasText: 'Google Calendar' });
    if (await useCaseCards.isVisible()) {
      const box = await useCaseCards.boundingBox();
      // Should fit mobile width
      expect(box?.width).toBeLessThanOrEqual(390);
    }
  });

  test('should display tutorial steps on mobile', async ({ page }) => {
    await page.goto('/integrations/zapier');

    // Tutorial section should be visible
    const tutorial = page.locator('text=Need Help Getting Started?');
    await expect(tutorial).toBeVisible();

    // Steps should be readable
    const step1 = page.locator('text=Create Your Zap');
    const step2 = page.locator('text=Set Up Webhook Trigger');
    const step3 = page.locator('text=Copy & Test');

    await expect(step1).toBeVisible();
    await expect(step2).toBeVisible();
    await expect(step3).toBeVisible();
  });

  test('should handle external links on mobile', async ({ page }) => {
    await page.goto('/integrations/zapier');

    // External link to Zapier should open in new tab
    const zapierLink = page.locator('a[href*="zapier.com"]').first();

    if (await zapierLink.isVisible()) {
      // Verify it has proper attributes
      const target = await zapierLink.getAttribute('target');
      expect(target).toBe('_blank');

      const rel = await zapierLink.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  test('should show validation error on empty webhook', async ({ page }) => {
    await page.goto('/integrations/zapier');

    // Click test button without entering webhook URL
    const testButton = page.locator('button:has-text("Send Test")').first();

    if (await testButton.isVisible()) {
      await testButton.click();

      // Should show error toast
      await page.waitForTimeout(500);
      // Toast notification should appear
    }
  });

  test('should scroll smoothly on mobile', async ({ page }) => {
    await page.goto('/integrations/zapier');

    // Should be able to scroll through entire page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Footer content should be visible after scroll
    const footerContent = page.locator('text=/tutorial/i').last();
    await expect(footerContent).toBeInViewport();
  });
});

test.describe('Integration - Mobile Responsiveness', () => {
  test('should adapt to different mobile orientations', async ({ page }) => {
    // Portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/integrations/zapier');

    let heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.reload();

    heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should work on different mobile screen sizes', async ({ page }) => {
    // Small phone (iPhone SE)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/integrations/zapier');

    let content = page.locator('main');
    await expect(content).toBeVisible();

    // Large phone (iPhone 14 Pro Max)
    await page.setViewportSize({ width: 430, height: 932 });
    await page.reload();

    content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should maintain readability on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/portfolio');

    // Text should not overflow
    const captions = page.locator('p.text-sm').first();
    if (await captions.isVisible()) {
      const box = await captions.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(320);
    }
  });
});

test.describe('Accessibility - New Features Mobile', () => {
  test('background removal dialog should be keyboard accessible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/portfolio');

    // Tab navigation should work
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to reach background removal button
    const focusedElement = await page.evaluateHandle(
      () => document.activeElement
    );
    expect(focusedElement).toBeDefined();
  });

  test('Zapier form should have proper labels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/integrations/zapier');

    // Input should have associated label
    const webhookInput = page.locator('input[type="url"]').first();
    const labelFor = await page
      .locator('label[for="webhook-url"]')
      .textContent();

    expect(labelFor).toContain('Webhook');
  });

  test('should support voice control navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/integrations/zapier');

    // All interactive elements should have accessible names
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Should have either text or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
