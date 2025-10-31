# Testing Strategy & Guidelines

## Overview
This document outlines the comprehensive testing strategy for hA.I.r, covering unit tests, integration tests, and end-to-end tests.

## Testing Philosophy

**Test Pyramid:**
```
        /\
       /  \        E2E Tests (10%)
      /    \       - Critical user journeys
     /------\      - Cross-browser compatibility
    /        \     
   /          \    Integration Tests (30%)
  /            \   - Component interactions
 /--------------\  - API integrations
/                \ 
------------------  Unit Tests (60%)
                    - Pure functions
                    - Hooks
                    - Utilities
```

**Key Principles:**
- ✅ Test behavior, not implementation
- ✅ Focus on user-facing functionality
- ✅ Maintain >80% coverage on critical paths
- ✅ Fast tests (<5s for unit, <30s for E2E)

---

## Test Frameworks

### Unit & Integration Tests
- **Runner:** Vitest 3.2.4 (fast, ESM-native)
- **React Testing:** @testing-library/react 16.3.0
- **User Interactions:** @testing-library/user-event 14.6.1
- **Assertions:** Vitest expect (Jest-compatible)

### E2E Tests
- **Framework:** Playwright 1.55.1
- **Browsers:** Chrome, Firefox, Safari
- **Mobile:** iOS (iPhone 12), Android (Pixel 5)

---

## Running Tests

### Quick Commands
```bash
# Run all unit tests
npm test

# Watch mode (for development)
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (requires dev server)
npm run test:e2e

# E2E specific browser
npx playwright test --project=chromium

# E2E headed mode (see browser)
npx playwright test --headed
```

### CI/CD Integration
```bash
# Pre-commit hook (recommended)
npm test -- --run --reporter=verbose

# Full suite (runs in GitHub Actions)
npm run test:coverage && npm run test:e2e
```

---

## Test Structure

### Unit Tests

**Location:** `src/**/*.test.ts(x)` (co-located with source)

**Example: Pure Function Test**
```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toContain('base-class');
    expect(result).toContain('additional-class');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toContain('active');
  });
});
```

**Example: React Hook Test**
```typescript
// src/hooks/useAICall.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAICall } from './useAICall';

describe('useAICall', () => {
  it('should handle successful AI call', async () => {
    const { result } = renderHook(() => useAICall());
    
    await result.current.callAI({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: 'Test' }]
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
```

**Example: Component Test**
```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('Submit');
  });
});
```

### Integration Tests

**Location:** `src/**/*.integration.test.tsx`

**Example: Form Submission**
```typescript
// src/components/AppointmentForm.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppointmentForm } from './AppointmentForm';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('AppointmentForm Integration', () => {
  it('should submit appointment successfully', async () => {
    const onSuccess = vi.fn();
    render(<AppointmentForm onSuccess={onSuccess} />, { wrapper });
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Client Name'), 'John Doe');
    await userEvent.click(screen.getByLabelText('Date'));
    await userEvent.click(screen.getByText('15')); // Select 15th
    
    // Submit
    await userEvent.click(screen.getByRole('button', { name: 'Book' }));
    
    // Wait for success
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

### E2E Tests

**Location:** `E2E/tests/*.spec.ts`

**Example: User Journey**
```typescript
// E2E/tests/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Appointment Booking', () => {
  test('client can book an appointment', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('[type=email]', 'client@example.com');
    await page.fill('[type=password]', 'password123');
    await page.click('text=Sign In');

    // 2. Navigate to booking
    await page.click('text=Book Appointment');
    await expect(page).toHaveURL(/.*appointments/);

    // 3. Select stylist
    await page.click('[data-testid=stylist-card]:first-child');

    // 4. Pick date and time
    await page.click('[data-testid=date-picker]');
    await page.click('[data-date="2025-11-15"]');
    await page.click('[data-time="10:00"]');

    // 5. Confirm booking
    await page.click('text=Confirm Booking');

    // 6. Verify success
    await expect(page.locator('.toast')).toContainText('Appointment booked');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('stylist can view booked appointments', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[type=email]', 'stylist@example.com');
    await page.fill('[type=password]', 'password123');
    await page.click('text=Sign In');

    // Check appointments appear in calendar
    await page.click('text=Calendar');
    await expect(page.locator('[data-testid=appointment-card]')).toHaveCount(1);
  });
});
```

---

## Testing Best Practices

### 1. Query Priorities (React Testing Library)

**Preferred Queries (in order):**
```typescript
// 1. Accessible to everyone (best)
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email address')

// 2. Semantic queries
screen.getByPlaceholderText('Enter email...')
screen.getByText('Welcome back')

// 3. Test IDs (last resort)
screen.getByTestId('submit-button')
```

### 2. Async Operations

**Always use waitFor for async assertions:**
```typescript
// ❌ BAD - Race condition
expect(screen.getByText('Loading...')).toBeInTheDocument();

// ✅ GOOD - Wait for element
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});
```

### 3. Mocking External Dependencies

**Mock Supabase client:**
```typescript
// src/lib/testing/mocks/supabase.ts
import { vi } from 'vitest';

export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    update: vi.fn().mockResolvedValue({ data: {}, error: null }),
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  },
};
```

**Mock fetch for edge functions:**
```typescript
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ message: 'Success' }),
});
```

### 4. Test Data Factories

**Create reusable test data:**
```typescript
// src/lib/testing/factories.ts
import { faker } from '@faker-js/faker';

export const createMockAppointment = (overrides = {}) => ({
  id: faker.string.uuid(),
  client_id: faker.string.uuid(),
  stylist_id: faker.string.uuid(),
  date: faker.date.future().toISOString(),
  time: '10:00',
  status: 'scheduled',
  ...overrides,
});
```

---

## Coverage Goals

### Target Metrics
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

### Critical Paths (Must Have 100% Coverage)
- Authentication flow
- Payment processing
- AI formula generation
- Appointment booking/cancellation
- Data validation (Zod schemas)

### View Coverage Report
```bash
npm run test:coverage
# Opens HTML report in browser
open coverage/index.html
```

---

## Common Testing Patterns

### Pattern 1: Mocking useNavigate
```typescript
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
```

### Pattern 2: Testing Custom Hooks
```typescript
import { renderHook } from '@testing-library/react';

const { result, rerender } = renderHook(() => useCounter(0));
expect(result.current.count).toBe(0);

act(() => result.current.increment());
expect(result.current.count).toBe(1);
```

### Pattern 3: Testing Forms
```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Validation schema
const schema = z.object({
  email: z.string().email(),
});

// Test validation
it('should show error for invalid email', async () => {
  render(<LoginForm />);
  
  await userEvent.type(screen.getByLabelText('Email'), 'invalid');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(await screen.findByText('Invalid email')).toBeInTheDocument();
});
```

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## Troubleshooting Tests

### Issue: Tests timeout
**Solution:** Increase timeout in `vitest.config.ts`
```typescript
export default defineConfig({
  test: {
    timeout: 10000, // 10 seconds
  },
});
```

### Issue: "Cannot find module" errors
**Solution:** Check `tsconfig.json` paths and `vite.config.ts` aliases match

### Issue: Flaky E2E tests
**Solution:** Add explicit waits
```typescript
// ❌ BAD
await page.click('button');

// ✅ GOOD
await page.waitForSelector('button', { state: 'visible' });
await page.click('button');
```

---

## Resources

- [Vitest Docs](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog)
