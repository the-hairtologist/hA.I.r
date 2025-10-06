import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, MessageSquare, User, Users, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  userRole?: string;
}

export const MobileNav = ({ userRole }: MobileNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const stylistItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: Users, label: "Clients", path: "/clients" },
    { icon: BookOpen, label: "Knowledge", path: "/knowledge" },
    { icon: User, label: "Settings", path: "/settings" },
  ];

  const clientItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Users, label: "Stylists", path: "/stylists" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: BookOpen, label: "Knowledge", path: "/knowledge" },
    { icon: User, label: "Settings", path: "/settings" },
  ];

  const items = userRole === "stylist" ? stylistItems : clientItems;

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t-3 border-foreground shadow-[0_-2px_8px_rgba(0,0,0,0.1)] safe-area-pb" 
      aria-label="Mobile navigation"
    >
      <div className="flex justify-around items-center h-20 px-1 gap-1 max-w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-h-[56px] gap-1.5 transition-all py-2 px-1 rounded-lg",
                "active:bg-accent/30",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={`Navigate to ${item.label}`}
              aria-current={active ? "page" : undefined}
            >
              <div className="flex items-center justify-center min-h-[28px] min-w-[28px]">
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-transform", 
                    active && "scale-110"
                  )} 
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                "text-xs font-medium leading-tight",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
