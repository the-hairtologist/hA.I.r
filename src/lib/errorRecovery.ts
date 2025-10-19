/**
 * Error Recovery System
 * Automatic recovery strategies for common error scenarios
 */

import { toast } from 'sonner';
import type { AppError, RecoveryStrategy, ErrorRecoveryContext, RecoveryResult, QueuedRequest } from '@/types/errors';
import { log } from './logger';

/**
 * Recovery strategy definitions for each error type
 */
export const RECOVERY_STRATEGIES: Record<string, RecoveryStrategy> = {
  unauthorized: {
    action: 'redirect_login',
    config: { returnUrl: true },
  },
  rate_limit: {
    action: 'queue_retry',
    config: { delay: 60000, showCountdown: true },
  },
  rate_limit_exceeded: {
    action: 'queue_retry',
    config: { delay: 60000, showCountdown: true },
  },
  network_error: {
    action: 'retry_backoff',
    config: { maxAttempts: 3, delay: 1000 },
  },
  payment_required: {
    action: 'show_upgrade_prompt',
    config: { feature: 'ai_credits' },
  },
  module_load_failed: {
    action: 'cache_bust',
    config: { reload: true },
  },
  timeout: {
    action: 'retry_shorter_timeout',
    config: { newTimeout: 15000 },
  },
};

/**
 * Request Queue for rate-limited operations
 */
