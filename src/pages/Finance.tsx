import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePerformance } from '@/hooks/usePerformance';
import { supabase } from '@/integrations/supabase/client';
import {
  getPaymentsByStylist,
  getCommissionsByStylist,
  getAffiliateCodesByStylist,
} from '@/lib/queries/financeQueries';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  DollarSign,
  TrendingUp,
  Loader2,
  Plus,
  Copy,
  ExternalLink,
  Tag,
  Calendar,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { exportToCSV, formatDataForExport } from '@/lib/csvExport';
import type {
  LineChart as LineChartType,
  Line as LineType,
  BarChart as BarChartType,
  Bar as BarType,
  XAxis as XAxisType,
  YAxis as YAxisType,
  CartesianGrid as CartesianGridType,
  Tooltip as TooltipType,
  ResponsiveContainer as ResponsiveContainerType,
  Legend as LegendType,
} from 'recharts';

// Lazy load recharts components
let LineChart: typeof LineChartType | undefined;
let Line: typeof LineType | undefined;
let BarChart: typeof BarChartType | undefined;
let Bar: typeof BarType | undefined;
let XAxis: typeof XAxisType | undefined;
let YAxis: typeof YAxisType | undefined;
let CartesianGrid: typeof CartesianGridType | undefined;
let Tooltip: typeof TooltipType | undefined;
let ResponsiveContainer: typeof ResponsiveContainerType | undefined;
let Legend: typeof LegendType | undefined;

import { logger } from '@/lib/logger';
import { FinanceSkeleton } from '@/components/skeletons';
import { typography } from '@/lib/design/typography';
import { cn } from '@/lib/utils';
import { DataErrorBoundary } from '@/components/errors/DataErrorBoundary';

const loadCharts = async () => {
  const charts = await import('recharts');
  LineChart = charts.LineChart;
  Line = charts.Line;
  BarChart = charts.BarChart;
  Bar = charts.Bar;
  XAxis = charts.XAxis;
  YAxis = charts.YAxis;
  CartesianGrid = charts.CartesianGrid;
  Tooltip = charts.Tooltip;
  ResponsiveContainer = charts.ResponsiveContainer;
  Legend = charts.Legend;
};

