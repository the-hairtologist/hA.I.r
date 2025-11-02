import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Platform } from './detector';

/**
 * Unified haptic feedback API for both web and mobile
 * Web: Vibration API (limited)
 * Mobile: Native haptic feedback with multiple styles
 */

type ImpactWeight = 'light' | 'medium' | 'heavy';
type NotificationFeedback = 'success' | 'warning' | 'error';

/**
 * Trigger an impact-style haptic feedback
 * Light: For subtle interactions (list scrolling, switches)
 * Medium: For standard interactions (button taps)
 * Heavy: For important actions (confirmations, deletions)
 */
export const impact = async (
  weight: ImpactWeight = 'medium'
): Promise<void> => {
  if (Platform.isMobile) {
    try {
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };

      await Haptics.impact({ style: styleMap[weight] });
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  } else {
    // Web fallback: Simple vibration
    if (navigator.vibrate) {
      const durationMap = {
        light: 10,
        medium: 20,
        heavy: 50,
      };
      navigator.vibrate(durationMap[weight]);
    }
  }
};

/**
 * Trigger a notification-style haptic feedback
 * Success: For completed actions
 * Warning: For cautionary actions
 * Error: For failed actions or errors
 */
export const notification = async (
  type: NotificationFeedback = 'success'
): Promise<void> => {
  if (Platform.isMobile) {
    try {
      const typeMap = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };

      await Haptics.notification({ type: typeMap[type] });
    } catch (error) {
      console.warn('Haptic notification failed:', error);
    }
  } else {
    // Web fallback: Pattern vibration
    if (navigator.vibrate) {
      const patternMap = {
        success: [10, 50, 10],
        warning: [10, 100, 10, 100],
        error: [10, 50, 10, 50, 10],
      };
      navigator.vibrate(patternMap[type]);
    }
  }
};

/**
 * Trigger a selection-style haptic feedback
 * For scrolling through a list of discrete values
 */
export const selection = async (): Promise<void> => {
  if (Platform.isMobile) {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (error) {
      console.warn('Haptic selection failed:', error);
    }
  } else {
    // Web fallback: Very brief vibration
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  }
};

/**
 * Check if haptic feedback is available
 */
export const isHapticsAvailable = (): boolean => {
  if (Platform.isMobile) {
    return true; // Assume mobile devices have haptics
  }
  return 'vibrate' in navigator;
};

/**
 * Vibrate with a custom pattern (web only)
 * @param pattern Array of vibration durations in ms [vibrate, pause, vibrate, ...]
 */
export const vibratePattern = (pattern: number[]): void => {
  if (!Platform.isMobile && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

/**
 * Helper functions for common UI interactions
 */
export const haptic = {
  /** Light tap for subtle interactions */
  tap: () => impact('light'),

  /** Standard button press */
  button: () => impact('medium'),

  /** Heavy feedback for important actions */
  confirm: () => impact('heavy'),

  /** Success notification */
  success: () => notification('success'),

  /** Warning notification */
  warning: () => notification('warning'),

  /** Error notification */
  error: () => notification('error'),

  /** Selection change */
  select: () => selection(),
};
