import React from 'react';
import { useCounter } from '@/hooks/useCounter';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { LucideIcon } from 'lucide-react';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  icon: LucideIcon;
  label: string;
  duration?: number;
}

export const AnimatedCounter = React.forwardRef<HTMLDivElement, AnimatedCounterProps>(
  ({ end, suffix = '', icon: Icon, label, duration = 1500 }, forwardedRef) => {
    const { ref: scrollRef, isVisible } = useScrollAnimation({ threshold: 0.3 });
    const count = useCounter({ end, duration, isActive: isVisible });

    // Merge refs
    const setRefs = (element: HTMLDivElement | null) => {
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
    };

    return (
      <div
        ref={setRefs}
        className="flex flex-col items-center gap-4 transition-all duration-300"
      >
        <div
          className={`w-16 h-16 border-4 border-black bg-primary flex items-center justify-center mb-2 transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <Icon 
            className={`h-8 w-8 text-primary-foreground transition-transform duration-300 ${
              isVisible ? 'animate-bounce' : ''
            }`} 
            style={{ animationIterationCount: 1, animationDuration: '0.6s' }}
          />
        </div>
        <div className="text-center">
          <div className="text-base sm:text-lg font-pixel text-secondary-foreground">
            {count.toLocaleString()}{suffix}
          </div>
          <div className="text-xs font-pixel text-secondary-foreground/90 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    );
  }
);

AnimatedCounter.displayName = 'AnimatedCounter';
