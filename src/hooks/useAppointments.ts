/**
 * Appointments Management Hook
 * Handles fetching, creating, and updating appointments
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { log } from '@/lib/logger';
import { useEnhancedQuery, invalidateQueryCache } from '@/lib';

export interface Appointment {
  id: string;
  stylist_id: string;
  client_id: string;
  appointment_date: string;
  service_type: string;
  service_id?: string;
  duration_minutes: number;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  reminder_sent?: boolean;
  client?: any;
  stylist?: any;
  service?: any;
}

interface UseAppointmentsOptions {
  stylistId?: string;
  clientId?: string;
  status?: string;
  autoFetch?: boolean;
}

interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createAppointment: (data: Partial<Appointment>) => Promise<Appointment>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  sendSMSNotification: (appointmentId: string, type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule') => Promise<void>;
}

export function useAppointments(options: UseAppointmentsOptions = {}): UseAppointmentsReturn {
  const { stylistId, clientId, status, autoFetch = true } = options;

  // Use enhanced query with retry, caching, and offline support
  const queryKey = ['appointments', stylistId, clientId, status];
  
  const { data: appointments = [], isLoading: loading, error, refetch } = useEnhancedQuery({
    queryKey,
    enabled: autoFetch,
    queryFn: async () => {
      log.debug('Fetching appointments', 'useAppointments', { stylistId, clientId, status });

      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:client_profiles(
            id,
            full_name,
            email,
            phone,
            user:profiles(full_name, email)
          ),
          stylist:stylist_profiles(
            id,
            business_name,
            user:profiles(full_name, email, phone)
          ),
          service:stylist_services(
            id,
            service_name,
            price,
            duration_minutes
          )
        `)
        .order('appointment_date', { ascending: false });

      if (stylistId) {
        query = query.eq('stylist_id', stylistId);
      }

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      log.info('Appointments loaded successfully', 'useAppointments', { count: data?.length });
      return (data as Appointment[]) || [];
    },
    retryOptions: {
      maxRetries: 3,
    },
    cacheTable: 'appointments',
    cacheParams: { stylistId, clientId, status },
    offlineSupport: true,
  });

  const createAppointment = useCallback(async (data: Partial<Appointment>): Promise<Appointment> => {
    try {
      log.debug('Creating appointment', 'useAppointments', data);

      const { data: newAppointment, error } = await supabase
        .from('appointments')
        .insert(data as any)
        .select()
        .maybeSingle();

      if (error) throw error;

      // Invalidate cache to trigger refetch
      invalidateQueryCache('appointments');

      toast.success('Appointment created successfully');
      log.info('Appointment created', 'useAppointments', { id: newAppointment.id });

      return newAppointment;
    } catch (error) {
      handleError(error, 'Create Appointment');
      throw error;
    }
  }, []);

  const updateAppointment = useCallback(async (id: string, data: Partial<Appointment>) => {
    try {
      log.debug('Updating appointment', 'useAppointments', { id, data });

      const { error } = await supabase
        .from('appointments')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      // Invalidate cache to trigger refetch
      invalidateQueryCache('appointments');

      toast.success('Appointment updated successfully');
      log.info('Appointment updated', 'useAppointments', { id });
    } catch (error) {
      handleError(error, 'Update Appointment');
      throw error;
    }
  }, []);

  const cancelAppointment = useCallback(async (id: string, reason?: string) => {
    try {
      log.debug('Cancelling appointment', 'useAppointments', { id, reason });

      const updateData = {
        status: 'cancelled',
        ...(reason && { cancellation_reason: reason }),
      };

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Invalidate cache to trigger refetch
      invalidateQueryCache('appointments');

      toast.success('Appointment cancelled');
      log.info('Appointment cancelled', 'useAppointments', { id });
    } catch (error) {
      handleError(error, 'Cancel Appointment');
      throw error;
    }
  }, []);

  const sendSMSNotification = useCallback(async (
    appointmentId: string,
    type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule'
  ) => {
    try {
      log.debug('Sending SMS notification', 'useAppointments', { appointmentId, type });

      await supabase.functions.invoke('send-sms-notification', {
        body: {
          appointmentId,
          notificationType: type,
        },
      });

      log.info('SMS notification sent', 'useAppointments', { appointmentId, type });
    } catch (error) {
      log.warn('SMS notification failed', 'useAppointments', error);
      // Don't throw - SMS failures shouldn't block the operation
    }
  }, []);

  return {
    appointments,
    loading,
    error: error as Error | null,
    refetch: async () => { await refetch(); },
    createAppointment,
    updateAppointment,
    cancelAppointment,
    sendSMSNotification,
  };
}
