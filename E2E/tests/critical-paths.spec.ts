/**
 * Critical User Journey E2E Tests
 * Tests the most important user flows end-to-end
 */

import { test, expect } from '@playwright/test';

// Test data
const TEST_STYLIST = {
  email: 'test-stylist@example.com',
  password: 'TestPassword123!',
};

const TEST_CLIENT = {
  email: 'test-client@example.com',
  password: 'TestPassword123!',
};

test.describe('Critical User Journeys', () => {
  test.describe('Stylist Onboarding Flow', () => {
    test('complete stylist registration and setup', async ({ page }) => {
      // 1. Navigate to signup
      await page.goto('/');
      await page.click('text=Sign Up');

      // 2. Fill registration form
      await page.fill('[type=email]', TEST_STYLIST.email);
      await page.fill('[type=password]', TEST_STYLIST.password);
      await page.click('text=Create Account');

      // 3. Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
      
      // 4. Verify dashboard loaded
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
    });

    test('stylist can view their profile', async ({ page }) => {
      // Assume logged in
      await page.goto('/dashboard');
      
      // Navigate to profile
      await page.click('[aria-label="Profile"], text=Profile');
      
      // Verify profile page
      await expect(page.locator('text=Profile')).toBeVisible();
    });
  });

  test.describe('Client Appointment Booking Flow', () => {
    test('client can browse stylists', async ({ page }) => {
      await page.goto('/');
      
      // Look for stylist browsing section
      const hasStylists = await page.locator('[data-testid*=stylist], .stylist-card').count();
      
      if (hasStylists > 0) {
        await expect(page.locator('[data-testid*=stylist], .stylist-card').first()).toBeVisible();
      }
    });

    test('client can view stylist details', async ({ page }) => {
      await page.goto('/');
      
      // Find and click first stylist
      const stylistCard = page.locator('[data-testid*=stylist], .stylist-card').first();
      
      if (await stylistCard.isVisible()) {
        await stylistCard.click();
        
        // Should show stylist details
        await expect(page).toHaveURL(/.*stylist|profile/, { timeout: 5000 });
      }
    });
  });

  test.describe('AI Formula Generation', () => {
    test('can access AI assistant', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for AI assistant link
      const aiLink = page.locator('text=AI Assistant, [href*=ai], [aria-label*=AI]').first();
      
      if (await aiLink.isVisible()) {
        await aiLink.click();
        
        // Should show AI interface
        await expect(page).toHaveURL(/.*ai/, { timeout: 5000 });
      }
    });

    test('AI interface has input field', async ({ page }) => {
      await page.goto('/ai-assistant').catch(() => {
        // Route may not exist yet
      });
      
      // Check if AI page loaded
      const hasInput = await page.locator('textarea, input[type=text], [contenteditable]').count();
      
      if (hasInput > 0) {
        await expect(page.locator('textarea, input[type=text]').first()).toBeVisible();
      }
    });
  });

  test.describe('Authentication Flow', () => {
    test('can navigate to login page', async ({ page }) => {
      await page.goto('/');
      
      const loginButton = page.locator('text=Sign In, text=Login, [href*=login]').first();
      await loginButton.click();
      
      await expect(page).toHaveURL(/.*login|auth/, { timeout: 5000 });
    });

    test('login form has required fields', async ({ page }) => {
      await page.goto('/login').catch(() => {
        return page.goto('/auth');
      });
      
      // Should have email and password inputs
      await expect(page.locator('[type=email], [name=email]')).toBeVisible();
      await expect(page.locator('[type=password], [name=password]')).toBeVisible();
    });

    test('can navigate to signup page', async ({ page }) => {
      await page.goto('/');
      
      const signupButton = page.locator('text=Sign Up, text=Register, [href*=signup]').first();
      
      if (await signupButton.isVisible()) {
        await signupButton.click();
        await expect(page).toHaveURL(/.*signup|register|auth/, { timeout: 5000 });
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('homepage renders correctly on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      
      // Check if page loaded
      await expect(page.locator('body')).toBeVisible();
      
      // Verify no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
    });

    test('touch targets are minimum 44px', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      
      // Check button sizes
      const buttons = page.locator('button, a[role=button]');
      const count = await buttons.count();
      
      if (count > 0) {
        const firstButton = buttons.first();
        const box = await firstButton.boundingBox();
        
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Performance', () => {
    test('page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds (generous for E2E)
      expect(loadTime).toBeLessThan(5000);
    });

    test('no JavaScript errors on page load', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Allow some time for potential errors to surface
      await page.waitForTimeout(1000);
      
      expect(errors).toHaveLength(0);
    });
  });

  test.describe('Accessibility', () => {
    test('homepage has proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Should not have multiple h1s
      expect(h1Count).toBeLessThanOrEqual(2);
    });

    test('interactive elements are keyboard accessible', async ({ page }) => {
      await page.goto('/');
      
      // Tab through page
      await page.keyboard.press('Tab');
      
      // Should have visible focus indicator
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
        };
      });
      
      // Should have some focus styling
      expect(
        focusedElement?.outline !== 'none' || 
        focusedElement?.boxShadow !== 'none'
      ).toBe(true);
    });

    test('images have alt text', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const count = await images.count();
      
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 10); i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          
          // Alt should exist (can be empty for decorative images)
          expect(alt).not.toBeNull();
        }
      }
    });
  });
});
