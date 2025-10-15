/**
 * Error Monitoring and Performance Tracking with Sentry
 * 
 * Setup Instructions:
 * 1. Create free account at https://sentry.io
 * 2. Create new React project
 * 3. Copy your DSN (format: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx)
 * 4. Add to environment: VITE_SENTRY_DSN=your_dsn_here
 * 5. Install packages:
 *    npm install @sentry/react
 * 6. Uncomment the imports below and initialize in src/main.tsx
 * 
 * Features:
 * - Automatic error tracking
 * - Performance monitoring
 * - User session replay
 * - Breadcrumb tracking
 * - Source map uploads for stack traces
 */

// IMPORTANT: Uncomment these imports after installing @sentry/react
// import * as Sentry from "@sentry/react";
import type { ReactNode } from 'react';

// Type definitions for when Sentry is not installed
type SentryType = any;

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
const ENVIRONMENT = import.meta.env.DEV ? 'development' : 'production';

let sentryInitialized = false;

/**
 * Initialize Sentry error monitoring
 * Call this once in your App.tsx or main.tsx
 * 
 * IMPORTANT: This will only work after installing @sentry/react
 * Run: npm install @sentry/react
 * Then uncomment the Sentry import at the top of this file
 */
export const initSentry = () => {
  if (sentryInitialized || !SENTRY_DSN) {
    // Sentry not available - silent return
    return;
  }

  // Check if Sentry is available
  if (typeof window === 'undefined' || !(window as any).Sentry) {
    // Sentry package not installed - silent return
    return;
  }

  try {
    const Sentry = (window as any).Sentry;
    
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      
      // Performance Monitoring
      integrations: [
        Sentry.browserTracingIntegration({
          tracePropagationTargets: ["localhost", /^https:\/\/.*\.lovableproject\.com/],
        }),
        Sentry.replayIntegration({
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
      beforeSend(event: any, hint: any) {
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
  } catch (error) {
    // Failed to initialize Sentry - silent return
  }
};

/**
 * Manually capture an error
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (!sentryInitialized || typeof window === 'undefined') return;

  const Sentry = (window as any).Sentry;
  if (Sentry) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

/**
 * Capture a message (not an error)
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (!sentryInitialized || typeof window === 'undefined') return;

  const Sentry = (window as any).Sentry;
  if (Sentry) {
    Sentry.captureMessage(message, level);
  }
};

/**
 * Set user context for error tracking
 */
export const setUser = (userId: string, email?: string, username?: string) => {
  if (!sentryInitialized || typeof window === 'undefined') return;

  const Sentry = (window as any).Sentry;
  if (Sentry) {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }
};

/**
 * Clear user context (on logout)
 */
export const clearUser = () => {
  if (!sentryInitialized || typeof window === 'undefined') return;

  const Sentry = (window as any).Sentry;
  if (Sentry) {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging context
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  if (!sentryInitialized || typeof window === 'undefined') return;

  const Sentry = (window as any).Sentry;
  if (Sentry) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
    });
  }
};

/**
 * Start a performance transaction
 */
export const startTransaction = (name: string, operation: string) => {
  if (!sentryInitialized || typeof window === 'undefined') return null;

  const Sentry = (window as any).Sentry;
  if (Sentry) {
    return Sentry.startTransaction({
      name,
      op: operation,
    });
  }
  return null;
};

/**
 * Wrap your router with Sentry (only available after installing @sentry/react)
 * Example: const SentryRoutes = withSentryRouting(Routes);
 */
export const withSentryRouting = (component: any) => {
  if (typeof window === 'undefined') return component;
  const Sentry = (window as any).Sentry;
  return Sentry?.withSentryRouting?.(component) || component;
};

/**
 * Error Boundary component (only available after installing @sentry/react)
 * Wrap your app with this to catch React errors
 */
export const SentryErrorBoundary = ({ children }: { children: ReactNode }): ReactNode => {
  return children;
};

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
