import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Shield, Clock, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SecurityMetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["security-metrics"],
    queryFn: async () => {
      const [tokenAccessLog, auditLogs, calendarConnections] = await Promise.all([
        supabase
          .from("calendar_token_access_log")
          .select("*", { count: "exact" })
          .gte("accessed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .eq("success", false),
        
        supabase
          .from("audit_logs")
          .select("*", { count: "exact" })
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        
        supabase
          .from("calendar_connections")
          .select("*", { count: "exact" })
          .eq("suspicious_activity_detected", true),
      ]);

      return {
        failedLoginAttempts: tokenAccessLog.count || 0,
        recentAuditLogs: auditLogs.count || 0,
        suspiciousActivities: calendarConnections.count || 0,
        medicalDataAccesses: 0, // Placeholder - would need medical_data_access_log table
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const metricCards = [
    {
      title: "Failed Login Attempts",
      value: metrics?.failedLoginAttempts || 0,
      subtitle: "Last 24 hours",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Security Events",
      value: metrics?.recentAuditLogs || 0,
      subtitle: "Last 7 days",
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Suspicious Activities",
      value: metrics?.suspiciousActivities || 0,
      subtitle: "Unresolved",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Data Access Logs",
      value: metrics?.medicalDataAccesses || 0,
      subtitle: "Last 30 days",
      icon: Database,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => (
        <Card 
          key={metric.title} 
          variant="brutal"
          className="group p-5 transition-all duration-300 hover:scale-[1.02] animate-slide-up-fade cursor-pointer"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 truncate">
                {metric.title}
              </p>
              <p className="text-3xl sm:text-4xl font-display font-bold tabular-nums animate-number-pop">
                {metric.value}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground/60 font-medium">
                {metric.subtitle}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${metric.bgColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${metric.color}`} />
            </div>
          </div>
          
          {/* Decorative bottom accent */}
          <div className="mt-4 pt-3 border-t-2 border-border/50">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
