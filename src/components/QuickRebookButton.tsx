import { useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/platform/haptics";
import { showCelebration } from "./CelebrationToast";
import { cn } from "@/lib/utils";

interface QuickRebookButtonProps {
  appointmentId: string;
  clientId: string;
  clientName: string;
  serviceType: string;
  stylistId: string;
  duration: number;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export const QuickRebookButton = ({
  appointmentId,
  clientId,
  clientName,
  serviceType,
  stylistId,
  duration,
  className,
  variant = "default"
}: QuickRebookButtonProps) => {
  const [isRebooking, setIsRebooking] = useState(false);

  const handleQuickRebook = async () => {
    setIsRebooking(true);
    haptic.tap();

    try {
      // Get original appointment details
      const { data: originalAppt, error: fetchError } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate suggested date (4-6 weeks from original appointment)
      const originalDate = new Date(originalAppt.appointment_date);
      const suggestedDate = new Date(originalDate);
      suggestedDate.setDate(suggestedDate.getDate() + 35); // 5 weeks

      // Get stylist's available slots around that date
      const { data: schedule } = await supabase
        .from("stylist_profiles")
        .select("weekly_schedule")
        .eq("id", stylistId)
        .single();

      // Find next available slot
      const dayOfWeek = suggestedDate.getDay();
      const daySchedule = schedule?.weekly_schedule?.[dayOfWeek];

      if (daySchedule?.is_available && daySchedule.slots?.length > 0) {
        const firstSlot = daySchedule.slots[0];
        const appointmentTime = new Date(suggestedDate);
        const [hours, minutes] = firstSlot.start.split(':');
        appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Create new appointment
        const { error: createError } = await supabase
          .from("appointments")
          .insert({
            client_id: clientId,
            stylist_id: stylistId,
            appointment_date: appointmentTime.toISOString(),
            service_type: serviceType,
            duration: duration,
            status: "pending",
            notes: `Rebooked from appointment on ${originalDate.toLocaleDateString()}`
          });

        if (createError) throw createError;

        // Send notification to client
        const { error: notifError } = await supabase.functions.invoke('send-appointment-confirmation', {
          body: {
            clientId,
            appointmentDate: appointmentTime.toISOString(),
            serviceType,
            isRebook: true
          }
        });

        if (notifError) {
          console.warn('Failed to send notification:', notifError);
        }

        showCelebration("appointment-booked", `${clientName} rebooked for ${appointmentTime.toLocaleDateString()}`);
        haptic.success();
      } else {
        toast.info(`No available slots found. Opening booking page...`, {
          action: {
            label: "Book Manually",
            onClick: () => {
              window.location.href = `/book-appointment?clientId=${clientId}&serviceType=${encodeURIComponent(serviceType)}`;
            }
          }
        });
      }
    } catch (error) {
      console.error('Error rebooking:', error);
      haptic.error();
      toast.error("Failed to rebook appointment");
    } finally {
      setIsRebooking(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleQuickRebook}
      disabled={isRebooking}
      className={cn("gap-2", className)}
    >
      {isRebooking ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Rebooking...
        </>
      ) : (
        <>
          <Calendar className="h-3 w-3" />
          Quick Rebook
        </>
      )}
    </Button>
  );
};
