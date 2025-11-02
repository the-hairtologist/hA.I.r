import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  delay?: number;
  animation?: 'fade' | 'slide' | 'scale';
}

export const StaggeredList = ({
  children,
  className,
  itemClassName,
  delay = 50,
  animation = 'fade',
}: StaggeredListProps) => {
  const animations = {
    fade: 'animate-fade-in',
    slide: 'animate-slide-in-right',
    scale: 'animate-scale-in',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(animations[animation], itemClassName)}
          style={{ animationDelay: `${index * delay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
