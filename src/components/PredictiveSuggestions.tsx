import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Package, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PredictiveInsight {
  type: string;
  title: string;
  description: string;
  actions: string[];
  confidence: number;
  inventory_items?: string[];
}

interface PredictiveSuggestionsProps {
  insights: PredictiveInsight[];
  onAction?: (insight: PredictiveInsight) => void;
}

export const PredictiveSuggestions = ({ insights, onAction }: PredictiveSuggestionsProps) => {
  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming appointments to analyze. Predictions will appear when appointments are scheduled.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Predictions for This Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, i) => (
          <Alert key={i} className="border-primary/20">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                  <Badge variant="outline">
                    {Math.round(insight.confidence * 100)}% confidence
                  </Badge>
                </div>

                {insight.actions && insight.actions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Recommended Actions:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-sm">
                      {insight.actions.map((action, j) => (
                        <li key={j}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {insight.inventory_items && insight.inventory_items.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Check inventory:</span>
                    {insight.inventory_items.map((item, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}

                {onAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(insight)}
                    className="mt-2"
                  >
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};