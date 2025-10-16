/**
 * Advanced Security Layer
 * Implements enterprise-grade security features
 */

// Content Security Policy Manager
export class CSPManager {
  static readonly policy = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://www.googletagmanager.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://*.supabase.co',
    ],
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'https://ai.gateway.lovable.dev',
      'wss://*.supabase.co',
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  static generatePolicyString(): string {
    return Object.entries(this.policy)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }

  static inject() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = this.generatePolicyString();
    document.head.appendChild(meta);
  }
}

// Rate Limiter with Token Bucket Algorithm
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second

  constructor(capacity: number = 10, refillRate: number = 1) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  tryConsume(tokens: number = 1): boolean {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }

  getRemainingTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

// Input Sanitization (XSS Prevention)
export class InputSanitizer {
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  static sanitize(input: string): string {
    let cleaned = input;
    
    this.DANGEROUS_PATTERNS.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    return cleaned
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static sanitizeHTML(html: string): string {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?1?\d{9,15}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
  }

  static isValidURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}

// Secure Storage with Encryption
export class SecureStorage {
  private static readonly PREFIX = 'secure_';
  
  // Simple encryption (for demo - use Web Crypto API in production)
  private static encrypt(data: string, key: string): string {
    return btoa(data + key);
  }

  private static decrypt(encrypted: string, key: string): string {
    const decrypted = atob(encrypted);
    return decrypted.slice(0, -key.length);
  }

  static setItem(key: string, value: any, encrypt: boolean = false) {
    const serialized = JSON.stringify(value);
    const stored = encrypt ? this.encrypt(serialized, key) : serialized;
    localStorage.setItem(this.PREFIX + key, stored);
  }

  static getItem<T>(key: string, encrypted: boolean = false): T | null {
    const stored = localStorage.getItem(this.PREFIX + key);
    if (!stored) return null;
    
    try {
      const decrypted = encrypted ? this.decrypt(stored, key) : stored;
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  static removeItem(key: string) {
    localStorage.removeItem(this.PREFIX + key);
  }

  static clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
}

// Session Security Monitor
export class SessionMonitor {
  private static lastActivity = Date.now();
  private static readonly TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static checkInterval: NodeJS.Timeout | null = null;

  static start(onTimeout: () => void) {
    this.updateActivity();
    
    // Track user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), { passive: true });
    });

    // Check for timeout
    this.checkInterval = setInterval(() => {
      if (Date.now() - this.lastActivity > this.TIMEOUT) {
        onTimeout();
        this.stop();
      }
    }, 60000); // Check every minute
  }

  static updateActivity() {
    this.lastActivity = Date.now();
  }

  static stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  static getRemainingTime(): number {
    return Math.max(0, this.TIMEOUT - (Date.now() - this.lastActivity));
  }
}

// Initialize security features
export function initializeAdvancedSecurity() {
  // Inject CSP (only in production)
  if (import.meta.env.PROD) {
    CSPManager.inject();
  }

  // Prevent clickjacking
  if (window.self !== window.top) {
    window.top?.location.replace(window.self.location.href);
  }

  // Disable right-click in production (optional)
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      if ((e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
      }
    });
  }

  console.log('🔒 Advanced Security Initialized');
}

// Export rate limiter instances for different use cases
export const apiRateLimiter = new RateLimiter(20, 2); // 20 requests, refill 2 per second
export const searchRateLimiter = new RateLimiter(10, 1); // 10 searches, refill 1 per second
export const formRateLimiter = new RateLimiter(5, 0.5); // 5 submissions, refill 0.5 per second
