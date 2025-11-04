import { lazy, Suspense } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealClientMetrics } from '@/components/analytics/RealClientMetrics';
import { BarChart3, Users, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';
import { DataErrorBoundary } from '@/components/errors/DataErrorBoundary';
import { ScreenReaderOnly } from '@/components/accessibility/ScreenReaderOnly';

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
          <h1 id="page-title" className={cn(mobileFirst.text['2xl'], "font-pixel break-words")}>
            Business Analytics
          </h1>
          <p className={cn(mobileFirst.text.sm, "font-sans text-muted-foreground break-words")}>
            Real-time insights from your appointments and client data
          </p>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 border-2" role="tablist" aria-label="Analytics categories">
            <TabsTrigger value="revenue" className="gap-2" role="tab" aria-controls="revenue-panel">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Revenue</span>
              <ScreenReaderOnly>Revenue analytics</ScreenReaderOnly>
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2" role="tab" aria-controls="clients-panel">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Clients</span>
              <ScreenReaderOnly>Client analytics</ScreenReaderOnly>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2" role="tab" aria-controls="performance-panel">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Performance</span>
              <ScreenReaderOnly>Performance analytics</ScreenReaderOnly>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6" role="tabpanel" id="revenue-panel" aria-labelledby="revenue-tab">
            <DataErrorBoundary feature="Revenue Analytics">
              <Suspense
                fallback={
                  <Card className="brutal-border">
                    <CardContent className="flex items-center justify-center h-80">
                      <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
                      <ScreenReaderOnly>Loading revenue chart</ScreenReaderOnly>
                    </CardContent>
                  </Card>
                }
              >
                <RealRevenueChart />
              </Suspense>
            </DataErrorBoundary>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6" role="tabpanel" id="clients-panel" aria-labelledby="clients-tab">
            <DataErrorBoundary feature="Client Metrics">
              <RealClientMetrics />
            </DataErrorBoundary>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6" role="tabpanel" id="performance-panel" aria-labelledby="performance-tab">
            <DataErrorBoundary feature="Performance Metrics">
              <Suspense
                fallback={
                  <Card className="brutal-border">
                    <CardContent className="flex items-center justify-center h-80">
                      <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
                      <ScreenReaderOnly>Loading performance metrics</ScreenReaderOnly>
                    </CardContent>
                  </Card>
                }
              >
                <RealPerformanceMetrics />
              </Suspense>
            </DataErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
