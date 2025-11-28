import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, BarChart3, TrendingUp, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { logger } from '@/lib/logger';

interface ServiceMetrics {
  name: string;
  count: number;
  revenue: number;
  color: string;
}

interface PerformanceMetrics {
  services: ServiceMetrics[];
  cancellationRate: number;
  averageBookingValue: number;
  peakDay: string;
  totalFormulas: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  '#8884d8',
  '#82ca9d',
];

export const RealPerformanceMetrics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    services: [],
    cancellationRate: 0,
    averageBookingValue: 0,
    peakDay: 'N/A',
    totalFormulas: 0,
  });

  useEffect(() => {
    loadPerformanceMetrics();
  }, [user]);

  const loadPerformanceMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile) return;

      // Get all appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(
          `
          id,
          service_type,
          status,
          appointment_date,
          stylist_services(price)
        `
        )
        .eq('stylist_id', stylistProfile.id);

      if (!appointments) return;

      // Calculate service popularity
      const serviceMap = new Map<string, { count: number; revenue: number }>();
      const dayMap = new Map<string, number>();
      let totalCancelled = 0;
      let totalCompleted = 0;
      let totalRevenue = 0;

      appointments.forEach(apt => {
        const service = apt.service_type || 'Other';
        const price = Number(apt.stylist_services?.price || 0);
        const day = new Date(apt.appointment_date).toLocaleDateString('en-US', {
          weekday: 'long',
        });

        // Service tracking
        if (!serviceMap.has(service)) {
          serviceMap.set(service, { count: 0, revenue: 0 });
        }
        serviceMap.get(service)!.count += 1;

        if (apt.status === 'completed') {
          serviceMap.get(service)!.revenue += price;
          totalCompleted += 1;
          totalRevenue += price;
        }

        // Day tracking
        dayMap.set(day, (dayMap.get(day) || 0) + 1);

        // Cancellation tracking
        if (apt.status === 'cancelled') {
          totalCancelled += 1;
        }
      });

      // Convert to array with colors
      const services: ServiceMetrics[] = Array.from(serviceMap.entries())
        .map(([name, data], idx) => ({
          name,
          count: data.count,
          revenue: data.revenue,
          color: COLORS[idx % COLORS.length],
        }))
        .sort((a, b) => b.count - a.count);

      // Find peak day
      let peakDay = 'N/A';
      let maxCount = 0;
      dayMap.forEach((count, day) => {
        if (count > maxCount) {
          maxCount = count;
          peakDay = day;
        }
      });

      // Get formula count
      const { count: formulaCount } = await supabase
        .from('formulas')
        .select('*', { count: 'exact', head: true })
        .eq('stylist_id', stylistProfile.id);

      const totalAppointments = appointments.length;
      const cancellationRate =
        totalAppointments > 0 ? (totalCancelled / totalAppointments) * 100 : 0;
      const averageBookingValue =
        totalCompleted > 0 ? totalRevenue / totalCompleted : 0;

      setMetrics({
        services,
        cancellationRate,
        averageBookingValue,
        peakDay,
        totalFormulas: formulaCount || 0,
      });
    } catch (error) {
      logger.error(
        'Error loading performance metrics',
        'RealPerformanceMetrics',
        error as Error
      );
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
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Service popularity and booking insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border-2 border-foreground rounded-lg">
            <p className="text-sm text-muted-foreground">Avg Booking Value</p>
            <p className="text-2xl font-bold">
              ${metrics.averageBookingValue.toFixed(2)}
            </p>
          </div>
          <div className="p-4 border-2 border-foreground rounded-lg">
            <p className="text-sm text-muted-foreground">Peak Day</p>
            <p className="text-2xl font-bold">{metrics.peakDay}</p>
          </div>
          <div className="p-4 border-2 border-foreground rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <X className="h-3 w-3" />
              Cancellation Rate
            </p>
            <p className="text-2xl font-bold">
              {metrics.cancellationRate.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 border-2 border-foreground rounded-lg">
            <p className="text-sm text-muted-foreground">Total Formulas</p>
            <p className="text-2xl font-bold">{metrics.totalFormulas}</p>
          </div>
        </div>

        {/* Service Popularity */}
        <div>
          <h4 className="font-semibold mb-4">Service Popularity</h4>
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Pie Chart */}
            <div className="h-[200px] w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.services as any[]}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {metrics.services.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Service List */}
            <div className="flex-1 space-y-2 w-full">
              {metrics.services.map(service => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 border-2 border-foreground rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full border-2 border-foreground"
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{service.count}</p>
                    <p className="text-xs text-muted-foreground">
                      ${service.revenue.toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
