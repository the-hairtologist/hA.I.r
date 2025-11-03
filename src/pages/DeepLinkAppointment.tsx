/**
 * Deep Link: Appointment View
 * Shareable appointment details page
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { Calendar, Clock, User, ArrowRight, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { shareDeepLink, generateDeepLink } from '@/lib/deepLinks';
import { enhancedAnalytics, ANALYTICS_EVENTS } from '@/lib/enhancedAnalytics';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function DeepLinkAppointment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadAppointment(id);
      enhancedAnalytics.track(ANALYTICS_EVENTS.APPOINTMENT_SHARED, {
        appointmentId: id,
      });
    }
  }, [id]);

  const loadAppointment = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          stylist:stylist_profiles!appointments_stylist_id_fkey(
            business_name,
            user:profiles(full_name)
          ),
          client:client_profiles!appointments_client_id_fkey(
            user:profiles(full_name)
          )
        `
        )
        .eq('id', appointmentId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Appointment not found');
        navigate('/');
        return;
      }

      setAppointment(data);
    } catch (error) {
      logger.error(
        'Error loading appointment',
        'DeepLinkAppointment',
        error as Error
      );
      toast.error('Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!appointment || !id) return;

    const link = generateDeepLink({ type: 'appointment', id });
    const stylistName = appointment.stylist?.user?.full_name || 'Stylist';
    const title = `Appointment with ${stylistName}`;
    const text = `View my appointment on hA.I.r`;

    const success = await shareDeepLink(link, title, text);

    if (success) {
      toast.success('Link copied to clipboard!');
      enhancedAnalytics.track('deep_link_shared', { type: 'appointment', id });
    }
  };

  const handleBookNow = () => {
    if (appointment?.stylist_id) {
      navigate(`/book-appointment?stylist=${appointment.stylist_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const stylistName = appointment.stylist?.user?.full_name || 'Stylist';
  const clientName = appointment.client?.user?.full_name || 'Client';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PageHeader title="Appointment Details" backTo="/appointments" />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="brutal-border brutal-shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              Appointment with {stylistName}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {appointment.stylist?.business_name}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Appointment details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">
                    {format(
                      new Date(appointment.appointment_date),
                      'EEEE, MMMM d, yyyy'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">
                    {format(new Date(appointment.appointment_date), 'h:mm a')}
                  </p>
                </div>
              </div>

              {appointment.service_type && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-semibold capitalize">
                      {appointment.service_type}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t">
              <Button onClick={handleBookNow} className="w-full" size="lg">
                Book Your Appointment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share This Appointment
              </Button>
            </div>

            {/* Social proof */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Powered by{' '}
                <span className="font-semibold text-primary">hA.I.r</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Professional salon management for modern stylists
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
