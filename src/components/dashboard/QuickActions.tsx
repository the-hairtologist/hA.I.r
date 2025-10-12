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
      id: "finance",
      label: "Financial Overview",
      description: "Track earnings & payments",
      icon: CreditCard,
      route: "/finance",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "referrals",
      label: "Referral Program",
      description: "Earn by referring",
      icon: DollarSign,
      route: "/referrals",
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
      id: "find-stylist",
      label: "Find a Stylist",
      description: "Browse stylists",
      icon: Users,
      route: "/stylists",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "book",
      label: "Book Appointment",
      description: "Schedule a visit",
      icon: Calendar,
      route: "/appointments",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "messages",
      label: "Messages",
      description: "Chat with stylist",
      icon: MessageSquare,
      route: "/messages",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "profile",
      label: "My Profile",
      description: "Update your info",
      icon: Settings2,
      route: "/settings",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      id: "knowledge",
      label: "Hair Care Tips",
      description: "Learn & explore",
      icon: BookOpen,
      route: "/knowledge",
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  const allActions = userRole === "stylist" ? allStylistActions : allClientActions;
  const storageKey = `quickActions-${userRole}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setSelectedActions(JSON.parse(saved));
    } else {
      // Default: show first 4 actions only
      setSelectedActions(allActions.slice(0, 4).map(a => a.id));
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl font-display">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Quick Actions
            </CardTitle>
            <p className="text-sm font-semibold mt-1 text-foreground/80">
              Jump to what matters most
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="shrink-0"
          >
            {isCustomizing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Done
              </>
            ) : (
              <>
                <Settings2 className="h-4 w-4 mr-2" />
                Customize
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCustomizing ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg brutal-border bg-gradient-to-r from-primary/10 to-accent/10 brutal-shadow-sm">
              <p className="text-sm font-bold text-foreground">
                ✨ Customize Your Actions
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click to toggle • Drag selected items to reorder
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allActions.map((action) => {
                const Icon = action.icon;
                const isSelected = selectedActions.includes(action.id);
                
                return (
                  <div
                    key={action.id}
                    draggable={isSelected}
                    onDragStart={() => handleDragStart(action.id)}
                    onDragOver={(e) => handleDragOver(e, action.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => toggleAction(action.id)}
                    className={cn(
                      "group relative flex items-center gap-3 p-4 rounded-lg brutal-border cursor-pointer transition-all",
                      isSelected
                        ? "bg-gradient-to-br from-primary/10 to-accent/10 brutal-shadow-md hover:brutal-shadow-lg active:brutal-shadow-sm"
                        : "bg-card/80 hover:bg-card brutal-shadow-xs hover:brutal-shadow-sm active:scale-95"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg brutal-border transition-all",
                      isSelected 
                        ? `bg-gradient-to-br ${action.gradient}` 
                        : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5 transition-colors",
                        isSelected ? "text-white" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-bold text-sm truncate transition-colors",
                        isSelected && "text-primary"
                      )}>
                        {action.label}
                      </p>
                      <p className="text-xs text-foreground/90 truncate">
                        {action.description}
                      </p>
                    </div>
                    {isSelected && (
                      <>
                        <GripVertical className="h-5 w-5 text-primary cursor-grab active:cursor-grabbing shrink-0" />
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-2 -right-2 brutal-border brutal-shadow-xs bg-primary text-primary-foreground font-bold"
                        >
                          {selectedActions.indexOf(action.id) + 1}
                        </Badge>
                      </>
                    )}
                    {!isSelected && (
                      <Plus className="h-5 w-5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedActions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <button
                  key={action.id}
                  onClick={() => navigate(action.route)}
                  className="group relative rounded-xl brutal-border bg-card transition-all overflow-hidden brutal-shadow-xs hover:shadow-[8px_8px_0px_0px_hsl(var(--primary))] hover:-translate-y-2 hover:scale-[1.03] active:brutal-shadow-sm active:translate-y-0 active:scale-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col items-center gap-3 p-5 text-center">
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-15 group-hover:opacity-20 transition-opacity ${action.gradient}`} />
                    <div className="relative">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br brutal-border brutal-shadow-xs group-hover:brutal-shadow-sm transition-shadow ${action.gradient}`}>
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="relative">
                      <h4 className="font-display font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                        {action.label}
                      </h4>
                      <p className="text-sm text-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
