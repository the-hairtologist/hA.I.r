import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Scissors, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';
import { useSidebar } from '@/components/ui/sidebar';
import { NotificationDot } from './NotificationDot';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';

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
        'lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-md',
        'transition-all duration-300 ease-out',
        scrolled && 'border-b-[3px] border-foreground shadow-brutal-sm'
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className={cn('flex items-center justify-between px-4 h-16')}>
        {/* Left: Menu button - opens command palette */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            haptic.tap();
            window.dispatchEvent(new CustomEvent('open-command-palette'));
          }}
          className={cn(
            'min-w-[44px] min-h-[44px] touch-manipulation relative group',
            'hover:bg-primary/10 active:scale-95 transition-all'
          )}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 group-hover:text-primary transition-colors" />
          {/* Indicator dot to show "more menu available" */}
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/60 animate-pulse" />
        </Button>

        {/* Center: Logo */}
        <button
          onClick={() => {
            haptic.tap();
            navigate('/dashboard');
          }}
          className={cn(
            'flex items-center gap-2 transition-all duration-200 touch-manipulation',
            'hover:opacity-80 active:scale-95'
          )}
          aria-label="Go to dashboard"
        >
          <Scissors className="h-6 w-6 text-primary" />
          <h1 className={cn(mobileFirst.text.lg, "font-bold font-pixel bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent")}>
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
              navigate('/notifications');
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
    </header>
  );
};
