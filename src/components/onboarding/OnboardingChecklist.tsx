import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { notification } from "@/platform/haptics";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  action?: () => void;
  estimatedTime: string;
}

export const OnboardingChecklist = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "profile", label: "Complete your profile", completed: false, estimatedTime: "2 min" },
    { id: "service", label: "Add your first service", completed: false, estimatedTime: "3 min" },
    { id: "client", label: "Add a client", completed: false, estimatedTime: "2 min" },
    { id: "appointment", label: "Schedule an appointment", completed: false, estimatedTime: "3 min" },
  ]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkCompletion();
  }, [user]);

  const checkCompletion = async () => {
    if (!user) return;

    try {
      // Check profile exists
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      
      // Check for appointments
      const { count: appointmentCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("stylist_id", user.id);

      setItems(prev => prev.map(item => {
        if (item.id === "profile") return { ...item, completed: !!profileData };
        if (item.id === "appointment") return { ...item, completed: (appointmentCount ?? 0) > 0 };
        return item;
      }));
    } catch (error) {
      console.error("Error checking onboarding completion:", error);
    }
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;
  const allComplete = completedCount === items.length;

  useEffect(() => {
    if (allComplete && !dismissed) {
      notification("success");
    }
  }, [allComplete]);

  if (dismissed || allComplete) return null;

  return (
    <Card className="brutal-border brutal-shadow-sm animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm sm:text-base font-pixel">Quick Start</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="font-medium">{completedCount} of {items.length} complete</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-md border-2 transition-all",
                item.completed ? "bg-success/10 border-success" : "bg-muted/50 border-border",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  item.completed 
                    ? "bg-success border-success" 
                    : "border-muted-foreground"
                )}>
                  {item.completed && <Check className="h-3 w-3 text-on-surface-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs sm:text-sm font-medium truncate",
                    item.completed && "line-through text-muted-foreground"
                  )}>
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.estimatedTime}</p>
                </div>
              </div>
              {!item.completed && item.action && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs flex-shrink-0"
                  onClick={item.action}
                >
                  Start
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
