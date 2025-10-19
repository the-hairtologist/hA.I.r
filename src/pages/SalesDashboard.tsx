import { DashboardLayout } from "@/components/DashboardLayout";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Calendar, BarChart3, TrendingDown } from "lucide-react";
import { RevenueChart } from "@/components/sales/RevenueChart";
import { ServicePopularity } from "@/components/sales/ServicePopularity";
import { StylistPerformance } from "@/components/sales/StylistPerformance";
import { RevenueForecast } from "@/components/sales/RevenueForecast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SalesDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, isStylist } = useUserRole(user?.id);

  if (!isAdmin && !isStylist) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-12 text-center">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground">
            Sales Dashboard is only available for stylists and admins.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead 
        title="Sales Performance | hA.I.r"
        description="Real-time revenue analytics, forecasting, and performance metrics"
      />
      
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-pixel mb-2">
            Sales Performance
          </h1>
          <p className="font-sans text-muted-foreground text-sm sm:text-base lg:text-lg">
            Real-time revenue analytics and business insights
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="brutal-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-success mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +0% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="brutal-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-success mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +0% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="brutal-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Calendar className="inline h-3 w-3 mr-1" />
                0 bookings
              </p>
            </CardContent>
          </Card>

          <Card className="brutal-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">$0</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Next 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 border-2">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="forecast" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Forecast</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <RevenueChart />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServicePopularity />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <StylistPerformance />
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <RevenueForecast />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SalesDashboard;
