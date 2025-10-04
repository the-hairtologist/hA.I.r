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
    className: "border-l-4 border-l-success bg-gradient-to-r from-success/10 to-background",
    iconColor: "text-success"
  },
  error: {
    icon: AlertCircle,
    className: "border-l-4 border-l-destructive bg-gradient-to-r from-destructive/10 to-background",
    iconColor: "text-destructive"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-l-4 border-l-warning bg-gradient-to-r from-warning/10 to-background",
    iconColor: "text-warning"
  },
  info: {
    icon: Info,
    className: "border-l-4 border-l-info bg-gradient-to-r from-info/10 to-background",
    iconColor: "text-info"
  },
  celebration: {
    icon: Sparkles,
    className: "border-l-4 border-l-primary bg-gradient-to-r from-primary/10 via-secondary/10 to-background",
    iconColor: "text-primary"
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
