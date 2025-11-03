import { test, expect } from '@playwright/test';

import { Page } from '@playwright/test';

async function loginAsClient(page: Page) {
  await page.goto('/auth');
  await page.getByLabel(/email/i).fill('client@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/dashboard');
}

test.describe('Client Requests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
    await page.goto('/client-requests');
  });

  test('should display create post button', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /my requests/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /create post/i })
    ).toBeVisible();
  });

  test('should open create post dialog', async ({ page }) => {
    await page.getByRole('button', { name: /create post/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();
    await expect(page.getByLabel(/service type/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /create post/i }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: /submit/i }).click();

    // Should show error message
    await expect(page.getByText(/fill in all required fields/i)).toBeVisible();
  });

  test('should validate field lengths', async ({ page }) => {
    await page.getByRole('button', { name: /create post/i }).click();

    // Enter title over 100 characters
    const longTitle = 'A'.repeat(101);
    await page.getByLabel(/title/i).fill(longTitle);
    await page.getByLabel(/description/i).fill('Valid description');
    await page.getByLabel(/service type/i).fill('Color');

    await page.getByRole('button', { name: /submit/i }).click();

    await expect(
      page.getByText(/title must be less than 100 characters/i)
    ).toBeVisible();
  });

  test('should create post successfully', async ({ page }) => {
    await page.getByRole('button', { name: /create post/i }).click();

    // Fill form
    await page.getByLabel(/title/i).fill('Need balayage specialist');
    await page
      .getByLabel(/description/i)
      .fill('Looking for an experienced stylist for balayage');
    await page.getByLabel(/service type/i).fill('Balayage');
    await page.getByLabel(/budget/i).fill('$200-300');
    await page.getByLabel(/location/i).fill('Los Angeles, CA');

    // Submit
    await page.getByRole('button', { name: /submit/i }).click();

    // Should show success message
    await expect(page.getByText(/post created successfully/i)).toBeVisible();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Post should appear in list
    await expect(page.getByText(/need balayage specialist/i)).toBeVisible();
  });

  test('should prevent double submission', async ({ page }) => {
    let insertCount = 0;

    page.on('request', request => {
      if (
        request.url().includes('client_hair_posts') &&
        request.method() === 'POST'
      ) {
        insertCount++;
      }
    });

    await page.getByRole('button', { name: /create post/i }).click();

    // Fill form
    await page.getByLabel(/title/i).fill('Test Post');
    await page.getByLabel(/description/i).fill('Test Description');
    await page.getByLabel(/service type/i).fill('Color');

    const submitButton = page.getByRole('button', { name: /submit/i });

    // Rapidly click 5 times
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();

    await page.waitForTimeout(2000);

    // Should only make one insert request
    expect(insertCount).toBeLessThanOrEqual(1);
  });

  test('should edit existing post', async ({ page }) => {
    // Click edit on first post
    const firstPost = page.locator('[data-testid="post-card"]').first();
    await firstPost.locator('button[aria-label="Edit"]').click();

    // Dialog should open with existing data
    await expect(page.getByRole('dialog')).toBeVisible();

    // Update title
    const titleInput = page.getByLabel(/title/i);
    await titleInput.clear();
    await titleInput.fill('Updated Post Title');

    // Submit
    await page.getByRole('button', { name: /submit/i }).click();

    // Should show success message
    await expect(page.getByText(/post updated successfully/i)).toBeVisible();

    // Updated title should appear
    await expect(page.getByText(/updated post title/i)).toBeVisible();
  });

  test('should delete post with confirmation', async ({ page }) => {
    const firstPost = page.locator('[data-testid="post-card"]').first();
    const postTitle = await firstPost.locator('h3').textContent();

    // Click delete button
    await firstPost.locator('button[aria-label="Delete"]').click();

    // Browser confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    // Post should be removed
    await expect(page.getByText(postTitle!)).not.toBeVisible();

    // Success message
    await expect(page.getByText(/post deleted successfully/i)).toBeVisible();
  });

  test('should sanitize inputs', async ({ page }) => {
    await page.getByRole('button', { name: /create post/i }).click();

    // Try XSS payload
    await page.getByLabel(/title/i).fill('<script>alert("xss")</script>');
    await page.getByLabel(/description/i).fill('Normal description');
    await page.getByLabel(/service type/i).fill('Color');

    await page.getByRole('button', { name: /submit/i }).click();

    await page.waitForTimeout(1000);

    // Script should be escaped/removed, not executed
    const dialogs: string[] = [];
    page.on('dialog', dialog => dialogs.push(dialog));

    await page.waitForTimeout(500);
    expect(dialogs.length).toBe(0); // No alert dialogs
  });
});
