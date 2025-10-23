/**
 * Enhanced Form Submission Hook
 * Supports Zod validation, field-level errors, touched state, and prevents double submissions
 */

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { withRetry } from '@/lib/errorHandler';
import { log } from '@/lib/logger';
import { z } from 'zod';

interface UseFormSubmitOptions<T = any> {
  schema?: z.ZodSchema<T>;
  initialValues?: Partial<T>;
  onSuccess?: (data?: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  enableRetry?: boolean;
  preventDoubleSubmit?: boolean;
}

export const useFormSubmit = <T extends Record<string, any>>(
  submitFn: (data: T) => Promise<any>,
  options: UseFormSubmitOptions<T> = {}
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [values, setValues] = useState<T>((options.initialValues || {}) as T);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const lastSubmitRef = useRef<number>(0);

  const {
    schema,
    enableRetry = true,
    preventDoubleSubmit = true,
  } = options;

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when field changes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!schema) return true;

    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }

    const newErrors: Record<string, string> = {};
    result.error.errors.forEach((error) => {
      const path = error.path.join('.');
      newErrors[path] = error.message;
    });
    setErrors(newErrors);
    return false;
  }, [schema, values]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate if schema provided
    if (schema && !validateForm()) {
      log.warn('Form validation failed', 'useFormSubmit', { errors });
      toast.error('Please fix the errors in the form');
      return;
    }

    // Prevent double submissions with timestamp check
    if (preventDoubleSubmit) {
      const now = Date.now();
      if (now - lastSubmitRef.current < 1000) {
        log.warn('Double submit prevented (< 1s since last)', 'useFormSubmit');
        return;
      }
      lastSubmitRef.current = now;
    }
    
    // Prevent concurrent submission
    if (isSubmitting) {
      log.warn('Form submission already in progress', 'useFormSubmit');
      toast.warning('Please wait for the current submission to complete');
      return;
    }

    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);
    setErrors({});

    try {
      let result: any;
      
      if (enableRetry) {
        result = await withRetry(() => submitFn(values), {
          maxRetries: 2,
          delay: 1000,
          onRetry: (attempt) => {
            log.info(`Retrying form submission (${attempt}/2)`, 'useFormSubmit');
            toast.info(`Retrying... (Attempt ${attempt}/2)`);
          },
        });
      } else {
        result = await submitFn(values);
      }
      
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      log.error('Form submission error', 'useFormSubmit', { error });
      
      const errorMessage = options.errorMessage || 
        (error instanceof Error ? error.message : 'An error occurred');
      
      toast.error(errorMessage);
      
      if (options.onError) {
        options.onError(error as Error);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = useCallback((field?: string) => {
    if (field) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setValues((options.initialValues || {}) as T);
    setErrors({});
    setTouched({});
    lastSubmitRef.current = 0;
  }, [options.initialValues]);

  return {
    values,
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    submitCount,
    setFieldValue,
    setFieldTouched,
    clearError,
    reset,
    validateForm,
  };
};
