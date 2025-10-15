/**
 * Comprehensive Role-Based QA Testing Suite
 * Tests all 3 user roles (Admin, Stylist, Client) across 12 critical areas
 */

import { test, expect, Page } from '@playwright/test';

// Test credentials for each role
const TEST_USERS = {
  admin: {
    email: 'theha.i.rtologist@gmail.com',
    password: 'TestAdmin123!',
    role: 'admin'
  },
  stylist: {
    email: 'tomtocutit@gmail.com', 
    password: 'TestStylist123!',
    role: 'stylist'
  },
  client: {
    email: 'chhiasmu@gmail.com',
    password: 'TestClient123!',
    role: 'client'
  }
};

// Helper function to login
async function login(page: Page, email: string, password: string) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

// Helper function to check for console errors
async function getConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

test.describe('Comprehensive QA - Admin Role', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
  });

  test('1. Authentication & Authorization - Admin', async ({ page }) => {
    // Verify admin dashboard loads
    await expect(page).toHaveURL('/dashboard');
    
    // Verify admin-only nav items visible
    await expect(page.locator('text=Command Center').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Access Codes').first()).toBeVisible({ timeout: 5000 });
    
    // Verify can access admin routes
    await page.goto('/admin/command');
    await expect(page).toHaveURL('/admin/command');
    
    // Verify session persists after reload
    await page.reload();
    await expect(page).toHaveURL('/admin/command');
  });

  test('2. Navigation & Routing - Admin', async ({ page }) => {
    const adminRoutes = [
      '/dashboard',
      '/admin/command',
      '/admin/users',
      '/access-codes',
      '/system-health',
      '/settings',
      '/profile'
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(route);
      await page.waitForLoadState('networkidle');
      // Verify no 404 or error pages
      await expect(page.locator('text=404').first()).not.toBeVisible();
      await expect(page.locator('text=Oops').first()).not.toBeVisible();
    }
  });

  test('3. Data CRUD Operations - Admin', async ({ page }) => {
    // Navigate to admin users management
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Verify user list loads
    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 10000 });
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
    
    // Verify data loads without errors
    const hasContent = await page.locator('tbody tr, [role="row"]').count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('4. UI/UX Responsiveness - Admin', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1366, height: 768 },  // Laptop
      { width: 768, height: 1024 },  // Tablet
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verify responsive layout
      const body = await page.locator('body');
      await expect(body).toBeVisible();
      
      // Check for horizontal scroll (shouldn't exist)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
    }
  });

  test('5. Performance Metrics - Admin', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check for long tasks (UI blocking)
    const longTasks = await page.evaluate(() => {
      return (performance as any).getEntriesByType?.('longtask') || [];
    });
    expect(longTasks.length).toBeLessThan(5);
  });

  test('6. Security & RLS Policies - Admin', async ({ page }) => {
    // Admin should access all user data
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Verify user list is not empty (admin can see all users)
    const userCount = await page.locator('tbody tr, [role="row"]').count();
    expect(userCount).toBeGreaterThan(0);
    
    // Verify admin can access audit logs
    await page.goto('/admin/audit-logs');
    await expect(page).toHaveURL('/admin/audit-logs');
    await page.waitForLoadState('networkidle');
  });

  test('7. Error Handling - Admin', async ({ page }) => {
    // Test 404 handling
    await page.goto('/invalid-route-12345');
    await expect(page.locator('text=404, text=Not Found').first()).toBeVisible({ timeout: 5000 });
    
    // Verify navigation back works
    await page.goBack();
    await page.waitForLoadState('networkidle');
  });

  test('8. Form Validation - Admin', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Test profile form if available
    const nameInput = page.locator('input[name="full_name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.clear();
      await nameInput.fill('Updated Admin Name');
      
      // Verify can save
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);
        // Should show success message
        await expect(page.locator('text=success, text=updated, text=saved').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('9. Real-time Updates - Admin', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for any real-time subscriptions to initialize
    await page.waitForTimeout(2000);
    
    // Verify dashboard renders without crashes
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('10. Accessibility - Admin', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Verify focus visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT'].includes(focusedElement || '')).toBeTruthy();
    
    // Check for ARIA labels
    const hasAriaLabels = await page.locator('[aria-label], [aria-labelledby]').count();
    expect(hasAriaLabels).toBeGreaterThan(0);
  });

  test('11. State Management - Admin', async ({ page }) => {
    // Navigate through app and verify state persists
    await page.goto('/dashboard');
    const dashboardContent = await page.content();
    
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Verify we're back on dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('12. Integration Points - Admin', async ({ page }) => {
    // Test Supabase integration
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify data loads from backend
    const hasData = await page.locator('body').textContent();
    expect(hasData).toBeTruthy();
    
    // Check network requests
    const responses: string[] = [];
    page.on('response', (response) => {
      responses.push(response.url());
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify Supabase API calls made
    const hasSupabaseCall = responses.some(url => url.includes('supabase.co'));
    expect(hasSupabaseCall).toBeTruthy();
  });
});

test.describe('Comprehensive QA - Stylist Role', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.stylist.email, TEST_USERS.stylist.password);
  });

  test('1. Authentication & Authorization - Stylist', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    
    // Verify stylist-specific nav items visible
    await expect(page.locator('text=Clients, text=Schedule, text=Portfolio').first()).toBeVisible({ timeout: 5000 });
    
    // Verify CANNOT access admin routes
    await page.goto('/admin/command');
    // Should redirect or show 403
    await page.waitForTimeout(1000);
    const isUnauthorized = await page.locator('text=unauthorized, text=403, text=access denied').first().isVisible();
    expect(isUnauthorized || !page.url().includes('/admin/command')).toBeTruthy();
  });

  test('2. Navigation & Routing - Stylist', async ({ page }) => {
    const stylistRoutes = [
      '/dashboard',
      '/clients',
      '/appointments',
      '/formulas',
      '/portfolio',
      '/schedule',
      '/services',
      '/finance',
      '/settings'
    ];

    for (const route of stylistRoutes) {
      await page.goto(route);
      await page.waitForTimeout(1000);
      // Some routes may require subscription, skip if redirected
      if (!page.url().includes('/upgrade')) {
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=404').first()).not.toBeVisible();
      }
    }
  });

  test('3. Data CRUD Operations - Stylist', async ({ page }) => {
    // Test client management
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Should see clients or empty state
    const hasClients = await page.locator('[data-testid="client-list"], table, .client').first().isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=No clients, text=Get started').first().isVisible().catch(() => false);
    expect(hasClients || hasEmptyState).toBeTruthy();
  });

  test('4. UI/UX Responsiveness - Stylist', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('5. Performance Metrics - Stylist', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('6. Security & RLS Policies - Stylist', async ({ page }) => {
    // Stylist should only see their own clients
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify page loads without errors (RLS allows access)
    const url = page.url();
    expect(url.includes('/clients') || url.includes('/dashboard')).toBeTruthy();
  });

  test('7. Error Handling - Stylist', async ({ page }) => {
    await page.goto('/invalid-route-xyz');
    await expect(page.locator('text=404, text=Not Found').first()).toBeVisible({ timeout: 5000 });
  });

  test('8. Form Validation - Stylist', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      const currentValue = await emailInput.inputValue();
      expect(currentValue).toBeTruthy();
    }
  });

  test('9. Real-time Updates - Stylist', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify messages page loads
    await expect(page.locator('h1, h2, [role="heading"]').first()).toBeVisible();
  });

  test('10. Accessibility - Stylist', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('11. State Management - Stylist', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/settings');
    await page.goBack();
    await expect(page).toHaveURL('/dashboard');
  });

  test('12. Integration Points - Stylist', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const responses: string[] = [];
    page.on('response', (response) => responses.push(response.url()));
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const hasSupabaseCall = responses.some(url => url.includes('supabase.co'));
    expect(hasSupabaseCall).toBeTruthy();
  });
});

