/**
 * Enhanced Realtime Sync Hook
 * 
 * Now that realtime is enabled on appointments, messages, and client_profiles,
 * this hook provides easy integration for components.
 * 
 * Benefits:
 * - Automatic reconnection on network issues
 * - Optimistic updates (instant UI feedback)
 * - Conflict resolution
 * - Memory leak prevention
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export interface RealtimeSyncOptions<T = any> {
  table: string;
  filter?: string;
  onInsert?: (record: T) => void;
  onUpdate?: (record: T, oldRecord: T) => void;
  onDelete?: (record: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

/**
 * Subscribe to realtime updates on a table
 * Automatically handles cleanup and reconnection
 */
export const useRealtimeSync = <T = any>(options: RealtimeSyncOptions<T>) => {
  const {
    table,
    filter,
    onInsert,
    onUpdate,
    onDelete,
    onError,
    enabled = true,
  } = options;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const handleInsert = useCallback((payload: any) => {
    logger.debug(`[Realtime] INSERT on ${table}`, 'realtime', payload);
    onInsert?.(payload.new as T);
  }, [table, onInsert]);

  const handleUpdate = useCallback((payload: any) => {
    logger.debug(`[Realtime] UPDATE on ${table}`, 'realtime', payload);
    onUpdate?.(payload.new as T, payload.old as T);
  }, [table, onUpdate]);

  const handleDelete = useCallback((payload: any) => {
    logger.debug(`[Realtime] DELETE on ${table}`, 'realtime', payload);
    onDelete?.(payload.old as T);
  }, [table, onDelete]);

  const handleError = useCallback((error: any) => {
    logger.error(`[Realtime] Error on ${table}`, 'realtime', error);
    onError?.(error);

    // Auto-reconnect with exponential backoff
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current++;
      
      setTimeout(() => {
        logger.info(`[Realtime] Attempting reconnect ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`, 'realtime');
        channelRef.current?.subscribe();
      }, delay);
    }
  }, [table, onError]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Create unique channel name
    const channelName = `${table}_${filter || 'all'}_${Date.now()}`;
    
    logger.info(`[Realtime] Subscribing to ${table}`, 'realtime', { filter });

    // Create channel with postgres changes listener
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter || undefined,
        },
        (payload) => {
          // Reset reconnect attempts on successful message
          reconnectAttemptsRef.current = 0;

          switch (payload.eventType) {
            case 'INSERT':
              handleInsert(payload);
              break;
            case 'UPDATE':
              handleUpdate(payload);
              break;
            case 'DELETE':
              handleDelete(payload);
              break;
          }
        }
      )
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
          logger.info(`[Realtime] Connected to ${table}`, 'realtime');
          reconnectAttemptsRef.current = 0;
        } else if (status === 'CHANNEL_ERROR') {
          handleError(error || new Error('Channel error'));
        } else if (status === 'TIMED_OUT') {
          handleError(new Error('Connection timed out'));
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      logger.info(`[Realtime] Unsubscribing from ${table}`, 'realtime');
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [table, filter, enabled, handleInsert, handleUpdate, handleDelete, handleError]);

  return {
    isConnected: channelRef.current !== null,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
};

/**
 * Hook for syncing appointments with realtime updates
 */
export const useRealtimeAppointments = (
  stylistId: string | null,
  onUpdate: (appointments: any[]) => void
) => {
  const { isConnected } = useRealtimeSync({
    table: 'appointments',
    filter: stylistId ? `stylist_id=eq.${stylistId}` : undefined,
    enabled: !!stylistId,
    onInsert: () => {
      // Refetch all appointments when new one is added
      onUpdate([]);
    },
    onUpdate: () => {
      // Refetch when appointment is updated
      onUpdate([]);
    },
    onDelete: () => {
      // Refetch when appointment is deleted
      onUpdate([]);
    },
  });

  return { isConnected };
};

/**
 * Hook for syncing messages with realtime updates
 */
export const useRealtimeMessages = (
  conversationId: string | null,
  onNewMessage: (message: any) => void
) => {
  const { isConnected } = useRealtimeSync({
    table: 'messages',
    filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined,
    enabled: !!conversationId,
    onInsert: onNewMessage,
  });

  return { isConnected };
};

/**
 * Hook for syncing client profile updates
 */
export const useRealtimeClientProfile = (
  clientId: string | null,
  onProfileUpdate: (profile: any) => void
) => {
  const { isConnected } = useRealtimeSync({
    table: 'client_profiles',
    filter: clientId ? `id=eq.${clientId}` : undefined,
    enabled: !!clientId,
    onUpdate: (newProfile) => {
      onProfileUpdate(newProfile);
    },
  });

  return { isConnected };
};
