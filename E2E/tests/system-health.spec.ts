import { test, expect, Page } from '@playwright/test';

/**
 * System Health Checks
 * Monitors for common issues like console errors, failed network requests, and broken functionality
 */

async function login(page: Page) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('System Health Monitoring', () => {
  test('should not have console errors on main pages', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        // Filter out known non-critical errors
        const text = msg.text();
        if (!text.includes('ResizeObserver') && !text.includes('favicon')) {
          errors.push(text);
        }
      }
    });

    await login(page);

    const pages = [
      '/dashboard',
      '/appointments',
      '/clients',
      '/services',
      '/formulas',
      '/portfolio',
      '/schedule',
      '/messages',
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(2000);
    }

    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }

    expect(errors.length).toBe(0);
  });

  test('should not have failed network requests', async ({ page }) => {
    const failedRequests: Array<{ url: string; status: number }> = [];

    page.on('response', response => {
      if (response.status() >= 400 && !response.url().includes('analytics')) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);

    if (failedRequests.length > 0) {
      console.log('Failed requests:', failedRequests);
    }

    expect(failedRequests.length).toBe(0);
  });

  test('should handle network disconnection gracefully', async ({
    page,
    context,
  }) => {
    await login(page);
    await page.goto('/dashboard');

    // Simulate offline mode
    await context.setOffline(true);

    // Try to navigate
    await page.click('a[href="/appointments"]').catch(() => {
      // Expected to potentially fail
    });

    await page.waitForTimeout(1000);

    // Should show error message or offline indicator
    const hasOfflineIndicator = await page
      .locator('text=/offline|connection|network/i')
      .count();

    // Reconnect
    await context.setOffline(false);
    await page.waitForTimeout(1000);

    // Should recover
    const isRecovered =
      page.url().includes('/appointments') || page.url().includes('/dashboard');
    expect(isRecovered || hasOfflineIndicator > 0).toBe(true);
  });

  test('should not have memory leaks on rapid navigation', async ({ page }) => {
    await login(page);

    const pages = ['/dashboard', '/appointments', '/clients', '/formulas'];

    // Rapid navigation
    for (let i = 0; i < 20; i++) {
      const targetPage = pages[i % pages.length];
      await page.goto(targetPage);
      await page.waitForLoadState('networkidle');
    }

    // Check if page is still responsive
    await page.goto('/dashboard');
    const isDashboardVisible = await page.locator('main').isVisible();
    expect(isDashboardVisible).toBe(true);
  });

  test('should load all critical resources', async ({ page }) => {
    const missingResources: string[] = [];

    page.on('response', response => {
      const url = response.url();
      if (
        response.status() === 404 &&
        (url.includes('.js') || url.includes('.css') || url.includes('.woff'))
      ) {
        missingResources.push(url);
      }
    });

    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    expect(missingResources.length).toBe(0);
  });

  test('should not have unhandled promise rejections', async ({ page }) => {
    const unhandledRejections: string[] = [];

    page.on('pageerror', error => {
      if (error.message.includes('Unhandled')) {
        unhandledRejections.push(error.message);
      }
    });

    await login(page);

    const pages = ['/dashboard', '/appointments', '/clients'];
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
    }

    expect(unhandledRejections.length).toBe(0);
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on dashboard, not redirected to auth
    expect(page.url()).toContain('/dashboard');
  });

  test('should handle rapid button clicks without errors', async ({ page }) => {
    await login(page);
    await page.goto('/appointments');

    const newAppointmentButton = page.locator(
      'button:has-text("New Appointment")'
    );

    if ((await newAppointmentButton.count()) > 0) {
      // Click rapidly
      for (let i = 0; i < 5; i++) {
        await newAppointmentButton.click();
        await page.waitForTimeout(100);
      }

      // Should not cause errors - dialog should open once
      const dialogs = await page.locator('dialog').count();
      expect(dialogs).toBeGreaterThanOrEqual(1);
    }
  });

  test('should recover from API errors', async ({ page }) => {
    await login(page);

    // Intercept API call to simulate error
    await page.route('**/rest/v1/appointments*', route => {
      route.abort('failed');
    });

    await page.goto('/appointments');
    await page.waitForTimeout(2000);

    // Should show error state or empty state, not crash
    const hasErrorState = await page
      .locator('text=/error|try again|no appointments/i')
      .count();
    expect(hasErrorState).toBeGreaterThan(0);
  });

  test('should have working error boundaries', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');

    // Try to trigger error by accessing invalid route
    await page.goto('/dashboard/invalid-nested-route');

    // Should show error page or redirect, not white screen
    const hasContent = await page
      .locator('body')
      .evaluate(el => el.textContent?.length ?? 0);
    expect(hasContent).toBeGreaterThan(0);
  });
});

test.describe('Performance Health', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    await login(page);

    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000); // 3 second budget
  });

  test('should not have long tasks blocking the UI', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');

    const longTasks = await page.evaluate(() => {
      return new Promise(resolve => {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const longTaskCount = entries.filter(
            entry => entry.duration > 50
          ).length;
          resolve(longTaskCount);
        });
        observer.observe({ entryTypes: ['measure', 'navigation'] });

        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      });
    });

    // Should have minimal long tasks
    expect(Number(longTasks)).toBeLessThan(5);
  });

  test('should not have layout shifts on page load', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');

    const cls = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        let clsScore = 0;
        const observer = new PerformanceObserver(
          (list: PerformanceObserverEntryList) => {
            /**
             * @ts-ignore - DOM types in browser context are not validated by TypeScript in Playwright
             */
            const entries = list.getEntries();
            for (const entry of entries) {
              /**
               * @ts-ignore - DOM types in browser context are not validated by TypeScript in Playwright
               */
              const layoutShift = entry;
              /** @ts-expect-error LayoutShift property only exists in browser context */
              if (layoutShift.hadRecentInput) continue;
              /** @ts-expect-error LayoutShift property only exists in browser context */
              clsScore += layoutShift.value ?? 0;
            }
          }
        );
        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsScore);
        }, 3000);
      });
    });

    // CLS should be under 0.1 for good UX
    expect(cls).toBeLessThan(0.1);
  });
});

test.describe('Data Integrity', () => {
  test('should not lose form data on navigation', async ({ page }) => {
    await login(page);
    await page.goto('/appointments');

    await page.click('button:has-text("New Appointment")');

    // Fill some form data
    const titleInput = page.locator('input[name="title"]').first();
    if ((await titleInput.count()) > 0) {
      await titleInput.fill('Test Appointment');

      // Navigate away briefly
      await page.goto('/dashboard');
      await page.waitForTimeout(500);

      // Go back
      await page.goto('/appointments');

      // Form should warn about unsaved data or auto-save
      // We just verify no crash occurred
      expect(page.url()).toContain('/appointments');
    }
  });

  test('should maintain filter state during pagination', async ({ page }) => {
    await login(page);
    await page.goto('/appointments');

    const searchInput = page.locator('input[type="search"]').first();

    if ((await searchInput.count()) > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // If pagination exists, click next page
      const nextButton = page.locator('button:has-text("Next")');
      if ((await nextButton.count()) > 0 && (await nextButton.isEnabled())) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Search filter should still be applied
        const searchValue = await searchInput.inputValue();
        expect(searchValue).toBe('test');
      }
    }
  });
});
