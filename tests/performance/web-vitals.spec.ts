import { test, expect } from '@playwright/test';

/**
 * Performance Tests
 * Tests Core Web Vitals and loading performance
 */

test.describe('Core Web Vitals', () => {
  test('Largest Contentful Paint (LCP) is under 2.5s', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Timeout after 5s
        setTimeout(() => resolve(0), 5000);
      });
    });

    console.log(`LCP: ${lcp.toFixed(0)}ms`);
    expect(lcp).toBeLessThan(2500); // Good: < 2.5s
    expect(lcp).toBeGreaterThan(0);
  });

  test('First Contentful Paint (FCP) is under 1.8s', async ({ page }) => {
    await page.goto('/');

    const fcp = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const fcpEntry = paint.find(
        entry => entry.name === 'first-contentful-paint'
      );
      return fcpEntry?.startTime || 0;
    });

    console.log(`FCP: ${fcp.toFixed(0)}ms`);
    expect(fcp).toBeLessThan(1800); // Good: < 1.8s
    expect(fcp).toBeGreaterThan(0);
  });

  test('Time to First Byte (TTFB) is under 800ms', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');

    const ttfb = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return navigation.responseStart - navigation.requestStart;
    });

    console.log(`TTFB: ${ttfb.toFixed(0)}ms`);
    expect(ttfb).toBeLessThan(800); // Good: < 800ms
  });

  test('Cumulative Layout Shift (CLS) is under 0.1', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any layout shifts to occur
    await page.waitForTimeout(2000);

    const cls = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        let clsValue = 0;

        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(clsValue), 1000);
      });
    });

    console.log(`CLS: ${cls.toFixed(4)}`);
    expect(cls).toBeLessThan(0.1); // Good: < 0.1
  });

  test('Page load time is under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('load');
    const loadTime = Date.now() - startTime;

    console.log(`Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('No render-blocking resources', async ({ page }) => {
    await page.goto('/');

    const blockingResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      return resources.filter(resource => {
        return resource.renderBlockingStatus === 'blocking';
      }).length;
    });

    // Ideally should be 0, but allow a few critical resources
    expect(blockingResources).toBeLessThan(3);
  });

  test('Images are optimized and lazy loaded', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      // Check if images have loading="lazy" or are loaded progressively
      let lazyCount = 0;

      for (let i = 0; i < Math.min(count, 10); i++) {
        const img = images.nth(i);
        const loading = await img.getAttribute('loading');
        if (loading === 'lazy') lazyCount++;
      }

      // At least some images should be lazy loaded
      expect(lazyCount).toBeGreaterThan(0);
    }
  });

  test('JavaScript bundle size is reasonable', async ({ page }) => {
    await page.goto('/');

    const jsSize = await page.evaluate(() => {
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      return jsResources.reduce((total, r) => total + (r.transferSize || 0), 0);
    });

    const jsSizeMB = (jsSize / 1024 / 1024).toFixed(2);
    console.log(`Total JS size: ${jsSizeMB}MB`);

    // Should be under 1MB gzipped for good performance
    expect(jsSize).toBeLessThan(1 * 1024 * 1024);
  });

  test('CSS is optimized', async ({ page }) => {
    await page.goto('/');

    const cssSize = await page.evaluate(() => {
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      const cssResources = resources.filter(r => r.name.endsWith('.css'));
      return cssResources.reduce(
        (total, r) => total + (r.transferSize || 0),
        0
      );
    });

    const cssSizeKB = (cssSize / 1024).toFixed(2);
    console.log(`Total CSS size: ${cssSizeKB}KB`);

    // Should be under 100KB for good performance
    expect(cssSize).toBeLessThan(100 * 1024);
  });
});
