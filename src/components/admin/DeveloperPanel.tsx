/**
 * Developer Panel Component
 * Hidden panel for power users showing performance metrics and debug info
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Activity, Database, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  pageLoadTime: number;
  apiCallCount: number;
  cacheHitRate: number;
  lastUpdated: Date;
}

export const DeveloperPanel = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiCallCount: 0,
    cacheHitRate: 0,
    lastUpdated: new Date(),
  });
  const [recentQueries, setRecentQueries] = useState<any[]>([]);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    // Calculate page load time
    const pageLoadTime = performance.now();

    // Get API call count from performance entries
    const apiCalls = performance
      .getEntriesByType('resource')
      .filter(entry => entry.name.includes('supabase')).length;

    setMetrics({
      pageLoadTime: Math.round(pageLoadTime),
      apiCallCount: apiCalls,
      cacheHitRate: Math.random() * 100, // Mock - replace with real cache metrics
      lastUpdated: new Date(),
    });

    // Load recent queries (limit to last 5 for dev mode)
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentQueries(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  return (
    <Card className="brutal-border brutal-shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          Developer Panel
          <Badge variant="outline" className="ml-auto">
            BETA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics" className="gap-1">
              <Activity className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="queries" className="gap-1">
              <Database className="h-4 w-4" />
              Queries
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-1">
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="brutal-border">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    {metrics.pageLoadTime}ms
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Page Load Time
                  </div>
                </CardContent>
              </Card>

              <Card className="brutal-border">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    {metrics.apiCallCount}
                  </div>
                  <div className="text-xs text-muted-foreground">API Calls</div>
                </CardContent>
              </Card>

              <Card className="brutal-border">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    {metrics.cacheHitRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cache Hit Rate
                  </div>
                </CardContent>
              </Card>

              <Card className="brutal-border">
                <CardContent className="pt-6">
                  <div className="text-xs font-mono text-muted-foreground">
                    {metrics.lastUpdated.toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last Updated
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="queries" className="space-y-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {recentQueries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No recent queries found
                  </p>
                ) : (
                  recentQueries.map((query, index) => (
                    <Card key={index} className="brutal-border">
                      <CardContent className="p-3">
                        <div className="font-mono text-xs text-muted-foreground break-all">
                          {query.action || 'Query'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(query.created_at).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="text-sm">Memory Usage</span>
                <Badge variant="secondary">
                  {(performance as any).memory?.usedJSHeapSize
                    ? `${((performance as any).memory.usedJSHeapSize / 1048576).toFixed(1)} MB`
                    : 'N/A'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="text-sm">Navigation Timing</span>
                <Badge variant="secondary">
                  {performance.timing
                    ? `${performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart}ms`
                    : 'N/A'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="text-sm">Resource Count</span>
                <Badge variant="secondary">
                  {performance.getEntriesByType('resource').length}
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
