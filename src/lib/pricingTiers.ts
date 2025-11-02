/**
 * Pricing Tiers Configuration
 * Defines subscription plans and feature access
 */

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  priceAnnual: number;
  stripePriceId?: string;
  stripePriceIdAnnual?: string;
  features: string[];
  limits: {
    clients: number; // -1 = unlimited
    appointments: number;
    formulas: number;
    sms: number;
    teamMembers?: number;
  };
  popular?: boolean;
  badge?: string;
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  free: {
    id: 'free',
    name: 'Starter',
    description: 'Perfect for getting started',
    price: 0,
    priceAnnual: 0,
    features: [
      'Up to 5 clients',
      '10 appointments per month',
      'Basic formula storage',
      'Email support',
      'Portfolio showcase (3 photos)',
    ],
    limits: {
      clients: 5,
      appointments: 10,
      formulas: 10,
      sms: 0,
    },
  },

  pro: {
    id: 'pro',
    name: 'Professional',
    description: 'For growing stylists',
    price: 29,
    priceAnnual: 290, // ~$24/mo (2 months free)
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    stripePriceIdAnnual: 'price_pro_annual',
    features: [
      'Unlimited clients',
      'Unlimited appointments',
      'AI formula generator',
      'SMS notifications (50/month)',
      'Unlimited portfolio photos',
      'Client discovery placement',
      'Advanced scheduling',
      'Product commission tracking',
      'Priority support',
    ],
    limits: {
      clients: -1,
      appointments: -1,
      formulas: -1,
      sms: 50,
    },
    popular: true,
    badge: 'MOST POPULAR',
  },

  enterprise: {
    id: 'enterprise',
    name: 'Salon Pro',
    description: 'For salons and teams',
    price: 79,
    priceAnnual: 790, // ~$66/mo (2 months free)
    stripePriceId: 'price_enterprise_monthly',
    stripePriceIdAnnual: 'price_enterprise_annual',
    features: [
      'Everything in Professional',
      'Multi-stylist management (up to 10)',
      'Team scheduling & coordination',
      'Advanced analytics dashboard',
      'SMS notifications (200/month)',
      'White-label branding',
      'Custom domain support',
      'Dedicated account manager',
      'API access',
      'Priority 24/7 support',
    ],
    limits: {
      clients: -1,
      appointments: -1,
      formulas: -1,
      sms: 200,
      teamMembers: 10,
    },
    badge: 'BEST VALUE',
  },
};

/**
 * Add-on products that can be purchased separately
 */
export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId?: string;
  credits?: number;
  durationDays?: number;
}

export const ADD_ONS: Record<string, AddOn> = {
  extra_sms_pack: {
    id: 'extra_sms_pack',
    name: 'Extra SMS Pack',
    description: '100 additional SMS notification credits',
    price: 9.99,
    stripePriceId: 'price_sms_pack',
    credits: 100,
  },

  featured_listing: {
    id: 'featured_listing',
    name: 'Featured Listing',
    description: '3x visibility in stylist discovery for 30 days',
    price: 19.99,
    stripePriceId: 'price_featured_listing',
    durationDays: 30,
  },

  premium_portfolio: {
    id: 'premium_portfolio',
    name: 'Premium Portfolio',
    description: 'Verified badge + priority placement for 30 days',
    price: 14.99,
    stripePriceId: 'price_premium_portfolio',
    durationDays: 30,
  },

  client_boost: {
    id: 'client_boost',
    name: 'Client Boost',
    description: 'Promote your profile to 1000+ local clients',
    price: 29.99,
    stripePriceId: 'price_client_boost',
    durationDays: 7,
  },
};

/**
 * Check if a feature is allowed for a given tier
 */
export const isFeatureAllowed = (tier: string, feature: string): boolean => {
  if (tier === 'free') {
    const freeFeatures = ['profile', 'portfolio_basic', 'messages_basic'];
    return freeFeatures.includes(feature);
  }

  if (tier === 'pro' || tier === 'enterprise') {
    return true; // Pro and Enterprise have access to all features
  }

  return false;
};

/**
 * Check if a limit has been reached
 */
export const hasReachedLimit = (
  tier: string,
  limitType: keyof PricingTier['limits'],
  currentCount: number
): boolean => {
  const tierConfig = PRICING_TIERS[tier];
  if (!tierConfig) return true;

  const limit = tierConfig.limits[limitType];
  if (limit === -1) return false; // Unlimited
  if (limit === undefined) return false; // No limit defined

  return currentCount >= limit;
};

/**
 * Get discount percentage for annual billing
 */
export const getAnnualDiscount = (tier: string): number => {
  const tierConfig = PRICING_TIERS[tier];
  if (!tierConfig || tierConfig.price === 0) return 0;

  const monthlyTotal = tierConfig.price * 12;
  const savings = monthlyTotal - tierConfig.priceAnnual;
  return Math.round((savings / monthlyTotal) * 100);
};
