import { ReactNode, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";
import { notification } from "@/platform/haptics";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  className?: string;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className,
}: SwipeableCardProps) => {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      setSwiping(true);
      setOffset(eventData.deltaX);
    },
    onSwipedLeft: () => {
      if (Math.abs(offset) > 100 && onSwipeLeft) {
        notification("success");
        onSwipeLeft();
      }
      setSwiping(false);
      setOffset(0);
    },
    onSwipedRight: () => {
      if (Math.abs(offset) > 100 && onSwipeRight) {
        notification("success");
        onSwipeRight();
      }
      setSwiping(false);
      setOffset(0);
    },
    onSwiped: () => {
      setSwiping(false);
      setOffset(0);
    },
    trackMouse: false,
    trackTouch: true,
    delta: 10,
  });

  return (
    <div className={cn("relative overflow-hidden touch-manipulation", className)}>
      {/* Background actions */}
      {leftAction && offset < -20 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 bg-destructive/10">
          {leftAction}
        </div>
      )}
      {rightAction && offset > 20 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 bg-success/10">
          {rightAction}
        </div>
      )}

      {/* Card content */}
      <div
        {...handlers}
        className={cn(
          "transition-transform",
          !swiping && "duration-300",
        )}
        style={{
          transform: `translateX(${offset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
