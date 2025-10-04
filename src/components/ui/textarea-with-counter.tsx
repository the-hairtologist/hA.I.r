/**
 * Textarea with Character Counter
 * Reusable component for text inputs with length limits
 */

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface TextareaWithCounterProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength: number;
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  error?: string;
}

export const TextareaWithCounter = React.forwardRef<
  HTMLTextAreaElement,
  TextareaWithCounterProps
>(({ maxLength, value, onValueChange, label, error, className, ...props }, ref) => {
  const remaining = maxLength - value.length;
  const isNearLimit = remaining < 50;
  const isOverLimit = remaining < 0;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <Textarea
        {...props}
        ref={ref}
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            onValueChange(e.target.value);
          }
        }}
        maxLength={maxLength}
        className={cn(
          error && "border-destructive",
          className
        )}
      />
      <div className="flex items-center justify-between">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <p
          className={cn(
            "text-xs ml-auto",
            isOverLimit
              ? "text-destructive font-semibold"
              : isNearLimit
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {value.length} / {maxLength}
          {isNearLimit && !isOverLimit && ` (${remaining} remaining)`}
        </p>
      </div>
    </div>
  );
});

TextareaWithCounter.displayName = "TextareaWithCounter";
