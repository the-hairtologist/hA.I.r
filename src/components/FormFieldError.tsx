import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldErrorProps {
  message: string;
  className?: string;
  id?: string;
}

export const FormFieldError = ({ message, className, id }: FormFieldErrorProps) => {
  return (
    <div 
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 text-sm text-destructive animate-fade-in mt-1",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};
