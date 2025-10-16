import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, Trash2, Calendar, MessageSquare, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const Notifications = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', session?.user?.id, filter],
    queryFn: async () => {
      // For now, return mock data. In production, fetch from notifications table
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "appointment",
          title: "New Appointment Booked",
          message: "Sarah Johnson booked a color consultation for tomorrow at 2 PM",
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          type: "message",
          title: "New Message",
          message: "You have a new message from Mike Davis",
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          type: "payment",
          title: "Payment Received",
          message: "Payment of $150 received from Emily Chen",
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      return filter === "unread" 
        ? mockNotifications.filter(n => !n.read)
        : mockNotifications;
    },
    enabled: !!session?.user?.id,
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      // In production: update notification in database
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Marked as read");
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      // In production: delete notification from database
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Notification deleted");
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      // In production: update all notifications
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("All notifications marked as read");
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "appointment": return Calendar;
      case "message": return MessageSquare;
      case "payment": return DollarSign;
      case "client": return Users;
      default: return Bell;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-pixel">Notifications</h1>
            <p className="font-sans text-muted-foreground">Stay updated with your activity</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={() => markAllAsRead.mutate()} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 flex items-start gap-4 transition-colors hover:bg-muted/50 ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        notification.type === "appointment" ? "bg-blue-500/10" :
                        notification.type === "message" ? "bg-green-500/10" :
                        notification.type === "payment" ? "bg-amber-500/10" :
                        "bg-purple-500/10"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {notification.title}
                              {!notification.read && (
                                <Badge variant="secondary" className="ml-2">New</Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => markAsRead.mutate(notification.id)}
                            aria-label="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteNotification.mutate(notification.id)}
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
