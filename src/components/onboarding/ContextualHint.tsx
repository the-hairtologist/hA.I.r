/**
 * Contextual Hint Component
 * Shows helpful tips to first-time users without being intrusive
 */

import { useState, useEffect } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContextualHintProps {
  id: string;
  title: string;
  description: string;
  delay?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const ContextualHint = ({
  id,
  title,
  description,
  delay = 1000,
  placement = 'bottom',
}: ContextualHintProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen this hint before
    const hasSeenHint = localStorage.getItem(`hint_seen_${id}`);
    
    if (!hasSeenHint) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [id, delay]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`hint_seen_${id}`, 'true');
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible || isDismissed) return null;

  const placementClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <Card 
      className={`
        absolute z-50 w-72 p-4 shadow-lg animate-scale-in
        ${placementClasses[placement]}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-6 w-6 -mt-1 -mr-1"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Arrow indicator */}
      <div 
        className={`
          absolute w-2 h-2 bg-background border rotate-45
          ${placement === 'bottom' ? '-top-1 left-6 border-b-0 border-r-0' : ''}
          ${placement === 'top' ? '-bottom-1 left-6 border-t-0 border-l-0' : ''}
          ${placement === 'right' ? '-left-1 top-6 border-l-0 border-b-0' : ''}
          ${placement === 'left' ? '-right-1 top-6 border-r-0 border-t-0' : ''}
        `}
      />
    </Card>
  );
};
