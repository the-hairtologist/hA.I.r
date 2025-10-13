import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, MessageSquare, User, Users, Sparkles, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";
import { NotificationDot } from "./NotificationDot";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useAuth } from "@/hooks/useAuth";

interface MobileBottomNavProps {
  userRole?: string;
}

interface NavItem {
  icon: any;
  label: string;
  path: string;
  gradient: string;
  highlight: boolean;
  badge?: number;
  disabled?: boolean;
}

export const MobileBottomNav = ({ userRole }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id);

  const isActive = (path: string) => location.pathname === path;

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

  const clientItems: NavItem[] = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard",
      gradient: "from-purple-start to-purple-end",
      highlight: false
    },
    { 
      icon: Sparkles, 
      label: "Tips", 
      path: "/knowledge",
      gradient: "from-cyan-start to-cyan-end",
      highlight: false
    },
    { 
      icon: User, 
      label: "Profile", 
      path: "/settings",
      gradient: "from-purple-start to-purple-end",
      highlight: false
    },
  ];

  const adminItems: NavItem[] = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard",
      gradient: "from-purple-start to-purple-end",
      highlight: false
    },
    { 
      icon: Shield, 
      label: "Command", 
      path: "/admin/command",
      gradient: "from-orange-start to-orange-end",
      highlight: false
    },
    { 
      icon: Users, 
      label: "Users", 
      path: "/admin/users",
      gradient: "from-cyan-start to-cyan-end",
      highlight: false
    },
    { 
      icon: Activity, 
      label: "Health", 
      path: "/system-health",
      gradient: "from-green-start to-green-end",
      highlight: false
    },
    { 
      icon: MessageSquare, 
      label: "Messages", 
      path: "/messages",
      gradient: "from-violet-start to-violet-end",
      badge: unreadCount,
      highlight: false
    },
  ];

  const items = userRole === "admin" ? adminItems : userRole === "stylist" ? stylistItems : clientItems;

  const handleNavigation = (path: string) => {
    haptic.tap();
    navigate(path);
  };

  return (
    <>
      {/* Safe area spacer */}
      <div className="md:hidden h-16 flex-shrink-0" aria-hidden="true" />
      
      {/* Navigation bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t-2 border-foreground shadow-[0_-4px_12px_rgba(0,0,0,0.08)]" 
        aria-label="Mobile navigation"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="flex justify-around items-stretch h-16 px-1">
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
                      "absolute inset-0 opacity-10 rounded-2xl",
                      "bg-gradient-to-br",
                      item.gradient
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Icon container */}
                <div className="relative flex items-center justify-center">
                  <div 
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-2xl",
                      "transition-all duration-200",
                      active && [
                        "bg-gradient-to-br",
                        item.gradient,
                        "shadow-lg scale-110"
                      ],
                      !active && "hover:bg-accent/50"
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
                    "text-[11px] font-medium transition-all duration-200",
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
                      "h-1 w-8 rounded-t-full",
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
