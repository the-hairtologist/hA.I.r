import { useEffect } from 'react';
import { OfflineStatusBar } from './OfflineStatusBar';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

export const MobileOptimizationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { isOnline } = useOfflineStatus();

  useEffect(() => {
    // Warm up the cache on app load
    if (isOnline) {
      warmUpCache();
    }
  }, [isOnline]);

  const warmUpCache = async () => {
    // Prefetch critical data
    try {
      console.log('🔥 Warming up cache...');
      
      // This triggers cache population for these endpoints
      await Promise.allSettled([
        fetch('/api/client_profiles?limit=50'),
        fetch('/api/appointments?limit=100'),
        fetch('/api/formulas?limit=50')
      ]);
      
      console.log('✅ Cache warmed successfully');
    } catch (error) {
      console.warn('Cache warming failed:', error);
    }
  };

  return (
    <>
      <OfflineStatusBar />
      {children}
    </>
  );
};
