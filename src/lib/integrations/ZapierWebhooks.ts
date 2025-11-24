import { analytics } from '../analytics';
import { logger } from '../logging/productionLogger';

/**
 * Zapier Webhook Integration
 * Allows triggering Zaps from the app
 */

export interface ZapierTrigger {
  webhookUrl: string;
  eventType: string;
  data: Record<string, any>;
}

export class ZapierWebhooks {
  async trigger({
    webhookUrl,
    eventType,
    data,
  }: ZapierTrigger): Promise<boolean> {
    if (!webhookUrl) {
      throw new Error('Webhook URL is required');
    }

    try {
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Zapier webhooks often require no-cors
        body: JSON.stringify(payload),
      });

      analytics.track('zapier_webhook_triggered', {
        event_type: eventType,
      });

      logger.info('[Zapier] Webhook triggered', { eventType });
      return true;
    } catch (error) {
      logger.error('[Zapier] Webhook failed', { eventType }, error as Error);
      analytics.track('zapier_webhook_failed', {
        event_type: eventType,
        error: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Pre-configured triggers for common events
   */
  async onAppointmentBooked(appointmentData: any, webhookUrl: string) {
    return this.trigger({
      webhookUrl,
      eventType: 'appointment.booked',
      data: appointmentData,
    });
  }

  async onNewClient(clientData: any, webhookUrl: string) {
    return this.trigger({
      webhookUrl,
      eventType: 'client.created',
      data: clientData,
    });
  }

  async onReviewReceived(reviewData: any, webhookUrl: string) {
    return this.trigger({
      webhookUrl,
      eventType: 'review.received',
      data: reviewData,
    });
  }

  async onPaymentReceived(paymentData: any, webhookUrl: string) {
    return this.trigger({
      webhookUrl,
      eventType: 'payment.received',
      data: paymentData,
    });
  }
}

export const zapier = new ZapierWebhooks();
