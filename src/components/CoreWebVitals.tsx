/**
 * Core Web Vitals Monitoring
 * Tracks LCP, FID, CLS, TTFB, and FCP
 */

import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onTTFB, onFCP, Metric } from 'web-vitals';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

interface VitalsData {
  metric: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
  url: string;
  timestamp: number;
}

/**
 * Get rating for a metric based on Web Vitals thresholds
 */
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    FCP: { good: 1800, poor: 3000 },
  };

  const threshold = thresholds[metric as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Send vitals to analytics
 */
async function sendToAnalytics(data: VitalsData) {
  try {
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: data.metric,
        value: Math.round(data.metric === 'CLS' ? data.value * 1000 : data.value),
        non_interaction: true,
        metric_rating: data.rating,
      });
    }

    // Store in database (optional - consider sampling for production)
    if (Math.random() < 0.1) { // 10% sampling
      await supabase.from('performance_metrics').insert({
        metric_name: data.metric,
        metric_value: data.value,
        metric_rating: data.rating,
        page_url: data.url,
        timestamp: new Date(data.timestamp).toISOString(),
      });
    }

    logger.info(`Core Web Vitals: ${data.metric} = ${data.value}`, 'CoreWebVitals', {
      rating: data.rating,
    });
  } catch (error) {
    // Silently fail - don't break user experience for analytics
    console.error('Failed to send vitals:', error);
  }
}

/**
 * Handle metric reporting
 */
function handleMetric(metric: Metric) {
  const data: VitalsData = {
    metric: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    navigationType: metric.navigationType,
    url: window.location.pathname,
    timestamp: Date.now(),
  };

  sendToAnalytics(data);
}

/**
 * Core Web Vitals Component
 * Auto-initializes when mounted
 */
export const CoreWebVitals = () => {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    try {
      // Register all vitals
      onCLS(handleMetric);
      onINP(handleMetric); // INP replaced FID in web-vitals v3
      onLCP(handleMetric);
      onTTFB(handleMetric);
      onFCP(handleMetric);

      logger.info('Core Web Vitals monitoring initialized', 'CoreWebVitals');
    } catch (error) {
      logger.error('Failed to initialize Core Web Vitals', 'CoreWebVitals', error);
    }
  }, []);

  // This component doesn't render anything
  return null;
};

/**
 * Hook to manually report custom metrics
 */
export function useReportMetric() {
  return (metricName: string, value: number) => {
    const data: VitalsData = {
      metric: metricName,
      value,
      rating: 'good',
      navigationType: 'navigate',
      url: window.location.pathname,
      timestamp: Date.now(),
    };

    sendToAnalytics(data);
  };
}
