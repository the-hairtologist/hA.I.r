import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TransitionVariant = 'fade' | 'slide-up' | 'slide-right' | 'scale' | 'none';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: TransitionVariant;
  delay?: number;
}

const variantClasses: Record<TransitionVariant, string> = {
  fade: 'animate-fade-in',
  'slide-up': 'animate-[fade-in_0.3s_ease-out,_slide-up_0.3s_ease-out]',
  'slide-right': 'animate-slide-in-right',
  scale: 'animate-scale-in',
  none: '',
};

export const PageTransition = ({
  children,
  className,
  variant = 'fade',
  delay = 0,
}: PageTransitionProps) => {
  return (
    <div
      className={cn(variantClasses[variant], className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};
