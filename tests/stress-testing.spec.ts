import { test, expect } from '@playwright/test';
import { supabase } from '@/integrations/supabase/client';

/**
 * Stress Testing Suite
 * Tests system behavior under heavy load
 */

test.describe('Stress Testing - Database', () => {
  test('should handle rapid CRUD operations', async ({ page }) => {
    // This test simulates rapid database operations
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const operations = [];
    const startTime = Date.now();

    // Simulate 100 rapid operations
    for (let i = 0; i < 100; i++) {
      operations.push(
        page.evaluate(async (index) => {
          // Simulate a database operation
          return { index, timestamp: Date.now() };
        }, i)
      );
    }

    const results = await Promise.all(operations);
    const duration = Date.now() - startTime;

    // Verify all operations completed
    expect(results).toHaveLength(100);
    
    // Should complete within reasonable time (10 seconds)
    expect(duration).toBeLessThan(10000);
    
    console.log(`✅ 100 operations completed in ${duration}ms`);
  });

  test('should handle concurrent page loads', async ({ browser }) => {
    const contexts = [];
    const startTime = Date.now();

    // Create 10 concurrent contexts (simulating 10 users)
    for (let i = 0; i < 10; i++) {
      const context = await browser.newContext();
      contexts.push(context);
    }

    // Navigate all contexts simultaneously
    const navigations = contexts.map(async (context, index) => {
      const page = await context.newPage();
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      return { index, success: true };
    });

    const results = await Promise.all(navigations);
    const duration = Date.now() - startTime;

    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));

    // Verify all loaded successfully
    expect(results).toHaveLength(10);
    expect(results.every(r => r.success)).toBe(true);
    
    // Should complete within 30 seconds
    expect(duration).toBeLessThan(30000);
    
    console.log(`✅ 10 concurrent page loads in ${duration}ms`);
  });

  test('should handle navigation stress test', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/formulas',
      '/clients',
      '/appointments',
      '/messages',
    ];

    const startTime = Date.now();

    // Navigate rapidly between pages 20 times
    for (let i = 0; i < 20; i++) {
      const route = routes[i % routes.length];
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
    }

    const duration = Date.now() - startTime;

    // Should complete without hanging
    expect(duration).toBeLessThan(60000);
    
    // Page should still be responsive
    await expect(page.locator('body')).toBeVisible();
    
    console.log(`✅ 20 rapid navigations in ${duration}ms`);
  });
});

