/**
 * Mobile Bottom Navigation
 * Thumb-zone optimized navigation for mobile devices
 */

import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Calendar, Sparkles, User, MoreHorizontal, Search, Settings,
  Package, Palette, BarChart3, FileText, Folder, CreditCard, Bell, Shield,
  HelpCircle, LogOut
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

  const handleQuickAction = (action: string) => {
    haptic.tap();
    setIsDrawerOpen(false);
    
    switch (action) {
      case 'search':
        window.dispatchEvent(new CustomEvent('open-command-palette'));
        break;
      case 'ai':
        navigate('/ai-assistant');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const handleFeatureClick = (path: string) => {
    haptic.tap();
    setIsDrawerOpen(false);
    navigate(path);
  };

  const quickActions = [
    { id: 'search', icon: Search, label: 'Search', description: 'Find anything' },
    { id: 'ai', icon: Sparkles, label: 'AI Assistant', description: 'Smart help' },
    { id: 'profile', icon: User, label: 'Profile', description: 'Your account' },
    { id: 'settings', icon: Settings, label: 'Settings', description: 'Preferences' },
  ];

  const allFeatures = [
    { path: '/inventory', icon: Package, label: 'Inventory', roles: ['stylist', 'admin'] },
    { path: '/formulas', icon: Palette, label: 'Formulas', roles: ['stylist', 'admin'] },
    { path: '/portfolio', icon: Folder, label: 'Portfolio', roles: ['stylist', 'admin'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin'] },
    { path: '/reports', icon: FileText, label: 'Reports', roles: ['admin'] },
    { path: '/billing', icon: CreditCard, label: 'Billing', roles: ['admin'] },
    { path: '/notifications', icon: Bell, label: 'Notifications', roles: ['stylist', 'client', 'admin'] },
    { path: '/privacy', icon: Shield, label: 'Privacy & Security', roles: ['stylist', 'client', 'admin'] },
    { path: '/help', icon: HelpCircle, label: 'Help & Support', roles: ['stylist', 'client', 'admin'] },
  ].filter(feature => feature.roles.includes(userRole));

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
      <DrawerContent className="lg:hidden max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Quick Actions</DrawerTitle>
          <DrawerDescription>Access frequently used features</DrawerDescription>
        </DrawerHeader>
        
        <div className="overflow-y-auto px-4 pb-8">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className={cn(
                    'flex flex-col items-center justify-center',
                    'p-6 rounded-lg',
                    'bg-secondary/50 hover:bg-secondary',
                    'border-2 border-foreground',
                    'transition-all duration-200',
                    'active:scale-95',
                    'min-h-[120px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                  aria-label={action.label}
                >
                  <Icon className="h-8 w-8 mb-2 text-primary" strokeWidth={2} />
                  <span className="text-sm font-semibold mb-1">{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </button>
              );
            })}
          </div>

          {/* Separator */}
          <div className="flex items-center gap-3 my-6">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              All Features
            </span>
            <Separator className="flex-1" />
          </div>

          {/* All Features List */}
          <div className="space-y-2">
            {allFeatures.map((feature) => {
              const Icon = feature.icon;
              const isActive = location.pathname === feature.path;
              
              return (
                <button
                  key={feature.path}
                  onClick={() => handleFeatureClick(feature.path)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-lg',
                    'transition-all duration-200',
                    'active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-secondary/30 hover:bg-secondary border-2 border-transparent'
                  )}
                  aria-label={feature.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )} 
                    strokeWidth={2}
                  />
                  <span className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-primary' : 'text-foreground'
                  )}>
                    {feature.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
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
