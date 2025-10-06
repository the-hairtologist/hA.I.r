import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, Calendar, MessageSquare, Scissors, Settings2, Plus, X, Palette, DollarSign, BookOpen, CreditCard, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface QuickActionsProps {
  userRole: string;
}

interface ActionButton {
  id: string;
  label: string;
  icon: any;
  route: string;
  description?: string;
  gradient?: string;
}

export const QuickActions = ({ userRole }: QuickActionsProps) => {
  const navigate = useNavigate();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const allStylistActions: ActionButton[] = [
    {
      id: "ai-chat",
      label: "AI Chat",
      description: "Get instant advice",
      icon: Sparkles,
      route: "/ai-assistant",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      id: "formula",
      label: "Formula",
      description: "Generate formulas",
      icon: Scissors,
      route: "/formulas",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      id: "schedule",
      label: "Schedule",
      description: "View appointments",
      icon: Calendar,
      route: "/appointments",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "messages",
      label: "Messages",
      description: "Client chat",
      icon: MessageSquare,
      route: "/messages",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "clients",
      label: "Clients",
      description: "Manage clients",
      icon: Users,
      route: "/clients",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      id: "services",
      label: "Services",
      description: "Edit offerings",
      icon: Settings2,
      route: "/services",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      description: "Your work",
      icon: Palette,
      route: "/portfolio",
      gradient: "from-fuchsia-500 to-pink-500",
    },
    {
      id: "payments",
      label: "Payments",
      description: "Your earnings",
      icon: CreditCard,
      route: "/payments",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "commissions",
      label: "Commissions",
      description: "Product earnings",
      icon: DollarSign,
      route: "/commissions",
      gradient: "from-yellow-500 to-amber-500",
    },
    {
      id: "knowledge",
      label: "Knowledge",
      description: "Hair resources",
      icon: BookOpen,
      route: "/knowledge",
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  const allClientActions: ActionButton[] = [
    {
      id: "book",
      label: "Book",
      description: "Schedule visit",
      icon: Calendar,
      route: "/book-appointment",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "discover",
      label: "Stylists",
      description: "Find talent",
      icon: Users,
      route: "/stylists",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "messages",
      label: "Messages",
      description: "Chat",
      icon: MessageSquare,
      route: "/messages",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const allActions = userRole === "stylist" ? allStylistActions : allClientActions;
  const storageKey = `quickActions-${userRole}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setSelectedActions(JSON.parse(saved));
    } else {
      // Default: show first 3 actions
      setSelectedActions(allActions.slice(0, 3).map(a => a.id));
    }
  }, [userRole]);

  const toggleAction = (id: string) => {
    setSelectedActions(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(newSelection));
      return newSelection;
    });
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    setSelectedActions(prev => {
      const newOrder = [...prev];
      const draggedIndex = newOrder.indexOf(draggedItem);
      const targetIndex = newOrder.indexOf(targetId);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      
      localStorage.setItem(storageKey, JSON.stringify(newOrder));
      return newOrder;
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const displayedActions = allActions.filter(a => selectedActions.includes(a.id))
    .sort((a, b) => selectedActions.indexOf(a.id) - selectedActions.indexOf(b.id));

  return (
    <Card className="mb-6 lg:mb-8 animate-fade-in brutal-card bg-yellow-300">
      <CardHeader className="pb-3 lg:pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base lg:text-xl font-display">
              <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-primary shrink-0" />
              <span className="truncate">Quick Actions</span>
              <Badge variant="outline" className="ml-1 lg:ml-2 font-mono text-xs shrink-0">
                {selectedActions.length}
              </Badge>
            </CardTitle>
            <p className="text-xs lg:text-sm font-semibold mt-1 text-foreground/80 hidden sm:block">
              {isCustomizing ? "Select & drag to reorder" : "Jump to what matters"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="gap-1 lg:gap-2 shrink-0 text-xs lg:text-sm"
          >
            {isCustomizing ? <X className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> : <Settings2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
            <span className="hidden sm:inline">{isCustomizing ? "Done" : "Edit"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCustomizing ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
            {allActions.map((action) => {
              const Icon = action.icon;
              const isSelected = selectedActions.includes(action.id);
              
              return (
                <button
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={cn(
                    "relative p-3 lg:p-4 rounded-lg border-2 border-foreground transition-all text-left shadow-[2px_2px_0px_0px_hsl(var(--foreground))] lg:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] active:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] active:translate-x-[1px] active:translate-y-[1px]",
                    isSelected
                      ? "bg-card"
                      : "bg-card/60"
                  )}
                >
                  <div className="flex flex-col lg:flex-row items-start gap-2 lg:gap-3">
                    <div className={cn(
                      "p-1.5 lg:p-2 rounded-lg bg-gradient-to-br shrink-0 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
                      action.gradient,
                      !isSelected && "opacity-50"
                    )}>
                      <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-xs lg:text-sm mb-0.5 lg:mb-1 truncate">{action.label}</h4>
                      <p className="text-xs text-foreground/70 truncate hidden lg:block">{action.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 lg:top-2 right-1.5 lg:right-2 h-4 w-4 lg:h-5 lg:w-5 rounded-full bg-primary flex items-center justify-center border-2 border-foreground">
                        <Sparkles className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {displayedActions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <div
                  key={action.id}
                  draggable
                  onDragStart={() => handleDragStart(action.id)}
                  onDragOver={(e) => handleDragOver(e, action.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group relative rounded-xl brutal-card bg-card transition-all overflow-hidden lg:cursor-move",
                    draggedItem === action.id && "opacity-50"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => navigate(action.route)}
                    className="flex items-start gap-2 lg:gap-3 p-4 lg:p-5 text-left w-full"
                  >
                    {/* Drag handle - desktop only */}
                    <GripVertical className="hidden lg:block h-5 w-5 text-foreground/30 shrink-0 mt-1" />
                    
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-10",
                      action.gradient
                    )} />
                    <div className="relative flex-1">
                      <div className={cn(
                        "inline-flex p-2 lg:p-3 rounded-lg bg-gradient-to-br mb-2 lg:mb-3 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
                        action.gradient
                      )}>
                        <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary-foreground" />
                      </div>
                      <h4 className="font-display font-semibold text-sm lg:text-base mb-0.5 lg:mb-1 group-hover:text-primary transition-colors">
                        {action.label}
                      </h4>
                      <p className="text-xs lg:text-sm text-foreground/70">
                        {action.description}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
            {displayedActions.length === 0 && (
              <div className="col-span-full text-center py-6 lg:py-8">
                <Plus className="h-6 w-6 lg:h-8 lg:w-8 text-foreground/60 mx-auto mb-2" />
                <p className="text-foreground/60 text-xs lg:text-sm font-medium">
                  Tap "Edit" to add shortcuts
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
