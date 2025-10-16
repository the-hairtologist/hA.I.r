import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, X, DollarSign, Calendar, Package, Heart } from "lucide-react";
import { toast } from "sonner";

interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: string;
  action_items: any;
  potential_revenue: number;
  confidence_score: number;
  created_at: string;
}

export function AIInsightsFeed({ stylistId }: { stylistId: string }) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [stylistId]);

  const loadInsights = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("stylist_id", stylistId)
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const dismissInsight = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ai_insights")
        .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      
      setInsights(insights.filter(i => i.id !== id));
      toast.success("Insight dismissed");
    } catch (error) {
      console.error("Error dismissing insight:", error);
      toast.error("Failed to dismiss");
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "revenue": return <DollarSign className="h-5 w-5" />;
      case "scheduling": return <Calendar className="h-5 w-5" />;
      case "inventory": return <Package className="h-5 w-5" />;
      case "retention": return <Heart className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return <div>Loading AI insights...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-4 border-2 border-border rounded-lg space-y-3 hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {getInsightIcon(insight.insight_type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                    {insight.confidence_score && (
                      <Badge variant="outline">
                        {Math.round(insight.confidence_score)}% confident
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>

                  {insight.potential_revenue > 0 && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <DollarSign className="h-4 w-4" />
                      Potential: ${insight.potential_revenue.toFixed(2)}
                    </div>
                  )}

                  {insight.action_items && Array.isArray(insight.action_items) && insight.action_items.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Recommended Actions:
                      </p>
                      <ul className="text-sm space-y-1">
                        {insight.action_items.slice(0, 3).map((action: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{action.title || action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => dismissInsight(insight.id)}
                className="ml-2 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No new insights yet. Check back soon!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
