import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { usePredictiveInsights } from "@/hooks/usePredictiveInsights";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface PredictiveClientInsightsProps {
  stylistId?: string;
}

export const PredictiveClientInsights = ({ stylistId }: PredictiveClientInsightsProps) => {
  const navigate = useNavigate();
  const { clientInsights, loading } = usePredictiveInsights(stylistId);

  if (loading) {
    return (
      <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (clientInsights.length === 0) return null;

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: "bg-green-100 text-green-700 border-green-300",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
      low: "bg-orange-100 text-orange-700 border-orange-300"
    };
    return colors[confidence as keyof typeof colors] || colors.medium;
  };

  return (
    <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-display">Client Insights</CardTitle>
            <CardDescription className="text-xs">AI predicts who's due for a visit</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {clientInsights.map((insight) => (
          <div
            key={insight.clientId}
            className="p-3 rounded-lg border-2 border-border bg-background hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{insight.clientName}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 ${getConfidenceBadge(insight.confidence)}`}
                  >
                    {insight.confidence}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last visit: {insight.daysSinceLastVisit} days ago
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  Suggest: {format(insight.suggestedDate, 'MMM d')}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => navigate(`/messages?client=${insight.clientId}`)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Message
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs whitespace-nowrap"
                  onClick={() => navigate(`/book-appointment?client=${insight.clientId}`)}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Book
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Predictions based on visit patterns</span>
        </div>
      </CardContent>
    </Card>
  );
};