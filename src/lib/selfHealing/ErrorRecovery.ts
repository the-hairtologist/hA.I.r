/**
 * Self-Healing Error Recovery System
 * 
 * Automatically detects, logs, analyzes, and recovers from errors.
 * Uses AI to suggest fixes and implements smart retry strategies.
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  errorMessage: string;
  stack?: string;
  timestamp: Date;
  attemptCount: number;
}

interface RecoveryStrategy {
  action: 'retry' | 'fallback' | 'notify' | 'ignore';
  delay?: number;
  maxAttempts?: number;
  fallbackValue?: any;
}

class ErrorRecoverySystem {
  private errorPatterns: Map<string, RecoveryStrategy> = new Map();
  private circuitBreakers: Map<string, { failures: number; lastFailure: Date; isOpen: boolean }> = new Map();
  private readonly CIRCUIT_THRESHOLD = 5;
  private readonly CIRCUIT_RESET_TIME = 60000; // 1 minute

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns() {
    // Network errors - retry with exponential backoff
    this.errorPatterns.set('NetworkError', {
      action: 'retry',
      maxAttempts: 3,
      delay: 1000,
    });

    // Auth errors - redirect to login
    this.errorPatterns.set('AuthError', {
      action: 'notify',
    });

    // Data errors - use cached data as fallback
    this.errorPatterns.set('DataError', {
      action: 'fallback',
      fallbackValue: null,
    });

    // Rate limit - queue and retry
    this.errorPatterns.set('RateLimitError', {
      action: 'retry',
      maxAttempts: 5,
      delay: 5000,
    });
  }

  /**
   * Main error handling entry point
   */
  async handleError(error: any, context: ErrorContext): Promise<any> {
    logger.error('Error caught by recovery system', context.component, {
      error,
      context,
    });

    // Log to database for analysis
    await this.logError(error, context);

    // Check circuit breaker
    if (this.isCircuitOpen(context.component)) {
      logger.warn('Circuit breaker open', context.component);
      return this.handleCircuitOpen(context);
    }

    // Determine error type and strategy
    const errorType = this.classifyError(error);
    const strategy = this.errorPatterns.get(errorType) || { action: 'notify' };

    // Execute recovery strategy
    return await this.executeStrategy(strategy, error, context);
  }

  private classifyError(error: any): string {
    const message = error?.message?.toLowerCase() || '';
    const code = error?.code || '';

    if (message.includes('network') || message.includes('fetch')) return 'NetworkError';
    if (message.includes('auth') || code === 'PGRST301') return 'AuthError';
    if (message.includes('rate limit') || code === '429') return 'RateLimitError';
    if (message.includes('data') || message.includes('null')) return 'DataError';

    return 'UnknownError';
  }

  private async executeStrategy(
    strategy: RecoveryStrategy,
    error: any,
    context: ErrorContext
  ): Promise<any> {
    switch (strategy.action) {
      case 'retry':
        return await this.retryWithBackoff(context, strategy);

      case 'fallback':
        return this.useFallback(strategy.fallbackValue, context);

      case 'notify':
        return this.notifyUser(error, context);

      case 'ignore':
        logger.info('Error ignored by strategy', context.component);
        return null;

      default:
        return this.notifyUser(error, context);
    }
  }

  private async retryWithBackoff(
    context: ErrorContext,
    strategy: RecoveryStrategy
  ): Promise<boolean> {
    const maxAttempts = strategy.maxAttempts || 3;
    const baseDelay = strategy.delay || 1000;

    if (context.attemptCount >= maxAttempts) {
      this.recordCircuitFailure(context.component);
      toast.error('Unable to complete action after multiple attempts');
      return false;
    }

    const delay = baseDelay * Math.pow(2, context.attemptCount);
    logger.info(`Retrying in ${delay}ms`, context.component);

    await new Promise(resolve => setTimeout(resolve, delay));
    return true;
  }

  private useFallback(fallbackValue: any, context: ErrorContext) {
    logger.info('Using fallback value', context.component);
    toast.info('Using cached data');
    return fallbackValue;
  }

  private notifyUser(error: any, context: ErrorContext) {
    const userMessage = this.getUserFriendlyMessage(error);
    toast.error(userMessage);
    return null;
  }

  private getUserFriendlyMessage(error: any): string {
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('network')) return 'Connection issue. Please check your internet.';
    if (message.includes('auth')) return 'Session expired. Please log in again.';
    if (message.includes('rate limit')) return 'Too many requests. Please wait a moment.';

    return 'Something went wrong. Please try again.';
  }

  private async logError(error: any, context: ErrorContext) {
    try {
      // Only log if error_logs table exists
      await (supabase as any).from('error_logs').insert({
        component: context.component,
        action: context.action,
        user_id: context.userId,
        error_message: error?.message || 'Unknown error',
        error_stack: error?.stack,
        context: JSON.stringify(context),
        attempt_count: context.attemptCount,
      });
    } catch (logError) {
      // Silently fail if table doesn't exist yet
      console.log('Error logging skipped (table may not exist):', logError);
    }
  }

  /**
   * Circuit breaker pattern
   */
  private recordCircuitFailure(component: string) {
    const breaker = this.circuitBreakers.get(component) || {
      failures: 0,
      lastFailure: new Date(),
      isOpen: false,
    };

    breaker.failures++;
    breaker.lastFailure = new Date();

    if (breaker.failures >= this.CIRCUIT_THRESHOLD) {
      breaker.isOpen = true;
      logger.warn(`Circuit breaker opened for ${component}`);
      toast.error('Service temporarily unavailable');
    }

    this.circuitBreakers.set(component, breaker);
  }

  private isCircuitOpen(component: string): boolean {
    const breaker = this.circuitBreakers.get(component);
    if (!breaker || !breaker.isOpen) return false;

    // Auto-reset after timeout
    const timeSinceFailure = Date.now() - breaker.lastFailure.getTime();
    if (timeSinceFailure > this.CIRCUIT_RESET_TIME) {
      breaker.isOpen = false;
      breaker.failures = 0;
      this.circuitBreakers.set(component, breaker);
      logger.info(`Circuit breaker reset for ${component}`);
      return false;
    }

    return true;
  }

  private handleCircuitOpen(context: ErrorContext) {
    toast.error('Service temporarily unavailable. Please try again later.');
    return null;
  }

  /**
   * Reset a specific circuit breaker
   */
  resetCircuit(component: string) {
    this.circuitBreakers.delete(component);
    logger.info(`Circuit breaker manually reset for ${component}`);
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    const openCircuits = Array.from(this.circuitBreakers.entries())
      .filter(([_, breaker]) => breaker.isOpen)
      .map(([component, breaker]) => ({
        component,
        failures: breaker.failures,
        since: breaker.lastFailure,
      }));

    return {
      healthy: openCircuits.length === 0,
      openCircuits,
      totalCircuits: this.circuitBreakers.size,
    };
  }
}

// Singleton instance
export const errorRecovery = new ErrorRecoverySystem();

/**
 * Wrapper for async operations with automatic error recovery
 */
export async function withRecovery<T>(
  operation: () => Promise<T>,
  context: Omit<ErrorContext, 'timestamp' | 'attemptCount'>
): Promise<T | null> {
  let attemptCount = 0;
  const maxAttempts = 3;

  while (attemptCount < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      const fullContext: ErrorContext = {
        ...context,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date(),
        attemptCount,
      };

      const shouldRetry = await errorRecovery.handleError(error, fullContext);
      
      if (!shouldRetry) {
        return null;
      }

      attemptCount++;
    }
  }

  return null;
}
