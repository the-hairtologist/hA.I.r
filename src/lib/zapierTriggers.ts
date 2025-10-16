/**
 * Zapier Webhook Triggers - Database-Backed
 * Automatically trigger Zapier workflows on key events
 * All webhooks are configured per-stylist in the database
 */

import { supabase } from "@/integrations/supabase/client";

interface ZapierWebhook {
  id: string;
  event_type: string;
  webhook_url: string;
  is_active: boolean;
}

/**
 * Get all active webhooks for a specific event type
 */
const getActiveWebhooks = async (
  stylistId: string,
  eventType: string
): Promise<ZapierWebhook[]> => {
  try {
    const { data, error } = await supabase
      .from("zapier_webhooks")
      .select("*")
      .eq("stylist_id", stylistId)
      .eq("event_type", eventType)
      .eq("is_active", true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`[Zapier] Error fetching webhooks for ${eventType}:`, error);
    return [];
  }
};

/**
 * Trigger all active webhooks for an event
 */
const triggerWebhooks = async (
  webhooks: ZapierWebhook[],
  payload: any
): Promise<void> => {
  const promises = webhooks.map(async (webhook) => {
    try {
      await fetch(webhook.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Zapier requires no-cors
        body: JSON.stringify({
          event: webhook.event_type,
          timestamp: new Date().toISOString(),
          data: payload,
        }),
      });
      console.log(`[Zapier] ✅ Webhook triggered: ${webhook.event_type}`);
    } catch (error) {
      console.error(`[Zapier] ❌ Webhook failed for ${webhook.event_type}:`, error);
    }
  });

  await Promise.allSettled(promises);
};

/**
 * Trigger when a new appointment is booked
 */
export const triggerAppointmentBooked = async (
  stylistId: string,
  appointmentData: any
) => {
  const webhooks = await getActiveWebhooks(stylistId, "appointment.booked");
  if (webhooks.length > 0) {
    await triggerWebhooks(webhooks, appointmentData);
  }
};

/**
 * Trigger when a new client is added
 */
export const triggerNewClient = async (
  stylistId: string,
  clientData: any
) => {
  const webhooks = await getActiveWebhooks(stylistId, "client.created");
  if (webhooks.length > 0) {
    await triggerWebhooks(webhooks, clientData);
  }
};

/**
 * Trigger when a payment is received
 */
export const triggerPaymentReceived = async (
  stylistId: string,
  paymentData: any
) => {
  const webhooks = await getActiveWebhooks(stylistId, "payment.received");
  if (webhooks.length > 0) {
    await triggerWebhooks(webhooks, paymentData);
  }
};

/**
 * Trigger when a review is received
 */
export const triggerReviewReceived = async (
  stylistId: string,
  reviewData: any
) => {
  const webhooks = await getActiveWebhooks(stylistId, "review.received");
  if (webhooks.length > 0) {
    await triggerWebhooks(webhooks, reviewData);
  }
};

/**
 * Trigger when an appointment is completed
 */
export const triggerAppointmentCompleted = async (
  stylistId: string,
  appointmentData: any
) => {
  const webhooks = await getActiveWebhooks(stylistId, "appointment.completed");
  if (webhooks.length > 0) {
    await triggerWebhooks(webhooks, appointmentData);
  }
};
