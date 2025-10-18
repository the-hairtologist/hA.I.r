/**
 * Viewport Change Handler
 * Prevents errors and re-renders issues when switching between viewports
 */

import { useEffect } from 'react';

export const ViewportChangeHandler = () => {
  useEffect(() => {
    // Wrap everything in try-catch to prevent crashes
    try {
      // Set CSS custom property for true viewport height (handles mobile browser bars)
      const setVH = () => {
        try {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        } catch (error) {
          console.warn('Failed to set viewport height:', error);
        }
      };

      // Set initial value
      setVH();

      // Update on resize with debounce
      let timeoutId: number | undefined;
      const handleResize = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(setVH, 150);
      };

      window.addEventListener('resize', handleResize, { passive: true });
      window.addEventListener('orientationchange', setVH, { passive: true });

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', setVH);
        if (timeoutId) clearTimeout(timeoutId);
      };
    } catch (error) {
      console.warn('ViewportChangeHandler initialization failed:', error);
    }
  }, []);

  return null;
};
