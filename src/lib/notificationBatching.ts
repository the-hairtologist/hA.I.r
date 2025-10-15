/**
 * Notification Batching System
 * Prevents notification fatigue by intelligently batching and scheduling
 */

interface NotificationPreferences {
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "08:00"
  batchingEnabled: boolean;
  digestFrequency: 'immediate' | 'hourly' | 'daily';
  timezone: string;
}

interface QueuedNotification {
  id: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  title: string;
  message: string;
  type: string;
  createdAt: Date;
  scheduledFor?: Date;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  batchingEnabled: true,
  digestFrequency: 'hourly',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

class NotificationBatcher {
  private notificationQueue: QueuedNotification[] = [];
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private batchInterval: number = 60 * 60 * 1000; // 1 hour
  
  constructor() {
    // Start batch processor
    setInterval(() => this.processBatch(), this.batchInterval);
  }
  
  /**
   * Add a notification to queue with priority
   */
  add(notification: Omit<QueuedNotification, 'id' | 'createdAt'>) {
    const queued: QueuedNotification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    // Critical notifications bypass batching
    if (notification.priority === 'critical') {
      this.sendImmediately(queued);
      return;
    }
    
    // Check quiet hours
    if (this.isQuietHours()) {
      queued.scheduledFor = this.getNextActiveTime();
    }
    
    // Add to queue if batching enabled
    if (this.preferences.batchingEnabled && notification.priority !== 'high') {
      this.notificationQueue.push(queued);
    } else {
      this.sendImmediately(queued);
    }
  }
  
  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quietHoursEnd.split(':').map(Number);
    
    const quietStart = startHour * 60 + startMin;
    const quietEnd = endHour * 60 + endMin;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (quietStart > quietEnd) {
      return currentTime >= quietStart || currentTime <= quietEnd;
    }
    
    return currentTime >= quietStart && currentTime <= quietEnd;
  }
  
  /**
   * Get next available time after quiet hours
   */
  private getNextActiveTime(): Date {
    const now = new Date();
    const [endHour, endMin] = this.preferences.quietHoursEnd.split(':').map(Number);
    
    const nextActive = new Date();
    nextActive.setHours(endHour, endMin, 0, 0);
    
    // If quiet end is tomorrow
    if (nextActive <= now) {
      nextActive.setDate(nextActive.getDate() + 1);
    }
    
    return nextActive;
  }
  
  /**
   * Process batched notifications
   */
  private async processBatch() {
    if (this.notificationQueue.length === 0) return;
    
    // Filter notifications ready to send
    const now = new Date();
    const readyToSend = this.notificationQueue.filter(n => 
      !n.scheduledFor || n.scheduledFor <= now
    );
    
    if (readyToSend.length === 0) return;
    
    // Group by priority
    const grouped = this.groupByPriority(readyToSend);
    
    // Send digest notification
    if (grouped.high.length > 0 || grouped.normal.length > 0) {
      this.sendDigest(grouped);
    }
    
    // Remove sent notifications from queue
    this.notificationQueue = this.notificationQueue.filter(n => !readyToSend.includes(n));
  }
  
  /**
   * Group notifications by priority
   */
  private groupByPriority(notifications: QueuedNotification[]) {
    return {
      critical: notifications.filter(n => n.priority === 'critical'),
      high: notifications.filter(n => n.priority === 'high'),
      normal: notifications.filter(n => n.priority === 'normal'),
      low: notifications.filter(n => n.priority === 'low'),
    };
  }
  
  /**
   * Send digest notification
   */
  private sendDigest(grouped: ReturnType<typeof this.groupByPriority>) {
    const total = grouped.high.length + grouped.normal.length + grouped.low.length;
    
    if (total === 0) return;
    
    const title = `You have ${total} update${total > 1 ? 's' : ''}`;
    const message = this.formatDigestMessage(grouped);
    
    // Send as single notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/og-image.png',
        badge: '/og-image.png',
        tag: 'digest',
      });
    }
  }
  
  /**
   * Format digest message
   */
  private formatDigestMessage(grouped: ReturnType<typeof this.groupByPriority>): string {
    const parts: string[] = [];
    
    if (grouped.high.length > 0) {
      parts.push(`${grouped.high.length} important update${grouped.high.length > 1 ? 's' : ''}`);
    }
    if (grouped.normal.length > 0) {
      parts.push(`${grouped.normal.length} new notification${grouped.normal.length > 1 ? 's' : ''}`);
    }
    if (grouped.low.length > 0) {
      parts.push(`${grouped.low.length} info update${grouped.low.length > 1 ? 's' : ''}`);
    }
    
    return parts.join(', ');
  }
  
  /**
   * Send notification immediately
   */
  private sendImmediately(notification: QueuedNotification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/og-image.png',
        badge: '/og-image.png',
        tag: notification.id,
      });
    }
  }
  
  /**
   * Update user preferences
   */
  setPreferences(preferences: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...preferences };
    localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
  }
  
  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      return JSON.parse(saved);
    }
    return this.preferences;
  }
  
  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queueSize: this.notificationQueue.length,
      inQuietHours: this.isQuietHours(),
      nextProcessTime: new Date(Date.now() + this.batchInterval),
    };
  }
}

export const notificationBatcher = new NotificationBatcher();
