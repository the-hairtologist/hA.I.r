import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export unified responsive system
export { 
  responsive,
  responsiveBestPractices,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  BREAKPOINTS,
} from './responsive';
