import { test, expect } from '@playwright/test';

/**
 * Stylist Onboarding User Flow
 * Tests the complete new stylist signup and setup process
 */

test.describe('Stylist Onboarding Flow', () => {
  test('Complete stylist signup and profile setup', async ({ page }) => {
    // Step 1: Navigate to landing page
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // Step 2: Click Get Started
    const getStartedButton = page.getByRole('button', { name: /get started/i });
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();

    // Step 3: Should be on auth page
    await expect(page).toHaveURL(/\/auth/);

    // Step 4: Fill signup form
    const timestamp = Date.now();
    const testEmail = `test-stylist-${timestamp}@example.com`;

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.fill('input[name="full_name"]', 'Test Stylist');

    // Step 5: Submit form
    const signUpButton = page.getByRole('button', { name: /sign up/i });
    await signUpButton.click();

    // Step 6: Should redirect to role selection or dashboard
    await page.waitForURL(/\/(role-selection|dashboard)/, { timeout: 10000 });

    // If role selection appears, choose stylist
    const stylistOption = page.getByRole('button', { name: /stylist/i });
    if (await stylistOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stylistOption.click();
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    }

    // Step 7: Verify dashboard loaded
    await expect(page.locator('main')).toBeVisible();

    console.log('✅ Stylist onboarding flow completed successfully');
  });

  test('Signup form validation works', async ({ page }) => {
    await page.goto('/auth');

    // Try to submit empty form
    const signUpButton = page.getByRole('button', { name: /sign up/i });
    await signUpButton.click();

    // Should show validation errors
    const errorMessage = page.locator('text=/required|invalid/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('Password requirements are enforced', async ({ page }) => {
    await page.goto('/auth');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'weak'); // Too weak

    const signUpButton = page.getByRole('button', { name: /sign up/i });
    await signUpButton.click();

    // Should show password error
    const passwordError = page.locator('text=/password.*strong|6 characters/i');
    await expect(passwordError).toBeVisible({ timeout: 5000 });
  });
});
