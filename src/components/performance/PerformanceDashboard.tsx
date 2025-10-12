/**
 * Performance Dashboard
 * Displays real-time performance metrics for debugging
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap } from 'lucide-react';
import { webVitalsMonitor } from '@/lib/performance/webVitals';
import { customMetrics } from '@/lib/performance/customMetrics';

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState(webVitalsMonitor.getMetrics());
  const [customMeasures, setCustomMeasures] = useState(customMetrics.getMeasures());

  useEffect(() => {
    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      setMetrics(webVitalsMonitor.getMetrics());
      setCustomMeasures(customMetrics.getMeasures());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Web Vitals */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Core Web Vitals
            </h4>
            <div className="space-y-2">
              {metrics.map(metric => (
                <div key={metric.name} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{Math.round(metric.value)}ms</span>
                    <Badge className={getRatingColor(metric.rating)} variant="secondary">
                      {metric.rating}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Measures */}
          {customMeasures.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Operations</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {customMeasures.slice(-5).reverse().map((measure, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="truncate">{measure.name}</span>
                    <span className="font-mono">{Math.round(measure.duration)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
