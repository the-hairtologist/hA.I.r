import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const QRCheckIn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) {
      setError('Invalid QR code');
      setLoading(false);
      return;
    }
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:client_profiles(
            user:profiles(full_name)
          ),
          stylist:stylist_profiles(
            business_name
          )
        `)
        .eq('id', appointmentId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError('Appointment not found');
        return;
      }

      setAppointment(data);
    } catch (err: any) {
      console.error('Error loading appointment:', err);
      setError('Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success('Checked in successfully!');
      setTimeout(() => navigate('/appointments'), 2000);
    } catch (err: any) {
      console.error('Error checking in:', err);
      toast.error('Failed to check in');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/appointments')} className="w-full">
              Go to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.appointment_date);
  const isToday = appointmentDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            Check-In
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-semibold">{appointment.client?.user?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stylist</p>
            <p className="font-semibold">{appointment.stylist?.business_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Service</p>
            <p className="font-semibold">{appointment.service_type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date & Time</p>
            <p className="font-semibold">
              {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          {isToday && appointment.status === 'scheduled' && (
            <Button onClick={handleCheckIn} className="w-full" size="lg">
              Check In Now
            </Button>
          )}
          
          {!isToday && (
            <p className="text-sm text-muted-foreground text-center">
              This appointment is not scheduled for today
            </p>
          )}
          
          {appointment.status !== 'scheduled' && (
            <p className="text-sm text-muted-foreground text-center">
              Status: {appointment.status}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
