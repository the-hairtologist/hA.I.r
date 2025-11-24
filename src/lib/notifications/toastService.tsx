/**
 * Toast Notification Service
 * Unified interface for showing toast notifications throughout the app
 */

import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'promise';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastService {
  /**
   * Show a success toast
   */
  success(message: string, options?: ToastOptions) {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
  }

  /**
   * Show an error toast
   */
  error(message: string, options?: ToastOptions) {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action,
      icon: <XCircle className="h-5 w-5" />,
    });
  }

  /**
   * Show a warning toast
   */
  warning(message: string, options?: ToastOptions) {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      icon: <AlertCircle className="h-5 w-5" />,
    });
  }

  /**
   * Show an info toast
   */
  info(message: string, options?: ToastOptions) {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      icon: <Info className="h-5 w-5" />,
    });
  }

  /**
   * Show a loading toast (returns ID to dismiss later)
   */
  loading(message: string, description?: string) {
    return toast.loading(message, {
      description,
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
    });
  }

  /**
   * Dismiss a specific toast by ID
   */
  dismiss(toastId: string | number) {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    toast.dismiss();
  }

  /**
   * Show a promise toast (automatically updates based on promise state)
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  }

  /**
   * Common toast patterns
   */
  savedSuccessfully(itemName: string = 'Item') {
    this.success(`${itemName} saved successfully`);
  }

  deletedSuccessfully(itemName: string = 'Item') {
    this.success(`${itemName} deleted successfully`);
  }

  updatedSuccessfully(itemName: string = 'Item') {
    this.success(`${itemName} updated successfully`);
  }

  createdSuccessfully(itemName: string = 'Item') {
    this.success(`${itemName} created successfully`);
  }

  saveFailed(itemName: string = 'Item') {
    this.error(`Failed to save ${itemName.toLowerCase()}`, {
      description: 'Please try again',
    });
  }

  networkError() {
    this.error('Network error', {
      description: 'Please check your connection and try again',
    });
  }

  permissionDenied() {
    this.error('Permission denied', {
      description: "You don't have permission to perform this action",
    });
  }

  featureComingSoon(featureName: string = 'This feature') {
    this.info(`${featureName} coming soon`, {
      description: "We're working on it!",
    });
  }

  copiedToClipboard(content: string = 'Content') {
    this.success(`${content} copied to clipboard`);
  }
}

// Export singleton instance
export const toastService = new ToastService();
