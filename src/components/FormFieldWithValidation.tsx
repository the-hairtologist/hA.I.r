/**
 * Enhanced Form Field Component with Built-in Validation
 * Provides consistent form field styling with real-time validation
 */

import { forwardRef, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormFieldWithValidationProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "textarea";
  value: string | number;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  rows?: number;
}

export const FormFieldWithValidation = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldWithValidationProps
>(
  (
    {
      label,
      name,
      type = "text",
      value,
      onChange,
      onBlur,
      error,
      touched,
      placeholder,
      required = false,
      disabled = false,
      className,
      description,
      prefix,
      suffix,
      maxLength,
      minLength,
      pattern,
      autoComplete,
      rows = 4,
    },
    ref
  ) => {
    const hasError = touched && error;
    const isValid = touched && !error && value;

    const fieldId = `field-${name}`;
    const errorId = `${fieldId}-error`;
    const descriptionId = `${fieldId}-description`;

    const commonProps = {
      id: fieldId,
      name,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value),
      onBlur,
      placeholder,
      required,
      disabled,
      maxLength,
      minLength,
      pattern,
      autoComplete,
      "aria-invalid": hasError ? true : false,
      "aria-describedby": cn(
        description && descriptionId,
        hasError && errorId
      ),
      className: cn(
        "transition-all",
        hasError && "border-destructive focus-visible:ring-destructive",
        isValid && "border-success focus-visible:ring-success",
        className
      ),
    };

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldId} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>

        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {prefix}
            </div>
          )}

          {type === "textarea" ? (
            <Textarea
              {...commonProps}
              rows={rows}
              className={cn(
                commonProps.className,
                prefix && "pl-10",
                suffix && "pr-10"
              )}
              ref={ref as React.Ref<HTMLTextAreaElement>}
            />
          ) : (
            <Input
              {...commonProps}
              type={type}
              className={cn(
                commonProps.className,
                prefix && "pl-10",
                suffix && "pr-10"
              )}
              ref={ref as React.Ref<HTMLInputElement>}
            />
          )}

          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {suffix}
            </div>
          )}

          {/* Validation icons */}
          {touched && !suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : isValid ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : null}
            </div>
          )}
        </div>

        {/* Character count for text fields with maxLength */}
        {maxLength && type === "textarea" && (
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs",
                String(value).length > maxLength * 0.9
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {String(value).length} / {maxLength}
            </span>
          </div>
        )}

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            className="text-sm font-medium text-destructive flex items-center gap-1 animate-fade-in"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormFieldWithValidation.displayName = "FormFieldWithValidation";