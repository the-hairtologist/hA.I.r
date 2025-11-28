import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export const MobileSidebarOverlay = () => {
  const { openMobile, setOpenMobile } = useSidebar();
  const isOpen = openMobile;
  const previousOverflow = useRef<string>('');
  const previousTouchAction = useRef<string>('');
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    // Only apply scroll lock on mobile/tablet devices (< 1024px)
    const isMobile = window.innerWidth < 1024;

    if (!isMobile) return;

    if (isOpen) {
      // Store previous values
      previousOverflow.current = document.body.style.overflow;
      previousTouchAction.current = document.body.style.touchAction;

      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      // Restore previous values or reset
      document.body.style.overflow = previousOverflow.current || '';
      document.body.style.touchAction = previousTouchAction.current || '';
    }

    // Cleanup function to ensure we always restore scroll
    return () => {
      if (isMobile) {
        document.body.style.overflow = previousOverflow.current || '';
        document.body.style.touchAction = previousTouchAction.current || '';
      }
    };
  }, [isOpen]);

  // Failsafe: Restore scroll on component unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  // Handle swipe-to-close gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchStart(touch.clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0]?.clientX;
    if (touchEnd === undefined) return;

    const swipeDistance = touchStart - touchEnd;

    // If user swipes right-to-left more than 50px, close sidebar
    if (swipeDistance > 50) {
      setOpenMobile(false);
    }

    setTouchStart(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm',
        'animate-fade-in touch-manipulation'
      )}
      onClick={() => setOpenMobile(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Close navigation menu"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          setOpenMobile(false);
        }
      }}
    />
  );
};
