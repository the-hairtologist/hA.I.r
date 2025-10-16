import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevenueOptimizerProps {
  appointments: Array<{
    id: string;
    appointment_date: string;
    status: string;
    service_type?: string;
    client?: {
      id: string;
      user?: { full_name: string };
    };
  }>;
  clientData?: Array<{
    id: string;
    last_appointment_date: string | null;
    total_appointments: number;
    average_revenue?: number;
  }>;
}

export const RevenueOptimizer = ({ appointments, clientData = [] }: RevenueOptimizerProps) => {
  const analyzeRevenue = () => {
    const now = new Date();
    const thisWeek = appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= now && aptDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    // Calculate potential revenue from current appointments
    const currentRevenue = thisWeek.length * 120; // Estimated average

    // Find clients who should rebook
    const rebookOpportunities = clientData.filter(client => {
      if (!client.last_appointment_date) return false;
      const daysSinceVisit = Math.floor(
        (now.getTime() - new Date(client.last_appointment_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceVisit >= 45 && daysSinceVisit <= 90;
    });

    const potentialRebookRevenue = rebookOpportunities.reduce(
      (sum, client) => sum + (client.average_revenue || 100), 
      0
    );

    // Calculate empty time slots (assuming 8-hour days, 1-hour slots)
    const totalSlots = 7 * 8; // 7 days * 8 hours
    const bookedSlots = thisWeek.length;
    const emptySlots = Math.max(0, totalSlots - bookedSlots);
    const potentialEmptySlotRevenue = emptySlots * 100; // Conservative estimate

    return {
      currentRevenue,
      thisWeekAppointments: thisWeek.length,
      rebookOpportunities: rebookOpportunities.length,
      potentialRebookRevenue,
      emptySlots,
      potentialEmptySlotRevenue,
      totalPotential: currentRevenue + potentialRebookRevenue + potentialEmptySlotRevenue
    };
  };

  const analysis = analyzeRevenue();
  const upliftPercentage = Math.round(
    ((analysis.totalPotential - analysis.currentRevenue) / analysis.currentRevenue) * 100
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Weekly Revenue Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Week Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">This Week</div>
            <div className="text-2xl font-bold text-green-600">
              ${analysis.currentRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {analysis.thisWeekAppointments} appointments
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Potential</div>
            <div className="text-2xl font-bold text-blue-600">
              ${analysis.totalPotential.toLocaleString()}
            </div>
            <Badge variant={upliftPercentage > 30 ? "default" : "secondary"}>
              +{upliftPercentage}% possible
            </Badge>
          </div>
        </div>

        {/* Opportunities */}
        <div className="space-y-3 border-t pt-4">
          <div className="text-sm font-semibold">Growth Opportunities</div>

          {analysis.rebookOpportunities > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium">
                  {analysis.rebookOpportunities} Rebook Opportunities
                </div>
                <div className="text-xs text-muted-foreground">
                  Potential revenue: ${analysis.potentialRebookRevenue.toLocaleString()}
                </div>
                <button className="text-xs font-medium text-blue-600 underline hover:no-underline">
                  Send rebook reminders
                </button>
              </div>
            </div>
          )}

          {analysis.emptySlots > 10 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium">
                  {analysis.emptySlots} Empty Time Slots
                </div>
                <div className="text-xs text-muted-foreground">
                  Potential revenue: ${analysis.potentialEmptySlotRevenue.toLocaleString()}
                </div>
                <button className="text-xs font-medium text-yellow-600 underline hover:no-underline">
                  Fill with waitlist clients
                </button>
              </div>
            </div>
          )}

          {analysis.rebookOpportunities === 0 && analysis.emptySlots < 10 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <DollarSign className="h-4 w-4" />
              <span>Great job! Your week is well-optimized.</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">Quick Actions</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              🔍 View At-Risk Clients
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              📧 Send Batch Reminders
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              📊 Revenue Report
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};