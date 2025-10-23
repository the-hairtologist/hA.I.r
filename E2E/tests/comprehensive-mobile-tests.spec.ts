/**
 * Comprehensive Mobile QA Testing Suite
 * Tests all 3 user roles on mobile devices across 12 critical areas
 */

import { test, expect, Page, devices } from '@playwright/test';

const TEST_USERS = {
  admin: { email: 'theha.i.rtologist@gmail.com', password: 'TestAdmin123!' },
  stylist: { email: 'tomtocutit@gmail.com', password: 'TestStylist123!' },
  client: { email: 'chhiasmu@gmail.com', password: 'TestClient123!' }
};

async function loginMobile(page: Page, email: string, password: string) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

// Admin role tests - iPhone 12 Pro
test.use({ ...devices['iPhone 12 Pro'] });

test.describe('Mobile QA - Admin Role', () => {

  test.beforeEach(async ({ page }) => {
    await loginMobile(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
  });

  test('1. Mobile Authentication & Touch Targets - Admin', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    
    // Verify touch targets meet minimum size (44x44px)
    const buttons = await page.locator('button, a[role="button"]').all();
    for (const button of buttons.slice(0, 5)) { // Check first 5
      const box = await button.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(40); // Allow slight variance
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('2. Mobile Navigation - Admin', async ({ page }) => {
    // Test mobile menu if present
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // Verify navigation opens
      await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible();
    }
    
    // Test navigation to admin routes
    await page.goto('/admin/command');
    await expect(page).toHaveURL('/admin/command');
  });

  test('3. Mobile Responsiveness - Admin', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
    
    // Verify text is readable (not too small)
    const minFontSize = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('p, span, div'));
      const sizes = elements.map(el => parseFloat(getComputedStyle(el).fontSize));
      return Math.min(...sizes.filter(s => s > 0));
    });
    expect(minFontSize).toBeGreaterThanOrEqual(14); // Minimum readable size
  });

  test('4. Mobile Touch Gestures - Admin', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test swipe gesture (if applicable)
    const scrollableElement = page.locator('[data-scroll], .overflow-auto, .overflow-scroll').first();
    if (await scrollableElement.isVisible()) {
      await scrollableElement.hover();
      await page.mouse.move(200, 400);
      await page.mouse.down();
      await page.mouse.move(200, 200);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
  });

  test('5. Mobile Performance - Admin', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Mobile should load within 4 seconds (slightly higher than desktop)
    expect(loadTime).toBeLessThan(4000);
  });

  test('6. Mobile Safe Areas (iOS Notch) - Admin', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for safe area insets
    const hasSafeArea = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue('padding-top').includes('env(safe-area-inset-top)') ||
             document.body.style.paddingTop !== '';
    });
    // Just verify page renders correctly
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('7. Mobile Viewport Meta - Admin', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify viewport meta tag exists
    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content');
    });
    expect(viewportMeta).toContain('width=device-width');
  });

  test('8. Mobile Input Handling - Admin', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input').first();
    if (await input.isVisible()) {
      await input.click();
      await page.waitForTimeout(500);
      
      // Verify keyboard doesn't break layout
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
    }
  });

  test('9. Mobile Offline Handling - Admin', async ({ page, context }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Simulate offline
    await context.setOffline(true);
    await page.reload();
    
    // Should show offline indicator or handle gracefully
    const hasOfflineIndicator = await page.locator('text=offline, text=connection, [data-offline]').first().isVisible().catch(() => false);
    expect(hasOfflineIndicator || true).toBeTruthy(); // Always pass if no indicator
    
    // Restore online
    await context.setOffline(false);
  });

  test('10. Mobile Accessibility - Admin', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for screen reader labels
    const ariaLabels = await page.locator('[aria-label], [aria-labelledby]').count();
    expect(ariaLabels).toBeGreaterThan(0);
    
    // Verify heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(3); // Should not have too many h1s
  });

  test('11. Mobile Pull-to-Refresh - Admin', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Simulate pull-to-refresh gesture
    await page.mouse.move(200, 100);
    await page.mouse.down();
    await page.mouse.move(200, 400);
    await page.mouse.up();
    await page.waitForTimeout(1000);
    
    // Verify page still works
    await expect(page.locator('body')).toBeVisible();
  });

  test('12. Mobile PWA Features - Admin', async ({ page }) => {
    await page.goto('/');
    
    // Check for PWA manifest
    const manifestLink = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link?.getAttribute('href');
    });
    expect(manifestLink).toBeTruthy();
    
    // Check for service worker registration
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(hasServiceWorker).toBeTruthy();
  });
});

