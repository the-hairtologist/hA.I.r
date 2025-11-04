import { lazy, Suspense } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealClientMetrics } from '@/components/analytics/RealClientMetrics';
import { BarChart3, Users, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';

const RealRevenueChart = lazy(() =>
  import('@/components/analytics/RealRevenueChart').then(m => ({
    default: m.RealRevenueChart,
  }))
);
const RealPerformanceMetrics = lazy(() =>
  import('@/components/analytics/RealPerformanceMetrics').then(m => ({
    default: m.RealPerformanceMetrics,
  }))
);

export default function Analytics() {
  return (
    <DashboardLayout>
      <SEOHead
        title="Business Analytics | hA.I.r"
        description="Real-time business intelligence, revenue tracking, and client insights"
      />

      <div className={cn("container mx-auto max-w-7xl", mobileFirst.padding.md)}>
        <div className="mb-6 space-y-2">
          <h1 className={cn(mobileFirst.text['2xl'], "font-pixel break-words")}>
            Business Analytics
          </h1>
          <p className={cn(mobileFirst.text.sm, "font-sans text-muted-foreground break-words")}>
            Real-time insights from your appointments and client data
          </p>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 border-2">
            <TabsTrigger value="revenue" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <Suspense
              fallback={
                <Card className="brutal-border">
                  <CardContent className="flex items-center justify-center h-80">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </CardContent>
                </Card>
              }
            >
              <RealRevenueChart />
            </Suspense>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <RealClientMetrics />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Suspense
              fallback={
                <Card className="brutal-border">
                  <CardContent className="flex items-center justify-center h-80">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </CardContent>
                </Card>
              }
            >
              <RealPerformanceMetrics />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
