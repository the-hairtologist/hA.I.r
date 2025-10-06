import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export responsive system for easy access
export { responsiveBestPractices as rsp } from './responsiveSystem';
export * from './responsiveSystem';
