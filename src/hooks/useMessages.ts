/**
 * Messages React Query Hooks
 * Handles message fetching, sending, and real-time updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserMessages,
  fetchConversationMessages,
  sendMessage,
  uploadVideoMessage,
  markMessagesAsRead,
  groupMessagesIntoConversations,
  type Message,
  type Conversation,
} from '@/lib/api/messages';
import { toast } from 'sonner';
import { log } from '@/lib/logger';

// Query key factory
export const messageKeys = {
  all: ['messages'] as const,
  conversations: (userId: string) => ['messages', 'conversations', userId] as const,
  conversation: (userId: string, partnerId: string) => 
    ['messages', 'conversation', userId, partnerId] as const,
};

/**
 * Hook to fetch and group user conversations
 */
export function useConversations(userId: string | null) {
  return useQuery({
    queryKey: messageKeys.conversations(userId || ''),
    queryFn: async () => {
      const messages = await fetchUserMessages(userId!);
      return groupMessagesIntoConversations(messages, userId!);
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to fetch messages in a specific conversation
 */
export function useConversation(userId: string | null, partnerId: string | null) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: messageKeys.conversation(userId || '', partnerId || ''),
    queryFn: async () => {
      const messages = await fetchConversationMessages(userId!, partnerId!);
      
      // Mark unread messages as read
      const unreadIds = messages
        .filter(msg => msg.recipient_id === userId && !msg.is_read)
        .map(msg => msg.id);
      
      if (unreadIds.length > 0) {
        await markMessagesAsRead(unreadIds);
        // Invalidate conversations to update unread counts
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations(userId!) });
      }
      
      return messages;
    },
    enabled: !!userId && !!partnerId,
    staleTime: 1000 * 10, // 10 seconds
  });
}

/**
 * Hook to send a text message
 */
export function useSendMessage(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipientId, text }: { recipientId: string; text: string }) =>
      sendMessage(userId!, recipientId, text),
    onSuccess: (_, { recipientId }) => {
      // Invalidate both the conversation and conversations list
      queryClient.invalidateQueries({ queryKey: messageKeys.conversation(userId!, recipientId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations(userId!) });
    },
    onError: (error) => {
      log.error('Failed to send message', 'useMessages', error as Error);
      toast.error('Failed to send message');
    },
  });
}

/**
 * Hook to send a video message
 */
export function useSendVideoMessage(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipientId, file }: { recipientId: string; file: File }) =>
      uploadVideoMessage(userId!, recipientId, file),
    onSuccess: (_, { recipientId }) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversation(userId!, recipientId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations(userId!) });
      toast.success('Video sent successfully!');
    },
    onError: (error) => {
      log.error('Failed to send video', 'useMessages', error as Error);
      toast.error((error as Error).message || 'Failed to send video');
    },
  });
}
