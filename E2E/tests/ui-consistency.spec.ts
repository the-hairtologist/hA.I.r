import { test, expect } from '@playwright/test';

/**
 * UI/UX Consistency Tests
 * Verifies design system adherence, visual hierarchy, and consistent styling
 */

async function login(page: any) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Design System Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('primary buttons should have consistent styling', async ({ page }) => {
    const pages = ['/dashboard', '/appointments', '/clients', '/services'];
    const buttonStyles: any[] = [];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      const primaryButton = page.locator('button.btn-primary, button[variant="default"]').first();
      
      if (await primaryButton.count() > 0) {
        const style = await primaryButton.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
          };
        });
        
        buttonStyles.push(style);
      }
    }
    
    // All primary buttons should have same styling
    if (buttonStyles.length > 1) {
      const first = buttonStyles[0];
      for (const style of buttonStyles.slice(1)) {
        expect(style.backgroundColor).toBe(first.backgroundColor);
        expect(style.borderRadius).toBe(first.borderRadius);
      }
    }
  });

  test('headings should follow hierarchy', async ({ page }) => {
    const pages = ['/dashboard', '/appointments', '/clients'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Get all headings
      const h1 = await page.locator('h1').count();
      const h2 = await page.locator('h2').count();
      const h3 = await page.locator('h3').count();
      
      // Should have exactly one h1
      expect(h1).toBe(1);
      
      // If h3 exists, h2 should exist
      if (h3 > 0) {
        expect(h2).toBeGreaterThan(0);
      }
      
      // Check font sizes are properly scaled
      const h1Size = await page.locator('h1').first().evaluate(el => 
        parseFloat(window.getComputedStyle(el).fontSize)
      );
      
      if (h2 > 0) {
        const h2Size = await page.locator('h2').first().evaluate(el => 
          parseFloat(window.getComputedStyle(el).fontSize)
        );
        expect(h1Size).toBeGreaterThan(h2Size);
      }
    }
  });

  test('color tokens should use HSL format', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check CSS custom properties
    const hasHSLColors = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = window.getComputedStyle(root);
      
      // Check primary color format
      const primary = styles.getPropertyValue('--primary');
      const secondary = styles.getPropertyValue('--secondary');
      
      // HSL format should be like "240 100% 50%"
      const hslPattern = /^\d+\s+\d+%\s+\d+%$/;
      
      return (
        hslPattern.test(primary.trim()) &&
        hslPattern.test(secondary.trim())
      );
    });
    
    expect(hasHSLColors).toBe(true);
  });

  test('spacing should be consistent using design tokens', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check cards have consistent padding
    const cards = await page.locator('[class*="card"]').all();
    const paddings = new Set<string>();
    
    for (const card of cards.slice(0, 5)) {
      const padding = await card.evaluate(el => 
        window.getComputedStyle(el).padding
      );
      paddings.add(padding);
    }
    
    // Should have at most 2-3 different padding values (for different card sizes)
    expect(paddings.size).toBeLessThanOrEqual(3);
  });

  test('icons should be consistent size within sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check nav icons
    const navIcons = await page.locator('nav svg').all();
    const sizes = new Set<string>();
    
    for (const icon of navIcons) {
      const size = await icon.evaluate(el => {
        return `${el.clientWidth}x${el.clientHeight}`;
      });
      sizes.add(size);
    }
    
    // All nav icons should be same size
    expect(sizes.size).toBeLessThanOrEqual(2); // Allow for active state difference
  });

  test('border radius should be consistent', async ({ page }) => {
    const pages = ['/dashboard', '/appointments', '/clients'];
    const borderRadii = new Set<string>();
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 3)) {
        const radius = await button.evaluate(el => 
          window.getComputedStyle(el).borderRadius
        );
        borderRadii.add(radius);
      }
    }
    
    // Should use design system radius values (e.g., 0.5rem, 0.75rem, 1rem)
    expect(borderRadii.size).toBeLessThanOrEqual(4);
  });
});

