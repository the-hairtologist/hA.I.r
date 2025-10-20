import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Scissors, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";
import { NotificationDot } from "./NotificationDot";
import { MobileDrawer } from "./MobileDrawer";

interface MobileHeaderProps {
  notificationCount?: number;
}

export const MobileHeader = ({ notificationCount = 0 }: MobileHeaderProps) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrolled(currentScrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuClick = () => {
    haptic.tap();
    setIsDrawerOpen(true);
  };

  return (
    <header 
      className={cn(
        "lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-md",
        "transition-all duration-300 ease-out",
        scrolled && "border-b-[3px] border-foreground shadow-brutal-sm"
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}
    >
      <div 
        className={cn(
          "flex items-center justify-between px-4 h-16"
        )}
      >
        {/* Left: Menu button with "More" indicator - ENHANCED for better discoverability */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuClick}
          className={cn(
            "min-w-[48px] min-h-[48px] touch-manipulation",
            "relative group hover:bg-primary/10 transition-all duration-200",
            "ring-1 ring-primary/20 hover:ring-primary/40"
          )}
          aria-label="Open full navigation menu - More options available"
        >
          <div className="relative">
            <Menu className="h-7 w-7 group-hover:text-primary transition-colors" strokeWidth={2.5} />
            {/* "More" indicator - enhanced visibility */}
            <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg" 
                 title="More menu items available" 
                 aria-hidden="true" />
          </div>
          {/* Enhanced pulse background */}
          <div className="absolute inset-0 rounded-md bg-primary/10 animate-pulse opacity-50 group-hover:opacity-100 transition-opacity" />
        </Button>

        {/* Center: Logo */}
        <button 
          onClick={() => {
            haptic.tap();
            navigate("/dashboard");
          }}
          className={cn(
            "flex items-center gap-2 transition-all duration-200 touch-manipulation",
            "hover:opacity-80 active:scale-95"
          )}
          aria-label="Go to dashboard"
        >
          <Scissors className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold font-pixel bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            hA.I.r
          </h1>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Command Palette / Quick Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              haptic.tap();
              window.dispatchEvent(new CustomEvent('open-command-palette'));
            }}
            className="min-w-[44px] min-h-[44px] touch-manipulation relative group"
            aria-label="Quick search and actions"
          >
            <Search className="h-6 w-6 group-hover:text-primary transition-colors" />
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/60 animate-pulse" />
          </Button>

          {/* Notifications button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              haptic.tap();
              navigate("/notifications");
            }}
            className="relative min-w-[44px] min-h-[44px] touch-manipulation"
            aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
          >
            <Bell className="h-6 w-6" />
            {notificationCount > 0 && (
              <NotificationDot 
                count={notificationCount} 
                size="sm"
                className="absolute top-1 right-1"
              />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
};
