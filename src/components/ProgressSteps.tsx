import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressSteps = ({
  steps,
  currentStep,
  className,
}: ProgressStepsProps) => {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <li
              key={step.label}
              className={cn(
                'flex-1 relative',
                index !== steps.length - 1 && 'pr-8'
              )}
            >
              {/* Progress line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 left-8 right-0 h-1 transition-all duration-500',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step indicator */}
              <div className="relative flex flex-col items-center group">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full border-3 flex items-center justify-center font-bold transition-all duration-300 z-10',
                    isCompleted &&
                      'bg-primary border-primary text-primary-foreground scale-110',
                    isCurrent &&
                      'bg-primary border-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)] animate-pulse-glow scale-110',
                    isUpcoming &&
                      'bg-muted border-muted-foreground/30 text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      (isCompleted || isCurrent) && 'text-foreground',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
