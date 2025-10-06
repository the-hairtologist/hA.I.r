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
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col-reverse items-end gap-3"
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
            <span className="text-sm font-medium bg-card px-3 py-1 rounded-lg border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] whitespace-nowrap">
              {action.label}
            </span>
            <Button
              size="icon"
              onClick={action.onClick}
              className={cn(
                "h-12 w-12 rounded-full shadow-lg border-2 border-foreground",
                "bg-gradient-to-br",
                action.gradient,
                "hover:scale-110 transition-all duration-200"
              )}
            >
              <action.icon className="h-5 w-5 text-white" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={() => {
          haptic.tap();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl border-3 border-foreground",
          "bg-primary hover:bg-primary/90",
          "transition-all duration-300 ease-out",
          "flex items-center justify-center",
          "hover:scale-110 active:scale-95",
          isOpen && "rotate-45 bg-destructive hover:bg-destructive/90"
        )}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
      >
        <Plus className="h-7 w-7 text-primary-foreground" strokeWidth={3} />
      </Button>
    </div>
  );
};
