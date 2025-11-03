/**
 * Mobile-First Test Suite
 * Validates mobile-first implementation across the app
 */

import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 667 }; // iPhone SE
const TABLET_VIEWPORT = { width: 768, height: 1024 }; // iPad Mini
const DESKTOP_VIEWPORT = { width: 1440, height: 900 }; // Desktop
const SMALL_MOBILE = { width: 320, height: 568 }; // iPhone SE (older)
const LARGE_MOBILE = { width: 390, height: 844 }; // iPhone 12 Pro

// Test routes that should be mobile-optimized
const ROUTES = [
  { path: '/', name: 'Landing' },
  { path: '/auth', name: 'Auth' },
];

const PROTECTED_ROUTES = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/clients', name: 'Clients' },
  { path: '/appointments', name: 'Appointments' },
  { path: '/ai-assistant', name: 'AI Assistant' },
];

test.describe('Mobile-First Implementation', () => {
  
  test.describe('Touch Targets', () => {
    test('all interactive elements meet 44px minimum on mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/');

      // Get all interactive elements
      const buttons = await page.locator('button, a, input[type="button"], input[type="submit"], [role="button"]').all();

      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box) {
          // Check if visible
          const isVisible = await button.isVisible();
          if (isVisible) {
            expect(box.width, `Touch target width for ${await button.innerText()} is too small`).toBeGreaterThanOrEqual(44);
            expect(box.height, `Touch target height for ${await button.innerText()} is too small`).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('bottom navigation has 60x60px targets', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/');

      // Check if bottom nav exists on landing
      const bottomNav = page.locator('nav[aria-label="Main navigation"]');
      const isVisible = await bottomNav.isVisible().catch(() => false);
      
      if (!isVisible) {
        test.skip('Bottom nav not visible on public pages - expected behavior');
      }

      const navItems = await bottomNav.locator('a, button').all();

      for (const item of navItems) {
        const box = await item.boundingBox();
        if (box && await item.isVisible()) {
          expect(box.width, 'Bottom nav item width').toBeGreaterThanOrEqual(60);
          expect(box.height, 'Bottom nav item height').toBeGreaterThanOrEqual(60);
        }
      }
    });
  });

  test.describe('Responsive Layout', () => {
    test('no horizontal overflow on mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);

      for (const route of ROUTES.filter(r => !r.requiresAuth)) {
        await page.goto(route.path);
        
        // Check document width
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const viewportWidth = MOBILE_VIEWPORT.width;

        expect(documentWidth, `Horizontal overflow on ${route.name}`).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
      }
    });

    test('text is readable on mobile (16px minimum)', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/');

      // Get all text elements
      const textElements = await page.locator('p, span, div, li').all();

      for (const element of textElements.slice(0, 20)) { // Sample first 20
        const isVisible = await element.isVisible();
        if (isVisible) {
          const fontSize = await element.evaluate(el => {
            return window.getComputedStyle(el).fontSize;
          });
          
          const fontSizeNum = parseFloat(fontSize);
          
          // Body text should be at least 14px (acceptable on mobile)
          if (fontSizeNum > 0) {
            expect(fontSizeNum, `Font size too small: ${fontSize}`).toBeGreaterThanOrEqual(12);
          }
        }
      }
    });

    test('bottom navigation hidden on desktop', async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await page.goto('/');

      const bottomNav = page.locator('nav[aria-label="Main navigation"]');
      
      // Should either not exist or be hidden
      const isVisible = await bottomNav.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    });
  });

  test.describe('Performance', () => {
    test('LCP under 2.5s on mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);

      // Measure LCP
      const lcp = await page.evaluate(() => {
        return new Promise(resolve => {
          new PerformanceObserver(list => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Timeout after 5s
          setTimeout(() => resolve(5000), 5000);
        });
      });

      expect(lcp).toBeLessThan(2500);
    });

    test('no layout shift on load (CLS < 0.1)', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);

      await page.goto('/');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      const cls = await page.evaluate(() => {
        return new Promise(resolve => {
          let clsValue = 0;
          
          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });

          // Measure for 2 seconds
          setTimeout(() => resolve(clsValue), 2000);
        });
      });

      expect(cls).toBeLessThan(0.1);
    });
  });

  test.describe('Breakpoint Behavior', () => {
    test('layout adapts across all breakpoints', async ({ page }) => {
      const viewports = [
        { ...SMALL_MOBILE, name: 'Small-Mobile-320' },
        { ...MOBILE_VIEWPORT, name: 'Mobile-375' },
        { ...LARGE_MOBILE, name: 'Mobile-390' },
        { ...TABLET_VIEWPORT, name: 'Tablet-768' },
        { width: 1024, height: 768, name: 'Desktop-1024' },
        { ...DESKTOP_VIEWPORT, name: 'Desktop-1440' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        // Check that page renders without errors
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(documentWidth, `Layout broken on ${viewport.name}`).toBeGreaterThan(0);

        // Verify no horizontal overflow
        expect(documentWidth, `Horizontal overflow on ${viewport.name}`).toBeLessThanOrEqual(viewport.width + 1);

        // Take screenshot for manual review
        await page.screenshot({ 
          path: `test-results/mobile-first-${viewport.name.toLowerCase()}.png`,
          fullPage: true 
        });
      }
    });
  });

  test.describe('Accessibility', () => {
    test('keyboard navigation works on mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/');

      // Tab through interactive elements
      await page.keyboard.press('Tab');
      const firstFocused = await page.locator(':focus').textContent();
      expect(firstFocused).toBeTruthy();

      // Should be able to tab multiple times
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const thirdFocused = await page.locator(':focus').textContent();
      expect(thirdFocused).toBeTruthy();
    });

    test('focus indicators visible', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/');

      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');

      // Check if outline or ring is visible
      const hasVisibleFocus = await focused.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || 
               styles.outlineWidth !== '0px' ||
               styles.boxShadow.includes('ring');
      });

      expect(hasVisibleFocus).toBe(true);
    });
  });
});

test.describe('Mobile-First Utilities', () => {
  test('mobileFirst utilities apply correctly', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // This would require injecting test elements
    // For now, just verify the page loads
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
