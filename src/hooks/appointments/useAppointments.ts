import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/productionLogger';
import { triggerAppointmentBooked } from '@/lib/zapierTriggers';

export interface Appointment {
  id: string;
  stylist_id: string;
  client_id: string;
  service_id?: string | null;
  service_type: string;
  appointment_date: string;
  duration_minutes?: number | null;
  status?: string | null;
  notes?: string | null;
  confirmation_requested_24h?: boolean | null;
  confirmation_requested_48h?: boolean | null;
  confirmed_at?: string | null;
  confirmed_by_client?: boolean | null;
  followup_sent?: boolean | null;
  rebook_reminder_sent?: boolean | null;
  reminder_sent?: boolean | null;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  };
  services?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

interface CreateAppointmentData {
  stylist_id: string;
  client_id: string;
  service_id?: string | null;
  service_type: string;
  appointment_date: string;
  duration_minutes?: number | null;
  status?: string | null;
  notes?: string | null;
}

interface UpdateAppointmentData {
  id: string;
  appointment_date?: string;
  service_type?: string;
  duration_minutes?: number | null;
  status?: string | null;
  notes?: string | null;
}

// Query Keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  byStylist: (stylistId: string) =>
    [...appointmentKeys.all, 'stylist', stylistId] as const,
  byClient: (clientId: string) =>
    [...appointmentKeys.all, 'client', clientId] as const,
  byId: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
};

// Fetch appointments by stylist
export const useAppointmentsByStylist = (stylistId: string | null) => {
  return useQuery({
    queryKey: appointmentKeys.byStylist(stylistId || ''),
    queryFn: async () => {
      if (!stylistId) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          client_profiles!appointments_client_id_fkey (
            id,
            full_name,
            phone,
            email
          ),
          stylist_services (
            id,
            name,
            price,
            duration
          )
        `
        )
        .eq('stylist_id', stylistId)
        .order('appointment_date', { ascending: true });

      if (error) {
        logger.error('Failed to fetch appointments', { error });
        throw error;
      }

      return data as any;
    },
    enabled: !!stylistId,
  });
};

// Fetch appointments by client
export const useAppointmentsByClient = (clientId: string | null) => {
  return useQuery({
    queryKey: appointmentKeys.byClient(clientId || ''),
    queryFn: async () => {
      if (!clientId) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          client_profiles!appointments_client_id_fkey (
            id,
            full_name,
            phone,
            email
          ),
          stylist_services (
            id,
            name,
            price,
            duration
          )
        `
        )
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: false });

      if (error) {
        logger.error('Failed to fetch client appointments', { error });
        throw error;
      }

      return data as any;
    },
    enabled: !!clientId,
  });
};

// Create appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData: CreateAppointmentData) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            ...appointmentData,
            status: appointmentData.status || 'scheduled',
          },
        ])
        .select(
          `
          *,
          client_profiles!appointments_client_id_fkey (
            id,
            full_name,
            phone,
            email
          ),
          stylist_services (
            id,
            name,
            price,
            duration
          )
        `
        )
        .maybeSingle();

      if (error) {
        logger.error('Failed to create appointment', { error });
        throw error;
      }

      // Trigger Zapier webhook
      if (data) {
        await triggerAppointmentBooked(data.stylist_id, data);
      }

      return data as any;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.byStylist(data.stylist_id),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.byClient(data.client_id),
      });
      toast.success('Appointment created successfully');
      logger.info('Appointment created', { id: data.id });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create appointment');
    },
  });
};

// Update appointment
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateAppointmentData) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          client_profiles!appointments_client_id_fkey (
            id,
            full_name,
            phone,
            email
          ),
          stylist_services (
            id,
            name,
            price,
            duration
          )
        `
        )
        .maybeSingle();

      if (error) {
        logger.error('Failed to update appointment', { error, id });
        throw error;
      }

      return data as any;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.byStylist(data.stylist_id),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.byClient(data.client_id),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.byId(data.id),
      });
      toast.success('Appointment updated successfully');
      logger.info('Appointment updated', { id: data.id });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update appointment');
    },
  });
};

// Delete appointment
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get the appointment data before deleting to invalidate correct queries
      const { data: appointment } = await supabase
        .from('appointments')
        .select('stylist_id, client_id')
        .eq('id', id)
        .maybeSingle();

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Failed to delete appointment', { error, id });
        throw error;
      }

      return { id, appointment };
    },
    onSuccess: result => {
      if (result.appointment) {
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.byStylist(result.appointment.stylist_id),
        });
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.byClient(result.appointment.client_id),
        });
      }
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success('Appointment deleted successfully');
      logger.info('Appointment deleted', { id: result.id });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete appointment');
    },
  });
};

// Update appointment status
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          client_profiles!appointments_client_id_fkey (
            id,
            full_name,
            phone,
            email
          ),
          stylist_services (
            id,
            name,
            price,
            duration
          )
        `
        )
        .maybeSingle();

      if (error) {
        logger.error('Failed to update appointment status', {
          error,
          id,
          status,
        });
        throw error;
      }

      return data as any;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.byStylist(data.stylist_id),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.byClient(data.client_id),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.byId(data.id),
      });
      toast.success('Appointment status updated');
      logger.info('Appointment status updated', {
        id: data.id,
        status: data.status,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update appointment status');
    },
  });
};
