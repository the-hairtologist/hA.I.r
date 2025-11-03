import { Platform, haptic } from '@/platform';
import { analytics } from './analytics';
import { logger } from './logger';

/**
 * Platform-specific optimizations and integrations
 */

// Haptic feedback for important actions
export const triggerHaptic = (
  type: 'success' | 'warning' | 'error' | 'selection' = 'selection'
) => {
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
    logger.warn('Haptic feedback failed', 'platformOptimizations');
  }
};

// Native share functionality
export const shareContent = async (data: {
  title?: string;
  text?: string;
  url?: string;
}) => {
  if (!Platform.isMobile && !navigator.share) {
    logger.warn('Share API not supported', 'platformOptimizations');
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
      logger.error('Share failed', 'platformOptimizations', error as Error);
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
    hasNotifications:
      'Notification' in window && Notification.permission !== 'denied',
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
  logger.debug('[Platform] Device capabilities', 'platformOptimizations', { capabilities });

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
    analytics.track('notification_permission_requested', {
      result: permission,
    });
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
