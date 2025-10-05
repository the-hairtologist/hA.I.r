import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isToday, startOfDay, endOfDay } from "date-fns";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";

interface NotificationManagerProps {
  userId: string;
  userRole: "stylist" | "client";
}

export const NotificationManager = ({ userId, userRole }: NotificationManagerProps) => {
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    if (userRole !== "stylist") return;

    // Initial check
    checkForNotifications();

    // Check every 10 minutes
    const interval = setInterval(checkForNotifications, 600000);

    return () => clearInterval(interval);
  }, [userId, userRole]);

  const checkForNotifications = async () => {
    try {
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!stylistProfile) return;

      // Check for today's appointments
      await checkTodayAppointments(stylistProfile.id);

      // Check for pending client requests (color formulas from yesterday/today)
      await checkPendingFormulas(stylistProfile.id);

      setLastCheck(new Date());
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  const checkTodayAppointments = async (stylistId: string) => {
    const today = new Date();
    const { data: appointments } = await supabase
      .from("appointments")
      .select(`
        *,
        client:client_profiles(full_name)
      `)
      .eq("stylist_id", stylistId)
      .gte("appointment_date", format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss"))
      .lte("appointment_date", format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss"))
      .in("status", ["scheduled", "confirmed"])
      .order("appointment_date");

    if (appointments && appointments.length > 0) {
      const count = appointments.length;
      const nextAppt = appointments[0];
      
      // Only show if it's morning and we haven't shown today
      const lastShown = localStorage.getItem("last_daily_notification");
      const today = format(new Date(), "yyyy-MM-dd");
      
      if (lastShown !== today) {
        toast.info(
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">You have {count} appointment{count > 1 ? "s" : ""} today</p>
              <p className="text-xs text-muted-foreground">
                Next: {nextAppt.client?.full_name} at {format(new Date(nextAppt.appointment_date), "h:mm a")}
              </p>
            </div>
          </div>,
          { duration: 5000 }
        );
        localStorage.setItem("last_daily_notification", today);
      }
    }
  };

  const checkPendingFormulas = async (stylistId: string) => {
    // Check for clients with color appointments but no recent formulas
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: colorAppts } = await supabase
      .from("appointments")
      .select(`
        id,
        client_id,
        appointment_date,
        client:client_profiles(
          id,
          full_name
        )
      `)
      .eq("stylist_id", stylistId)
      .eq("status", "completed")
      .ilike("service_type", "%color%")
      .gte("appointment_date", format(twoDaysAgo, "yyyy-MM-dd"));

    if (colorAppts && colorAppts.length > 0) {
      // Check which ones don't have formulas yet
      for (const appt of colorAppts) {
        const { data: formula } = await supabase
          .from("formulas")
          .select("id")
          .eq("client_id", appt.client_id)
          .eq("stylist_id", stylistId)
          .gte("created_at", appt.appointment_date)
          .maybeSingle();

        if (!formula) {
          // No formula saved yet - suggest saving it
          const notifKey = `formula_reminder_${appt.id}`;
          if (!localStorage.getItem(notifKey)) {
            toast(
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Don't forget to save {appt.client?.full_name}'s formula! 💅</p>
                  <p className="text-xs text-muted-foreground">
                    Archive the perfect mix while it's fresh in your mind
                  </p>
                </div>
              </div>,
              {
                duration: 8000,
                action: {
                  label: "Save Now",
                  onClick: () => window.location.href = "/formulas",
                },
              }
            );
            localStorage.setItem(notifKey, "shown");
          }
        }
      }
    }
  };

  return null; // This component doesn't render anything
};
