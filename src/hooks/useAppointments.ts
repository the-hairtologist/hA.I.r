/**
 * useAppointments Hook
 * React Query hook for managing appointment data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchAppointmentsByStylist,
  fetchAppointmentsByClient,
  fetchAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
} from "@/lib/api/appointments";
import type { Appointment, CreateAppointmentData, UpdateAppointmentData } from "@/lib/api/appointments";
import { handleApiError } from "@/lib/api/errorHandler";
import { cacheManager } from "@/lib/cache/CacheManager";
import { useCachedQuery } from "@/hooks/useCachedQuery";

/**
 * Query key factory for appointments
 */
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  listByStylist: (stylistId: string, page?: number) => 
    page ? [...appointmentKeys.lists(), 'stylist', stylistId, 'page', page] as const : [...appointmentKeys.lists(), 'stylist', stylistId] as const,
  listByClient: (clientId: string) => [...appointmentKeys.lists(), 'client', clientId] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
};

/**
 * Fetch appointments for a stylist (with pagination support)
 */
export const useAppointmentsByStylist = (stylistId: string | null, page: number = 1, limit: number = 100) => {
  return useCachedQuery({
    queryKey: appointmentKeys.listByStylist(stylistId || '', page),
    queryFn: () => fetchAppointmentsByStylist(stylistId!, page, limit),
    cacheType: 'appointments',
    enabled: !!stylistId,
  });
};

/**
 * Fetch appointments for a client
 */
export const useAppointmentsByClient = (clientId: string | null) => {
  return useCachedQuery({
    queryKey: appointmentKeys.listByClient(clientId || ''),
    queryFn: () => fetchAppointmentsByClient(clientId!),
    cacheType: 'appointments',
    enabled: !!clientId,
  });
};

/**
 * Fetch a single appointment
 */
export const useAppointment = (appointmentId: string | null) => {
  return useCachedQuery({
    queryKey: appointmentKeys.detail(appointmentId || ''),
    queryFn: () => fetchAppointmentById(appointmentId!),
    cacheType: 'appointments',
    enabled: !!appointmentId,
  });
};

/**
 * Create a new appointment
 */
export const useCreateAppointment = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentData) => createAppointment(data),
    onSuccess: (newAppointment) => {
      // Smart cache invalidation - auto-invalidates appointments, upcomingAppointments, analytics
      cacheManager.invalidateAfterMutation('appointment', stylistId);
      
      // If appointment has client, invalidate client appointments too
      if (newAppointment.client_id) {
        queryClient.invalidateQueries({ queryKey: appointmentKeys.listByClient(newAppointment.client_id) });
      }
      
      toast.success("Appointment created successfully");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to create appointment",
        logContext: { stylistId, operation: "createAppointment" },
      });
    },
  });
};

/**
 * Update an appointment
 */
export const useUpdateAppointment = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAppointmentData) => updateAppointment(data),
    onSuccess: (updatedAppointment) => {
      // Smart cache invalidation
      cacheManager.invalidateAfterMutation('appointment', stylistId);
      
      // Update in list cache
      queryClient.setQueryData<Appointment[]>(
        appointmentKeys.listByStylist(stylistId),
        (old) => old?.map((apt) => 
          apt.id === updatedAppointment.id ? updatedAppointment : apt
        ) || []
      );
      
      // Update in detail cache
      queryClient.setQueryData(
        appointmentKeys.detail(updatedAppointment.id),
        updatedAppointment
      );
      
      toast.success("Appointment updated");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to update appointment",
        logContext: { stylistId, operation: "updateAppointment" },
      });
    },
  });
};

/**
 * Delete an appointment
 */
export const useDeleteAppointment = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => deleteAppointment(appointmentId),
    onSuccess: (_, appointmentId) => {
      // Smart cache invalidation
      cacheManager.invalidateAfterMutation('appointment', stylistId);
      
      // Remove from list cache
      queryClient.setQueryData<Appointment[]>(
        appointmentKeys.listByStylist(stylistId),
        (old) => old?.filter((apt) => apt.id !== appointmentId) || []
      );
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(appointmentId) });
      
      toast.success("Appointment deleted");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to delete appointment",
        logContext: { stylistId, operation: "deleteAppointment" },
      });
    },
  });
};

/**
 * Update appointment status only
 */
export const useUpdateAppointmentStatus = (stylistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: string; status: string }) => 
      updateAppointmentStatus(appointmentId, status),
    onSuccess: (updatedAppointment) => {
      // Smart cache invalidation
      cacheManager.invalidateAfterMutation('appointment', stylistId);
      
      // Update caches
      queryClient.setQueryData<Appointment[]>(
        appointmentKeys.listByStylist(stylistId),
        (old) => old?.map((apt) => 
          apt.id === updatedAppointment.id ? updatedAppointment : apt
        ) || []
      );
      
      queryClient.setQueryData(
        appointmentKeys.detail(updatedAppointment.id),
        updatedAppointment
      );
      
      toast.success("Appointment status updated");
    },
    onError: (error) => {
      handleApiError(error, {
        userMessage: "Failed to update appointment status",
        logContext: { stylistId, operation: "updateAppointmentStatus" },
      });
    },
  });
};
