/**
 * Enhanced Form Submission Hook
 * Prevents double submissions, handles loading states, and includes retry logic
 */

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { withRetry } from '@/lib/errorHandler';
import { log } from '@/lib/logger';

interface UseFormSubmitOptions<T = any> {
  onSuccess?: (data?: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  enableRetry?: boolean;
  preventDoubleSubmit?: boolean;
}

export const useFormSubmit = <T = any>(
  submitFn: () => Promise<T>,
  options: UseFormSubmitOptions<T> = {}
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const lastSubmitRef = useRef<number>(0);

  const {
    enableRetry = true, // Changed default to true
    preventDoubleSubmit = true,
  } = options;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
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
    setError(null);

    try {
      let result: T;
      
      if (enableRetry) {
        result = await withRetry(submitFn, {
          maxRetries: 2,
          delay: 1000,
          onRetry: (attempt) => {
            log.info(`Retrying form submission (${attempt}/2)`, 'useFormSubmit');
            toast.info(`Retrying... (Attempt ${attempt}/2)`);
          },
        });
      } else {
        result = await submitFn();
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
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (options.onError) {
        options.onError(error as Error);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setError(null);
  const reset = () => {
    setIsSubmitting(false);
    setError(null);
    lastSubmitRef.current = 0;
  };

  return {
    handleSubmit,
    isSubmitting,
    submitCount,
    error,
    clearError,
    reset,
  };
};
