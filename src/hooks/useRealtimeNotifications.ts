import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeNotifications = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to appointment changes
    const appointmentChannel = supabase
      .channel('appointment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          logger.debug('Appointment change detected:', payload);
...
          logger.debug('New message received:', payload);
          
          setUnreadCount((prev) => prev + 1);
          
          toast({
            title: "New Message",
            description: "You have received a new message",
          });
          
          // Invalidate messages query to refresh data
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      
      if (count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    return () => {
      supabase.removeChannel(appointmentChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [userId, toast, queryClient]);

  return { unreadCount };
};
