import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, MessageSquare, User, Users, Sparkles, Shield, Activity, CalendarCheck, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";
import { playHapticForAction } from "@/lib/mobile/HapticPatterns";
import { NotificationDot } from "./NotificationDot";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { useState, useEffect } from "react";

interface NavItem {
  icon: any;
  label: string;
  path: string;
  gradient: string;
  highlight: boolean;
  badge?: number;
  disabled?: boolean;
}

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isStylist, isClient } = useEnhancedAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id);

  const isActive = (path: string) => location.pathname === path;
  
  // Determine user role
  const userRole = isAdmin ? 'admin' : isStylist ? 'stylist' : 'client';

  // Stylist bottom nav: Most-used daily actions (optimized for productivity)
  const stylistItems: NavItem[] = [
    { 
      icon: Calendar, 
      label: "Schedule", 
      path: "/appointments",
      gradient: "from-cyan-start to-cyan-end",
      highlight: false
    },
    { 
      icon: Users, 
      label: "Clients", 
      path: "/clients",
      gradient: "from-green-start to-green-end",
      highlight: false
    },
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard",
      gradient: "from-purple-start to-purple-end",
      highlight: true
    },
    { 
      icon: Sparkles, 
      label: "AI", 
      path: "/ai-assistant",
      gradient: "from-violet-start to-violet-end",
      highlight: false
    },
    { 
      icon: MessageSquare, 
      label: "Chat", 
      path: "/messages",
      gradient: "from-pink-start to-pink-end",
      badge: unreadCount,
      highlight: false
    },
  ];

  // Client bottom nav: Book Appointment is now the primary highlighted action
  const clientItems: NavItem[] = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard",
      gradient: "from-purple-start to-purple-end",
      highlight: false
    },
    { 
      icon: Plus, 
      label: "Book", 
      path: "/book-appointment",
      gradient: "from-emerald-start to-emerald-end",
      highlight: true // PRIMARY ACTION for clients
    },
    { 
      icon: CalendarCheck, 
      label: "Visits", 
      path: "/appointments",
      gradient: "from-cyan-start to-cyan-end",
      highlight: false
    },
    { 
      icon: MessageSquare, 
      label: "Chat", 
      path: "/messages",
      gradient: "from-pink-start to-pink-end",
      badge: unreadCount,
      highlight: false
    },
  ];

  // Admin bottom nav: Admin-focused with key controls
  const adminItems: NavItem[] = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard",
      gradient: "from-purple-start to-purple-end",
      highlight: false
    },
    { 
      icon: Calendar, 
      label: "Schedule", 
      path: "/schedule",
      gradient: "from-cyan-start to-cyan-end",
      highlight: false
    },
    { 
      icon: Settings, 
      label: "Control", 
      path: "/admin/command",
      gradient: "from-amber-start to-amber-end",
      highlight: true // Admin command center is priority
    },
    { 
      icon: Activity, 
      label: "Health", 
      path: "/system-health",
      gradient: "from-emerald-start to-emerald-end",
      highlight: false
    },
  ];

  // Load customized navigation from localStorage (stylist/admin only)
  // SECURITY: Only show admin items if user actually has admin role
  const effectiveRole = isAdmin ? "admin" : userRole;
  const storageKey = `mobileNav-${effectiveRole}`;
  const [customizedItems, setCustomizedItems] = useState<NavItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Define all available items - admin check ensures only actual admins see admin items
  const allItems = isAdmin ? adminItems : userRole === "stylist" ? stylistItems : clientItems;

  useEffect(() => {
    setMounted(true);
    
    // Clients always use fixed navigation - no customization
    if (userRole === "client") {
      setCustomizedItems(clientItems);
      return;
    }
    
    const savedConfig = localStorage.getItem(storageKey);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        const { order, enabledIds } = config;
        
        if (order && enabledIds) {
          // Map saved IDs to actual nav items
          const idToItemMap = new Map(allItems.map(item => {
            const id = item.path.split('/').pop() || item.label.toLowerCase();
            return [id, item];
          }));
          
          // Restore custom order and filter by enabled items
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
        console.error("Failed to load mobile nav config:", e);
      }
    }
    
    setCustomizedItems(allItems);
  }, [userRole]);

  const items = mounted && customizedItems.length > 0 ? customizedItems : allItems;

  const handleNavigation = (path: string) => {
    // Use contextual haptic feedback
    playHapticForAction('navigate');
    navigate(path);
  };

  return (
    <>
      {/* Safe area spacer - accounts for nav height only */}
      <div 
        className="lg:hidden flex-shrink-0 h-16"
        aria-hidden="true" 
      />
      
      {/* Navigation bar */}
      <nav 
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-fixed bg-background/95 backdrop-blur-md shadow-[0_-4px_12px_rgba(0,0,0,0.08)]",
          "border-t-[3px]",
          isAdmin ? "border-t-amber-500 bg-gradient-to-r from-amber-500/5 to-amber-600/5" : "border-foreground"
        )}
        aria-label="Mobile navigation"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)'
        }}
      >
        {/* Admin visual indicator */}
        {isAdmin && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse-subtle" />
        )}
        <div className="flex justify-around items-stretch h-16 px-1">{/* Consistent spacing with justify-around */}
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => !item.disabled && handleNavigation(item.path)}
                disabled={item.disabled}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1",
                  "min-w-[64px] w-full max-w-[80px] gap-1", // Consistent fixed sizing
                  "transition-all duration-200 ease-out",
                  "active:scale-95",
                  "touch-manipulation",
                  active && "text-primary",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                aria-label={`Navigate to ${item.label}`}
                aria-current={active ? "page" : undefined}
              >
                {/* Background glow effect for active item */}
                {active && (
                    <div 
                      className={cn(
                        "absolute inset-0 rounded-2xl",
                        "bg-gradient-to-br",
                        item.gradient,
                        isAdmin ? "opacity-30" : "opacity-20"
                      )}
                      aria-hidden="true"
                    />
                )}

                {/* Icon container - Consistent sizing for all items */}
                <div className="relative flex items-center justify-center">
                  <div 
                    className={cn(
                      "flex items-center justify-center rounded-xl",
                      "transition-all duration-200",
                      // Consistent base size for all items
                      "w-11 h-11",
                      // Highlight effect for primary action
                      item.highlight && !active && [
                        "bg-gradient-to-br from-primary/10 to-secondary/10",
                        "ring-1 ring-primary/20"
                      ],
                      // Active state
                      active && [
                        "bg-gradient-to-br",
                        item.gradient,
                        "shadow-md",
                        "scale-105"
                      ],
                      // Hover state
                      !active && "hover:bg-accent/30"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "transition-all duration-200", 
                        // Minimum 24px icons for mobile visibility
                        "h-6 w-6",
                        active ? "text-on-surface-primary" : "text-muted-foreground",
                        item.highlight && !active && "text-primary"
                      )} 
                      strokeWidth={active ? 2.5 : 2}
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

                {/* Label - Consistent sizing */}
                <span 
                  className={cn(
                    "text-[11px] font-sans font-medium transition-all duration-200",
                    "truncate w-full text-center px-0.5",
                    active ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>

                {/* Active indicator line - Consistent design */}
                {active && (
                  <div 
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2",
                      "h-1 w-8 rounded-t-md",
                      "bg-gradient-to-r",
                      item.gradient,
                      "animate-fade-in"
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
