import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, DollarSign, MessageSquare, TrendingUp } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';

interface LiveKPICardsProps {
  stylistId: string;
  onCardClick?: (section: string) => void;
}

export const LiveKPICards = ({ stylistId, onCardClick }: LiveKPICardsProps) => {
  const [kpis, setKpis] = useState({
    todayBookings: 0,
    weekIncome: 0,
    unreadMessages: 0,
    weekGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
    // Refresh KPIs every 30 seconds for live feel
    const interval = setInterval(loadKPIs, 30000);
    return () => clearInterval(interval);
  }, [stylistId]);

  const loadKPIs = async () => {
    try {
      const now = new Date();
      const todayStart = format(startOfDay(now), "yyyy-MM-dd'T'HH:mm:ss");
      const todayEnd = format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss");
      const weekStart = format(startOfWeek(now), "yyyy-MM-dd'T'HH:mm:ss");
      const weekEnd = format(endOfWeek(now), "yyyy-MM-dd'T'HH:mm:ss");

      // Today's bookings
      const { data: todayAppts } = await supabase
        .from('appointments')
        .select('id')
        .eq('stylist_id', stylistId)
        .gte('appointment_date', todayStart)
        .lte('appointment_date', todayEnd)
        .in('status', ['scheduled', 'confirmed']);

      // Week's income (completed appointments)
      const { data: weekAppts } = await supabase
        .from('appointments')
        .select('*, stylist_services(price)')
        .eq('stylist_id', stylistId)
        .eq('status', 'completed')
        .gte('appointment_date', weekStart)
        .lte('appointment_date', weekEnd);

      const weekIncome =
        weekAppts?.reduce((sum, apt) => {
          return sum + (apt.stylist_services?.price || 0);
        }, 0) || 0;

      // Unread messages (placeholder - implement when messages system is ready)
      const unreadMessages = 0;

      // Week growth (compare to previous week)
      const prevWeekStart = format(
        new Date(weekStart).setDate(new Date(weekStart).getDate() - 7),
        "yyyy-MM-dd'T'HH:mm:ss"
      );
      const { data: prevWeekAppts } = await supabase
        .from('appointments')
        .select('id')
        .eq('stylist_id', stylistId)
        .eq('status', 'completed')
        .gte('appointment_date', prevWeekStart)
        .lt('appointment_date', weekStart);

      const weekGrowth =
        prevWeekAppts && prevWeekAppts.length > 0
          ? Math.round(
              (((weekAppts?.length || 0) - prevWeekAppts.length) /
                prevWeekAppts.length) *
                100
            )
          : 0;

      setKpis({
        todayBookings: todayAppts?.length || 0,
        weekIncome,
        unreadMessages,
        weekGrowth,
      });
    } catch (error) {
      logger.error('Error loading KPIs', 'LiveKPICards', error as Error);
      toast.error(
        "Unable to load today's metrics. Your data is safe - please refresh."
      );
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      label: "Today's Bookings",
      value: kpis.todayBookings,
      icon: Calendar,
      color: 'from-info/10 to-info/20',
      iconColor: 'text-info',
      borderColor: 'border-info/20',
      onClick: () => onCardClick?.('appointments'),
    },
    {
      label: "This Week's Income",
      value: `$${kpis.weekIncome.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-primary/10 to-primary/20',
      iconColor: 'text-primary',
      borderColor: 'border-primary/20',
      onClick: () => onCardClick?.('finance'),
    },
    {
      label: 'Unread Messages',
      value: kpis.unreadMessages,
      icon: MessageSquare,
      color: 'from-accent/10 to-accent/20',
      iconColor: 'text-accent',
      borderColor: 'border-accent/20',
      onClick: () => onCardClick?.('messages'),
    },
    {
      label: 'Week Growth',
      value: `${kpis.weekGrowth > 0 ? '+' : ''}${kpis.weekGrowth}%`,
      icon: TrendingUp,
      color: 'from-success/10 to-success/20',
      iconColor: 'text-success',
      borderColor: 'border-success/20',
      onClick: () => onCardClick?.('stats'),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 sm:h-28 bg-secondary/20 rounded-lg brutal-border-subtle"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {cards.map((card, index) => (
        <Card
          key={card.label}
          className={cn(
            'cursor-pointer brutal-border shadow-brutal-lg',
            'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm',
            'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
            'transition-all duration-300 animate-fade-in',
            card.borderColor
          )}
          onClick={card.onClick}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-3 sm:p-4">
            <div
              className={cn(
                'rounded-lg p-1.5 sm:p-2 w-fit mb-2 sm:mb-3 bg-gradient-to-br',
                card.color
              )}
            >
              <card.icon
                className={cn('h-4 w-4 sm:h-5 sm:w-5', card.iconColor)}
              />
            </div>
            <p className={cn(mobileFirst.text.xs, "xs:text-xs sm:text-xs font-sans font-medium text-muted-foreground mb-0.5 truncate")}>
              {card.label}
            </p>
            <p className="text-base xs:text-lg sm:text-xl lg:text-2xl font-pixel font-bold gradient-text truncate">
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
