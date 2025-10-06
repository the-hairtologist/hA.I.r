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
      label: "AI Expert Chat",
      description: "Get instant advice",
      icon: Sparkles,
      route: "/ai-assistant",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      id: "formula",
      label: "Create Formula",
      description: "Generate client formulas",
      icon: Scissors,
      route: "/formulas",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      id: "schedule",
      label: "Today's Schedule",
      description: "View appointments",
      icon: Calendar,
      route: "/appointments",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "messages",
      label: "Messages",
      description: "Client conversations",
      icon: MessageSquare,
      route: "/messages",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "clients",
      label: "Client Management",
      description: "Manage your clients",
      icon: Users,
      route: "/clients",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      id: "services",
      label: "Services & Pricing",
      description: "Edit your offerings",
      icon: Settings2,
      route: "/services",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      description: "Showcase your work",
      icon: Palette,
      route: "/portfolio",
      gradient: "from-fuchsia-500 to-pink-500",
    },
    {
      id: "payments",
      label: "Payment History",
      description: "Track your earnings",
      icon: CreditCard,
      route: "/payments",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "commissions",
      label: "Commissions",
      description: "Product commissions",
      icon: DollarSign,
      route: "/commissions",
      gradient: "from-yellow-500 to-amber-500",
    },
    {
      id: "knowledge",
      label: "Knowledge Base",
      description: "Hair care resources",
      icon: BookOpen,
      route: "/knowledge",
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  const allClientActions: ActionButton[] = [
    {
      id: "book",
      label: "Book Appointment",
      description: "Schedule your visit",
      icon: Calendar,
      route: "/book-appointment",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "discover",
      label: "Find Stylists",
      description: "Discover local talent",
      icon: Users,
      route: "/stylists",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "messages",
      label: "Messages",
      description: "Chat with stylist",
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
    <Card 
      variant="glass"
      className="mb-8 animate-fade-in backdrop-blur-xl bg-gradient-to-br from-background/80 to-card/60"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-display">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Quick Actions
              <Badge variant="outline" className="ml-2 font-mono">
                {selectedActions.length}/{allActions.length}
              </Badge>
            </CardTitle>
            <p className="text-sm font-semibold mt-1 text-foreground/80">
              {isCustomizing ? "Select & drag to reorder your shortcuts" : "Jump to what matters most"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="gap-2 -mr-2"
          >
            {isCustomizing ? <X className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
            {isCustomizing ? "Done" : "Customize"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCustomizing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {allActions.map((action) => {
              const Icon = action.icon;
              const isSelected = selectedActions.includes(action.id);
              
              return (
                <button
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={cn(
                    "relative p-4 rounded-lg brutal-border transition-all text-left group",
                    "brutal-shadow-sm",
                    "hover:brutal-shadow-xs",
                    "hover:translate-x-[-1px] hover:translate-y-[-1px]",
                    "active:brutal-shadow-xs",
                    "active:translate-x-[1px] active:translate-y-[1px]",
                    isSelected
                      ? "bg-card scale-100"
                      : "bg-card/60 hover:bg-card scale-95 hover:scale-100"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br shrink-0 brutal-border brutal-shadow-xs",
                      action.gradient,
                      !isSelected && "opacity-50"
                    )}>
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-sm mb-1">{action.label}</h4>
                      <p className="text-xs text-foreground/70">{action.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center brutal-border">
                        <Sparkles className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    "group relative rounded-xl brutal-border bg-card transition-all overflow-hidden",
                    "brutal-shadow-xs",
                    "hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))]",
                    "hover:-translate-y-2 hover:scale-[1.02]",
                    "active:brutal-shadow-sm",
                    "active:translate-y-0 active:scale-100",
                    draggedItem === action.id && "opacity-50 scale-95"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-2 p-5 cursor-move">
                    <GripVertical className="h-5 w-5 text-foreground/30 shrink-0 mt-1" />
                    <button
                      onClick={() => navigate(action.route)}
                      className="flex-1 text-left"
                    >
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-10",
                        action.gradient
                      )} />
                      <div className="relative">
                        <div className={cn(
                          "inline-flex p-3 rounded-lg bg-gradient-to-br mb-3 brutal-border brutal-shadow-xs",
                          action.gradient
                        )}>
                          <Icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h4 className="font-display font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                          {action.label}
                        </h4>
                        <p className="text-sm text-foreground/70">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
            {displayedActions.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Plus className="h-8 w-8 text-foreground/60 mx-auto mb-2" />
                <p className="text-foreground/60 text-sm font-medium">
                  Click "Customize" to add your favorite shortcuts
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
