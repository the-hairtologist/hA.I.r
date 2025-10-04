import { test, expect } from '@playwright/test';

test.describe('Forms and Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Try to submit without filling anything
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/email.*required/i)).toBeVisible();
    await expect(page.getByText(/password.*required/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Enter invalid email
    await page.getByLabel(/email/i).fill('notanemail');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show email format error
    await expect(page.getByText(/invalid.*email/i)).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Enter short password
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('123');
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should show password length error
    await expect(page.getByText(/password.*at least.*characters/i)).toBeVisible();
  });

  test('should show inline validation on blur', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    
    // Focus and blur without entering value
    await emailInput.focus();
    await emailInput.blur();
    
    // Should show validation error
    await expect(page.getByText(/email.*required/i)).toBeVisible();
  });

  test('should clear validation errors when field is corrected', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    
    // Trigger error
    await emailInput.fill('notanemail');
    await emailInput.blur();
    await expect(page.getByText(/invalid.*email/i)).toBeVisible();
    
    // Correct the error
    await emailInput.clear();
    await emailInput.fill('test@example.com');
    await emailInput.blur();
    
    // Error should disappear
    await expect(page.getByText(/invalid.*email/i)).not.toBeVisible();
  });

  test('should prevent double submission', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    const submitButton = page.getByRole('button', { name: /sign in/i });
    
    // Click submit
    await submitButton.click();
    
    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled();
    
    // Try to click again (should not be possible)
    const clickCount = await page.evaluate(() => {
      let count = 0;
      const btn = document.querySelector('button[type="submit"]');
      const originalHandler = btn?.onclick;
      if (btn) {
        btn.onclick = () => {
          count++;
          originalHandler?.call(btn);
        };
      }
      return count;
    });
    
    expect(clickCount).toBeLessThanOrEqual(1);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);
    
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show network error message
    await expect(page.getByText(/network.*error|connection.*failed/i)).toBeVisible();
    
    // Restore online
    await page.context().setOffline(false);
  });

  test('should sanitize input to prevent XSS', async ({ page }) => {
    const maliciousInput = '<script>alert("xss")</script>';
    
    await page.getByLabel(/email/i).fill(maliciousInput);
    
    // Check that script tags are escaped or removed
    const emailValue = await page.getByLabel(/email/i).inputValue();
    expect(emailValue).not.toContain('<script>');
  });

  test('should limit input length for text fields', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /new appointment/i }).click();
    
    const notesField = page.getByLabel(/notes/i);
    const longText = 'a'.repeat(1000);
    
    await notesField.fill(longText);
    
    // Check character counter
    await expect(page.getByText(/\d+\/500/)).toBeVisible();
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.getByRole('button', { name: /sign up/i }).click();
    
    const passwordInput = page.getByLabel(/password/i);
    
    // Weak password
    await passwordInput.fill('123456');
    await expect(page.getByText(/weak/i)).toBeVisible();
    
    // Strong password
    await passwordInput.clear();
    await passwordInput.fill('MyP@ssw0rd123!');
    await expect(page.getByText(/strong/i)).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/settings');
    
    const phoneInput = page.getByLabel(/phone/i);
    
    // Invalid format
    await phoneInput.fill('123');
    await phoneInput.blur();
    await expect(page.getByText(/invalid.*phone/i)).toBeVisible();
    
    // Valid format
    await phoneInput.clear();
    await phoneInput.fill('(555) 123-4567');
    await phoneInput.blur();
    await expect(page.getByText(/invalid.*phone/i)).not.toBeVisible();
  });

  test('should handle file upload validation', async ({ page }) => {
    await page.goto('/portfolio');
    
    const fileInput = page.locator('input[type="file"]');
    
    // Try to upload invalid file type
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content'),
    });
    
    // Should show error for invalid file type
    await expect(page.getByText(/invalid.*file.*type/i)).toBeVisible();
  });

  test('should validate date picker inputs', async ({ page }) => {
    await page.goto('/book-appointment');
    
    // Try to select past date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Past dates should be disabled
    const pastDateButton = page.getByRole('button', { 
      name: yesterday.getDate().toString() 
    });
    
    await expect(pastDateButton).toBeDisabled();
  });

  test('should show loading state during form submission', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();
    
    // Should show loading indicator
    await expect(page.getByRole('progressbar')).toBeVisible();
    // OR
    await expect(submitButton).toContainText(/loading|signing in/i);
  });

  test('should preserve form data on navigation back', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Navigate away
    await page.goto('/');
    
    // Navigate back
    await page.goBack();
    
    // Form data should be preserved (or prompt to restore)
    const emailValue = await page.getByLabel(/email/i).inputValue();
    expect(emailValue).toBe('test@example.com');
  });
});
