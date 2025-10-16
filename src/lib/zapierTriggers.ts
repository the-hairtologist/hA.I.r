/**
 * Zapier Webhook Triggers
 * Automatically trigger Zapier workflows on key events
 */

import { zapier } from './integrations/ZapierWebhooks';

// For now, we'll trigger webhooks if they're configured in localStorage
// Future: Store in database per stylist
const getWebhookUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('zapier_webhook_url');
  }
  return null;
};

export const triggerAppointmentBooked = async (appointmentData: any) => {
  try {
    const webhookUrl = getWebhookUrl();
    if (webhookUrl) {
      await zapier.onAppointmentBooked(appointmentData, webhookUrl);
    }
  } catch (error) {
    console.error('Failed to trigger Zapier webhook:', error);
  }
};

export const triggerNewClient = async (clientData: any) => {
  try {
    const webhookUrl = getWebhookUrl();
    if (webhookUrl) {
      await zapier.onNewClient(clientData, webhookUrl);
    }
  } catch (error) {
    console.error('Failed to trigger Zapier webhook:', error);
  }
};

export const triggerPaymentReceived = async (paymentData: any) => {
  try {
    const webhookUrl = getWebhookUrl();
    if (webhookUrl) {
      await zapier.onPaymentReceived(paymentData, webhookUrl);
    }
  } catch (error) {
    console.error('Failed to trigger Zapier webhook:', error);
  }
};

export const triggerReviewReceived = async (reviewData: any) => {
  try {
    const webhookUrl = getWebhookUrl();
    if (webhookUrl) {
      await zapier.onReviewReceived(reviewData, webhookUrl);
    }
  } catch (error) {
    console.error('Failed to trigger Zapier webhook:', error);
  }
};
