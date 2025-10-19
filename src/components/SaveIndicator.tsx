/**
 * Save Indicator - Shows save status for forms
 * Provides instant feedback on save state
 */

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  className?: string;
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all",
        "min-h-[20px]", // Consistent height to prevent layout shift
        status === "saving" && "text-muted-foreground",
        status === "saved" && "text-success animate-fade-in",
        status === "error" && "text-destructive animate-fade-in",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" aria-hidden="true" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          <span>Saved ✓</span>
        </>
      )}
      {status === "error" && (
        <span>Failed to save</span>
      )}
    </span>
  );
}
