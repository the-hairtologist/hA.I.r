import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, Calendar, MessageSquare, Star, Gift } from 'lucide-react';
import { haptic } from '@/platform/haptics';
import { logger } from '@/lib/logging/productionLogger';

interface NotificationEnhancerProps {
  userId: string;
  userRole: 'stylist' | 'client';
}

/**
 * Enhanced notification system with smart grouping and prioritization
 */
export const NotificationEnhancer = ({
  userId,
  userRole,
}: NotificationEnhancerProps) => {
  const navigate = useNavigate();
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    // Check for notifications on mount
    checkNotifications();

    // Set up interval for periodic checks (every 30 seconds)
    const interval = setInterval(checkNotifications, 30000);

    // Set up realtime subscription for instant notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: userRole === 'stylist' ? 'appointments' : 'messages',
        },
        payload => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userId, userRole]);

  const checkNotifications = async () => {
    try {
      if (userRole === 'stylist') {
        await checkStylistNotifications();
      } else {
        await checkClientNotifications();
      }
      setLastCheck(new Date());
    } catch (error) {
      logger.error('Error checking notifications', error, {
        component: 'NotificationEnhancer',
        userId,
        userRole,
      });
    }
  };

  const checkStylistNotifications = async () => {
    // Check for new appointments
    const { data: newAppointments } = await supabase
      .from('appointments')
      .select(
        `
        *,
        client:client_profiles(
          user:profiles(full_name)
        )
      `
      )
      .gt('created_at', lastCheck.toISOString())
      .eq('status', 'scheduled')
      .order('created_at', { ascending: false })
      .limit(5);

    if (newAppointments && newAppointments.length > 0) {
      const latest = newAppointments[0];
      haptic.success();

      toast.success('New Appointment! 📅', {
        description: `${latest.client?.user?.full_name} booked ${latest.service_type}`,
        action: {
          label: 'View',
          onClick: () => navigate('/appointments'),
        },
        duration: 6000,
      });
    }

    // Check for new messages
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('recipient_id', userId)
      .eq('is_read', false)
      .gt('created_at', lastCheck.toISOString());

    if (unreadMessages && unreadMessages.length > 0) {
      haptic.warning();

      toast.info(
        `${unreadMessages.length} New Message${unreadMessages.length > 1 ? 's' : ''}`,
        {
          icon: <MessageSquare className="h-4 w-4" />,
          action: {
            label: 'View',
            onClick: () => navigate('/messages'),
          },
        }
      );
    }

    // Check for new reviews
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { data: stylistProfile, error: profileError } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileError) {
        logger.error('Error loading stylist profile', profileError, {
          component: 'NotificationEnhancer',
          userId,
        });
      }

      if (stylistProfile) {
        const { data: newReviews } = await supabase
          .from('reviews')
          .select(
            `
            *,
            client:client_profiles(
              user:profiles(full_name)
            )
          `
          )
          .eq('stylist_id', stylistProfile.id)
          .gt('created_at', lastCheck.toISOString());

        if (newReviews && newReviews.length > 0) {
          const latest = newReviews[0];
          haptic.success();

          toast.success('New Review! ⭐', {
            description: `${latest.client?.user?.full_name} rated you ${latest.rating}/5`,
            action: {
              label: 'View',
              onClick: () => navigate('/dashboard'),
            },
          });
        }
      }
    }
  };

  const checkClientNotifications = async () => {
    // Check for appointment confirmations
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (clientProfile) {
        const { data: confirmedAppointments } = await supabase
          .from('appointments')
          .select(
            `
            *,
            stylist:stylist_profiles(
              user:profiles(full_name)
            )
          `
          )
          .eq('client_id', clientProfile.id)
          .eq('status', 'confirmed')
          .gt('updated_at', lastCheck.toISOString());

        if (confirmedAppointments && confirmedAppointments.length > 0) {
          const latest = confirmedAppointments[0];
          haptic.success();

          toast.success('Appointment Confirmed! ✓', {
            description: `Your appointment with ${latest.stylist?.user?.full_name} is confirmed`,
          });
        }

        // Check for milestones
        const { data: newMilestones } = await supabase
          .from('client_milestones')
          .select('*')
          .eq('client_id', clientProfile.id)
          .eq('celebrated', false)
          .gt('created_at', lastCheck.toISOString());

        if (newMilestones && newMilestones.length > 0) {
          const latest = newMilestones[0];
          haptic.success();

          const message =
            latest.milestone_type === 'anniversary'
              ? `${latest.milestone_value} Year Anniversary! 🎂`
              : `${latest.milestone_value} Appointments! ⭐`;

          toast.success('Milestone Reached! 🎉', {
            description: message,
            icon: <Gift className="h-4 w-4" />,
          });
        }
      }
    }

    // Check for new messages
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('recipient_id', userId)
      .eq('is_read', false)
      .gt('created_at', lastCheck.toISOString());

    if (unreadMessages && unreadMessages.length > 0) {
      haptic.warning();

      toast.info(
        `${unreadMessages.length} New Message${unreadMessages.length > 1 ? 's' : ''}`,
        {
          icon: <MessageSquare className="h-4 w-4" />,
          action: {
            label: 'View',
            onClick: () => navigate('/messages'),
          },
        }
      );
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    // Realtime notification received
    checkNotifications();
  };

  return null; // This is a headless component
};
