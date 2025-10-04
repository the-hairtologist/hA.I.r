/**
 * Delightful Toast Component
 * Enhanced toast notifications with brand personality and micro-interactions
 */

import { toast as sonnerToast } from "sonner";
import { CheckCircle, AlertCircle, Info, AlertTriangle, Sparkles } from "lucide-react";

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'celebration';

interface ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

const toastStyles = {
  success: {
    icon: CheckCircle,
    className: "border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white",
    iconColor: "text-green-600"
  },
  error: {
    icon: AlertCircle,
    className: "border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white",
    iconColor: "text-red-600"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white",
    iconColor: "text-yellow-600"
  },
  info: {
    icon: Info,
    className: "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white",
    iconColor: "text-blue-600"
  },
  celebration: {
    icon: Sparkles,
    className: "border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 via-pink-50 to-white",
    iconColor: "text-purple-600"
  }
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    const config = toastStyles.success;
    const Icon = config.icon;
    
    return sonnerToast.success(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 3000,
      action: options?.action,
      icon: <Icon className={config.iconColor} />,
      className: `${config.className} border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]`,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    const config = toastStyles.error;
    const Icon = config.icon;
    
    return sonnerToast.error(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      icon: <Icon className={config.iconColor} />,
      className: `${config.className} border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]`,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    const config = toastStyles.warning;
    const Icon = config.icon;
    
    return sonnerToast.warning(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 3500,
      action: options?.action,
      icon: <Icon className={config.iconColor} />,
      className: `${config.className} border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]`,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    const config = toastStyles.info;
    const Icon = config.icon;
    
    return sonnerToast.info(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 3000,
      action: options?.action,
      icon: <Icon className={config.iconColor} />,
      className: `${config.className} border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]`,
    });
  },

  celebration: (message: string, options?: ToastOptions) => {
    const config = toastStyles.celebration;
    const Icon = config.icon;
    
    return sonnerToast.success(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      icon: <Icon className={`${config.iconColor} animate-pulse-glow`} />,
      className: `${config.className} border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] animate-wiggle`,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};
