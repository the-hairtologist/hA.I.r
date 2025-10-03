import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addWeeks, format, isSameDay, isBefore, startOfDay } from "date-fns";
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

interface RebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  onSuccess: () => void;
}

export const RebookDialog = ({ open, onOpenChange, appointment, onSuccess }: RebookDialogProps) => {
  const [selectedWeeks, setSelectedWeeks] = useState<number | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [stylistSchedule, setStylistSchedule] = useState<any>(null);

  const weekOptions = [4, 6, 8, 10, 12];

  // Load stylist schedule when dialog opens
  useEffect(() => {
    if (open && appointment) {
      loadStylistSchedule();
    }
  }, [open, appointment]);

  // Update available slots when weeks are selected
  useEffect(() => {
    if (selectedWeeks && stylistSchedule) {
      updateAvailableTimeSlots();
    } else {
      setAvailableTimeSlots([]);
      setSelectedTime(null);
    }
  }, [selectedWeeks, stylistSchedule]);

  const loadStylistSchedule = async () => {
    try {
      const { data: schedule } = await supabase
        .from("stylist_profiles")
        .select("weekly_schedule")
        .eq("id", appointment.stylist_id)
        .single();

      if (schedule) {
        setStylistSchedule(schedule.weekly_schedule);
      }
    } catch (error) {
      console.error("Error loading schedule:", error);
    }
  };

  const getProposedDate = () => {
    if (!selectedWeeks) return null;
    return addWeeks(new Date(appointment.appointment_date), selectedWeeks);
  };

  const updateAvailableTimeSlots = async () => {
    setChecking(true);
    const proposedDate = getProposedDate();
    if (!proposedDate) return;

    try {
      // Check if date is in the past
      if (isBefore(startOfDay(proposedDate), startOfDay(new Date()))) {
        toast.error("Cannot book appointments in the past");
        setAvailableTimeSlots([]);
        setSelectedTime(null);
        setChecking(false);
        return;
      }

      // Get day of week schedule
      const dayName = format(proposedDate, "EEEE").toLowerCase();
      const daySchedule = stylistSchedule[dayName];

      if (!daySchedule || !daySchedule.enabled) {
        setAvailableTimeSlots([]);
        setSelectedTime(null);
        setChecking(false);
        return;
      }

      // Generate time slots
      const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);

      // Check existing appointments for that day
      const { data: existingAppointments } = await supabase
        .from("appointments")
        .select("appointment_date, duration_minutes")
        .eq("stylist_id", appointment.stylist_id)
        .gte("appointment_date", format(proposedDate, "yyyy-MM-dd"))
        .lt("appointment_date", format(addWeeks(proposedDate, 1), "yyyy-MM-dd"))
        .neq("status", "cancelled");

      // Filter out booked slots
      const availableSlots = slots.filter((slot) => {
        const slotDateTime = new Date(`${format(proposedDate, "yyyy-MM-dd")}T${slot}:00`);
        
        return !existingAppointments?.some((apt: any) => {
          const aptStart = new Date(apt.appointment_date);
          const aptEnd = new Date(aptStart.getTime() + apt.duration_minutes * 60000);
          const slotEnd = new Date(slotDateTime.getTime() + (appointment.duration_minutes || 90) * 60000);
          
          return (
            (slotDateTime >= aptStart && slotDateTime < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (slotDateTime <= aptStart && slotEnd >= aptEnd)
          );
        });
      });

      setAvailableTimeSlots(availableSlots);
      
      // Auto-select the first available slot or the same time as original appointment
      const originalTime = format(new Date(appointment.appointment_date), "HH:mm");
      if (availableSlots.includes(originalTime)) {
        setSelectedTime(originalTime);
      } else if (availableSlots.length > 0) {
        setSelectedTime(availableSlots[0]);
      } else {
        setSelectedTime(null);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Error checking availability");
    } finally {
      setChecking(false);
    }
  };

  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      slots.push(`${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`);
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }
    
    return slots;
  };

  const handleRebook = async () => {
    if (!selectedWeeks || !selectedTime) {
      toast.error("Please select a time");
      return;
    }

    const proposedDate = getProposedDate();
    if (!proposedDate) return;

    setLoading(true);
    try {
      const appointmentDateTime = new Date(`${format(proposedDate, "yyyy-MM-dd")}T${selectedTime}:00`);

      const { error } = await supabase.from("appointments").insert({
        stylist_id: appointment.stylist_id,
        client_id: appointment.client_id,
        service_type: appointment.service_type,
        appointment_date: appointmentDateTime.toISOString(),
        duration_minutes: appointment.duration_minutes,
        status: "scheduled",
        notes: `Rebooked from ${format(new Date(appointment.appointment_date), "MMM d, yyyy")}`,
      });

      if (error) throw error;

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-semibold">Appointment Rebooked!</p>
            <p className="text-sm">{format(appointmentDateTime, "MMM d, yyyy 'at' h:mm a")}</p>
          </div>
        </div>
      );
      
      onSuccess();
      onOpenChange(false);
      
      // Reset state
      setSelectedWeeks(null);
      setSelectedTime(null);
    } catch (error: any) {
      console.error("Error rebooking:", error);
      toast.error("Failed to rebook appointment");
    } finally {
      setLoading(false);
    }
  };

  const proposedDate = getProposedDate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Quick Rebook
          </DialogTitle>
          <DialogDescription>
            Rebook {appointment?.client?.user?.full_name} for {appointment?.service_type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Week Selection */}
          <div>
            <Label className="mb-3 block">How many weeks from original appointment?</Label>
            <div className="grid grid-cols-5 gap-2">
              {weekOptions.map((weeks) => (
                <Button
                  key={weeks}
                  variant={selectedWeeks === weeks ? "default" : "outline"}
                  className={selectedWeeks === weeks ? "border-2 border-primary" : ""}
                  onClick={() => setSelectedWeeks(weeks)}
                >
                  {weeks}w
                </Button>
              ))}
            </div>
            {proposedDate && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {format(proposedDate, "EEEE, MMMM d, yyyy")}
              </p>
            )}
          </div>

          {/* Time Slot Selection */}
          {selectedWeeks && (
            <div>
              <Label className="mb-3 block flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Times
              </Label>
              
              {checking ? (
                <div className="text-center py-8 text-muted-foreground">
                  Checking availability...
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
                  <p className="text-sm text-muted-foreground">
                    No available times on this day. Try a different week.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                    >
                      {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleRebook}
              disabled={!selectedTime || loading || checking}
            >
              {loading ? "Booking..." : "Confirm Rebook"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
