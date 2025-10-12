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
          console.log('Appointment change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Appointment",
              description: "A new appointment has been scheduled",
            });
          } else if (payload.eventType === 'UPDATE') {
            const newStatus = (payload.new as any).status;
            const oldStatus = (payload.old as any)?.status;
            
            if (newStatus !== oldStatus) {
              toast({
                title: "Appointment Updated",
                description: `Status changed to ${newStatus}`,
              });
            }
          }
          
          // Invalidate appointments query to refresh data
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messageChannel = supabase
      .channel('message-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          
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
