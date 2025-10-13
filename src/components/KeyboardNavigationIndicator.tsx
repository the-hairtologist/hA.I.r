/**
 * Keyboard Navigation Indicator
 * Shows visible focus rings and keyboard hints for accessibility
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const useKeyboardNavigation = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
};

/**
 * Enhanced focus ring for keyboard navigation
 */
export const focusRingClasses = cn(
  "focus-visible:outline-none",
  "focus-visible:ring-4",
  "focus-visible:ring-primary",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-background",
  "transition-shadow",
  "duration-200"
);