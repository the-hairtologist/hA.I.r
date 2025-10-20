/**
 * A/B Testing System for Landing Page Optimization
 * Tracks variants and conversion rates to optimize messaging
 */

export type Variant = 'A' | 'B';

interface VariantConfig {
  hero: {
    headline: string;
    subheadline: string;
  };
  cta: {
    primary: string;
    secondary: string;
  };
}

// Variant A: Pain-focused (current)
const VARIANT_A: VariantConfig = {
  hero: {
    headline: "STOP LOSING CLIENTS TO MISSED TEXTS",
    subheadline: "Automated reminders, instant booking, zero chaos—stylists save 10+ hours/week",
  },
  cta: {
    primary: "START FREE TRIAL",
    secondary: "✓ No Credit Card Required • ✓ 14-Day Free Trial • ✓ Cancel Anytime",
  },
};

// Variant B: Aspiration-focused (alternative)
const VARIANT_B: VariantConfig = {
  hero: {
    headline: "BUILD YOUR DREAM SALON IN 10 MINUTES",
    subheadline: "5,000+ stylists ditched spreadsheets and phone tag. Join them today.",
  },
  cta: {
    primary: "TRY IT FREE NOW",
    secondary: "✓ Setup in 10 Minutes • ✓ No Credit Card • ✓ 14-Day Free Trial",
  },
};

export const VARIANTS = { A: VARIANT_A, B: VARIANT_B };

interface ABTestData {
  variant: Variant;
  views: number;
  conversions: number;
  timestamp: number;
}

const AB_TEST_KEY = 'hair_ab_test';
const AB_RESULTS_KEY = 'hair_ab_results';

/**
 * Get or assign user to a variant (50/50 split)
 */
export function getVariant(): Variant {
  // Check if user already has a variant assigned
  const stored = localStorage.getItem(AB_TEST_KEY);
  if (stored === 'A' || stored === 'B') {
    return stored as Variant;
  }

  // Assign new variant randomly (50/50)
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem(AB_TEST_KEY, variant);
  
  // Track view
  trackView(variant);
  
  return variant;
}

/**
 * Get variant configuration
 */
export function getVariantConfig(variant: Variant): VariantConfig {
  return VARIANTS[variant];
}

/**
 * Track a page view for the variant
 */
function trackView(variant: Variant) {
  const results = getResults();
  const data = results[variant] || { variant, views: 0, conversions: 0, timestamp: Date.now() };
  data.views += 1;
  results[variant] = data;
  saveResults(results);
}

/**
 * Track a conversion (signup) for the variant
 */
export function trackConversion() {
  const variant = localStorage.getItem(AB_TEST_KEY) as Variant;
  if (!variant) return;

  const results = getResults();
  const data = results[variant] || { variant, views: 0, conversions: 0, timestamp: Date.now() };
  data.conversions += 1;
  results[variant] = data;
  saveResults(results);

  // Log to console for debugging
  console.log(`[A/B Test] Conversion tracked for Variant ${variant}`, data);
}

/**
 * Get current A/B test results
 */
export function getResults(): Record<Variant, ABTestData> {
  const stored = localStorage.getItem(AB_RESULTS_KEY);
  if (!stored) {
    return {
      A: { variant: 'A', views: 0, conversions: 0, timestamp: Date.now() },
      B: { variant: 'B', views: 0, conversions: 0, timestamp: Date.now() },
    };
  }
  return JSON.parse(stored);
}

/**
 * Save A/B test results
 */
function saveResults(results: Record<Variant, ABTestData>) {
  localStorage.setItem(AB_RESULTS_KEY, JSON.stringify(results));
}

/**
 * Calculate conversion rate
 */
export function getConversionRate(variant: Variant): number {
  const results = getResults();
  const data = results[variant];
  if (!data || data.views === 0) return 0;
  return (data.conversions / data.views) * 100;
}

/**
 * Get winning variant (higher conversion rate)
 */
export function getWinningVariant(): { variant: Variant; confidence: number } | null {
  const results = getResults();
  const rateA = getConversionRate('A');
  const rateB = getConversionRate('B');

  // Need minimum 100 views per variant for statistical significance
  if (results.A.views < 100 || results.B.views < 100) {
    return null;
  }

  const winner = rateA > rateB ? 'A' : 'B';
  const winnerRate = Math.max(rateA, rateB);
  const loserRate = Math.min(rateA, rateB);
  
  // Calculate confidence (simplified)
  const confidence = loserRate > 0 ? ((winnerRate - loserRate) / loserRate) * 100 : 100;

  return { variant: winner, confidence };
}

/**
 * Reset A/B test data
 */
export function resetABTest() {
  localStorage.removeItem(AB_TEST_KEY);
  localStorage.removeItem(AB_RESULTS_KEY);
  console.log('[A/B Test] Data reset');
}
