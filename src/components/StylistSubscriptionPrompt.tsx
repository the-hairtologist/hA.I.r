import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Users, Calendar, DollarSign, Scissors, MessageSquare, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StylistSubscriptionPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StylistSubscriptionPrompt = ({ open, onOpenChange }: StylistSubscriptionPromptProps) => {
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: Users,
      title: "Client Management",
      description: "Track unlimited clients with detailed profiles, allergies, and preferences"
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Manage your calendar with automated reminders and online booking"
    },
    {
      icon: Scissors,
      title: "AI Formula Generator",
      description: "Create custom color formulas with AI assistance and save to client history"
    },
    {
      icon: Sparkles,
      title: "AI Hair Assistant",
      description: "Get instant answers to color questions and technique guidance"
    },
    {
      icon: DollarSign,
      title: "Payment & Commission Tracking",
      description: "Monitor earnings, track commissions, and manage payments effortlessly"
    },
    {
      icon: MessageSquare,
      title: "Client Messaging",
      description: "Communicate with clients through secure in-app messaging"
    }
  ];

  const handleSubscribe = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 p-4 rounded-xl bg-primary/10 border-2 border-primary">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Unlock Your Stylist Pro Account
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Get full access to all professional tools with a 7-day free trial
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="border-[3px] border-primary rounded-xl p-6 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-[4px_4px_0px_0px_hsl(var(--primary))]">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-primary">$15<span className="text-lg text-muted-foreground">/month</span></div>
              <div className="text-sm text-muted-foreground mt-1">7-day free trial included</div>
            </div>
            <Button 
              onClick={handleSubscribe} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Starting trial..." : "Start 7-Day Free Trial"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
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
                  className="p-4 rounded-lg border-2 border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* What's Not Included */}
          <div className="border-2 border-muted rounded-lg p-4 bg-muted/20">
            <div className="flex items-start gap-2">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Free Account Limitations</h3>
                <p className="text-xs text-muted-foreground">
                  Without a subscription, you'll have access to basic features like viewing your profile and settings, 
                  but won't be able to manage clients, take appointments, or use AI tools.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>No Hidden Fees</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
