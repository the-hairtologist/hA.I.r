/**
 * Next Appointment Widget
 * Shows the next upcoming appointment for clients
 * OPTIMIZED: Uses EnhancedAuth context to avoid duplicate queries
 */

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Appointment {
  id: string;
  appointment_date: string;
  service_type: string;
  stylist_id: string;
  stylist_name?: string;
  notes?: string;
}

export function NextAppointmentWidget() {
  const navigate = useNavigate();
  const { clientProfile } = useEnhancedAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientProfile?.id) {
      fetchNextAppointment();
    }
  }, [clientProfile?.id]);

  const fetchNextAppointment = async () => {
    if (!clientProfile?.id) return;

    try {
      const now = new Date().toISOString();

      // Fetch next appointment - NO DUPLICATE QUERY
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          appointment_date,
          service_type,
          stylist_id,
          notes,
          stylist_profiles!inner(user:profiles(full_name))
        `
        )
        .eq('client_id', clientProfile.id)
        .gte('appointment_date', now)
        .eq('status', 'scheduled')
        .order('appointment_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAppointment({
          ...data,
          notes: data.notes ?? undefined,
          stylist_name:
            (data.stylist_profiles as any)?.user?.full_name || 'Your Stylist',
        });
      }
    } catch (error) {
      console.error('Error fetching next appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !appointment) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-5 w-5" />
            No Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Ready to book your next appointment?
          </p>
          <Button
            onClick={() => navigate('/book-appointment')}
            className="w-full"
            size="lg"
          >
            Book Appointment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const aptDate = new Date(appointment.appointment_date);
  const timeUntil = formatDistanceToNow(aptDate, { addSuffix: true });

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Next Appointment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {format(aptDate, "EEEE, MMMM d 'at' h:mm a")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span>{timeUntil}</span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.stylist_name}</span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="font-medium text-primary">
              {appointment.service_type}
            </span>
          </div>

          {appointment.notes && (
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs sm:text-sm">
              <p className="text-muted-foreground">{appointment.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/appointments')}
            variant="outline"
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            onClick={() => navigate('/messages')}
            variant="default"
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message Stylist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
