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
    // Prefetch critical data - non-blocking
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔥 Warming up cache...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Credentials not available, skipping cache warmup');
        return;
      }
      
      // Prefetch critical tables in background
      const tables = ['client_profiles', 'appointments', 'formulas', 'stylist_profiles'];
      await Promise.allSettled(
        tables.map(table => 
          fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=50`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
          })
        )
      );
      
      console.log('✅ Cache warmed successfully');
    } catch (error) {
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
