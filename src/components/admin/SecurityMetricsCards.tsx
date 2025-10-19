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
      {metricCards.map((metric) => (
        <Card key={metric.title} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {metric.title}
              </p>
              <p className="text-2xl sm:text-3xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
            </div>
            <div className={`p-2 rounded-lg ${metric.bgColor} flex-shrink-0`}>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
