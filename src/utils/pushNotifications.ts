/**
 * Push Notification Manager
 * Handles device token registration and notification preferences
 * Note: Requires FCM (Firebase Cloud Messaging) setup for full functionality
 */

import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

interface NotificationPreferences {
  appointment_reminders_24h: boolean;
  appointment_reminders_1h: boolean;
  client_at_risk_alerts: boolean;
  new_booking_notifications: boolean;
  formula_usage_notifications: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  appointment_reminders_24h: true,
  appointment_reminders_1h: true,
  client_at_risk_alerts: true,
  new_booking_notifications: true,
  formula_usage_notifications: false,
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Register device token with FCM and save to database
 * Note: This is a placeholder - requires FCM configuration
 */
export const registerDeviceToken = async (userId: string): Promise<boolean> => {
  try {
    // Check if permission is granted
    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return false;
    }

    // TODO: Get FCM token here when FCM is configured
    // For now, generate a unique identifier
    const platform = Capacitor.getPlatform();
    const mockToken = `${platform}_${userId}_${Date.now()}`;

    // Save to database
    const { error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: userId,
        token: mockToken,
        platform: platform,
        last_used: new Date().toISOString(),
      }, {
        onConflict: 'token'
      });

    if (error) throw error;

    console.log('Device token registered:', mockToken);
    return true;
  } catch (error) {
    console.error('Failed to register device token:', error);
    return false;
  }
};

/**
 * Get user's notification preferences
 */
export const getNotificationPreferences = (): NotificationPreferences => {
  try {
    const stored = localStorage.getItem('notification_preferences');
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error);
  }
  return DEFAULT_PREFERENCES;
};

/**
 * Save user's notification preferences
 */
export const saveNotificationPreferences = (preferences: NotificationPreferences): void => {
  try {
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));
    console.log('Notification preferences saved');
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
};

/**
 * Unregister device token
 */
export const unregisterDeviceToken = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    console.log('Device token unregistered');
    return true;
  } catch (error) {
    console.error('Failed to unregister device token:', error);
    return false;
  }
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = (): boolean => {
  return Notification.permission === 'granted';
};
