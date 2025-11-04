/**
 * Next Appointment Banner
 * Shows time until next appointment in sidebar header
 */

import { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, isPast, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';

interface Appointment {
  id: string;
  appointment_date: string;
  service_type: string;
  client_name?: string;
  location?: string;
}

export function NextAppointmentBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(
    null
  );
  const [timeUntil, setTimeUntil] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNextAppointment();

      // Update time every minute
      const interval = setInterval(() => {
        if (nextAppointment) {
          updateTimeUntil(nextAppointment.appointment_date);
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNextAppointment = async () => {
    if (!user?.id) return;
    
    try {
      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile) {
        setLoading(false);
        return;
      }

      // Get next upcoming appointment
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          appointment_date,
          service_type,
          client_profiles!appointments_client_id_fkey(full_name)
        `
        )
        .eq('stylist_id', stylistProfile.id)
        .eq('status', 'scheduled')
        .gte('appointment_date', now)
        .order('appointment_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const appointment: Appointment = {
          id: data.id,
          appointment_date: data.appointment_date,
          service_type: data.service_type,
          client_name: (data.client_profiles as any)?.full_name,
        };

        setNextAppointment(appointment);
        updateTimeUntil(appointment.appointment_date);
      }
    } catch (error) {
      console.error('Error loading next appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeUntil = (date: string) => {
    const appointmentDate = new Date(date);
    const now = new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) {
      setTimeUntil('in progress');
    } else if (diffMins < 60) {
      setTimeUntil(`in ${diffMins}m`);
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      setTimeUntil(`in ${hours}h`);
    } else {
      setTimeUntil(formatDistanceToNow(appointmentDate, { addSuffix: true }));
    }
  };

  if (loading || !nextAppointment) return null;

  const appointmentDate = new Date(nextAppointment.appointment_date);
  const isUrgent = appointmentDate.getTime() - Date.now() < 3600000; // Less than 1 hour

  return (
    <Button
      variant="ghost"
      onClick={() => navigate('/appointments')}
      className={cn(
        'w-full justify-start px-3 py-2 h-auto hover:bg-muted/80 transition-colors',
        isUrgent && 'bg-amber-500/10 hover:bg-amber-500/20'
      )}
    >
      <div className="flex items-center gap-2 w-full min-w-0">
        <Clock
          className={cn(
            'h-4 w-4 flex-shrink-0',
            isUrgent ? 'text-amber-500 animate-pulse' : 'text-primary'
          )}
        />
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium truncate">
              {nextAppointment.client_name || 'Client'}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {timeUntil}
            </span>
          </div>
          <div className={cn(mobileFirst.text.xs, "text-muted-foreground truncate")}>
            {format(appointmentDate, 'h:mm a')} • {nextAppointment.service_type}
          </div>
        </div>
      </div>
    </Button>
  );
}
