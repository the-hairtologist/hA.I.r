import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, MessageSquare, User, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";
import { NotificationDot } from "./NotificationDot";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useAuth } from "@/hooks/useAuth";

interface MobileBottomNavProps {
  userRole?: string;
}

export const MobileBottomNav = ({ userRole }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id);

  const isActive = (path: string) => location.pathname === path;

  const stylistItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      icon: Calendar, 
      label: "Schedule", 
      path: "/appointments",
      gradient: "from-cyan-500 to-blue-500"
    },
    { 
      icon: Sparkles, 
      label: "AI", 
      path: "/ai-assistant",
      gradient: "from-purple-500 to-pink-500",
      highlight: true
    },
    { 
      icon: Users, 
      label: "Clients", 
      path: "/clients",
      gradient: "from-emerald-500 to-teal-500"
    },
    { 
      icon: MessageSquare, 
      label: "Messages", 
      path: "/messages",
      gradient: "from-pink-500 to-rose-500",
      badge: unreadCount
    },
  ];

  const clientItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      icon: Users, 
      label: "Find", 
      path: "/stylist-discovery",
      gradient: "from-cyan-500 to-blue-500"
    },
    { 
      icon: Sparkles, 
      label: "AI", 
      path: "/ai-assistant",
      gradient: "from-purple-500 to-pink-500",
      highlight: true
    },
    { 
      icon: Calendar, 
      label: "Bookings", 
      path: "/appointments",
      gradient: "from-pink-500 to-rose-500"
    },
    { 
      icon: MessageSquare, 
      label: "Messages", 
      path: "/messages",
      gradient: "from-violet-500 to-purple-500",
      badge: unreadCount
    },
  ];

  const items = userRole === "stylist" ? stylistItems : clientItems;

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
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1",
                  "min-w-[60px] min-h-[56px] gap-1",
                  "transition-all duration-200 ease-out",
                  "active:scale-95",
                  "touch-manipulation", // Optimizes touch response
                  active && "text-primary"
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
