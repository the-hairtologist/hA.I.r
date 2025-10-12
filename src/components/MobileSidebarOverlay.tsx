import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export const MobileSidebarOverlay = () => {
  const { state, setOpenMobile } = useSidebar();
  const isOpen = state === "expanded";

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
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
