/**
 * Error Type Definitions
 */

export interface AppError {
  message: string;
  code?: string;
  context?: string;
  originalError?: Error;
  retryable?: boolean;
  statusCode?: number;
}

export interface ErrorContext {
  component?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
  fallbackValue?: unknown;
  retryable?: boolean;
}

export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number) => void;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  customMessage?: string;
  retryable?: boolean;
  onRetry?: () => void;
}
