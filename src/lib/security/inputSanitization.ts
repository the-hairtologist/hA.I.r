/**
 * Input Sanitization Utilities
 * Protects against XSS, SQL injection, and other input-based attacks
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, char => map[char]);
}

/**
 * Sanitize user input for safe display
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 5000); // Limit length to prevent DoS
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254);
}

/**
 * Validate and sanitize phone numbers
 */
export function sanitizePhone(phone: string): string {
  return phone
    .replace(/[^\d+()-\s]/g, '')
    .trim()
    .slice(0, 20);
}

/**
 * Sanitize URLs to prevent javascript: and data: schemes
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return '';
  }
  return url.trim().slice(0, 2048);
}

/**
 * Remove SQL injection attempts
 */
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove SQL special chars
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
}

/**
 * Detect potential SQL injection attempts
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /('|('')|"|(""))/,
    /(\bOR\b|\bAND\b).*?[=<>]/i,
    /\bUNION\b.*?\bSELECT\b/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate and sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}
