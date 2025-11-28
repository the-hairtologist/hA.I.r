# E2E Test Suite

## Overview

End-to-end tests for critical user journeys using Playwright framework.

## Setup

### Installation

```bash
npm install -D @playwright/test
npx playwright install
```

### Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

## Test Structure

```
E2E/
├── tests/
│   ├── auth.spec.ts          # Authentication flows
│   ├── appointments.spec.ts  # Appointment management
│   ├── client-requests.spec.ts # Client post creation
│   ├── formulas.spec.ts      # Formula management
│   └── accessibility.spec.ts # A11y checks
├── fixtures/
│   └── test-data.ts          # Test data and utilities
├── playwright.config.ts      # Playwright configuration
└── README.md                 # This file
```

## Test Coverage

### P0 Flows (Must Pass)

- ✅ User sign up & sign in
- ✅ Appointment creation & status updates
- ✅ Client request posting
- ✅ Form submission with validation
- ✅ Keyboard navigation in dialogs

### P1 Flows (Important)

- Formula creation & saving
- Message sending
- Calendar view navigation
- Service management
- Profile updates

### Accessibility Tests

- Keyboard navigation
- Screen reader compatibility
- Focus management
- ARIA labels
- Color contrast

## Performance Budgets

Tests will fail if:

- Page load > 3s
- First Contentful Paint > 1.8s
- Largest Contentful Paint > 2.5s
- Total Blocking Time > 300ms

## CI/CD Integration

Add to `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Writing New Tests

### Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login, navigate, etc.
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.fill('[name="email"]', 'test@example.com');

    // Act
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Best Practices

1. Use data-testid for stable selectors
2. Wait for network idle on navigation
3. Test happy path + error states
4. Keep tests independent
5. Use page objects for reusable logic
6. Add accessibility checks with @axe-core/playwright

## Debugging

### Visual Debugging

```bash
npx playwright test --headed --debug
```

### Screenshots on Failure

Tests automatically capture screenshots on failure in `test-results/`

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

## Status

**Current Coverage**: 50% (5/10 critical flows)  
**Target Coverage**: 90% (9/10 critical flows)  
**Next Priority**: Appointment booking flow, payment integration
