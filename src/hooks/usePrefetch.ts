/**
 * Intelligent Prefetching Hook
 * Prefetch data on hover, during idle time, or based on patterns
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/queryCache';

interface PrefetchOptions {
  enabled?: boolean;
  hoverDelay?: number;
}

export function usePrefetch(options: PrefetchOptions = {}) {
  const { enabled = true, hoverDelay = 100 } = options;
  const queryClient = useQueryClient();

  /**
   * Prefetch appointments on hover
   */
  const prefetchAppointments = useCallback(
    (stylistId: string) => {
      if (!enabled) return;

      const timeoutId = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: queryKeys.appointments.list(stylistId),
          staleTime: 1000 * 60 * 5,
        });
      }, hoverDelay);

      return () => clearTimeout(timeoutId);
    },
    [queryClient, enabled, hoverDelay]
  );

  /**
   * Prefetch clients on hover
   */
  const prefetchClients = useCallback(
    (stylistId: string) => {
      if (!enabled) return;

      const timeoutId = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: queryKeys.clients.list(stylistId),
          staleTime: 1000 * 60 * 5,
        });
      }, hoverDelay);

      return () => clearTimeout(timeoutId);
    },
    [queryClient, enabled, hoverDelay]
  );

  /**
   * Prefetch messages on hover
   */
  const prefetchMessages = useCallback(
    (userId: string) => {
      if (!enabled) return;

      const timeoutId = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: queryKeys.messages.conversations(userId),
          staleTime: 1000 * 60 * 2, // 2 minutes for messages
        });
      }, hoverDelay);

      return () => clearTimeout(timeoutId);
    },
    [queryClient, enabled, hoverDelay]
  );

  /**
   * Prefetch during idle time
   */
  const prefetchOnIdle = useCallback(
    (callback: () => void) => {
      if (!enabled) return;

      if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(callback, { timeout: 2000 });
        return () => cancelIdleCallback(id);
      } else {
        // Fallback for browsers without requestIdleCallback
        const id = setTimeout(callback, 100);
        return () => clearTimeout(id);
      }
    },
    [enabled]
  );

  /**
   * Smart prefetch based on patterns
   * E.g., if viewing clients, prefetch formulas
   */
  const prefetchRelated = useCallback(
    (currentRoute: string, userId: string) => {
      if (!enabled) return;

      prefetchOnIdle(() => {
        if (currentRoute.includes('/clients')) {
          // If viewing clients, prefetch appointments
          queryClient.prefetchQuery({
            queryKey: queryKeys.appointments.list(userId),
            staleTime: 1000 * 60 * 5,
          });
        } else if (currentRoute.includes('/appointments')) {
          // If viewing appointments, prefetch clients
          queryClient.prefetchQuery({
            queryKey: queryKeys.clients.list(userId),
            staleTime: 1000 * 60 * 5,
          });
        }
      });
    },
    [queryClient, enabled, prefetchOnIdle]
  );

  return {
    prefetchAppointments,
    prefetchClients,
    prefetchMessages,
    prefetchOnIdle,
    prefetchRelated,
  };
}
