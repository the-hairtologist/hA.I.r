/**
 * Enhanced Appointments Hook with Retry, Caching, and Offline Support
 * Replaces useAppointments with better performance and reliability
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedQuery, invalidateQueryCache } from '@/lib';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { offlineQueue } from '@/lib';

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

interface UseEnhancedAppointmentsOptions {
  stylistId?: string;
  clientId?: string;
  status?: string;
  enabled?: boolean;
}

export function useEnhancedAppointments(
  options: UseEnhancedAppointmentsOptions = {}
) {
  const { stylistId, clientId, status, enabled = true } = options;

  const queryKey = ['appointments', { stylistId, clientId, status }];

  // Use enhanced query with retry, caching, and offline support
  const {
    data: appointments = [],
    isLoading,
    error,
    refetch,
  } = useEnhancedQuery<Appointment[]>({
    queryKey,
    queryFn: async () => {
      logger.debug('Fetching appointments', 'useEnhancedAppointments', {
        stylistId,
        clientId,
        status,
      });

      let query = supabase
        .from('appointments')
        .select(
          `
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
        `
        )
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

      logger.info(
        'Appointments loaded successfully',
        'useEnhancedAppointments',
        { count: data?.length }
      );
      return (data as Appointment[]) || [];
    },
    cacheTable: 'appointments',
    cacheParams: { stylistId, clientId, status },
    retryOptions: {
      maxRetries: 3,
      baseDelay: 1000,
    },
    offlineSupport: true,
    enabled: enabled && (!!stylistId || !!clientId),
  });

  // Mutation functions with offline support
  const createAppointment = useCallback(
    async (data: Partial<Appointment>): Promise<Appointment> => {
      try {
        logger.debug('Creating appointment', 'useEnhancedAppointments', data);

        const operation = async () => {
          const { data: newAppointment, error } = await supabase
            .from('appointments')
            .insert(data as any)
            .select()
            .maybeSingle();

          if (error) throw error;
          return newAppointment;
        };

        // Try to create, if offline, queue it
        try {
          const newAppointment = await operation();
          if (!newAppointment) {
            throw new Error('Failed to create appointment');
          }
          toast.success('Appointment created successfully');
          logger.info('Appointment created', 'useEnhancedAppointments', {
            id: newAppointment.id,
          });
          invalidateQueryCache('appointments');
          return newAppointment as Appointment;
        } catch (error: any) {
          if (!navigator.onLine) {
            offlineQueue.enqueue(operation);
            toast.info('Appointment saved offline. Will sync when online.');
            throw new Error('Offline - queued for later');
          }
          throw error;
        }
      } catch (error) {
        handleError(error, 'Create Appointment');
        throw error;
      }
    },
    []
  );

  const updateAppointment = useCallback(
    async (id: string, data: Partial<Appointment>) => {
      try {
        logger.debug('Updating appointment', 'useEnhancedAppointments', {
          id,
          data,
        });

        const operation = async () => {
          const { error } = await supabase
            .from('appointments')
            .update(data)
            .eq('id', id);

          if (error) throw error;
        };

        try {
          await operation();
          toast.success('Appointment updated successfully');
          logger.info('Appointment updated', 'useEnhancedAppointments', { id });
          invalidateQueryCache('appointments');
        } catch (error: any) {
          if (!navigator.onLine) {
            offlineQueue.enqueue(operation);
            toast.info('Update saved offline. Will sync when online.');
          } else {
            throw error;
          }
        }
      } catch (error) {
        handleError(error, 'Update Appointment');
        throw error;
      }
    },
    []
  );

  const cancelAppointment = useCallback(
    async (id: string, reason?: string) => {
      try {
        logger.debug('Cancelling appointment', 'useEnhancedAppointments', {
          id,
          reason,
        });

        const updateData = {
          status: 'cancelled',
          ...(reason && { cancellation_reason: reason }),
        };

        await updateAppointment(id, updateData);
        toast.success('Appointment cancelled');
        logger.info('Appointment cancelled', 'useEnhancedAppointments', { id });
      } catch (error) {
        handleError(error, 'Cancel Appointment');
        throw error;
      }
    },
    [updateAppointment]
  );

  const sendSMSNotification = useCallback(
    async (
      appointmentId: string,
      type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule'
    ) => {
      try {
        logger.debug('Sending SMS notification', 'useEnhancedAppointments', {
          appointmentId,
          type,
        });

        await supabase.functions.invoke('send-sms-notification', {
          body: {
            appointmentId,
            notificationType: type,
          },
        });

        logger.info('SMS notification sent', 'useEnhancedAppointments', {
          appointmentId,
          type,
        });
      } catch (error) {
        logger.warn(
          'SMS notification failed',
          'useEnhancedAppointments',
          error as any
        );
        // Don't throw - SMS failures shouldn't block the operation
      }
    },
    []
  );

  return {
    appointments,
    loading: isLoading,
    error: error as Error | null,
    refetch,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    sendSMSNotification,
  };
}
