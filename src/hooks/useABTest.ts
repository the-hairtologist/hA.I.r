import { useEffect, useState } from 'react';
import { analytics } from '@/lib/analytics';

export type LandingVariant = 'A' | 'B' | 'C';

const AB_TEST_KEY = 'landing_variant';
const AB_TEST_EXPERIMENT = 'landing_page_2025_q1';

/**
 * A/B Testing Hook for Landing Page Variants
 *
 * Variants:
 * - A (Control): Current design with "Stop Losing Clients" headline
 * - B (Variation 1): Social proof emphasis with "Join 5,000+ Stylists" headline
 * - C (Variation 2): Time-saving focus with "Save 10+ Hours/Week" headline
 */
export const useABTest = () => {
  const [variant, setVariant] = useState<LandingVariant>('A');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user already has a variant assigned
    const storedVariant = localStorage.getItem(
      AB_TEST_KEY
    ) as LandingVariant | null;

    if (storedVariant && ['A', 'B', 'C'].includes(storedVariant)) {
      setVariant(storedVariant);
      setIsLoading(false);
      return;
    }

    // Randomly assign a variant (33.33% split)
    const randomVariant: LandingVariant = ['A', 'B', 'C'][
      Math.floor(Math.random() * 3)
    ] as LandingVariant;

    // Store the variant
    localStorage.setItem(AB_TEST_KEY, randomVariant);
    setVariant(randomVariant);

    // Track variant assignment
    analytics.track('ab_test_assigned', {
      experiment: AB_TEST_EXPERIMENT,
      variant: randomVariant,
      timestamp: new Date().toISOString(),
    });

    setIsLoading(false);
  }, []);

  // Track conversion events
  const trackConversion = (eventName: string) => {
    analytics.track('ab_test_conversion', {
      experiment: AB_TEST_EXPERIMENT,
      variant,
      event: eventName,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    variant,
    isLoading,
    trackConversion,
  };
};
