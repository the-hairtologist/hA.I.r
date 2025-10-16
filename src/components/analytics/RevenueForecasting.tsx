import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RevenueForecast {
  id: string;
  forecast_period: string;
  forecast_start: string;
  forecast_end: string;
  predicted_revenue: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  predicted_appointments: number;
  predicted_new_clients: number;
  predicted_retention_rate: number;
}

export function RevenueForecasting({ stylistId }: { stylistId: string }) {
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, [stylistId]);

  const loadForecast = async () => {
    try {
      const { data, error } = await supabase
        .from("revenue_forecasts")
        .select("*")
        .eq("stylist_id", stylistId)
        .eq("forecast_period", "month")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setForecast(data);
    } catch (error) {
      console.error("Error loading forecast:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading forecasts...</div>;
  }

  if (!forecast) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue Forecast
          </CardTitle>
          <CardDescription>
            Forecasts will appear after you complete more appointments
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Next Month Forecast
        </CardTitle>
        <CardDescription>
          AI-powered predictions based on your business patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border-2 border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">
                Predicted Revenue
              </span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${forecast.predicted_revenue.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Range: ${forecast.confidence_interval_low.toFixed(0)} - ${forecast.confidence_interval_high.toFixed(0)}
            </div>
          </div>

          <div className="p-4 border-2 border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Expected Appointments
              </span>
            </div>
            <div className="text-3xl font-bold">
              {forecast.predicted_appointments}
            </div>
            <Badge variant="outline" className="mt-2">
              {forecast.predicted_retention_rate.toFixed(0)}% retention
            </Badge>
          </div>

          <div className="p-4 border-2 border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">
                New Clients Expected
              </span>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {forecast.predicted_new_clients}
            </div>
          </div>

          <div className="p-4 border-2 border-border rounded-lg bg-primary/5">
            <div className="text-sm font-medium mb-2">Business Health</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Growth Trend</span>
                <span className="font-medium text-green-600">↑ Positive</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Client Retention</span>
                <span className="font-medium">
                  {forecast.predicted_retention_rate > 80 ? "Strong" : "Moderate"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-1">💡 Tip:</p>
          <p>
            Based on current trends, focus on retaining existing clients through follow-ups
            to maximize this forecast.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
