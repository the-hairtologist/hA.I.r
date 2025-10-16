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
    // Prefetch critical data from Supabase
    try {
      // Small delay to ensure env vars are loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔥 Warming up cache...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials not available yet, will retry on next load');
        return;
      }
      
      // This triggers cache population for critical tables
      await Promise.allSettled([
        fetch(`${supabaseUrl}/rest/v1/client_profiles?select=*&limit=50`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/appointments?select=*&limit=100`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/formulas?select=*&limit=50`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/stylist_profiles?select=*&limit=50`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        })
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
