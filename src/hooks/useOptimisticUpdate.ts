import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook for optimistic UI updates
 * Updates UI immediately, then syncs with server
 */
export function useOptimisticUpdate<T>() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      updateFn: () => Promise<T>,
      options: OptimisticUpdateOptions<T> = {}
    ) => {
      const {
        onSuccess,
        onError,
        successMessage = 'Updated successfully',
        errorMessage = 'Update failed',
      } = options;

      setIsUpdating(true);
      setError(null);

      try {
        const result = await updateFn();

        if (successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Update failed');
        setError(error);

        if (errorMessage) {
          toast.error(errorMessage);
        }

        onError?.(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    mutate,
    isUpdating,
    error,
  };
}
