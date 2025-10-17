/**
 * React Hook for Swipe Gestures
 * Easy integration with haptic feedback
 */

import { useSwipeGesture } from '@/lib/mobile/SwipeGestures';
import { playHapticForAction } from '@/lib/mobile/HapticPatterns';

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface UseSwipeGesturesCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  hapticFeedback?: boolean;
}

export const useSwipeGestures = (callbacks: UseSwipeGesturesCallbacks) => {
  const hapticEnabled = callbacks.hapticFeedback !== false;

  const ref = useSwipeGesture((direction: SwipeDirection, distance: number) => {
    // Trigger haptic feedback
    if (hapticEnabled) {
      playHapticForAction('swipe');
    }

    // Execute appropriate callback
    switch (direction) {
      case 'left':
        callbacks.onSwipeLeft?.();
        break;
      case 'right':
        callbacks.onSwipeRight?.();
        break;
      case 'up':
        callbacks.onSwipeUp?.();
        break;
      case 'down':
        callbacks.onSwipeDown?.();
        break;
    }
  }, {
    threshold: 50,
    timeout: 300,
  });

  return ref;
};
