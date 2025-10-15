/**
 * Swipeable Appointment Card
 * Native app-like swipe gestures for quick actions
 */

import { useSwipeable } from 'react-swipeable';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';

interface SwipeableAppointmentCardProps {
  children: React.ReactNode;
  onCall?: () => void;
  onMessage?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function SwipeableAppointmentCard({
  children,
  onCall,
  onMessage,
  onReschedule,
  onCancel,
  className,
}: SwipeableAppointmentCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [revealed, setRevealed] = useState<'left' | 'right' | null>(null);
  
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const delta = eventData.deltaX;
      
      // Limit swipe distance
      if (delta > 0 && delta < 150) {
        setSwipeOffset(delta);
      } else if (delta < 0 && delta > -150) {
        setSwipeOffset(delta);
      }
    },
    onSwiped: (eventData) => {
      haptic.tap();
      
      const delta = eventData.deltaX;
      
      // Reveal left actions (swipe right)
      if (delta > 75) {
        setRevealed('left');
        setSwipeOffset(120);
      }
      // Reveal right actions (swipe left)
      else if (delta < -75) {
        setRevealed('right');
        setSwipeOffset(-120);
      }
      // Reset
      else {
        setRevealed(null);
        setSwipeOffset(0);
      }
    },
    trackMouse: false,
    trackTouch: true,
  });
  
  const resetSwipe = () => {
    setRevealed(null);
    setSwipeOffset(0);
  };
  
  const handleAction = (action?: () => void) => {
    if (action) {
      haptic.success();
      action();
      resetSwipe();
    }
  };
  
  return (
    <div className="relative overflow-hidden">
      {/* Left actions (green - positive actions) */}
      {revealed === 'left' && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center gap-2 pl-4 bg-gradient-to-r from-green-500 to-green-600 text-white animate-fade-in">
          {onCall && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleAction(onCall)}
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          {onMessage && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleAction(onMessage)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      {/* Right actions (red/yellow - destructive/caution actions) */}
      {revealed === 'right' && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4 bg-gradient-to-l from-red-500 to-orange-500 text-white animate-fade-in">
          {onReschedule && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleAction(onReschedule)}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          )}
          {onCancel && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleAction(onCancel)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      {/* Main card content */}
      <div
        {...handlers}
        className={cn(
          'transition-transform duration-200 ease-out',
          className
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        onClick={() => {
          if (revealed) {
            resetSwipe();
          }
        }}
      >
        <Card className="cursor-grab active:cursor-grabbing">
          {children}
        </Card>
      </div>
    </div>
  );
}
