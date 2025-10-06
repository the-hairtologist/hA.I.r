import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineValidationProps {
  status: "success" | "error" | "warning" | "idle";
  message?: string;
  className?: string;
}

/**
 * Inline validation feedback component
 * Shows real-time validation status with icon and message
 */
export const InlineValidation = ({ 
  status, 
  message, 
  className 
}: InlineValidationProps) => {
  if (status === "idle" || !message) return null;

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
  };

  const Icon = icons[status];

  const colors = {
    success: "text-green-600 dark:text-green-400",
    error: "text-destructive",
    warning: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-2 text-sm animate-fade-in",
        colors[status],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};