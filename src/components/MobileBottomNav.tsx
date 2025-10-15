import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, MessageSquare, User, Users, Sparkles, Shield, Activity, CalendarCheck, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";
import { NotificationDot } from "./NotificationDot";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
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
  const { user } = useAuth();
  const { isAdmin, isStylist, isClient } = useUserRole(user?.id);
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
      label: "Messages", 
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
      label: "Appointments", 
      path: "/appointments",
      gradient: "from-cyan-start to-cyan-end",
      highlight: false
    },
  ];

  // Admin bottom nav: Admin-focused with Settings instead of full messages list
  const adminItems: NavItem[] = [
    { 
      icon: Home, 
      label: "Dashboard", 
      path: "/dashboard",
      gradient: "from-purple-start to-purple-end",
      highlight: false
    },
    { 
      icon: Calendar, 
      label: "Calendar", 
      path: "/schedule",
      gradient: "from-cyan-start to-cyan-end",
      highlight: false
    },
    { 
      icon: Settings, 
      label: "Admin", 
      path: "/admin/command",
      gradient: "from-amber-start to-amber-end",
      highlight: true // Admin command center is priority
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
    haptic.tap();
    navigate(path);
  };

  return (
    <>
      {/* Safe area spacer */}
      <div className="lg:hidden h-16 flex-shrink-0" aria-hidden="true" />
      
      {/* Navigation bar */}
      <nav 
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-[0_-4px_12px_rgba(0,0,0,0.08)]",
          "border-t-2",
          isAdmin ? "border-t-amber-500/50" : "border-foreground"
        )}
        aria-label="Mobile navigation"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="flex justify-around items-stretch h-16 px-2">{/* Increased padding */}
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
                  "min-w-[60px] min-h-[56px] gap-1",
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
                        isAdmin ? "opacity-20" : "opacity-10"
                      )}
                      aria-hidden="true"
                    />
                )}

                {/* Icon container */}
                <div className="relative flex items-center justify-center">
                  <div 
                    className={cn(
                      "flex items-center justify-center rounded-2xl",
                      "transition-all duration-200",
                      // Enhanced Home highlight
                      item.highlight && !active && [
                        "w-11 h-11", // Slightly larger for center home
                        "bg-gradient-to-br from-primary/10 to-secondary/10",
                        "ring-1 ring-primary/20"
                      ],
                      !item.highlight && "w-10 h-10",
                      active && [
                        "bg-gradient-to-br",
                        item.gradient,
                        "shadow-lg",
                        item.highlight ? "scale-115" : "scale-110"
                      ],
                      !active && !item.highlight && "hover:bg-accent/50"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "h-5 w-5 transition-all duration-200",
                        active ? "text-on-surface-primary" : "text-muted-foreground",
                        item.highlight && !active && "text-primary/60"
                      )} 
                      strokeWidth={active ? 2.5 : 2}
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
                    "text-xs font-medium transition-all duration-200",
                    active ? "text-primary scale-105" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>

                {/* Active indicator line */}
                {active && (
                  <div 
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2",
                      "h-1.5 w-10 rounded-t-full",
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
