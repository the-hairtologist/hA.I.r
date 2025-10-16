import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Mail, 
  TrendingUp, 
  Users, 
  MousePointer, 
  CheckCircle,
  Calendar,
  RefreshCw,
  BarChart3
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function EmailCampaigns() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [triggering, setTriggering] = useState(false);

  // Fetch campaign statistics
  const { data: stats, refetch } = useQuery({
    queryKey: ["email-campaign-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rebooking_reminders")
        .select("*")
        .eq("status", "sent")
        .order("sent_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate aggregated stats with proper typing
      const total = data.length;
      const opened = data.filter((r: any) => r.email_opened === true).length;
      const clicked = data.filter((r: any) => r.email_clicked === true).length;
      const converted = data.filter((r: any) => r.booked_after_reminder === true).length;

      return {
        total,
        opened,
        clicked,
        converted,
        openRate: total > 0 ? ((opened / total) * 100).toFixed(1) : "0",
        clickRate: total > 0 ? ((clicked / total) * 100).toFixed(1) : "0",
        conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : "0",
        recent: data.slice(0, 20),
      };
    },
  });

  const triggerManualSend = async () => {
    setTriggering(true);
    try {
      const { error } = await supabase.functions.invoke("send-rebooking-reminder", {
        body: { manual: true },
      });

      if (error) throw error;

      toast({
        title: "Reminders Triggered",
        description: "Checking for clients who need rebooking reminders...",
      });

      // Refetch stats after a delay
      setTimeout(() => refetch(), 3000);
    } catch (error: any) {
      console.error("Error triggering reminders:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger reminders",
        variant: "destructive",
      });
    } finally {
      setTriggering(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Email Campaigns</h1>
            <p className="text-muted-foreground">
              Monitor and manage your automated email campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/email-settings')}
              variant="outline"
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              Customize Emails
            </Button>
            <Button 
              onClick={triggerManualSend} 
              disabled={triggering}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${triggering ? 'animate-spin' : ''}`} />
              {triggering ? "Sending..." : "Send Now"}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                All-time campaign emails
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total ? `${stats?.opened || 0} emails opened` : 'No data yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Click Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.clickRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total ? `${stats?.clicked || 0} clicks on booking` : 'No data yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Conversion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total ? `${stats?.converted || 0} rebooked` : 'No data yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State Helper */}
        {(!stats || stats.total === 0) && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns sent yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Your automated rebooking reminders will start sending once you have clients with appointments 6+ weeks ago. Click "Send Now" to trigger a manual check.
              </p>
              <Button onClick={triggerManualSend} disabled={triggering} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${triggering ? 'animate-spin' : ''}`} />
                {triggering ? "Checking..." : "Check for Eligible Clients"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Campaign Details */}
        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Recent Campaigns</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Email Campaigns</CardTitle>
                <CardDescription>
                  Latest rebooking reminder emails sent to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                  {stats?.recent?.map((reminder: any) => (
                    <div 
                      key={reminder.id}
                      className="p-4 border-2 border-foreground rounded-lg space-y-3 shadow-brutal-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {new Date(reminder.sent_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <Badge variant={reminder.status === 'sent' ? 'default' : 'secondary'}>
                          {reminder.status}
                        </Badge>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {reminder.reminder_type === 'six_week' ? '6-Week Reminder' : reminder.reminder_type}
                      </Badge>
                      
                      <div className="flex flex-wrap gap-2">
                        {reminder.email_opened && (
                          <Badge variant="outline" className="text-xs">
                            📖 Opened
                          </Badge>
                        )}
                        {reminder.email_clicked && (
                          <Badge variant="outline" className="text-xs">
                            👆 Clicked
                          </Badge>
                        )}
                        {reminder.booked_after_reminder && (
                          <Badge variant="outline" className="text-xs bg-success/10">
                            ✅ Booked
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sent Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Engagement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats?.recent?.map((reminder: any) => (
                        <TableRow key={reminder.id}>
                          <TableCell>
                            {new Date(reminder.sent_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {reminder.reminder_type === 'six_week' ? '6-Week Reminder' : reminder.reminder_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={reminder.status === 'sent' ? 'default' : 'secondary'}>
                              {reminder.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {reminder.email_opened && (
                                <Badge variant="outline" className="text-xs">
                                  📖 Opened
                                </Badge>
                              )}
                              {reminder.email_clicked && (
                                <Badge variant="outline" className="text-xs">
                                  👆 Clicked
                                </Badge>
                              )}
                              {reminder.booked_after_reminder && (
                                <Badge variant="outline" className="text-xs bg-success/10">
                                  ✅ Booked
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Automated Schedule
                </CardTitle>
                <CardDescription>
                  Your email campaigns run automatically on this schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-accent/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Daily Rebooking Reminders</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Runs every day at 9:00 AM UTC (4:00 AM EST / 1:00 AM PST)
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Automatically checks for clients who had appointments 6 weeks ago
                      and haven't received a reminder yet.
                    </p>
                    <Badge variant="outline" className="mt-3">
                      ✅ Active
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Next Scheduled Run</h4>
                  <p className="text-sm text-muted-foreground">
                    Tomorrow at 9:00 AM UTC
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}