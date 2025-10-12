import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek } from "date-fns";

export const WeeklyOverview = () => {
  const { data: weeklyStats } = useQuery({
    queryKey: ['weekly-stats'],
    queryFn: async () => {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());

      const [total, completed] = await Promise.all([
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .gte('appointment_date', weekStart.toISOString())
          .lte('appointment_date', weekEnd.toISOString()),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .gte('appointment_date', weekStart.toISOString())
          .lte('appointment_date', weekEnd.toISOString())
          .eq('status', 'completed'),
      ]);

      return {
        total: total.count || 0,
        completed: completed.count || 0,
      };
    },
  });

  const stats = [
    {
      label: "Total Appointments",
      value: weeklyStats?.total || 0,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Completed",
      value: weeklyStats?.completed || 0,
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <Card variant="glass" className="backdrop-blur-xl border-primary/10 hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-4 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                style={{ 
                  animation: `fadeInUp 0.4s ease-out ${index * 0.15}s both`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold font-display tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
