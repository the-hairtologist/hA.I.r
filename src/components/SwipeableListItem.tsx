/**
 * Swipeable List Item
 * iOS/Android-style swipe actions
 */

import { ReactNode, useRef, useState, TouchEvent } from "react";
import { Trash2, Edit, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: "destructive" | "success" | "primary";
  onTap: () => void;
}

interface SwipeableListItemProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 80; // pixels to trigger action
const MAX_SWIPE = 120; // maximum swipe distance

export function SwipeableListItem({
  children,
  leftAction,
  rightAction,
  className,
  disabled = false,
}: SwipeableListItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || !swiping) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Constrain swipe
    const constrainedDiff = Math.max(
      -MAX_SWIPE,
      Math.min(MAX_SWIPE, diff)
    );
    
    setSwipeX(constrainedDiff);

    // Haptic feedback at threshold
    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      haptic.tap();
    }
  };

  const handleTouchEnd = async () => {
    if (disabled) return;
    setSwiping(false);

    // Trigger action if past threshold
    if (swipeX <= -SWIPE_THRESHOLD && rightAction) {
      await haptic.success();
      rightAction.onTap();
    } else if (swipeX >= SWIPE_THRESHOLD && leftAction) {
      await haptic.success();
      leftAction.onTap();
    }

    // Reset
    setSwipeX(0);
  };

  const getActionColor = (color: SwipeAction["color"]) => {
    switch (color) {
      case "destructive":
        return "bg-destructive text-destructive-foreground";
      case "success":
        return "bg-success text-success-foreground";
      case "primary":
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left Action */}
      {leftAction && (
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-start px-6 transition-opacity",
            getActionColor(leftAction.color),
            swipeX > 0 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: Math.max(0, swipeX) }}
        >
          <div className="flex items-center gap-2">
            {leftAction.icon}
            {swipeX >= SWIPE_THRESHOLD && (
              <span className="text-sm font-bold animate-fade-in">
                {leftAction.label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Right Action */}
      {rightAction && (
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end px-6 transition-opacity",
            getActionColor(rightAction.color),
            swipeX < 0 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: Math.max(0, -swipeX) }}
        >
          <div className="flex items-center gap-2">
            {swipeX <= -SWIPE_THRESHOLD && (
              <span className="text-sm font-bold animate-fade-in">
                {rightAction.label}
              </span>
            )}
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className="relative bg-background touch-pan-y"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Pre-configured action sets for common use cases
export const swipeActions = {
  delete: (onDelete: () => void): SwipeAction => ({
    icon: <Trash2 className="h-5 w-5" />,
    label: "Delete",
    color: "destructive",
    onTap: onDelete,
  }),
  edit: (onEdit: () => void): SwipeAction => ({
    icon: <Edit className="h-5 w-5" />,
    label: "Edit",
    color: "primary",
    onTap: onEdit,
  }),
  complete: (onComplete: () => void): SwipeAction => ({
    icon: <CheckCircle className="h-5 w-5" />,
    label: "Complete",
    color: "success",
    onTap: onComplete,
  }),
};
