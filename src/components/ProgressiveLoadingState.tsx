import { useEffect, useState } from 'react';
import { Scissors } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressiveLoadingStateProps {
  message?: string;
  estimatedDuration?: number;
  onComplete?: () => void;
  className?: string;
}

export const ProgressiveLoadingState = ({
  message = 'Getting everything ready...',
  estimatedDuration = 3000,
  onComplete,
  className,
}: ProgressiveLoadingStateProps) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  const progressMessages = [
    { threshold: 0, message },
    { threshold: 30, message: 'Almost there...' },
    { threshold: 60, message: 'Just a moment...' },
    { threshold: 90, message: 'Finishing up...' },
  ];

  useEffect(() => {
    const interval = 50;
    const increment = (100 * interval) / estimatedDuration;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + increment, 100);

        // Update message based on progress
        const currentThreshold = progressMessages
          .reverse()
          .find(pm => next >= pm.threshold);

        if (currentThreshold) {
          setCurrentMessage(currentThreshold.message);
        }

        if (next >= 100) {
          clearInterval(timer);
          onComplete?.();
        }

        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [estimatedDuration, onComplete, message]);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 space-y-4',
        className
      )}
    >
      <div className="relative">
        <Scissors
          className="h-12 w-12 text-primary animate-pulse"
          aria-hidden="true"
        />
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>

      <div className="w-full max-w-xs space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-center text-muted-foreground font-medium">
          {currentMessage}
        </p>
      </div>

      <span className="sr-only">{currentMessage}</span>
    </div>
  );
};
