import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Loader2, Mail, Calendar, CreditCard } from 'lucide-react';
import { logger } from '@/lib/logging/productionLogger';

export function IntegrationTester() {
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, boolean | null>>({
    email: null,
    calendar: null,
    stripe: null,
  });

  const testIntegration = async (type: 'email' | 'calendar' | 'stripe') => {
    setTesting(type);
    try {
      switch (type) {
        case 'email':
          // Check email configuration health
          try {
            const { error } = await supabase.functions.invoke('send-appointment-confirmation', {
              body: { healthCheck: true },
            });

            if (error) {
              logger.error('Email test failed during health check', error, {
                context: 'IntegrationTester',
              });
              setResults(prev => ({ ...prev, email: false }));
              toast.error('Email function not accessible. Check if RESEND_API_KEY is configured.');
            } else {
              setResults(prev => ({ ...prev, email: true }));
              toast.success('Email integration is configured correctly!');
            }
          } catch (err) {
            logger.error('Email test threw an exception', err, {
              context: 'IntegrationTester',
            });
            setResults(prev => ({ ...prev, email: false }));
            toast.error('Email function failed. Verify edge function deployment.');
          }
          break;

        case 'calendar': {
          // Test calendar connection
          const { data: connection, error: calError } = await supabase
            .from('calendar_connections')
            .select('*')
            .eq('is_active', true)
            .maybeSingle();
          
          if (calError) {
            logger.error('Calendar test failed to query connections', calError, {
              context: 'IntegrationTester',
            });
            setResults(prev => ({ ...prev, calendar: false }));
            toast.error('Calendar connection check failed.');
          } else if (connection) {
            setResults(prev => ({ ...prev, calendar: true }));
            toast.success('Calendar is connected.');
          } else {
            setResults(prev => ({ ...prev, calendar: false }));
            toast.warning('No calendar connected. Connect Google Calendar first.');
          }
          break;
        }

        case 'stripe':
          // Check Stripe configuration (webhooks can only be tested by actual Stripe events)
          try {
            // We can't directly invoke the webhook, but we can check if it's reachable
            const { error } = await supabase.functions.invoke('stripe-webhook', {
              body: { healthCheck: true },
            });

            if (error) {
              logger.error('Stripe test failed during webhook invocation', error, {
                context: 'IntegrationTester',
              });
              setResults(prev => ({ ...prev, stripe: false }));
              toast.error('Stripe webhook not accessible. Check STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET configuration.');
            } else {
              setResults(prev => ({ ...prev, stripe: true }));
              toast.success('Stripe webhook endpoint is reachable. Test with a real Stripe event.');
            }
          } catch (err) {
            logger.error('Stripe test threw an exception', err, {
              context: 'IntegrationTester',
            });
            setResults(prev => ({ ...prev, stripe: false }));
            toast.error('Stripe webhook failed. Verify edge function deployment.');
          }
          break;
      }
    } catch (error) {
      logger.error('Integration tester encountered an unexpected error', error, {
        context: 'IntegrationTester',
        type,
      });
      setResults(prev => ({ ...prev, [type]: false }));
      toast.error(`${type} test failed - unexpected error.`);
    } finally {
      setTesting(null);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return null;
    return status ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Status</CardTitle>
        <CardDescription>
          Test your integrations to ensure everything is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Test */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Resend integration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(results.email)}
            <Button
              size="sm"
              variant="outline"
              onClick={() => testIntegration('email')}
              disabled={testing === 'email'}
            >
              {testing === 'email' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test'
              )}
            </Button>
          </div>
        </div>

        {/* Calendar Test */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Calendar Sync</p>
              <p className="text-sm text-muted-foreground">Google Calendar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(results.calendar)}
            <Button
              size="sm"
              variant="outline"
              onClick={() => testIntegration('calendar')}
              disabled={testing === 'calendar'}
            >
              {testing === 'calendar' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test'
              )}
            </Button>
          </div>
        </div>

        {/* Stripe Test */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Payment Processing</p>
              <p className="text-sm text-muted-foreground">Stripe webhook</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(results.stripe)}
            <Button
              size="sm"
              variant="outline"
              onClick={() => testIntegration('stripe')}
              disabled={testing === 'stripe'}
            >
              {testing === 'stripe' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test'
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Testing Notes:</strong>
            <br />
            - <strong>Email:</strong> Checks if function exists and RESEND_API_KEY is configured
            <br />
            - <strong>Calendar:</strong> Verifies if Google Calendar is connected
            <br />
            - <strong>Stripe:</strong> Checks webhook endpoint (real testing requires actual Stripe events)
            <br />
            <br />
            <strong>Full Integration Test:</strong>
            <br />
            Create a real appointment to test email delivery and calendar sync together
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
