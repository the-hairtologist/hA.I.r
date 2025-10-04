import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('should display sign in form by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should toggle to sign up form', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click();
    
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should prevent double submission', async ({ page }) => {
    let requestCount = 0;
    
    page.on('request', request => {
      if (request.url().includes('auth')) {
        requestCount++;
      }
    });

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Rapidly click submit button 5 times
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();
    
    // Wait a bit for any delayed requests
    await page.waitForTimeout(2000);
    
    // Should only have made one request
    expect(requestCount).toBeLessThanOrEqual(1);
  });

  test('should disable button while submitting', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();
    
    // Button should be disabled immediately
    await expect(submitButton).toBeDisabled();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/password/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused();
    
    // Submit with Enter
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.keyboard.press('Enter');
    
    await expect(page.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });
});
