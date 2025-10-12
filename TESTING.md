# Testing Guide

This document outlines the testing infrastructure and best practices for the hA.I.r application.

## Test Framework

- **Vitest**: Fast unit test framework with native ESM support
- **React Testing Library**: Component testing focused on user behavior
- **Testing Library User Event**: Realistic user interaction simulation

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Test Structure

### Unit Tests
Test individual components and functions in isolation.

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests
Test how multiple components work together.

```typescript
import { renderWithProviders } from '@/lib/testing/testUtils';

describe('Appointment Flow', () => {
  it('allows creating a new appointment', async () => {
    const { user } = renderWithProviders(<AppointmentForm />);
    // Test the complete flow
  });
});
```

### E2E Tests
Test complete user journeys (located in `E2E/tests/`).

## Testing Utilities

### `renderWithProviders`
Renders components with all necessary providers (React Query, Router, etc.).

```typescript
import { renderWithProviders } from '@/lib/testing/testUtils';

const { user } = renderWithProviders(<MyComponent />);
```

### Mock Data
Pre-defined mock data for common entities:

```typescript
import {
  mockUser,
  mockStylistProfile,
  mockClientProfile,
  mockAppointment,
  mockFormula,
} from '@/lib/testing/testUtils';
```

## Best Practices

### 1. Test User Behavior, Not Implementation
✅ **Good**: `expect(screen.getByText('Submit')).toBeInTheDocument()`  
❌ **Bad**: `expect(component.state.value).toBe('test')`

### 2. Use Semantic Queries
Prefer queries that reflect how users interact:
- `getByRole` (most preferred)
- `getByLabelText`
- `getByPlaceholderText`
- `getByText`
- `getByTestId` (last resort)

### 3. Test Accessibility
Always include accessibility checks:

```typescript
it('has proper ARIA labels', () => {
  render(<Button aria-label="Close dialog">X</Button>);
  expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
});
```

### 4. Mock External Dependencies
Always mock Supabase and external APIs:

```typescript
import { createMockSupabaseClient } from '@/lib/testing/testUtils';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));
```

### 5. Clean Up After Tests
Use `afterEach` to reset state:

```typescript
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

## Coverage Goals

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

Focus on testing:
- Critical user flows
- Edge cases and error handling
- Accessibility features
- Business logic

## Common Patterns

### Testing Async Operations
```typescript
it('loads data on mount', async () => {
  renderWithProviders(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Testing Forms
```typescript
it('submits form data', async () => {
  const onSubmit = vi.fn();
  const { user } = renderWithProviders(<Form onSubmit={onSubmit} />);
  
  await user.type(screen.getByLabelText('Name'), 'John Doe');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
});
```

### Testing Navigation
```typescript
it('navigates to details page', async () => {
  const { user } = renderWithProviders(<AppointmentList />);
  
  await user.click(screen.getByText('View Details'));
  expect(screen.getByText('Appointment Details')).toBeInTheDocument();
});
```

## Continuous Integration

Tests run automatically on:
- Every pull request
- Every commit to main branch
- Before deployment

CI fails if:
- Any test fails
- Coverage drops below threshold
- Build errors occur

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)
- [Playwright E2E Testing](https://playwright.dev/)
