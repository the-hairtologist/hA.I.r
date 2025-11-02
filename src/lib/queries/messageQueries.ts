/**
 * Optimized Message Queries
 * Reduces database load with specific field selection and request deduplication
 */

import { supabase } from '@/integrations/supabase/client';
import { requestDeduplicator } from '@/lib/api/requestDeduplicator';

/**
 * Get conversations for a user - optimized
 */
export const getConversationsByUser = async (userId: string) => {
  return requestDeduplicator.deduplicate(
    `conversations-${userId}`,
    async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          id,
          sender_id,
          recipient_id,
          message_text,
          is_read,
          created_at,
          sender:profiles!messages_sender_id_fkey(id, full_name, email),
          recipient:profiles!messages_recipient_id_fkey(id, full_name, email)
        `
        )
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  );
};

/**
 * Get messages in a thread between two users
 */
export const getMessageThread = async (userId: string, partnerId: string) => {
  return requestDeduplicator.deduplicate(
    `thread-${userId}-${partnerId}`,
    async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          id,
          sender_id,
          recipient_id,
          message_text,
          video_url,
          is_read,
          created_at,
          sender:profiles!messages_sender_id_fkey(id, full_name, email)
        `
        )
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  );
};

/**
 * Get unread message count
 */
export const getUnreadMessageCount = async (userId: string) => {
  return requestDeduplicator.deduplicate(`unread-count-${userId}`, async () => {
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  });
};
