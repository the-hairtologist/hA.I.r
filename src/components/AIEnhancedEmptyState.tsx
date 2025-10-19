import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIEnhancedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  context: string;
  userRole?: string;
}

interface Suggestion {
  text: string;
  action?: () => void;
}

export const AIEnhancedEmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  context,
  userRole,
}: AIEnhancedEmptyStateProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAISuggestions();
  }, [context]);

  const fetchAISuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('contextual-ai-suggestions', {
        body: { 
          context: `empty_${context}`, 
          userRole,
          recentData: {} 
        }
      });

      if (error) throw error;
      
      if (data?.suggestions) {
        setSuggestions(
          data.suggestions.slice(0, 3).map((s: any) => ({
            text: s.action,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
      // Fallback suggestions based on context
      setSuggestions(getDefaultSuggestions(context));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSuggestions = (ctx: string): Suggestion[] => {
    const defaults: Record<string, Suggestion[]> = {
      clients: [
        { text: "Start with your most frequent client" },
        { text: "Import from your contact list" },
        { text: "Invite via email or SMS" },
      ],
      appointments: [
        { text: "Block out your available hours first" },
        { text: "Set up your booking link to share" },
        { text: "Add your first client to get started" },
      ],
      formulas: [
        { text: "Document your signature color" },
        { text: "Save your go-to toners" },
        { text: "Try the AI formula generator" },
      ],
    };
    return defaults[ctx] || [];
  };

  return (
    <div className="flex items-center justify-center min-h-[min(50vh,400px)] p-4">
      <Card className="max-w-md w-full brutal-border shadow-brutal-xl bg-gradient-to-br from-muted/30 to-background">
        <CardContent className="pt-8 pb-6 px-6 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center brutal-border shadow-brutal-lg-soft">
              <Icon className="h-8 w-8 text-on-surface-primary" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-pixel font-bold">{title}</h3>
            <p className="text-xs sm:text-sm lg:text-base font-sans text-muted-foreground">{description}</p>
          </div>

          {/* AI Suggestions */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : suggestions.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 justify-center text-[11px] sm:text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="font-medium">AI Tips</span>
              </div>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border-2 border-border bg-background/50 hover:border-primary/30 transition-all text-left"
                >
                  <p className="text-[11px] sm:text-xs lg:text-sm text-foreground">{suggestion.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Primary Action */}
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-on-surface-primary font-bold uppercase tracking-wide brutal-border shadow-brutal-lg-soft hover:shadow-brutal-xl-soft transition-all"
            >
              {actionLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};