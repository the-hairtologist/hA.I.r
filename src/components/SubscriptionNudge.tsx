import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Users, TrendingUp, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { analytics } from '@/lib/analytics';
import type { NudgeTrigger } from '@/hooks/useSubscriptionNudges';
import { logger } from '@/lib/logging/productionLogger';

interface SubscriptionNudgeProps {
  trigger: NudgeTrigger;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
  stats?: {
    clientCount?: number;
    appointmentCount?: number;
    trialDaysRemaining?: number;
  };
}

const NUDGE_CONTENT = {
  trial_day_5: {
    icon: Sparkles,
    iconColor: 'text-primary',
    title: "You're halfway through your trial! 🎉",
    body: "You've already added {clientCount} clients and completed {appointmentCount} appointments. Unlock unlimited access to keep growing your business.",
    cta: 'Upgrade Now - Save 20%',
    ctaVariant: 'default' as const,
    badge: null,
    urgency: false,
  },
  trial_day_13: {
    icon: Clock,
    iconColor: 'text-warning',
    title: '⏰ Only {daysLeft} days left in your trial',
    body: "Don't lose access to your client profiles, formulas, and scheduling tools. Continue building your business seamlessly.",
    cta: 'Keep Growing - Subscribe Now',
    ctaVariant: 'default' as const,
    badge: 'LAST CHANCE',
    urgency: true,
  },
  client_limit: {
    icon: Users,
    iconColor: 'text-success',
    title: "You've hit your 10 client limit! 🎊",
    body: "Upgrade to Pro for unlimited clients, advanced scheduling, and AI-powered formulas. Don't turn away new business.",
    cta: 'Unlock Unlimited Clients',
    ctaVariant: 'default' as const,
    badge: 'UPGRADE NEEDED',
    urgency: true,
  },
  value_proven: {
    icon: TrendingUp,
    iconColor: 'text-success',
    title: "You're crushing it! 💪",
    body: "You've completed {appointmentCount} successful appointments—that's real value! Keep the momentum going with unlimited access.",
    cta: 'Subscribe & Save 20%',
    ctaVariant: 'default' as const,
    badge: 'SPECIAL OFFER',
    urgency: false,
  },
  appointments_limit: {
    icon: Clock,
    iconColor: 'text-warning',
    title: 'Appointment limit reached',
    body: "You've used all 10 free appointments this month. Upgrade to Pro for unlimited bookings and never miss an opportunity.",
    cta: 'Upgrade to Unlimited',
    ctaVariant: 'default' as const,
    badge: 'LIMIT REACHED',
    urgency: true,
  },
};

export const SubscriptionNudge = ({
  trigger,
  open,
  onOpenChange,
  onDismiss,
  stats = {},
}: SubscriptionNudgeProps) => {
  const [loading, setLoading] = useState(false);

  if (!trigger) return null;

  const content = NUDGE_CONTENT[trigger];
  if (!content) return null;

  const Icon = content.icon;

  // Replace placeholders in text
  const replaceStats = (text: string) => {
    return text
      .replace('{clientCount}', String(stats.clientCount || 0))
      .replace('{appointmentCount}', String(stats.appointmentCount || 0))
      .replace('{daysLeft}', String(stats.trialDaysRemaining || 0));
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to subscribe');
        return;
      }

      // Track conversion attempt
      analytics.subscriptionTrialStarted(trigger);

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
        window.location.href = data.url; // Full redirect for Stripe checkout
        toast.success('Redirecting to checkout...');
      }
    } catch (error: any) {
      logger.error('Subscription error', error, { component: 'SubscriptionNudge', trigger });
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    onDismiss();
    onOpenChange(false);
    analytics.track('subscription_nudge_dismissed', { trigger });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg brutal-border brutal-shadow-md">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>

        <DialogHeader>
          <div
            className={`mx-auto mb-4 p-4 rounded-xl brutal-border ${content.urgency ? 'bg-warning/10 border-warning' : 'bg-primary/10 border-primary'}`}
          >
            <Icon className={`h-12 w-12 ${content.iconColor}`} />
          </div>

          {content.badge && (
            <Badge
              variant={content.urgency ? 'destructive' : 'default'}
              className="mx-auto mb-2"
            >
              {content.badge}
            </Badge>
          )}

          <DialogTitle className="text-2xl font-bold text-center">
            {replaceStats(content.title)}
          </DialogTitle>

          <DialogDescription className="text-center text-base pt-2">
            {replaceStats(content.body)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Pricing Highlight */}
          <div className="brutal-border border-primary rounded-xl p-6 bg-gradient-to-br from-primary/5 to-secondary/5 brutal-shadow-xs">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                $29
                <span className="text-lg text-muted-foreground">/month</span>
              </div>
              <div className="text-sm text-success font-semibold mt-1">
                Save 20% on annual plan
              </div>
            </div>
          </div>

          {/* Quick Benefits */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-success" />
              </div>
              <span>Unlimited clients & appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-success" />
              </div>
              <span>AI formula generator & 24/7 assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-success" />
              </div>
              <span>SMS notifications & priority support</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              size="lg"
              variant={content.ctaVariant}
              className="w-full"
            >
              {loading ? 'Processing...' : content.cta}
            </Button>

            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Maybe later
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-center text-xs text-muted-foreground">
            ✨ Join 1,000+ stylists growing their business with Hair A.I.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
