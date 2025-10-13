/**
 * First-Time Tooltip Component
 * Shows helpful tooltips on first visit to guide new users
 * Uses localStorage to track which tooltips have been seen
 */

import { useState, useEffect, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FirstTimeTooltipProps {
  id: string; // Unique identifier for this tooltip
  children: ReactNode; // Element to attach tooltip to
  content: string; // Tooltip message
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayMs?: number; // Delay before showing tooltip
}

export const FirstTimeTooltip = ({
  id,
  children,
  content,
  side = "right",
  align = "center",
  delayMs = 500,
}: FirstTimeTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen this tooltip before
    try {
      const seenTooltips = JSON.parse(localStorage.getItem("seenTooltips") || "{}");
      
      if (!seenTooltips[id]) {
        // Show tooltip after delay
        const timer = setTimeout(() => {
          setIsVisible(true);
          setIsOpen(true);
        }, delayMs);

        return () => clearTimeout(timer);
      }
    } catch (error) {
      // If localStorage is unavailable or JSON parsing fails, don't show tooltip
      console.warn("FirstTimeTooltip: localStorage error", error);
    }
  }, [id, delayMs]);

  const handleDismiss = () => {
    setIsOpen(false);
    setIsVisible(false);
    
    // Mark tooltip as seen
    try {
      const seenTooltips = JSON.parse(localStorage.getItem("seenTooltips") || "{}");
      seenTooltips[id] = true;
      localStorage.setItem("seenTooltips", JSON.stringify(seenTooltips));
    } catch (error) {
      // If localStorage write fails (quota exceeded, etc.), gracefully fail
      console.warn("FirstTimeTooltip: Failed to save to localStorage", error);
    }
  };

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className="max-w-xs p-4 border-2 border-foreground shadow-brutal bg-yellow-300 text-foreground animate-fade-in"
          sideOffset={8}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium leading-relaxed">{content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-foreground/10 flex-shrink-0"
              aria-label="Dismiss tip"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Reset all seen tooltips (useful for testing or user request)
 */
export const resetAllTooltips = () => {
  try {
    localStorage.removeItem("seenTooltips");
  } catch (error) {
    console.warn("FirstTimeTooltip: Failed to reset tooltips", error);
  }
};