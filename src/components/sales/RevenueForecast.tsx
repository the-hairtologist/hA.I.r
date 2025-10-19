import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";

export function RevenueForecast() {
  const forecasts = [
    { period: "Next Week", amount: 1200, confidence: "High" },
    { period: "Next Month", amount: 4800, confidence: "High" },
    { period: "Next Quarter", amount: 14400, confidence: "Medium" },
  ];

  return (
    <Card className="brutal-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Revenue Forecast
        </CardTitle>
        <CardDescription>
          Predictive analytics based on booking patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {forecasts.map((forecast, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <Calendar className="h-4 w-4" />
                {forecast.period}
              </div>
              <div className="text-2xl font-bold mb-1">
                ${forecast.amount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {forecast.confidence} confidence
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Forecast Insights</h4>
              <p className="text-sm text-muted-foreground">
                Based on your current booking trends, you're projected to increase revenue by 15% this quarter. 
                Peak days are Tuesday-Thursday. Consider adding more availability on these days.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
