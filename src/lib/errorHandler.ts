/**
 * Enhanced Error Handling Utility
 * 
 * Provides centralized error handling with:
 * - User-friendly error messages
 * - Automatic retry logic for network errors
 * - Error logging and tracking
 * - Toast notifications
 * 
 * @module errorHandler
 */

import { toast } from "sonner";
import { logger } from "./logger";
import { PostgrestError } from "@supabase/supabase-js";
import type { AppError, ErrorContext, RetryOptions, ErrorHandlerOptions } from "@/types/errors";

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
 * 
 * Handles Supabase errors, PostgreSQL errors, auth errors, and generic errors
 * by mapping them to user-friendly messages.
 * 
 * @param error - Error object of any type
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) return ERROR_MESSAGES.unknown;

  // Type guard for error objects
  const err = error as Record<string, unknown>;

  // Handle Supabase errors
  if (typeof err.code === 'string') {
    return ERROR_MESSAGES[err.code] || (err.message as string) || ERROR_MESSAGES.unknown;
  }

  // Handle PostgreSQL errors
  if (typeof err.message === 'string' && err.message.includes('violates')) {
    if (err.message.includes('unique')) return ERROR_MESSAGES['23505'];
    if (err.message.includes('foreign key')) return ERROR_MESSAGES['23503'];
  }

  // Handle auth errors
  if (typeof err.message === 'string') {
    const msg = err.message.toLowerCase();
    if (msg.includes('invalid login')) return ERROR_MESSAGES.invalid_credentials;
    if (msg.includes('already registered')) return ERROR_MESSAGES.email_exists;
    if (msg.includes('weak password')) return ERROR_MESSAGES.weak_password;
    if (msg.includes('email not confirmed')) return ERROR_MESSAGES.email_not_confirmed;
  }

  // Return the error message or fallback
  if (typeof err.message === 'string') return err.message;
  if (error instanceof Error) return error.message;
  return String(error) || ERROR_MESSAGES.unknown;
}

/**
 * Centralized error handler with logging and user notification
 * 
 * @param error - Error object to handle
 * @param context - Context where error occurred (e.g., "loadClients")
 * @param options - Configuration options
 * @returns Structured AppError object
 * 
 * @example
 * ```ts
 * try {
 *   await saveData();
 * } catch (error) {
 *   handleError(error, 'saveData', { 
 *     showToast: true,
 *     retryable: true,
 *     onRetry: () => saveData()
 *   });
 * }
 * ```
 */
export function handleError(
  error: unknown,
  context?: string,
  options?: ErrorHandlerOptions
): AppError {
  const {
    showToast = true,
    logError = true,
    customMessage,
    retryable = false,
    onRetry,
  } = options || {};

  const errorMessage = customMessage || getErrorMessage(error);
  const isRetryable = retryable || isNetworkError(error);

  const err = error as Record<string, unknown>;
  const appError: AppError = {
    message: errorMessage,
    code: typeof err.code === 'string' ? err.code : undefined,
    context,
    originalError: error instanceof Error ? error : undefined,
    retryable: isRetryable,
    statusCode: typeof err.statusCode === 'number' ? err.statusCode : typeof err.status === 'number' ? err.status : undefined,
  };

  // Log error using centralized logger (automatically sends to Sentry)
  logger.error(errorMessage, context || 'Error', error instanceof Error ? error : new Error(errorMessage));

  // Show toast notification with retry option (but not for module import errors)
  if (showToast) {
    // Skip toast for module import errors to prevent spam
    const isModuleError = errorMessage.includes('Importing a module script failed') || 
                          errorMessage.includes('Failed to fetch dynamically imported module');
    
    if (isModuleError) {
      // Log silently instead of showing toast
      console.warn('Module load error (suppressed toast):', errorMessage);
      return appError;
    }
    
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
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  const err = error as Record<string, unknown>;
  return typeof err.message === 'string' && err.message.toLowerCase().includes('timeout');
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
 * Retry logic with exponential backoff
 * 
 * Automatically retries failed operations with increasing delays between attempts.
 * Useful for network requests or transient failures.
 * 
 * @template T - Return type of the operation
 * @param operation - Async function to retry
 * @param options - Retry configuration
 * @returns Result of successful operation
 * @throws Last error if all retries fail
 * 
 * @example
 * ```ts
 * const data = await withRetry(
 *   () => fetchData(),
 *   { maxRetries: 3, delay: 1000, backoff: true }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
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
      
      logger.debug(`Retry attempt ${attempt}/${maxRetries} after ${currentDelay}ms`, 'withRetry');
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
