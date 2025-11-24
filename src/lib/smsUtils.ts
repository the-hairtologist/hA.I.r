import { logger } from '@/lib/logger';

/**
 * Validates if a phone number is in a valid format
 * Accepts formats like: (555) 555-5555, 555-555-5555, 5555555555, +15555555555
 */
export const isValidPhoneNumber = (
  phone: string | null | undefined
): boolean => {
  if (!phone) return false;

  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Check if it's a valid length (10 digits for US, or 11 with country code)
  return (
    cleaned.length === 10 ||
    cleaned.length === 11 ||
    (cleaned.startsWith('+') && cleaned.length === 12)
  );
};

/**
 * Formats a phone number for display
 * e.g., "5551234567" -> "(555) 123-4567"
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // Return original if not standard format
};

/**
 * Sends an SMS notification for an appointment action
 * @param appointmentId The ID of the appointment
 * @param notificationType Type of notification: confirmation, reminder, cancellation, reschedule
 * @returns Promise that resolves when SMS is sent
 */
export const sendAppointmentSMS = async (
  appointmentId: string,
  notificationType: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule'
): Promise<{ success: boolean; error?: string }> => {
  const { supabase } = await import('@/integrations/supabase/client');

  try {
    const { data, error } = await supabase.functions.invoke(
      'send-sms-notification',
      {
        body: {
          appointmentId,
          notificationType,
        },
      }
    );

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    logger.error('SMS notification failed', 'smsUtils', error as Error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS notification',
    };
  }
};
