import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  validationState?: 'valid' | 'invalid' | 'neutral';
  showValidationIcon?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, validationState = 'neutral', showValidationIcon = false, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border-2 border-foreground bg-background px-3 py-2 text-base font-sans ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus:shadow-[3px_3px_0px_0px_hsl(var(--primary))] transition-all",
            error && "border-destructive focus-visible:ring-destructive",
            validationState === 'valid' && "border-green-600 focus-visible:ring-green-600",
            validationState === 'invalid' && "border-destructive focus-visible:ring-destructive",
            showValidationIcon && "pr-10",
            className,
          )}
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {showValidationIcon && validationState !== 'neutral' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validationState === 'valid' && (
              <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Valid input" />
            )}
            {validationState === 'invalid' && (
              <XCircle className="h-4 w-4 text-destructive" aria-label="Invalid input" />
            )}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
