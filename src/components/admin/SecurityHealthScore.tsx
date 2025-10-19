import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SecurityHealthScore() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ["security-health"],
    queryFn: async () => {
      // Calculate security health based on multiple factors
      const [
        failedLogins,
        suspiciousActivity,
        recentAudits,
        activeUsers,
      ] = await Promise.all([
        supabase
          .from("calendar_token_access_log")
          .select("*", { count: "exact" })
          .eq("success", false)
          .gte("accessed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        
        supabase
          .from("calendar_connections")
          .select("*", { count: "exact" })
          .eq("suspicious_activity_detected", true),
        
        supabase
          .from("audit_logs")
          .select("*", { count: "exact" })
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        
        supabase
          .from("profiles")
          .select("*", { count: "exact" }),
      ]);

      // Calculate score (0-100)
      let score = 100;
      
      // Deduct points for security issues
      score -= Math.min((failedLogins.count || 0) * 2, 20); // Max -20 for failed logins
      score -= Math.min((suspiciousActivity.count || 0) * 10, 30); // Max -30 for suspicious activity
      
      // Cap at 0-100
      score = Math.max(0, Math.min(100, score));

      // Determine trend (simplified - would use historical data in production)
      const trend = score >= 90 ? "up" : score < 70 ? "down" : "stable";

      return {
        score,
        trend,
        metrics: {
          failedLogins: failedLogins.count || 0,
          suspiciousActivity: suspiciousActivity.count || 0,
          recentAudits: recentAudits.count || 0,
          activeUsers: activeUsers.count || 0,
        },
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getScoreStatus = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-green-600", variant: "default" as const };
    if (score >= 70) return { label: "Good", color: "text-blue-600", variant: "secondary" as const };
    if (score >= 50) return { label: "Fair", color: "text-yellow-600", variant: "secondary" as const };
    return { label: "At Risk", color: "text-destructive", variant: "destructive" as const };
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }

  const score = healthData?.score || 0;
  const status = getScoreStatus(score);
  const TrendIcon = healthData?.trend === "up" ? TrendingUp : TrendingDown;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-4 rounded-full bg-background shadow-lg">
              <Shield className={`h-8 w-8 ${status.color}`} />
            </div>
            {healthData?.trend && healthData.trend !== "stable" && (
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background shadow">
                <TrendIcon
                  className={`h-4 w-4 ${
                    healthData.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-4xl font-bold">{score}</span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <Badge variant={status.variant} className="text-xs">
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Security Health</span>
            <span className="font-medium">{score}%</span>
          </div>
          <Progress value={score} className="h-3" />
          <p className="text-xs text-muted-foreground">
            Based on {healthData?.metrics.recentAudits || 0} recent security events
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div>
          <p className="text-xs text-muted-foreground">Failed Logins (24h)</p>
          <p className="text-lg font-bold">{healthData?.metrics.failedLogins || 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Suspicious Activity</p>
          <p className="text-lg font-bold">{healthData?.metrics.suspiciousActivity || 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Security Events (7d)</p>
          <p className="text-lg font-bold">{healthData?.metrics.recentAudits || 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Active Users</p>
          <p className="text-lg font-bold">{healthData?.metrics.activeUsers || 0}</p>
        </div>
      </div>
    </Card>
  );
}