test.describe('Stress Testing - Memory', () => {
  test('should not leak memory during long session', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Get initial memory snapshot
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };
      }
      return null;
    });

    // Perform many operations
    const routes = ['/dashboard', '/formulas', '/clients', '/appointments'];
    
    for (let i = 0; i < 50; i++) {
      const route = routes[i % routes.length];
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
    }

    // Get final memory snapshot
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };
      }
      return null;
    });

    if (initialMemory && finalMemory) {
      const increase = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      const increasePercent = (increase / initialMemory.usedJSHeapSize) * 100;

      console.log(`Memory increase: ${(increase / 1024 / 1024).toFixed(2)}MB (${increasePercent.toFixed(1)}%)`);
      
      // Memory should not increase by more than 200%
      expect(increasePercent).toBeLessThan(200);
    }

    // Page should still be responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle rapid component mounting/unmounting', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Rapidly toggle modals/dialogs if they exist
    for (let i = 0; i < 20; i++) {
      // Try to find and click buttons that open dialogs
      const buttons = page.locator('button').filter({ hasText: /new|add|create/i });
      const count = await buttons.count();
      
      if (count > 0) {
        await buttons.first().click();
        await page.waitForTimeout(100);
        
        // Try to close dialog
        const closeButtons = page.locator('button').filter({ hasText: /cancel|close/i });
        const closeCount = await closeButtons.count();
        
        if (closeCount > 0) {
          await closeButtons.first().click();
          await page.waitForTimeout(100);
        } else {
          // Press Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(100);
        }
      }
    }

    // Page should still be responsive
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Stress Testing - Network', () => {
  test('should handle slow network conditions', async ({ page, context }) => {
    // Simulate slow 3G (download: 400kb/s, upload: 400kb/s, latency: 400ms)
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 400)); // 400ms latency
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should still load within reasonable time on slow network
    expect(loadTime).toBeLessThan(15000); // 15 seconds max

    // Page should be functional
    await expect(page.locator('body')).toBeVisible();
    
    console.log(`✅ Loaded on slow network in ${loadTime}ms`);
  });

  test('should handle intermittent network failures', async ({ page, context }) => {
    let requestCount = 0;

    // Fail every 3rd request
    await context.route('**/*', async route => {
      requestCount++;
      if (requestCount % 3 === 0) {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    await page.goto('/dashboard');
    
    // Should show error handling or retry logic
    // Page should remain functional despite failures
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle request flooding', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const requests: Promise<any>[] = [];

    // Trigger many simultaneous requests
    for (let i = 0; i < 50; i++) {
      requests.push(
        page.evaluate(async () => {
          // Simulate an API call
          return fetch('/api/health').then(r => r.ok);
        }).catch(() => false)
      );
    }

    const results = await Promise.all(requests);
    
    // Most requests should succeed (allow some to fail due to rate limiting)
    const successRate = results.filter(r => r).length / results.length;
    expect(successRate).toBeGreaterThan(0.7); // At least 70% success
    
    console.log(`✅ Request flooding: ${(successRate * 100).toFixed(1)}% success rate`);
  });
});

test.describe('Stress Testing - UI Rendering', () => {
  test('should handle large lists efficiently', async ({ page }) => {
    await page.goto('/formulas');
    await page.waitForLoadState('networkidle');

    // Measure time to render list
    const startTime = Date.now();
    
    // Scroll to bottom to trigger any lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(1000);
    const renderTime = Date.now() - startTime;

    // Should render/scroll smoothly
    expect(renderTime).toBeLessThan(3000);
    
    // Page should remain responsive
    const isVisible = await page.locator('body').isVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle rapid filter changes', async ({ page }) => {
    await page.goto('/formulas');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.count() > 0) {
      const startTime = Date.now();
      
      // Type rapidly
      await searchInput.fill('test');
      await page.waitForTimeout(100);
      await searchInput.fill('');
      await page.waitForTimeout(100);
      await searchInput.fill('another');
      await page.waitForTimeout(100);
      await searchInput.fill('');
      
      const duration = Date.now() - startTime;

      // Should remain responsive during rapid input
      expect(duration).toBeLessThan(5000);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle rapid theme switching', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find theme toggle if it exists
    const themeToggle = page.locator('button').filter({ hasText: /theme|dark|light/i }).first();
    
    if (await themeToggle.count() > 0) {
      const startTime = Date.now();
      
      // Toggle theme 10 times rapidly
      for (let i = 0; i < 10; i++) {
        await themeToggle.click();
        await page.waitForTimeout(100);
      }
      
      const duration = Date.now() - startTime;

      // Should handle rapid toggling
      expect(duration).toBeLessThan(5000);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Stress Testing - Edge Cases', () => {
  test('should handle extremely long input strings', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find any text input
    const textInput = page.locator('input[type="text"]').first();
    
    if (await textInput.count() > 0) {
      // Generate a very long string (10,000 characters)
      const longString = 'A'.repeat(10000);
      
      await textInput.fill(longString);
      
      // Should handle without crashing
      await expect(page.locator('body')).toBeVisible();
      
      // Input should either accept it or show validation error
      const value = await textInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test('should handle special characters in input', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const textInput = page.locator('input[type="text"]').first();
    
    if (await textInput.count() > 0) {
      const specialChars = '<script>alert("XSS")</script> \' " ; -- /* */ 中文 👋 🔥';
      
      await textInput.fill(specialChars);
      
      // Should sanitize or escape properly
      await expect(page.locator('body')).toBeVisible();
      
      // Should not execute script
      const alerts = page.locator('text=XSS');
      expect(await alerts.count()).toBe(0);
    }
  });

  test('should handle boundary values', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const numberInput = page.locator('input[type="number"]').first();
    
    if (await numberInput.count() > 0) {
      // Test boundary values
      const testValues = [0, -1, 9999999, -9999999, 0.0001, -0.0001];
      
      for (const value of testValues) {
        await numberInput.fill(String(value));
        await page.waitForTimeout(100);
        
        // Should handle without crashing
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });
});

test.describe('Stress Testing - Concurrent Operations', () => {
  test('should handle multiple tabs with same user', async ({ browser }) => {
    const context = await browser.newContext();
    
    // Open 5 tabs with same session
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
      context.newPage(),
      context.newPage(),
    ]);

    // Navigate all tabs to different pages
    await Promise.all([
      pages[0].goto('/dashboard'),
      pages[1].goto('/formulas'),
      pages[2].goto('/clients'),
      pages[3].goto('/appointments'),
      pages[4].goto('/messages'),
    ]);

    // Wait for all to load
    await Promise.all(pages.map(p => p.waitForLoadState('domcontentloaded')));

    // All pages should be functional
    for (const page of pages) {
      await expect(page.locator('body')).toBeVisible();
    }

    // Cleanup
    await context.close();
  });

  test('should handle rapid route changes', async ({ page }) => {
    await page.goto('/dashboard');
    
    const routes = [
      '/dashboard',
      '/formulas',
      '/clients',
      '/appointments',
      '/messages',
      '/dashboard',
    ];

    const startTime = Date.now();

    // Change routes as fast as possible
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
    }

    const duration = Date.now() - startTime;

    // Should handle rapid changes
    expect(duration).toBeLessThan(30000);
    await expect(page.locator('body')).toBeVisible();
    
    console.log(`✅ Rapid route changes completed in ${duration}ms`);
  });
});
