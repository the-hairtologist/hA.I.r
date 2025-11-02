import { useState, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { withRetry } from '@/lib/errorHandler';
import { log } from '@/lib/logger';
import { z } from 'zod';

type SubmitFunction<TFormData extends Record<string, unknown>, TResult> = (
  data: TFormData,
) => Promise<TResult>;

interface UseFormSubmitOptions<
  TFormData extends Record<string, unknown>,
  TResult = void,
> {
  schema?: z.ZodSchema<TFormData>;
  initialValues?: Partial<TFormData>;
  onSuccess?: (data?: TResult) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  enableRetry?: boolean;
  preventDoubleSubmit?: boolean;
}

export const useFormSubmit = <
  TFormData extends Record<string, unknown>,
  TResult = void,
>(
  submitFn: SubmitFunction<TFormData, TResult>,
  options: UseFormSubmitOptions<TFormData, TResult> = {},
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [values, setValues] = useState<TFormData>((options.initialValues || {}) as TFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const lastSubmitRef = useRef(0);

  const {
    schema,
    enableRetry = true,
    preventDoubleSubmit = true,
  } = options;

  const setFieldValue = useCallback(
    <TKey extends keyof TFormData>(field: TKey, value: TFormData[TKey]) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      setErrors((prev) => {
        if (!(field in prev)) {
          return prev;
        }

        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    },
    [],
  );

  const setFieldTouched = useCallback((field: keyof TFormData, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!schema) {
      return true;
    }

    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: Record<string, string> = {};
    result.error.errors.forEach((issue) => {
      const path = issue.path.join('.');
      nextErrors[path] = issue.message;
    });
    setErrors(nextErrors);
    return false;
  }, [schema, values]);

  const markAllTouched = useCallback(() => {
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
  }, [values]);

  const handleSubmit = async (event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    markAllTouched();

    if (schema && !validateForm()) {
      log.warn('Form validation failed', 'useFormSubmit', { errors });
      toast.error('Please fix the errors in the form');
      return;
    }

    if (preventDoubleSubmit) {
      const now = Date.now();
      if (now - lastSubmitRef.current < 1000) {
        log.warn('Double submit prevented (< 1s since last)', 'useFormSubmit');
        return;
      }
      lastSubmitRef.current = now;
    }

    if (isSubmitting) {
      log.warn('Form submission already in progress', 'useFormSubmit');
      toast.warning('Please wait for the current submission to complete');
      return;
    }

    setIsSubmitting(true);
    setSubmitCount((prev) => prev + 1);
    setErrors({});

    try {
      let result: TResult;

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

      options.onSuccess?.(result);
      return result;
    } catch (error) {
      log.error('Form submission error', 'useFormSubmit', { error });

      const normalizedError = error instanceof Error ? error : new Error(String(error));
      const errorMessage =
        options.errorMessage || normalizedError.message || 'An error occurred';

      toast.error(errorMessage);
      options.onError?.(normalizedError);

      throw normalizedError;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = useCallback((field?: string) => {
    if (field) {
      setErrors((prev) => {
        if (!(field in prev)) {
          return prev;
        }

        const next = { ...prev };
        delete next[field];
        return next;
      });
    } else {
      setErrors({});
    }
  }, []);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setValues((options.initialValues || {}) as TFormData);
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
