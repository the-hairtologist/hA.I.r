import { Plus, Calendar, Users, Scissors } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragInfo, setDragInfo] = useState<{ isDragging: boolean; startX: number; startY: number; } | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedPosition = localStorage.getItem('fab-position');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Failed to parse saved position:', e);
      }
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragInfo({
        isDragging: false,
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isOpen) return;
    const touch = e.touches[0];
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragInfo({
        isDragging: false,
        startX: touch.clientX - rect.left,
        startY: touch.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragInfo) return;
      
      if (!dragInfo.isDragging) {
        setDragInfo({ ...dragInfo, isDragging: true });
      }
      
      const newX = Math.max(0, Math.min(e.clientX - dragInfo.startX, window.innerWidth - 80));
      const newY = Math.max(0, Math.min(e.clientY - dragInfo.startY, window.innerHeight - 80));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragInfo) return;
      
      if (!dragInfo.isDragging) {
        setDragInfo({ ...dragInfo, isDragging: true });
      }
      
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(touch.clientX - dragInfo.startX, window.innerWidth - 80));
      const newY = Math.max(0, Math.min(touch.clientY - dragInfo.startY, window.innerHeight - 80));
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (dragInfo?.isDragging && position) {
        localStorage.setItem('fab-position', JSON.stringify(position));
      }
      setDragInfo(null);
    };

    if (dragInfo) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [dragInfo, position]);

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
      ref={buttonRef}
      className={cn(
        "flex flex-col-reverse items-end gap-3",
        dragInfo?.isDragging && "cursor-grabbing",
        position ? "fixed z-50" : "fixed bottom-28 right-20 md:bottom-6 md:right-6 z-50"
      )}
      style={position ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      } : undefined}
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
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => {
          if (!dragInfo?.isDragging) {
            haptic.tap();
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl cursor-grab active:cursor-grabbing",
          "bg-gradient-to-br from-orange-500 to-red-500",
          "hover:scale-110 transition-all duration-200 hover:shadow-2xl",
          isOpen && "rotate-45",
          dragInfo?.isDragging && "cursor-grabbing scale-110"
        )}
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>
    </div>
  );
};
