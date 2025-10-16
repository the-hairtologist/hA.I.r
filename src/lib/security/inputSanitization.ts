/**
 * Input Sanitization Layer
 * Additional security beyond validation to prevent injection attacks
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Strips all HTML tags except safe formatting
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';
  
  // Remove all HTML tags except safe ones
  const allowedTags = ['b', 'i', 'em', 'strong', 'br'];
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  
  return input.replace(tagRegex, (match, tagName) => {
    return allowedTags.includes(tagName.toLowerCase()) ? match : '';
  });
}

/**
 * Sanitize text for safe display (prevent XSS)
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize for URL usage
 */
export function sanitizeForURL(input: string): string {
  if (!input) return '';
  
  return encodeURIComponent(input.trim());
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(input: string): string | null {
  if (!input) return null;
  
  const trimmed = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) return null;
  if (trimmed.length > 255) return null;
  
  return trimmed;
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(input: string): string | null {
  if (!input) return null;
  
  // Remove all non-numeric characters except +, -, (, ), and spaces
  const cleaned = input.replace(/[^0-9+\-() ]/g, '');
  
  if (cleaned.length < 10 || cleaned.length > 20) return null;
  
  return cleaned;
}

/**
 * Prevent SQL injection in user input (additional layer beyond parameterized queries)
 */
export function detectSQLInjection(input: string): boolean {
  if (!input) return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|ONERROR)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(\bOR\b.*=.*)/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize file paths to prevent directory traversal
 */
export function sanitizeFilePath(input: string): string | null {
  if (!input) return null;
  
  // Remove any path traversal attempts
  const dangerous = ['../', '..\\', './', '.\\'];
  const sanitized = input.split('/').filter(part => 
    !dangerous.some(d => part.includes(d))
  ).join('/');
  
  // Only allow alphanumeric, hyphens, underscores, and periods
  if (!/^[a-zA-Z0-9\-_./]+$/.test(sanitized)) return null;
  
  return sanitized;
}

/**
 * Comprehensive input sanitization
 */
export function sanitizeInput(
  input: string,
  type: 'text' | 'html' | 'email' | 'phone' | 'url' | 'filepath' = 'text'
): string | null {
  if (!input) return null;
  
  // Check for SQL injection attempts
  if (detectSQLInjection(input)) {
    console.warn('Potential SQL injection detected:', input);
    return null;
  }
  
  switch (type) {
    case 'html':
      return sanitizeHTML(input);
    case 'text':
      return sanitizeText(input);
    case 'email':
      return sanitizeEmail(input);
    case 'phone':
      return sanitizePhone(input);
    case 'url':
      return sanitizeForURL(input);
    case 'filepath':
      return sanitizeFilePath(input);
    default:
      return input.trim();
  }
}

/**
 * Batch sanitize object properties
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldTypes: Partial<Record<keyof T, 'text' | 'html' | 'email' | 'phone' | 'url' | 'filepath'>>
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const type = fieldTypes[key as keyof T] || 'text';
      const sanitizedValue = sanitizeInput(value, type);
      if (sanitizedValue !== null) {
        sanitized[key as keyof T] = sanitizedValue as any;
      }
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}