import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientRiskIndicatorProps {
  lastAppointmentDate: string | null;
  totalAppointments: number;
  missedAppointments?: number;
  onActionClick?: () => void;
}

export const ClientRiskIndicator = ({
  lastAppointmentDate,
  totalAppointments,
  missedAppointments = 0,
  onActionClick
}: ClientRiskIndicatorProps) => {
  const calculateRisk = () => {
    if (!lastAppointmentDate) {
      return { level: 'new', score: 0, days: 0 };
    }

    const daysSinceLastVisit = Math.floor(
      (new Date().getTime() - new Date(lastAppointmentDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const missedRate = totalAppointments > 0 ? missedAppointments / totalAppointments : 0;

    let score = 0;
    if (daysSinceLastVisit > 120) score += 60;
    else if (daysSinceLastVisit > 90) score += 40;
    else if (daysSinceLastVisit > 60) score += 20;

    if (missedRate > 0.3) score += 30;
    else if (missedRate > 0.2) score += 20;
    else if (missedRate > 0.1) score += 10;

    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (score >= 70) level = 'critical';
    else if (score >= 50) level = 'high';
    else if (score >= 30) level = 'medium';

    return { level, score, days: daysSinceLastVisit };
  };

  const risk = calculateRisk();

  const getRiskConfig = () => {
    switch (risk.level) {
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'text-destructive border-destructive/30 bg-destructive/10',
          badgeVariant: 'destructive' as const,
          title: '⚠️ High Churn Risk',
          message: `${risk.days} days since last visit. Immediate action recommended.`,
          action: 'Send Re-engagement Message'
        };
      case 'high':
        return {
          icon: TrendingDown,
          color: 'text-warning border-warning/30 bg-warning/10',
          badgeVariant: 'default' as const,
          title: '⚡ At Risk',
          message: `${risk.days} days since last visit. Consider reaching out.`,
          action: 'Schedule Follow-up'
        };
      case 'medium':
        return {
          icon: Clock,
          color: 'text-warning/80 border-warning/20 bg-warning/5',
          badgeVariant: 'secondary' as const,
          title: '👀 Watch List',
          message: `${risk.days} days since last visit. Monitor engagement.`,
          action: 'Send Reminder'
        };
      case 'new':
        return {
          icon: CheckCircle,
          color: 'text-info border-info/30 bg-info/10',
          badgeVariant: 'outline' as const,
          title: '🎉 New Client',
          message: 'No appointment history yet. Great opportunity!',
          action: 'Book First Appointment'
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-success border-success/30 bg-success/10',
          badgeVariant: 'outline' as const,
          title: '✅ Healthy',
          message: 'Client is engaged and active.',
          action: null
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  if (risk.level === 'low') {
    return (
      <Badge variant={config.badgeVariant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.title}
      </Badge>
    );
  }

  return (
    <Alert className={cn("border-l-4", config.color)}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <div>
          <div className="font-semibold">{config.title}</div>
          <div className="text-sm text-muted-foreground">{config.message}</div>
          {risk.score > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Risk Score: {risk.score}/100
            </div>
          )}
        </div>
        {config.action && onActionClick && (
          <button
            onClick={onActionClick}
            className="text-sm font-medium underline hover:no-underline min-h-[44px] min-w-[44px] flex items-center justify-start"
            aria-label={config.action}
          >
            {config.action}
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};