import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, Clock, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentInsightsProps {
  appointment: {
    id: string;
    appointment_date: string;
    client?: {
      id: string;
      user?: { full_name: string };
    };
    status: string;
    service_type?: string;
  };
  clientHistory?: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    averageRevenue?: number;
  };
}

export const AppointmentInsights = ({
  appointment,
  clientHistory
}: AppointmentInsightsProps) => {
  const calculateNoShowRisk = () => {
    if (!clientHistory || clientHistory.totalAppointments === 0) {
      return { risk: 'unknown', score: 0, message: 'New client - no history available' };
    }

    const noShowRate = clientHistory.noShowAppointments / clientHistory.totalAppointments;
    const cancelRate = clientHistory.cancelledAppointments / clientHistory.totalAppointments;
    const combinedRate = (noShowRate + cancelRate * 0.5) * 100;

    // Check appointment timing
    const appointmentDate = new Date(appointment.appointment_date);
    const now = new Date();
    const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Weekend appointments have slightly higher no-show rates
    const isWeekend = [0, 6].includes(appointmentDate.getDay());
    const weekendFactor = isWeekend ? 1.2 : 1;

    const finalScore = Math.min(100, Math.round(combinedRate * weekendFactor));

    let risk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let message = '';

    if (finalScore >= 40) {
      risk = 'critical';
      message = `${finalScore}% no-show risk. Send confirmation & reminder.`;
    } else if (finalScore >= 25) {
      risk = 'high';
      message = `${finalScore}% no-show risk. Send reminder 24h before.`;
    } else if (finalScore >= 15) {
      risk = 'medium';
      message = `${finalScore}% no-show risk. Standard reminder recommended.`;
    } else {
      risk = 'low';
      message = `${finalScore}% no-show risk. Client has reliable history.`;
    }

    return { risk, score: finalScore, message };
  };

  const calculateRevenuePotential = () => {
    if (!clientHistory?.averageRevenue) {
      return { potential: 'unknown', value: 0, message: 'Revenue data not available' };
    }

    const avgRevenue = clientHistory.averageRevenue;
    let potential: 'low' | 'medium' | 'high' | 'vip' = 'medium';
    let message = '';

    if (avgRevenue >= 200) {
      potential = 'vip';
      message = `VIP Client - $${avgRevenue.toFixed(0)} avg revenue`;
    } else if (avgRevenue >= 150) {
      potential = 'high';
      message = `High value - $${avgRevenue.toFixed(0)} avg revenue`;
    } else if (avgRevenue >= 100) {
      potential = 'medium';
      message = `Standard - $${avgRevenue.toFixed(0)} avg revenue`;
    } else {
      potential = 'low';
      message = `Entry level - $${avgRevenue.toFixed(0)} avg revenue`;
    }

    return { potential, value: avgRevenue, message };
  };

  const getOptimalRebookTime = () => {
    const serviceType = appointment.service_type?.toLowerCase() || '';
    
    if (serviceType.includes('color') || serviceType.includes('highlight')) {
      return { weeks: 6, message: 'Color services typically need refreshing every 6-8 weeks' };
    } else if (serviceType.includes('cut') || serviceType.includes('trim')) {
      return { weeks: 4, message: 'Haircuts usually need maintenance every 4-6 weeks' };
    } else if (serviceType.includes('treatment') || serviceType.includes('conditioning')) {
      return { weeks: 3, message: 'Treatments work best with regular 3-4 week schedule' };
    }
    
    return { weeks: 6, message: 'Recommended rebooking interval based on service type' };
  };

  const noShowRisk = calculateNoShowRisk();
  const revenuePotential = calculateRevenuePotential();
  const rebookTiming = getOptimalRebookTime();

  return (
    <div className="space-y-3">
      {/* No-Show Risk */}
      {noShowRisk.risk !== 'unknown' && (
        <Alert className={cn(
          "border-l-4",
          noShowRisk.risk === 'critical' && "border-red-500 bg-red-50",
          noShowRisk.risk === 'high' && "border-orange-500 bg-orange-50",
          noShowRisk.risk === 'medium' && "border-yellow-500 bg-yellow-50",
          noShowRisk.risk === 'low' && "border-green-500 bg-green-50"
        )}>
          <AlertTriangle className={cn(
            "h-4 w-4",
            noShowRisk.risk === 'critical' && "text-red-500",
            noShowRisk.risk === 'high' && "text-orange-500",
            noShowRisk.risk === 'medium' && "text-yellow-500",
            noShowRisk.risk === 'low' && "text-green-500"
          )} />
          <AlertDescription>
            <div className="font-semibold">No-Show Prediction</div>
            <div className="text-sm text-muted-foreground">{noShowRisk.message}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Revenue Potential */}
      {revenuePotential.potential !== 'unknown' && (
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className={cn(
            "h-4 w-4",
            revenuePotential.potential === 'vip' && "text-purple-500",
            revenuePotential.potential === 'high' && "text-blue-500",
            revenuePotential.potential === 'medium' && "text-green-500",
            revenuePotential.potential === 'low' && "text-gray-500"
          )} />
          <span className="text-muted-foreground">{revenuePotential.message}</span>
        </div>
      )}

      {/* Rebook Timing */}
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-blue-500" />
        <span className="text-muted-foreground">
          Suggest rebooking in {rebookTiming.weeks} weeks
        </span>
      </div>

      {/* Client Reliability Badge */}
      {clientHistory && clientHistory.totalAppointments > 0 && (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            {clientHistory.completedAppointments} of {clientHistory.totalAppointments} appointments completed
          </span>
        </div>
      )}
    </div>
  );
};