import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Clock, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface SchedulingSuggestion {
  datetime: string;
  reason: string;
  confidence: "high" | "medium" | "low";
}

interface SmartSchedulingSuggestionsProps {
  stylistId?: string;
  onSelectTime?: (datetime: string) => void;
}

export const SmartSchedulingSuggestions = ({ 
  stylistId,
  onSelectTime 
}: SmartSchedulingSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<SchedulingSuggestion[]>([]);
  const [patterns, setPatterns] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stylistId) {
      fetchSuggestions();
    }
  }, [stylistId]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-scheduling-suggestions', {
        body: { stylistId, timeRange: '7 days' }
      });

      if (error) throw error;
      
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setPatterns(data.patterns);
      }
    } catch (error) {
      console.error('Failed to fetch scheduling suggestions:', error);
      toast.error('Could not load scheduling suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-display">Smart Scheduling</CardTitle>
            <CardDescription className="text-xs">AI-powered time suggestions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Suggested Times */}
        <div className="space-y-2">
          {suggestions.slice(0, 3).map((suggestion, idx) => {
            const date = new Date(suggestion.datetime);
            return (
              <div
                key={idx}
                className="p-3 rounded-lg border-2 border-border bg-background hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => onSelectTime?.(suggestion.datetime)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-medium">
                        {format(date, 'EEE, MMM d')}
                      </span>
                      <Clock className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                      <span className="text-sm text-muted-foreground">
                        {format(date, 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getConfidenceColor(suggestion.confidence)}`}>
                    {suggestion.confidence}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Patterns Insight */}
        {patterns && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">Your Patterns</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(patterns.dayCount || {}).length > 0 && (
                <div className="p-2 rounded-md bg-muted/50 border">
                  <p className="text-[10px] text-muted-foreground mb-1">Busiest Day</p>
                  <p className="text-xs font-medium">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
                      parseInt(Object.entries(patterns.dayCount).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || '0')
                    ]}
                  </p>
                </div>
              )}
              {Object.keys(patterns.hourCount || {}).length > 0 && (
                <div className="p-2 rounded-md bg-muted/50 border">
                  <p className="text-[10px] text-muted-foreground mb-1">Peak Time</p>
                  <p className="text-xs font-medium">
                    {Object.entries(patterns.hourCount).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0]}:00
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={fetchSuggestions}
          className="w-full text-xs h-8"
        >
          <Sparkles className="h-3 w-3 mr-1.5" />
          Refresh Suggestions
        </Button>
      </CardContent>
    </Card>
  );
};