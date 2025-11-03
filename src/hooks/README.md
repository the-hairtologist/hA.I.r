# Custom React Hooks

This directory contains custom React hooks used throughout the application. Each hook is designed to be reusable and handles specific functionality.

## Form Management

### `useFormValidation.ts`

Comprehensive form validation with Zod schemas, real-time feedback, and debouncing.

**Features:**

- Field-level and form-level validation
- Debounced validation for better performance
- Touch tracking for improved UX
- Submission state management

**Usage:**

```tsx
const { values, errors, handleChange, handleSubmit } = useFormValidation({
  schema: mySchema,
  onSubmit: async data => {
    /* ... */
  },
});
```

### `useFormSubmit.ts`

Handles form submission with double-submit prevention and loading states.

### `useAutoSave.ts`

Automatically saves form data with configurable debouncing.

## Data Fetching

### `useOptimizedQuery.ts`

Optimized React Query wrapper with caching and error handling.

### `useRealtimeSubscription.ts`

Subscribes to Supabase realtime updates.

### `useRealtimeNotifications.ts`

Manages real-time notification updates.

## UI & Interaction

### `useKeyboardShortcuts.ts`

Registers keyboard shortcuts with customizable key combinations.

### `useDebouncedSearch.ts`

Debounces search input for better performance.

### `useBulkSelection.ts`

Manages bulk item selection in lists.

### `useCelebration.ts`

Triggers celebration animations for milestones.

## Performance

### `usePerformanceMonitor.ts`

Monitors component performance metrics.

### `useResponsive.ts`

Provides responsive design utilities and breakpoint detection.

### `useMobile.tsx`

Detects mobile devices and provides mobile-specific utilities.

## Authentication & Authorization

### `useAuth.ts`

Manages authentication state and user session.

### `useUserRole.ts`

Handles user role detection and authorization.

## Best Practices

1. **Naming Convention:** Use the `use` prefix for all hooks
2. **Single Responsibility:** Each hook should handle one specific concern
3. **Type Safety:** Always provide TypeScript types for parameters and return values
4. **Documentation:** Add JSDoc comments explaining usage and parameters
5. **Testing:** Write unit tests for complex hooks
6. **Dependencies:** Keep hook dependencies minimal and well-documented
