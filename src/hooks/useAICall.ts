/**
 * Generic AI Call Hook
 * Wraps Supabase edge function calls with error context enrichment
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  wrapAICall,
  type AICallContext,
  type EnrichedAIError,
} from '@/lib/aiErrorContext';
import { log } from '@/lib/logger';

interface UseAICallOptions<T> {
  model?: string;
  estimatedTokens?: number;
  maxRetries?: number;
  timeout?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: EnrichedAIError) => void;
}

interface UseAICallReturn<T> {
  invoke: (body: any) => Promise<T | null>;
  loading: boolean;
  error: EnrichedAIError | null;
  data: T | null;
}

/**
 * Hook for making AI edge function calls with automatic error handling
 *
 * @example
 * ```typescript
 * const { invoke, loading, error } = useAICall('ai-formula-analyzer', {
 *   model: 'gemini-2.5-flash',
 *   onSuccess: (data) => console.log('Success:', data)
 * });
 *
 * await invoke({ formulas: [...] });
 * ```
 */
export function useAICall<T = any>(
  functionName: string,
  options?: UseAICallOptions<T>
): UseAICallReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnrichedAIError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const invoke = useCallback(
    async (body: any): Promise<T | null> => {
      setLoading(true);
      setError(null);

      log.info(`AI call invoked: ${functionName}`, 'useAICall', { body });

      try {
        const context: AICallContext = {
          feature: functionName,
          model: options?.model || 'gemini-2.5-flash',
          estimatedTokens: options?.estimatedTokens,
          maxRetries: options?.maxRetries,
          timeout: options?.timeout,
        };

        const result = await wrapAICall<T>(
          () => supabase.functions.invoke(functionName, { body }),
          context
        );

        if (result.error) {
          setError(result.error);
          options?.onError?.(result.error);
          return null;
        }

        if (result.data) {
          setData(result.data);
          options?.onSuccess?.(result.data);
          return result.data;
        }

        return null;
      } catch (err: any) {
        const enrichedError: EnrichedAIError = {
          message: err.message || 'Unknown error',
          code: 'ai_call_failed',
          context: functionName,
          retryable: false,
          aiContext: {
            feature: functionName,
            model: options?.model || 'gemini-2.5-flash',
            executionTimeMs: 0,
            previousSuccessCount: 0,
            suggestedAction: 'Try again or contact support',
          },
        };

        setError(enrichedError);
        options?.onError?.(enrichedError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [functionName, options]
  );

  return {
    invoke,
    loading,
    error,
    data,
  };
}
