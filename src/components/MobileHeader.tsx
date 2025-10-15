import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Scissors, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";
import { useSidebar } from "@/components/ui/sidebar";
import { NotificationDot } from "./NotificationDot";

interface MobileHeaderProps {
  notificationCount?: number;
}

export const MobileHeader = ({ notificationCount = 0 }: MobileHeaderProps) => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [scrolled, setScrolled] = useState(false);

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
    toggleSidebar();
  };

  return (
    <header 
      className={cn(
        "lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-md",
        "transition-all duration-300 ease-out",
        scrolled && "border-b-2 border-foreground shadow-lg"
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}
    >
      <div 
        className={cn(
          "flex items-center justify-between px-4 transition-all duration-300",
          scrolled ? "h-14" : "h-16"
        )}
      >
        {/* Left: Menu button with "More" indicator */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuClick}
          className={cn(
            "min-w-[44px] min-h-[44px] touch-manipulation",
            "relative group hover:bg-primary/10 transition-all duration-200"
          )}
          aria-label="Open full navigation menu - More options available"
        >
          <div className="relative">
            <Menu className="h-6 w-6 group-hover:text-primary transition-colors" />
            {/* "More" indicator - small badge showing there's more in the menu */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" 
                 title="More menu items available" 
                 aria-hidden="true" />
          </div>
          {/* Subtle pulse background for discoverability */}
          <div className="absolute inset-0 rounded-md bg-primary/5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>

        {/* Center: Logo */}
        <button 
          onClick={() => {
            haptic.tap();
            navigate("/dashboard");
          }}
          className={cn(
            "flex items-center gap-2 transition-all duration-300 touch-manipulation",
            "hover:opacity-80 active:scale-95",
            scrolled && "scale-90"
          )}
          aria-label="Go to dashboard"
        >
          <Scissors className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold font-display bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            hA.I.r
          </h1>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Search button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              haptic.tap();
              window.dispatchEvent(new CustomEvent('global-search-focus'));
            }}
            className="min-w-[44px] min-h-[44px] touch-manipulation"
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
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
            <Bell className="h-5 w-5" />
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
    </header>
  );
};
