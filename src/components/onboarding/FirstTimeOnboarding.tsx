/**
 * First-Time User Onboarding
 * Guides new stylists through essential setup steps
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Scissors, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  completed?: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "schedule",
    title: "Set Your Working Hours",
    description: "Let clients know when you're available for appointments",
    icon: Calendar,
    route: "/schedule",
  },
  {
    id: "services",
    title: "Add Your Services",
    description: "Define what services you offer and your pricing",
    icon: Scissors,
    route: "/services",
  },
  {
    id: "clients",
    title: "Invite Your First Client",
    description: "Start building your clientele and managing appointments",
    icon: Users,
    route: "/clients",
  },
];

export function FirstTimeOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Public routes where onboarding should NOT show
    const publicRoutes = ["/", "/auth", "/install", "/privacy", "/terms"];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    // Only show onboarding for authenticated users on protected routes
    if (!user || isPublicRoute) {
      return;
    }

    // Check if user has already completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    const isFirstVisit = !localStorage.getItem("has_visited");

    if (!hasCompletedOnboarding && isFirstVisit) {
      // Delay opening to let the app fully load
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem("has_visited", "true");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, location.pathname]);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    // Mark current step as started
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStepData.id);
    setCompletedSteps(newCompleted);

    // Navigate to the step's route
    navigate(currentStepData.route);
    setOpen(false);

    // If not the last step, show next step after navigation
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setOpen(true);
      }, 3000); // Give user time to complete the action
    } else {
      // Mark onboarding as completed
      localStorage.setItem("onboarding_completed", "true");
    }
  };

  const handleSkip = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("onboarding_completed", "true");
      setOpen(false);
    }
  };

  const handleSkipAll = () => {
    localStorage.setItem("onboarding_completed", "true");
    setOpen(false);
  };

  if (!currentStepData) return null;

  const Icon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-xl">Welcome to Hair A.I.! 🎉</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkipAll}>
              Skip Tour
            </Button>
          </div>
          <DialogDescription>
            Let's get you set up in 3 quick steps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Overview */}
          <div className="space-y-2">
            {ONBOARDING_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStep;
              const isPast = index < currentStep;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                    isCurrent && "border-primary bg-primary/5",
                    !isCurrent && "border-muted opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      isCurrent && "bg-primary text-primary-foreground",
                      isCompleted && "bg-green-500 text-white",
                      !isCurrent && !isCompleted && "bg-muted"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{step.title}</p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Step Details */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <Icon className="h-10 w-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{currentStepData.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentStepData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip This Step
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 gap-2"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? "Complete Setup" : "Let's Do It"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground">
            Don't worry, you can always change these settings later
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
