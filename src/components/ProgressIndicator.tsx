/**
 * Progress Indicator Component
 * Provides visual feedback for multi-step processes
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator = ({ steps, currentStep, className }: ProgressIndicatorProps) => {
  return (
    <nav 
      aria-label="Progress" 
      className={cn("w-full", className)}
    >
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <li key={step.id} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-full border-[3px] transition-all",
                    isCompleted && "bg-primary border-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--primary))]",
                    isCurrent && "bg-card border-primary text-primary scale-110 shadow-[4px_4px_0px_0px_hsl(var(--primary))] animate-pulse-glow",
                    isUpcoming && "bg-muted border-muted-foreground/30 text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <span className="font-display font-bold text-lg">
                      {stepNumber}
                    </span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      (isCompleted || isCurrent) && "text-foreground",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-6 left-1/2 h-[3px] w-full transition-all",
                    isCompleted && "bg-primary",
                    !isCompleted && "bg-muted"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Screen Reader Status */}
      <div className="sr-only" role="status" aria-live="polite">
        Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.label}
      </div>
    </nav>
  );
};
