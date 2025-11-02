/**
 * AI Error Context Enrichment
 * Provides rich context for AI feature failures
 */

import { supabase } from '@/integrations/supabase/client';
import { log } from './logger';
import type { AppError } from '@/types/errors';

export interface AICallContext {
  feature: string;
  model?: string;
  estimatedTokens?: number;
  maxRetries?: number;
  timeout?: number;
}

export interface EnrichedAIError extends AppError {
  aiContext: {
    feature: string;
    model: string;
    executionTimeMs: number;
    rateLimitRemaining?: number;
    previousSuccessCount: number;
    suggestedAction: string;
    retryAfterSeconds?: number;
  };
}

interface PossibleError {
  message?: string;
  error?: string;
  status?: number;
  statusCode?: number;
}

function isPossibleError(e: unknown): e is PossibleError {
  return typeof e === 'object' && e !== null;
}

// Track AI call success/failure counts
const aiCallStats = new Map<
  string,
  { success: number; failure: number; lastSuccess: number }
>();

/**
 * Wrapper for AI edge function calls with context enrichment
 */
export async function wrapAICall<T>(
  aiFunction: () => Promise<{ data: T | null; error: unknown }>,
  context: AICallContext
): Promise<{ data: T | null; error: EnrichedAIError | null }> {
  const startTime = performance.now();
  const feature = context.feature;
  const model = context.model || 'gemini-2.5-flash';
  const maxRetries = context.maxRetries ?? 0;
  let lastError: EnrichedAIError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const stats = aiCallStats.get(feature) || {
      success: 0,
      failure: 0,
      lastSuccess: 0,
    };

    log.info(
      `AI call attempt ${attempt + 1}/${maxRetries + 1} for: ${feature}`,
      'aiErrorContext',
      {
        model,
        estimatedTokens: context.estimatedTokens,
      }
    );

    try {
      const result = await aiFunction();
      const executionTimeMs = Math.round(performance.now() - startTime);

      if (result.error) {
        lastError = enrichAIError(result.error, {
          feature,
          model,
          executionTimeMs,
          previousSuccessCount: stats.success,
        });

        aiCallStats.set(feature, { ...stats, failure: stats.failure + 1 });
        log.error(
          `AI call failed (attempt ${attempt + 1}): ${feature}`,
          'aiErrorContext',
          lastError
        );

        if (!lastError.retryable || attempt === maxRetries) {
          return { data: null, error: lastError };
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Simple backoff
        continue;
      }

      const now = Date.now();
      aiCallStats.set(feature, {
        ...stats,
        success: stats.success + 1,
        lastSuccess: now,
      });

      log.info(`AI call succeeded: ${feature}`, 'aiErrorContext', {
        executionTimeMs,
        dataReceived: !!result.data,
      });

      return { data: result.data, error: null };
    } catch (error: unknown) {
      const executionTimeMs = Math.round(performance.now() - startTime);
      lastError = enrichAIError(error, {
        feature,
        model,
        executionTimeMs,
        previousSuccessCount: stats.success,
      });

      aiCallStats.set(feature, { ...stats, failure: stats.failure + 1 });
      log.error(
        `AI call exception (attempt ${attempt + 1}): ${feature}`,
        'aiErrorContext',
        lastError
      );

      if (!lastError.retryable || attempt === maxRetries) {
        return { data: null, error: lastError };
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // Simple backoff
    }
  }

  return { data: null, error: lastError };
}

/**
 * Enrich an AI error with contextual information
 */
function enrichAIError(
  error: unknown,
  context: {
    feature: string;
    model: string;
    executionTimeMs: number;
    previousSuccessCount: number;
  }
): EnrichedAIError {
  let statusCode: number | undefined;
  let errorMessage: string | undefined;

  if (isPossibleError(error)) {
    statusCode =
      error.status ||
      error.statusCode ||
      (error.message?.includes('429') ? 429 : undefined);
    errorMessage = error.message;
  }

  // Determine error type and suggested action
  const { code, message, suggestedAction, retryAfterSeconds } = classifyAIError(
    error,
    context
  );

  const enrichedError: EnrichedAIError = {
    message,
    code,
    statusCode,
    context: context.feature,
    retryable: isRetryableAIError(statusCode, code),
    aiContext: {
      feature: context.feature,
      model: context.model,
      executionTimeMs: context.executionTimeMs,
      previousSuccessCount: context.previousSuccessCount,
      suggestedAction,
      retryAfterSeconds,
    },
  };

  return enrichedError;
}

/**
 * Classify AI error and provide user-friendly message
 */
function classifyAIError(
  error: unknown,
  context: { feature: string; executionTimeMs: number }
): {
  code: string;
  message: string;
  suggestedAction: string;
  retryAfterSeconds?: number;
} {
  let errorMessage = String(error);
  let statusCode: number | undefined;

  if (isPossibleError(error)) {
    errorMessage = error.message || error.error || String(error);
    statusCode = error.status || error.statusCode;
  }

  // Rate limit exceeded (429)
  if (statusCode === 429 || errorMessage.toLowerCase().includes('rate limit')) {
    return {
      code: 'rate_limit_exceeded',
      message: 'High AI usage right now. Request will retry automatically.',
      suggestedAction: 'Wait a minute and try again, or simplify your request.',
      retryAfterSeconds: 60,
    };
  }

  // Payment required (402) - credits depleted
  if (statusCode === 402 || errorMessage.toLowerCase().includes('credits')) {
    return {
      code: 'payment_required',
      message: 'AI credits used up. Add more credits to continue.',
      suggestedAction:
        'Add credits in Settings → Billing, or try again next month.',
    };
  }

  // Network timeout
  if (
    errorMessage.toLowerCase().includes('timeout') ||
    context.executionTimeMs > 25000
  ) {
    return {
      code: 'timeout',
      message: 'AI request took too long to complete.',
      suggestedAction:
        'Try a simpler prompt, or check your internet connection.',
    };
  }

  // Network error
  if (
    errorMessage.toLowerCase().includes('network') ||
    errorMessage.toLowerCase().includes('connection')
  ) {
    return {
      code: 'network_error',
      message: 'Network connection issue. Will retry automatically.',
      suggestedAction: 'Check your internet connection.',
      retryAfterSeconds: 5,
    };
  }

  // Authentication error
  if (
    statusCode === 401 ||
    errorMessage.toLowerCase().includes('unauthorized')
  ) {
    return {
      code: 'unauthorized',
      message: 'Authentication required. Please log in again.',
      suggestedAction: 'You will be redirected to log in.',
    };
  }

  // Validation error (400)
  if (statusCode === 400 || errorMessage.toLowerCase().includes('invalid')) {
    return {
      code: 'validation_error',
      message: 'Invalid request format or parameters.',
      suggestedAction: 'Check your input and try again.',
    };
  }

  // Server error (500)
  if (statusCode && statusCode >= 500) {
    return {
      code: 'server_error',
      message: 'AI service temporarily unavailable.',
      suggestedAction: 'Try again in a few moments.',
      retryAfterSeconds: 30,
    };
  }

  // Generic AI error
  return {
    code: 'ai_error',
    message: `AI feature error: ${errorMessage.substring(0, 100)}`,
    suggestedAction: 'Try again or contact support if issue persists.',
  };
}

/**
 * Determine if an AI error is retryable
 */
function isRetryableAIError(statusCode?: number, code?: string): boolean {
  // Rate limits are retryable after waiting
  if (statusCode === 429 || code === 'rate_limit_exceeded') return true;

  // Network errors are retryable
  if (code === 'network_error' || code === 'timeout') return true;

  // Server errors are retryable
  if (statusCode && statusCode >= 500) return true;

  // Auth errors, payment errors, validation errors are not retryable
  return false;
}

/**
 * Get AI call statistics for a feature
 */
export function getAICallStats(feature: string) {
  return aiCallStats.get(feature) || { success: 0, failure: 0, lastSuccess: 0 };
}

/**
 * Reset AI call statistics (useful for testing)
 */
export function resetAICallStats(feature?: string): void {
  if (feature) {
    aiCallStats.delete(feature);
  } else {
    aiCallStats.clear();
  }
}

/**
 * Get user-friendly error message for display
 */
export function getAIErrorMessage(error: EnrichedAIError): string {
  const { message, aiContext } = error;

  // Add retry information if available
  if (aiContext.retryAfterSeconds) {
    return `${message} (Retrying in ${aiContext.retryAfterSeconds}s)`;
  }

  return message;
}

/**
 * Format suggested action with context
 */
export function getAIErrorAction(error: EnrichedAIError): string {
  return error.aiContext.suggestedAction;
}
