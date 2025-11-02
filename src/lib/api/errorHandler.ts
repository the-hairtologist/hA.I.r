/**
 * Unified API Error Handler
 * Consistent error handling across all API calls
 */

import { toast } from 'sonner';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';

export interface ApiErrorOptions {
  userMessage: string;
  logContext?: Record<string, any>;
  showToast?: boolean;
  silent?: boolean;
}

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: any, options: ApiErrorOptions): void => {
  const {
    userMessage,
    logContext = {},
    showToast = true,
    silent = false,
  } = options;

  // Log the error
  logger.error(userMessage, error, {
    context: 'APIError',
    ...logContext,
  });

  // Track in user journey
  userJourney.trackError(error, {
    userMessage,
    ...logContext,
  });

  // Show toast unless silent
  if (showToast && !silent) {
    const errorMessage = getErrorMessage(error);
    toast.error(userMessage, {
      description: errorMessage,
    });
  }
};

/**
 * Extract user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  // Supabase error
  if (error.message) {
    // Check for common Supabase error patterns
    if (error.message.includes('JWT')) {
      return 'Your session has expired. Please sign in again.';
    }
    if (error.message.includes('duplicate key')) {
      return 'This record already exists.';
    }
    if (error.message.includes('violates foreign key')) {
      return 'Unable to complete action due to data dependencies.';
    }
    if (error.message.includes('Row Level Security')) {
      return "You don't have permission to access this data.";
    }
    return error.message;
  }

  // Network error
  if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection.';
  }

  // Timeout error
  if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
    return 'Request timed out. Please try again.';
  }

  return 'An unexpected error occurred';
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (!error) return false;

  // Network errors are retryable
  if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
    return true;
  }

  // Timeout errors are retryable
  if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
    return true;
  }

  // 5xx server errors are retryable
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }

  // 429 Too Many Requests
  if (error.status === 429) {
    return true;
  }

  return false;
};

/**
 * Get retry delay based on attempt number
 */
export const getRetryDelay = (attemptNumber: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s
  return Math.min(1000 * Math.pow(2, attemptNumber), 8000);
};
