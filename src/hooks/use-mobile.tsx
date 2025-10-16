/**
 * Simple mobile detection hook for Shadcn sidebar component.
 * 
 * Note: For more advanced responsive features, consider using useResponsive hook which provides:
 * - Touch device detection
 * - Orientation tracking  
 * - Pixel ratio information
 * - Multiple breakpoint checks
 * 
 * This hook is kept for backward compatibility with Shadcn UI sidebar component.
 */

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
