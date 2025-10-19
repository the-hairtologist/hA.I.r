/**
 * Advanced Analytics Dashboard
 * Comprehensive business intelligence and performance tracking
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Users, DollarSign, Calendar, Target, Zap } from "lucide-react";
import { ClientSentimentTracker } from "@/components/ClientSentimentTracker";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { AnalyticsSkeleton } from "@/components/loading/PageSkeleton";

type TimeRange = "7days" | "30days" | "90days" | "1year";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  const [selectedMetric, setSelectedMetric] = useState<string>("revenue");

  const { data: stylistProfile } = useQuery({
    queryKey: ["stylist-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return data;
    },
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", stylistProfile?.id, timeRange],
    queryFn: async () => {
      if (!stylistProfile?.id) return null;

      const daysBack = {
        "7days": 7,
        "30days": 30,
        "90days": 90,
        "1year": 365,
      }[timeRange];

      const startDate = startOfDay(subDays(new Date(), daysBack));
      const endDate = endOfDay(new Date());

      // Fetch appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          *,
          service:stylist_services(price),
          payment:payments(amount)
        `)
        .eq("stylist_id", stylistProfile.id)
        .gte("appointment_date", startDate.toISOString())
        .lte("appointment_date", endDate.toISOString());

      // Fetch reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("stylist_id", stylistProfile.id)
        .gte("created_at", startDate.toISOString());

      // Fetch commissions
      const { data: commissions } = await supabase
        .from("commissions")
        .select("commission_amount, status")
        .eq("stylist_id", stylistProfile.id)
        .gte("created_at", startDate.toISOString());

      // Calculate metrics
      const totalRevenue = appointments?.reduce((sum, apt) => {
        const payment = Array.isArray(apt.payment) ? apt.payment[0] : apt.payment;
        return sum + (Number(payment?.amount) || 0);
      }, 0) || 0;

      const totalCommissions = commissions?.reduce(
        (sum, c) => sum + Number(c.commission_amount || 0),
        0
      ) || 0;

      const completedAppts = appointments?.filter((a) => a.status === "completed").length || 0;
      const canceledAppts = appointments?.filter((a) => a.status === "cancelled").length || 0;
      const noShowAppts = appointments?.filter((a) => a.status === "no_show").length || 0;

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      const uniqueClients = new Set(appointments?.map((a) => a.client_id)).size;

      const cancellationRate = appointments && appointments.length > 0
        ? ((canceledAppts + noShowAppts) / appointments.length) * 100
        : 0;

      return {
        totalRevenue,
        totalCommissions,
        totalAppointments: appointments?.length || 0,
        completedAppts,
        canceledAppts,
        noShowAppts,
        uniqueClients,
        averageRating,
        cancellationRate,
        reviewCount: reviews?.length || 0,
      };
    },
    enabled: !!stylistProfile?.id,
  });

  if (!stylistProfile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please complete your stylist profile to view analytics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your business performance
          </p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics?.totalRevenue.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +${analytics?.totalCommissions.toFixed(2) || "0.00"} commissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.completedAppts || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Unique Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.uniqueClients || 0}</div>
                <p className="text-xs text-muted-foreground">Active clientele</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.averageRating.toFixed(1) || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.reviewCount || 0} reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="performance">
                <Target className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="sentiment">
                <Zap className="h-4 w-4 mr-2" />
                Client Sentiment
              </TabsTrigger>
              <TabsTrigger value="trends">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="font-semibold">{analytics?.completedAppts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled</span>
                      <span className="font-semibold text-orange-600">
                        {analytics?.canceledAppts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>No Show</span>
                      <span className="font-semibold text-red-600">
                        {analytics?.noShowAppts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Cancellation Rate</span>
                      <span className="font-semibold">
                        {analytics?.cancellationRate.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Service Revenue</span>
                      <span className="font-semibold">
                        ${analytics?.totalRevenue.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product Commissions</span>
                      <span className="font-semibold text-green-600">
                        ${analytics?.totalCommissions.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Total Earnings</span>
                      <span className="font-semibold">
                        ${((analytics?.totalRevenue || 0) + (analytics?.totalCommissions || 0)).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              <ClientSentimentTracker stylistId={stylistProfile.id} />
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Coming Soon: Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Advanced trend visualization and forecasting will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
