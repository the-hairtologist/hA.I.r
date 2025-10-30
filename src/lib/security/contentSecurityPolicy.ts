/**
 * Content Security Policy Configuration
 * Prevents XSS and other injection attacks
 */

export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite/React in dev
    "'unsafe-eval'", // Required for Vite HMR in dev
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components/CSS-in-JS
    'https://fonts.googleapis.com',
  ],
  'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.supabase.co',
    'https://*.google-analytics.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://*.google-analytics.com',
    'https://*.sentry.io',
  ],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

/**
 * Generate CSP header string
 */
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_CONFIG)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

/**
 * Add CSP meta tag to document
 */
export const addCSPMetaTag = () => {
  if (typeof document === 'undefined') return;

  const existingMeta = document.querySelector(
    'meta[http-equiv="Content-Security-Policy"]'
  );
  if (existingMeta) return;

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateCSPHeader();
  document.head.appendChild(meta);
};

/**
 * Security headers to add to edge functions
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  // API endpoints
  apiGeneral: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  apiAuth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  apiAI: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Input sanitization helpers
 */
export const sanitizers = {
  /**
   * Remove potential XSS from text
   */
  text: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim()
      .substring(0, 10000); // Max length
  },

  /**
   * Sanitize email
   */
  email: (input: string): string => {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, '') // Only allow email chars
      .substring(0, 255);
  },

  /**
   * Sanitize URL
   */
  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http/https
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.toString().substring(0, 500);
    } catch {
      return '';
    }
  },

  /**
   * Sanitize filename
   */
  filename: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
  },
};

/**
 * Password strength checker
 */
export const checkPasswordStrength = (
  password: string
): {
  score: number; // 0-4
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (password.length < 8) feedback.push('Use at least 8 characters');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/[0-9]/.test(password)) feedback.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters');

  // Check for common weak passwords
  const weakPasswords = ['password', '12345678', 'qwerty', 'abc123'];
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    score = 0;
    feedback.push('Avoid common passwords');
  }

  return { score: Math.min(score, 4), feedback };
};
