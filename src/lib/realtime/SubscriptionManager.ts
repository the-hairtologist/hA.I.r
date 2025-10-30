/**
 * Centralized Realtime Subscription Manager
 *
 * Solves the problem of multiple components subscribing to the same tables,
 * causing unnecessary connections and potential race conditions.
 *
 * Features:
 * - Single subscription per table
 * - Event bus for component notifications
 * - Automatic cleanup on unmount
 * - Connection pooling
 * - Error handling and retry logic
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '../logging/productionLogger';
import { safeConsole } from '@/lib/safeLogger';

type EventCallback = (payload: any) => void;
type UnsubscribeFunction = () => void;

interface SubscriptionConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

class RealtimeSubscriptionManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;

  /**
   * Subscribe to table changes
   * Returns unsubscribe function
   */
  subscribe(
    config: SubscriptionConfig,
    callback: EventCallback
  ): UnsubscribeFunction {
    const channelKey = this.getChannelKey(config);

    // Add listener
    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set());
    }
    this.listeners.get(channelKey)!.add(callback);

    // Create channel if it doesn't exist
    if (!this.channels.has(channelKey)) {
      this.createChannel(config, channelKey);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channelKey, callback);
    };
  }

  /**
   * Emit event to all listeners for a channel
   */
  private emit(channelKey: string, payload: any) {
    const listeners = this.listeners.get(channelKey);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          safeConsole.error(
            `Error in realtime listener for ${channelKey}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Create a new realtime channel
   */
  private createChannel(config: SubscriptionConfig, channelKey: string) {
    const { table, event = '*', filter } = config;

    const changeConfig: any = {
      event,
      schema: 'public',
      table,
    };

    if (filter) {
      changeConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelKey)
      .on('postgres_changes' as any, changeConfig, (payload: any) => {
        logger.info(`[Realtime] ${table} ${payload.eventType}:`, payload);
        this.emit(channelKey, payload);
        this.reconnectAttempts.set(channelKey, 0); // Reset on successful message
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          logger.info(`[Realtime] Subscribed to ${channelKey}`);
          this.reconnectAttempts.set(channelKey, 0);
        } else if (status === 'CHANNEL_ERROR') {
          logger.error(`[Realtime] Error subscribing to ${channelKey}`);
          this.handleReconnect(config, channelKey);
        } else if (status === 'TIMED_OUT') {
          logger.error(`[Realtime] Timeout subscribing to ${channelKey}`);
          this.handleReconnect(config, channelKey);
        }
      });

    this.channels.set(channelKey, channel);
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private async handleReconnect(
    config: SubscriptionConfig,
    channelKey: string
  ) {
    const attempts = this.reconnectAttempts.get(channelKey) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      safeConsole.error(
        `[Realtime] Max reconnect attempts reached for ${channelKey}`
      );
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30s
    this.reconnectAttempts.set(channelKey, attempts + 1);

    logger.info(
      `[Realtime] Reconnecting ${channelKey} in ${delay}ms (attempt ${attempts + 1})`
    );

    await new Promise(resolve => setTimeout(resolve, delay));

    // Remove old channel
    const oldChannel = this.channels.get(channelKey);
    if (oldChannel) {
      await supabase.removeChannel(oldChannel);
    }
    this.channels.delete(channelKey);

    // Create new channel
    this.createChannel(config, channelKey);
  }

  /**
   * Unsubscribe a specific callback
   */
  private unsubscribe(channelKey: string, callback: EventCallback) {
    const listeners = this.listeners.get(channelKey);
    if (listeners) {
      listeners.delete(callback);

      // If no more listeners, remove channel
      if (listeners.size === 0) {
        this.removeChannel(channelKey);
      }
    }
  }

  /**
   * Remove a channel completely
   */
  private async removeChannel(channelKey: string) {
    const channel = this.channels.get(channelKey);
    if (channel) {
      await supabase.removeChannel(channel);
      this.channels.delete(channelKey);
      this.listeners.delete(channelKey);
      this.reconnectAttempts.delete(channelKey);
      logger.info(`[Realtime] Removed channel ${channelKey}`);
    }
  }

  /**
   * Generate unique channel key
   */
  private getChannelKey(config: SubscriptionConfig): string {
    const { table, event = '*', filter = '' } = config;
    return `${table}-${event}-${filter}`;
  }

  /**
   * Clean up all subscriptions
   */
  async cleanup() {
    logger.info('[Realtime] Cleaning up all subscriptions');
    const channels = Array.from(this.channels.values());

    for (const channel of channels) {
      await supabase.removeChannel(channel);
    }

    this.channels.clear();
    this.listeners.clear();
    this.reconnectAttempts.clear();
  }

  /**
   * Get subscription stats for debugging
   */
  getStats() {
    return {
      activeChannels: this.channels.size,
      totalListeners: Array.from(this.listeners.values()).reduce(
        (sum, set) => sum + set.size,
        0
      ),
      channels: Array.from(this.channels.keys()),
    };
  }
}

// Singleton instance
export const realtimeManager = new RealtimeSubscriptionManager();

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeManager.cleanup();
  });
}
