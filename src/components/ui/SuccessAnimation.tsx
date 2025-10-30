import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { notification } from '@/platform/haptics';

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
  variant?: 'confetti' | 'simple';
  duration?: number;
}

export const SuccessAnimation = ({
  show,
  message = 'Success!',
  onComplete,
  variant = 'simple',
  duration = 2000,
}: SuccessAnimationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      notification('success');

      if (variant === 'confetti') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, variant, duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <div className="h-24 w-24 rounded-full bg-success/20" />
        </div>
        <div className="relative brutal-border brutal-shadow-lg bg-background p-8 rounded-lg text-center space-y-4 animate-scale-in">
          <div className="relative">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto animate-scale-in" />
            {variant === 'confetti' && (
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-spin" />
            )}
          </div>
          <p className="text-lg font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};
