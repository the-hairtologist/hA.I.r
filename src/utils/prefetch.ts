import { supabase } from '@/integrations/supabase/client';

interface PrefetchCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

class PrefetchManager {
  private cache: PrefetchCache = {};
  private maxAge = 5 * 60 * 1000; // 5 minutes
  private maxEntries = 50;

  async prefetch(key: string, fetcher: () => Promise<any>) {
    // Check cache first
    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.data;
    }

    // Fetch and cache
    try {
      const data = await fetcher();
      this.set(key, data);
      return data;
    } catch (error) {
      console.error('Prefetch error:', error);
      return null;
    }
  }

  set(key: string, data: any) {
    // Evict oldest if cache is full
    if (Object.keys(this.cache).length >= this.maxEntries) {
      const oldest = Object.entries(this.cache).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      )[0];
      if (oldest) {
        delete this.cache[oldest[0]];
      }
    }

    this.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  }

  get(key: string) {
    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.data;
    }
    return null;
  }

  clear() {
    this.cache = {};
  }
}

export const prefetchManager = new PrefetchManager();

// Prefetch appointments for a stylist
export const prefetchAppointments = (stylistId: string) => {
  return prefetchManager.prefetch(`appointments-${stylistId}`, async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('stylist_id', stylistId)
      .order('appointment_date', { ascending: true });
    return data;
  });
};

// Prefetch clients for a stylist
export const prefetchClients = (stylistId: string) => {
  return prefetchManager.prefetch(`clients-${stylistId}`, async () => {
    const { data } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('preferred_stylist_id', stylistId);
    return data;
  });
};

// Prefetch formulas for a stylist
export const prefetchFormulas = (stylistId: string) => {
  return prefetchManager.prefetch(`formulas-${stylistId}`, async () => {
    const { data } = await supabase
      .from('formulas')
      .select('*')
      .eq('stylist_id', stylistId);
    return data;
  });
};
