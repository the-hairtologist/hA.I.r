import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleCalendarConnect } from '@/components/integrations/GoogleCalendarConnect';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { toast } from 'sonner';

export default function IntegrationsCalendar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useCalendarSync();

  useEffect(() => {
    // Handle OAuth callback
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Calendar connection cancelled');
      navigate('/integrations/calendar', { replace: true });
      return;
    }

    if (code) {
      handleOAuthCallback(code).then(() => {
        // Clean up URL
        navigate('/integrations/calendar', { replace: true });
      });
    }
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="container max-w-4xl py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/integrations')}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Integrations
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your Google Calendar to automatically sync appointments
          </p>
        </div>

        <GoogleCalendarConnect />

        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">How it works</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">Connect your calendar</p>
                <p>Sign in with Google and grant calendar access</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">Automatic syncing</p>
                <p>New appointments are instantly added to your Google Calendar</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">Stay organized</p>
                <p>View all appointments in one place with calendar reminders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
