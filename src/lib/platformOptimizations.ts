import { Platform, haptic } from '@/platform';
import { analytics } from './analytics';

/**
 * Platform-specific optimizations and integrations
 */

// Haptic feedback for important actions
export const triggerHaptic = (type: 'success' | 'warning' | 'error' | 'selection' = 'selection') => {
  if (!Platform.isMobile) return;

  try {
    switch (type) {
      case 'success':
        haptic.success();
        break;
      case 'warning':
        haptic.warning();
        break;
      case 'error':
        haptic.error();
        break;
      default:
        haptic.select();
    }
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

// Native share functionality
export const shareContent = async (data: {
  title?: string;
  text?: string;
  url?: string;
}) => {
  if (!Platform.isMobile && !navigator.share) {
    console.warn('Share API not supported');
    return false;
  }

  try {
    if (navigator.share) {
      await navigator.share(data);
      analytics.track('content_shared', { platform: Platform.platform });
      return true;
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
};

// Device detection and capabilities
export const getDeviceCapabilities = () => {
  return {
    platform: Platform.platform,
    isMobile: Platform.isMobile,
    isIOS: Platform.isIOS,
    isAndroid: Platform.isAndroid,
    hasHaptics: Platform.isMobile,
    hasShare: Platform.isMobile || !!navigator.share,
    hasCamera: Platform.isMobile,
    hasNotifications: 'Notification' in window && Notification.permission !== 'denied',
  };
};

// Performance optimizations
export const optimizeForPlatform = () => {
  const capabilities = getDeviceCapabilities();
  
  // Mobile optimizations
  if (Platform.isMobile) {
    // Disable hover effects on mobile
    document.documentElement.classList.add('mobile');
    
    // Optimize touch events
    document.addEventListener('touchstart', () => {}, { passive: true });
  }

  // Log capabilities for debugging
  console.log('[Platform] Device capabilities:', capabilities);
  
  analytics.track('platform_detected', capabilities);
  
  return capabilities;
};

// Smart notification preferences
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'not-supported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    analytics.track('notification_permission_requested', { result: permission });
    return permission;
  }

  return Notification.permission;
};

// Adaptive UI based on platform
export const getPlatformStyles = () => {
  return {
    buttonSize: Platform.isMobile ? 'lg' : 'default',
    inputSize: Platform.isMobile ? 'lg' : 'default',
    spacing: Platform.isMobile ? 'comfortable' : 'normal',
    fontSize: Platform.isMobile ? 'base' : 'sm',
  };
};
