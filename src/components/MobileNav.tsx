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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border shadow-lg" aria-label="Mobile navigation">
      <div className="flex justify-around items-center h-16 px-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-h-[44px] gap-1 transition-all p-2",
                "hover:bg-accent/50 rounded-lg",
                active && "text-primary"
              )}
              aria-label={`Navigate to ${item.label}`}
              aria-current={active ? "page" : undefined}
            >
              <div className="flex items-center justify-center min-h-[24px] min-w-[24px]">
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
