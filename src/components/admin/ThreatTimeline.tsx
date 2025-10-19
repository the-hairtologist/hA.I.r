import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, Info, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ThreatEvent {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  timestamp: string;
  source: string;
}

export function ThreatTimeline() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["threat-timeline"],
    queryFn: async () => {
      // Aggregate security events from multiple sources
      const [failedTokenAccess, suspiciousConnections] = await Promise.all([
        supabase
          .from("calendar_token_access_log")
          .select("*")
          .eq("success", false)
          .order("accessed_at", { ascending: false })
          .limit(25),
        
        supabase
          .from("calendar_connections")
          .select("*")
          .eq("suspicious_activity_detected", true)
          .order("updated_at", { ascending: false })
          .limit(25),
      ]);

      const threats: ThreatEvent[] = [];

      // Map failed token access
      failedTokenAccess.data?.forEach((log) => {
        threats.push({
          id: log.id,
          type: "Failed Token Access",
          severity: log.error_message?.includes("rate limit") ? "high" : "medium",
          description: log.error_message || "Unauthorized token access attempt",
          timestamp: log.accessed_at,
          source: "Calendar Token System",
        });
      });

      // Map suspicious connections
      suspiciousConnections.data?.forEach((conn) => {
        threats.push({
          id: conn.id,
          type: "Suspicious Activity",
          severity: "high",
          description: `Suspicious activity detected on ${conn.provider} connection`,
          timestamp: conn.updated_at,
          source: "Calendar Connections",
        });
      });

      // Sort by timestamp
      return threats.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    refetchInterval: 30000,
  });

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          badge: "destructive" as const,
        };
      case "high":
        return {
          icon: AlertTriangle,
          color: "text-orange-600",
          bgColor: "bg-orange-100 dark:bg-orange-950",
          badge: "destructive" as const,
        };
      case "medium":
        return {
          icon: AlertTriangle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100 dark:bg-yellow-950",
          badge: "secondary" as const,
        };
      case "low":
        return {
          icon: Info,
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-950",
          badge: "outline" as const,
        };
      default:
        return {
          icon: Shield,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          badge: "outline" as const,
        };
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Security Threat Timeline</h3>
        <Badge variant="secondary" className="ml-auto">
          {events?.length || 0} events
        </Badge>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {events?.map((event) => {
            const config = getSeverityConfig(event.severity);
            const Icon = config.icon;

            return (
              <div
                key={event.id}
                className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${config.bgColor} h-fit flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.type}</p>
                      <p className="text-xs text-muted-foreground">{event.source}</p>
                    </div>
                    <Badge variant={config.badge} className="text-xs flex-shrink-0">
                      {event.severity}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {!events?.length && (
            <div className="text-center py-8 text-muted-foreground">
              No security threats detected
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
