import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Check,
  Sparkles,
  Users,
  Calendar,
  DollarSign,
  Scissors,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/productionLogger';

interface StylistSubscriptionPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StylistSubscriptionPrompt = ({
  open,
  onOpenChange,
}: StylistSubscriptionPromptProps) => {
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'Effortless Client Profiles',
      description:
        'Store unlimited client histories—allergies, preferences, past formulas—all organized so you never miss a detail',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description:
        'Automated bookings and reminders that prevent double-booking. Your calendar works for you—not the other way around',
    },
    {
      icon: Scissors,
      title: 'AI Formula Generator',
      description:
        'Generate professional color formulas in seconds with precise measurements and step-by-step instructions—saved automatically to each client',
    },
    {
      icon: Sparkles,
      title: '24/7 AI Expert',
      description:
        'Instant answers to color theory, technique troubleshooting, and product advice—like having a master colorist on speed dial',
    },
    {
      icon: DollarSign,
      title: 'Revenue Tracking That Works',
      description:
        'See every payment and commission at a glance. No more spreadsheets, no more guesswork—just clear insights into your earnings',
    },
    {
      icon: MessageSquare,
      title: 'Client Communication Hub',
      description:
        'Keep every conversation, consultation video, and formula in one secure place—build trust and loyalty effortlessly',
    },
  ];

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
      logger.error('Subscription error', error, {
        component: 'StylistSubscriptionPrompt',
      });
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 p-4 rounded-xl bg-primary/10 brutal-border border-primary">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Ready to Transform Your Business?
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            Join thousands of stylists maximizing their income with AI-powered
            tools. Start your 7-day free trial today
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="brutal-border border-primary rounded-xl p-6 bg-gradient-to-br from-primary/5 to-secondary/5 brutal-shadow-xs">
            <div className="text-center mb-4">
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                $15
                <span className="text-base sm:text-lg text-muted-foreground">
                  /month
                </span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                7-day free trial included
              </div>
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Starting trial...' : 'Start 7-Day Free Trial'}
            </Button>
            <p className="text-[11px] sm:text-xs text-center text-muted-foreground mt-2">
              Cancel anytime during trial • No commitment required
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg brutal-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* What's Not Included */}
          <div className="brutal-border border-muted rounded-lg p-4 bg-muted/20">
            <div className="flex items-start gap-2">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm mb-1">
                  What You're Missing Without Pro
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  Free accounts can't manage clients, book appointments,
                  generate AI formulas, or track revenue. Upgrade now to unlock
                  your full earning potential.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-success" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-success" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-success" />
              <span>No Hidden Fees</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
