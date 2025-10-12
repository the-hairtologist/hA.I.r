/**
 * Enhanced Error Handling Utility
 * Provides consistent error handling, retry logic, and user-friendly error messages
 */

import { toast } from "sonner";
import { log } from "./logger";
import { PostgrestError } from "@supabase/supabase-js";

export interface AppError {
  message: string;
  code?: string;
  context?: string;
  originalError?: any;
  retryable?: boolean;
  statusCode?: number;
}

/**
 * Maps common error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'invalid_credentials': 'Invalid email or password',
  'email_exists': 'An account with this email already exists',
  'weak_password': 'Password must be at least 6 characters',
  'invalid_email': 'Please enter a valid email address',
  'email_not_confirmed': 'Please verify your email address',
  
  // Database errors
  '23505': 'This record already exists',
  '23503': 'Cannot delete - related records exist',
  'PGRST116': 'No records found',
  
  // Network errors
  'fetch_error': 'Network error - please check your connection',
  'timeout': 'Request timed out - please try again',
  
  // Permission errors
  'insufficient_permissions': 'You do not have permission to perform this action',
  'unauthorized': 'Please log in to continue',
  
  // Generic
  'unknown': 'An unexpected error occurred',
};

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: any): string {
  // Handle null/undefined
  if (!error) return ERROR_MESSAGES.unknown;

  // Handle Supabase errors
  if (error.code) {
    return ERROR_MESSAGES[error.code] || error.message || ERROR_MESSAGES.unknown;
  }

  // Handle PostgreSQL errors
  if (error.message && error.message.includes('violates')) {
    if (error.message.includes('unique')) return ERROR_MESSAGES['23505'];
    if (error.message.includes('foreign key')) return ERROR_MESSAGES['23503'];
  }

  // Handle auth errors
  if (error.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid login')) return ERROR_MESSAGES.invalid_credentials;
    if (msg.includes('already registered')) return ERROR_MESSAGES.email_exists;
    if (msg.includes('weak password')) return ERROR_MESSAGES.weak_password;
    if (msg.includes('email not confirmed')) return ERROR_MESSAGES.email_not_confirmed;
  }

  // Return the error message or fallback
  return error.message || error.toString() || ERROR_MESSAGES.unknown;
}

/**
 * Handles errors consistently across the application
 */
export function handleError(error: any, context?: string, options?: {
  showToast?: boolean;
  logError?: boolean;
  customMessage?: string;
  retryable?: boolean;
  onRetry?: () => void;
}): AppError {
  const {
    showToast = true,
    logError = true,
    customMessage,
    retryable = false,
    onRetry,
  } = options || {};

  const errorMessage = customMessage || getErrorMessage(error);
  const isRetryable = retryable || isNetworkError(error);

  const appError: AppError = {
    message: errorMessage,
    code: error.code,
    context,
    originalError: error,
    retryable: isRetryable,
    statusCode: error.statusCode || error.status,
  };

  // Log the error
  if (logError) {
    log.error(errorMessage, context, error);
  }

  // Show toast notification with retry option
  if (showToast) {
    if (isRetryable && onRetry) {
      toast.error(errorMessage, {
        action: {
          label: "Retry",
          onClick: onRetry,
        },
        duration: 5000,
      });
    } else {
      toast.error(errorMessage);
    }
  }

  return appError;
}

/**
 * Checks if error is a network error
 */
function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError && 
    (error.message.includes('fetch') || error.message.includes('network'))
  ) || error.message?.toLowerCase().includes('timeout');
}

/**
 * Wraps async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string,
  options?: {
    showToast?: boolean;
    onError?: (error: AppError) => void;
  }
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleError(error, context, {
        showToast: options?.showToast ?? true,
      });
      
      if (options?.onError) {
        options.onError(appError);
      }
      
      throw appError;
    }
  }) as T;
}

/**
 * Validates required fields and throws appropriate errors
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[],
  context?: string
): void {
  const missing = requiredFields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    handleError(error, context);
    throw error;
  }
}

/**
 * Creates a safe async handler for event handlers
 */
export function createSafeHandler<T extends (...args: any[]) => Promise<void>>(
  handler: T,
  context: string
): T {
  return (async (...args: any[]) => {
    try {
      await handler(...args);
    } catch (error) {
      handleError(error, context);
    }
  }) as T;
}

/**
 * Retry logic for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with optional exponential backoff
      const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${currentDelay}ms`);
      onRetry?.(attempt);

      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }

  throw lastError!;
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorContext: string,
  options?: {
    showToast?: boolean;
    onError?: (error: AppError) => void;
  }
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error, errorContext, {
      showToast: options?.showToast ?? true,
    });
    options?.onError?.(appError);
    return { data: null, error: appError };
  }
}
