import { test, expect } from '@playwright/test';

// Test helper to login
import { Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/auth');
  await page.getByLabel(/email/i).fill('stylist@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/dashboard');
}

test.describe('Appointments Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/appointments');
  });

  test('should display appointments list', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /appointments/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /new appointment/i })
    ).toBeVisible();
  });

  test('should filter appointments by status', async ({ page }) => {
    // Open status filter
    await page.getByRole('combobox', { name: /status/i }).click();

    // Select 'confirmed'
    await page.getByRole('option', { name: /confirmed/i }).click();

    // Verify filtered results only show confirmed appointments
    const badges = page.locator('[data-testid="status-badge"]');
    const count = await badges.count();

    for (let i = 0; i < count; i++) {
      await expect(badges.nth(i)).toHaveText(/confirmed/i);
    }
  });

  test('should search appointments by client name', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('John');

    // Wait for results to update
    await page.waitForTimeout(500);

    // All visible appointments should contain 'John'
    const appointments = page.locator('[data-testid="appointment-card"]');
    const firstAppointment = appointments.first();
    await expect(firstAppointment).toContainText(/john/i);
  });

  test('should open appointment details dialog', async ({ page }) => {
    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();

    // Dialog should open with details
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/appointment details/i)).toBeVisible();
  });

  test('should update appointment status with confirmation', async ({
    page,
  }) => {
    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();

    // Click confirm button
    await page.getByRole('button', { name: /confirm/i }).click();

    // Confirmation dialog should appear
    await expect(
      page.getByRole('dialog', { name: /confirm appointment/i })
    ).toBeVisible();

    // Confirm the action
    await page.getByRole('button', { name: /yes/i }).click();

    // Success message should appear
    await expect(page.getByText(/appointment confirmed/i)).toBeVisible();
  });

  test('should prevent double-clicking status update', async ({ page }) => {
    let updateCount = 0;

    page.on('request', request => {
      if (
        request.url().includes('appointments') &&
        request.method() === 'PATCH'
      ) {
        updateCount++;
      }
    });

    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();

    const confirmButton = page.getByRole('button', { name: /confirm/i });

    // Rapidly click 5 times
    await confirmButton.click();
    await confirmButton.click();
    await confirmButton.click();

    // Confirm in dialog
    await page.getByRole('button', { name: /yes/i }).click();

    await page.waitForTimeout(2000);

    // Should only make one update request
    expect(updateCount).toBeLessThanOrEqual(1);
  });

  test('should toggle between list and calendar view', async ({ page }) => {
    // Click calendar view tab
    await page.getByRole('tab', { name: /calendar/i }).click();

    // Calendar should be visible
    await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();

    // Switch back to list
    await page.getByRole('tab', { name: /list/i }).click();
    await expect(
      page.locator('[data-testid="appointments-list"]')
    ).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab to first appointment
    await page.keyboard.press('Tab'); // Skip to main content
    await page.keyboard.press('Tab'); // First appointment

    // Open with Enter
    await page.keyboard.press('Enter');

    await expect(page.getByRole('dialog')).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
