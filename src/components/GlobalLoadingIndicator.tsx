/**
 * Global Loading Indicator
 * Shows a persistent loading state that's always visible across all devices
 */

import { Scissors } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlobalLoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}

export const GlobalLoadingIndicator = ({
  isLoading,
  message = 'Loading...',
}: GlobalLoadingIndicatorProps) => {
  const [showLoader, setShowLoader] = useState(false);

  // Delay showing the loader to avoid flash for fast loads
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoader(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [isLoading]);

  if (!showLoader) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-200',
        showLoader ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border-2 border-border shadow-lg max-w-sm w-full mx-4">
        <div className="relative">
          <Scissors
            className="h-12 w-12 text-primary animate-pulse"
            aria-hidden="true"
          />
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">
            This should only take a moment
          </p>
        </div>

        {/* Progress dots for visual feedback */}
        <div className="flex gap-2" aria-hidden="true">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
};
