/**
 * Optimized Message Queries
 * Replaces select("*") with specific field selections
 */

import { supabase } from "@/integrations/supabase/client";

export interface MessageFields {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  video_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface MessageWithSender extends MessageFields {
  sender: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface MessageWithParticipants extends MessageFields {
  sender: {
    id: string;
    full_name: string;
    email: string;
  };
  recipient: {
    id: string;
    full_name: string;
    email: string;
  };
}

/**
 * Get all messages for user (for conversations list)
 */
export async function getMessagesForUser(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      sender_id,
      recipient_id,
      message_text,
      video_url,
      is_read,
      created_at,
      sender:profiles!messages_sender_id_fkey(id, full_name, email),
      recipient:profiles!messages_recipient_id_fkey(id, full_name, email)
    `)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as any;
}

/**
 * Get messages between two users
 */
export async function getMessageThread(userId: string, partnerId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      sender_id,
      recipient_id,
      message_text,
      video_url,
      is_read,
      created_at,
      sender:profiles!messages_sender_id_fkey(id, full_name, email)
    `)
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as any;
}

/**
 * Get unread message count for user
 */
export async function getUnreadMessageCount(userId: string) {
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count || 0;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(messageIds: string[]) {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .in("id", messageIds);

  if (error) throw error;
}
