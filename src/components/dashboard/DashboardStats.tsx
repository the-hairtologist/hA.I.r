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
      label: "Today's Appointments",
      value: stats.todayAppointments || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-400",
    },
    {
      label: "Upcoming This Week",
      value: stats.upcomingAppointments || 0,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-400",
    },
    {
      label: "Unread Messages",
      value: stats.unreadMessages || 0,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-400",
    },
    {
      label: "Total Clients",
      value: stats.totalClients || 0,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-400",
    },
  ];

  const clientStats = [
    {
      label: "Upcoming Appointments",
      value: stats.upcomingAppointments || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-400",
    },
    {
      label: "Unread Messages",
      value: stats.unreadMessages || 0,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-400",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews || 0,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-300",
    },
  ];

  const displayStats = userRole === "stylist" ? stylistStats : clientStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {displayStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={cn(
              "animate-fade-in hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))]",
              stat.bgColor
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-display font-semibold mb-1 text-foreground/80">{stat.label}</p>
                  <p className="text-4xl font-display font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="p-3 rounded-lg bg-white border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
