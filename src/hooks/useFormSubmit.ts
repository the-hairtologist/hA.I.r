/**
 * Form Submission Hook
 * Prevents double submissions and handles loading states
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { log } from '@/lib/logger';

interface UseFormSubmitOptions<T = any> {
  onSuccess?: (data?: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useFormSubmit = <T = any>(
  submitFn: () => Promise<T>,
  options: UseFormSubmitOptions<T> = {}
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Prevent double submission
    if (isSubmitting) {
      log.warn('Form submission already in progress', 'useFormSubmit');
      return;
    }

    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);

    try {
      const result = await submitFn();
      
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

  return {
    handleSubmit,
    isSubmitting,
    submitCount,
  };
};
