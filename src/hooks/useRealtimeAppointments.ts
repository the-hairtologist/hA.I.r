import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logging/productionLogger';
import { trackSelect } from '@/lib/logging/supabaseTracker';

interface Appointment {
  id: string;
  appointment_date: string;
  service_type: string;
  status: string;
  client_id: string;
  stylist_id: string;
  notes?: string;
  duration_minutes?: number;
}

export const useRealtimeAppointments = (
  userId?: string,
  role?: 'client' | 'stylist'
) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    const fetchAppointments = async () => {
      try {
        await trackSelect(
          async () => {
            let query = supabase
              .from('appointments')
              .select('*')
              .order('appointment_date', { ascending: true });

            if (role === 'client') {
              const { data: clientProfile } = await supabase
                .from('client_profiles')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

              if (clientProfile) {
                query = query.eq('client_id', clientProfile.id);
              }
            } else if (role === 'stylist') {
              const { data: stylistProfile } = await supabase
                .from('stylist_profiles')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

              if (stylistProfile) {
                query = query.eq('stylist_id', stylistProfile.id);
              }
            }

            const { data, error } = await query;

            if (error) throw error;
            setAppointments(data || []);
            return { data, error };
          },
          'appointments',
          'useRealtimeAppointments',
          { userId, role }
        );
      } catch (error) {
        logger.error('Error fetching appointments', error, {
          component: 'useRealtimeAppointments',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();

    // Set up realtime subscription
    const realtimeChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        payload => {
          logger.debug('Appointment change received', {
            component: 'useRealtimeAppointments',
            eventType: payload.eventType,
            id: (payload.new as any)?.id || (payload.old as any)?.id,
          });

          if (payload.eventType === 'INSERT') {
            setAppointments(prev => {
              const exists = prev.find(a => a.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new as Appointment].sort(
                (a, b) =>
                  new Date(a.appointment_date).getTime() -
                  new Date(b.appointment_date).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev =>
              prev.map(appointment =>
                appointment.id === payload.new.id
                  ? (payload.new as Appointment)
                  : appointment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev =>
              prev.filter(appointment => appointment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [userId, role]);

  return { appointments, isLoading, channel };
};