test.describe('Visual Feedback Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('hover states should be visible', async ({ page }) => {
    await page.goto('/dashboard');
    
    const interactiveElements = await page.locator('button, a, [role="button"]').all();
    
    for (const element of interactiveElements.slice(0, 10)) {
      if (await element.isVisible()) {
        // Get styles before hover
        const beforeHover = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            transform: computed.transform,
            opacity: computed.opacity,
          };
        });
        
        // Hover
        await element.hover();
        await page.waitForTimeout(100);
        
        // Get styles after hover
        const afterHover = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            backgroundColor: computed.backgroundColor,
            transform: computed.transform,
            opacity: computed.opacity,
          };
        });
        
        // Should have some visual change
        const hasChange = (
          beforeHover.backgroundColor !== afterHover.backgroundColor ||
          beforeHover.transform !== afterHover.transform ||
          beforeHover.opacity !== afterHover.opacity
        );
        
        expect(hasChange).toBe(true);
      }
    }
  });

  test('focus states should be visible', async ({ page }) => {
    await page.goto('/dashboard');
    
    const focusable = await page.locator('button, a, input').first();
    
    if (await focusable.count() > 0) {
      await focusable.focus();
      
      // Check for focus ring
      const hasFocusRing = await focusable.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return (
          computed.outline !== 'none' ||
          computed.boxShadow.includes('rgb') ||
          computed.borderColor !== 'rgb(0, 0, 0)'
        );
      });
      
      expect(hasFocusRing).toBe(true);
    }
  });

  test('disabled states should be visually distinct', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find or create disabled button
    const disabledButton = page.locator('button:disabled').first();
    
    if (await disabledButton.count() > 0) {
      const opacity = await disabledButton.evaluate(el => 
        parseFloat(window.getComputedStyle(el).opacity)
      );
      
      // Disabled elements should have reduced opacity
      expect(opacity).toBeLessThan(1);
    }
  });

  test('loading states should be animated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for loading spinners
    const spinner = page.locator('[data-loading], .animate-spin, .spinner').first();
    
    if (await spinner.count() > 0) {
      // Check animation
      const isAnimated = await spinner.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.animation !== 'none' || computed.animationName !== 'none';
      });
      
      expect(isAnimated).toBe(true);
    }
  });
});

test.describe('Dark/Light Mode Consistency', () => {
  test('should support theme switching', async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    
    // Look for theme toggle
    const themeToggle = page.locator('button:has-text("Dark"), button:has-text("Light"), button:has-text("Theme")').first();
    
    if (await themeToggle.count() > 0) {
      // Get initial background
      const initialBg = await page.evaluate(() => 
        window.getComputedStyle(document.body).backgroundColor
      );
      
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(300);
      
      // Background should change
      const newBg = await page.evaluate(() => 
        window.getComputedStyle(document.body).backgroundColor
      );
      
      expect(newBg).not.toBe(initialBg);
    }
  });

  test('all text should be readable in both themes', async ({ page }) => {
    await login(page);
    
    const pages = ['/dashboard', '/appointments', '/clients'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Check contrast ratio (simplified)
      const textElements = await page.locator('p, span, h1, h2, h3').all();
      
      for (const text of textElements.slice(0, 10)) {
        if (await text.isVisible()) {
          const contrast = await text.evaluate(el => {
            const textColor = window.getComputedStyle(el).color;
            const bgElement = el.parentElement!;
            const bgColor = window.getComputedStyle(bgElement).backgroundColor;
            
            // Simple check: colors should not be same
            return textColor !== bgColor;
          });
          
          expect(contrast).toBe(true);
        }
      }
    }
  });
});

test.describe('Animation Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('page transitions should be smooth', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to another page
    const startTime = Date.now();
    await page.click('a[href="/appointments"]');
    await page.waitForURL('/appointments');
    const endTime = Date.now();
    
    // Transition should be fast (<500ms)
    const transitionTime = endTime - startTime;
    expect(transitionTime).toBeLessThan(500);
    
    // Check for fade animation
    const hasTransition = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? window.getComputedStyle(main).transition !== 'none' : false;
    });
    
    expect(hasTransition).toBe(true);
  });

  test('modal animations should be consistent', async ({ page }) => {
    await page.goto('/appointments');
    
    // Open modal
    await page.click('button:has-text("New Appointment")');
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();
    
    // Check animation
    const hasAnimation = await dialog.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.animation !== 'none';
    });
    
    expect(hasAnimation).toBe(true);
  });
});

test.describe('Responsive Typography', () => {
  test('font sizes should scale with viewport', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    
    // Desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopH1Size = await page.locator('h1').first().evaluate(el => 
      parseFloat(window.getComputedStyle(el).fontSize)
    );
    
    // Mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileH1Size = await page.locator('h1').first().evaluate(el => 
      parseFloat(window.getComputedStyle(el).fontSize)
    );
    
    // Mobile should be smaller or equal (not larger)
    expect(mobileH1Size).toBeLessThanOrEqual(desktopH1Size);
  });

  test('text should not overflow containers', async ({ page }) => {
    await login(page);
    const sizes = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 375, height: 667 }
    ];
    
    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto('/dashboard');
      
      const hasOverflow = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, span, h1, h2, h3');
        for (const el of Array.from(elements)) {
          const htmlEl = el as HTMLElement;
          if (htmlEl.scrollWidth > htmlEl.clientWidth) {
            return true;
          }
        }
        return false;
      });
      
      expect(hasOverflow).toBe(false);
    }
  });
});
