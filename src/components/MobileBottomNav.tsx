import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Home,
  Calendar,
  MessageSquare,
  User,
  Users,
  Sparkles,
  Shield,
  Activity,
  CalendarCheck,
  Settings,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';
import { NotificationDot } from './NotificationDot';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { logger } from '@/lib/logging/productionLogger';
import { prefetchOnHover } from '@/lib/performance/ResourceHints';
import { MoreMenu } from './MoreMenu';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  gradient: string;
  highlight: boolean;
  badge?: number;
  disabled?: boolean;
}

// Extract NavButton to fix React Hooks rules violation
const NavButton = ({
  item,
  isActive,
  isAdmin,
  handleNavigation,
}: {
  item: NavItem;
  isActive: (path: string) => boolean;
  isAdmin: boolean;
  handleNavigation: (path: string) => void;
}) => {
  const Icon = item.icon;
  const active = isActive(item.path);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonRef.current || item.disabled) return;
    return prefetchOnHover(buttonRef.current, item.path);
  }, [item.path, item.disabled]);

  return (
    <button
      ref={buttonRef}
      onClick={() => !item.disabled && handleNavigation(item.path)}
      disabled={item.disabled}
      className={cn(
        'relative flex flex-col items-center justify-center flex-1',
        'min-w-[60px] min-h-[60px] gap-0.5',
        'transition-all duration-200 ease-out',
        'active:scale-95',
        'touch-manipulation',
        active && 'text-primary',
        item.disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={`Navigate to ${item.label}`}
      aria-current={active ? 'page' : undefined}
    >
      {/* Background glow effect for active item */}
      {active && (
        <div
          className={cn(
            'absolute inset-0 rounded-2xl',
            'bg-gradient-to-br',
            item.gradient,
            isAdmin ? 'opacity-30' : 'opacity-20'
          )}
          aria-hidden="true"
        />
      )}

      {/* Icon container */}
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl',
            'transition-all duration-200',
            'retro-nav-icon-container',
            item.highlight &&
              !active && [
                'w-12 h-12',
                'bg-gradient-to-br from-primary/10 to-secondary/10',
                'ring-1 ring-primary/20',
              ],
            !item.highlight && 'w-11 h-11',
            active && [
              'bg-gradient-to-br',
              item.gradient,
              'shadow-lg',
              'active',
              item.highlight ? 'scale-115' : 'scale-110',
            ],
            !active && !item.highlight && 'hover:bg-accent/50'
          )}
        >
          <Icon
            className={cn(
              'h-6 w-6 transition-all duration-200',
              active ? 'text-on-surface-primary' : 'text-muted-foreground',
              item.highlight && !active && 'text-primary/60'
            )}
            aria-hidden="true"
          />
        </div>

        {/* Notification badge */}
        {item.badge !== undefined && item.badge > 0 && (
          <NotificationDot
            count={item.badge}
            size="sm"
            className="absolute -top-1 -right-1"
          />
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          'text-xs font-sans font-medium transition-all duration-200 truncate max-w-[60px] sm:max-w-[70px]',
          active ? 'text-primary scale-105' : 'text-muted-foreground'
        )}
      >
        {item.label}
      </span>

      {/* Active indicator line */}
      {active && (
        <div
          className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2',
            'h-2 w-12 rounded-t-full',
            'bg-gradient-to-r',
            item.gradient,
            'animate-fade-in shadow-lg'
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isStylist, isClient } = useEnhancedAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const userRole = isAdmin ? 'admin' : isStylist ? 'stylist' : 'client';

  const stylistItems: NavItem[] = [
    {
      icon: Calendar,
      label: 'Appointments',
      path: '/appointments',
      gradient: 'from-cyan-start to-cyan-end',
      highlight: false,
    },
    {
      icon: Users,
      label: 'Clients',
      path: '/clients',
      gradient: 'from-green-start to-green-end',
      highlight: false,
    },
    {
      icon: Home,
      label: 'Home',
      path: '/dashboard',
      gradient: 'from-purple-start to-purple-end',
      highlight: true,
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      path: '/messages',
      gradient: 'from-pink-start to-pink-end',
      badge: unreadCount,
      highlight: false,
    },
    {
      icon: LayoutGrid,
      label: 'More',
      path: '#more',
      gradient: 'from-blue-start to-blue-end',
      highlight: false,
    },
  ];

  const clientItems: NavItem[] = [
    {
      icon: Home,
      label: 'Home',
      path: '/dashboard',
      gradient: 'from-purple-start to-purple-end',
      highlight: false,
    },
    {
      icon: Plus,
      label: 'Book Now',
      path: '/book-appointment',
      gradient: 'from-emerald-start to-emerald-end',
      highlight: true,
    },
    {
      icon: CalendarCheck,
      label: 'Appointments',
      path: '/appointments',
      gradient: 'from-cyan-start to-cyan-end',
      highlight: false,
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      path: '/messages',
      gradient: 'from-pink-start to-pink-end',
      badge: unreadCount,
      highlight: false,
    },
    {
      icon: LayoutGrid,
      label: 'More',
      path: '#more',
      gradient: 'from-blue-start to-blue-end',
      highlight: false,
    },
  ];

  const adminItems: NavItem[] = [
    {
      icon: Users,
      label: 'Users',
      path: '/admin/users',
      gradient: 'from-cyan-start to-cyan-end',
      highlight: false,
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      path: '/messages',
      gradient: 'from-pink-start to-pink-end',
      badge: unreadCount,
      highlight: false,
    },
    {
      icon: Shield,
      label: 'Admin Hub',
      path: '/admin/command',
      gradient: 'from-amber-start to-amber-end',
      highlight: true,
    },
    {
      icon: LayoutGrid,
      label: 'More',
      path: '#more',
      gradient: 'from-blue-start to-blue-end',
      highlight: false,
    },
  ];

  const effectiveRole = isAdmin ? 'admin' : userRole;
  const storageKey = `mobileNav-${effectiveRole}`;
  const [customizedItems, setCustomizedItems] = useState<NavItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const allItems = isAdmin
    ? adminItems
    : userRole === 'stylist'
      ? stylistItems
      : clientItems;

  useEffect(() => {
    setMounted(true);

    if (userRole === 'client') {
      setCustomizedItems(clientItems);
      return;
    }

    const savedConfig = localStorage.getItem(storageKey);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        const { order, enabledIds } = config;

        if (order && enabledIds) {
          const idToItemMap = new Map(
            allItems.map(item => {
              const id = item.path.split('/').pop() || item.label.toLowerCase();
              return [id, item];
            })
          );

          const orderedItems = order
            .filter((id: string) => enabledIds.includes(id))
            .map((id: string) => idToItemMap.get(id))
            .filter(Boolean);

          if (orderedItems.length > 0) {
            setCustomizedItems(orderedItems as NavItem[]);
            return;
          }
        }
      } catch (e) {
        logger.error('Failed to load mobile nav config', e, {
          context: 'MobileBottomNav',
        });
      }
    }

    setCustomizedItems(allItems);
  }, [userRole]);

  const items =
    mounted && customizedItems.length > 0 ? customizedItems : allItems;

  const handleNavigation = (path: string) => {
    // Handle "More" menu trigger
    if (path === '#more') {
      haptic.tap();
      setMoreMenuOpen(true);
      return;
    }

    haptic.tap();
    navigate(path);
  };

  // Get paths that are in bottom nav to exclude from More menu
  const excludePaths = items
    .map(item => item.path)
    .filter(path => path !== '#more');

  return (
    <>
      <MoreMenu
        open={moreMenuOpen}
        onOpenChange={setMoreMenuOpen}
        excludePaths={excludePaths}
      />

      <div className="lg:hidden flex-shrink-0 h-16" aria-hidden="true" />
      <nav
        className={cn(
          'lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md brutal-shadow-top',
          'brutal-border-t',
          isAdmin
            ? 'border-t-amber-500 bg-gradient-to-r from-amber-500/5 to-amber-600/5'
            : 'border-foreground'
        )}
        aria-label="Mobile navigation"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {isAdmin && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse-subtle" />
        )}
        <div className="flex justify-evenly items-stretch h-16 px-3">
          {items.map(item => (
            <NavButton
              key={item.path}
              item={item}
              isActive={isActive}
              isAdmin={isAdmin}
              handleNavigation={handleNavigation}
            />
          ))}
        </div>
      </nav>
    </>
  );
};
