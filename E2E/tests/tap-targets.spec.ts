import { test, expect } from '@playwright/test';

test.describe('Tap Target Size Compliance', () => {
  test('all buttons meet 44x44px minimum on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    const buttons = await page.locator('button, a[role="button"]').all();
    const violations: string[] = [];
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const box = await button.boundingBox();
      
      if (box) {
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        const identifier = ariaLabel || text?.trim() || `button-${i}`;
        
        if (box.height < 44 || box.width < 44) {
          violations.push(
            `${identifier}: ${Math.round(box.width)}×${Math.round(box.height)}px (need 44×44px)`
          );
        }
      }
    }
    
    if (violations.length > 0) {
      console.error('Tap target violations:', violations);
    }
    
    expect(violations).toHaveLength(0);
  });

  test('sidebar trigger meets minimum size', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find sidebar trigger button
    const trigger = page.locator('[data-sidebar="trigger"]');
    await expect(trigger).toBeVisible();
    
    const box = await trigger.boundingBox();
    
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  });

  test('notification bell meets minimum size', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find notification button
    const notificationButton = page.locator('button[aria-label*="Notification"]');
    
    if (await notificationButton.count() > 0) {
      const box = await notificationButton.boundingBox();
      
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('icon buttons in cards meet minimum size', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/client-requests');
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Find edit/delete buttons
    const actionButtons = page.locator('button[aria-label*="Edit"], button[aria-label*="Delete"]');
    const count = await actionButtons.count();
    
    for (let i = 0; i < count; i++) {
      const button = actionButtons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('mobile nav items have adequate spacing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Find mobile nav buttons
    const navButtons = page.locator('nav[aria-label*="Mobile"] button').all();
    
    const boxes = await Promise.all(
      (await navButtons).map(btn => btn.boundingBox())
    );
    
    // Check spacing between adjacent buttons
    for (let i = 0; i < boxes.length - 1; i++) {
      const box1 = boxes[i];
      const box2 = boxes[i + 1];
      
      if (box1 && box2) {
        const spacing = box2.x - (box1.x + box1.width);
        expect(spacing).toBeGreaterThanOrEqual(8);
      }
    }
  });

  test('dialog close buttons meet minimum size', async ({ page }) => {
    await page.goto('/appointments');
    
    // Open appointment details dialog
    const firstAppointment = page.locator('[data-testid="appointment-card"]').first();
    
    if (await firstAppointment.count() > 0) {
      await firstAppointment.click();
      
      // Check close button size
      const closeButton = page.locator('button[aria-label="Close dialog"]');
      await expect(closeButton).toBeVisible();
      
      const box = await closeButton.boundingBox();
      
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('appointment action buttons have proper spacing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/appointments');
    
    // Open first appointment
    const firstAppointment = page.locator('[data-testid="appointment-card"]').first();
    
    if (await firstAppointment.count() > 0) {
      await firstAppointment.click();
      
      // Wait for dialog
      await page.waitForSelector('[role="dialog"]');
      
      // Find action buttons container
      const buttonContainer = page.locator('div.flex.gap-3');
      
      if (await buttonContainer.count() > 0) {
        const buttons = buttonContainer.locator('button').all();
        const boxes = await Promise.all(
          (await buttons).map(btn => btn.boundingBox())
        );
        
        // Verify spacing
        for (let i = 0; i < boxes.length - 1; i++) {
          if (boxes[i] && boxes[i + 1]) {
            const spacing = boxes[i + 1]!.x - (boxes[i]!.x + boxes[i]!.width);
            expect(spacing).toBeGreaterThanOrEqual(8);
          }
        }
      }
    }
  });

  test('all interactive elements meet minimum on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    const interactive = await page.locator('button, a[href], input[type="button"], input[type="submit"]').all();
    const violations: string[] = [];
    
    for (let i = 0; i < interactive.length; i++) {
      const elem = interactive[i];
      const box = await elem.boundingBox();
      
      if (box && (box.height < 44 || box.width < 44)) {
        const tag = await elem.evaluate(el => el.tagName);
        violations.push(`${tag} ${i}: ${Math.round(box.width)}×${Math.round(box.height)}px`);
      }
    }
    
    expect(violations).toHaveLength(0);
  });
});
