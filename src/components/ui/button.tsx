import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { useRichHaptics } from '@/hooks/useRichHaptics';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold uppercase tracking-wide ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 brutal-border-subtle shadow-brutal-sm hover:shadow-brutal-xs hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-[0.99]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 brutal-border-subtle shadow-brutal-sm hover:shadow-brutal-xs hover:translate-x-[1px] hover:translate-y-[1px] active:scale-[0.99]',
        outline:
          'brutal-border-subtle bg-background hover:bg-accent hover:text-accent-foreground shadow-brutal-sm hover:shadow-brutal-xs hover:translate-x-[1px] hover:translate-y-[1px] focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:ring-offset-2 active:scale-[0.99]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] active:scale-[0.99]',
        ghost:
          'hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
        success:
          'bg-success text-success-foreground hover:bg-success/90 border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] active:scale-[0.99]',
        glass:
          'glass-brutal backdrop-blur-xl text-foreground hover:bg-background/80 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
      },
      size: {
        default: 'h-11 px-4 py-2 min-h-[44px]',
        sm: 'h-10 rounded-md px-3 min-h-[44px] sm:min-h-[40px]',
        lg: 'h-12 rounded-md px-8 min-h-[48px]',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
        xl: 'h-14 rounded-lg px-10 text-base min-h-[56px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, disabled, onClick, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const haptics = useRichHaptics();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback on click
      if (!disabled) {
        if (variant === 'destructive') {
          haptics.patterns.warningPattern();
        } else {
          haptics.trigger('button_tap');
        }
      }

      // Call original onClick handler
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
