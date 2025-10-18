/**
 * Performance Dashboard
 * Displays real-time performance metrics for debugging
 * DEV ONLY - Never shows in production or on landing/auth pages
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Zap, X } from 'lucide-react';
import { webVitalsMonitor } from '@/lib/performance/webVitals';
import { customMetrics } from '@/lib/performance/customMetrics';

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState(webVitalsMonitor.getMetrics());
  const [customMeasures, setCustomMeasures] = useState(customMetrics.getMeasures());
  const [isVisible, setIsVisible] = useState(false);

  // CRITICAL: Only show in dev mode, exclude landing/auth pages
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/auth' || currentPath === '/install') {
      return;
    }
    
    // Auto-show after 3 seconds on app pages
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      setMetrics(webVitalsMonitor.getMetrics());
      setCustomMeasures(customMetrics.getMeasures());
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!import.meta.env.DEV || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 z-40 max-w-md">
      <Card className="shadow-lg border-2 border-foreground">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Performance Metrics
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Web Vitals */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
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

          <div className="pt-2 border-t text-xs text-muted-foreground">
            Dev mode only • Updates every 2s
          </div>
        </CardContent>
      </Card>
    </div>
  );
};