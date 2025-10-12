/**
 * Toast Hook
 * React hook wrapper for the toast service
 */

import { useCallback } from 'react';
import { toastService } from '@/lib/notifications/toastService';

export const useToast = () => {
  const showSuccess = useCallback((message: string, description?: string) => {
    toastService.success(message, { description });
  }, []);

  const showError = useCallback((message: string, description?: string) => {
    toastService.error(message, { description });
  }, []);

  const showWarning = useCallback((message: string, description?: string) => {
    toastService.warning(message, { description });
  }, []);

  const showInfo = useCallback((message: string, description?: string) => {
    toastService.info(message, { description });
  }, []);

  const showLoading = useCallback((message: string, description?: string) => {
    return toastService.loading(message, description);
  }, []);

  const dismiss = useCallback((toastId: string | number) => {
    toastService.dismiss(toastId);
  }, []);

  const dismissAll = useCallback(() => {
    toastService.dismissAll();
  }, []);

  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    dismiss,
    dismissAll,
    toast: toastService, // Access to full service if needed
  };
};