const Finance = () => {
  // Performance tracking
  usePerformance({
    componentName: 'Finance',
    trackRenders: true,
    trackMounts: true,
    reportThreshold: 16,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [affiliateCodes, setAffiliateCodes] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [timePeriod, setTimePeriod] = useState<'30d' | '90d' | 'year' | 'all'>(
    '90d'
  );

  // Load charts library on first use
  useEffect(() => {
    loadCharts().then(() => setChartsLoaded(true));
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Handle hash navigation
    const hash = location.hash.replace('#', '');
    if (hash === 'commissions') {
      setActiveTab('commissions');
    } else if (hash === 'affiliate') {
      setActiveTab('affiliate');
    }
  }, [location.hash]);

  const loadData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: stylist, error: stylistError } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (stylistError) {
        logger.error('Error fetching stylist profile', 'Finance', stylistError as Error);
        toast.error('Failed to load stylist profile');
        navigate('/dashboard');
        return;
      }

      if (!stylist) {
        logger.warn('No stylist profile found for user', 'Finance', { userId: session.user.id });
        toast.error('Stylist profile not found', {
          description: 'Please complete your profile first',
        });
        navigate('/settings');
        return;
      }

      setStylistProfile(stylist);

      // Use optimized queries with request deduplication - load in parallel
      const [paymentsData, commissionsData, brandsData, codesData] =
        await Promise.all([
          getPaymentsByStylist(stylist.id),
          getCommissionsByStylist(stylist.id),
          supabase
            .from('hair_brands')
            .select('id, name, logo_url, base_commission_rate')
            .eq('is_active', true)
            .then(r => r.data),
          getAffiliateCodesByStylist(stylist.id),
        ]);

      setPayments(paymentsData || []);
      setCommissions(commissionsData || []);
      setBrands(brandsData || []);
      setAffiliateCodes(codesData || []);
    } catch (error: any) {
      logger.error('Error loading data', 'Finance', error as Error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  // Filter data by time period
  const getFilteredData = (data: any[], dateField: string = 'created_at') => {
    if (timePeriod === 'all') return data;

    const now = new Date();
    let cutoffDate: Date;

    switch (timePeriod) {
      case '30d':
        cutoffDate = subDays(now, 30);
        break;
      case '90d':
        cutoffDate = subDays(now, 90);
        break;
      case 'year':
        cutoffDate = subDays(now, 365);
        break;
      default:
        return data;
    }

    return data.filter(item => new Date(item[dateField]) >= cutoffDate);
  };

  const filteredPayments = getFilteredData(
    payments.filter(p => p.status === 'completed')
  );
  const filteredCommissions = getFilteredData(
    commissions.filter(c => c.status === 'paid')
  );

  const totalPayments = filteredPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0
  );
  const totalCommissions = filteredCommissions.reduce(
    (sum, c) => sum + parseFloat(c.commission_amount),
    0
  );

  const pendingCommissions = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

  const totalRevenue = totalPayments + totalCommissions;

  // Chart data - group by month or week based on period
  const chartData = useMemo(() => {
    const groupByMonth = timePeriod === 'year' || timePeriod === 'all';
    const allData = [...filteredPayments, ...filteredCommissions];

    if (allData.length === 0) return [];

    const grouped: Record<
      string,
      { date: string; payments: number; commissions: number; total: number }
    > = {};

    allData.forEach(item => {
      const date = new Date(item.created_at);
      const key = groupByMonth
        ? format(startOfMonth(date), 'MMM yyyy')
        : format(startOfWeek(date), 'MMM d');

      if (!grouped[key]) {
        grouped[key] = { date: key, payments: 0, commissions: 0, total: 0 };
      }

      const amount = parseFloat(item.amount || item.commission_amount);
      if ('amount' in item) {
        grouped[key].payments += amount;
      } else {
        grouped[key].commissions += amount;
      }
      grouped[key].total += amount;
    });

    return Object.values(grouped).sort((a, b) => {
      const dateA = groupByMonth ? new Date(a.date + ' 1') : new Date(a.date);
      const dateB = groupByMonth ? new Date(b.date + ' 1') : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredPayments, filteredCommissions, timePeriod]);

  // Calculate period comparison (current vs previous period)
  const periodComparison = useMemo(() => {
    const now = new Date();
    let currentStart: Date, previousStart: Date;

    switch (timePeriod) {
      case '30d':
        currentStart = subDays(now, 30);
        previousStart = subDays(now, 60);
        break;
      case '90d':
        currentStart = subDays(now, 90);
        previousStart = subDays(now, 180);
        break;
      case 'year':
        currentStart = subDays(now, 365);
        previousStart = subDays(now, 730);
        break;
      default:
        return null;
    }

    const currentPeriodRevenue = [...payments, ...commissions]
      .filter(item => {
        const date = new Date(item.created_at);
        return date >= currentStart && date <= now;
      })
      .reduce(
        (sum, item) => sum + parseFloat(item.amount || item.commission_amount),
        0
      );

    const previousPeriodRevenue = [...payments, ...commissions]
      .filter(item => {
        const date = new Date(item.created_at);
        return date >= previousStart && date < currentStart;
      })
      .reduce(
        (sum, item) => sum + parseFloat(item.amount || item.commission_amount),
        0
      );

    const change = currentPeriodRevenue - previousPeriodRevenue;
    const percentChange =
      previousPeriodRevenue > 0 ? (change / previousPeriodRevenue) * 100 : 0;

    return {
      current: currentPeriodRevenue,
      previous: previousPeriodRevenue,
      change,
      percentChange,
      isPositive: change >= 0,
    };
  }, [payments, commissions, timePeriod]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Code copied to clipboard', {
        icon: '✓',
        duration: 2000,
      });
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleExportPayments = () => {
    try {
      const exportData = formatDataForExport(filteredPayments);
      exportToCSV(exportData, 'payments');
      toast.success('Payments exported successfully');
    } catch (error) {
      toast.error('Failed to export payments');
    }
  };

  const handleExportCommissions = () => {
    try {
      const exportData = formatDataForExport(filteredCommissions);
      exportToCSV(exportData, 'commissions');
      toast.success('Commissions exported successfully');
    } catch (error) {
      toast.error('Failed to export commissions');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <FinanceSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PageHeader
        title="Finance"
        icon={<DollarSign className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Time Period Selector */}
        <Card className="brutal-border shadow-brutal-lg mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Label className="text-sm font-medium">Time Period:</Label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: '30d', label: 'Last 30 Days' },
                  { value: '90d', label: 'Last 90 Days' },
                  { value: 'year', label: 'Last Year' },
                  { value: 'all', label: 'All Time' },
                ].map(option => (
                  <Button
                    key={option.value}
                    variant={
                      timePeriod === option.value ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      setTimePeriod(option.value as typeof timePeriod)
                    }
                    className="brutal-border-subtle"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="brutal-border shadow-brutal-lg">
            <CardHeader className="pb-2">
              <CardTitle className={typography.label.default}>
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(typography.stat.secondary, "text-primary")}>
                ${totalRevenue.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <p className={typography.description.small}>
                  {timePeriod === '30d'
                    ? 'Last 30 days'
                    : timePeriod === '90d'
                      ? 'Last 90 days'
                      : timePeriod === 'year'
                        ? 'Last year'
                        : 'All time'}
                </p>
                {periodComparison && periodComparison.percentChange !== 0 && (
                  <Badge
                    variant={
                      periodComparison.isPositive ? 'default' : 'destructive'
                    }
                    className="gap-1 text-xs"
                  >
                    {periodComparison.isPositive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(periodComparison.percentChange).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="brutal-border shadow-brutal-lg">
            <CardHeader className="pb-2">
              <CardTitle className={typography.label.default}>
                Service Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(typography.stat.secondary, "text-primary")}>
                ${totalPayments.toFixed(2)}
              </div>
              <p className={cn(typography.description.small, "mt-1")}>
                Client payments
              </p>
            </CardContent>
          </Card>

          <Card className="brutal-border shadow-brutal-lg">
            <CardHeader className="pb-2">
              <CardTitle className={typography.label.default}>
                Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(typography.stat.secondary, "text-chart-3")}>
                ${totalCommissions.toFixed(2)}
              </div>
              <p className={cn(typography.description.small, "mt-1")}>
                ${pendingCommissions.toFixed(2)} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trends Chart */}
        {chartData.length > 0 && (
          <DataErrorBoundary feature="Revenue Chart" onReset={() => loadData()}>
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
                <CardDescription>Track your earnings over time</CardDescription>
              </CardHeader>
              <CardContent>
                {!chartsLoaded ? (
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="h-[300px] w-full overflow-x-auto">
                      {ResponsiveContainer &&
                        LineChart &&
                        Line &&
                        XAxis &&
                        YAxis &&
                        CartesianGrid &&
                        Tooltip &&
                        Legend && (
                          <div style={{ minWidth: '320px', width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={chartData}
                              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                              />
                              <XAxis
                                dataKey="date"
                                className="text-xs fill-muted-foreground"
                              />
                              <YAxis
                                className="text-xs fill-muted-foreground"
                                tickFormatter={value => `$${value}`}
                              />
                              <Tooltip
                                formatter={(value: number) => [
                                  `$${value.toFixed(2)}`,
                                  '',
                                ]}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="payments"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                name="Service Payments"
                                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="commissions"
                                stroke="hsl(var(--chart-3))"
                                strokeWidth={2}
                                name="Commissions"
                                dot={{ fill: 'hsl(var(--chart-3))', r: 4 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="total"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={3}
                                name="Total Revenue"
                                dot={{ fill: 'hsl(var(--chart-1))', r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          </div>
                        )}
                    </div>

                    {/* Weekly Breakdown Bar Chart */}
                    {timePeriod !== 'all' &&
                      timePeriod !== 'year' &&
                      BarChart &&
                      Bar && (
                        <div className="mt-8 h-[250px] w-full">
                          <h3 className="text-sm font-medium mb-4">
                            Weekly Breakdown
                          </h3>
                          {ResponsiveContainer &&
                            XAxis &&
                            YAxis &&
                            CartesianGrid &&
                            Tooltip &&
                            Legend && (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={chartData}
                                  margin={{
                                    top: 5,
                                    right: 20,
                                    bottom: 5,
                                    left: 0,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                  />
                                  <XAxis
                                    dataKey="date"
                                    className="text-xs fill-muted-foreground"
                                  />
                                  <YAxis
                                    className="text-xs fill-muted-foreground"
                                    tickFormatter={value => `$${value}`}
                                  />
                                  <Tooltip
                                    formatter={(value: number) => [
                                      `$${value.toFixed(2)}`,
                                      '',
                                    ]}
                                  />
                                  <Legend />
                                  <Bar
                                    dataKey="payments"
                                    fill="hsl(var(--primary))"
                                    name="Payments"
                                  />
                                  <Bar
                                    dataKey="commissions"
                                    fill="hsl(var(--chart-3))"
                                    name="Commissions"
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                        </div>
                      )}
                  </>
                )}
              </CardContent>
            </Card>
          </DataErrorBoundary>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
            <TabsTrigger value="payments">Service Payments</TabsTrigger>
            <TabsTrigger value="commissions">Product Commissions</TabsTrigger>
            <TabsTrigger value="affiliate">Affiliate Codes</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <DataErrorBoundary feature="Payments Table" onReset={() => loadData()}>
              <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Payment History</CardTitle>
                      <CardDescription>
                        Track service payments from clients
                      </CardDescription>
                    </div>
                    {filteredPayments.length > 0 && (
                      <Button
                        onClick={handleExportPayments}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredPayments.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {payments.length === 0
                          ? 'No payments recorded yet'
                          : `No payments in selected time period`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPayments.map(payment => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 border-[2px] border-foreground rounded-lg hover:bg-secondary/5 transition-colors"
                        >
                          <div>
                            <p className="font-semibold">
                              {payment.client?.user?.full_name ||
                                'Walk-in Client'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payment.appointment?.service_type ||
                                'Service Payment'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(payment.created_at),
                                'MMM d, yyyy'
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-green-600">
                              ${parseFloat(payment.amount).toFixed(2)}
                            </p>
                            <Badge variant="outline">
                              {payment.payment_method}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </DataErrorBoundary>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <DataErrorBoundary feature="Commissions Table" onReset={() => loadData()}>
              <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Commission Earnings</CardTitle>
                      <CardDescription>
                        Track product affiliate commissions
                      </CardDescription>
                    </div>
                    {filteredCommissions.length > 0 && (
                      <Button
                        onClick={handleExportCommissions}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredCommissions.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {commissions.length === 0
                          ? 'No commissions recorded yet'
                          : `No commissions in selected time period`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredCommissions.map(commission => (
                        <div
                          key={commission.id}
                          className="flex items-center justify-between p-4 border-[2px] border-foreground rounded-lg hover:bg-secondary/5 transition-colors"
                        >
                          <div>
                            <p className="font-semibold">
                              {commission.product_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {commission.brand?.name || 'Unknown Brand'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(commission.created_at),
                                'MMM d, yyyy'
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-purple-600">
                              $
                              {parseFloat(commission.commission_amount).toFixed(
                                2
                              )}
                            </p>
                            <Badge
                              variant={
                                commission.status === 'paid'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {commission.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </DataErrorBoundary>
          </TabsContent>

          {/* Affiliate Codes Tab */}
          <TabsContent value="affiliate">
            <div className="grid md:grid-cols-2 gap-6">
              {brands.map(brand => {
                const affiliateCode = affiliateCodes.find(
                  c => c.brand_id === brand.id
                );
                const commissionRate =
                  affiliateCode?.custom_commission_rate ||
                  brand.base_commission_rate;

                return (
                  <Card
                    key={brand.id}
                    className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{brand.name}</CardTitle>
                          <CardDescription>
                            Commission: {(commissionRate * 100).toFixed(0)}%
                          </CardDescription>
                        </div>
                        {brand.affiliate_program_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(brand.affiliate_program_url, '_blank')
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {affiliateCode ? (
                        <div className="space-y-3">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <Label className="text-xs text-muted-foreground">
                              Your Code
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="flex-1 text-lg font-bold text-primary">
                                {affiliateCode.referral_code}
                              </code>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  copyToClipboard(affiliateCode.referral_code)
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            Generate your affiliate code
                          </p>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Generate Code
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Finance;
