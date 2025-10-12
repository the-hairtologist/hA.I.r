import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { toast } from "sonner";

interface RevenueTrendsProps {
  stylistId: string;
}

interface MonthlyRevenue {
  month: string;
  amount: number;
}

export function RevenueTrends({ stylistId }: RevenueTrendsProps) {
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenue();
  }, [stylistId]);

  const loadRevenue = async () => {
    try {
      const months = [];
      for (let i = 3; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        months.push({
          start: startOfMonth(date),
          end: endOfMonth(date),
          label: format(date, "MMM"),
        });
      }

      const revenueData: MonthlyRevenue[] = await Promise.all(
        months.map(async (month) => {
          const { data } = await supabase
            .from("appointments")
            .select(`
              service:services(price)
            `)
            .eq("stylist_id", stylistId)
            .eq("status", "completed")
            .gte("appointment_date", month.start.toISOString())
            .lte("appointment_date", month.end.toISOString());

          const total = data?.reduce((sum, apt: any) => sum + (apt.service?.price || 0), 0) || 0;
          return { month: month.label, amount: total };
        })
      );

      setRevenue(revenueData);

      // Calculate trend
      if (revenueData.length >= 2) {
        const current = revenueData[revenueData.length - 1].amount;
        const previous = revenueData[revenueData.length - 2].amount;
        setTrend(current > previous ? "up" : current < previous ? "down" : "stable");
      }
    } catch (error) {
      console.error("Error loading revenue:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...revenue.map(r => r.amount), 1);
  const currentMonth = revenue[revenue.length - 1];

  return (
    <Card className="brutal-border brutal-shadow-lg hover:brutal-shadow-xl transition-shadow bg-gradient-to-br from-card to-success/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-lg font-display">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-green-emerald">
              <DollarSign className="h-5 w-5 text-on-surface-primary" />
            </div>
            <span>Revenue Trends</span>
          </div>
          {trend === "up" && (
            <div className="flex items-center gap-1 text-success text-sm font-bold">
              <TrendingUp className="h-4 w-4" />
              <span>Up</span>
            </div>
          )}
          {trend === "down" && (
            <div className="flex items-center gap-1 text-destructive text-sm font-bold">
              <TrendingDown className="h-4 w-4" />
              <span>Down</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-success">
                ${currentMonth?.amount.toFixed(2) || "0.00"}
              </div>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                This Month
              </p>
            </div>

            <div className="flex items-end justify-between gap-2 h-24">
              {revenue.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-muted/30 rounded-t-lg relative overflow-hidden" 
                    style={{ 
                      height: `${(month.amount / maxRevenue) * 100}%`,
                      minHeight: month.amount > 0 ? '20px' : '4px'
                    }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-success to-success/60" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {month.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
