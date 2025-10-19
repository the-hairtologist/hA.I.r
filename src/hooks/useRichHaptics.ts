/**
 * ✨ ENHANCEMENT: Rich Haptics Hook
 * Adds contextual haptic feedback throughout the app for native feel
 */

import { useCallback } from 'react';
import { haptic } from '@/platform/haptics';
import { Platform } from '@/platform/detector';

type HapticEvent = 
  | 'button_tap'
  | 'success_action'
  | 'error_action'
  | 'toggle_on'
  | 'toggle_off'
  | 'modal_open'
  | 'modal_close'
  | 'navigation'
  | 'delete_action'
  | 'selection'
  | 'swipe'
  | 'pull_refresh'
  | 'achievement';

export const useRichHaptics = () => {
  const trigger = useCallback((event: HapticEvent) => {
    if (!Platform.isMobile) return; // Only on mobile devices

    switch (event) {
      case 'button_tap':
      case 'toggle_on':
      case 'toggle_off':
      case 'selection':
        haptic.tap();
        break;

      case 'success_action':
      case 'achievement':
        haptic.success();
        break;

      case 'error_action':
        haptic.error();
        break;

      case 'delete_action':
        haptic.warning();
        break;

      case 'modal_open':
      case 'modal_close':
      case 'navigation':
        haptic.tap();
        break;

      case 'swipe':
      case 'pull_refresh':
        haptic.button();
        break;

      default:
        haptic.tap();
    }
  }, []);

  /**
   * ✨ Specialized haptic patterns
   */
  const patterns = {
    /**
     * Double tap pattern for "like" or "favorite"
     */
    doubleTap: useCallback(() => {
      haptic.tap();
      setTimeout(() => haptic.tap(), 100);
    }, []),

    /**
     * Success sequence for completed actions
     */
    successSequence: useCallback(() => {
      haptic.tap();
      setTimeout(() => haptic.button(), 100);
      setTimeout(() => haptic.success(), 200);
    }, []),

    /**
     * Warning pattern for destructive actions
     */
    warningPattern: useCallback(() => {
      haptic.warning();
      setTimeout(() => haptic.error(), 150);
    }, []),

    /**
     * Subtle notification tap
     */
    notification: useCallback(() => {
      haptic.tap();
    }, [])
  };

  return {
    trigger,
    patterns,
    isAvailable: Platform.isMobile
  };
};
