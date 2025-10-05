import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Comprehensive Test Report Generator
 * Runs all test categories and generates detailed report
 */

interface TestResult {
  category: string;
  test: string;
  status: 'passed' | 'failed' | 'warning';
  message?: string;
  screenshot?: string;
}

const testReport: TestResult[] = [];

async function login(page: any) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Complete System Test Suite', () => {
  test.afterAll(async () => {
    // Generate report
    const reportPath = path.join(__dirname, '../test-results/system-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
    
    // Generate HTML report
    const htmlReport = generateHTMLReport(testReport);
    fs.writeFileSync(
      path.join(__dirname, '../test-results/system-test-report.html'),
      htmlReport
    );
  });

  test('1. Interactive Elements Inventory', async ({ page }) => {
    await login(page);
    
    const pages = [
      '/dashboard',
      '/appointments',
      '/clients',
      '/services',
      '/formulas',
      '/portfolio',
      '/schedule',
      '/finance',
      '/messages',
      '/settings'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Count interactive elements
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      const inputs = await page.locator('input').count();
      const selects = await page.locator('select').count();
      
      testReport.push({
        category: 'Interactive Elements',
        test: `${pagePath} - Element Count`,
        status: 'passed',
        message: `Buttons: ${buttons}, Links: ${links}, Inputs: ${inputs}, Selects: ${selects}`
      });
    }
  });

  test('2. Dead Link Detection', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    
    const links = await page.locator('a[href]').all();
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      
      if (href && !href.startsWith('http') && href !== '#') {
        try {
          await page.goto(href);
          testReport.push({
            category: 'Navigation',
            test: `Link to ${href}`,
            status: 'passed'
          });
        } catch (error) {
          testReport.push({
            category: 'Navigation',
            test: `Link to ${href}`,
            status: 'failed',
            message: 'Dead link detected'
          });
        }
      }
    }
  });

  test('3. Form Validation Coverage', async ({ page }) => {
    await login(page);
    
    // Test appointment form
    await page.goto('/appointments');
    await page.click('button:has-text("New Appointment")');
    
    // Try submitting empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    const hasErrors = await page.locator('text=/required|invalid|error/i').count();
    
    testReport.push({
      category: 'Form Validation',
      test: 'Appointment Form - Empty Submission',
      status: hasErrors > 0 ? 'passed' : 'failed',
      message: hasErrors > 0 ? 'Validation working' : 'No validation errors shown'
    });
  });

  test('4. Responsive Layout Verification', async ({ page }) => {
    await login(page);
    
    const breakpoints = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/dashboard');
      
      // Check for horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => 
        document.documentElement.scrollWidth > window.innerWidth
      );
      
      // Take screenshot
      const screenshot = await page.screenshot();
      
      testReport.push({
        category: 'Responsive Design',
        test: `${bp.name} Layout`,
        status: hasHorizontalScroll ? 'warning' : 'passed',
        message: hasHorizontalScroll ? 'Horizontal overflow detected' : 'Layout responsive',
        screenshot: screenshot.toString('base64')
      });
    }
  });

  test('5. Performance Metrics', async ({ page }) => {
    await page.goto('/auth');
    
    const startTime = Date.now();
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    const loadTime = Date.now() - startTime;
    
    testReport.push({
      category: 'Performance',
      test: 'Login to Dashboard Load Time',
      status: loadTime < 3000 ? 'passed' : 'warning',
      message: `${loadTime}ms`
    });
    
    // Measure page metrics
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
      };
    });
    
    testReport.push({
      category: 'Performance',
      test: 'DOM Content Loaded',
      status: metrics.domContentLoaded < 1800 ? 'passed' : 'warning',
      message: `${metrics.domContentLoaded.toFixed(2)}ms`
    });
  });

  test('6. Accessibility Audit', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    
    // Check for ARIA landmarks
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"]').count();
    
    testReport.push({
      category: 'Accessibility',
      test: 'ARIA Landmarks',
      status: landmarks >= 2 ? 'passed' : 'warning',
      message: `Found ${landmarks} landmarks`
    });
    
    // Check alt text on images
    const images = await page.locator('img').all();
    let missingAlt = 0;
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt) missingAlt++;
    }
    
    testReport.push({
      category: 'Accessibility',
      test: 'Image Alt Text',
      status: missingAlt === 0 ? 'passed' : 'warning',
      message: `${missingAlt} images missing alt text`
    });
  });

  test('7. Error State Handling', async ({ page }) => {
    await login(page);
    
    // Try to access invalid route
    await page.goto('/invalid-route-that-does-not-exist');
    
    // Should show 404 or redirect
    const has404 = await page.locator('text=/404|not found/i').count() > 0;
    const isRedirected = page.url().includes('/dashboard');
    
    testReport.push({
      category: 'Error Handling',
      test: '404 Page Handling',
      status: (has404 || isRedirected) ? 'passed' : 'failed',
      message: has404 ? '404 page shown' : 'Redirected to dashboard'
    });
  });

  test('8. Console Error Detection', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await login(page);
    
    const pages = ['/dashboard', '/appointments', '/clients'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
    }
    
    testReport.push({
      category: 'Console Errors',
      test: 'Application Error Log',
      status: errors.length === 0 ? 'passed' : 'warning',
      message: errors.length > 0 ? errors.join(', ') : 'No console errors'
    });
  });

  test('9. Network Request Monitoring', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.url()} - ${response.status()}`);
      }
    });
    
    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    testReport.push({
      category: 'Network',
      test: 'Failed Request Detection',
      status: failedRequests.length === 0 ? 'passed' : 'warning',
      message: failedRequests.length > 0 ? failedRequests.join(', ') : 'All requests successful'
    });
  });

  test('10. Feature Completeness Check', async ({ page }) => {
    await login(page);
    
    const features = [
      { name: 'Dashboard', path: '/dashboard', element: 'main' },
      { name: 'Appointments', path: '/appointments', element: 'button:has-text("New Appointment")' },
      { name: 'Clients', path: '/clients', element: 'button:has-text("Add Client")' },
      { name: 'AI Formulas', path: '/formulas', element: 'button:has-text("Generate")' },
      { name: 'Portfolio', path: '/portfolio', element: 'button:has-text("Add Photo")' },
    ];
    
    for (const feature of features) {
      await page.goto(feature.path);
      const exists = await page.locator(feature.element).count() > 0;
      
      testReport.push({
        category: 'Feature Completeness',
        test: feature.name,
        status: exists ? 'passed' : 'failed',
        message: exists ? 'Feature accessible' : 'Feature missing or broken'
      });
    }
  });
});

function generateHTMLReport(results: TestResult[]): string {
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Hair A.I. System Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    .stat-number {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
    }
    .passed { color: #10b981; }
    .failed { color: #ef4444; }
    .warning { color: #f59e0b; }
    .results {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .test-item {
      padding: 15px;
      border-left: 4px solid #ddd;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .test-item.passed { border-color: #10b981; background: #f0fdf4; }
    .test-item.failed { border-color: #ef4444; background: #fef2f2; }
    .test-item.warning { border-color: #f59e0b; background: #fffbeb; }
    .category { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .test-name { font-size: 16px; margin: 5px 0; }
    .message { color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 Hair A.I. System Test Report</h1>
    <p>Comprehensive automated testing results</p>
  </div>
  
  <div class="summary">
    <div class="stat-card">
      <div class="category">Passed</div>
      <div class="stat-number passed">${passed}</div>
    </div>
    <div class="stat-card">
      <div class="category">Warnings</div>
      <div class="stat-number warning">${warnings}</div>
    </div>
    <div class="stat-card">
      <div class="category">Failed</div>
      <div class="stat-number failed">${failed}</div>
    </div>
  </div>
  
  <div class="results">
    <h2>Detailed Results</h2>
    ${results.map(r => `
      <div class="test-item ${r.status}">
        <div class="category">${r.category}</div>
        <div class="test-name">${r.test}</div>
        ${r.message ? `<div class="message">${r.message}</div>` : ''}
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;
}
