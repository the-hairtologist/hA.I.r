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

/**
 * Recovery Strategy Types
 */
export interface RecoveryStrategy {
  action:
    | 'redirect_login'
    | 'queue_retry'
    | 'retry_backoff'
    | 'show_upgrade_prompt'
    | 'cache_bust'
    | 'retry_shorter_timeout';
  config?: {
    returnUrl?: boolean;
    delay?: number;
    showCountdown?: boolean;
    maxAttempts?: number;
    newTimeout?: number;
    feature?: string;
    reload?: boolean;
  };
}

export interface ErrorRecoveryContext {
  originalOperation?: () => Promise<any>;
  userFacingMessage?: string;
  allowAutoRecovery?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface RecoveryResult {
  recovered: boolean;
  strategy: string;
  message: string;
  data?: any;
}

export interface QueuedRequest {
  id: string;
  operation: () => Promise<any>;
  priority: number;
  enqueuedAt: number;
  onSuccess?: (result: any) => void;
  onFailure?: (error: any) => void;
}
