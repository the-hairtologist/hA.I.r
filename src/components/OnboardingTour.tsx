import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar, Users, Sparkles, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OnboardingTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: "stylist" | "client";
}

export const OnboardingTour = ({ open, onOpenChange, userRole }: OnboardingTourProps) => {
  const [step, setStep] = useState(0);

  const stylistSteps = [
    {
      title: "Welcome to hA.I.r! 🎉",
      description: "Your all-in-one platform for managing your hair styling business. Let's take a quick tour!",
      icon: Sparkles,
    },
    {
      title: "Manage Your Clients 👥",
      description: "Keep track of all your clients, their preferences, allergies, and hair history in one place.",
      icon: Users,
    },
    {
      title: "Book & Schedule 📅",
      description: "Set your availability, accept bookings, and manage your calendar with ease.",
      icon: Calendar,
    },
    {
      title: "Track Everything 💰",
      description: "Monitor payments, commissions, and grow your business with AI-powered tools.",
      icon: CheckCircle,
    },
  ];

  const clientSteps = [
    {
      title: "Welcome to hA.I.r! 🎉",
      description: "Find amazing stylists and book appointments hassle-free. Let's show you around!",
      icon: Sparkles,
    },
    {
      title: "Discover Stylists 💇",
      description: "Browse local stylists, view their portfolios, and read reviews from real clients.",
      icon: Users,
    },
    {
      title: "Book Instantly 📅",
      description: "Choose your preferred date and time, book securely, and receive instant confirmation.",
      icon: Calendar,
    },
    {
      title: "You're All Set! ✨",
      description: "Your profile is ready! Start exploring and book your first appointment.",
      icon: CheckCircle,
    },
  ];

  const steps = userRole === "stylist" ? stylistSteps : clientSteps;
  const progress = ((step + 1) / steps.length) * 100;
  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboarding_complete', 'true');
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_complete', 'true');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md brutal-border brutal-shadow-lg">
        <DialogHeader>
          <div className="mx-auto mb-4 p-4 rounded-xl bg-primary/10 brutal-border border-primary">
            <Icon className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {currentStep.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between items-center gap-3">
            {step > 0 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip Tour
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {step === steps.length - 1 ? "Get Started" : "Next"}
              {step < steps.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};