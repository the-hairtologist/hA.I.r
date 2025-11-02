/**
 * Loading State Management Hook
 * Provides consistent loading state handling with minimum display time
 */

import { useState, useEffect, useRef } from 'react';

interface UseLoadingStateOptions {
  minDisplayTime?: number; // Minimum time to show loading state (prevents flickering)
  initialLoading?: boolean;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const { minDisplayTime = 500, initialLoading = false } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [shouldShowLoading, setShouldShowLoading] = useState(initialLoading);
  const loadingStartTime = useRef<number | null>(null);

  const startLoading = () => {
    loadingStartTime.current = Date.now();
    setIsLoading(true);
    setShouldShowLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);

    if (loadingStartTime.current) {
      const elapsedTime = Date.now() - loadingStartTime.current;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        setShouldShowLoading(false);
        loadingStartTime.current = null;
      }, remainingTime);
    } else {
      setShouldShowLoading(false);
    }
  };

  return {
    isLoading,
    shouldShowLoading,
    startLoading,
    stopLoading,
  };
};

/**
 * Async operation wrapper with loading state
 */
export const useAsyncLoading = () => {
  const { shouldShowLoading, startLoading, stopLoading } = useLoadingState();

  const executeAsync = async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading: shouldShowLoading,
    executeAsync,
  };
};
