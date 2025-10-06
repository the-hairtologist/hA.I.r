import { StatCard } from "@/components/ui/stat-card";
import { Calendar, MessageSquare, Star, DollarSign, Users, Clock } from "lucide-react";

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
      gradient: "from-blue-500 to-cyan-500",
      variant: "gradient" as const,
    },
    {
      label: "Upcoming This Week",
      value: stats.upcomingAppointments || 0,
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
      variant: "gradient" as const,
    },
    {
      label: "Unread Messages",
      value: stats.unreadMessages || 0,
      icon: MessageSquare,
      gradient: "from-emerald-500 to-teal-500",
      variant: "gradient" as const,
    },
    {
      label: "Total Clients",
      value: stats.totalClients || 0,
      icon: Users,
      gradient: "from-amber-500 to-orange-500",
      variant: "gradient" as const,
    },
  ];

  const clientStats = [
    {
      label: "Upcoming Appointments",
      value: stats.upcomingAppointments || 0,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      variant: "gradient" as const,
    },
    {
      label: "Unread Messages",
      value: stats.unreadMessages || 0,
      icon: MessageSquare,
      gradient: "from-emerald-500 to-teal-500",
      variant: "gradient" as const,
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews || 0,
      icon: Star,
      gradient: "from-yellow-500 to-amber-500",
      variant: "gradient" as const,
    },
  ];

  const displayStats = userRole === "stylist" ? stylistStats : clientStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
      {displayStats.map((stat, index) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          variant={stat.variant}
          gradient={stat.gradient}
          delay={index * 75}
        />
      ))}
    </div>
  );
};
