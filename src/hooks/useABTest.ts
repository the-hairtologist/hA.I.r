import { useState, useEffect } from 'react';
import { getVariant, getVariantConfig, type Variant } from '@/lib/abTestingSupabase';

/**
 * Hook to get A/B test variant and config
 */
export function useABTest() {
  const [variant, setVariant] = useState<Variant>('A');
  const [config, setConfig] = useState(getVariantConfig('A'));

  useEffect(() => {
    // Only run A/B test on landing page
    if (window.location.pathname === '/') {
      const loadVariant = async () => {
        const assignedVariant = await getVariant();
        setVariant(assignedVariant);
        setConfig(getVariantConfig(assignedVariant));
      };
      loadVariant();
    }
  }, []);

  return { variant, config };
}
