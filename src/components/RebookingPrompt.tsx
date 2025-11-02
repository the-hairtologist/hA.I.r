import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles, X } from 'lucide-react';
import { format } from 'date-fns';

interface RebookingData {
  id: string;
  appointment_id: string;
  sent_at: string;
  rebooked: boolean;
  appointments: {
    appointment_date: string;
    service_type: string;
    stylist_profiles: {
      profiles: {
        full_name: string;
      };
    };
  };
}

export function RebookingPrompt() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState<RebookingData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchRebookingReminder = async () => {
      // Get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!clientProfile) return;

      // Check for pending rebooking reminders (not rebooked, sent within last 2 weeks)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const { data, error } = await supabase
        .from('rebooking_reminders')
        .select(
          `
          id,
          appointment_id,
          sent_at,
          rebooked,
          appointments!rebooking_reminders_appointment_id_fkey (
            appointment_date,
            service_type,
            stylist_profiles!appointments_stylist_id_fkey (
              profiles!stylist_profiles_user_id_fkey (
                full_name
              )
            )
          )
        `
        )
        .eq('client_id', clientProfile.id)
        .eq('rebooked', false)
        .gte('sent_at', twoWeeksAgo.toISOString())
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching rebooking reminder:', error);
      }

      if (data) {
        setReminder(data as any);
      }
    };

    fetchRebookingReminder();
  }, [user]);

  const handleBookNow = () => {
    navigate('/appointments');
  };

  const handleDismiss = async () => {
    setDismissed(true);
    // Could optionally mark as dismissed in the database
  };

  if (!reminder || dismissed) return null;

  const stylistName =
    reminder.appointments?.stylist_profiles?.profiles?.full_name ||
    'your stylist';
  const lastAppointmentDate = reminder.appointments?.appointment_date
    ? format(new Date(reminder.appointments.appointment_date), 'MMM d, yyyy')
    : '';

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 relative overflow-hidden">
      <div className="absolute top-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="rounded-full bg-primary/20 p-3">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            Time for a Touch-Up! ✨
          </h3>

          <p className="text-muted-foreground mb-4">
            It's been 6 weeks since your last appointment with{' '}
            <span className="font-semibold text-foreground">{stylistName}</span>{' '}
            on {lastAppointmentDate}. Ready to book your next session?
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleBookNow} className="gap-2">
              <Calendar className="h-4 w-4" />
              Book Appointment
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
