/**
 * Notification Settings Component
 * Allows users to manage push notification preferences
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestNotificationPermission,
  registerDeviceToken,
  areNotificationsEnabled,
} from '@/utils/pushNotifications';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(areNotificationsEnabled());
  const [registering, setRegistering] = useState(false);
  const [preferences, setPreferences] = useState(getNotificationPreferences());

  const handleEnableNotifications = async () => {
    if (!user) return;

    setRegistering(true);
    try {
      const success = await registerDeviceToken(user.id);
      if (success) {
        setEnabled(true);
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Failed to enable notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setRegistering(false);
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    saveNotificationPreferences(newPreferences);
    toast.success('Preference updated');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about appointments, at-risk clients, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!enabled ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enable push notifications to receive timely alerts and reminders
            </p>
            <Button
              onClick={handleEnableNotifications}
              disabled={registering}
              className="w-full"
            >
              {registering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Enable Notifications
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="appt-24h">Appointment Reminders (24h)</Label>
              <Switch
                id="appt-24h"
                checked={preferences.appointment_reminders_24h}
                onCheckedChange={() =>
                  handlePreferenceChange('appointment_reminders_24h')
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="appt-1h">Appointment Reminders (1h)</Label>
              <Switch
                id="appt-1h"
                checked={preferences.appointment_reminders_1h}
                onCheckedChange={() =>
                  handlePreferenceChange('appointment_reminders_1h')
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="at-risk">Client At-Risk Alerts</Label>
              <Switch
                id="at-risk"
                checked={preferences.client_at_risk_alerts}
                onCheckedChange={() =>
                  handlePreferenceChange('client_at_risk_alerts')
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="new-booking">New Booking Notifications</Label>
              <Switch
                id="new-booking"
                checked={preferences.new_booking_notifications}
                onCheckedChange={() =>
                  handlePreferenceChange('new_booking_notifications')
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="formula">Formula Usage Notifications</Label>
              <Switch
                id="formula"
                checked={preferences.formula_usage_notifications}
                onCheckedChange={() =>
                  handlePreferenceChange('formula_usage_notifications')
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
