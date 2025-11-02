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

interface UseAICallReturn<T, Body> {
  invoke: (body: Body) => Promise<T | null>;
  loading: boolean;
  error: EnrichedAIError | null;
  data: T | null;
}

/**
 * Hook for making AI edge function calls with automatic error handling
 *
 * @example
 * ```typescript
 * const { invoke, loading, error } = useAICall<{ result: string }, { prompt: string }>('ai-formula-analyzer', {
 *   model: 'gemini-2.5-flash',
 *   onSuccess: (data) => console.log('Success:', data.result)
 * });
 *
 * await invoke({ prompt: "some formula" });
 * ```
 */
export function useAICall<
  T = unknown,
  Body extends Record<string, unknown> = Record<string, unknown>,
>(
  functionName: string,
  options?: UseAICallOptions<T>
): UseAICallReturn<T, Body> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnrichedAIError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const invoke = useCallback(
    async (body: Body): Promise<T | null> => {
      setLoading(true);
      setError(null);

      log.info(`AI call invoked: ${functionName}`, 'useAICall', { body });

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
        setLoading(false);
        return null;
      }

      if (result.data) {
        setData(result.data);
        options?.onSuccess?.(result.data);
        setLoading(false);
        return result.data;
      }

      setLoading(false);
      return null;
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
