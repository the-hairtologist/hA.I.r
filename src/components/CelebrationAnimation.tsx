import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, TrendingUp } from 'lucide-react';
import { haptic } from '@/platform/haptics';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logging/productionLogger';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';

interface CelebrationAnimationProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  emoji: string;
  discountCode?: string;
  discountAmount?: number;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export const CelebrationAnimation = ({
  open,
  onClose,
  title,
  message,
  emoji,
  discountCode,
  discountAmount,
  autoClose = true,
  autoCloseDuration = 8000,
}: CelebrationAnimationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      haptic.success();

      // Stop confetti after 5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      // Auto-close after specified duration
      let autoCloseTimer: NodeJS.Timeout;
      if (autoClose) {
        autoCloseTimer = setTimeout(() => {
          onClose();
        }, autoCloseDuration);
      }

      return () => {
        clearTimeout(confettiTimer);
        if (autoCloseTimer) clearTimeout(autoCloseTimer);
      };
    } else {
      setShowConfetti(false);
    }
  }, [open, autoClose, autoCloseDuration, onClose]);

  const handleCopyCode = async () => {
    if (!discountCode) return;

    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      haptic.success();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Failed to copy discount code', error, { component: 'CelebrationAnimation' });
    }
  };

  const handleClose = () => {
    setShowConfetti(false);
    haptic.tap();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: 'var(--brutal-overlay)' }}
    >
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <Card className="relative max-w-md w-full mx-4 brutal-border shadow-brutal-2xl animate-scale-in bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute right-2 top-2 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardContent className="pt-12 pb-8 px-8 text-center space-y-6">
          <div className="text-8xl animate-bounce mb-4">{emoji}</div>

          <div className="space-y-2">
            <h2 className={cn(mobileFirst.text['4xl'], "font-bold gradient-text")}>
              {title}
            </h2>
            <p className={cn(mobileFirst.text.xl, "text-muted-foreground")}>
              {message}
            </p>
          </div>

          {discountCode && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-success" />
                <span>You've earned a special reward!</span>
              </div>

              <div className={cn(
                "bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg brutal-border-subtle",
                mobileFirst.padding.md
              )}>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <p className="text-xs sm:text-sm font-semibold">
                      Discount Code
                    </p>
                  </div>

                  <div className={cn(
                    mobileFirst.text['3xl'],
                    "font-mono font-bold tracking-wider bg-background px-4 py-3 rounded brutal-border-subtle"
                  )}>
                    {discountCode}
                  </div>

                  {discountAmount && (
                    <p className={cn(mobileFirst.text.xl, "font-bold text-success")}>
                      ${discountAmount} OFF
                    </p>
                  )}

                  <Button
                    onClick={handleCopyCode}
                    variant="default"
                    className="w-full brutal-button brutal-hover"
                  >
                    {copied ? '✓ Copied!' : 'Copy Code'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleClose}
            variant="outline"
            className="mt-6 brutal-button"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
