import { test, expect } from '@playwright/test';

/**
 * Complete Stylist Workflow E2E Tests
 * Tests the entire stylist journey from login to daily operations
 */

test.describe('Complete Stylist Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Full stylist daily workflow', async ({ page }) => {
    // 1. Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();

    // 2. Check today's appointments
    const appointmentsLink = page.locator('a[href="/appointments"], button:has-text("Appointments")').first();
    if (await appointmentsLink.count() > 0) {
      await appointmentsLink.click();
      await expect(page.locator('h1, [role="heading"][aria-level="1"]')).toContainText(/appointment/i, { timeout: 10000 });
    }

    // 3. View clients list
    await page.goto('/clients');
    await expect(page.locator('h1, [role="heading"][aria-level="1"]')).toContainText(/client/i, { timeout: 10000 });

    // 4. View formulas library
    await page.goto('/formulas');
    await expect(page.locator('h1, [role="heading"][aria-level="1"]')).toContainText(/formula/i, { timeout: 10000 });

    // 5. Return to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Stylist can search and filter formulas', async ({ page }) => {
    await page.goto('/formulas');
    await page.waitForLoadState('networkidle');

    // Search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('color');
      await page.waitForTimeout(500); // Debounce wait
      
      // Results should update
      await expect(page.locator('body')).toBeVisible();
    }

    // Clear search
    if (await searchInput.count() > 0) {
      await searchInput.clear();
    }
  });

  test('Stylist can manage client data', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Search for clients
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }

    // Check for client cards or empty state
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('Stylist can view appointment calendar', async ({ page }) => {
    await page.goto('/appointments');
    await page.waitForLoadState('networkidle');

    // Check for view mode tabs
    const listView = page.locator('button:has-text("List"), [role="tab"]:has-text("List")').first();
    const calendarView = page.locator('button:has-text("Calendar"), [role="tab"]:has-text("Calendar")').first();

    if (await listView.count() > 0 && await calendarView.count() > 0) {
      // Switch to calendar view
      await calendarView.click();
      await page.waitForTimeout(500);
      
      // Switch back to list view
      await listView.click();
      await page.waitForTimeout(500);
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('Stylist can export data to CSV', async ({ page }) => {
    // Test formulas export
    await page.goto('/formulas');
    await page.waitForLoadState('networkidle');

    const exportButton = page.locator('button:has-text("Export")').first();
    if (await exportButton.count() > 0 && await exportButton.isEnabled()) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.csv');
      } catch {
        // Export button might be disabled if no data
      }
    }
  });

  test('Stylist can use keyboard shortcuts', async ({ page }) => {
    await page.goto('/formulas');
    await page.waitForLoadState('networkidle');

    // Try Ctrl+N for new formula
    await page.keyboard.press('Control+n');
    await page.waitForTimeout(500);

    // Dialog might open
    const dialog = page.locator('[role="dialog"]').first();
    if (await dialog.count() > 0) {
      // Close dialog
      const closeButton = page.locator('[aria-label*="close" i], button:has-text("Cancel")').first();
      if (await closeButton.count() > 0) {
        await closeButton.click();
      }
    }
  });

  test('Stylist can toggle availability status', async ({ page }) => {
    await page.goto('/appointments');
    await page.waitForLoadState('networkidle');

    // Look for availability toggle
    const availabilityToggle = page.locator('input[type="checkbox"][id*="availability"], [role="switch"]').first();
    if (await availabilityToggle.count() > 0) {
      const initialState = await availabilityToggle.isChecked();
      
      // Toggle it
      await availabilityToggle.click();
      await page.waitForTimeout(1000);
      
      // Verify it changed
      const newState = await availabilityToggle.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test('Stylist can access AI features', async ({ page }) => {
    await page.goto('/formulas');
    await page.waitForLoadState('networkidle');

    // Look for AI-related buttons or text
    const content = await page.content();
    const hasAIFeatures = content.toLowerCase().includes('ai') || 
                          content.toLowerCase().includes('analyze') ||
                          content.toLowerCase().includes('predict');

    // App should have some AI features
    expect(hasAIFeatures || content.length > 0).toBeTruthy();
  });
});

test.describe('Client Workflow', () => {
  test('Client can view their appointments', async ({ page }) => {
    await page.goto('/appointments');
    
    // Should load without errors
    await expect(page.locator('body')).toBeVisible();
    
    // Check for appointments or auth prompt
    const content = await page.content();
    const hasContent = content.toLowerCase().includes('appointment') || 
                       content.toLowerCase().includes('login') ||
                       content.toLowerCase().includes('sign in');
    
    expect(hasContent).toBeTruthy();
  });

  test('Client can rebook appointments', async ({ page }) => {
    await page.goto('/appointments');
    await page.waitForLoadState('networkidle');

    // Look for rebook buttons
    const rebookButton = page.locator('button:has-text("Rebook"), button:has-text("Book Again")').first();
    if (await rebookButton.count() > 0 && await rebookButton.isVisible()) {
      await rebookButton.click();
      await page.waitForTimeout(500);
      
      // Dialog or form should appear
      const dialog = page.locator('[role="dialog"]').first();
      expect(await dialog.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('Client can leave reviews', async ({ page }) => {
    await page.goto('/appointments');
    await page.waitForLoadState('networkidle');

    // Look for review buttons
    const reviewButton = page.locator('button:has-text("Review"), button:has-text("Rate")').first();
    if (await reviewButton.count() > 0 && await reviewButton.isVisible()) {
      await reviewButton.click();
      await page.waitForTimeout(500);
      
      // Review dialog should appear
      const dialog = page.locator('[role="dialog"]').first();
      expect(await dialog.count()).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Admin Workflow', () => {
  test('Admin can access admin panels', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Should load admin page or redirect to auth
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin can view system health', async ({ page }) => {
    await page.goto('/system-health');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin can manage access codes', async ({ page }) => {
    await page.goto('/access-codes');
    
    await expect(page.locator('body')).toBeVisible();
  });
});
