/**
 * Push Notifications Manager - Phase 3: Engagement Layer
 * Opt-in UI flow with frequency control and smart batching
 */

import { toast } from "@/hooks/use-toast";

export type NotificationFrequency = 'all' | 'important' | 'daily' | 'none';

export interface PushPreferences {
  enabled: boolean;
  frequency: NotificationFrequency;
  appointments: boolean;
  messages: boolean;
  updates: boolean;
  marketing: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
}

const STORAGE_KEY = 'hair_ai_push_preferences';
const DEFAULT_PREFERENCES: PushPreferences = {
  enabled: false,
  frequency: 'important',
  appointments: true,
  messages: true,
  updates: false,
  marketing: false,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
};

class PushNotificationManager {
  private static instance: PushNotificationManager;
  private preferences: PushPreferences = DEFAULT_PREFERENCES;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.loadPreferences();
  }

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request notification permission with user-friendly prompt
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      this.preferences.enabled = true;
      this.savePreferences();
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        this.preferences.enabled = true;
        this.savePreferences();
        
        toast({
          title: "✅ Notifications Enabled",
          description: "You'll receive important updates about appointments and messages."
        });
        
        // Send welcome notification
        this.sendWelcomeNotification();
        
        return true;
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You can enable them later in settings.",
        });
        return false;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Update user preferences
   */
  updatePreferences(updates: Partial<PushPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): PushPreferences {
    return { ...this.preferences };
  }

  /**
   * Check if notifications should be sent now
   */
  shouldSendNow(type: keyof Pick<PushPreferences, 'appointments' | 'messages' | 'updates' | 'marketing'>): boolean {
    if (!this.preferences.enabled) return false;
    if (!this.preferences[type]) return false;

    // Check frequency
    if (this.preferences.frequency === 'none') return false;
    if (this.preferences.frequency === 'important' && (type === 'updates' || type === 'marketing')) {
      return false;
    }

    // Check quiet hours
    if (this.preferences.quietHoursEnabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const start = this.preferences.quietHoursStart;
      const end = this.preferences.quietHoursEnd;
      
      // Handle overnight quiet hours (e.g., 22:00 - 08:00)
      if (start > end) {
        if (currentTime >= start || currentTime < end) {
          return false;
        }
      } else {
        if (currentTime >= start && currentTime < end) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Send a local notification
   */
  sendNotification(title: string, options: NotificationOptions & { type?: 'appointments' | 'messages' | 'updates' | 'marketing' } = {}): void {
    const { type = 'updates', ...notificationOptions } = options;
    
    if (!this.shouldSendNow(type)) {
      console.log('🔕 Notification suppressed by user preferences');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Cannot send notification: permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...notificationOptions
      });
      
      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Send welcome notification
   */
  private sendWelcomeNotification(): void {
    setTimeout(() => {
      this.sendNotification('Welcome to hA.I.r! 💇', {
        body: 'You\'re all set! We\'ll notify you about appointments, messages, and important updates.',
        type: 'updates'
      });
    }, 1000);
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load push preferences:', error);
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save push preferences:', error);
    }
  }

  /**
   * Show opt-in prompt
   */
  showOptInPrompt(): void {
    if (this.getPermissionStatus() !== 'default') return;
    
    // Dispatch custom event for UI to show modal
    window.dispatchEvent(new CustomEvent('show-push-opt-in'));
  }

  /**
   * Disable notifications
   */
  disable(): void {
    this.preferences.enabled = false;
    this.savePreferences();
    
    toast({
      title: "Notifications Disabled",
      description: "You won't receive push notifications anymore."
    });
  }
}

export const pushNotifications = PushNotificationManager.getInstance();

/**
 * Initialize push notifications
 */
export function initPushNotifications(): void {
  if (!pushNotifications.isSupported()) {
    console.log('Push notifications not supported');
    return;
  }

  // Show opt-in after 30 seconds if not yet prompted
  if (pushNotifications.getPermissionStatus() === 'default') {
    setTimeout(() => {
      pushNotifications.showOptInPrompt();
    }, 30000);
  }

  if (import.meta.env.DEV) {
    (window as any).__pushPrefs = () => console.log(pushNotifications.getPreferences());
    console.log('💡 Run __pushPrefs() to see notification preferences');
  }
}
