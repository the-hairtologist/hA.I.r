/**
 * Keyboard Navigation Hook
 * Enhanced keyboard navigation for lists, menus, and complex UI
 */

import { useEffect, useRef, useCallback } from 'react';

interface KeyboardNavigationOptions {
  /** Enable arrow key navigation */
  arrows?: boolean;
  /** Enable Home/End keys */
  homeEnd?: boolean;
  /** Enable letter key navigation (type ahead) */
  typeAhead?: boolean;
  /** Enable Enter/Space activation */
  activation?: boolean;
  /** Wrap around when reaching start/end */
  wrap?: boolean;
  /** Orientation for arrow keys */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Callback when item is activated */
  onActivate?: (index: number) => void;
  /** Callback when focus changes */
  onFocusChange?: (index: number) => void;
}

export const useKeyboardNavigation = (
  itemCount: number,
  options: KeyboardNavigationOptions = {}
) => {
  const {
    arrows = true,
    homeEnd = true,
    typeAhead = true,
    activation = true,
    wrap = true,
    orientation = 'vertical',
    onActivate,
    onFocusChange,
  } = options;

  const currentIndexRef = useRef<number>(0);
  const typeAheadBufferRef = useRef<string>('');
  const typeAheadTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const setCurrentIndex = useCallback(
    (index: number) => {
      if (index < 0) {
        currentIndexRef.current = wrap ? itemCount - 1 : 0;
      } else if (index >= itemCount) {
        currentIndexRef.current = wrap ? 0 : itemCount - 1;
      } else {
        currentIndexRef.current = index;
      }

      onFocusChange?.(currentIndexRef.current);
    },
    [itemCount, wrap, onFocusChange]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, itemLabels?: string[]) => {
      const { key } = event;

      // Arrow navigation
      if (arrows) {
        if (orientation === 'vertical' || orientation === 'both') {
          if (key === 'ArrowDown') {
            event.preventDefault();
            setCurrentIndex(currentIndexRef.current + 1);
            return true;
          }
          if (key === 'ArrowUp') {
            event.preventDefault();
            setCurrentIndex(currentIndexRef.current - 1);
            return true;
          }
        }

        if (orientation === 'horizontal' || orientation === 'both') {
          if (key === 'ArrowRight') {
            event.preventDefault();
            setCurrentIndex(currentIndexRef.current + 1);
            return true;
          }
          if (key === 'ArrowLeft') {
            event.preventDefault();
            setCurrentIndex(currentIndexRef.current - 1);
            return true;
          }
        }
      }

      // Home/End navigation
      if (homeEnd) {
        if (key === 'Home') {
          event.preventDefault();
          setCurrentIndex(0);
          return true;
        }
        if (key === 'End') {
          event.preventDefault();
          setCurrentIndex(itemCount - 1);
          return true;
        }
      }

      // Enter/Space activation
      if (activation && (key === 'Enter' || key === ' ')) {
        event.preventDefault();
        onActivate?.(currentIndexRef.current);
        return true;
      }

      // Type-ahead navigation
      if (typeAhead && itemLabels && key.length === 1) {
        event.preventDefault();

        // Clear previous timeout
        if (typeAheadTimeoutRef.current) {
          clearTimeout(typeAheadTimeoutRef.current);
        }

        // Add to buffer
        typeAheadBufferRef.current += key.toLowerCase();

        // Find matching item
        const currentLabel = itemLabels[currentIndexRef.current]?.toLowerCase();
        let matchIndex = -1;

        // Try to find match starting from current position
        for (let i = 0; i < itemCount; i++) {
          const index = (currentIndexRef.current + i + 1) % itemCount;
          const label = itemLabels[index]?.toLowerCase();
          if (label?.startsWith(typeAheadBufferRef.current)) {
            matchIndex = index;
            break;
          }
        }

        // If no match found starting from current, search from beginning
        if (matchIndex === -1) {
          matchIndex = itemLabels.findIndex(label =>
            label?.toLowerCase().startsWith(typeAheadBufferRef.current)
          );
        }

        if (matchIndex !== -1) {
          setCurrentIndex(matchIndex);
        }

        // Clear buffer after 500ms
        typeAheadTimeoutRef.current = setTimeout(() => {
          typeAheadBufferRef.current = '';
        }, 500);

        return true;
      }

      return false;
    },
    [
      arrows,
      homeEnd,
      typeAhead,
      activation,
      orientation,
      itemCount,
      setCurrentIndex,
      onActivate,
    ]
  );

  useEffect(() => {
    return () => {
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentIndex: currentIndexRef.current,
    setCurrentIndex,
    handleKeyDown,
  };
};
