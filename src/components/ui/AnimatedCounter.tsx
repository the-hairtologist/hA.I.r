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
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export const AnimatedCounter = React.forwardRef<HTMLDivElement, AnimatedCounterProps>(
  ({ end, suffix = '', icon: Icon, label, duration = 1500, bgColor = 'bg-primary', borderColor = 'border-black', textColor = 'text-primary-foreground' }, forwardedRef) => {
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
          className={`w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 border-4 ${borderColor} ${bgColor} flex items-center justify-center mb-2 transition-all duration-300 brutal-shadow ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <Icon 
            className={`h-8 w-8 xs:h-10 xs:w-10 ${textColor} transition-transform duration-300 ${
              isVisible ? 'animate-bounce' : ''
            }`} 
            strokeWidth={2.5}
            style={{ animationIterationCount: 1, animationDuration: '0.6s' }}
          />
        </div>
        <div className="text-center">
          <div className="text-base sm:text-lg font-pixel text-white">
            {count.toLocaleString()}{suffix}
          </div>
          <div className="text-xs font-pixel text-white/90 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    );
  }
);

AnimatedCounter.displayName = 'AnimatedCounter';
