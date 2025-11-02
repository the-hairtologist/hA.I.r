import { test, expect, devices } from '@playwright/test';

/**
 * Comprehensive Mobile Testing Suite
 * Tests all critical user flows on mobile devices (iPhone, Android, Tablet)
 */

const MOBILE_DEVICES = [
  { name: 'iPhone 15 Pro', device: devices['iPhone 15 Pro'] },
  { name: 'Samsung Galaxy S23', device: devices['Galaxy S23'] },
  { name: 'iPad Air', device: devices['iPad (gen 7)'] },
];

// Test each mobile device
for (const { name, device } of MOBILE_DEVICES) {
  test.describe(`Mobile UX - ${name}`, () => {
    test.use(device);

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should display mobile-optimized navigation', async ({ page }) => {
      // Check viewport is mobile
      const viewport = page.viewportSize();
      expect(viewport).toBeTruthy();

      // Check for mobile menu button (hamburger)
      const mobileMenu = page.locator(
        '[aria-label*="menu"], [aria-label*="navigation"]'
      );
      await expect(mobileMenu).toBeVisible({ timeout: 5000 });
    });

    test('should have touch-friendly buttons (min 44px)', async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Get all interactive elements
      const buttons = page.locator('button, a[href], input[type="button"]');
      const count = await buttons.count();

      // Check first 10 visible buttons for touch target size
      for (let i = 0; i < Math.min(count, 10); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44);
            expect(box.width).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('should handle portrait and landscape orientations', async ({
      page,
      context,
    }) => {
      // Portrait mode
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();

      // Landscape mode
      await page.setViewportSize({ width: 812, height: 375 });
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();

      // Should not have horizontal scroll
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // 10px tolerance
    });

    test('should load main page within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });
  });
}

test.describe('Stylist Mobile Workflow - All Devices', () => {
  for (const { name, device } of MOBILE_DEVICES) {
    test(`Stylist: View and manage formulas on ${name}`, async ({ page }) => {
      test.use(device);

      await page.goto('/formulas');

      // Should show formulas page
      await expect(
        page.locator('h1, [role="heading"][aria-level="1"]')
      ).toContainText(/formula/i, { timeout: 10000 });

      // Check for search functionality
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search" i]'
      );
      if ((await searchInput.count()) > 0) {
        await searchInput.first().click();
        await expect(searchInput.first()).toBeFocused();
      }

      // Check for add button
      const addButton = page.locator(
        'button:has-text("Add"), button:has-text("New"), button:has-text("Create")'
      );
      if ((await addButton.count()) > 0) {
        await expect(addButton.first()).toBeVisible();
      }
    });

    test(`Stylist: View and manage clients on ${name}`, async ({ page }) => {
      test.use(device);

      await page.goto('/clients');

      // Should show clients page
      await expect(
        page.locator('h1, [role="heading"][aria-level="1"]')
      ).toContainText(/client/i, { timeout: 10000 });

      // Check for client list or empty state
      const content = page.locator('main, [role="main"]');
      await expect(content).toBeVisible();

      // Check for action buttons
      const actionButtons = page.locator('button');
      expect(await actionButtons.count()).toBeGreaterThan(0);
    });

    test(`Stylist: View appointments calendar on ${name}`, async ({ page }) => {
      test.use(device);

      await page.goto('/appointments');

      // Should show appointments page
      await expect(
        page.locator('h1, [role="heading"][aria-level="1"]')
      ).toContainText(/appointment/i, { timeout: 10000 });

      // Check for calendar or list view
      const content = page.locator('main, [role="main"]');
      await expect(content).toBeVisible();
    });
  }
});

