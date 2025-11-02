import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Sparkles, Calendar, ExternalLink } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const SubscriptionManagementCard = () => {
  const { subscribed, inTrial, subscriptionEnd, loading } = useSubscription();
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to manage subscription');
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        'customer-portal',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening subscription management...');
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setManagingSubscription(false);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to subscribe');
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        'create-checkout',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirecting to checkout...');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="brutal-border border-primary brutal-shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Subscription</CardTitle>
          </div>
          {subscribed && (
            <Badge variant={inTrial ? 'secondary' : 'default'}>
              {inTrial ? 'Free Trial' : 'Active'}
            </Badge>
          )}
          {!subscribed && <Badge variant="outline">Inactive</Badge>}
        </div>
        <CardDescription>
          {subscribed
            ? 'Manage your Stylist Pro subscription'
            : 'Unlock all professional features'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscribed ? (
          <>
            <div className="p-4 rounded-lg brutal-border bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">Stylist Pro</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {inTrial
                  ? "You're currently on a free trial with full access to all features"
                  : 'You have full access to all professional stylist features'}
              </p>
              {subscriptionEnd && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {inTrial ? 'Trial ends' : 'Renews'} on{' '}
                    {format(new Date(subscriptionEnd), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={handleManageSubscription}
              disabled={managingSubscription}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {managingSubscription ? 'Opening...' : 'Manage Subscription'}
            </Button>
          </>
        ) : (
          <>
            <div className="p-4 rounded-lg brutal-border border-primary/20 bg-primary/5">
              <div className="text-2xl font-bold text-primary mb-1">
                $15<span className="text-sm text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                7-day free trial • Full access to all features
              </p>
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full"
              size="lg"
            >
              {subscribing ? 'Starting trial...' : 'Start 7-Day Free Trial'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
