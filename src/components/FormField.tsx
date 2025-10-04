/**
 * Accessible Form Field Component
 * Wraps input with label and error handling
 */

import { Label } from "@/components/ui/label";
import { Input, InputProps } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldError } from "@/components/FormFieldError";
import { cn } from "@/lib/utils";

interface FormFieldProps extends Omit<InputProps, 'error'> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  textarea?: boolean;
  textareaRows?: number;
}

export const FormField = ({ 
  label, 
  error, 
  required, 
  helperText,
  textarea,
  textareaRows = 3,
  className,
  id,
  ...props 
}: FormFieldProps) => {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const helperId = helperText ? `${fieldId}-helper` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      
      {textarea ? (
        <Textarea
          id={fieldId}
          rows={textareaRows}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          )}
          aria-required={required}
          {...(props as any)}
        />
      ) : (
        <Input
          id={fieldId}
          className={className}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          )}
          aria-required={required}
          error={error}
          {...props}
        />
      )}
      
      {helperText && !error && (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      
      {error && <FormFieldError message={error} id={errorId} />}
    </div>
  );
};
