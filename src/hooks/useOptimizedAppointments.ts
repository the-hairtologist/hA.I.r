/**
 * Optimized Appointments Hook with Enhanced Query
 * Uses enhanced query with retry logic, caching, and offline support
 */

import { useEnhancedQuery } from './useEnhancedQuery';
import {
  getUpcomingAppointments,
  getAppointmentsByDateRange,
} from '@/lib/queries/optimizedQueries';

export const useOptimizedAppointments = (stylistId: string | undefined) => {
  return useEnhancedQuery({
    queryKey: ['appointments', 'upcoming', stylistId],
    queryFn: () => getUpcomingAppointments(stylistId!),
    enabled: !!stylistId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    cacheTable: 'appointments',
    cacheParams: { type: 'upcoming', stylistId },
    retryOptions: {
      maxRetries: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
    },
    offlineSupport: true,
  });
};

export const useAppointmentsByDateRange = (
  stylistId: string | undefined,
  startDate: Date,
  endDate: Date
) => {
  return useEnhancedQuery({
    queryKey: [
      'appointments',
      'range',
      stylistId,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => getAppointmentsByDateRange(stylistId!, startDate, endDate),
    enabled: !!stylistId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    cacheTable: 'appointments',
    cacheParams: {
      type: 'range',
      stylistId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    retryOptions: {
      maxRetries: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
    },
    offlineSupport: true,
  });
};
