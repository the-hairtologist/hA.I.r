import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function ServicePopularity() {
  const { user } = useAuth();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['service-popularity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: appointments } = await supabase
        .from('appointments')
        .select('service_type, service_id, stylist_services(price)')
        .eq('stylist_id', stylistProfile.id)
        .eq('status', 'completed')
        .gte('appointment_date', thirtyDaysAgo.toISOString());

      const serviceMap = new Map();
      appointments?.forEach(apt => {
        const serviceName = apt.service_type || 'Other Service';
        const price = apt.stylist_services?.price || 0;

        if (!serviceMap.has(serviceName)) {
          serviceMap.set(serviceName, {
            name: serviceName,
            bookings: 0,
            revenue: 0,
          });
        }

        const service = serviceMap.get(serviceName);
        service.bookings += 1;
        service.revenue += Number(price);
      });

      return Array.from(serviceMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6);
    },
    enabled: !!user?.id,
  });

  const maxBookings = Math.max(...services.map(s => s.bookings), 1);

  return (
    <Card className="brutal-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Service Popularity
        </CardTitle>
        <CardDescription>
          Most requested services and revenue contribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading analytics...
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No completed appointments in the last 30 days
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{service.name}</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{service.bookings} bookings</span>
                    <span className="font-semibold text-foreground">
                      ${service.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Progress
                  value={(service.bookings / maxBookings) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
