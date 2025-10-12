/**
 * Optimized Appointments Hook
 * Uses indexed queries and smart caching
 */

import { useQuery } from "@tanstack/react-query";
import { getUpcomingAppointments, getAppointmentsByDateRange } from "@/lib/queries/optimizedQueries";

export const useOptimizedAppointments = (stylistId: string | undefined) => {
  return useQuery({
    queryKey: ["appointments", "upcoming", stylistId],
    queryFn: () => getUpcomingAppointments(stylistId!),
    enabled: !!stylistId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useAppointmentsByDateRange = (
  stylistId: string | undefined,
  startDate: Date,
  endDate: Date
) => {
  return useQuery({
    queryKey: ["appointments", "range", stylistId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => getAppointmentsByDateRange(stylistId!, startDate, endDate),
    enabled: !!stylistId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};
