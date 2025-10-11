import { Plus, Calendar, Users, Scissors, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";

interface FloatingAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  gradient: string;
}

interface FloatingActionButtonProps {
  userRole: string;
}

export const FloatingActionButton = ({ userRole }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const stylistActions: FloatingAction[] = [
    {
      label: "New Client",
      icon: Users,
      onClick: () => {
        haptic.tap();
        window.dispatchEvent(new CustomEvent('open-add-client-dialog'));
        setIsOpen(false);
      },
      gradient: "from-green-500 to-emerald-500",
    },
    {
      label: "New Appointment",
      icon: Calendar,
      onClick: () => {
        haptic.tap();
        navigate("/book-appointment");
        setIsOpen(false);
      },
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "New Formula",
      icon: Scissors,
      onClick: () => {
        haptic.tap();
        navigate("/clients");
        setIsOpen(false);
      },
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const clientActions: FloatingAction[] = [
    {
      label: "Find Stylist",
      icon: Users,
      onClick: () => {
        haptic.tap();
        navigate("/stylists");
        setIsOpen(false);
      },
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Book Appointment",
      icon: Calendar,
      onClick: () => {
        haptic.tap();
        navigate("/stylists");
        setIsOpen(false);
      },
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  const actions = userRole === "stylist" ? stylistActions : clientActions;

  return (
    <div 
      className="fixed right-4 sm:right-6 md:right-8 z-[60] flex flex-col-reverse items-end gap-3"
      style={{
        bottom: 'clamp(6rem, 18vh, 10rem)' // Increased: 96px-160px from bottom for better clearance
      }}
    >
      {/* Action Items */}
      <div
        className={cn(
          "flex flex-col-reverse gap-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {actions.map((action, index) => (
          <div
            key={action.label}
            className="flex items-center gap-3 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-sm font-medium bg-card px-3 py-1 rounded-lg brutal-border brutal-shadow-xs whitespace-nowrap">
              {action.label}
            </span>
            <Button
              size="icon"
              onClick={action.onClick}
              className={cn(
                "h-12 w-12 rounded-full brutal-border brutal-shadow-sm",
                "bg-gradient-to-br",
                action.gradient,
                "hover:scale-110 transition-all duration-200"
              )}
            >
              <action.icon className="h-5 w-5 text-on-surface-primary" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <div className="relative">
        {/* Subtle glow layer */}
        <div 
          className={cn(
            "absolute inset-0 blur-md opacity-40 transition-opacity duration-500",
            "w-[clamp(3.5rem,8vw,4rem)] h-[clamp(3.5rem,8vw,4rem)]", // Responsive size
            !isOpen && "bg-orange-400",
            isOpen && "bg-destructive"
          )}
          style={{
            clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
          }}
          aria-hidden="true"
        />
        <Button
          size="icon"
          onClick={() => {
            haptic.tap();
            setIsOpen(!isOpen);
          }}
          className={cn(
            "brutal-border relative",
            "w-[clamp(3.5rem,8vw,4rem)] h-[clamp(3.5rem,8vw,4rem)]", // Responsive: 56px-64px
            "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600",
            "hover:from-orange-500 hover:via-orange-600 hover:to-orange-700",
            "brutal-shadow-sm brutal-hover",
            "transition-all duration-200 ease-out",
            "flex items-center justify-center",
            isOpen && "rotate-45 from-destructive via-destructive to-destructive/90"
          )}
          style={{
            clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
            boxShadow: "inset 0 1px 2px hsl(var(--primary-foreground) / 0.3), var(--tw-shadow)"
          }}
          aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        >
          <Plus className="w-[clamp(1.5rem,4vw,1.75rem)] h-[clamp(1.5rem,4vw,1.75rem)] text-on-surface-primary drop-shadow-sm" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
};
