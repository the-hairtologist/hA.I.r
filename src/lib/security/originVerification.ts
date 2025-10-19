/**
 * Runtime Origin Verification - Phase 4: Security
 * SPARE Method: Prevents unauthorized app wrapping/cloning
 */

const ALLOWED_ORIGINS = [
  'https://a1a18f9d-b2f9-4d81-aa8c-e28408bee3a2.lovableproject.com',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173'
];

const CUSTOM_DOMAINS: string[] = [
  // Add your custom domains here when deployed
  // 'https://yourdomain.com',
  // 'https://www.yourdomain.com'
];

class OriginVerifier {
  private static instance: OriginVerifier;
  private verified = false;
  private violations: string[] = [];

  private constructor() {
    this.verify();
  }

  static getInstance(): OriginVerifier {
    if (!OriginVerifier.instance) {
      OriginVerifier.instance = new OriginVerifier();
    }
    return OriginVerifier.instance;
  }

  /**
   * Verify current origin is authorized
   */
  private verify(): void {
    const currentOrigin = window.location.origin;
    const allowedOrigins = [...ALLOWED_ORIGINS, ...CUSTOM_DOMAINS];

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // Wildcard matching (e.g., *.lovableproject.com)
        const pattern = allowed.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(currentOrigin);
      }
      return currentOrigin === allowed;
    });

    this.verified = isAllowed;

    if (!isAllowed) {
      this.violations.push(`Unauthorized origin: ${currentOrigin}`);
      this.handleViolation();
    }

    // Additional checks
    this.checkFraming();
    this.checkReferrer();
  }

  /**
   * Check if app is running in an iframe (potential wrapping)
   */
  private checkFraming(): void {
    if (window.self !== window.top) {
      this.violations.push('App running in iframe');
      
      // Allow iframe only from same origin
      try {
        const parentOrigin = window.parent.location.origin;
        if (parentOrigin !== window.location.origin) {
          this.handleViolation();
        }
      } catch {
        // Cross-origin iframe - definitely suspicious
        this.handleViolation();
      }
    }
  }

  /**
   * Check referrer for suspicious activity
   */
  private checkReferrer(): void {
    const referrer = document.referrer;
    
    if (referrer && !this.isAllowedReferrer(referrer)) {
      this.violations.push(`Suspicious referrer: ${referrer}`);
      // Log but don't block - referrer can be legitimate
      console.warn('⚠️ Unusual referrer detected:', referrer);
    }
  }

  /**
   * Check if referrer is from an allowed domain
   */
  private isAllowedReferrer(referrer: string): boolean {
    try {
      const url = new URL(referrer);
      const allowedOrigins = [...ALLOWED_ORIGINS, ...CUSTOM_DOMAINS];
      
      return allowedOrigins.some(allowed => {
        const allowedUrl = new URL(allowed);
        return url.hostname === allowedUrl.hostname;
      });
    } catch {
      return false;
    }
  }

  /**
   * Handle security violation
   */
  private handleViolation(): void {
    if (import.meta.env.PROD) {
      // In production, block unauthorized access
      document.body.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
          background: #fafafa;
        ">
          <div style="
            max-width: 400px;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          ">
            <h1 style="
              font-size: 1.5rem;
              font-weight: 700;
              color: #dc2626;
              margin-bottom: 1rem;
            ">⚠️ Unauthorized Access</h1>
            <p style="
              color: #6b7280;
              line-height: 1.6;
              margin-bottom: 1.5rem;
            ">
              This application can only be accessed from authorized domains.
            </p>
            <p style="
              font-size: 0.875rem;
              color: #9ca3af;
            ">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      `;
      throw new Error('Unauthorized origin detected');
    } else {
      // In development, just warn
      console.warn('🔒 Security Check Failed:', this.violations);
    }
  }

  /**
   * Get verification status
   */
  isVerified(): boolean {
    return this.verified;
  }

  /**
   * Get all violations
   */
  getViolations(): string[] {
    return [...this.violations];
  }
}

export const originVerifier = OriginVerifier.getInstance();

/**
 * Initialize origin verification
 */
export function initOriginVerification(): void {
  originVerifier.isVerified();

  if (import.meta.env.DEV) {
    (window as any).__checkOrigin = () => {
      console.log('Verified:', originVerifier.isVerified());
      console.log('Violations:', originVerifier.getViolations());
    };
    console.log('💡 Run __checkOrigin() to see security status');
  }
}
