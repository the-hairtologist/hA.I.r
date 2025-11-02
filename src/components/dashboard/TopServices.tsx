import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Award, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TopServicesProps {
  stylistId: string;
}

interface ServiceStats {
  service: string;
  count: number;
  revenue: number;
}

export function TopServices({ stylistId }: TopServicesProps) {
  const [services, setServices] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopServices();
  }, [stylistId]);

  const loadTopServices = async () => {
    try {
      const { data: appointments } = await supabase
        .from('appointments')
        .select(
          `
          service_type,
          service:services(price)
        `
        )
        .eq('stylist_id', stylistId)
        .eq('status', 'completed');

      if (appointments) {
        const serviceMap = new Map<
          string,
          { count: number; revenue: number }
        >();

        appointments.forEach((apt: any) => {
          const current = serviceMap.get(apt.service_type) || {
            count: 0,
            revenue: 0,
          };
          serviceMap.set(apt.service_type, {
            count: current.count + 1,
            revenue: current.revenue + (apt.service?.price || 0),
          });
        });

        const stats: ServiceStats[] = Array.from(serviceMap.entries())
          .map(([service, data]) => ({ service, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setServices(stats);
      }
    } catch (error) {
      console.error('Error loading top services:', error);
      toast.error('Failed to load service data');
    } finally {
      setLoading(false);
    }
  };

  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-purple-500',
  ];

  return (
    <Card className="brutal-border brutal-shadow-lg hover:brutal-shadow-xl transition-shadow bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-pixel">
          <div className="p-2 rounded-lg bg-gradient-amber-orange">
            <Award className="h-5 w-5 text-on-surface-primary" />
          </div>
          <span>Top Services</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-16 bg-muted/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
            No completed services yet
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service, index) => (
              <div
                key={service.service}
                className="relative p-3 rounded-lg brutal-border bg-card/80 hover:bg-card transition-colors brutal-shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br brutal-border text-on-surface-primary font-display font-bold text-sm ${gradients[index]}`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm truncate">
                      {service.service}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      ${service.revenue.toFixed(2)} total
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[11px] sm:text-xs"
                  >
                    {service.count}x
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
