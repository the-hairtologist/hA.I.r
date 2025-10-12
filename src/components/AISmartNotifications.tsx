/**
 * AI Smart Notifications Component
 * Learns user preferences and provides intelligent notifications
 */

import { useState, useEffect } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SmartNotification {
  id: string;
  type: 'retention' | 'opportunity' | 'insight' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionUrl?: string;
  createdAt: Date;
}

export const AISmartNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      loadSmartNotifications();
    }
  }, [user]);

  const loadSmartNotifications = async () => {
    if (!user) return;

    const notifications: SmartNotification[] = [];

    try {
      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (stylistProfile) {
        // Check for clients needing attention
        const { data: appointments } = await supabase
          .from('appointments')
          .select('client_id, appointment_date')
          .eq('stylist_id', stylistProfile.id)
          .order('appointment_date', { ascending: false });

        if (appointments && appointments.length > 0) {
          // Group by client and find those overdue
          const clientLastVisit = new Map<string, Date>();
          
          appointments.forEach(apt => {
            const date = new Date(apt.appointment_date);
            if (!clientLastVisit.has(apt.client_id) || date > clientLastVisit.get(apt.client_id)!) {
              clientLastVisit.set(apt.client_id, date);
            }
          });

          // Find clients overdue (>60 days)
          const now = new Date();
          let overdueCount = 0;
          
          clientLastVisit.forEach((lastDate, clientId) => {
            const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince > 60) {
              overdueCount++;
            }
          });

          if (overdueCount > 0) {
            notifications.push({
              id: 'retention-alert',
              type: 'retention',
              title: '📊 Client Retention Alert',
              message: `${overdueCount} client${overdueCount > 1 ? 's' : ''} haven't visited in 60+ days`,
              priority: 'high',
              actionLabel: 'View Details',
              actionUrl: '/system-health?tab=retention',
              createdAt: new Date()
            });
          }
        }

        // Check for today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: todayApts, count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('stylist_id', stylistProfile.id)
          .gte('appointment_date', today.toISOString())
          .lt('appointment_date', tomorrow.toISOString())
          .eq('status', 'scheduled');

        if (count && count > 0) {
          notifications.push({
            id: 'today-appointments',
            type: 'reminder',
            title: '📅 Today\'s Schedule',
            message: `You have ${count} appointment${count > 1 ? 's' : ''} scheduled today`,
            priority: 'medium',
            actionLabel: 'View Calendar',
            actionUrl: '/appointments',
            createdAt: new Date()
          });
        }
      }

      setNotifications(notifications);
    } catch (error) {
      console.error('Failed to load smart notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => n.priority === 'high').length;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 top-full mt-2 w-96 z-50 shadow-lg">
          <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold">AI Smart Notifications</span>
            </div>

            {notifications.map(notification => (
              <Card key={notification.id} className="border-l-4" style={{
                borderLeftColor: notification.priority === 'high' ? 'hsl(var(--destructive))' : 
                                 notification.priority === 'medium' ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))'
              }}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <Badge variant={
                        notification.priority === 'high' ? 'destructive' : 
                        notification.priority === 'medium' ? 'default' : 
                        'secondary'
                      } className="text-xs">
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    {notification.actionLabel && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                        }}
                        className="w-full"
                      >
                        {notification.actionLabel}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
