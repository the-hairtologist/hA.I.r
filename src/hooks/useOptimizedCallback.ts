/**
 * Optimized Callback Hook
 * Memoizes callbacks with proper dependency management
 */

import { useCallback, useRef, useEffect } from 'react';

type CallbackFunction = (...args: unknown[]) => unknown;

/**
 * Creates an optimized callback that updates only when dependencies change
 * Unlike useCallback, this ensures the latest values are used without re-creating the function
 *
 * @param callback - Function to optimize
 * @param deps - Dependency array
 * @returns Memoized callback
 *
 * @example
 * ```tsx
 * const handleSearch = useOptimizedCallback(
 *   (query: string) => {
 *     performSearch(query, filters);
 *   },
 *   [filters]
 * );
 * ```
 */
export function useOptimizedCallback<T extends CallbackFunction>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);

  // Always store the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Return memoized wrapper that calls the latest callback
  return useCallback(
    ((...args: unknown[]) => {
      return callbackRef.current(...args);
    }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
}

/**
 * Creates a debounced callback
 * Useful for search inputs and resize handlers
 */
export function useDebouncedCallback<T extends CallbackFunction>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  );
}

/**
 * Creates a throttled callback
 * Useful for scroll and mousemove handlers
 */
export function useThrottledCallback<T extends CallbackFunction>(
  callback: T,
  limit: number,
  deps: React.DependencyList
): T {
  const lastRan = useRef(Date.now());
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();

      if (now - lastRan.current >= limit) {
        callbackRef.current(...args);
        lastRan.current = now;
      }
    }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, ...deps]
  );
}
