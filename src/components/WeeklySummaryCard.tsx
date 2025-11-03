import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface WeeklySummaryCardProps {
  stylistId: string;
  className?: string;
}

export const WeeklySummaryCard = ({
  stylistId,
  className,
}: WeeklySummaryCardProps) => {
  const [summary, setSummary] = useState({
    earnings: 0,
    hoursSaved: 0,
    appointments: 0,
    growthPercent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklySummary();
  }, [stylistId]);

  const loadWeeklySummary = async () => {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      const prevWeekStart = subWeeks(weekStart, 1);

      // This week's appointments
      const { data: thisWeek } = await supabase
        .from('appointments')
        .select(
          `
          *,
          stylist_services(price, duration_minutes)
        `
        )
        .eq('stylist_id', stylistId)
        .eq('status', 'completed')
        .gte('appointment_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('appointment_date', format(weekEnd, 'yyyy-MM-dd'));

      // Previous week for comparison
      const { data: prevWeek } = await supabase
        .from('appointments')
        .select('id')
        .eq('stylist_id', stylistId)
        .eq('status', 'completed')
        .gte('appointment_date', format(prevWeekStart, 'yyyy-MM-dd'))
        .lt('appointment_date', format(weekStart, 'yyyy-MM-dd'));

      const earnings =
        thisWeek?.reduce(
          (sum, apt) => sum + (apt.stylist_services?.price || 0),
          0
        ) || 0;
      const appointments = thisWeek?.length || 0;

      // Estimate hours saved (assuming 15 min per booking manually vs 2 min with app)
      const hoursSaved = Math.round(((appointments * 13) / 60) * 10) / 10;

      const growthPercent =
        prevWeek && prevWeek.length > 0
          ? Math.round(
              ((appointments - prevWeek.length) / prevWeek.length) * 100
            )
          : 0;

      setSummary({
        earnings,
        hoursSaved,
        appointments,
        growthPercent,
      });
    } catch (error) {
      logger.error('Failed to load weekly summary', 'WeeklySummaryCard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card
        className={cn(
          'border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] animate-pulse',
          className
        )}
      >
        <CardContent className="p-6">
          <div className="h-32 bg-secondary/20 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]',
        'bg-gradient-to-br from-primary/5 to-accent/5',
        className
      )}
    >
      <CardHeader className="border-b-[2px] border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">This Week's Results</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Earned</span>
            </div>
            <p className="text-2xl font-display font-bold gradient-text">
              ${summary.earnings.toFixed(2)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time Saved</span>
            </div>
            <p className="text-2xl font-display font-bold gradient-text">
              {summary.hoursSaved}h
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Appointments</span>
            </div>
            <p className="text-2xl font-display font-bold gradient-text">
              {summary.appointments}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Growth</span>
            </div>
            <p
              className={cn(
                'text-2xl font-display font-bold',
                summary.growthPercent > 0
                  ? 'text-success'
                  : summary.growthPercent < 0
                    ? 'text-destructive'
                    : 'text-foreground'
              )}
            >
              {summary.growthPercent > 0 ? '+' : ''}
              {summary.growthPercent}%
            </p>
          </div>
        </div>

        <div className="pt-4 border-t-[2px] border-border">
          <p className="text-xs text-center text-muted-foreground">
            Keep up the amazing work! 🌟
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
