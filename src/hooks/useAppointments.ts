/**
 * Appointments Management Hook
 * Handles fetching, creating, and updating appointments
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';
import { trackSelect, trackInsert, trackUpdate } from '@/lib/logging/supabaseTracker';
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
      logger.debug('Fetching appointments', { 
        component: 'useAppointments', 
        stylistId, 
        clientId, 
        status 
      });

      return await trackSelect(
        async () => {
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

          logger.info('Appointments loaded successfully', { 
            component: 'useAppointments', 
            count: data?.length 
          });
          return { data: (data as Appointment[]) || [], error: null };
        },
        'appointments',
        'useAppointments',
        { stylistId, clientId, status }
      ).then(result => {
        if (result.error) throw result.error;
        return result.data || [];
      });
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
      logger.debug('Creating appointment', { component: 'useAppointments', data });
      userJourney.trackAction('Create Appointment', { serviceType: data.service_type });

      const result = await trackInsert(
        async () => {
          const { data: newAppointment, error } = await supabase
            .from('appointments')
            .insert(data as any)
            .select()
            .maybeSingle();
          return { data: newAppointment, error };
        },
        'appointments',
        'useAppointments',
        { serviceType: data.service_type }
      );

      if (result.error) throw result.error;
      const newAppointment = result.data!;

      // Invalidate cache to trigger refetch
      invalidateQueryCache('appointments');

      toast.success('Appointment created successfully');
      logger.info('Appointment created', { 
        component: 'useAppointments', 
        id: newAppointment.id 
      });
      userJourney.trackAction('Appointment Created', { id: newAppointment.id });

      // Trigger Zapier webhook
      try {
        const { triggerAppointmentBooked } = await import("@/lib/zapierTriggers");
        await triggerAppointmentBooked(newAppointment.stylist_id, {
          appointment_id: newAppointment.id,
          appointment_date: newAppointment.appointment_date,
          service_type: newAppointment.service_type,
          client_id: newAppointment.client_id,
        });
      } catch (error) {
        logger.warn('Zapier webhook failed', { 
          component: 'useAppointments', 
          error 
        });
      }

      // Auto-sync to calendar (non-blocking)
      supabase.functions.invoke('sync-calendar-event', {
        body: { appointment_id: newAppointment.id, action: 'create' }
      }).catch(err => logger.warn('Calendar sync failed', { component: 'useAppointments', error: err }));

      // Trigger Zapier webhook (non-blocking)
      supabase.functions.invoke('zapier-trigger', {
        body: {
          event: 'appointment.booked',
          data: {
            appointment_id: newAppointment.id,
            client_name: data.client_id,
            service_type: data.service_type,
            appointment_date: data.appointment_date,
            timestamp: new Date().toISOString()
          }
        }
      }).catch(err => logger.warn('Zapier trigger failed', { component: 'useAppointments', error: err }));

      return newAppointment;
    } catch (error) {
      logger.error('Create appointment failed', error, { component: 'useAppointments' });
      userJourney.trackError(error as Error, { action: 'createAppointment' });
      handleError(error, 'Create Appointment');
      throw error;
    }
  }, []);

  const updateAppointment = useCallback(async (id: string, data: Partial<Appointment>) => {
    try {
      logger.debug('Updating appointment', { component: 'useAppointments', id, data });
      userJourney.trackAction('Update Appointment', { id });

      const result = await trackUpdate(
        async () => {
          const { error } = await supabase
            .from('appointments')
            .update(data)
            .eq('id', id);
          return { data: null, error };
        },
        'appointments',
        'useAppointments',
        { id }
      );

      if (result.error) throw result.error;

      // Invalidate cache to trigger refetch
      invalidateQueryCache('appointments');

      toast.success('Appointment updated successfully');
      logger.info('Appointment updated', { component: 'useAppointments', id });

      // Auto-sync update to calendar (non-blocking)
      supabase.functions.invoke('sync-calendar-event', {
        body: { appointment_id: id, action: 'update' }
      }).catch(err => logger.warn('Calendar sync failed', { component: 'useAppointments', error: err }));
    } catch (error) {
      logger.error('Update appointment failed', error, { component: 'useAppointments', id });
      userJourney.trackError(error as Error, { action: 'updateAppointment', id });
      handleError(error, 'Update Appointment');
      throw error;
    }
  }, []);

  const cancelAppointment = useCallback(async (id: string, reason?: string) => {
    try {
      logger.debug('Cancelling appointment', { component: 'useAppointments', id, reason });
      userJourney.trackAction('Cancel Appointment', { id, reason });

      const updateData = {
        status: 'cancelled',
        ...(reason && { cancellation_reason: reason }),
      };

      const result = await trackUpdate(
        async () => {
          const { error } = await supabase
            .from('appointments')
            .update(updateData)
            .eq('id', id);
          return { data: null, error };
        },
        'appointments',
        'useAppointments',
        { id, reason }
      );

      if (result.error) throw result.error;

      // Invalidate cache to trigger refetch
      invalidateQueryCache('appointments');

      toast.success('Appointment cancelled');
      logger.info('Appointment cancelled', { component: 'useAppointments', id });

      // Delete from calendar (non-blocking)
      supabase.functions.invoke('sync-calendar-event', {
        body: { appointment_id: id, action: 'delete' }
      }).catch(err => logger.warn('Calendar sync failed', { component: 'useAppointments', error: err }));
    } catch (error) {
      logger.error('Cancel appointment failed', error, { component: 'useAppointments', id });
      userJourney.trackError(error as Error, { action: 'cancelAppointment', id });
      handleError(error, 'Cancel Appointment');
      throw error;
    }
  }, []);

  const sendSMSNotification = useCallback(async (
    appointmentId: string,
    type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule'
  ) => {
    try {
      logger.debug('Sending SMS notification', { 
        component: 'useAppointments', 
        appointmentId, 
        type 
      });

      await supabase.functions.invoke('send-sms-notification', {
        body: {
          appointmentId,
          notificationType: type,
        },
      });

      logger.info('SMS notification sent', { 
        component: 'useAppointments', 
        appointmentId, 
        type 
      });
    } catch (error) {
      logger.warn('SMS notification failed', { component: 'useAppointments', error });
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
