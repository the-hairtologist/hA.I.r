/**
 * URL Validation Security Utilities
 * Prevents open redirect and malicious URL attacks
 */

import { safeConsole } from '@/lib/safeLogger';

/**
 * Allowed domains for external redirects
 */
const ALLOWED_REDIRECT_DOMAINS = [
  'checkout.stripe.com',
  'billing.stripe.com',
  'lovable.app',
  'lovable.dev',
] as const;

/**
 * Validates if a URL is safe for redirection
 * @param url - The URL to validate
 * @param allowedDomains - Optional array of additional allowed domains
 * @returns true if URL is safe, false otherwise
 */
export const isSafeRedirectUrl = (
  url: string,
  allowedDomains: string[] = []
): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Only allow https protocol (except localhost for dev)
    if (urlObj.protocol !== 'https:' && !urlObj.hostname.includes('localhost')) {
      safeConsole.warn('[Security] Rejected non-HTTPS URL:', url);
      return false;
    }
    
    // Check against allowed domains
    const allAllowedDomains = [...ALLOWED_REDIRECT_DOMAINS, ...allowedDomains];
    const isAllowed = allAllowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      safeConsole.warn('[Security] Rejected URL from untrusted domain:', urlObj.hostname);
      return false;
    }
    
    return true;
  } catch (error) {
    safeConsole.error('[Security] Invalid URL format:', url);
    return false;
  }
};

/**
 * Safely redirect to an external URL after validation
 * @param url - The URL to redirect to
 * @param allowedDomains - Optional additional allowed domains
 * @throws Error if URL is invalid or untrusted
 */
export const safeRedirect = (
  url: string,
  allowedDomains: string[] = []
): void => {
  if (isSafeRedirectUrl(url, allowedDomains)) {
    window.location.href = url;
  } else {
    throw new Error('Attempted redirect to untrusted URL blocked for security');
  }
};

/**
 * Validates Google Analytics Measurement ID format
 * @param measurementId - GA4 measurement ID to validate
 * @returns true if format is valid
 */
export const isValidGA4MeasurementId = (measurementId: string): boolean => {
  const GA4_REGEX = /^G-[A-Z0-9]{10}$/;
  return GA4_REGEX.test(measurementId);
};

/**
 * Validates external links before rendering
 * @param href - The href attribute value
 * @returns true if link is safe
 */
export const isSafeExternalLink = (href: string): boolean => {
  try {
    const url = new URL(href);
    
    // Block javascript: and data: protocols
    if (['javascript:', 'data:', 'vbscript:'].includes(url.protocol)) {
      return false;
    }
    
    // Only allow http and https
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    // Relative URLs are safe
    return !href.includes(':');
  }
};
