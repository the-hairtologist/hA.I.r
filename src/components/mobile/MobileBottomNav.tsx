/**
 * Mobile Bottom Navigation
 * Thumb-zone optimized navigation for mobile devices
 */

import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Calendar, Sparkles, User, MoreHorizontal, Search, Settings,
  MessageCircle, DollarSign, Beaker, Clock, Plus, BookOpen, Crown,
  TrendingUp, Activity, Bell, Shield, HelpCircle, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { 
  stylistNavigationItems, 
  clientNavigationItems, 
  getAdminNavigationItems,
  type NavigationItem
} from '@/config/navigationConfig';

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
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isStylist } = useEnhancedAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const userRole = isAdmin ? 'admin' : isStylist ? 'stylist' : 'client';
  
  // Filter items based on user role
  const visibleItems = navItems.filter(item => item.roles.includes(userRole));

  const handleNavClick = () => {
    haptic.tap();
  };

  const handleMoreClick = () => {
    haptic.tap();
    setIsDrawerOpen(true);
  };

  const handleQuickAction = (path: string) => {
    haptic.tap();
    setIsDrawerOpen(false);
    if (path === 'search') {
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    } else {
      navigate(path);
    }
  };

  const handleFeatureClick = (path: string) => {
    haptic.tap();
    setIsDrawerOpen(false);
    navigate(path);
  };

  // Get navigation items based on role
  const allNavItems = userRole === 'admin' 
    ? [...stylistNavigationItems, ...getAdminNavigationItems(true)]
    : userRole === 'stylist' 
    ? stylistNavigationItems
    : clientNavigationItems;

  // Flatten nested items (expand Business and Growth children)
  const flattenedItems = allNavItems.reduce<NavigationItem[]>((acc, item) => {
    if (item.children) {
      return [...acc, ...item.children];
    }
    return [...acc, item];
  }, []);

  // Filter out coming soon items
  const availableItems = flattenedItems.filter(item => !item.comingSoon);

  // Role-specific quick actions (6 items)
  const quickActions = userRole === 'stylist' ? [
    { path: 'search', icon: Search, label: 'Search', description: 'Find anything' },
    { path: '/formulas', icon: Beaker, label: 'Quick Formula', description: 'Create formulas' },
    { path: '/support-chat', icon: MessageCircle, label: 'AI Support', description: '24/7 help' },
    { path: '/appointments', icon: Calendar, label: "Today's Schedule", description: 'View bookings' },
    { path: '/ai-assistant', icon: Sparkles, label: 'AI Assistant', description: 'Smart chat' },
    { path: '/finance', icon: DollarSign, label: 'Finance', description: 'Money overview' },
  ] : userRole === 'client' ? [
    { path: 'search', icon: Search, label: 'Search', description: 'Find anything' },
    { path: '/book-appointment', icon: Plus, label: 'Book Now', description: 'Schedule service' },
    { path: '/appointments', icon: Calendar, label: 'My Bookings', description: 'View appointments' },
    { path: '/messages', icon: MessageSquare, label: 'Messages', description: 'Chat with stylist' },
    { path: '/profile', icon: User, label: 'Profile', description: 'Your account' },
    { path: '/settings', icon: Settings, label: 'Settings', description: 'Preferences' },
  ] : [ // admin
    { path: 'search', icon: Search, label: 'Search', description: 'Find anything' },
    { path: '/admin/command', icon: Crown, label: 'Command Center', description: 'Full control' },
    { path: '/admin/users', icon: Users, label: 'Users', description: 'User management' },
    { path: '/admin/revenue', icon: TrendingUp, label: 'Revenue', description: 'Financial data' },
    { path: '/system-health', icon: Activity, label: 'System Health', description: 'Monitor platform' },
    { path: '/settings', icon: Settings, label: 'Settings', description: 'Preferences' },
  ];

  // Pinned items (high-priority features)
  const pinnedItems = userRole === 'stylist' ? [
    availableItems.find(item => item.id === 'formulas'),
    availableItems.find(item => item.id === 'support-chat'),
    availableItems.find(item => item.id === 'calendar'),
  ].filter(Boolean) as NavigationItem[] : userRole === 'client' ? [
    availableItems.find(item => item.id === 'book-appointment'),
    availableItems.find(item => item.id === 'support-chat'),
  ].filter(Boolean) as NavigationItem[] : [];

  // Group items by category
  const groupedFeatures = userRole === 'stylist' ? {
    'scheduling': availableItems.filter(item => item.group === 'scheduling' || item.id === 'calendar'),
    'business': availableItems.filter(item => item.group === 'business' || item.id === 'clients' || item.id === 'messages' || item.id === 'sales'),
    'growth': availableItems.filter(item => item.group === 'growth'),
    'tools': availableItems.filter(item => item.group === 'tools' || item.id === 'dashboard'),
  } : userRole === 'client' ? {
    'bookings': availableItems.filter(item => item.id === 'my-appointments' || item.id === 'messages'),
    'info': availableItems.filter(item => item.group === 'info' || item.id === 'my-formulas'),
    'account': availableItems.filter(item => item.group === 'account'),
  } : { // admin
    'admin': availableItems.filter(item => item.group === 'admin'),
    'tools': availableItems.filter(item => item.group === 'tools' || item.id === 'dashboard'),
  };

  // Group labels
  const groupLabels: Record<string, { title: string; icon: any }> = {
    'scheduling': { title: 'Scheduling', icon: Calendar },
    'business': { title: 'Client Management', icon: Users },
    'growth': { title: 'Growth & Marketing', icon: TrendingUp },
    'tools': { title: 'Tools', icon: Settings },
    'bookings': { title: 'My Bookings', icon: Calendar },
    'info': { title: 'My Hair', icon: Beaker },
    'account': { title: 'Account', icon: User },
    'admin': { title: 'Admin Controls', icon: Crown },
  };

  return (
    <>
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

      {/* More button - opens sidebar with all features */}
      <button
        onClick={handleMoreClick}
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
        aria-label="More options"
      >
        {/* Icon with pulse indicator */}
        <div className="relative">
          <MoreHorizontal
            className="h-6 w-6 text-muted-foreground transition-colors duration-200"
            strokeWidth={2}
          />
          {/* Pulsing indicator dot */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" aria-hidden="true" />
        </div>
        
        {/* Label */}
        <span className="text-[10px] font-medium text-muted-foreground transition-colors duration-200">
          More
        </span>
      </button>
    </nav>

    {/* Mobile Action Sheet */}
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerContent className="lg:hidden max-h-[90vh] flex flex-col">
        <DrawerHeader className="shrink-0">
          <DrawerTitle>Quick Actions</DrawerTitle>
          <DrawerDescription>Access frequently used features</DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto px-4 pb-8 pb-safe">
          {/* Quick Actions Grid - 2x3 on mobile, 3x2 on tablet */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => handleQuickAction(action.path)}
                  className={cn(
                    'flex flex-col items-center justify-center',
                    'p-4 rounded-lg',
                    'bg-secondary/50 hover:bg-secondary',
                    'border-2 border-foreground',
                    'transition-all duration-200',
                    'active:scale-95',
                    'min-h-[100px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                  aria-label={action.label}
                >
                  <Icon className="h-7 w-7 mb-2 text-primary" strokeWidth={2} />
                  <span className="text-sm font-semibold mb-0.5 text-center">{action.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{action.description}</span>
                </button>
              );
            })}
          </div>

          {/* Separator */}
          <div className="flex items-center gap-3 my-6">
            <Separator className="flex-1" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              All Features
            </span>
            <Separator className="flex-1" />
          </div>

          {/* Pinned Items */}
          {pinnedItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Pinned
                </span>
              </div>
              <div className="space-y-2">
                {pinnedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleFeatureClick(item.url)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-lg',
                        'transition-all duration-200',
                        'active:scale-[0.98]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isActive 
                          ? 'bg-primary/10 border-2 border-primary' 
                          : 'bg-secondary/30 hover:bg-secondary border-2 border-transparent'
                      )}
                      aria-label={item.title}
                    >
                      <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      <div className="flex-1 text-left">
                        <div className={cn('font-medium', isActive && 'text-primary')}>{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        )}
                      </div>
                      <Sparkles className="h-4 w-4 text-primary" aria-label="Pinned" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grouped Features */}
          {Object.entries(groupedFeatures).map(([groupKey, items]) => {
            if (items.length === 0) return null;
            
            const groupInfo = groupLabels[groupKey];
            const GroupIcon = groupInfo?.icon;
            
            return (
              <div key={groupKey} className="mb-6">
                <div className="flex items-center gap-2 px-2 py-2 mb-2">
                  {GroupIcon && <GroupIcon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {groupInfo?.title || groupKey}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((item: NavigationItem) => {
                    // Skip items already shown in pinned
                    if (pinnedItems.some(pinned => pinned.id === item.id)) return null;
                    
                    const Icon = item.icon;
                    const isActive = location.pathname === item.url;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleFeatureClick(item.url)}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-lg',
                          'transition-all duration-200',
                          'active:scale-[0.98]',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          isActive 
                            ? 'bg-primary/10 border-2 border-primary' 
                            : 'bg-secondary/30 hover:bg-secondary border-2 border-transparent'
                        )}
                        aria-label={item.title}
                      >
                        <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                        <div className="flex-1 text-left">
                          <div className={cn('font-medium', isActive && 'text-primary')}>{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
    </>
  );
}

/**
 * Utility component to add bottom padding to pages with mobile nav
 */
export function MobileBottomNavSpacer() {
  return <div className="h-20 lg:hidden" aria-hidden="true" />;
}
