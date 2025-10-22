/**
 * Enhanced Form Validation Hook
 * 
 * Provides comprehensive form validation with real-time feedback, debouncing,
 * and field-level validation using Zod schemas.
 * 
 * @template T - The type of form values
 * 
 * @example
 * ```tsx
 * const loginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(6)
 * });
 * 
 * const { values, errors, handleChange, handleSubmit } = useFormValidation({
 *   schema: loginSchema,
 *   onSubmit: async (data) => { await login(data); },
 *   initialValues: { email: '', password: '' }
 * });
 * ```
 */

import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { useDebouncedSearch } from "./useDebouncedSearch";
import { logger } from "@/lib/logging/productionLogger";

/**
 * Configuration options for form validation
 * @template T - The type of form values
 */
interface UseFormValidationOptions<T> {
  /** Zod schema for validation */
  schema: z.ZodSchema<T>;
  /** Callback function called on successful form submission */
  onSubmit: (data: T) => void | Promise<void>;
  /** Initial form values */
  initialValues?: Partial<T>;
  /** Enable validation on every change (default: true) */
  validateOnChange?: boolean;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
}

/**
 * Form validation hook with real-time feedback
 * 
 * @param options - Configuration options
 * @returns Form state and handler functions
 */
export function useFormValidation<T extends Record<string, any>>({
  schema,
  onSubmit,
  initialValues = {},
  validateOnChange = true,
  debounceMs = 300,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Debounce validation for better performance
  const { debouncedValue: debouncedValues } = useDebouncedSearch(
    JSON.stringify(values),
    debounceMs
  );

  /**
   * Validates a single form field
   * @param name - Field name
   * @param value - Field value
   * @returns Error message or null if valid
   */
  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      try {
        // Extract field schema if possible
        const fieldSchema = (schema as any).shape?.[name];
        if (fieldSchema) {
          fieldSchema.parse(value);
        }
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message || "Invalid value";
        }
        return "Validation error";
      }
    },
    [schema]
  );

  /**
   * Validates all form fields
   * @returns True if form is valid, false otherwise
   */
  const validateAll = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        setIsValid(false);
        return false;
      }
      setIsValid(false);
      return false;
    }
  }, [schema, values]);

  // Validate on change if enabled
  useEffect(() => {
    if (validateOnChange) {
      validateAll();
    }
  }, [debouncedValues, validateOnChange, validateAll]);

  // Handle field change
  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Mark as touched
      setTouched((prev) => ({ ...prev, [name as string]: true }));

      // Validate immediately if field was touched
      if (touched[name as string]) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error || "",
        }));
      }
    },
    [touched, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name as string]: true }));
      
      const value = values[name];
      const error = validateField(name, value);
      
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [values, validateField]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validate all fields
      if (!validateAll()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values as T);
      } catch (error) {
        logger.error("Form submission error", error, { context: 'useFormValidation' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateAll, onSubmit]
  );

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialValues]);

  // Set field value programmatically
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validateField,
    validateAll,
  };
}