import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Bell } from "lucide-react";
import { format, differenceInDays, addWeeks } from "date-fns";
import { toast } from "sonner";

interface RebookOpportunity {
  clientId: string;
  clientName: string;
  lastAppointmentDate: Date;
  daysSinceLastVisit: number;
  recommendedRebookDate: Date;
  avgDaysBetweenVisits: number;
  priority: "high" | "medium" | "low";
}

export const SmartRebookReminder = () => {
  const [opportunities, setOpportunities] = useState<RebookOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRebookOpportunities();
  }, []);

  const loadRebookOpportunities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all completed appointments for this stylist
    const { data: appointments } = await supabase
      .from("appointments")
      .select(`
        id,
        client_id,
        appointment_date,
        client_profiles (
          id,
          full_name
        )
      `)
      .eq("stylist_id", user.id)
      .eq("status", "completed")
      .order("appointment_date", { ascending: false });

    if (!appointments) {
      setLoading(false);
      return;
    }

    // Group appointments by client
    const clientMap = new Map<string, any[]>();
    appointments.forEach((apt) => {
      if (!apt.client_id) return;
      if (!clientMap.has(apt.client_id)) {
        clientMap.set(apt.client_id, []);
      }
      clientMap.get(apt.client_id)!.push(apt);
    });

    // Analyze each client for rebook opportunities
    const rebookOps: RebookOpportunity[] = [];
    
    clientMap.forEach((clientApts, clientId) => {
      if (clientApts.length === 0) return;

      // Sort appointments by date
      clientApts.sort((a, b) => 
        new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
      );

      const lastAppointment = clientApts[0];
      const lastAppointmentDate = new Date(lastAppointment.appointment_date);
      const daysSinceLastVisit = differenceInDays(new Date(), lastAppointmentDate);

      // Calculate average days between visits
      let totalDays = 0;
      for (let i = 0; i < clientApts.length - 1; i++) {
        const diff = differenceInDays(
          new Date(clientApts[i].appointment_date),
          new Date(clientApts[i + 1].appointment_date)
        );
        totalDays += diff;
      }
      const avgDaysBetweenVisits = clientApts.length > 1 
        ? Math.round(totalDays / (clientApts.length - 1))
        : 42; // Default to 6 weeks

      // Determine if client is due for rebook
      const isDue = daysSinceLastVisit >= avgDaysBetweenVisits * 0.8;
      
      if (isDue) {
        let priority: "high" | "medium" | "low" = "low";
        if (daysSinceLastVisit > avgDaysBetweenVisits * 1.2) {
          priority = "high";
        } else if (daysSinceLastVisit > avgDaysBetweenVisits) {
          priority = "medium";
        }

        rebookOps.push({
          clientId,
          clientName: lastAppointment.client_profiles?.full_name || "Unknown Client",
          lastAppointmentDate,
          daysSinceLastVisit,
          recommendedRebookDate: addWeeks(lastAppointmentDate, Math.ceil(avgDaysBetweenVisits / 7)),
          avgDaysBetweenVisits,
          priority,
        });
      }
    });

    // Sort by priority
    rebookOps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setOpportunities(rebookOps);
    setLoading(false);
  };

  const sendRebookReminder = async (opportunity: RebookOpportunity) => {
    toast.success(`Rebook reminder scheduled for ${opportunity.clientName}`);
    // In production, this would call an edge function to send SMS/email
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return null;
  }

  if (opportunities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Smart Rebook Reminders</CardTitle>
        </div>
        <CardDescription>
          Clients who are due for their next appointment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {opportunities.slice(0, 5).map((opportunity) => (
            <div
              key={opportunity.clientId}
              className="flex items-center justify-between p-3 rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{opportunity.clientName}</h4>
                  <Badge variant={getPriorityColor(opportunity.priority)}>
                    {opportunity.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{opportunity.daysSinceLastVisit} days since last visit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Last: {format(opportunity.lastAppointmentDate, "MMM d")}</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendRebookReminder(opportunity)}
                className="gap-2"
                aria-label={`Send rebook reminder to ${opportunity.clientName}`}
              >
                <Bell className="h-4 w-4" />
                Remind
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
