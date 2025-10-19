import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, TrendingUp, DollarSign } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface RevenueData {
  date: string;
  revenue: number;
  appointments: number;
}

export const RealRevenueChart = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    loadRevenueData();
  }, [timeRange, user]);

  const loadRevenueData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const days = parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), days));

      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!stylistProfile) return;

      // Get appointments with payments
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          status,
          stylist_services(price)
        `)
        .eq("stylist_id", stylistProfile.id)
        .eq("status", "completed")
        .gte("appointment_date", startDate.toISOString());

      // Group by date
      const revenueByDate: Record<string, { revenue: number; count: number }> = {};
      let total = 0;

      appointments?.forEach((apt) => {
        const date = format(new Date(apt.appointment_date), "MMM dd");
        const price = Number(apt.stylist_services?.price || 0);
        
        if (!revenueByDate[date]) {
          revenueByDate[date] = { revenue: 0, count: 0 };
        }
        
        revenueByDate[date].revenue += price;
        revenueByDate[date].count += 1;
        total += price;
      });

      // Convert to chart data
      const chartData: RevenueData[] = Object.entries(revenueByDate).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        appointments: data.count,
      }));

      // Calculate growth rate (compare first half to second half)
      const midpoint = Math.floor(chartData.length / 2);
      const firstHalfRevenue = chartData.slice(0, midpoint).reduce((sum, d) => sum + d.revenue, 0);
      const secondHalfRevenue = chartData.slice(midpoint).reduce((sum, d) => sum + d.revenue, 0);
      const growth = firstHalfRevenue > 0 
        ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
        : 0;

      setRevenueData(chartData);
      setTotalRevenue(total);
      setGrowthRate(growth);
    } catch (error) {
      console.error("Error loading revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="brutal-border shadow-brutal">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>Real-time revenue tracking from appointments</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className={`h-3 w-3 ${growthRate >= 0 ? 'text-success' : 'text-destructive'}`} />
                <span className={growthRate >= 0 ? 'text-success' : 'text-destructive'}>
                  {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="7">7 Days</TabsTrigger>
            <TabsTrigger value="30">30 Days</TabsTrigger>
            <TabsTrigger value="90">90 Days</TabsTrigger>
          </TabsList>

          <TabsContent value={timeRange} className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-foreground rounded-lg">
                <p className="text-sm text-muted-foreground">Avg per Day</p>
                <p className="text-2xl font-bold">
                  ${(totalRevenue / parseInt(timeRange)).toFixed(2)}
                </p>
              </div>
              <div className="p-4 border-2 border-foreground rounded-lg">
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold">
                  {revenueData.reduce((sum, d) => sum + d.appointments, 0)}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
