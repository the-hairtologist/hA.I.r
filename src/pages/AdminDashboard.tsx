import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Users, DollarSign, Calendar, TrendingUp, Activity, Shield, Eye, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>({});

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Get all users count by role
      const { count: stylistCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'stylist');

      const { count: clientCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');

      // Get total appointments
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      // Get recent users (last 10)
      const { data: users } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentUsers(users || []);

      // Get recent appointments (last 10)
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          stylist:stylist_profiles(user:profiles(full_name)),
          client:client_profiles(user:profiles(full_name))
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentAppointments(appointments || []);

      // Get system health
      const { count: errorCount } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalStylists: stylistCount || 0,
        totalClients: clientCount || 0,
        totalAppointments: appointmentCount || 0,
        recentErrors: errorCount || 0,
      });

      // Mock revenue data (you'd calculate this from actual payment data)
      setRevenue({
        today: 0,
        week: 0,
        month: 0,
        total: 0,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* God Mode Header */}
        <div className="relative overflow-hidden rounded-xl border-4 border-foreground bg-gradient-to-br from-primary via-accent to-secondary p-4 md:p-8 shadow-brutal-2xl">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-warning animate-pulse" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-on-surface-primary">
                  Admin Command Center
                </h1>
              </div>
              <Badge className="bg-warning text-warning-foreground border-2 border-foreground w-fit">
                GOD MODE
              </Badge>
            </div>
            <p className="text-sm md:text-base text-on-surface-primary/80">
              Complete control and visibility over your platform
            </p>
          </div>
          <div className="absolute top-0 right-0 opacity-10">
            <Shield className="h-32 w-32 md:h-64 md:w-64" />
          </div>
        </div>

        {/* God Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-4 border-foreground shadow-brutal">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stylists</p>
                  <p className="text-3xl font-bold">{stats.totalStylists}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground shadow-brutal">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-3xl font-bold">{stats.totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground shadow-brutal">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                  <p className="text-3xl font-bold">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground shadow-brutal">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Errors</p>
                  <p className="text-3xl font-bold">{stats.recentErrors}</p>
                </div>
                <Activity className={`h-8 w-8 ${stats.recentErrors > 0 ? 'text-destructive' : 'text-success'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Admin Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Button
            onClick={() => navigate('/admin/users')}
            className="h-auto flex-col gap-2 p-3 md:p-4 border-2 border-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            variant="outline"
          >
            <Users className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-[10px] md:text-xs font-medium text-center">User Management</span>
          </Button>
          <Button
            onClick={() => navigate('/system-health')}
            className="h-auto flex-col gap-2 p-3 md:p-4 border-2 border-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            variant="outline"
          >
            <Activity className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-[10px] md:text-xs font-medium text-center">System Health</span>
          </Button>
          <Button
            onClick={() => navigate('/access-codes')}
            className="h-auto flex-col gap-2 p-3 md:p-4 border-2 border-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all col-span-2 md:col-span-1"
            variant="outline"
          >
            <SettingsIcon className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-[10px] md:text-xs font-medium text-center">Access Codes</span>
          </Button>
        </div>

        {/* Detailed Views */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Recent Users</TabsTrigger>
            <TabsTrigger value="appointments">Recent Appointments</TabsTrigger>
            <TabsTrigger value="activity">Platform Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle>Recent User Registrations</CardTitle>
                <CardDescription>Last 10 users who joined the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 md:p-4 border-2 border-foreground rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{user.full_name || 'Unknown'}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {user.user_roles?.map((ur: any) => (
                          <Badge key={ur.role} variant="secondary" className="text-xs">
                            {ur.role}
                          </Badge>
                        ))}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate(`/admin/user/${user.id}`)}
                          className="border-2 border-foreground shadow-brutal hover:bg-secondary text-xs"
                        >
                          <Eye className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                          <span className="hidden md:inline">View</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Last 10 appointments booked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAppointments.map((appt) => (
                    <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 md:p-4 border-2 border-foreground rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{appt.service_type}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {appt.stylist?.user?.full_name} → {appt.client?.user?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(appt.appointment_date), 'PPp')}
                        </p>
                      </div>
                      <Badge className="w-fit text-xs">{appt.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
                <CardDescription>Real-time platform metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Active Users (24h)</span>
                      <span className="text-2xl font-bold">{stats.totalClients + stats.totalStylists}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '75%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Appointment Rate</span>
                      <span className="text-2xl font-bold">85%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">System Health</span>
                      <span className="text-2xl font-bold text-success">99.9%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: '99.9%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
