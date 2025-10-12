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
    <Card variant="glass" className="backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <TrendingUp className="h-5 w-5 text-primary" />
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative rounded-lg brutal-border bg-card p-4 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${stat.gradient}`} />
                <div className="relative flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-display">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
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
