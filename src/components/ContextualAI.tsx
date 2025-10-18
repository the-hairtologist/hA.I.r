import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";

interface ContextualAISuggestion {
  id: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}

interface ContextualAIProps {
  context: "formula" | "appointment" | "client" | "schedule";
  data?: any;
  onAction?: (actionType: string) => void;
}

export const ContextualAI = ({ context, data, onAction }: ContextualAIProps) => {
  const [suggestion, setSuggestion] = useState<ContextualAISuggestion | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Generate contextual suggestions based on current context
    const generateSuggestion = (): ContextualAISuggestion | null => {
      switch (context) {
        case "formula":
          if (data?.clientId) {
            return {
              id: "formula-history",
              message: "Looks like you're creating a formula—want me to pull your last mix for this client?",
              action: () => onAction?.("load-last-formula"),
              actionLabel: "Load Last Formula"
            };
          }
          break;
        
        case "appointment":
          if (data?.clientId && data?.lastAppointmentDate) {
            const daysSince = Math.floor((Date.now() - new Date(data.lastAppointmentDate).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince > 30) {
              return {
                id: "rebook-suggestion",
                message: `${data.clientName} hasn't visited in ${daysSince} days. Want to send a friendly rebooking reminder?`,
                action: () => onAction?.("send-rebook-reminder"),
                actionLabel: "Send Reminder"
              };
            }
          }
          break;
        
        case "client":
          if (data?.recentFormulas?.length > 5) {
            return {
              id: "formula-organization",
              message: "You have lots of formulas for this client. Want me to organize them by date or service type?",
              action: () => onAction?.("organize-formulas"),
              actionLabel: "Organize"
            };
          }
          break;
        
        case "schedule":
          if (data?.availableSlots && data.availableSlots.length < 3) {
            return {
              id: "schedule-optimization",
              message: "You're running low on available slots this week. Want me to suggest optimal times to add?",
              action: () => onAction?.("suggest-slots"),
              actionLabel: "Show Suggestions"
            };
          }
          break;
      }
      
      return null;
    };

    if (!dismissed) {
      const newSuggestion = generateSuggestion();
      setSuggestion(newSuggestion);
    }
  }, [context, data, dismissed, onAction]);

  const handleAction = () => {
    if (suggestion?.action) {
      haptic.tap();
      suggestion.action();
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    haptic.tap();
    setDismissed(true);
  };

  if (!suggestion || dismissed) return null;

  return (
    <Card className={cn(
      "brutal-border bg-primary/5 animate-fade-in-fast",
      "hover:border-primary/40 transition-all duration-200"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 mt-0.5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          
          <div className="flex-1 space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              {suggestion.message}
            </p>
            
            {suggestion.actionLabel && (
              <Button
                size="sm"
                onClick={handleAction}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                {suggestion.actionLabel}
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 -mt-1 -mr-1"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
