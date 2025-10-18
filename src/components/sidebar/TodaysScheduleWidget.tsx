/**
 * Today's Schedule Widget
 * Shows upcoming appointments for stylists in sidebar
 */

import { useState, useEffect } from "react";
import { Calendar, Clock, User, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, isTomorrow } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  service_type: string;
  client_id: string;
  client_name?: string;
}

export function TodaysScheduleWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      if (!user) return;

      try {
        const { data: stylistProfile } = await supabase
          .from("stylist_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!stylistProfile) return;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            service_type,
            client_id,
            client_profiles!inner(full_name)
          `)
          .eq("stylist_id", stylistProfile.id)
          .gte("appointment_date", startOfToday.toISOString())
          .lte("appointment_date", endOfToday.toISOString())
          .eq("status", "scheduled")
          .order("appointment_date", { ascending: true })
          .limit(3);

        if (error) throw error;

        const formattedData = data?.map(apt => ({
          ...apt,
          client_name: (apt.client_profiles as any)?.full_name || "Client"
        })) || [];

        setAppointments(formattedData);
      } catch (error) {
        console.error("Error fetching today's appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysAppointments();
  }, [user]);

  if (loading || appointments.length === 0) return null;

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  return (
    <div className="px-3 py-3 border-b bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Today's Schedule</span>
        </div>
        <button
          onClick={() => navigate("/appointments")}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-2">
        {appointments.map((apt) => {
          const aptDate = new Date(apt.appointment_date);
          
          return (
            <button
              key={apt.id}
              onClick={() => navigate("/appointments")}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
            >
              <div className="flex-shrink-0 w-12 text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  {format(aptDate, "HH:mm")}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{apt.client_name}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {apt.service_type}
                </div>
              </div>
              
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {appointments.length === 0 && (
        <div className="text-xs text-muted-foreground text-center py-2">
          No appointments today
        </div>
      )}
    </div>
  );
}
