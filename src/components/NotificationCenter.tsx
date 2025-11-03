import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { logger } from '@/lib/logging/productionLogger';

export const NotificationCenter = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        () => loadNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadNotifications = async () => {
    try {
      // Get recent appointments (simplified notification system)
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .or(
          `stylist_id.in.(SELECT id FROM stylist_profiles WHERE user_id = '${userId}'),client_id.in.(SELECT id FROM client_profiles WHERE user_id = '${userId}')`
        )
        .order('created_at', { ascending: false })
        .limit(5);

      // Get unread messages
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('recipient_id', userId)
        .eq('is_read', false);

      setNotifications(appointments || []);
      setUnreadCount(messages?.length || 0);
    } catch (error) {
      logger.error('Error loading notifications', error, {
        component: 'NotificationCenter',
        userId,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-[44px] min-w-[44px]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map(notification => (
            <DropdownMenuItem
              key={notification.id}
              className="flex-col items-start p-4"
            >
              <p className="font-semibold text-sm">
                Appointment {notification.status}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(notification.created_at), 'MMM d, h:mm a')}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