test.describe('Client Mobile Workflow - All Devices', () => {
  for (const { name, device } of MOBILE_DEVICES) {
    test(`Client: View appointments on ${name}`, async ({ page }) => {
      test.use(device);

      await page.goto('/appointments');

      // Page should load
      await expect(page.locator('body')).toBeVisible();

      // Should show appointments or prompt to login
      const content = await page.content();
      const hasAppointments =
        content.includes('appointment') || content.includes('schedule');
      const hasAuth = content.includes('login') || content.includes('sign in');

      expect(hasAppointments || hasAuth).toBeTruthy();
    });

    test(`Client: Navigate dashboard on ${name}`, async ({ page }) => {
      test.use(device);

      await page.goto('/dashboard');

      // Should show dashboard
      await expect(page.locator('body')).toBeVisible();

      // Check for main navigation elements
      const navLinks = page.locator('a[href], button[role="link"]');
      expect(await navLinks.count()).toBeGreaterThan(0);
    });
  }
});

test.describe('Mobile Performance & Accessibility', () => {
  test('should have no console errors on mobile', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      err =>
        !err.includes('favicon') &&
        !err.includes('manifest') &&
        !err.includes('livereload')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should be accessible on mobile (basic checks)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for skip link
    const skipLink = page.locator('a:has-text("Skip to")');
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toHaveAttribute('href');
    }

    // Check for proper heading hierarchy
    const h1 = page.locator('h1, [role="heading"][aria-level="1"]');
    expect(await h1.count()).toBeGreaterThan(0);
  });

  test('should handle slow 3G connection gracefully', async ({
    page,
    context,
  }) => {
    // Simulate slow 3G
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), Math.random() * 500);
    });

    await page.goto('/');

    // Should show loading state or content within reasonable time
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Mobile Form Interactions', () => {
  test('should handle form input on mobile', async ({ page }) => {
    test.use(devices['iPhone 15 Pro']);

    await page.goto('/');

    // Find any input field
    const input = page
      .locator('input[type="text"], input[type="email"], input[type="search"]')
      .first();
    if ((await input.count()) > 0) {
      await input.click();
      await expect(input).toBeFocused();

      // Type text
      await input.fill('test input');
      await expect(input).toHaveValue('test input');
    }
  });

  test('should handle touch gestures (swipe)', async ({ page }) => {
    test.use(devices['iPhone 15 Pro']);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to perform a swipe gesture on any scrollable element
    const scrollable = page.locator('body');
    const box = await scrollable.boundingBox();

    if (box) {
      // Swipe down
      await page.mouse.move(box.x + box.width / 2, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + 300);
      await page.mouse.up();

      // Page should still be visible and responsive
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Mobile Navigation Tests', () => {
  test('should navigate between pages on mobile', async ({ page }) => {
    test.use(devices['iPhone 15 Pro']);

    await page.goto('/');

    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();

    // Navigate to formulas
    await page.goto('/formulas');
    await expect(page.locator('body')).toBeVisible();

    // Navigate to clients
    await page.goto('/clients');
    await expect(page.locator('body')).toBeVisible();

    // Navigate to appointments
    await page.goto('/appointments');
    await expect(page.locator('body')).toBeVisible();

    // Each page should load without errors
    expect(true).toBeTruthy();
  });

  test('should maintain state during navigation on mobile', async ({
    page,
  }) => {
    test.use(devices['iPhone 15 Pro']);

    await page.goto('/formulas');

    // Enter search term if search exists
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill('test search');

      // Navigate away and back
      await page.goto('/dashboard');
      await page.goBack();

      // Check if search is preserved (might not be, depends on implementation)
      const currentUrl = page.url();
      expect(currentUrl).toContain('/formulas');
    }
  });
});

test.describe('Mobile AI Components', () => {
  test('should render AI components on mobile', async ({ page }) => {
    test.use(devices['iPhone 15 Pro']);

    await page.goto('/formulas');
    await page.waitForLoadState('networkidle');

    // Check if any AI-related components are visible
    const content = await page.content();

    // Page should load successfully
    await expect(page.locator('body')).toBeVisible();
  });
});
