import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, Calendar, MessageSquare, Scissors, Settings2, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const displayedActions = allActions.filter(a => selectedActions.includes(a.id));

  return (
    <Card className="mb-8 animate-fade-in border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-display">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Quick Actions
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {isCustomizing ? "Select your favorite shortcuts" : "Jump to what matters most"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="gap-2"
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
                    "relative p-4 rounded-lg border-2 border-foreground transition-all text-left group shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px]",
                    isSelected
                      ? "bg-primary/10"
                      : "bg-background hover:bg-accent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br shrink-0 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
                      action.gradient,
                      !isSelected && "opacity-50"
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-sm mb-1">{action.label}</h4>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-foreground">
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
                <button
                  key={action.id}
                  onClick={() => navigate(action.route)}
                  className="group relative p-5 rounded-xl border-[3px] border-foreground hover:border-primary bg-card transition-all text-left overflow-hidden shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_0px_hsl(var(--primary))] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-10",
                    action.gradient
                  )} />
                  <div className="relative">
                    <div className={cn(
                      "inline-flex p-3 rounded-lg bg-gradient-to-br mb-3 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
                      action.gradient
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-display font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                      {action.label}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
            {displayedActions.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm font-medium">
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
