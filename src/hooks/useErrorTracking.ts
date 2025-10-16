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
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
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
    await supabase.functions.invoke('log-error', {
      body: errorData,
    });
  } catch (error) {
    console.error('Failed to log error to tracking service:', error);
  }
};

export const trackError = logError;
