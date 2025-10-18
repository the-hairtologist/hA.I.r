/**
 * Viewport Change Handler
 * Prevents errors and re-renders issues when switching between viewports
 */

import { useEffect } from 'react';

export const ViewportChangeHandler = () => {
  useEffect(() => {
    // Set CSS custom property for true viewport height (handles mobile browser bars)
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setVH();

    // Update on resize with debounce
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(setVH, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', setVH);
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
};
