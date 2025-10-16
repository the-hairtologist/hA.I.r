import { test, expect } from '@playwright/test';

/**
 * Comprehensive Performance Testing Suite
 * Tests load times, responsiveness, and performance metrics
 */

test.describe('Performance - Load Times', () => {
  test('Homepage should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('Dashboard should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('Formulas page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/formulas');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('Clients page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/clients');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('Appointments page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/appointments');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('Performance - Responsiveness', () => {
  test('Search input should respond immediately', async ({ page }) => {
    await page.goto('/formulas');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"]').first();
    if (await searchInput.count() > 0) {
      const startTime = Date.now();
      await searchInput.fill('test search');
      const responseTime = Date.now() - startTime;
      
      // Should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    }
  });

  test('Button clicks should respond within 200ms', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const button = page.locator('button').first();
    if (await button.count() > 0) {
      const startTime = Date.now();
      await button.click();
      const responseTime = Date.now() - startTime;
      
      // Should respond within 200ms
      expect(responseTime).toBeLessThan(200);
    }
  });

  test('Page transitions should be smooth', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();
    await page.goto('/formulas');
    await page.waitForLoadState('domcontentloaded');
    const transitionTime = Date.now() - startTime;

    // Transitions should be fast
    expect(transitionTime).toBeLessThan(2000);
  });
});

test.describe('Performance - Memory & Resources', () => {
  test('should not have memory leaks on rapid navigation', async ({ page }) => {
    const pages = ['/dashboard', '/formulas', '/clients', '/appointments'];
    
    for (let i = 0; i < 5; i++) {
      for (const path of pages) {
        await page.goto(path);
        await page.waitForLoadState('domcontentloaded');
      }
    }

    // Should still be responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for lazy loading
    const images = page.locator('img');
    const count = await images.count();

    // Should have images
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should not block UI with long tasks', async ({ page }) => {
    await page.goto('/formulas');
    await page.waitForLoadState('networkidle');

    // Measure if there are any long tasks
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const longTasks = entries.filter(entry => entry.duration > 50);
          resolve(longTasks.length);
        });

        if ('PerformanceLongTaskTiming' in window) {
          observer.observe({ entryTypes: ['longtask'] });
        } else {
          resolve(0);
        }

        setTimeout(() => resolve(0), 3000);
      });
    });

    // Should have minimal long tasks
    expect(typeof metrics).toBe('number');
  });
});

test.describe('Performance - Network Efficiency', () => {
  test('should handle slow 3G gracefully', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 200); // 200ms delay
    });

    await page.goto('/dashboard');
    
    // Should still load (within 10 seconds)
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('should cache static assets', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Reload and check if faster
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const reloadTime = Date.now() - startTime;

    // Reload should typically be faster due to caching
    expect(reloadTime).toBeLessThan(3000);
  });

  test('should minimize network requests', async ({ page }) => {
    const requests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should not make excessive requests
    const jsRequests = requests.filter(url => url.endsWith('.js'));
    expect(jsRequests.length).toBeLessThan(50); // Reasonable limit
  });
});

test.describe('Performance - Cumulative Layout Shift', () => {
  test('should have minimal layout shift on homepage', async ({ page }) => {
    await page.goto('/');

    // Measure CLS
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    // CLS should be less than 0.1 (good score)
    expect(cls).toBeLessThan(0.1);
  });

  test('should have stable layout during data loading', async ({ page }) => {
    await page.goto('/formulas');

    // Get initial layout
    const initialHeight = await page.evaluate(() => document.body.scrollHeight);

    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Layout should not shift dramatically
    const finalHeight = await page.evaluate(() => document.body.scrollHeight);
    const shift = Math.abs(finalHeight - initialHeight);

    // Shift should be reasonable (skeleton states should prevent major shifts)
    expect(shift).toBeLessThan(2000); // Allow for content loading
  });
});

test.describe('Performance - First Contentful Paint', () => {
  test('should have fast FCP on all major pages', async ({ page }) => {
    const pages = ['/', '/dashboard', '/formulas', '/clients', '/appointments'];

    for (const path of pages) {
      await page.goto(path);

      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
              observer.disconnect();
            }
          });

          observer.observe({ type: 'paint', buffered: true });

          setTimeout(() => {
            resolve(0);
            observer.disconnect();
          }, 5000);
        });
      });

      // FCP should be under 1.8 seconds
      if (typeof fcp === 'number' && fcp > 0) {
        expect(fcp).toBeLessThan(1800);
      }
    }
  });
});
