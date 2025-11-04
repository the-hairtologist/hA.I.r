# Error Boundaries Guide

## Overview

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire app. This guide covers all error boundary types, when to use them, and best practices.

## Error Boundary Types

### 1. **GlobalErrorBoundary** (App-Level)
**Location:** `src/components/ErrorBoundary.tsx`

**Purpose:** Top-level error boundary that catches all unhandled errors in the app.

**Features:**
- Catches all errors not caught by nested boundaries
- Displays full-screen error UI
- Provides options to reload or go to dashboard
- Tracks error count and implements error threshold
- Logs to monitoring service (Sentry)

**Usage:**
```tsx
// Already wraps entire app in App.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### 2. **FeatureErrorBoundary** (Feature-Level)
**Location:** `src/components/errors/FeatureErrorBoundary.tsx`

**Purpose:** Isolates individual features so errors don't affect other parts of the page.

**Features:**
- Feature-specific error messages
- Custom fallback UI per feature
- Error tracking with feature name
- Logs to analytics for insights

**Usage:**
```tsx
<FeatureErrorBoundary featureName="Client Dashboard">
  <ClientDashboard />
</FeatureErrorBoundary>
```

**When to use:**
- Dashboard widgets/sections
- Independent page features
- Complex UI components that might fail
- Third-party integrations

---

### 3. **EnhancedFeatureErrorBoundary** (Auto-Retry)
**Location:** `src/components/errors/EnhancedFeatureErrorBoundary.tsx`

**Purpose:** Advanced error boundary with automatic retry and exponential backoff.

**Features:**
- Automatic retry (up to 3 attempts by default)
- Exponential backoff (1s → 2s → 4s → 8s...)
- Network error detection
- Retry countdown display
- Manual retry button
- "Skip this feature" option
- Offline detection

**Usage:**
```tsx
<EnhancedFeatureErrorBoundary 
  featureName="AI Insights" 
  maxRetries={5}
>
  <AIInsightsWidget />
</EnhancedFeatureErrorBoundary>
```

**When to use:**
- Features that depend on external APIs
- Network-dependent operations
- Real-time data updates
- AI-powered features
- Third-party service integrations

---

### 4. **RouteErrorBoundary** (Page-Level)
**Location:** `src/components/errors/RouteErrorBoundary.tsx`

**Purpose:** Catches errors at the route/page level without crashing the entire app.

**Features:**
- Page-specific error handling
- Navigation recovery (go back, go home)
- Fallback route option
- Preserves app navigation

**Usage:**
```tsx
<Route
  path="/clients"
  element={
    <RouteErrorBoundary fallbackRoute="/dashboard">
      <ClientsPage />
    </RouteErrorBoundary>
  }
/>
```

**When to use:**
- All route definitions
- Pages with complex data fetching
- Pages with heavy computations

---

### 5. **AsyncErrorBoundary** (Lazy Loading)
**Location:** `src/components/errors/AsyncErrorBoundary.tsx`

**Purpose:** Handles errors from lazy-loaded components and async operations.

**Features:**
- Combines `Suspense` with error boundary
- Catches chunk loading failures
- Custom loading fallback
- Retry on chunk load failure

**Usage:**
```tsx
<AsyncErrorBoundary loadingFallback={<Spinner />}>
  <LazyComponent />
</AsyncErrorBoundary>
```

**When to use:**
- All lazy-loaded components
- Code-split routes
- Dynamic imports
- Features loaded on demand

---

### 6. **DataErrorBoundary** (Data Operations)
**Location:** `src/components/errors/DataErrorBoundary.tsx`

**Purpose:** Specialized for data fetching and rendering errors.

**Features:**
- Data-specific error messages
- Retry with refetch callback
- Shows detailed error info in dev mode
- Preserves page functionality

**Usage:**
```tsx
<DataErrorBoundary feature="Client List" onReset={refetch}>
  <ClientTable data={clients} />
</DataErrorBoundary>
```

**When to use:**
- Data tables
- Charts and graphs
- API-driven lists
- Real-time data displays
- Database query results

---

### 7. **QueryErrorBoundary** (React Query)
**Location:** `src/components/errors/QueryErrorBoundary.tsx`

**Purpose:** Specialized for React Query errors.

**Features:**
- Integrates with React Query
- Query retry support
- Cache invalidation on retry
- Query-specific fallback UI

**Usage:**
```tsx
<QueryErrorBoundary onReset={() => queryClient.invalidateQueries()}>
  <QueryComponent />
</QueryErrorBoundary>
```

**When to use:**
- Components using `useQuery`
- React Query mutations
- Server state management
- API data fetching with React Query

---

### 8. **FormErrorBoundary** (Forms)
**Location:** `src/components/errors/FormErrorBoundary.tsx`

**Purpose:** Protects form submission and validation logic.

**Features:**
- Preserves form state
- Validation error recovery
- Submission error handling
- User-friendly error messages

**Usage:**
```tsx
<FormErrorBoundary fallbackMessage="Unable to submit form. Please try again.">
  <AppointmentForm onSubmit={handleSubmit} />
