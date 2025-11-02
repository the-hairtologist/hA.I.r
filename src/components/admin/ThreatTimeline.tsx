import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Shield, Info, XCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ThreatEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  timestamp: string;
  source: string;
}

export function ThreatTimeline() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['threat-timeline'],
    queryFn: async () => {
      // Aggregate security events from multiple sources
      const [failedTokenAccess, suspiciousConnections] = await Promise.all([
        supabase
          .from('calendar_token_access_log')
          .select('*')
          .eq('success', false)
          .order('accessed_at', { ascending: false })
          .limit(25),

        supabase
          .from('calendar_connections')
          .select('*')
          .eq('suspicious_activity_detected', true)
          .order('updated_at', { ascending: false })
          .limit(25),
      ]);

      const threats: ThreatEvent[] = [];

      // Map failed token access
      failedTokenAccess.data?.forEach(log => {
        threats.push({
          id: log.id,
          type: 'Failed Token Access',
          severity: log.error_message?.includes('rate limit')
            ? 'high'
            : 'medium',
          description: log.error_message || 'Unauthorized token access attempt',
          timestamp: log.accessed_at,
          source: 'Calendar Token System',
        });
      });

      // Map suspicious connections
      suspiciousConnections.data?.forEach(conn => {
        threats.push({
          id: conn.id,
          type: 'Suspicious Activity',
          severity: 'high',
          description: `Suspicious activity detected on ${conn.provider} connection`,
          timestamp: conn.updated_at,
          source: 'Calendar Connections',
        });
      });

      // Sort by timestamp
      return threats.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    refetchInterval: 30000,
  });

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: XCircle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10 border border-destructive/20',
          badge: 'destructive' as const,
          ringColor: 'ring-destructive/20',
        };
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'text-warning',
          bgColor: 'bg-warning/10 border border-warning/20',
          badge: 'destructive' as const,
          ringColor: 'ring-warning/20',
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          color: 'text-secondary',
          bgColor: 'bg-secondary/10 border border-secondary/20',
          badge: 'secondary' as const,
          ringColor: 'ring-secondary/20',
        };
      case 'low':
        return {
          icon: Info,
          color: 'text-info',
          bgColor: 'bg-info/10 border border-info/20',
          badge: 'outline' as const,
          ringColor: 'ring-info/20',
        };
      default:
        return {
          icon: Shield,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted border border-border',
          badge: 'outline' as const,
          ringColor: 'ring-muted',
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
    <Card variant="brutal" className="p-5 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-display font-bold">
          Security Threat Timeline
        </h3>
        <Badge variant="secondary" className="ml-auto font-bold text-xs">
          {events?.length || 0} events
        </Badge>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3 relative">
          {/* Timeline line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-border to-transparent" />

          {events?.map((event, index) => {
            const config = getSeverityConfig(event.severity);
            const Icon = config.icon;

            return (
              <div
                key={event.id}
                className="relative flex gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group animate-slide-up-fade"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-background border-2 ${config.ringColor} ring-4 ring-background z-10 group-hover:scale-125 transition-transform`}
                />

                <div
                  className={`p-3 rounded-xl ${config.bgColor} h-fit flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm`}
                >
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                        {event.type}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {event.source}
                      </p>
                    </div>
                    <Badge
                      variant={config.badge}
                      className="text-[10px] uppercase tracking-wider font-bold flex-shrink-0 shadow-sm"
                    >
                      {event.severity}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground/70 font-medium">
                      {formatDistanceToNow(new Date(event.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {!events?.length && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="p-4 rounded-full bg-success/10 border border-success/20 mb-4">
                <Shield className="h-10 w-10 text-success" />
              </div>
              <p className="text-lg font-display font-bold text-foreground mb-2">
                All Clear!
              </p>
              <p className="text-sm text-muted-foreground">
                No security threats detected
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
