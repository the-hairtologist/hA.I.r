/**
 * Touch Gesture Handler
 * Provides touch gesture detection for mobile devices
 */

import { useEffect, useRef, useState } from 'react';

interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
}

interface TouchGestureOptions {
  onSwipe?: (direction: SwipeDirection) => void;
  onPinch?: (scale: number) => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

export class TouchGestureHandler {
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private longPressTimer?: number;
  private options: TouchGestureOptions;

  constructor(element: HTMLElement, options: TouchGestureOptions) {
    this.options = {
      threshold: 50,
      longPressDelay: 500,
      ...options,
    };

    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
  }

  private handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();

    // Long press detection
    if (this.options.onLongPress) {
      this.longPressTimer = window.setTimeout(() => {
        this.options.onLongPress?.();
      }, this.options.longPressDelay);
    }
  }

  private handleTouchMove(event: TouchEvent) {
    // Cancel long press if finger moves
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  private handleTouchEnd(event: TouchEvent) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < this.options.threshold!) {
      return; // Not a swipe, just a tap
    }

    // Determine swipe direction
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    let direction: 'left' | 'right' | 'up' | 'down';

    if (angle > -45 && angle <= 45) {
      direction = 'right';
    } else if (angle > 45 && angle <= 135) {
      direction = 'down';
    } else if (angle > -135 && angle <= -45) {
      direction = 'up';
    } else {
      direction = 'left';
    }

    this.options.onSwipe?.({ direction, distance });
  }

  destroy() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }
}

/**
 * React hook for touch gestures
 */
export const useTouchGestures = (
  ref: React.RefObject<HTMLElement>,
  options: TouchGestureOptions
) => {
  const [handler, setHandler] = useState<TouchGestureHandler | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const gestureHandler = new TouchGestureHandler(ref.current, options);
    setHandler(gestureHandler);

    return () => {
      gestureHandler.destroy();
    };
  }, [ref.current, options]);

  return handler;
};
