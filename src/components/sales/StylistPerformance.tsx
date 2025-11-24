import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function StylistPerformance() {
  const { user } = useAuth();

  const { data: performance, isLoading } = useQuery({
    queryKey: ['stylist-performance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id, average_rating, total_reviews')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('id, stylist_services(price)')
        .eq('stylist_id', stylistProfile.id)
        .eq('status', 'completed')
        .gte('appointment_date', thirtyDaysAgo.toISOString());

      const bookings = recentAppointments?.length || 0;
      const revenue =
        recentAppointments?.reduce(
          (sum, apt) => sum + Number(apt.stylist_services?.price || 0),
          0
        ) || 0;

      return {
        name: 'You',
        bookings,
        revenue,
        rating: Number(stylistProfile.average_rating || 0).toFixed(1),
        totalReviews: stylistProfile.total_reviews || 0,
      };
    },
    enabled: !!user?.id,
  });

  return (
    <Card className="brutal-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Individual stylist performance and comparisons
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading performance data...
          </div>
        ) : !performance ? (
          <div className="text-center py-8 text-muted-foreground">
            No performance data available
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border">
              <div>
                <h3 className="font-semibold mb-1">{performance.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{performance.bookings} bookings (30 days)</span>
                  <span className="font-semibold text-foreground">
                    ${performance.revenue.toFixed(2)}
                  </span>
                  <Badge variant="secondary">
                    ⭐ {performance.rating} ({performance.totalReviews} reviews)
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
