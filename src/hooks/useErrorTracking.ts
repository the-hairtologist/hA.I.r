import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useErrorTracking = () => {
  const { user } = useAuth();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logError({
        message: event.message,
        stack: event.error?.stack,
        level: 'error',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        userId: user?.id,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        level: 'error',
        context: {
          type: 'unhandledrejection',
        },
        userId: user?.id,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, [user?.id]);
};

const logError = async (errorData: {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
  userId?: string;
}) => {
  try {
    // Send to Sentry
    const { captureError, captureMessage } = await import('@/lib/monitoring');

    if (errorData.level === 'error' && errorData.stack) {
      const error = new Error(errorData.message);
      error.stack = errorData.stack;
      captureError(error, errorData.context);
    } else {
      captureMessage(errorData.message, errorData.level);
    }

    // Also log to edge function for custom tracking
    await supabase.functions.invoke('sentry-error-tracking', {
      body: errorData,
    });
  } catch (error) {
    import('@/lib/logging/productionLogger').then(({ logger }) => {
      logger.error('Failed to log error to tracking service', error);
    });
  }
};

export const trackError = logError;