</FormErrorBoundary>
```

**When to use:**
- All complex forms
- Multi-step forms
- Forms with file uploads
- Forms with async validation

---

### 9. **AIFeatureErrorBoundary** (AI Features)
**Location:** `src/components/AIFeatureErrorBoundary.tsx`

**Purpose:** Specialized for AI-powered features that might be unpredictable.

**Features:**
- AI-specific error messaging
- Graceful degradation for AI failures
- Tracks AI feature reliability
- Provides non-AI fallback options

**Usage:**
```tsx
<AIFeatureErrorBoundary featureName="AI Formula Analyzer">
  <AIFormulaAnalyzer formula={formula} />
</AIFeatureErrorBoundary>
```

**When to use:**
- AI recommendations
- ML predictions
- LLM-powered features
- Computer vision components
- AI-generated content

---

### 10. **DashboardErrorBoundary** (Dashboard-Specific)
**Location:** `src/components/DashboardErrorBoundary.tsx`

**Purpose:** Specialized error handling for dashboard pages.

**Features:**
- Dashboard-specific error UI
- Section-by-section error isolation
- Quick recovery options
- Analytics integration

**Usage:**
```tsx
<Route path="/dashboard" element={
  <DashboardErrorBoundary>
    <Dashboard />
  </DashboardErrorBoundary>
} />
```

**When to use:**
- Main dashboard page
- Dashboard sections
- Widget containers

---

## Error Boundary Hierarchy

```
GlobalErrorBoundary (App.tsx)
└── RouteErrorBoundary (per route)
    └── AsyncErrorBoundary (lazy loaded)
        ├── DashboardErrorBoundary (dashboard)
        │   └── FeatureErrorBoundary (widgets)
        │       └── DataErrorBoundary (charts/tables)
        ├── FormErrorBoundary (forms)
        ├── QueryErrorBoundary (React Query)
        └── AIFeatureErrorBoundary (AI features)
```

## Decision Tree: Which Error Boundary to Use?

```
Is it the entire app?
  → Use GlobalErrorBoundary (already in place)

Is it a route/page?
  → Use RouteErrorBoundary + AsyncErrorBoundary

Is it a dashboard section/widget?
  → Use FeatureErrorBoundary or EnhancedFeatureErrorBoundary

Is it data-heavy (tables, charts)?
  → Use DataErrorBoundary

Is it a form?
  → Use FormErrorBoundary

Is it using React Query?
  → Use QueryErrorBoundary

Is it AI-powered?
  → Use AIFeatureErrorBoundary

Does it need automatic retry?
  → Use EnhancedFeatureErrorBoundary

Is it lazy-loaded?
  → Use AsyncErrorBoundary
```

## Best Practices

### 1. **Layer Your Error Boundaries**
Don't rely on a single error boundary. Use multiple layers for granular error handling:

```tsx
// ✅ GOOD: Multiple layers
<RouteErrorBoundary>
  <AsyncErrorBoundary>
    <FeatureErrorBoundary featureName="Dashboard">
      <DataErrorBoundary feature="Revenue Chart">
        <RevenueChart />
      </DataErrorBoundary>
    </FeatureErrorBoundary>
  </AsyncErrorBoundary>
</RouteErrorBoundary>

// ❌ BAD: Single error boundary for everything
<ErrorBoundary>
  <EntireDashboard />
</ErrorBoundary>
```

### 2. **Provide Meaningful Feature Names**
Always use descriptive names that help identify the failing component:

```tsx
// ✅ GOOD
<FeatureErrorBoundary featureName="Client Birthday Alerts">

// ❌ BAD
<FeatureErrorBoundary featureName="Widget">
```

### 3. **Use Custom Fallback UI When Appropriate**
For critical features, provide custom fallback experiences:

```tsx
<FeatureErrorBoundary
  featureName="Payment Processing"
  fallback={
    <Alert variant="destructive">
      <AlertTitle>Payment System Unavailable</AlertTitle>
      <AlertDescription>
        Please try again later or contact support at support@example.com
      </AlertDescription>
    </Alert>
  }
>
  <PaymentForm />
</FeatureErrorBoundary>
```

### 4. **Implement Reset Callbacks**
Allow users to recover from errors without full page reload:

```tsx
<DataErrorBoundary 
  feature="Client List" 
  onReset={() => {
    queryClient.invalidateQueries('clients');
    // Any other cleanup/reset logic
  }}
>
  <ClientList />
</DataErrorBoundary>
```

### 5. **Don't Overuse Error Boundaries**
Not every component needs its own error boundary. Group related components:

```tsx
// ✅ GOOD: Group related components
<FeatureErrorBoundary featureName="Client Profile">
  <ClientHeader />
  <ClientDetails />
  <ClientNotes />
  <ClientAppointments />
</FeatureErrorBoundary>

// ❌ BAD: Separate boundary for each tiny component
<FeatureErrorBoundary featureName="Header">
  <ClientHeader />
</FeatureErrorBoundary>
<FeatureErrorBoundary featureName="Details">
  <ClientDetails />
</FeatureErrorBoundary>
```

### 6. **Test Your Error Boundaries**
Use the ErrorBoundaryDebugger component in development:

```tsx
import { ErrorBoundaryDebugger } from '@/components/admin/ErrorBoundaryDebugger';

