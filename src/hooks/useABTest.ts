import { useState, useEffect } from 'react';
import { getVariant, getVariantConfig, type Variant } from '@/lib/abTestingSupabase';
import { logger } from '@/lib/productionLogger';

/**
 * Hook to get A/B test variant and config
 */
export function useABTest() {
  const [variant, setVariant] = useState<Variant>('A');
  const [config, setConfig] = useState(getVariantConfig('A'));

  useEffect(() => {
    const pathname = window.location.pathname;
    logger.info(`[useABTest] Hook mounted, pathname: ${pathname}`, { context: 'A/B Testing' });
    logger.info(`[useABTest] Initial state - variant: ${variant}`, { 
      context: 'A/B Testing',
      data: { config: config.hero.headline }
    });

    // Only run A/B test on landing page
    if (pathname === '/') {
      const startTime = Date.now();
      logger.info('[useABTest] Loading variant...', { context: 'A/B Testing' });
      
      const loadVariant = async () => {
        try {
          const assignedVariant = await getVariant();
          const loadTime = Date.now() - startTime;
          
          if (loadTime > 2000) {
            logger.warn(`[useABTest] Variant load took ${loadTime}ms (>2s)`, { 
              context: 'A/B Testing',
              data: { loadTime, variant: assignedVariant }
            });
          } else {
            logger.info(`[useABTest] Variant loaded successfully in ${loadTime}ms`, {
              context: 'A/B Testing',
              data: { variant: assignedVariant, loadTime }
            });
          }
          
          setVariant(assignedVariant);
          const newConfig = getVariantConfig(assignedVariant);
          setConfig(newConfig);
          
          logger.info(`[useABTest] State updated - variant: ${assignedVariant}`, {
            context: 'A/B Testing',
            data: { headline: newConfig.hero.headline }
          });
        } catch (error) {
          logger.error('[useABTest] ERROR loading variant', error, { context: 'A/B Testing' });
          logger.info('[useABTest] Falling back to variant A', { context: 'A/B Testing' });
        }
      };
      
      loadVariant();
    } else {
      logger.info(`[useABTest] Not on landing page, using default variant A`, { context: 'A/B Testing' });
    }
  }, []);

  return { variant, config };
}
