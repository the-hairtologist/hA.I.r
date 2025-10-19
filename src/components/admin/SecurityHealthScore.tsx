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
    if (score >= 90) return { label: "Excellent", color: "text-success", variant: "default" as const };
    if (score >= 70) return { label: "Good", color: "text-info", variant: "secondary" as const };
    if (score >= 50) return { label: "Fair", color: "text-warning", variant: "secondary" as const };
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
    <Card 
      variant="brutal"
      className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative animate-fade-in"
    >
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse-ring" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-pulse-ring" style={{ animationDelay: '1.5s' }} />
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Score Display */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative animate-float">
            <div className="p-5 rounded-2xl bg-background shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-2 border-primary/20">
              <Shield className={`h-10 w-10 ${status.color} drop-shadow-sm`} />
            </div>
            {healthData?.trend && healthData.trend !== "stable" && (
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-background shadow-lg border-2 border-primary/20 animate-bounce-gentle">
                <TrendIcon
                  className={`h-5 w-5 ${
                    healthData.trend === "up" ? "text-success" : "text-destructive"
                  }`}
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl sm:text-6xl font-display font-bold tabular-nums bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                {score}
              </span>
              <span className="text-xl sm:text-2xl text-muted-foreground font-medium">/100</span>
            </div>
            <Badge 
              variant={status.variant} 
              className="text-xs uppercase tracking-wider font-bold px-3 py-1 shadow-sm"
            >
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground uppercase tracking-wider text-xs">Security Health</span>
            <span className="font-bold text-foreground tabular-nums">{score}%</span>
          </div>
          <div className="relative">
            <Progress value={score} className="h-4 shadow-inner" />
            {/* Shimmer effect on progress */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
            Based on <span className="font-bold text-foreground">{healthData?.metrics.recentAudits || 0}</span> recent security events
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8 pt-6 border-t-2 border-border/50">
        {[
          { label: "Failed Logins (24h)", value: healthData?.metrics.failedLogins || 0 },
          { label: "Suspicious Activity", value: healthData?.metrics.suspiciousActivity || 0 },
          { label: "Security Events (7d)", value: healthData?.metrics.recentAudits || 0 },
          { label: "Active Users", value: healthData?.metrics.activeUsers || 0 },
        ].map((metric, idx) => (
          <div key={idx} className="group transition-all duration-300 hover:scale-105">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
              {metric.label}
            </p>
            <p className="text-xl sm:text-2xl font-display font-bold tabular-nums group-hover:text-primary transition-colors">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
