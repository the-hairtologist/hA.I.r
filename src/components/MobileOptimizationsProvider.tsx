import { useEffect } from 'react';
import { OfflineStatusBar } from './OfflineStatusBar';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { logger } from '@/lib/logger';
import { initMobileOptimizations } from '@/lib/mobileOptimizations';
import { Platform } from '@/platform/detector';

export const MobileOptimizationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { isOnline } = useOfflineStatus();

  useEffect(() => {
    // Apply immediate mobile optimizations
    const applyMobileOptimizations = () => {
      // Viewport height fix
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Add safe area support class
      if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
        document.documentElement.classList.add('has-safe-area');
      }
      
      // Enable touch optimization
      document.body.style.touchAction = 'manipulation';
      
      // Initialize full mobile optimization suite on mobile devices
      if (Platform.isMobile) {
        initMobileOptimizations();
        logger.info(`Mobile optimizations activated for ${Platform.platform}`);
      }
    };

    applyMobileOptimizations();
    
    // Re-apply on resize and orientation change
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    // Warm up the cache on app load
    if (isOnline) {
      warmUpCache();
    }
  }, [isOnline]);

  const warmUpCache = async () => {
    // Prefetch critical data - non-blocking
    try {
      // Delay cache warmup to avoid blocking initial render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.info('Warming up cache...');
      
      // Use service worker cache API if available for faster warmup
      if ('caches' in window) {
        const cache = await caches.open('app-cache-v1');
        const cachedUrls = await cache.keys();
        
        if (cachedUrls.length > 0) {
          logger.info(`Cache already warmed with ${cachedUrls.length} entries`);
          return;
        }
      }
      
      // Fallback: prefetch critical resources
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Continue even if credentials aren't available - cache static assets
      if (supabaseUrl && supabaseKey) {
        const tables = ['client_profiles', 'appointments', 'formulas', 'stylist_profiles'];
        await Promise.allSettled(
          tables.map(table => 
            fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=20`, {
              headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
            }).catch(() => null) // Fail silently for individual requests
          )
        );
      }
      
      logger.info('Cache warmed successfully');
    } catch (error) {
      // Cache warming is non-critical, don't block the app
      console.warn('Cache warming failed (non-critical):', error);
    }
  };

  return (
    <>
      <OfflineStatusBar />
      {children}
    </>
  );
};
