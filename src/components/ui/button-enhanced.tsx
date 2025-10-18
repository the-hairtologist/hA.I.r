/**
 * Enhanced Button System
 * Clear visual hierarchy with micro-interactions
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // PRIMARY: Most important actions (Add, Save, Submit, Confirm)
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-sm hover:shadow-md",
        
        // PRIMARY GRADIENT: Hero/Premium actions
        gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-md",
        
        // SECONDARY: Important but not primary (Edit, View Details)
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
        
        // OUTLINE: Tertiary actions (Cancel, Close, neutral actions)
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        
        // GHOST: Subtle actions (icon buttons, menu items)
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.95]",
        
        // DESTRUCTIVE: Delete, Remove, Dangerous actions
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm active:scale-[0.98]",
        
        // LINK: Text-only links
        link: "text-primary underline-offset-4 hover:underline active:opacity-80",
        
        // SUCCESS: Positive confirmations
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        press: "btn-press",
        lift: "hover-lift",
        glow: "hover-glow",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "press",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
