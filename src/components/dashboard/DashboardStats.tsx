import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, Star, DollarSign, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  stats: {
    todayAppointments?: number;
    upcomingAppointments?: number;
    unreadMessages?: number;
    pendingReviews?: number;
    totalRevenue?: number;
    totalClients?: number;
  };
  userRole: string;
}

export const DashboardStats = ({ stats, userRole }: DashboardStatsProps) => {
  const stylistStats = [
    {
      label: "Today",
      fullLabel: "Today's Appointments",
      value: stats.todayAppointments || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-400",
    },
    {
      label: "This Week",
      fullLabel: "Upcoming This Week",
      value: stats.upcomingAppointments || 0,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-400",
    },
    {
      label: "Messages",
      fullLabel: "Unread Messages",
      value: stats.unreadMessages || 0,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-400",
    },
    {
      label: "Clients",
      fullLabel: "Total Clients",
      value: stats.totalClients || 0,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-400",
    },
  ];

  const clientStats = [
    {
      label: "Upcoming",
      fullLabel: "Upcoming Appointments",
      value: stats.upcomingAppointments || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-400",
    },
    {
      label: "Messages",
      fullLabel: "Unread Messages",
      value: stats.unreadMessages || 0,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-400",
    },
    {
      label: "Reviews",
      fullLabel: "Pending Reviews",
      value: stats.pendingReviews || 0,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-300",
    },
  ];

  const displayStats = userRole === "stylist" ? stylistStats : clientStats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
      {displayStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={cn(
              "animate-fade-in brutal-card transition-all",
              stat.bgColor
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="pt-4 lg:pt-6 pb-4 px-3 lg:px-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-2">
                <div className="w-full lg:w-auto">
                  {/* Short label on mobile, full on desktop */}
                  <p className="text-xs font-display font-semibold mb-1 text-foreground/80 lg:hidden">
                    {stat.label}
                  </p>
                  <p className="hidden lg:block text-sm font-display font-semibold mb-1 text-foreground/80">
                    {stat.fullLabel}
                  </p>
                  <p className="text-2xl lg:text-4xl font-display font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className="p-2 lg:p-3 rounded-lg bg-card border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] self-end lg:self-auto">
                  <Icon className={`h-4 w-4 lg:h-6 lg:w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