// In your admin/dev panel
<ErrorBoundaryDebugger />
```

### 7. **Log Errors Properly**
All error boundaries should log to monitoring services:

```tsx
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Log to Sentry/monitoring
  captureError(error, {
    featureName: this.props.featureName,
    errorBoundary: 'FeatureErrorBoundary',
    componentStack: errorInfo.componentStack,
  });
  
  // Log locally for dev
  logger.error('Feature error', this.props.featureName, error);
}
```

## Testing Error Boundaries

### Manual Testing
Use the `ErrorBoundaryDebugger` component:

1. Navigate to admin panel
2. Open Error Boundary Debugger
3. Trigger different error types
4. Verify error boundaries catch them
5. Test retry mechanisms
6. Check error analytics

### Automated Testing
```typescript
import { throwTestError, errorScenarios } from '@/lib/errors/errorBoundaryTesting';

describe('Error Boundaries', () => {
  it('should catch render errors', () => {
    expect(() => throwTestError('render')).toThrow();
  });

  it('should catch network errors', async () => {
    await expect(errorScenarios.networkFailure()).rejects.toThrow();
  });
});
```

## Accessibility

All error boundaries must follow WCAG 2.2 AA standards:

1. **Announce errors to screen readers:**
   ```tsx
   <div role="alert" aria-live="assertive">
     {errorMessage}
   </div>
   ```

2. **Keyboard navigation:**
   - All buttons must be keyboard accessible
   - Tab order should be logical
   - Focus management after errors

3. **Color contrast:**
   - Error messages must have 4.5:1 contrast minimum
   - Icons should not be the only indicator

4. **Touch targets:**
   - All buttons must be ≥44px for touch
   - Adequate spacing between actions

## Performance Considerations

- Error boundaries add minimal overhead (~2-5ms per render)
- Use React.memo for expensive fallback components
- Lazy load error boundary debugger tools
- Batch error analytics to avoid overwhelming monitoring services

## Common Pitfalls

### ❌ Don't catch errors in event handlers
Error boundaries don't catch errors in:
- Event handlers (onClick, onChange, etc.)
- Async code (setTimeout, promises)
- Server-side rendering
- Errors thrown in the error boundary itself

**Solution:** Use try-catch in event handlers:
```tsx
const handleClick = async () => {
  try {
    await submitForm();
  } catch (error) {
    // Handle error locally
    toast.error('Failed to submit form');
  }
};
```

### ❌ Don't create infinite error loops
Never throw errors inside error boundary render:
```tsx
// ❌ BAD
render() {
  if (this.state.hasError) {
    throw new Error('Oops'); // Infinite loop!
  }
}
```

### ❌ Don't ignore error boundaries in routes
Always wrap routes with error boundaries:
```tsx
// ✅ GOOD
<Route path="/clients" element={
  <RouteErrorBoundary>
    <ClientsPage />
  </RouteErrorBoundary>
} />

// ❌ BAD
<Route path="/clients" element={<ClientsPage />} />
```

## Monitoring & Analytics

Track error boundary metrics:

1. **Error frequency by feature**
   - Which features fail most often?
   - Identify unreliable components

2. **Error recovery rate**
   - How often do retries succeed?
   - Optimize retry strategies

3. **User actions after errors**
   - Do users retry? Skip? Leave?
   - Improve UX based on behavior

4. **Error patterns**
   - Same error recurring?
   - Correlate with deployments, browsers, devices

## Maintenance

### Adding Error Boundaries to New Features
1. Identify component criticality
2. Choose appropriate error boundary type
3. Add feature name for tracking
4. Implement reset/retry logic if needed
5. Test with ErrorBoundaryDebugger
6. Monitor in production

### Updating Error Boundaries
- Keep error messages user-friendly
- Update retry strategies based on data
- Add new error types as needed
- Deprecate unused boundaries

## FAQ

**Q: Do I need error boundaries for every component?**
A: No. Group related components and add boundaries at logical feature boundaries.

**Q: Can I nest multiple error boundaries?**
A: Yes! This is recommended. Nested boundaries provide granular error handling.

**Q: What happens if an error boundary crashes?**
A: The error propagates to the next parent error boundary. Always have a top-level GlobalErrorBoundary.

**Q: How do I test error boundaries?**
A: Use the ErrorBoundaryDebugger component or import test utilities from `@/lib/errors/errorBoundaryTesting`.

**Q: Should I show technical error messages to users?**
A: No (except in dev mode). Show friendly messages and log technical details to monitoring.

**Q: Can error boundaries catch async errors?**
A: Not directly. Async errors need try-catch. However, if async errors crash components, error boundaries will catch them.

## Resources

- [React Error Boundaries Docs](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Boundary Testing Utilities](/src/lib/errors/errorBoundaryTesting.ts)
- [Error Boundary Debugger Component](/src/components/admin/ErrorBoundaryDebugger.tsx)
- Project Error Boundaries: `/src/components/errors/`

---

**Last Updated:** 2025-01-01
**Maintained By:** Development Team
