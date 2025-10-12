import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Users, Calendar, DollarSign, Share2, 
  Eye, MousePointer, UserPlus, BarChart3, Clock 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const GrowthAnalytics = () => {
  const { session } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Fetch stylist profile
  const { data: stylistProfile } = useQuery({
    queryKey: ['stylist-profile', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Fetch appointments data for analytics
  const { data: appointmentsData } = useQuery({
    queryKey: ['analytics-appointments', stylistProfile?.id, timeRange],
    queryFn: async () => {
      if (!stylistProfile?.id) return null;

      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('stylist_id', stylistProfile.id)
        .gte('created_at', startDate.toISOString());
      
      return data || [];
    },
    enabled: !!stylistProfile?.id,
  });

  // Fetch referral data
  const { data: referralData } = useQuery({
    queryKey: ['analytics-referrals', stylistProfile?.id],
    queryFn: async () => {
      if (!stylistProfile?.id) return null;

      const { data } = await supabase
        .from('stylist_referrals')
        .select('*')
        .eq('stylist_id', stylistProfile.id)
        .single();
      
      return data;
    },
    enabled: !!stylistProfile?.id,
  });

  // Calculate analytics metrics
  const totalBookings = appointmentsData?.length || 0;
  const confirmedBookings = appointmentsData?.filter(a => a.status === 'confirmed').length || 0;
  const completedBookings = appointmentsData?.filter(a => a.status === 'completed').length || 0;
  const conversionRate = totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : "0";
  const successfulReferrals = referralData?.successful_referrals || 0;

  // Mock data for booking page views (would be tracked via analytics in production)
  const bookingPageViews = 247;
  const uniqueVisitors = 189;
  const avgTimeOnPage = "2:34";

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      change: "+12%",
      trend: "up",
      icon: Calendar,
      description: `${timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Last 90 days"}`,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp,
      description: "Bookings to confirmations",
    },
    {
      title: "New Clients",
      value: confirmedBookings.toString(),
      change: "+8",
      trend: "up",
      icon: UserPlus,
      description: "New client bookings",
    },
    {
      title: "Referrals",
      value: successfulReferrals.toString(),
      change: "+3",
      trend: "up",
      icon: Share2,
      description: "Successful referrals",
    },
  ];

  const bookingPageStats = [
    {
      title: "Page Views",
      value: bookingPageViews.toString(),
      icon: Eye,
      description: `${timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Last 90 days"}`,
    },
    {
      title: "Unique Visitors",
      value: uniqueVisitors.toString(),
      icon: Users,
      description: "Individual visitors",
    },
    {
      title: "Avg. Time on Page",
      value: avgTimeOnPage,
      icon: Clock,
      description: "Minutes:seconds",
    },
    {
      title: "Click Rate",
      value: "18.5%",
      icon: MousePointer,
      description: "Visitors who booked",
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Growth Analytics"
            icon={<BarChart3 className="h-8 w-8" />}
          />
          <div className="flex gap-2">
            <Button
              variant={timeRange === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("7d")}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("30d")}
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === "90d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("90d")}
            >
              90 Days
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="booking">Booking Page</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription>{stat.title}</CardDescription>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                      <div className={`text-xs mt-2 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} from previous period
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>
                  Track your booking performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Booking trend chart would display here</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Services</CardTitle>
                  <CardDescription>Most booked services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentsData?.slice(0, 5).map((appointment, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm">{appointment.service_type}</span>
                        <span className="text-sm font-semibold">{i + 1}</span>
                      </div>
                    ))}
                    {(!appointmentsData || appointmentsData.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No booking data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Status</CardTitle>
                  <CardDescription>Current appointment breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Confirmed</span>
                      <span className="text-sm font-semibold text-green-600">
                        {confirmedBookings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {completedBookings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total</span>
                      <span className="text-sm font-semibold">{totalBookings}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="booking" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bookingPageStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription>{stat.title}</CardDescription>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Direct</span>
                    <span className="text-sm font-semibold">42%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Social Media</span>
                    <span className="text-sm font-semibold">31%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Referrals</span>
                    <span className="text-sm font-semibold">18%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Search</span>
                    <span className="text-sm font-semibold">9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Booking Times</CardTitle>
                <CardDescription>When clients prefer to book</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <p>Peak times chart would display here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Referrals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{successfulReferrals}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Successful referrals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Referral Code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-mono">
                    {referralData?.referral_code || "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your unique code
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Current Tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {referralData?.reward_tier || "None"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reward tier
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Referral Performance</CardTitle>
                <CardDescription>
                  Track the impact of your referrals over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Referral performance chart would display here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sharing Methods</CardTitle>
                <CardDescription>How clients found your referral code</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Direct Share</span>
                    <span className="text-sm font-semibold">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Social Media</span>
                    <span className="text-sm font-semibold">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email</span>
                    <span className="text-sm font-semibold">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GrowthAnalytics;
