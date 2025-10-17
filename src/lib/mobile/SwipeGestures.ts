/**
 * Phase 3: Swipe Gesture System
 * Native-like swipe navigation for mobile
 */

type SwipeDirection = 'left' | 'right' | 'up' | 'down';
type SwipeHandler = (direction: SwipeDirection, distance: number) => void;

interface SwipeConfig {
  threshold?: number; // Minimum distance for swipe (px)
  timeout?: number; // Maximum time for swipe (ms)
  preventScroll?: boolean;
}

export class SwipeGestureHandler {
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private element: HTMLElement;
  private config: Required<SwipeConfig>;
  private handler: SwipeHandler;
  private isTracking: boolean = false;

  constructor(
    element: HTMLElement,
    handler: SwipeHandler,
    config: SwipeConfig = {}
  ) {
    this.element = element;
    this.handler = handler;
    this.config = {
      threshold: config.threshold || 50,
      timeout: config.timeout || 300,
      preventScroll: config.preventScroll ?? false,
    };

    this.init();
  }

  private init() {
    this.element.addEventListener('touchstart', this.onTouchStart, { passive: !this.config.preventScroll });
    this.element.addEventListener('touchend', this.onTouchEnd, { passive: true });
    this.element.addEventListener('touchcancel', this.onTouchCancel, { passive: true });
  }

  private onTouchStart = (e: TouchEvent) => {
    this.isTracking = true;
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    this.startTime = Date.now();

    if (this.config.preventScroll) {
      e.preventDefault();
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (!this.isTracking) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const duration = endTime - this.startTime;

    // Check if swipe is within timeout
    if (duration > this.config.timeout) {
      this.isTracking = false;
      return;
    }

    // Determine swipe direction
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Swipe must exceed threshold
    if (absX < this.config.threshold && absY < this.config.threshold) {
      this.isTracking = false;
      return;
    }

    let direction: SwipeDirection;
    let distance: number;

    if (absX > absY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'right' : 'left';
      distance = absX;
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'down' : 'up';
      distance = absY;
    }

    this.handler(direction, distance);
    this.isTracking = false;
  };

  private onTouchCancel = () => {
    this.isTracking = false;
  };

  public destroy() {
    this.element.removeEventListener('touchstart', this.onTouchStart);
    this.element.removeEventListener('touchend', this.onTouchEnd);
    this.element.removeEventListener('touchcancel', this.onTouchCancel);
  }
}

/**
 * Hook for swipe gestures in React
 */
import { useEffect, useRef } from 'react';

export function useSwipeGesture(
  handler: SwipeHandler,
  config?: SwipeConfig
) {
  const ref = useRef<HTMLElement>(null);
  const swipeHandler = useRef<SwipeGestureHandler | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    swipeHandler.current = new SwipeGestureHandler(ref.current, handler, config);

    return () => {
      swipeHandler.current?.destroy();
    };
  }, [handler, config]);

  return ref;
}

/**
 * Predefined swipe actions
 */
export const swipeActions = {
  // Swipe from left edge to open sidebar
  openSidebar: (callback: () => void) => ({
    threshold: 80,
    handler: (direction: SwipeDirection, distance: number) => {
      if (direction === 'right' && distance > 80) {
        callback();
      }
    },
  }),

  // Swipe right to go back
  goBack: (callback: () => void) => ({
    threshold: 100,
    handler: (direction: SwipeDirection, distance: number) => {
      if (direction === 'right' && distance > 100) {
        callback();
      }
    },
  }),

  // Pull down to refresh
  pullToRefresh: (callback: () => void) => ({
    threshold: 80,
    handler: (direction: SwipeDirection, distance: number) => {
      if (direction === 'down' && distance > 80) {
        callback();
      }
    },
  }),

  // Swipe to dismiss
  dismissCard: (callback: (direction: 'left' | 'right') => void) => ({
    threshold: 120,
    handler: (direction: SwipeDirection, distance: number) => {
      if ((direction === 'left' || direction === 'right') && distance > 120) {
        callback(direction);
      }
    },
  }),
};
