import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { MetaTags } from '@/components/MetaTags';

const mockMetrics = {
  revenue: { current: 12450, previous: 10200, change: 22 },
  clients: { current: 127, previous: 115, change: 10 },
  avgBooking: { current: 98, previous: 89, change: 10 },
  retention: { current: 85, previous: 78, change: 9 }
};

export default function Analytics() {
  return (
    <>
      <MetaTags 
        title="Analytics & Insights"
        description="Track your business performance and growth"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Business Analytics</h1>
            <p className="text-muted-foreground">Track your performance and growth</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockMetrics.revenue.current.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{mockMetrics.revenue.change}%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Active Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockMetrics.clients.current}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{mockMetrics.clients.change}%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Avg Booking Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockMetrics.avgBooking.current}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{mockMetrics.avgBooking.change}%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Retention Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockMetrics.retention.current}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{mockMetrics.retention.change}%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue over the past year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Revenue chart would display here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Client Lifetime Value</CardTitle>
                  <CardDescription>Average value per client over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Client LTV chart would display here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Performance</CardTitle>
                  <CardDescription>ROI by feature</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Performance metrics would display here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
