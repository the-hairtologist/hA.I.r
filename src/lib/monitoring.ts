/**
 * Error Monitoring and Performance Tracking with Sentry
 * 
 * Setup Instructions:
 * 1. Create free account at https://sentry.io
 * 2. Create new React project
 * 3. Copy your DSN (format: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx)
 * 4. Add to environment: VITE_SENTRY_DSN=your_dsn_here
 * 5. Install: npm install @sentry/react
 * 
 * Features:
 * - Automatic error tracking
 * - Performance monitoring
 * - User session replay
 * - Breadcrumb tracking
 * - Source map uploads for stack traces
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/browser";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
const ENVIRONMENT = import.meta.env.DEV ? 'development' : 'production';

let sentryInitialized = false;

/**
 * Initialize Sentry error monitoring
 * Call this once in your App.tsx or main.tsx
 */
export const initSentry = () => {
  if (sentryInitialized || !SENTRY_DSN) {
    console.log('[Monitoring] Sentry not initialized:', !SENTRY_DSN ? 'No DSN provided' : 'Already initialized');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      
      // Performance Monitoring
      integrations: [
        new BrowserTracing({
          tracePropagationTargets: ["localhost", /^https:\/\/.*\.lovableproject\.com/],
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Performance traces - 100% in dev, 10% in production
      tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,

      // Session replay - 10% of normal sessions, 100% on error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Only capture errors in production
      enabled: !import.meta.env.DEV,

      // Ignore common non-critical errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
      ],

      // Add custom tags
      beforeSend(event, hint) {
        // Add custom context
        if (event.request) {
          event.tags = {
            ...event.tags,
            userAgent: navigator.userAgent,
          };
        }
        return event;
      },
    });

    sentryInitialized = true;
    console.log('[Monitoring] Sentry initialized successfully');
  } catch (error) {
    console.error('[Monitoring] Failed to initialize Sentry:', error);
  }
};

/**
 * Manually capture an error
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (!sentryInitialized) return;

  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture a message (not an error)
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (!sentryInitialized) return;

  Sentry.captureMessage(message, level);
};

/**
 * Set user context for error tracking
 */
export const setUser = (userId: string, email?: string, username?: string) => {
  if (!sentryInitialized) return;

  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearUser = () => {
  if (!sentryInitialized) return;

  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging context
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  if (!sentryInitialized) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
};

/**
 * Start a performance transaction
 */
export const startTransaction = (name: string, operation: string) => {
  if (!sentryInitialized) return null;

  return Sentry.startTransaction({
    name,
    op: operation,
  });
};

/**
 * Wrap your router with Sentry
 * Example: const SentryRoutes = Sentry.withSentryRouting(Routes);
 */
export const withSentryRouting = Sentry.withSentryRouting;

/**
 * Error Boundary component
 * Wrap your app with this to catch React errors
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Export Sentry instance for advanced usage
export { Sentry };

/**
 * Check if Sentry is initialized
 */
export const isSentryReady = () => sentryInitialized;

/**
 * Usage Examples:
 * 
 * // In App.tsx
 * import { initSentry } from '@/lib/monitoring';
 * 
 * function App() {
 *   useEffect(() => {
 *     initSentry();
 *   }, []);
 * }
 * 
 * // Track user
 * import { setUser } from '@/lib/monitoring';
 * setUser(userId, email, username);
 * 
 * // Capture errors
 * import { captureError } from '@/lib/monitoring';
 * try {
 *   // risky code
 * } catch (error) {
 *   captureError(error, { context: 'payment_processing' });
 * }
 * 
 * // Add breadcrumbs for debugging
 * import { addBreadcrumb } from '@/lib/monitoring';
 * addBreadcrumb('User clicked checkout', 'user_action', { cartTotal: 99.99 });
 */
