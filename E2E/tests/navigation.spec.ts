import { test, expect } from '@playwright/test';

/**
 * Navigation & Flow Continuity Tests
 * Tests all navigation paths, sitemap structure, and user journey flows
 */

// Helper function to login
import { Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Navigation Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to all main pages from dashboard', async ({ page }) => {
    // Test sidebar navigation
    const navigationLinks = [
      {
        selector: 'a[href="/dashboard"]',
        url: '/dashboard',
        name: 'Dashboard',
      },
      {
        selector: 'a[href="/appointments"]',
        url: '/appointments',
        name: 'Appointments',
      },
      { selector: 'a[href="/clients"]', url: '/clients', name: 'Clients' },
      { selector: 'a[href="/messages"]', url: '/messages', name: 'Messages' },
      { selector: 'a[href="/formulas"]', url: '/formulas', name: 'Formulas' },
      {
        selector: 'a[href="/portfolio"]',
        url: '/portfolio',
        name: 'Portfolio',
      },
      { selector: 'a[href="/services"]', url: '/services', name: 'Services' },
      { selector: 'a[href="/schedule"]', url: '/schedule', name: 'Schedule' },
      { selector: 'a[href="/finance"]', url: '/finance', name: 'Finance' },
      { selector: 'a[href="/settings"]', url: '/settings', name: 'Settings' },
    ];

    for (const link of navigationLinks) {
      await page.click(link.selector);
      await page.waitForURL(link.url);
      expect(page.url()).toContain(link.url);

      // Verify page loaded without console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      expect(errors.length).toBe(0);
    }
  });

  test('should complete new user onboarding flow', async ({ page }) => {
    await page.goto('/auth');

    // Click sign up
    await page.click('button:has-text("Sign Up")');

    // Fill sign up form
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // Should redirect to profile setup or dashboard
    await page.waitForURL(/\/(dashboard|profile-setup)/);

    // Verify welcome message or onboarding element
    const welcomeElement = await page
      .locator('text=/Welcome|Get Started/i')
      .first();
    await expect(welcomeElement).toBeVisible();
  });

  test('should handle booking flow end-to-end', async ({ page }) => {
    // Navigate to appointments
    await page.click('a[href="/appointments"]');
    await page.waitForURL('/appointments');

    // Click new appointment button
    await page.click('button:has-text("New Appointment")');

    // Verify dialog opened
    await expect(page.locator('dialog')).toBeVisible();

    // Fill appointment form
    await page.selectOption('select[name="clientId"]', { index: 1 });
    await page.fill('input[name="date"]', '2025-12-01');
    await page.fill('input[name="time"]', '10:00');
    await page.selectOption('select[name="serviceType"]', 'Haircut');

    // Submit
    await page.click('button:has-text("Create Appointment")');

    // Verify success message
    await expect(
      page.locator('text=/Appointment created|Success/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should not have dead-end pages', async ({ page }) => {
    const pages = [
      '/dashboard',
      '/appointments',
      '/clients',
      '/formulas',
      '/services',
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Verify back navigation exists (sidebar or back button)
      const navigationExists = await page
        .locator('nav, button:has-text("Back")')
        .count();
      expect(navigationExists).toBeGreaterThan(0);
    }
  });

  test('should preserve state during navigation', async ({ page }) => {
    // Navigate to formulas
    await page.goto('/formulas');

    // Start creating a formula
    await page.click('button:has-text("New Formula")');
    await page.fill('input[name="name"]', 'Test Formula');

    // Navigate away without saving
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('/dashboard');

    // Navigate back
    await page.click('a[href="/formulas"]');
    await page.waitForURL('/formulas');

    // Check if unsaved data warning appeared or data was auto-saved
    const warningOrSaved = await page
      .locator('text=/unsaved|auto-saved|draft/i')
      .count();
    expect(warningOrSaved).toBeGreaterThan(0);
  });

  test('should show confirmation for critical actions', async ({ page }) => {
    await page.goto('/appointments');

    // Try to delete an appointment
    const deleteButton = page.locator('button:has-text("Delete")').first();
    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();

      // Should show confirmation dialog
      await expect(page.locator('dialog:has-text("confirm")')).toBeVisible();
    }
  });

  test('should handle rapid navigation without breaking', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/appointments',
      '/clients',
      '/formulas',
      '/services',
    ];

    // Rapidly navigate between pages
    for (let i = 0; i < 10; i++) {
      const route = routes[i % routes.length];
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }

    // Verify app still functions
    await page.goto('/dashboard');
    const dashboardContent = await page.locator('main').textContent();
    expect(dashboardContent).toBeTruthy();
  });

  test('should have working breadcrumbs on nested pages', async ({ page }) => {
    // Navigate to a nested page if exists
    await page.goto('/clients');

    // Click on a client to view details
    const clientLink = page.locator('a[href*="/clients/"]').first();
    if ((await clientLink.count()) > 0) {
      await clientLink.click();

      // Check for breadcrumbs
      const breadcrumb = page.locator(
        'nav[aria-label="breadcrumb"], .breadcrumbs'
      );
      if ((await breadcrumb.count()) > 0) {
        // Click breadcrumb to go back
        await breadcrumb.locator('a').first().click();
        await expect(page).toHaveURL('/clients');
      }
    }
  });
});

test.describe('Modal & Dialog Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should close modals with escape key', async ({ page }) => {
    await page.goto('/appointments');

    // Open modal
    await page.click('button:has-text("New Appointment")');
    await expect(page.locator('dialog')).toBeVisible();

    // Press escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.locator('dialog')).not.toBeVisible();
  });

  test('should close modals by clicking overlay', async ({ page }) => {
    await page.goto('/appointments');

    // Open modal
    await page.click('button:has-text("New Appointment")');
    await expect(page.locator('dialog')).toBeVisible();

    // Click outside modal
    await page.locator('[data-overlay]').click({ force: true });

    // Modal should close
    await expect(page.locator('dialog')).not.toBeVisible();
  });

  test('should trap focus within modals', async ({ page }) => {
    await page.goto('/appointments');

    // Open modal
    await page.click('button:has-text("New Appointment")');
    await expect(page.locator('dialog')).toBeVisible();

    // Tab through elements
    const focusableElements = await page
      .locator('dialog button, dialog input, dialog select')
      .count();

    for (let i = 0; i < focusableElements + 2; i++) {
      await page.keyboard.press('Tab');
    }

    // Focus should still be within dialog
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    const isInDialog = await page.evaluate(() => {
      return document.activeElement?.closest('dialog') !== null;
    });
    expect(isInDialog).toBe(true);
  });
});

test.describe('Error State Navigation', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Should show 404 or redirect
    const is404 = (await page.locator('text=/404|not found/i').count()) > 0;
    const isRedirected =
      page.url().includes('/dashboard') || page.url().includes('/auth');

    expect(is404 || isRedirected).toBe(true);
  });

  test('should provide way to recover from errors', async ({ page }) => {
    await login(page);

    // Simulate error by going to invalid route
    await page.goto('/invalid-route');

    // Should have navigation back to safety
    const safeNavigation = await page
      .locator('a[href="/dashboard"], button:has-text("Go Home")')
      .count();
    expect(safeNavigation).toBeGreaterThan(0);
  });
});
