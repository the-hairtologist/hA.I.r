/**
 * UTM Parameter Tracking for Ad Campaigns
 * Captures and stores campaign tracking parameters
 */

export interface UTMParams {
  utm_source?: string;      // google, facebook, tiktok
  utm_medium?: string;       // cpc, paid_social, email
  utm_campaign?: string;     // beta_launch_stylists
  utm_content?: string;      // ad1, ad2, carousel
  utm_term?: string;         // salon+management
}

/**
 * Parse UTM parameters from URL
 */
export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    utm_term: params.get('utm_term') || undefined,
  };
}

/**
 * Store UTM parameters in session storage
 * This preserves campaign data across page navigation
 */
export function storeUTMParams(params: UTMParams): void {
  if (typeof window === 'undefined') return;
  
  // Only store if at least one UTM parameter exists
  if (Object.values(params).some(v => v !== undefined)) {
    sessionStorage.setItem('utm_params', JSON.stringify(params));
    
    // Also store first touch (never overwrite)
    const firstTouch = sessionStorage.getItem('utm_first_touch');
    if (!firstTouch) {
      sessionStorage.setItem('utm_first_touch', JSON.stringify({
        ...params,
        timestamp: new Date().toISOString(),
      }));
    }
  }
}

/**
 * Get stored UTM parameters
 */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};
  
  const stored = sessionStorage.getItem('utm_params');
  return stored ? JSON.parse(stored) : {};
}

/**
 * Get first-touch UTM parameters
 * Useful for attribution (which ad originally brought the user)
 */
export function getFirstTouchUTM(): UTMParams & { timestamp?: string } {
  if (typeof window === 'undefined') return {};
  
  const stored = sessionStorage.getItem('utm_first_touch');
  return stored ? JSON.parse(stored) : {};
}

/**
 * Clear UTM parameters (e.g., after conversion)
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem('utm_params');
  // Keep first touch for attribution
}

/**
 * Build URL with UTM parameters
 */
export function buildUTMUrl(
  baseUrl: string, 
  params: UTMParams
): string {
  const url = new URL(baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
}

/**
 * Track campaign conversion with UTM data
 * Automatically includes UTM params with conversion events
 */
export function getConversionData(): Record<string, any> {
  const utmParams = getStoredUTMParams();
  const firstTouch = getFirstTouchUTM();
  
  return {
    ...utmParams,
    referrer: document.referrer || undefined,
    landing_page: window.location.pathname,
    timestamp: new Date().toISOString(),
    // Include first touch attribution
    first_touch_source: firstTouch.utm_source,
    first_touch_campaign: firstTouch.utm_campaign,
  };
}

/**
 * Initialize UTM tracking on app load
 */
export function initUTMTracking(): void {
  // Parse and store UTM params from URL
  const params = getUTMParams();
  storeUTMParams(params);
  
  // Log for debugging (remove in production)
  if (import.meta.env.DEV && Object.keys(params).length > 0) {
    console.log('[UTM Tracking]', params);
  }
}

/**
 * Get campaign source for analytics
 * Returns user-friendly campaign name
 */
export function getCampaignSource(): string {
  const params = getStoredUTMParams();
  
  if (!params.utm_source) return 'direct';
  
  const source = params.utm_source.toLowerCase();
  const medium = params.utm_medium?.toLowerCase();
  
  // Create descriptive source string
  if (medium === 'cpc' && source === 'google') {
    return 'Google Ads';
  } else if (medium === 'paid_social' && source === 'facebook') {
    return 'Facebook Ads';
  } else if (medium === 'paid_social' && source === 'instagram') {
    return 'Instagram Ads';
  } else if (medium === 'paid_social' && source === 'tiktok') {
    return 'TikTok Ads';
  } else if (medium === 'email') {
    return 'Email Campaign';
  } else if (medium === 'referral') {
    return 'Referral';
  }
  
  return params.utm_source;
}

/**
 * Example Usage in Analytics:
 * 
 * // Initialize on app load (App.tsx)
 * useEffect(() => {
 *   initUTMTracking();
 * }, []);
 * 
 * // Track signup with campaign data
 * const handleSignup = async () => {
 *   await signup();
 *   analytics.signup('email', 'stylist', getConversionData());
 * };
 * 
 * // Track paid conversion
 * const handlePurchase = async () => {
 *   await purchase();
 *   analytics.purchaseCompleted('pro', 29.99, getConversionData());
 * };
 */
