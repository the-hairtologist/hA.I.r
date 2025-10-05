import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, X, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AISuggestion {
  action: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

interface ContextualAIAssistantProps {
  userRole?: string;
  recentData?: any;
}

export const ContextualAIAssistant = ({ userRole, recentData }: ContextualAIAssistantProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const context = getContextFromRoute(location.pathname);
      
      const { data, error } = await supabase.functions.invoke('contextual-ai-suggestions', {
        body: { context, userRole, recentData }
      });

      if (error) throw error;
      
      if (data?.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContextFromRoute = (path: string): string => {
    const contexts: Record<string, string> = {
      '/dashboard': 'viewing dashboard overview',
      '/appointments': 'managing appointments',
      '/clients': 'managing clients',
      '/formulas': 'working with formulas',
      '/messages': 'viewing messages',
      '/services': 'managing services',
      '/schedule': 'managing schedule',
      '/portfolio': 'managing portfolio',
    };
    return contexts[path] || 'using the app';
  };

  useEffect(() => {
    // Fetch suggestions when route changes
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 2000); // Wait 2s after route change

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-24 z-40 animate-fade-in">
      <Card className={cn(
        "border-2 border-border shadow-lg bg-card backdrop-blur-sm transition-all duration-300",
        isExpanded ? "w-80" : "w-auto"
      )}>
        <CardContent className="p-0">
          {/* Collapsed State */}
          {!isExpanded && (
            <Button
              onClick={() => setIsExpanded(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0"
            >
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </Button>
          )}

          {/* Expanded State */}
          {isExpanded && (
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-display font-bold">AI Assist</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(false)}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsVisible(false)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer",
                        suggestion.priority === "high" 
                          ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                          : "border-border bg-background hover:border-primary/30"
                      )}
                    >
                      <p className="text-xs font-medium mb-1">{suggestion.action}</p>
                      <p className="text-[10px] text-muted-foreground">{suggestion.reason}</p>
                    </div>
                  ))}
                  
                  {/* Refresh Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchSuggestions}
                    className="w-full text-xs h-8 mt-2"
                  >
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Get New Suggestions
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};