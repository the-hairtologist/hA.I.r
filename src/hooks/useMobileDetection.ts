/**
 * Mobile Detection Hook
 * Detects mobile devices and provides device-specific information
 */

import { useState, useEffect } from 'react';

interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
}

export const useMobileDetection = (): MobileInfo => {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isTablet: false,
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
    orientation: 'portrait',
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
      const isTablet = /(tablet|ipad)/.test(userAgent) || 
                       (isAndroid && !/mobile/.test(userAgent));

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';

      setMobileInfo({
        isMobile,
        isTablet,
        isIOS,
        isAndroid,
        isTouchDevice,
        orientation,
        screenWidth,
        screenHeight,
      });
    };

    checkDevice();

    // Update on resize or orientation change
    const handleResize = () => checkDevice();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return mobileInfo;
};

/**
 * Hook to detect if viewport is below a breakpoint
 */
export const useBreakpoint = (breakpoint: number = 768) => {
  const [isBelow, setIsBelow] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      setIsBelow(window.innerWidth < breakpoint);
    };

    checkBreakpoint();

    const handleResize = () => checkBreakpoint();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isBelow;
};
