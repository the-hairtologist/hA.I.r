/**
 * Messages API Layer
 * Centralized message operations with query tracking
 */

import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/logger';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  video_url?: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  recipient?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface Conversation {
  id: string;
  partner: {
    id: string;
    full_name: string | null;
    email: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

/**
 * Fetch all messages for a user
 */
export async function fetchUserMessages(userId: string): Promise<Message[]> {
  log.info('Fetching user messages', 'messagesAPI', { userId });
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email),
      recipient:profiles!messages_recipient_id_fkey(id, full_name, email)
    `)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    log.error('Failed to fetch messages', 'messagesAPI', error);
    throw error;
  }

  return (data || []) as Message[];
}

/**
 * Fetch messages for a specific conversation
 */
export async function fetchConversationMessages(userId: string, partnerId: string): Promise<Message[]> {
  log.info('Fetching conversation messages', 'messagesAPI', { userId, partnerId });
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email)
    `)
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) {
    log.error('Failed to fetch conversation', 'messagesAPI', error);
    throw error;
  }

  return (data || []) as Message[];
}

/**
 * Send a message
 */
export async function sendMessage(senderId: string, recipientId: string, messageText: string): Promise<Message> {
  log.info('Sending message', 'messagesAPI', { senderId, recipientId });
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      message_text: messageText.trim(),
    })
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email)
    `)
    .single();

  if (error) {
    log.error('Failed to send message', 'messagesAPI', error);
    throw error;
  }

  return data as Message;
}

/**
 * Upload video message
 */
export async function uploadVideoMessage(
  senderId: string,
  recipientId: string,
  file: File
): Promise<Message> {
  log.info('Uploading video message', 'messagesAPI', { senderId, recipientId, fileSize: file.size });
  
  // Validate file
  if (!file.type.startsWith('video/')) {
    throw new Error('File must be a video');
  }
  
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  if (file.size > MAX_SIZE) {
    throw new Error('Video must be less than 50MB');
  }

  // Upload to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${senderId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('client-videos')
    .upload(fileName, file);

  if (uploadError) {
    log.error('Failed to upload video', 'messagesAPI', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('client-videos')
    .getPublicUrl(fileName);

  // Create message with video
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      video_url: publicUrl,
      message_text: 'Sent a video',
    })
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email)
    `)
    .single();

  if (error) {
    log.error('Failed to create video message', 'messagesAPI', error);
    throw error;
  }

  return data as Message;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(messageIds: string[]): Promise<void> {
  log.info('Marking messages as read', 'messagesAPI', { count: messageIds.length });
  
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .in('id', messageIds);

  if (error) {
    log.error('Failed to mark messages as read', 'messagesAPI', error);
    throw error;
  }
}

/**
 * Group messages into conversations
 */
export function groupMessagesIntoConversations(messages: Message[], userId: string): Conversation[] {
  const conversationsMap = new Map<string, Conversation>();
  
  messages.forEach((msg) => {
    const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
    const partner = msg.sender_id === userId ? msg.recipient : msg.sender;
    
    if (!conversationsMap.has(partnerId) && partner) {
      conversationsMap.set(partnerId, {
        id: partnerId,
        partner: {
          id: partner.id,
          full_name: partner.full_name,
          email: partner.email,
        },
        lastMessage: msg,
        unreadCount: msg.recipient_id === userId && !msg.is_read ? 1 : 0,
      });
    } else if (conversationsMap.has(partnerId)) {
      const conv = conversationsMap.get(partnerId)!;
      if (msg.recipient_id === userId && !msg.is_read) {
        conv.unreadCount++;
      }
    }
  });

  return Array.from(conversationsMap.values());
}
