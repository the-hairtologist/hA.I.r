import { useState, useEffect } from 'react';
import { getVariant, getVariantConfig, type Variant } from '@/lib/abTesting';

/**
 * Hook to get A/B test variant and config
 */
export function useABTest() {
  const [variant, setVariant] = useState<Variant>('A');
  const [config, setConfig] = useState(getVariantConfig('A'));

  useEffect(() => {
    // Only run A/B test on landing page
    if (window.location.pathname === '/') {
      const assignedVariant = getVariant();
      setVariant(assignedVariant);
      setConfig(getVariantConfig(assignedVariant));
    }
  }, []);

  return { variant, config };
}
