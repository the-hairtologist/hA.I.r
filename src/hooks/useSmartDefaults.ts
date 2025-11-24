import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logging/productionLogger';

interface SmartDefaults {
  defaultDuration?: number;
  defaultPrice?: number;
  recentClients?: string[];
  recentServices?: string[];
  preferredStartTime?: string;
}

export const useSmartDefaults = () => {
  const { user } = useAuth();
  const [defaults, setDefaults] = useState<SmartDefaults>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadDefaults();
  }, [user]);

  const loadDefaults = async () => {
    if (!user) return;

    try {
      // Get recent appointments to infer defaults
      const { data: appointments } = await supabase
        .from('appointments')
        .select('client_id')
        .eq('stylist_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent unique clients
      const recentClientIds = [
        ...new Set(appointments?.map(a => a.client_id).filter(Boolean) || []),
      ].slice(0, 5);

      setDefaults({
        defaultDuration: 60, // Default 1 hour
        recentClients: recentClientIds as string[],
        recentServices: [],
        preferredStartTime: '09:00',
      });
    } catch (error) {
      logger.error('Error loading smart defaults', error, { component: 'useSmartDefaults', userId: user?.id });
    } finally {
      setLoading(false);
    }
  };

  return { defaults, loading };
};
