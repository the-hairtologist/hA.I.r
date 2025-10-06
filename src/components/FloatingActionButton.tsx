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
      <div className="relative animate-fade-in">        
        <Button
          size="icon"
          onClick={() => {
            haptic.tap();
            setIsOpen(!isOpen);
          }}
          className={cn(
            "relative h-16 w-16 rounded-lg border-[4px] border-foreground",
            "bg-gradient-to-br from-[#FF6B9D] via-[#C06C84] to-[#6C5B7B]",
            "shadow-[6px_6px_0px_0px_hsl(var(--foreground))]",
            "hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))]",
            "hover:translate-x-[-2px] hover:translate-y-[-2px]",
            "active:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]",
            "active:translate-x-[2px] active:translate-y-[2px]",
            "transition-all duration-150",
            "flex items-center justify-center",
            isOpen && "rotate-45"
          )}
        >
          <div className="relative flex items-center justify-center">
            <Scissors className="h-6 w-6 text-white pointer-events-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]" strokeWidth={2.5} />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-[#FFF05A] pointer-events-none drop-shadow-[1px_1px_0px_rgba(0,0,0,0.3)]" strokeWidth={3} />
          </div>
        </Button>
      </div>
    </div>
  );
};
