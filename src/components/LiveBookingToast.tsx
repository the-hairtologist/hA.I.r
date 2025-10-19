/**
 * Live Booking Toast - Real-time appointment notifications
 * Shows instant toast when new bookings are created
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface LiveBookingToastProps {
  stylistId: string;
  onNewBooking?: (appointment: any) => void;
}

export const LiveBookingToast: React.FC<LiveBookingToastProps> = ({ stylistId, onNewBooking }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!stylistId) return;

    console.log('[LiveBooking] Setting up realtime listener for stylist:', stylistId);

    const channel = supabase
      .channel(`appointments-${stylistId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `stylist_id=eq.${stylistId}`,
        },
        async (payload) => {
          console.log('[LiveBooking] New appointment detected:', payload);

          // Fetch full appointment details with client info
          const { data: appointment } = await supabase
            .from('appointments')
            .select(`
              *,
              client:client_profiles(
                id,
                full_name,
                email,
                phone
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (appointment) {
            const clientName = appointment.client?.full_name || 'A client';
            const appointmentTime = format(
              new Date(appointment.appointment_date),
              'MMM d @ h:mm a'
            );

            toast.success(`🎉 New Booking from ${clientName}!`, {
              description: `${appointment.service_type} • ${appointmentTime}`,
              duration: 5000,
              icon: <Calendar className="h-5 w-5" />,
              action: {
                label: 'View',
                onClick: () => {
                  navigate('/appointments');
                },
              },
            });

            // Optional callback
            onNewBooking?.(appointment);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `stylist_id=eq.${stylistId}`,
        },
        async (payload) => {
          // Check if status changed
          if (payload.old.status !== payload.new.status) {
            console.log('[LiveBooking] Appointment status changed:', payload);

            const { data: appointment } = await supabase
              .from('appointments')
              .select(`
                *,
                client:client_profiles(full_name)
              `)
              .eq('id', payload.new.id)
              .single();

            if (appointment) {
              const clientName = appointment.client?.full_name || 'Client';
              const statusEmoji = payload.new.status === 'confirmed' ? '✅' : 
                                 payload.new.status === 'cancelled' ? '❌' : '📅';

              toast.info(`${statusEmoji} ${clientName}'s appointment ${payload.new.status}`, {
                duration: 4000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[LiveBooking] Channel status:', status);
      });

    return () => {
      console.log('[LiveBooking] Cleaning up realtime listener');
      supabase.removeChannel(channel);
    };
  }, [stylistId, onNewBooking, navigate]);

  return null; // This is a headless component
};
