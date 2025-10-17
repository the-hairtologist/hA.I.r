/**
 * Performance Report Component
 * Displays real-time performance metrics
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Eye, Clock } from 'lucide-react';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  ttfb: number | null;
}

export const PerformanceReport = () => {
  // CRITICAL: Only show in development builds AND exclude landing/auth pages
  if (!import.meta.env.DEV) return null;

  const currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath === '/auth' || currentPath === '/install') {
    return null;
  }

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    ttfb: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkPerformance = () => {
      if ('PerformanceObserver' in window) {
        // First Contentful Paint
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          setMetrics(prev => ({ ...prev, fcp: Math.round(fcpEntry.startTime) }));
        }

        // Largest Contentful Paint
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          const lcp = lcpEntries[lcpEntries.length - 1].startTime;
          setMetrics(prev => ({ ...prev, lcp: Math.round(lcp) }));
        }

        // Time to First Byte
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navTiming) {
          setMetrics(prev => ({ 
            ...prev, 
            ttfb: Math.round(navTiming.responseStart - navTiming.requestStart) 
          }));
        }
      }
    };

    // Check after page load
    setTimeout(checkPerformance, 2000);
    setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  const getScoreColor = (value: number | null, good: number, poor: number) => {
    if (!value) return 'secondary';
    if (value <= good) return 'default';
    if (value <= poor) return 'outline';
    return 'destructive';
  };

  return (
    <Card className="fixed bottom-6 right-6 p-4 w-80 z-40 shadow-lg border-2 border-foreground lg:bottom-24 lg:right-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Performance Metrics</h3>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Eye className="h-3 w-3" />
            <span>FCP</span>
          </div>
          <Badge variant={getScoreColor(metrics.fcp, 1800, 3000)}>
            {metrics.fcp ? `${metrics.fcp}ms` : 'Loading...'}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>LCP</span>
          </div>
          <Badge variant={getScoreColor(metrics.lcp, 2500, 4000)}>
            {metrics.lcp ? `${metrics.lcp}ms` : 'Loading...'}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>TTFB</span>
          </div>
          <Badge variant={getScoreColor(metrics.ttfb, 600, 1500)}>
            {metrics.ttfb ? `${metrics.ttfb}ms` : 'Loading...'}
          </Badge>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">
        Dev mode only • FCP &lt;1.8s, LCP &lt;2.5s, TTFB &lt;600ms = Good
      </p>
    </Card>
  );
};
