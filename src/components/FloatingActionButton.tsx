import { Plus, Calendar, Users, Scissors } from "lucide-react";
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
      className="fixed bottom-24 right-3 z-[60] flex flex-col-reverse items-end gap-2.5 lg:bottom-6 lg:right-4"
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
            <span className="text-sm font-medium bg-card px-3 py-2 rounded-lg border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] whitespace-nowrap">
              {action.label}
            </span>
            <Button
              size="icon"
              onClick={action.onClick}
              className={cn(
                "h-12 w-12 rounded-full shadow-lg border-2 border-white",
                "bg-gradient-to-br min-h-[48px] min-w-[48px]",
                action.gradient,
                "hover:scale-105 active:scale-95 transition-all duration-200",
                "lg:h-14 lg:w-14 lg:min-h-[56px] lg:min-w-[56px]"
              )}
              aria-label={action.label}
            >
              <action.icon className="h-5 w-5 text-white lg:h-6 lg:w-6" strokeWidth={2.5} />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB - Mobile Optimized */}
      <Button
        size="icon"
        onClick={() => {
          haptic.tap();
          setIsOpen(!isOpen);
        }}
        style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          border: '2px solid #ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        className={cn(
          "h-14 w-14 rounded-full min-h-[56px] min-w-[56px]",
          "lg:h-16 lg:w-16 lg:min-h-[64px] lg:min-w-[64px]",
          "hover:scale-105 active:scale-95",
          "transition-all duration-200",
          "flex items-center justify-center",
          isOpen && "rotate-45"
        )}
        aria-label={isOpen ? "Close menu" : "Open quick actions menu"}
      >
        <Plus 
          className="text-white" 
          size={28}
          strokeWidth={2.5}
          style={{ 
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        />
      </Button>
    </div>
  );
};
