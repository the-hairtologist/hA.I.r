import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logging/productionLogger';
import { trackSelect, trackUpdate } from '@/lib/logging/supabaseTracker';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_text?: string;
  video_url?: string;
  is_read: boolean;
  created_at: string;
}

export const useRealtimeMessages = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    const fetchMessages = async () => {
      try {
        const result = await trackSelect(
          async () => {
            const { data, error } = await supabase
              .from('messages')
              .select('*')
              .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
              .order('created_at', { ascending: false });
            return { data, error };
          },
          'messages',
          'useRealtimeMessages',
          { userId }
        );

        if (result.error) throw result.error;

        setMessages(result.data || []);

        // Count unread messages
        const unread = (result.data || []).filter(
          msg => msg.recipient_id === userId && !msg.is_read
        ).length;
        setUnreadCount(unread);
      } catch (error) {
        logger.error('Error fetching messages', error, {
          component: 'useRealtimeMessages',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up realtime subscription
    const realtimeChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        payload => {
          logger.debug('Message change received', {
            component: 'useRealtimeMessages',
            eventType: payload.eventType,
            id: (payload.new as any)?.id || (payload.old as any)?.id,
          });

          if (payload.eventType === 'INSERT') {
            setMessages(prev => [payload.new as Message, ...prev]);

            // Increment unread count if message is for current user and unread
            if (payload.new.recipient_id === userId && !payload.new.is_read) {
              setUnreadCount(prev => prev + 1);
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === payload.new.id ? (payload.new as Message) : msg
              )
            );

            // Update unread count if message was marked as read
            if (payload.new.recipient_id === userId && payload.new.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [userId]);

  const markAsRead = async (messageId: string) => {
    try {
      await trackUpdate(
        async () => {
          const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId);
          return { data: null, error };
        },
        'messages',
        'useRealtimeMessages',
        { messageId }
      );
    } catch (error) {
      logger.error('Error marking message as read', error, {
        component: 'useRealtimeMessages',
        messageId,
      });
    }
  };

  return { messages, unreadCount, isLoading, channel, markAsRead };
};
