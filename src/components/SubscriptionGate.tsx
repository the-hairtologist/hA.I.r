import { ReactNode, useEffect, useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, Key } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AccessCodeDialog } from './AccessCodeDialog';
import { AppleIAPSubscription } from './AppleIAPSubscription';
import { logger } from '@/lib/logging/productionLogger';

interface SubscriptionGateProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
}

export const SubscriptionGate = ({
  children,
  feature,
  fallback,
}: SubscriptionGateProps) => {
  const {
    isFeatureAllowed,
    loading,
    inTrial,
    subscribed,
    hasAccessCode,
    checkSubscription,
    isAppleIAP,
  } = useSubscription();
  const [subscribing, setSubscribing] = useState(false);
  const [showAccessCodeDialog, setShowAccessCodeDialog] = useState(false);
  const [showIAPPlans, setShowIAPPlans] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[min(60vh,400px)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isFeatureAllowed(feature)) {
    const handleSubscribe = async () => {
      // On iOS, show Apple IAP options
      if (isAppleIAP) {
        setShowIAPPlans(true);
        return;
      }

      // On web/Android, use Stripe
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
        logger.error('Subscription error', error, { component: 'SubscriptionGate', feature });
        toast.error('Failed to start subscription process');
      } finally {
        setSubscribing(false);
      }
    };

    const handleAccessCodeSuccess = async () => {
      // Refresh the subscription context
      await checkSubscription();
    };

    if (fallback) {
      return <>{fallback}</>;
    }

    // Show Apple IAP subscription page if on iOS and user clicked subscribe
    if (isAppleIAP && showIAPPlans) {
      return (
        <div className="container mx-auto p-6 max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowIAPPlans(false)}
            className="mb-4"
          >
            ← Back
          </Button>
          <AppleIAPSubscription />
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-center min-h-[min(60vh,400px)] p-6">
          <Card className="max-w-md brutal-border border-primary brutal-shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-xl bg-primary/10 brutal-border border-primary">
                <Lock className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Premium Feature</CardTitle>
              <CardDescription>
                This feature requires an active Stylist Pro subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg brutal-border bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Stylist Pro - $15/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Start your 7-day free trial and unlock all professional
                  features
                </p>
              </div>
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="w-full"
                size="lg"
              >
                {subscribing
                  ? 'Starting trial...'
                  : isAppleIAP
                    ? 'View Subscription Plans'
                    : 'Start 7-Day Free Trial'}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAccessCodeDialog(true)}
                className="w-full"
              >
                <Key className="mr-2 h-4 w-4" />
                Have an Access Code?
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime • No commitment required
              </p>
            </CardContent>
          </Card>
        </div>
        <AccessCodeDialog
          open={showAccessCodeDialog}
          onOpenChange={setShowAccessCodeDialog}
          onSuccess={handleAccessCodeSuccess}
        />
      </>
    );
  }

  return <>{children}</>;
};
