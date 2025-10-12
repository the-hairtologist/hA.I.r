import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Sparkles, Users, Calendar, Target, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/platform/haptics";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  userRole: "stylist" | "client";
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: () => void;
  completed?: boolean;
}

export const OnboardingWizard = ({ open, onComplete, userRole }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const stylistSteps: Step[] = [
    {
      id: "welcome",
      title: "Welcome to hA.I.r! 🎉",
      description: "Let's get you set up in just 3 minutes. We'll help you track client formulas, celebrate milestones, and grow your business.",
      icon: Sparkles,
    },
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your business name, specialty, and location so clients can find you. This takes 30 seconds.",
      icon: Users,
      action: () => {
        // Navigate to settings
        window.location.href = "/settings";
      },
    },
    {
      id: "first-client",
      title: "Add Your First Client",
      description: "Import your favorite client to see how the Hair Memory Timeline works. You can add more later!",
      icon: Users,
      action: () => {
        window.location.href = "/clients";
      },
    },
    {
      id: "schedule",
      title: "Set Your Availability",
      description: "Let clients know when you're available for bookings. Update this anytime in Schedule Management.",
      icon: Calendar,
      action: () => {
        window.location.href = "/schedule-management";
      },
    },
    {
      id: "referral",
      title: "Earn Free Months! 💰",
      description: "Get your referral code and invite stylist friends. 3 referrals = 1 month free. 10 referrals = 3 months free!",
      icon: Target,
      action: () => {
        window.location.href = "/referrals";
      },
    },
  ];

  const clientSteps: Step[] = [
    {
      id: "welcome",
      title: "Welcome to Your Hair Journey! ✨",
      description: "You're joining a professional platform designed for stylists to manage their business and connect with clients!",
      icon: Sparkles,
    },
    {
      id: "first-appointment",
      title: "Book Your First Appointment",
      description: "Schedule your next visit and start building your Hair Memory Timeline!",
      icon: Calendar,
      action: () => {
        window.location.href = "/appointments";
      },
    },
    {
      id: "timeline",
      title: "Your Hair Story Begins",
      description: "After each appointment, you'll see your transformation history. Share your journey with friends!",
      icon: Target,
    },
  ];

  const steps = userRole === "stylist" ? stylistSteps : clientSteps;
  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const handleNext = async () => {
    haptic.tap();
    
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStepData.id));
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    haptic.tap();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    haptic.tap();
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Save onboarding completion
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('onboarding_completed_at', new Date().toISOString());

      toast.success("You're all set! 🎉", {
        description: "Explore your dashboard and start your journey!",
      });

      onComplete();
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const Icon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden brutal-border brutal-shadow-lg">
        {/* Progress Bar */}
        <div className="w-full bg-muted">
          <Progress value={progress} className="h-2 rounded-none" />
        </div>

        {/* Content */}
        <div className="p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center brutal-border brutal-shadow-sm">
              <Icon className="h-10 w-10 text-on-surface-primary" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold gradient-text">
                {currentStepData.title}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {currentStepData.description}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx <= currentStep
                      ? "bg-primary scale-125"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Action Preview */}
            {currentStepData.action && currentStep > 0 && (
              <Card className="w-full brutal-border border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-sm font-semibold">Quick Action</p>
                      <p className="text-xs text-muted-foreground">
                        Click "Take Me There" to complete this step
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        currentStepData.action?.();
                        handleSkip();
                      }}
                      className="gap-1 brutal-shadow-xs"
                    >
                      Take Me There
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 bg-muted/50 brutal-border-t">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>
            <Button
              onClick={handleNext}
              className="gap-1 brutal-shadow-sm brutal-hover"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Get Started
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
