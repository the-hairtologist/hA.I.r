/**
 * Intelligent Route Prefetcher - Phase 2: Intelligence Layer
 * Prefetches next-screen data during idle time for instant navigation
 */

import { supabase } from "@/integrations/supabase/client";

export interface PrefetchConfig {
  route: string;
  tables: string[];
  priority: 'high' | 'medium' | 'low';
  condition?: () => boolean;
}

class RoutePrefetcher {
  private static instance: RoutePrefetcher;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private prefetchQueue: PrefetchConfig[] = [];
  private prefetching = false;
  private cacheLifetime = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.setupIdleListener();
  }

  static getInstance(): RoutePrefetcher {
    if (!RoutePrefetcher.instance) {
      RoutePrefetcher.instance = new RoutePrefetcher();
    }
    return RoutePrefetcher.instance;
  }

  /**
   * Register routes to prefetch
   */
  register(configs: PrefetchConfig[]): void {
    this.prefetchQueue.push(...configs);
    this.sortQueue();
    
    if (import.meta.env.DEV) {
      console.log('🔮 Registered prefetch routes:', configs.map(c => c.route));
    }
  }

  /**
   * Prefetch data for a specific route
   */
  async prefetch(route: string, tables: string[]): Promise<void> {
    // Check if already cached and fresh
    const cached = this.cache.get(route);
    if (cached && Date.now() - cached.timestamp < this.cacheLifetime) {
      return;
    }

    try {
      const results: Record<string, any> = {};

      for (const table of tables) {
        const { data, error } = await (supabase as any)
          .from(table)
          .select('*')
          .limit(20); // Limit prefetch size

        if (!error && data) {
          results[table] = data;
        }
      }

      this.cache.set(route, {
        data: results,
        timestamp: Date.now()
      });

      if (import.meta.env.DEV) {
        console.log(`✅ Prefetched ${route}:`, Object.keys(results));
      }
    } catch (error) {
      console.error(`Failed to prefetch ${route}:`, error);
    }
  }

  /**
   * Get prefetched data for route
   */
  get(route: string): any | null {
    const cached = this.cache.get(route);
    
    if (!cached) return null;
    
    // Check if stale
    if (Date.now() - cached.timestamp > this.cacheLifetime) {
      this.cache.delete(route);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Process prefetch queue during idle time
   */
  private async processPrefetchQueue(): Promise<void> {
    if (this.prefetching || this.prefetchQueue.length === 0) return;
    if (!navigator.onLine) return;

    this.prefetching = true;

    // Process high priority first
    const config = this.prefetchQueue.shift();
    
    if (config) {
      // Check condition
      if (config.condition && !config.condition()) {
        this.prefetching = false;
        return;
      }

      await this.prefetch(config.route, config.tables);
    }

    this.prefetching = false;

    // Schedule next if queue not empty
    if (this.prefetchQueue.length > 0) {
      this.scheduleNextPrefetch();
    }
  }

  /**
   * Sort queue by priority
   */
  private sortQueue(): void {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    this.prefetchQueue.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  /**
   * Setup idle time listener
   */
  private setupIdleListener(): void {
    if ('requestIdleCallback' in window) {
      const scheduleWork = () => {
        (window as any).requestIdleCallback(
          () => {
            this.processPrefetchQueue();
            scheduleWork();
          },
          { timeout: 2000 }
        );
      };
      scheduleWork();
    } else {
      // Fallback for browsers without requestIdleCallback
      setInterval(() => this.processPrefetchQueue(), 5000);
    }
  }

  /**
   * Schedule next prefetch
   */
  private scheduleNextPrefetch(): void {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(
        () => this.processPrefetchQueue(),
        { timeout: 2000 }
      );
    }
  }

  /**
   * Invalidate cache for route
   */
  invalidate(route: string): void {
    this.cache.delete(route);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      cached: this.cache.size,
      queued: this.prefetchQueue.length,
      cacheLifetime: this.cacheLifetime
    };
  }
}

export const routePrefetcher = RoutePrefetcher.getInstance();

/**
 * Initialize default prefetch configuration
 */
export function initRoutePrefetcher(): void {
  const configs: PrefetchConfig[] = [
    {
      route: '/dashboard',
      tables: ['stylist_profiles', 'appointments', 'client_profiles'],
      priority: 'high',
      condition: () => window.location.pathname !== '/dashboard'
    },
    {
      route: '/appointments',
      tables: ['appointments', 'client_profiles'],
      priority: 'high'
    },
    {
      route: '/clients',
      tables: ['client_profiles', 'formulas'],
      priority: 'medium'
    },
    {
      route: '/messages',
      tables: ['messages'],
      priority: 'medium'
    },
    {
      route: '/ai-assistant',
      tables: ['formulas'],
      priority: 'low'
    }
  ];

  routePrefetcher.register(configs);
  
  if (import.meta.env.DEV) {
    (window as any).__prefetchStats = () => console.log(routePrefetcher.getStats());
    console.log('💡 Run __prefetchStats() to see prefetch cache status');
  }
}
