/**
 * Admin Financial Dashboard - God-Tier Business Intelligence
 * Complete financial oversight for maximum profitability
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  Award,
  Zap,
  Crown,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCommissions: number;
  activeStylists: number;
  totalClients: number;
  appointmentsCompleted: number;
  averageTicket: number;
  revenueGrowth: number;
  topStylist: {
    name: string;
    revenue: number;
  } | null;
}

export const AdminFinancialDashboard = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCommissions: 0,
    activeStylists: 0,
    totalClients: 0,
    appointmentsCompleted: 0,
    averageTicket: 0,
    revenueGrowth: 0,
    topStylist: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Parallel data fetching for performance
      const [
        { data: commissions },
        { data: appointments },
        { data: stylists },
        { data: clients },
        { data: lastMonthAppointments }
      ] = await Promise.all([
        // Total commissions
        supabase
          .from('commissions')
          .select('commission_amount')
          .eq('status', 'paid'),
        
        // Current month appointments
        supabase
          .from('appointments')
          .select('id, service_type, stylist_id')
          .eq('status', 'completed')
          .gte('appointment_date', monthStart.toISOString())
          .lte('appointment_date', monthEnd.toISOString()),
        
        // Active stylists
        supabase
          .from('stylist_profiles')
          .select('id, user_id')
          .eq('is_available', true),
        
        // Total clients
        supabase
          .from('client_profiles')
          .select('id', { count: 'exact' }),
        
        // Last month appointments for growth calculation
        supabase
          .from('appointments')
          .select('id')
          .eq('status', 'completed')
          .gte('appointment_date', lastMonthStart.toISOString())
          .lte('appointment_date', lastMonthEnd.toISOString())
      ]);

      // Calculate total commissions
      const totalCommissions = commissions?.reduce(
        (sum, c) => sum + Number(c.commission_amount || 0), 
        0
      ) || 0;

      // Estimate revenue (assuming 10% commission rate on average)
      const estimatedMonthlyRevenue = (appointments?.length || 0) * 150; // $150 avg per appointment
      const estimatedTotalRevenue = totalCommissions * 10; // If 10% commission

      // Calculate growth
      const currentMonthCount = appointments?.length || 0;
      const lastMonthCount = lastMonthAppointments?.length || 0;
      const revenueGrowth = lastMonthCount > 0 
        ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100 
        : 0;

      // Get top stylist by appointments this month
      const stylistAppointments = appointments?.reduce((acc: any, appt) => {
        acc[appt.stylist_id] = (acc[appt.stylist_id] || 0) + 1;
        return acc;
      }, {});

      let topStylist = null;
      if (stylistAppointments && Object.keys(stylistAppointments).length > 0) {
        const topStylistId = Object.entries(stylistAppointments)
          .sort((a: any, b: any) => b[1] - a[1])[0][0];
        
        const { data: topStylistData } = await supabase
          .from('stylist_profiles')
          .select('user:profiles(full_name)')
          .eq('id', topStylistId)
          .maybeSingle();
        
        if (topStylistData) {
          topStylist = {
            name: (topStylistData as any).user?.full_name || 'Unknown',
            revenue: stylistAppointments[topStylistId] * 150
          };
        }
      }

      setMetrics({
        totalRevenue: estimatedTotalRevenue,
        monthlyRevenue: estimatedMonthlyRevenue,
        totalCommissions,
        activeStylists: stylists?.length || 0,
        totalClients: clients?.length || 0,
        appointmentsCompleted: currentMonthCount,
        averageTicket: currentMonthCount > 0 ? estimatedMonthlyRevenue / currentMonthCount : 0,
        revenueGrowth,
        topStylist
      });
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
          <Crown className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Financial Command Center</h2>
          <p className="text-muted-foreground">Complete business intelligence at your fingertips</p>
        </div>
      </div>

      {/* Primary Metrics - Revenue Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {formatCurrency(metrics.monthlyRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={metrics.revenueGrowth >= 0 ? "default" : "destructive"} className="text-xs">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                {metrics.revenueGrowth >= 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/50 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Total Platform Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">All-time estimated</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              Avg. Ticket Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(metrics.averageTicket)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Per appointment</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-500/50 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {formatCurrency(metrics.totalCommissions)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Paid to stylists</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics - Growth & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Active Stylists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.activeStylists}</div>
            <p className="text-xs text-muted-foreground mt-2">Revenue generators</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-2">Platform users</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Appointments (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.appointmentsCompleted}</div>
            <p className="text-xs text-muted-foreground mt-2">Completed this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer */}
      {metrics.topStylist && (
        <Card className="border-2 border-amber-500 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Top Performer This Month
            </CardTitle>
            <CardDescription>Highest revenue generator</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.topStylist.name}</p>
                <p className="text-muted-foreground">Leading the platform</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-amber-600">
                  {formatCurrency(metrics.topStylist.revenue)}
                </p>
                <p className="text-xs text-muted-foreground">Estimated revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Insights */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Key Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <PieChart className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Revenue Per Stylist</p>
              <p className="text-sm text-muted-foreground">
                {metrics.activeStylists > 0 
                  ? formatCurrency(metrics.monthlyRevenue / metrics.activeStylists) 
                  : '$0'} average per active stylist
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Target className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Client Monetization</p>
              <p className="text-sm text-muted-foreground">
                {metrics.totalClients > 0 
                  ? formatCurrency(metrics.monthlyRevenue / metrics.totalClients) 
                  : '$0'} revenue per client this month
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Platform Health</p>
              <p className="text-sm text-muted-foreground">
                {metrics.appointmentsCompleted > 0 
                  ? `${(metrics.appointmentsCompleted / metrics.activeStylists).toFixed(1)} appointments per stylist`
                  : 'No appointments yet'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
