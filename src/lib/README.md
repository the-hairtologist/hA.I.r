# Utility Libraries

This directory contains utility functions and helpers used throughout the application.

## Error Handling

### `errorHandler.ts`

Centralized error handling with user-friendly messages and retry logic.

**Key Functions:**

- `handleError()` - Process and display errors with toast notifications
- `getErrorMessage()` - Extract user-friendly messages from various error types
- `withRetry()` - Retry failed operations with exponential backoff
- `safeAsync()` - Safe wrapper for async operations

**Example:**

```ts
try {
  await riskyOperation();
} catch (error) {
  handleError(error, 'riskyOperation', {
    showToast: true,
    retryable: true,
    onRetry: () => riskyOperation(),
  });
}
```

## Validation

### `validation.ts`

Input validation utilities and sanitization functions.

### `phoneValidation.ts`

Phone number validation and formatting.

### `urlValidation.ts`

URL validation and sanitization.

## Data Processing

### `csvExport.ts`

Export data to CSV format with proper formatting.

### `queryCache.ts`

React Query cache management and configuration.

## Analytics & Monitoring

### `analytics.ts`

Analytics tracking and event logging.

### `logger.ts`

Application logging utility with different log levels.

### `monitoring.ts`

Performance monitoring and error tracking.

## Platform-Specific

### `platform/`

Cross-platform utilities for web, iOS, and Android.

### `mobileOptimizations.ts`

Mobile-specific performance optimizations.

### `platformOptimizations.ts`

Platform detection and optimization utilities.

## AI & Intelligence

### `ai/`

AI-powered features and utilities.

- `AdaptiveLearningAI.ts` - Learns from user behavior
- `ClientRetentionAI.ts` - Predicts client retention
- `PredictiveAnalytics.ts` - Analytics and predictions
- `SecurityGuardian.ts` - AI-powered security monitoring

## Self-Healing

### `selfHealing/`

Autonomous system monitoring and recovery.

- `HealthMonitor.ts` - System health checks
- `ErrorRecovery.ts` - Automatic error recovery
- `DataIntegrityChecker.ts` - Data validation
- `PerformanceOptimizer.ts` - Performance tuning

## Styling & Design

### `buttonStyles.ts`

Button style variants and configurations.

### `animations.ts`

Animation utilities and presets.

### `responsiveSystem.ts`

Responsive design system configuration.

## Best Practices

1. **Pure Functions:** Keep utilities pure and side-effect free when possible
2. **Type Safety:** Use TypeScript for all utilities
3. **Documentation:** Add JSDoc comments for complex functions
4. **Testing:** Write unit tests for critical utilities
5. **Performance:** Optimize for performance, use memoization when appropriate
6. **Error Handling:** Always handle errors gracefully
