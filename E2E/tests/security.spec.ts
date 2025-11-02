import { test, expect } from '@playwright/test';

test.describe('Security', () => {
  test('should not expose sensitive data in client-side code', async ({
    page,
  }) => {
    await page.goto('/');

    // Check that no API keys are exposed
    const content = await page.content();
    expect(content).not.toContain('sk_live_');
    expect(content).not.toContain('api_key');
    expect(content).not.toContain('secret_key');
  });

  test('should redirect unauthenticated users from protected routes', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Should redirect to auth page
    await page.waitForURL('/auth');
    expect(page.url()).toContain('/auth');
  });

  test('should clear session data on logout', async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('/dashboard');

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();

    // Check that localStorage is cleared
    const localStorageData = await page.evaluate(() => localStorage.length);
    expect(localStorageData).toBe(0);

    // Check that cookies are cleared
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(
      c => c.name.includes('auth') || c.name.includes('session')
    );
    expect(authCookies.length).toBe(0);
  });

  test('should not allow SQL injection in search inputs', async ({ page }) => {
    await page.goto('/stylists');

    const searchInput = page.getByPlaceholder(/search/i);

    // Try SQL injection
    await searchInput.fill("'; DROP TABLE users; --");
    await page.keyboard.press('Enter');

    // Should not crash or expose database structure
    await expect(page.getByText(/error.*database/i)).not.toBeVisible();

    // Page should still function normally
    await expect(page.locator('[data-testid="stylist-card"]')).toBeVisible();
  });

  test('should not allow XSS through user input', async ({ page }) => {
    await page.goto('/settings');

    const nameInput = page.getByLabel(/full name/i);

    // Try XSS payload
    await nameInput.fill('<img src=x onerror="alert(\'xss\')">');
    await page.getByRole('button', { name: /save/i }).click();

    // Should not execute script
    page.on('dialog', () => {
      throw new Error('XSS alert dialog should not appear');
    });

    // Content should be escaped
    await page.reload();
    const displayedName = await page.getByText(/<img src=x/).textContent();
    expect(displayedName).toContain('&lt;');
  });

  test('should implement CSRF protection', async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');

    // Check for CSRF token in forms
    const csrfToken = await page.locator('input[name="csrf_token"]').count();
    expect(csrfToken).toBeGreaterThan(0);
  });

  test('should enforce password complexity requirements', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('button', { name: /sign up/i }).click();

    const passwordInput = page.getByLabel(/password/i);

    // Weak passwords should be rejected
    const weakPasswords = ['123456', 'password', 'qwerty', 'abc123'];

    for (const weak of weakPasswords) {
      await passwordInput.clear();
      await passwordInput.fill(weak);
      await page.getByRole('button', { name: /create account/i }).click();

      await expect(page.getByText(/password.*too weak/i)).toBeVisible();
    }
  });

  test('should rate limit login attempts', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });

    // Try multiple failed logins
    for (let i = 0; i < 5; i++) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();
      await page.waitForTimeout(500);
    }

    // Should show rate limit message
    await expect(page.getByText(/too many.*attempts/i)).toBeVisible();

    // Button should be disabled
    await expect(submitButton).toBeDisabled();
  });

  test('should not expose user enumeration', async ({ page }) => {
    await page.goto('/auth');

    // Try with non-existent email
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    const errorMessage1 = await page.getByText(/invalid/i).textContent();

    // Try with existing email but wrong password
    await page.getByLabel(/email/i).clear();
    await page.getByLabel(/email/i).fill('existing@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    const errorMessage2 = await page.getByText(/invalid/i).textContent();

    // Error messages should be identical
    expect(errorMessage1).toBe(errorMessage2);
  });

  test('should use secure HTTPS connections', async ({ page }) => {
    await page.goto('/');

    // Check that all resources are loaded over HTTPS (in production)
    const insecureResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.filter(r => r.name.startsWith('http://')).length;
    });

    if (!process.env.DEV) {
      expect(insecureResources).toBe(0);
    }
  });

  test('should implement Content Security Policy', async ({ page }) => {
    const response = await page.goto('/');

    // Check for CSP headers (in production)
    const cspHeader = response?.headers()['content-security-policy'];

    if (!process.env.DEV && cspHeader) {
      expect(cspHeader).toContain("default-src 'self'");
    }
  });

  test('should sanitize file uploads', async ({ page }) => {
    await page.goto('/portfolio');

    const fileInput = page.locator('input[type="file"]');

    // Try to upload executable file
    await fileInput.setInputFiles({
      name: 'malicious.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('MZ'),
    });

    // Should reject executable files
    await expect(page.getByText(/invalid.*file/i)).toBeVisible();
  });

  test('should implement secure session timeout', async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('/dashboard');

    // Simulate session timeout (advance time)
    await page.evaluate(() => {
      const expiry = new Date(Date.now() - 1000).toISOString();
      localStorage.setItem('session_expiry', expiry);
    });

    // Navigate to protected route
    await page.goto('/settings');

    // Should redirect to login
    await page.waitForURL('/auth');
    await expect(page.getByText(/session.*expired/i)).toBeVisible();
  });

  test('should prevent signup with leaked passwords', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('button', { name: /sign up/i }).click();

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/^password$/i);

    // Try commonly leaked password
    await emailInput.fill('newuser@example.com');
    await passwordInput.fill('password123456'); // Common leaked password
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show error about leaked password
    await expect(
      page.getByText(/password.*compromised|password.*leaked/i)
    ).toBeVisible();
  });

  test('should enforce medical data consent', async ({ page }) => {
    // Login as stylist
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('stylist@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('/dashboard');

    // Try to access client medical data
    await page.goto('/clients/client-id-without-consent');

    // Medical fields should be masked or hidden
    const allergyField = page.locator('[data-testid="allergies-field"]');
    if ((await allergyField.count()) > 0) {
      const allergyText = await allergyField.textContent();
      expect(allergyText).toMatch(/consent required|not shared/i);
    }
  });

  test('should rate limit calendar token access', async ({ page }) => {
    // Make multiple rapid calendar token requests
    const responses = [];

    for (let i = 0; i < 12; i++) {
      const response = await page.request.post('/api/calendar/token', {
        data: { connection_id: 'test-connection-id' },
      });
      responses.push(response);
    }

    // Should get rate limited after 10 attempts
    const rateLimited = responses.slice(10).some(r => r.status() === 429);
    expect(rateLimited).toBe(true);
  });

  test('should audit SECURITY DEFINER function calls', async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('/dashboard');

    // Perform action that calls SECURITY DEFINER function
    await page.goto('/admin/users');
    await page
      .getByRole('button', { name: /grant admin/i })
      .first()
      .click();
    await page.getByRole('button', { name: /confirm/i }).click();

    // Check audit logs
    await page.goto('/admin/audit-logs');
    await expect(page.getByText(/ADMIN_GRANT/i)).toBeVisible();
  });

  test('should protect admin security dashboard', async ({ page }) => {
    // Try to access as non-admin
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('user@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('/dashboard');

    // Try to access security dashboard
    await page.goto('/admin/security');

    // Should redirect or show unauthorized
    await expect(page.url()).not.toContain('/admin/security');
  });

  test('should display security health metrics', async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('/dashboard');

    // Navigate to security dashboard
    await page.goto('/admin/security');

    // Should show security health score
    await expect(page.getByText(/security health/i)).toBeVisible();
    await expect(page.getByText(/\d+\/100/)).toBeVisible();

    // Should show metrics cards
    await expect(page.getByText(/failed login attempts/i)).toBeVisible();
    await expect(page.getByText(/security events/i)).toBeVisible();
    await expect(page.getByText(/suspicious activities/i)).toBeVisible();
  });
});
