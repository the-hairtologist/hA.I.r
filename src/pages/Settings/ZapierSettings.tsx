import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface WebhookConfig {
  id: string;
  event_type: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
  last_triggered_at?: string;
  last_success_at?: string;
  last_failure_at?: string;
  total_triggers?: number;
  total_failures?: number;
  last_error_message?: string;
}

const EVENT_TYPES = [
  {
    value: 'appointment.booked',
    label: 'Appointment Booked',
    description: 'Trigger when a new appointment is created',
  },
  {
    value: 'client.created',
    label: 'New Client',
    description: 'Trigger when a new client is added',
  },
  {
    value: 'payment.received',
    label: 'Payment Received',
    description: 'Trigger when a payment is processed',
  },
  {
    value: 'review.received',
    label: 'Review Received',
    description: 'Trigger when a client leaves a review',
  },
  {
    value: 'appointment.completed',
    label: 'Appointment Completed',
    description: 'Trigger when an appointment is marked complete',
  },
];

export const ZapierSettings = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWebhook, setNewWebhook] = useState({
    event_type: '',
    webhook_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: stylistData } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!stylistData) return;

      const { data, error } = await supabase
        .from('zapier_webhooks')
        .select('*')
        .eq('stylist_id', stylistData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks((data as any) || []);
    } catch (error: any) {
      logger.error('Error loading webhooks', 'ZapierSettings', error as Error);
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const saveWebhook = async () => {
    if (!newWebhook.event_type || !newWebhook.webhook_url) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!newWebhook.webhook_url.startsWith('https://hooks.zapier.com/')) {
      toast.error('Please enter a valid Zapier webhook URL');
      return;
    }

    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: stylistData } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!stylistData) {
        toast.error('Stylist profile not found');
        return;
      }

      const { error } = await supabase.from('zapier_webhooks').insert({
        stylist_id: stylistData.id,
        event_type: newWebhook.event_type,
        webhook_url: newWebhook.webhook_url,
        is_active: true,
      });

      if (error) throw error;

      toast.success('Webhook added successfully!');
      setNewWebhook({ event_type: '', webhook_url: '' });
      loadWebhooks();
    } catch (error: any) {
      logger.error('Error saving webhook', 'ZapierSettings', error as Error);
      toast.error('Failed to save webhook');
    } finally {
      setSaving(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('zapier_webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Webhook deleted');
      loadWebhooks();
    } catch (error: any) {
      logger.error('Error deleting webhook', 'ZapierSettings', error as Error);
      toast.error('Failed to delete webhook');
    }
  };

  const toggleWebhook = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('zapier_webhooks')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Webhook ${!currentStatus ? 'enabled' : 'disabled'}`);
      loadWebhooks();
    } catch (error: any) {
      logger.error('Error toggling webhook', 'ZapierSettings', error as Error);
      toast.error('Failed to update webhook');
    }
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    setTesting(webhook.id);
    try {
      const { error } = await supabase.functions.invoke('zapier-trigger', {
        body: {
          event: webhook.event_type,
          data: {
            test: true,
            message: 'This is a test from hA.I.r',
            timestamp: new Date().toISOString(),
          },
          testMode: true,
        },
      });

      if (error) throw error;

      toast.success('Test webhook sent! Check your Zap history.', {
        duration: 5000,
      });
      loadWebhooks(); // Refresh to show updated stats
    } catch (error: any) {
      logger.error('Error testing webhook', 'ZapierSettings', error);
      toast.error('Failed to send test webhook');
    } finally {
      setTesting(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">
              Zapier Integration
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Automate workflows by connecting hA.I.r to 5,000+ apps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1 text-xs sm:text-sm min-w-0">
                <p className="font-medium">How to set up:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li className="break-words">
                    Create a Zap in Zapier and add a Webhook trigger
                  </li>
                  <li className="break-words">
                    Copy the webhook URL from Zapier
                  </li>
                  <li className="break-words">
                    Paste it below and select an event type
                  </li>
                  <li className="break-words">
                    Test your Zap to make sure it works!
                  </li>
                </ol>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs sm:text-sm"
                  onClick={() =>
                    window.open('https://zapier.com/app/editor', '_blank')
                  }
                >
                  Open Zapier <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Add New Webhook */}
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg">
            <h3 className="font-semibold text-sm sm:text-base">
              Add New Webhook
            </h3>

            <div className="space-y-2">
              <Label htmlFor="event-type" className="text-xs sm:text-sm">
                Event Type
              </Label>
              <select
                id="event-type"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
                value={newWebhook.event_type}
                onChange={e =>
                  setNewWebhook({ ...newWebhook, event_type: e.target.value })
                }
              >
                <option value="">Select an event...</option>
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-xs sm:text-sm">
                Zapier Webhook URL
              </Label>
              <Input
                id="webhook-url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={newWebhook.webhook_url}
                onChange={e =>
                  setNewWebhook({ ...newWebhook, webhook_url: e.target.value })
                }
                className="text-xs sm:text-sm"
              />
            </div>

            <Button
              onClick={saveWebhook}
              disabled={
                saving || !newWebhook.event_type || !newWebhook.webhook_url
              }
              className="w-full text-xs sm:text-sm"
              size="sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          {/* Existing Webhooks */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">
              Active Webhooks
            </h3>
            {loading ? (
              <div className="text-center py-8 text-xs sm:text-sm text-muted-foreground">
                Loading webhooks...
              </div>
            ) : webhooks.length === 0 ? (
              <div className="text-center py-8 text-xs sm:text-sm text-muted-foreground">
                No webhooks configured yet
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {webhooks.map(webhook => {
                  const eventType = EVENT_TYPES.find(
                    t => t.value === webhook.event_type
                  );
                  const successRate = webhook.total_triggers
                    ? Math.round(
                        ((webhook.total_triggers -
                          (webhook.total_failures || 0)) /
                          webhook.total_triggers) *
                          100
                      )
                    : 100;

                  return (
                    <div
                      key={webhook.id}
                      className="flex flex-col gap-3 p-3 sm:p-4 border rounded-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-xs sm:text-sm">
                              {eventType?.label || webhook.event_type}
                            </span>
                            <Badge
                              variant={
                                webhook.is_active ? 'default' : 'secondary'
                              }
                              className="text-[10px] sm:text-xs"
                            >
                              {webhook.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {successRate < 80 &&
                              (webhook.total_triggers || 0) > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] sm:text-xs"
                                >
                                  {successRate}% success
                                </Badge>
                              )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground break-all mb-2">
                            {webhook.webhook_url}
                          </p>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                            <div>
                              <span className="text-muted-foreground">
                                Triggered:
                              </span>{' '}
                              <span className="font-medium">
                                {webhook.total_triggers || 0} times
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Failures:
                              </span>{' '}
                              <span
                                className={
                                  webhook.total_failures
                                    ? 'font-medium text-destructive'
                                    : 'font-medium'
                                }
                              >
                                {webhook.total_failures || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Last triggered:
                              </span>{' '}
                              <span className="font-medium">
                                {formatDate(webhook.last_triggered_at)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Last success:
                              </span>{' '}
                              <span className="font-medium">
                                {formatDate(webhook.last_success_at)}
                              </span>
                            </div>
                          </div>

                          {webhook.last_error_message && (
                            <div className="mt-2 p-2 bg-destructive/10 rounded text-[10px] sm:text-xs text-destructive">
                              <strong>Last error:</strong>{' '}
                              {webhook.last_error_message}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testWebhook(webhook)}
                            disabled={
                              testing === webhook.id || !webhook.is_active
                            }
                            className="flex-1 sm:flex-none text-xs"
                          >
                            {testing === webhook.id ? 'Testing...' : 'Test'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleWebhook(webhook.id, webhook.is_active)
                            }
                            className="flex-1 sm:flex-none text-xs"
                          >
                            {webhook.is_active ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteWebhook(webhook.id)}
                            className="text-xs"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
