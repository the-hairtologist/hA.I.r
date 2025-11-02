/**
 * Zapier Webhook Triggers - Production System
 * Uses the zapier-trigger edge function with retry logic, failure tracking, and monitoring
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from './logging/productionLogger';

/**
 * Trigger Zapier webhooks via edge function (with automatic retries and tracking)
 */
const triggerZapierEvent = async (
  stylistId: string,
  eventType: string,
  eventData: any
): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('zapier-trigger', {
      body: {
        event: eventType,
        data: {
          stylist_id: stylistId,
          ...eventData,
        },
      },
    });

    if (error) {
      logger.error(`[Zapier] Edge function error for ${eventType}:`, { error });
      return;
    }

    if (data?.triggered > 0) {
      logger.info(
        `[Zapier] ✅ Triggered ${data.triggered} webhook(s) for ${eventType}`
      );
    } else {
      logger.info(`[Zapier] No active webhooks for ${eventType}`);
    }
  } catch (error) {
    logger.error(`[Zapier] Failed to trigger ${eventType}:`, { error });
  }
};

/**
 * Trigger when a new appointment is booked
 */
export const triggerAppointmentBooked = async (
  stylistId: string,
  appointmentData: any
) => {
  await triggerZapierEvent(stylistId, 'appointment.booked', appointmentData);
};

/**
 * Trigger when a new client is added
 */
export const triggerNewClient = async (stylistId: string, clientData: any) => {
  await triggerZapierEvent(stylistId, 'client.created', clientData);
};

/**
 * Trigger when a payment is received
 */
export const triggerPaymentReceived = async (
  stylistId: string,
  paymentData: any
) => {
  await triggerZapierEvent(stylistId, 'payment.received', paymentData);
};

/**
 * Trigger when a review is received
 */
export const triggerReviewReceived = async (
  stylistId: string,
  reviewData: any
) => {
  await triggerZapierEvent(stylistId, 'review.received', reviewData);
};

/**
 * Trigger when an appointment is completed
 */
export const triggerAppointmentCompleted = async (
  stylistId: string,
  appointmentData: any
) => {
  await triggerZapierEvent(stylistId, 'appointment.completed', appointmentData);
};
