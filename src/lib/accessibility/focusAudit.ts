/**
 * Focus State Audit - WCAG 2.2 Focus Visible Compliance
 * Ensures all interactive elements have visible focus indicators
 */

export interface FocusAuditResult {
  element: HTMLElement;
  tag: string;
  hasVisibleFocus: boolean;
  hasFocusWithin: boolean;
  hasOutline: boolean;
  hasRing: boolean;
  hasCustomIndicator: boolean;
  recommendation?: string;
}

export interface FocusAuditReport {
  totalInteractive: number;
  violations: FocusAuditResult[];
  passes: FocusAuditResult[];
  timestamp: Date;
}

/**
 * Check if element has visible focus indicator
 */
function hasVisibleFocusIndicator(element: HTMLElement): {
  hasOutline: boolean;
  hasRing: boolean;
  hasCustomIndicator: boolean;
  visible: boolean;
} {
  // Temporarily focus element
  const originalFocus = document.activeElement;
  element.focus();
  
  const style = window.getComputedStyle(element);
  const focusStyle = window.getComputedStyle(element, ':focus');
  
  // Check for outline
  const hasOutline = style.outlineWidth !== '0px' || focusStyle.outlineWidth !== '0px';
  
  // Check for ring (tailwind ring-* classes)
  const hasRing = style.boxShadow !== 'none' && style.boxShadow.includes('rgb');
  
  // Check for custom focus indicator (background change, border change, etc.)
  const bgChanged = style.backgroundColor !== focusStyle.backgroundColor;
  const borderChanged = style.borderColor !== focusStyle.borderColor;
  const hasCustomIndicator = bgChanged || borderChanged;
  
  // Restore focus
  if (originalFocus instanceof HTMLElement) {
    originalFocus.focus();
  } else {
    element.blur();
  }
  
  return {
    hasOutline,
    hasRing,
    hasCustomIndicator,
    visible: hasOutline || hasRing || hasCustomIndicator
  };
}

/**
 * Scan page for focus indicator violations
 */
export function scanFocusIndicators(): FocusAuditReport {
  const results: FocusAuditResult[] = [];
  
  // Interactive element selectors
  const selectors = [
    'a[href]',
    'button',
    'input:not([type="hidden"])',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="menuitem"]'
  ];
  
  const elements = document.querySelectorAll(selectors.join(','));
  
  elements.forEach(el => {
    if (!(el instanceof HTMLElement)) return;
    if (el.offsetParent === null) return; // Skip hidden
    if (el.hasAttribute('disabled')) return; // Skip disabled
    
    const focusCheck = hasVisibleFocusIndicator(el);
    const hasFocusWithin = el.classList.contains('focus-within') || 
                          el.parentElement?.classList.contains('focus-within') || false;
    
    let recommendation: string | undefined;
    if (!focusCheck.visible) {
      recommendation = 'Add focus indicator: ring-2 ring-primary focus:outline-none or similar';
    }
    
    results.push({
      element: el,
      tag: el.tagName.toLowerCase(),
      hasVisibleFocus: focusCheck.visible,
      hasFocusWithin,
      hasOutline: focusCheck.hasOutline,
      hasRing: focusCheck.hasRing,
      hasCustomIndicator: focusCheck.hasCustomIndicator,
      recommendation
    });
  });
  
  const violations = results.filter(r => !r.hasVisibleFocus);
  const passes = results.filter(r => r.hasVisibleFocus);
  
  return {
    totalInteractive: results.length,
    violations,
    passes,
    timestamp: new Date()
  };
}

/**
 * Log focus audit report to console (dev only)
 */
export function logFocusAudit(): void {
  if (import.meta.env.PROD) return;
  
  const report = scanFocusIndicators();
  
  console.group('🔍 Focus Indicator Audit');
  console.log(`Total interactive elements: ${report.totalInteractive}`);
  console.log(`✅ Has visible focus: ${report.passes.length}`);
  console.log(`❌ Missing focus indicator: ${report.violations.length}`);
  
  if (report.violations.length > 0) {
    console.group('❌ Focus Indicator Violations');
    report.violations.forEach((v, i) => {
      console.log(`${i + 1}. <${v.tag}>`);
      console.log(`   Recommendation: ${v.recommendation}`);
      console.log('   Element:', v.element);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Initialize focus audit
 */
export function initFocusAudit(): void {
  if (import.meta.env.PROD) return;
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(logFocusAudit, 1500);
    });
  } else {
    setTimeout(logFocusAudit, 1500);
  }
  
  // Add global function
  (window as any).__checkFocus = logFocusAudit;
  console.log('💡 Run __checkFocus() to audit focus indicators');
}
