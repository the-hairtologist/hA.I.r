import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Loader2, Mail, Calendar, CreditCard } from 'lucide-react';

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
          // Test Resend webhook by checking if edge function exists
          const { error: emailError } = await supabase.functions.invoke('send-appointment-confirmation', {
            body: { test: true }
          });
          setResults(prev => ({ ...prev, email: !emailError }));
          if (!emailError) {
            toast.success('✅ Email integration is working!');
          } else {
            toast.error('❌ Email integration failed');
          }
          break;

        case 'calendar':
          // Test calendar connection
          const { data: connection } = await supabase
            .from('calendar_connections')
            .select('*')
            .eq('is_active', true)
            .maybeSingle();
          
          setResults(prev => ({ ...prev, calendar: !!connection }));
          if (connection) {
            toast.success('✅ Calendar is connected!');
          } else {
            toast.warning('⚠️ Calendar not connected - connect it first');
          }
          break;

        case 'stripe':
          // Test Stripe webhook by checking recent logs
          const { error: stripeError } = await supabase.functions.invoke('stripe-webhook', {
            body: { test: true }
          });
          setResults(prev => ({ ...prev, stripe: !stripeError }));
          if (!stripeError) {
            toast.success('✅ Stripe webhook is configured!');
          } else {
            toast.error('❌ Stripe webhook failed');
          }
          break;
      }
    } catch (error) {
      console.error(`Error testing ${type}:`, error);
      setResults(prev => ({ ...prev, [type]: false }));
      toast.error(`❌ ${type} test failed`);
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
            <strong>Next steps:</strong>
            <br />
            1. Test each integration above
            <br />
            2. Create a test appointment to verify email + calendar sync
            <br />
            3. Complete a test Stripe checkout to verify payment webhook
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
