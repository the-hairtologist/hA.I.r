import { test, expect } from '@playwright/test';

/**
 * Responsive Design Tests
 * Tests that the app renders correctly across all device sizes
 */

test.describe('Responsive Design', () => {
  
  test('Landing page loads without horizontal scroll', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('Navigation is accessible on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return;
    
    await page.goto('/');
    
    // Mobile nav should be visible or have hamburger menu
    const mobileNav = page.locator('[aria-label*="menu"]').or(page.locator('nav'));
    await expect(mobileNav).toBeVisible();
  });

  test('All images have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('Touch targets are at least 44x44px on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return;
    
    await page.goto('/');
    
    // Check all buttons and links
    const clickableElements = page.locator('button, a[href]');
    const count = await clickableElements.count();
    
    for (let i = 0; i < Math.min(count, 20); i++) { // Check first 20 elements
      const element = clickableElements.nth(i);
      const box = await element.boundingBox();
      
      if (box && await element.isVisible()) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Forms work correctly on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return;
    
    await page.goto('/auth');
    
    // Fill form inputs
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.click();
    await emailInput.fill('test@example.com');
    
    // Verify keyboard didn't cause viewport issues
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('Page title and meta tags are set', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Check meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
  });

  test('No console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('ResizeObserver') &&
      !error.includes('DevTools')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Core Web Vitals are within acceptable ranges', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    // FCP should be under 1.8s (good)
    expect(metrics.firstContentfulPaint).toBeLessThan(1800);
    
    console.log('Performance Metrics:', metrics);
  });

  test('App is installable as PWA', async ({ page }) => {
    await page.goto('/');
    
    // Check for manifest
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute('href', '/manifest.json');
    
    // Check for service worker
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    expect(swRegistered).toBe(true);
  });
});
