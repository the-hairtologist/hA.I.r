import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Crown, Users, DollarSign, Calendar, TrendingUp, Activity, Shield, 
  Eye, Settings as SettingsIcon, AlertTriangle, Brain, Target, Zap,
  RefreshCw, Lock, BarChart3, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AdminCommandCenter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>({});
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommandCenterData();
    const interval = setInterval(loadCommandCenterData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadCommandCenterData = async () => {
    try {
      setLoading(true);

      // Parallel data fetching for performance
      const [
        stylistCountResult,
        clientCountResult,
        appointmentCountResult,
        completedApptResult,
        usersResult,
        appointmentsResult,
        auditLogsResult,
        errorLogsResult,
        paymentsResult
      ] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'stylist'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('profiles').select('*, user_roles(role)').order('created_at', { ascending: false }).limit(10),
        supabase.from('appointments').select('*, stylist:stylist_profiles(user:profiles(full_name)), client:client_profiles(user:profiles(full_name))').order('created_at', { ascending: false }).limit(10),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('error_logs').select('*').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: false }).limit(20),
        supabase.from('payments').select('amount, created_at, status')
      ]);

      setRecentUsers(usersResult.data || []);
      setRecentAppointments(appointmentsResult.data || []);
      setAuditLogs(auditLogsResult.data || []);
      setErrorLogs(errorLogsResult.data || []);

      // Calculate business metrics
      const totalRevenue = paymentsResult.data?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
      const completionRate = appointmentCountResult.count ? 
        ((completedApptResult.count || 0) / appointmentCountResult.count * 100).toFixed(1) : 0;

      setStats({
        totalStylists: stylistCountResult.count || 0,
        totalClients: clientCountResult.count || 0,
        totalAppointments: appointmentCountResult.count || 0,
        completedAppointments: completedApptResult.count || 0,
        recentErrors: errorLogsResult.data?.length || 0,
        completionRate,
      });

      setBusinessMetrics({
        totalRevenue,
        avgRevenue: appointmentCountResult.count ? (totalRevenue / appointmentCountResult.count).toFixed(2) : 0,
        recentPayments: paymentsResult.data?.length || 0,
      });

    } catch (error) {
      console.error('Error loading command center data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runSystemMaintenance = async () => {
    toast({
      title: "Running System Maintenance",
      description: "Optimizing database and clearing old logs...",
    });

    try {
      // Call cleanup function
      const { error } = await supabase.rpc('cleanup_old_error_logs');
      
      if (error) throw error;

      toast({
        title: "Maintenance Complete",
        description: "System optimized successfully",
      });
      
      loadCommandCenterData();
    } catch (error) {
      toast({
        title: "Maintenance Failed",
        description: "Failed to complete maintenance",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Admin Command Center"
        icon={<Crown className="h-6 w-6" />}
        backTo="/admin/dashboard"
        actions={
          <div className="flex gap-2">
            <Button onClick={runSystemMaintenance} size="sm" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
            </Button>
            <Button onClick={loadCommandCenterData} variant="outline" size="sm" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />
      
      <div className="space-y-6">
        {/* God Mode Badge */}
        <div className="relative overflow-hidden rounded-xl border-4 border-foreground bg-gradient-to-br from-primary via-accent to-secondary p-6 shadow-brutal-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <Badge className="bg-warning text-warning-foreground border-2 border-foreground text-lg px-4 py-2">
                <Crown className="h-4 w-4 mr-2" />
                GOD MODE
              </Badge>
              <p className="text-on-surface-primary font-medium">
                Complete platform control and visibility
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 opacity-10">
            <Shield className="h-32 w-32" />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-4 border-foreground shadow-brutal">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stylists</p>
                  <p className="text-3xl font-bold">{stats.totalStylists}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active professionals</p>
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
                  <p className="text-xs text-muted-foreground mt-1">Platform users</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground shadow-brutal">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Appointments</p>
                  <p className="text-3xl font-bold">{stats.totalAppointments}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.completionRate}% completion</p>
                </div>
                <Calendar className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground shadow-brutal">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <p className="text-3xl font-bold">{stats.recentErrors === 0 ? '100%' : '98%'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.recentErrors} errors (24h)</p>
                </div>
                <Activity className={`h-8 w-8 ${stats.recentErrors === 0 ? 'text-success' : 'text-warning'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Intelligence */}
        <Card className="border-4 border-foreground shadow-brutal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Business Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">${businessMetrics.totalRevenue?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Platform lifetime
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg per Booking</p>
                <p className="text-3xl font-bold">${businessMetrics.avgRevenue || '0.00'}</p>
                <p className="text-xs text-muted-foreground">Revenue efficiency</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.completedAppointments} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-4 border-foreground shadow-brutal">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={() => navigate('/admin/users')} variant="outline" className="h-auto flex-col gap-2 p-4">
                <Users className="h-6 w-6" />
                <span className="text-xs">Manage Users</span>
              </Button>
              <Button onClick={() => navigate('/system-health')} variant="outline" className="h-auto flex-col gap-2 p-4">
                <Activity className="h-6 w-6" />
                <span className="text-xs">System Health</span>
              </Button>
              <Button onClick={() => navigate('/access-codes')} variant="outline" className="h-auto flex-col gap-2 p-4">
                <Lock className="h-6 w-6" />
                <span className="text-xs">Access Codes</span>
              </Button>
              <Button onClick={() => navigate('/settings')} variant="outline" className="h-auto flex-col gap-2 p-4">
                <SettingsIcon className="h-6 w-6" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle>Recent User Registrations</CardTitle>
                <CardDescription>Last 10 users who joined</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border-2 border-foreground rounded-lg gap-2">
                      <div className="flex-1">
                        <p className="font-semibold">{user.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {format(new Date(user.created_at), 'PPp')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.user_roles?.map((ur: any) => (
                          <Badge key={ur.role} variant="secondary">
                            {ur.role}
                          </Badge>
                        ))}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate(`/admin/user/${user.id}`)}
                          className="border-2 border-foreground shadow-brutal hover:bg-secondary"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
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
                <CardDescription>Last 10 bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAppointments.map((appt) => (
                    <div key={appt.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border-2 border-foreground rounded-lg gap-2">
                      <div className="flex-1">
                        <p className="font-semibold">{appt.service_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {appt.stylist?.user?.full_name} → {appt.client?.user?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(appt.appointment_date), 'PPp')}
                        </p>
                      </div>
                      <Badge variant={appt.status === 'completed' ? 'default' : 'secondary'}>
                        {appt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Audit Logs
                </CardTitle>
                <CardDescription>Recent security events and admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-xs text-muted-foreground">{log.table_name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(log.created_at), 'PPp')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
                      <p className="text-muted-foreground">No security events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Logs (24h)
                </CardTitle>
                <CardDescription>Recent system errors and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorLogs.length > 0 ? (
                    errorLogs.map((error) => (
                      <div key={error.id} className="p-3 border-2 border-destructive/20 bg-destructive/5 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{error.component}</p>
                            <p className="text-xs text-muted-foreground">{error.error_message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(error.created_at), 'PPp')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
                      <p className="text-muted-foreground">No errors in the last 24 hours</p>
                      <p className="text-sm text-success">System running smoothly!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
