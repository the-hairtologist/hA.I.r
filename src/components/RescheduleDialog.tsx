import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import {
  format,
  setHours,
  setMinutes,
  addHours,
  isBefore,
  startOfDay,
} from 'date-fns';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { z } from 'zod';
import { logger } from '@/lib/logging/productionLogger';

// Inline schema for reschedule (simple date/time validation)
const rescheduleSchema = z.object({
  new_date: z.string().min(1, 'Please select a date'),
  new_time: z.string().min(1, 'Please select a time'),
});

type RescheduleInput = z.infer<typeof rescheduleSchema>;

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  onSuccess: () => void;
}

export const RescheduleDialog = ({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: RescheduleDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [stylistSchedule, setStylistSchedule] = useState<any>(null);

  const { handleSubmit: submitForm, isSubmitting } =
    useFormSubmit<RescheduleInput>(
      async () => {
        if (!selectedDate || !selectedTime) {
          throw new Error('Date and time are required');
        }

        const [time, period] = selectedTime.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        const adjustedHours =
          period === 'PM' && hours !== 12
            ? hours + 12
            : hours === 12 && period === 'AM'
              ? 0
              : hours;

        const appointmentDate = setMinutes(
          setHours(selectedDate, adjustedHours),
          minutes
        );

        if (isBefore(appointmentDate, new Date())) {
          throw new Error('Cannot reschedule to the past');
        }

        const { error } = await supabase
          .from('appointments')
          .update({
            appointment_date: appointmentDate.toISOString(),
            status: 'scheduled',
          })
          .eq('id', appointment.id);

        if (error) throw error;

        // Send SMS notification (non-blocking)
        try {
          await supabase.functions.invoke('send-sms-notification', {
            body: {
              appointmentId: appointment.id,
              notificationType: 'reschedule',
            },
          });
        } catch (smsError) {
          logger.error('SMS notification failed', smsError, {
            component: 'RescheduleDialog',
            appointmentId: appointment.id,
          });
        }
      },
      {
        schema: rescheduleSchema,
        successMessage: 'Appointment rescheduled successfully!',
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        },
      }
    );

  useEffect(() => {
    if (open && appointment) {
      loadStylistSchedule();
    }
  }, [open, appointment]);

  useEffect(() => {
    if (selectedDate && stylistSchedule) {
      updateAvailableTimeSlots();
    }
  }, [selectedDate, stylistSchedule]);

  const loadStylistSchedule = async () => {
    try {
      const { data } = await supabase
        .from('stylist_profiles')
        .select('weekly_schedule')
        .eq('id', appointment.stylist_id)
        .maybeSingle();

      setStylistSchedule(data?.weekly_schedule);
    } catch (error) {
      logger.error('Error loading schedule', error, {
        component: 'RescheduleDialog',
        stylistId: appointment.stylist_id,
      });
    }
  };

  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const period = currentHour >= 12 ? 'PM' : 'AM';
      const displayHour =
        currentHour === 0
          ? 12
          : currentHour > 12
            ? currentHour - 12
            : currentHour;
      const displayMin = currentMin === 0 ? '00' : currentMin;
      slots.push(`${displayHour}:${displayMin} ${period}`);

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  const updateAvailableTimeSlots = () => {
    if (!selectedDate || !stylistSchedule) return;

    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    const daySchedule = stylistSchedule[dayOfWeek];

    if (!daySchedule || !daySchedule.enabled) {
      setAvailableTimeSlots([]);
      setSelectedTime('');
      return;
    }

    const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
    setAvailableTimeSlots(slots);
  };

  const handleReschedule = async () => {
    const dateValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    await submitForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl brutal-border brutal-shadow-md">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for your appointment
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={date => isBefore(date, startOfDay(new Date()))}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-4">
            <Label>Select Time</Label>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Select a date first
              </p>
            ) : availableTimeSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No available time slots for this day
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {availableTimeSlots.map(time => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className="justify-start"
                  >
                    <Clock className="h-3 w-3 mr-2" />
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={isSubmitting || !selectedDate || !selectedTime}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rescheduling...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Reschedule
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