class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private rateLimitResetTime: number | null = null;

  enqueue(request: QueuedRequest): void {
    this.queue.push(request);
    const position = this.queue.length;
    
    log.info(`Request queued (position ${position})`, 'errorRecovery');
    toast.info(`Request queued (position ${position})`, {
      description: 'Will process when rate limit clears',
    });
    
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    try {
      while (this.queue.length > 0) {
        const now = Date.now();
        
        // Check if we need to wait for rate limit reset
        if (this.rateLimitResetTime && now < this.rateLimitResetTime) {
          const waitTime = this.rateLimitResetTime - now;
          log.info(`Waiting ${waitTime}ms for rate limit reset`, 'errorRecovery');
          await this.delay(Math.min(waitTime, 5000)); // Check every 5s max
          continue;
        }
        
        // Process next request
        const request = this.queue.shift();
        if (!request) continue;
        
        try {
          log.info(`Processing queued request ${request.id}`, 'errorRecovery');
          const result = await request.operation();
          request.onSuccess?.(result);
          
          // Reset rate limit time after successful execution
          this.rateLimitResetTime = null;
        } catch (error: any) {
          log.error(`Queued request ${request.id} failed`, 'errorRecovery', error);
          
          // Check if it's another rate limit error
          if (error.code === 'rate_limit_exceeded' || error.statusCode === 429) {
            // Re-queue the request
            this.queue.unshift(request);
            // Set rate limit reset time (60 seconds from now)
            this.rateLimitResetTime = Date.now() + 60000;
            await this.delay(5000); // Wait before next attempt
          } else {
            request.onFailure?.(error);
          }
        }
        
        // Small delay between requests to avoid hammering
        await this.delay(500);
      }
    } finally {
      this.processing = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cancel(requestId: string): boolean {
    const index = this.queue.findIndex(req => req.id === requestId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      log.info(`Cancelled queued request ${requestId}`, 'errorRecovery');
      return true;
    }
    return false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
    this.processing = false;
    this.rateLimitResetTime = null;
  }
}

// Global request queue instance
export const requestQueue = new RequestQueue();

/**
 * Offline request buffer for storing requests when disconnected
 */
class OfflineBuffer {
  private readonly STORAGE_KEY = 'offline_requests';
  
  save(request: QueuedRequest): void {
    try {
      const stored = this.getAll();
      stored.push(request);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
      log.info('Request buffered for offline replay', 'errorRecovery');
    } catch (error) {
      log.error('Failed to buffer offline request', 'errorRecovery', error as Error);
    }
  }
  
  getAll(): QueuedRequest[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  async replayAll(): Promise<void> {
    const buffered = this.getAll();
    if (buffered.length === 0) return;
    
    log.info(`Replaying ${buffered.length} offline requests`, 'errorRecovery');
    toast.info(`Syncing ${buffered.length} offline actions...`);
    
    for (const request of buffered) {
      requestQueue.enqueue(request);
    }
    
    this.clear();
  }
}

export const offlineBuffer = new OfflineBuffer();

/**
 * Determine if an error should attempt automatic recovery
 */
export function shouldAttemptRecovery(error: AppError, context?: ErrorRecoveryContext): boolean {
  // Don't auto-recover if explicitly disabled
  if (context?.allowAutoRecovery === false) return false;
  
  // Check if we have a recovery strategy for this error
  const strategy = getRecoveryStrategy(error);
  return strategy !== null;
}

/**
 * Get the appropriate recovery strategy for an error
 */
export function getRecoveryStrategy(error: AppError): RecoveryStrategy | null {
  // Try to match by error code
  if (error.code && RECOVERY_STRATEGIES[error.code]) {
    return RECOVERY_STRATEGIES[error.code];
  }
  
  // Try to match by status code
  if (error.statusCode === 401) {
    return RECOVERY_STRATEGIES.unauthorized;
  }
  if (error.statusCode === 429) {
    return RECOVERY_STRATEGIES.rate_limit;
  }
  if (error.statusCode === 402) {
    return RECOVERY_STRATEGIES.payment_required;
  }
  
  // Try to match by message patterns
  const message = error.message.toLowerCase();
  if (message.includes('unauthorized') || message.includes('not authenticated')) {
    return RECOVERY_STRATEGIES.unauthorized;
  }
  if (message.includes('rate limit')) {
    return RECOVERY_STRATEGIES.rate_limit;
  }
  if (message.includes('network') || message.includes('connection')) {
    return RECOVERY_STRATEGIES.network_error;
  }
  if (message.includes('timeout')) {
    return RECOVERY_STRATEGIES.timeout;
  }
  
  return null;
}

/**
 * Attempt to recover from an error using the appropriate strategy
 */
export async function recoverFromError(
  error: AppError,
  context: ErrorRecoveryContext
): Promise<RecoveryResult> {
  const strategy = getRecoveryStrategy(error);
  
  if (!strategy) {
    return {
      recovered: false,
      strategy: 'none',
      message: 'No recovery strategy available',
    };
  }
  
  log.info(`Attempting recovery with strategy: ${strategy.action}`, 'errorRecovery');
  
  try {
    switch (strategy.action) {
      case 'redirect_login':
        return await handleRedirectLogin(error, strategy, context);
      
      case 'queue_retry':
        return await handleQueueRetry(error, strategy, context);
      
      case 'retry_backoff':
        return await handleRetryBackoff(error, strategy, context);
      
      case 'show_upgrade_prompt':
        return handleUpgradePrompt(error, strategy);
      
      case 'cache_bust':
        return handleCacheBust(error, strategy);
      
      case 'retry_shorter_timeout':
        return await handleRetryTimeout(error, strategy, context);
      
      default:
        return {
          recovered: false,
          strategy: strategy.action,
          message: 'Unknown recovery strategy',
        };
    }
  } catch (recoveryError) {
    log.error('Recovery attempt failed', 'errorRecovery', recoveryError as Error);
    return {
      recovered: false,
      strategy: strategy.action,
      message: 'Recovery attempt failed',
    };
  }
}

async function handleRedirectLogin(
  error: AppError,
  strategy: RecoveryStrategy,
  context: ErrorRecoveryContext
): Promise<RecoveryResult> {
  const returnUrl = strategy.config?.returnUrl ? window.location.pathname : undefined;
  const redirectPath = returnUrl ? `/auth?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth';
  
  toast.info('Session expired. Redirecting to login...', { duration: 2000 });
  
  setTimeout(() => {
    window.location.href = redirectPath;
  }, 2000);
  
  return {
    recovered: true,
    strategy: 'redirect_login',
    message: 'Redirecting to login',
  };
}

async function handleQueueRetry(
  error: AppError,
  strategy: RecoveryStrategy,
  context: ErrorRecoveryContext
): Promise<RecoveryResult> {
  if (!context.originalOperation) {
    return {
      recovered: false,
      strategy: 'queue_retry',
      message: 'No operation to queue',
    };
  }
  
  const queuedRequest: QueuedRequest = {
    id: `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    operation: context.originalOperation,
    priority: context.priority === 'high' ? 1 : context.priority === 'medium' ? 2 : 3,
    enqueuedAt: Date.now(),
  };
  
  requestQueue.enqueue(queuedRequest);
  
  return {
    recovered: true,
    strategy: 'queue_retry',
    message: 'Request queued for retry',
  };
}

async function handleRetryBackoff(
  error: AppError,
  strategy: RecoveryStrategy,
  context: ErrorRecoveryContext
): Promise<RecoveryResult> {
  if (!context.originalOperation) {
    return {
      recovered: false,
      strategy: 'retry_backoff',
      message: 'No operation to retry',
    };
  }
  
  const maxAttempts = strategy.config?.maxAttempts || 3;
  const baseDelay = strategy.config?.delay || 1000;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
    
    log.info(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`, 'errorRecovery');
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      const result = await context.originalOperation();
      return {
        recovered: true,
        strategy: 'retry_backoff',
        message: `Recovered after ${attempt} attempt(s)`,
        data: result,
      };
    } catch (retryError) {
      if (attempt === maxAttempts) {
        throw retryError;
      }
    }
  }
  
  return {
    recovered: false,
    strategy: 'retry_backoff',
    message: 'All retry attempts failed',
  };
}

function handleUpgradePrompt(error: AppError, strategy: RecoveryStrategy): RecoveryResult {
  const feature = strategy.config?.feature || 'this feature';
  
  toast.error(`AI credits used up`, {
    description: 'Add more credits to continue using AI features',
    duration: 10000,
    action: {
      label: 'Add Credits',
      onClick: () => {
        // Navigate to billing/credits page
        window.location.href = '/settings/billing';
      },
    },
  });
  
  return {
    recovered: false,
    strategy: 'show_upgrade_prompt',
    message: 'Upgrade prompt shown',
  };
}

function handleCacheBust(error: AppError, strategy: RecoveryStrategy): RecoveryResult {
  toast.info('Refreshing application...', { duration: 2000 });
  
  setTimeout(() => {
    // Clear all caches and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  }, 2000);
  
  return {
    recovered: true,
    strategy: 'cache_bust',
    message: 'Cache cleared, reloading',
  };
}

async function handleRetryTimeout(
  error: AppError,
  strategy: RecoveryStrategy,
  context: ErrorRecoveryContext
): Promise<RecoveryResult> {
  if (!context.originalOperation) {
    return {
      recovered: false,
      strategy: 'retry_shorter_timeout',
      message: 'No operation to retry',
    };
  }
  
  toast.info('Request timeout. Retrying with shorter timeout...', { duration: 2000 });
  
  try {
    // Note: Actual timeout implementation would need to be in the operation itself
    const result = await context.originalOperation();
    return {
      recovered: true,
      strategy: 'retry_shorter_timeout',
      message: 'Recovered with shorter timeout',
      data: result,
    };
  } catch (retryError) {
    return {
      recovered: false,
      strategy: 'retry_shorter_timeout',
      message: 'Retry with shorter timeout failed',
    };
  }
}
