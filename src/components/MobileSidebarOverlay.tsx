import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export const MobileSidebarOverlay = () => {
  const { openMobile, setOpenMobile } = useSidebar();
  const isOpen = openMobile;
  const previousOverflow = useRef<string>('');
  const previousTouchAction = useRef<string>('');

  useEffect(() => {
    // Only apply scroll lock on mobile devices
    const isMobile = window.innerWidth < 768;
    
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

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "md:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm",
        "animate-fade-in touch-manipulation"
      )}
      onClick={() => setOpenMobile(false)}
      aria-label="Close navigation menu"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          setOpenMobile(false);
        }
      }}
    />
  );
};
