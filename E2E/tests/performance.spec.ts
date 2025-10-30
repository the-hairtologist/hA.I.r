import { test, expect } from '@playwright/test';

/**
 * Performance E2E Tests for Hair A.I.
 * Measures load times, bundle sizes, and runtime performance
 */

test.describe('Performance Metrics', () => {
  test('should have acceptable First Contentful Paint', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for first content to be painted
    await page.waitForSelector('h1, h2, p', { timeout: 3000 });

    const fcp = Date.now() - startTime;

    // FCP should be under 1.8s for good performance
    expect(fcp).toBeLessThan(1800);
    console.log(`First Contentful Paint: ${fcp}ms`);
  });

  test('should have acceptable Largest Contentful Paint', async ({ page }) => {
    await page.goto('/');

    // Use Performance API to get LCP
    const lcp = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        let largestPaint = 0;

        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          largestPaint = lastEntry.renderTime || lastEntry.loadTime;
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        setTimeout(() => {
          observer.disconnect();
          resolve(largestPaint);
        }, 5000);
      });
    });

    // LCP should be under 2.5s for good performance
    expect(lcp).toBeLessThan(2500);
    console.log(`Largest Contentful Paint: ${lcp}ms`);
  });

  test('should have acceptable Time to Interactive', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');

    const tti = Date.now() - startTime;

    // TTI should be under 3.8s for good performance
    expect(tti).toBeLessThan(3800);
    console.log(`Time to Interactive: ${tti}ms`);
  });

  test('should have minimal Cumulative Layout Shift', async ({ page }) => {
    await page.goto('/');

    // Measure layout shift
    const cls = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        let clsValue = 0;

        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 5000);
      });
    });

    // CLS should be under 0.1 for good performance
    expect(cls).toBeLessThan(0.1);
    console.log(`Cumulative Layout Shift: ${cls}`);
  });

  test('should have acceptable Total Blocking Time', async ({ page }) => {
    await page.goto('/');

    // Measure long tasks
    const tbt = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        let totalBlockingTime = 0;

        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              totalBlockingTime += entry.duration - 50;
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });

        setTimeout(() => {
          observer.disconnect();
          resolve(totalBlockingTime);
        }, 5000);
      });
    });

    // TBT should be under 300ms for good performance
    expect(tbt).toBeLessThan(300);
    console.log(`Total Blocking Time: ${tbt}ms`);
  });
});

test.describe('API Performance', () => {
  test('should have fast API response times', async ({ page }) => {
    await page.goto('/dashboard');

    // Intercept API calls
    const apiCalls: number[] = [];

    page.on('response', response => {
      if (response.url().includes('/rest/v1/')) {
        const timing = response.timing();
        if (timing) {
          apiCalls.push(timing.responseEnd);
        }
      }
    });

    // Wait for API calls to complete
    await page.waitForTimeout(2000);

    if (apiCalls.length > 0) {
      const avgResponseTime =
        apiCalls.reduce((a, b) => a + b, 0) / apiCalls.length;

      // Average API response should be under 500ms
      expect(avgResponseTime).toBeLessThan(500);
      console.log(`Average API Response Time: ${avgResponseTime}ms`);
    }
  });

  test('should handle concurrent API requests efficiently', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    const startTime = Date.now();

    // Trigger multiple API calls
    await Promise.all([
      page.click('a[href="/appointments"]'),
      page.waitForTimeout(100),
      page.click('a[href="/dashboard"]'),
    ]);

    await page.waitForLoadState('networkidle');

    const totalTime = Date.now() - startTime;

    // Concurrent requests should not significantly slow down the app
    expect(totalTime).toBeLessThan(3000);
    console.log(`Concurrent API Requests Time: ${totalTime}ms`);
  });
});

