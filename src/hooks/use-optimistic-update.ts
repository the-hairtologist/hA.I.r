/**
 * Optimistic Update Hook
 * Provides instant UI feedback before server response
 */

import { useState, useCallback } from 'react';

interface OptimisticConfig<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  rollbackDelay?: number;
}

export const useOptimisticUpdate = <T>(
  initialData: T,
  mutationFn: (data: T) => Promise<T>,
  config?: OptimisticConfig<T>
) => {
  const [data, setData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (newData: T) => {
      const previousData = data;

      // Optimistically update UI immediately
      setData(newData);
      setIsOptimistic(true);
      setError(null);

      try {
        // Perform actual mutation
        const result = await mutationFn(newData);

        // Success - keep the new data
        setData(result);
        config?.onSuccess?.(result);
      } catch (err) {
        // Error - rollback to previous state
        const error = err as Error;
        setError(error);

        // Rollback with delay for better UX
        setTimeout(() => {
          setData(previousData);
        }, config?.rollbackDelay || 300);

        config?.onError?.(error);
      } finally {
        setIsOptimistic(false);
      }
    },
    [data, mutationFn, config]
  );

  return {
    data,
    update,
    isOptimistic,
    error,
  };
};