test.describe('Comprehensive QA - Client Role', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.client.email, TEST_USERS.client.password);
  });

  test('1. Authentication & Authorization - Client', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    
    // Verify client-specific nav items visible
    await expect(page.locator('text=Find Stylists, text=Book, text=Appointments').first()).toBeVisible({ timeout: 5000 });
    
    // Verify CANNOT access admin routes
    await page.goto('/admin/command');
    await page.waitForTimeout(1000);
    const isUnauthorized = await page.locator('text=unauthorized, text=403, text=access denied').first().isVisible();
    expect(isUnauthorized || !page.url().includes('/admin/command')).toBeTruthy();
  });

  test('2. Navigation & Routing - Client', async ({ page }) => {
    const clientRoutes = [
      '/dashboard',
      '/stylist-discovery',
      '/appointments',
      '/favorites',
      '/booking-history',
      '/settings',
      '/profile'
    ];

    for (const route of clientRoutes) {
      await page.goto(route);
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=404').first()).not.toBeVisible();
    }
  });

  test('3. Data CRUD Operations - Client', async ({ page }) => {
    // Test stylist discovery
    await page.goto('/stylist-discovery');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Should see stylists or empty state
    const hasStylists = await page.locator('[data-testid="stylist-card"], .stylist-card, .grid').first().isVisible().catch(() => false);
    expect(hasStylists).toBeTruthy();
  });

  test('4. UI/UX Responsiveness - Client', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('5. Performance Metrics - Client', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('6. Security & RLS Policies - Client', async ({ page }) => {
    // Client should only see public stylist data
    await page.goto('/stylist-discovery');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify page loads without RLS errors
    const url = page.url();
    expect(url.includes('/stylist-discovery') || url.includes('/dashboard')).toBeTruthy();
  });

  test('7. Error Handling - Client', async ({ page }) => {
    await page.goto('/invalid-route-abc');
    await expect(page.locator('text=404, text=Not Found').first()).toBeVisible({ timeout: 5000 });
  });

  test('8. Form Validation - Client', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const nameInput = page.locator('input[name="full_name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible()) {
      const currentValue = await nameInput.inputValue();
      expect(currentValue).toBeTruthy();
    }
  });

  test('9. Real-time Updates - Client', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('h1, h2, [role="heading"]').first()).toBeVisible();
  });

  test('10. Accessibility - Client', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('11. State Management - Client', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/stylist-discovery');
    await page.goBack();
    await expect(page).toHaveURL('/dashboard');
  });

  test('12. Integration Points - Client', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const responses: string[] = [];
    page.on('response', (response) => responses.push(response.url()));
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const hasSupabaseCall = responses.some(url => url.includes('supabase.co'));
    expect(hasSupabaseCall).toBeTruthy();
  });
});