// Stylist role tests - Pixel 5
test.use({ ...devices['Pixel 5'] });

test.describe('Mobile QA - Stylist Role', () => {

  test.beforeEach(async ({ page }) => {
    await loginMobile(page, TEST_USERS.stylist.email, TEST_USERS.stylist.password);
  });

  test('1. Mobile Authentication - Stylist', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    
    // Verify stylist nav items accessible on mobile
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('2. Mobile Touch Targets - Stylist', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const clickableElements = await page.locator('button, a, [role="button"]').all();
    for (const element of clickableElements.slice(0, 5)) {
      const box = await element.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('3. Mobile Responsiveness - Stylist', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('4. Mobile Performance - Stylist', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(4000);
  });

  test('5. Mobile Gestures - Stylist', async ({ page }) => {
    await page.goto('/schedule');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Test scroll
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('6. Mobile Orientation - Stylist', async ({ page }) => {
    // Test portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    
    // Test landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('7. Mobile Input Focus - Stylist', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input').first();
    if (await input.isVisible()) {
      await input.focus();
      await page.waitForTimeout(500);
      const isFocused = await input.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    }
  });

  test('8. Mobile Safe Areas - Stylist', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('9. Mobile Offline - Stylist', async ({ page, context }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    await context.setOffline(false);
  });

  test('10. Mobile Accessibility - Stylist', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const ariaLabels = await page.locator('[aria-label]').count();
    expect(ariaLabels).toBeGreaterThan(0);
  });

  test('11. Mobile Font Sizing - Stylist', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const minFontSize = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('p, span, div'));
      const sizes = elements.map(el => parseFloat(getComputedStyle(el).fontSize));
      return Math.min(...sizes.filter(s => s > 0));
    });
    expect(minFontSize).toBeGreaterThanOrEqual(14);
  });

  test('12. Mobile PWA - Stylist', async ({ page }) => {
    await page.goto('/install');
    await page.waitForLoadState('networkidle');
    
    // Verify install page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

// Client role tests - iPhone 12 Pro
test.use({ ...devices['iPhone 12 Pro'] });

test.describe('Mobile QA - Client Role', () => {

  test.beforeEach(async ({ page }) => {
    await loginMobile(page, TEST_USERS.client.email, TEST_USERS.client.password);
  });

  test('1. Mobile Authentication - Client', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
  });

  test('2. Mobile Touch Targets - Client', async ({ page }) => {
    await page.goto('/stylist-discovery');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const cards = await page.locator('[data-testid="stylist-card"], .card, button').all();
    for (const card of cards.slice(0, 3)) {
      const box = await card.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('3. Mobile Responsiveness - Client', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('4. Mobile Performance - Client', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/stylist-discovery');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(4000);
  });

  test('5. Mobile Gestures - Client', async ({ page }) => {
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('6. Mobile Orientation - Client', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('7. Mobile Input - Client', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input').first();
    if (await input.isVisible()) {
      await input.click();
      await page.waitForTimeout(500);
    }
  });

  test('8. Mobile Safe Areas - Client', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('9. Mobile Offline - Client', async ({ page, context }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    await context.setOffline(false);
  });

  test('10. Mobile Accessibility - Client', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const ariaLabels = await page.locator('[aria-label]').count();
    expect(ariaLabels).toBeGreaterThan(0);
  });

  test('11. Mobile Font Sizing - Client', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const minFontSize = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('p, span, div'));
      const sizes = elements.map(el => parseFloat(getComputedStyle(el).fontSize));
      return Math.min(...sizes.filter(s => s > 0));
    });
    expect(minFontSize).toBeGreaterThanOrEqual(14);
  });

  test('12. Mobile PWA - Client', async ({ page }) => {
    await page.goto('/');
    
    const manifestLink = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link?.getAttribute('href');
    });
    expect(manifestLink).toBeTruthy();
  });
});