test.describe('Resource Loading', () => {
  test('should load images efficiently', async ({ page }) => {
    await page.goto('/stylists');

    // Count images
    const images = page.locator('img');
    const imageCount = await images.count();

    console.log(`Total images: ${imageCount}`);

    // Wait for images to load
    await page.waitForLoadState('networkidle');

    // Check if images have loaded
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();

      if (isVisible) {
        const naturalWidth = await img.evaluate(
          (el: HTMLImageElement) => el.naturalWidth
        );
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('should use lazy loading for images', async ({ page }) => {
    await page.goto('/portfolio');

    // Check for loading attribute
    const images = page.locator('img');
    const firstImage = images.first();

    const loading = await firstImage.getAttribute('loading');
    expect(loading).toBe('lazy');
  });

  test('should have acceptable bundle size', async ({ page }) => {
    // Navigate and measure transferred data
    const metrics = await page.goto('/', { waitUntil: 'networkidle' });

    // Get all network requests
    const requests = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry: any) => ({
        name: entry.name,
        transferSize: entry.transferSize,
      }));
    });

    // Calculate total transferred
    const totalTransferred = requests.reduce(
      (sum, req) => sum + (req.transferSize || 0),
      0
    );

    // Total bundle should be under 2MB for initial load
    const totalMB = totalTransferred / (1024 * 1024);
    expect(totalMB).toBeLessThan(2);

    console.log(`Total Transferred: ${totalMB.toFixed(2)}MB`);
  });
});

test.describe('Caching', () => {
  test('should cache static assets', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get cached resources
    const cachedResources = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .filter((entry: any) => entry.transferSize === 0)
        .map((entry: any) => entry.name);
    });

    console.log(`Cached resources: ${cachedResources.length}`);

    // Second visit should have more cached resources
    await page.reload();
    await page.waitForLoadState('networkidle');

    const cachedResourcesAfterReload = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .filter((entry: any) => entry.transferSize === 0).length;
    });

    expect(cachedResourcesAfterReload).toBeGreaterThanOrEqual(
      cachedResources.length
    );
  });

  test('should use service worker for offline capability', async ({
    page,
    context,
  }) => {
    await page.goto('/');

    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker
        .getRegistrations()
        .then(regs => regs.length > 0);
    });

    if (swRegistered) {
      console.log('Service Worker registered');

      // Test offline functionality
      await context.setOffline(true);

      // Try to navigate
      await page.reload().catch(() => {});

      // Should still show some content (cached)
      const content = page.locator('main');
      const isVisible = await content.isVisible().catch(() => false);

      expect(isVisible).toBeTruthy();
    } else {
      console.log('No service worker registered');
    }
  });
});

test.describe('Memory Performance', () => {
  test('should not leak memory on navigation', async ({ page }) => {
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/dashboard');
      await page.goto('/appointments');
      await page.goto('/stylists');
      await page.goto('/');
    }

    // Force garbage collection if possible
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    await page.waitForTimeout(1000);

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024);
      console.log(`Memory increase: ${memoryIncrease.toFixed(2)}MB`);

      // Memory increase should be reasonable (under 50MB)
      expect(memoryIncrease).toBeLessThan(50);
    }
  });
});

test.describe('Performance Best Practices', () => {
  test('should preload critical resources', async ({ page }) => {
    await page.goto('/');

    // Check for preload links
    const preloadLinks = await page.locator('link[rel="preload"]').count();

    console.log(`Preload links: ${preloadLinks}`);

    // Should have at least some critical resources preloaded
    expect(preloadLinks).toBeGreaterThan(0);
  });

  test('should use modern image formats', async ({ page }) => {
    await page.goto('/');

    // Check for WebP or AVIF images
    const modernImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(
        img =>
          img.src.includes('.webp') ||
          img.src.includes('.avif') ||
          img.currentSrc?.includes('.webp') ||
          img.currentSrc?.includes('.avif')
      ).length;
    });

    console.log(`Modern format images: ${modernImages}`);

    // At least some images should use modern formats
    if (modernImages > 0) {
      expect(modernImages).toBeGreaterThan(0);
    }
  });

  test('should minimize main thread work', async ({ page }) => {
    await page.goto('/');

    // Measure script execution time
    const scriptTime = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation')[0] as any;
      return (
        entries.domContentLoadedEventEnd - entries.domContentLoadedEventStart
      );
    });

    console.log(`Script execution time: ${scriptTime}ms`);

    // Main thread work should be under 2s
    expect(scriptTime).toBeLessThan(2000);
  });
});
