import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { haptic } from '@/platform/haptics';
import { showCelebration } from './CelebrationToast';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logging/productionLogger';

interface QuickRebookButtonProps {
  appointmentId: string;
  clientId: string;
  clientName: string;
  serviceType: string;
  stylistId: string;
  duration: number;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export const QuickRebookButton = ({
  appointmentId,
  clientId,
  clientName,
  serviceType,
  stylistId,
  duration,
  className,
  variant = 'default',
}: QuickRebookButtonProps) => {
  const navigate = useNavigate();
  const [isRebooking, setIsRebooking] = useState(false);

  const handleQuickRebook = async () => {
    setIsRebooking(true);
    haptic.tap();

    try {
      // Get original appointment details
      const { data: originalAppt, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .maybeSingle();

      if (fetchError) {
        logger.error('Error fetching appointment', fetchError, { component: 'QuickRebookButton', appointmentId });
        toast.error('Failed to load appointment details');
        return;
      }

      if (!originalAppt) {
        toast.error('Appointment not found');
        return;
      }

      // Calculate suggested date (4-6 weeks from original appointment)
      const originalDate = new Date(originalAppt.appointment_date);
      const suggestedDate = new Date(originalDate);
      suggestedDate.setDate(suggestedDate.getDate() + 35); // 5 weeks

      // Get stylist's available slots around that date
      const { data: schedule, error: scheduleError } = await supabase
        .from('stylist_profiles')
        .select('weekly_schedule')
        .eq('id', stylistId)
        .maybeSingle();

      if (scheduleError) {
        logger.error('Error fetching schedule', scheduleError, { component: 'QuickRebookButton', stylistId });
      }

      // Find next available slot
      const dayOfWeek = suggestedDate.getDay();
      const weeklySchedule = schedule?.weekly_schedule;
      const daySchedule = weeklySchedule && typeof weeklySchedule === 'object' 
        ? (weeklySchedule as Record<string, any>)[dayOfWeek.toString()] 
        : null;

      if (daySchedule?.is_available && Array.isArray(daySchedule.slots) && daySchedule.slots.length > 0) {
        const firstSlot = daySchedule.slots[0];
        const appointmentTime = new Date(suggestedDate);
        const [hours, minutes] = firstSlot.start.split(':');
        appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Create new appointment
        const { error: createError } = await supabase
          .from('appointments')
          .insert({
            client_id: clientId,
            stylist_id: stylistId,
            appointment_date: appointmentTime.toISOString(),
            service_type: serviceType,
            duration: duration,
            status: 'pending',
            notes: `Rebooked from appointment on ${originalDate.toLocaleDateString()}`,
          });

        if (createError) throw createError;

        // Send notification to client
        const { error: notifError } = await supabase.functions.invoke(
          'send-appointment-confirmation',
          {
            body: {
              clientId,
              appointmentDate: appointmentTime.toISOString(),
              serviceType,
              isRebook: true,
            },
          }
        );

        showCelebration(
          'appointment-booked',
          `${clientName} rebooked for ${appointmentTime.toLocaleDateString()}`
        );
        haptic.success();
      } else {
        toast.info(`No available slots found. Opening booking page...`, {
          action: {
            label: 'Book Manually',
            onClick: () => {
              navigate(
                `/book-appointment?clientId=${clientId}&serviceType=${encodeURIComponent(serviceType)}`
              );
            },
          },
        });
      }
    } catch (error) {
      logger.error('Error rebooking', error, { component: 'QuickRebookButton', appointmentId, clientId });
      haptic.error();
      toast.error('Failed to rebook appointment');
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
      className={cn('gap-2', className)}
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
