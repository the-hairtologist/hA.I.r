/**
 * Standard Form Field Component
 * Provides consistent form field rendering with built-in validation display
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface StandardFormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'password';
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  description?: string;
  disabled?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

export const StandardFormField = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required,
  placeholder,
  maxLength,
  description,
  disabled,
  rows = 4,
  min,
  max,
  step,
}: StandardFormFieldProps) => {
  const showError = touched && error;
  const Component = type === 'textarea' ? Textarea : Input;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Component
        id={name}
        name={name}
        type={type !== 'textarea' ? type : undefined}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const val = type === 'number' ? parseFloat(e.target.value) : e.target.value;
          onChange(val);
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        rows={type === 'textarea' ? rows : undefined}
        required={required}
        min={min}
        max={max}
        step={step}
        aria-invalid={showError ? true : undefined}
        aria-describedby={
          showError ? `${name}-error` : description ? `${name}-description` : undefined
        }
        className={cn(
          showError && "border-destructive focus-visible:ring-destructive",
          type === 'textarea' && "resize-none"
        )}
      />
      {description && !showError && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {showError && (
        <div 
          id={`${name}-error`} 
          className="flex items-center gap-2 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {maxLength && type === 'textarea' && (
        <p className="text-xs text-muted-foreground text-right">
          {String(value).length}/{maxLength}
        </p>
      )}
    </div>
  );
};

