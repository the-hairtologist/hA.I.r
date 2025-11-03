/**
 * Mobile Bottom Navigation
 * Thumb-zone optimized navigation for mobile devices
 */

import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  roles: ('stylist' | 'client' | 'admin')[];
}

const navItems: NavItem[] = [
  {
    icon: Home,
    label: 'Home',
    path: '/dashboard',
    roles: ['stylist', 'client', 'admin'],
  },
  {
    icon: Users,
    label: 'Clients',
    path: '/clients',
    roles: ['stylist', 'admin'],
  },
  {
    icon: Calendar,
    label: 'Schedule',
    path: '/appointments',
    roles: ['stylist', 'client', 'admin'],
  },
  {
    icon: Sparkles,
    label: 'AI',
    path: '/ai-assistant',
    roles: ['stylist', 'admin'],
  },
  {
    icon: User,
    label: 'Profile',
    path: '/profile',
    roles: ['stylist', 'client', 'admin'],
  },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { isAdmin, isStylist } = useEnhancedAuth();
  
  const userRole = isAdmin ? 'admin' : isStylist ? 'stylist' : 'client';
  
  // Filter items based on user role
  const visibleItems = navItems.filter(item => item.roles.includes(userRole));

  const handleNavClick = () => {
    haptic.tap();
  };

  return (
    <nav
      className={cn(
        // Fixed positioning - always visible at bottom
        'fixed bottom-0 left-0 right-0 z-50',
        // Mobile only - hide on desktop
        'lg:hidden',
        // Layout
        'h-16 flex items-center justify-around',
        // Styling
        'bg-background/95 backdrop-blur-sm',
        'border-t border-border',
        // Safe area for iOS
        'pb-safe',
        // Shadow for depth
        'shadow-brutal-sm'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {visibleItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || 
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={cn(
              // Touch target - WCAG 2.2 AAA (60x60px)
              'flex flex-col items-center justify-center',
              'min-w-[60px] min-h-[60px]',
              // Spacing
              'gap-1',
              // Interactive states
              'active:scale-95',
              'transition-all duration-200',
              // Accessibility
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'relative'
            )}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Icon */}
            <Icon
              className={cn(
                'h-6 w-6 transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              strokeWidth={isActive ? 2.5 : 2}
            />
            
            {/* Label */}
            <span
              className={cn(
                'text-[10px] font-medium transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </span>

            {/* Active indicator */}
            {isActive && (
              <div
                className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                aria-hidden="true"
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * Utility component to add bottom padding to pages with mobile nav
 */
export function MobileBottomNavSpacer() {
  return <div className="h-20 lg:hidden" aria-hidden="true" />;
}
