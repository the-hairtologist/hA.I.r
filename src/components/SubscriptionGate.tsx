import { ReactNode, useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionGateProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
}

export const SubscriptionGate = ({ children, feature, fallback }: SubscriptionGateProps) => {
  const { isFeatureAllowed, loading, inTrial, subscribed } = useSubscription();
  const [subscribing, setSubscribing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isFeatureAllowed(feature)) {
    const handleSubscribe = async () => {
      setSubscribing(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Please sign in to subscribe");
          return;
        }

        const { data, error } = await supabase.functions.invoke("create-checkout", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        if (data?.url) {
          window.open(data.url, '_blank');
          toast.success("Redirecting to checkout...");
        }
      } catch (error: any) {
        console.error("Subscription error:", error);
        toast.error("Failed to start subscription process");
      } finally {
        setSubscribing(false);
      }
    };

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="max-w-md border-[3px] border-primary shadow-[6px_6px_0px_0px_hsl(var(--primary))]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-xl bg-primary/10 border-2 border-primary">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Premium Feature</CardTitle>
            <CardDescription>
              This feature requires an active Stylist Pro subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border-2 border-border bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">Stylist Pro - $15/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Start your 7-day free trial and unlock all professional features
              </p>
            </div>
            <Button 
              onClick={handleSubscribe} 
              disabled={subscribing}
              className="w-full"
              size="lg"
            >
              {subscribing ? "Starting trial..." : "Start 7-Day Free Trial"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Cancel anytime • No commitment required
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
