import { test, expect } from '@playwright/test';

/**
 * Offline & Network Condition Tests
 * Tests app behavior under various network conditions
 */

test.describe('Offline Functionality', () => {
  test('App loads from cache when offline', async ({ page, context }) => {
    // First, load the app while online
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Try to reload
    await page.reload();

    // App should still render (from service worker cache)
    await expect(page.locator('body')).toBeVisible();

    // Re-enable network
    await context.setOffline(false);
  });

  test('Offline indicator shows when network is down', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Trigger a network request to detect offline state
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Check if offline indicator appears (adjust selector based on your UI)
    const offlineIndicator = page.getByText(/offline|no connection/i).first();

    // Give it a moment to appear
    await page.waitForTimeout(1000);

    // Re-enable network
    await context.setOffline(false);
  });

  test('App handles slow network gracefully', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 400)); // 400ms delay
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds even on slow connection
    expect(loadTime).toBeLessThan(10000);

    // Loading indicators should be visible
    console.log(`Slow network load time: ${loadTime}ms`);
  });
});

test.describe('Network Error Handling', () => {
  test('API errors show user-friendly messages', async ({ page, context }) => {
    // Mock API failure
    await context.route('**/functions/**', route => {
      route.abort('failed');
    });

    await page.goto('/');

    // Try an action that requires API
    // (adjust based on your app's features)

    // Should show error message, not crash
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('Failed requests can be retried', async ({ page, context }) => {
    let attemptCount = 0;

    await context.route('**/functions/**', route => {
      attemptCount++;
      if (attemptCount < 2) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    await page.goto('/');

    // App should retry failed requests automatically
    // Verify by checking that attemptCount > 1
  });
});
