/**
 * Touch Target Audit Tool
 * Validates interactive elements meet WCAG 2.2 AAA standards (44x44px minimum)
 */

export interface TouchTargetViolation {
  element: HTMLElement;
  selector: string;
  width: number;
  height: number;
  effectiveWidth: number; // Including padding
  effectiveHeight: number;
  isTooSmall: boolean;
  severity: 'critical' | 'warning';
  recommendation: string;
}

const MINIMUM_TOUCH_TARGET = 44; // WCAG 2.2 AAA
const COMFORTABLE_TOUCH_TARGET = 48; // Recommended

/**
 * Get the effective size of an element including padding
 */
function getEffectiveSize(element: HTMLElement): { width: number; height: number } {
  const computed = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  const paddingLeft = parseFloat(computed.paddingLeft);
  const paddingRight = parseFloat(computed.paddingRight);
  const paddingTop = parseFloat(computed.paddingTop);
  const paddingBottom = parseFloat(computed.paddingBottom);
  
  return {
    width: rect.width + paddingLeft + paddingRight,
    height: rect.height + paddingTop + paddingBottom,
  };
}

/**
 * Generate a unique CSS selector for an element
 */
function getUniqueSelector(element: HTMLElement): string {
  if (element.id) return `#${element.id}`;
  
  if (element.className) {
    const classes = Array.from(element.classList)
      .filter(c => c && !c.startsWith('hover:') && !c.startsWith('focus:'))
      .slice(0, 3)
      .join('.');
    if (classes) return `${element.tagName.toLowerCase()}.${classes}`;
  }
  
  return element.tagName.toLowerCase();
}

/**
 * Check if an element is visible and interactive
 */
function isInteractive(element: HTMLElement): boolean {
  const computed = window.getComputedStyle(element);
  const isVisible = computed.display !== 'none' && 
                   computed.visibility !== 'hidden' && 
                   parseFloat(computed.opacity) > 0;
  
  if (!isVisible) return false;
  
  // Check if element is interactive
  const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
  const hasClickHandler = element.onclick !== null || 
                         element.getAttribute('onclick') !== null;
  const hasRole = ['button', 'link', 'checkbox', 'radio', 'tab'].includes(
    element.getAttribute('role') || ''
  );
  
  return interactiveTags.includes(element.tagName) || hasClickHandler || hasRole;
}

/**
 * Validate a single touch target
 */
export function validateTouchTarget(element: HTMLElement): TouchTargetViolation | null {
  if (!isInteractive(element)) return null;
  
  const rect = element.getBoundingClientRect();
  const effective = getEffectiveSize(element);
  
  const width = rect.width;
  const height = rect.height;
  const effectiveWidth = effective.width;
  const effectiveHeight = effective.height;
  
  const isTooSmall = effectiveWidth < MINIMUM_TOUCH_TARGET || 
                     effectiveHeight < MINIMUM_TOUCH_TARGET;
  
  if (!isTooSmall) return null;
  
  // Determine severity
  const isVerySmal = effectiveWidth < 32 || effectiveHeight < 32;
  const severity: 'critical' | 'warning' = isVerySmal ? 'critical' : 'warning';
  
  // Generate recommendation
  const widthDiff = COMFORTABLE_TOUCH_TARGET - effectiveWidth;
  const heightDiff = COMFORTABLE_TOUCH_TARGET - effectiveHeight;
  
  let recommendation = 'Increase size to meet WCAG 2.2 AAA (44x44px minimum). ';
  if (widthDiff > 0 && heightDiff > 0) {
    recommendation += `Add padding: ${Math.ceil(widthDiff / 2)}px horizontal, ${Math.ceil(heightDiff / 2)}px vertical.`;
  } else if (widthDiff > 0) {
    recommendation += `Add padding: ${Math.ceil(widthDiff / 2)}px horizontal.`;
  } else {
    recommendation += `Add padding: ${Math.ceil(heightDiff / 2)}px vertical.`;
  }
  
  return {
    element,
    selector: getUniqueSelector(element),
    width,
    height,
    effectiveWidth,
    effectiveHeight,
    isTooSmall,
    severity,
    recommendation,
  };
}

/**
 * Scan all interactive elements on the page
 */
export function scanTouchTargets(): TouchTargetViolation[] {
  const selectors = [
    'button',
    'a[href]',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    'input[type="checkbox"]',
    'input[type="radio"]',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[onclick]',
  ];
  
  const violations: TouchTargetViolation[] = [];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const violation = validateTouchTarget(element as HTMLElement);
      if (violation) {
        violations.push(violation);
      }
    });
  });
  
  return violations;
}

/**
 * Log violations to console with visual formatting
 */
export function logTouchTargetViolations(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const violations = scanTouchTargets();
  
  if (violations.length === 0) {
    console.log('✅ All touch targets meet WCAG 2.2 AAA standards (44x44px minimum)');
    return;
  }
  
  console.group(`⚠️ Found ${violations.length} touch target violations`);
  
  const critical = violations.filter(v => v.severity === 'critical');
  const warnings = violations.filter(v => v.severity === 'warning');
  
  if (critical.length > 0) {
    console.group(`🔴 Critical (${critical.length}) - Size < 32px`);
    critical.forEach(v => {
      console.log(
        `${v.selector}\n` +
        `  Size: ${Math.round(v.effectiveWidth)}x${Math.round(v.effectiveHeight)}px\n` +
        `  ${v.recommendation}`,
        v.element
      );
    });
    console.groupEnd();
  }
  
  if (warnings.length > 0) {
    console.group(`🟡 Warnings (${warnings.length}) - Size < 44px`);
    warnings.forEach(v => {
      console.log(
        `${v.selector}\n` +
        `  Size: ${Math.round(v.effectiveWidth)}x${Math.round(v.effectiveHeight)}px\n` +
        `  ${v.recommendation}`,
        v.element
      );
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Fix a touch target by adding appropriate padding
 */
export function fixTouchTarget(element: HTMLElement): void {
  const effective = getEffectiveSize(element);
  
  if (effective.width >= MINIMUM_TOUCH_TARGET && 
      effective.height >= MINIMUM_TOUCH_TARGET) {
    return; // Already compliant
  }
  
  const computed = window.getComputedStyle(element);
  const currentPaddingX = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
  const currentPaddingY = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
  
  // Calculate additional padding needed
  const widthDiff = Math.max(0, COMFORTABLE_TOUCH_TARGET - effective.width);
  const heightDiff = Math.max(0, COMFORTABLE_TOUCH_TARGET - effective.height);
  
  if (widthDiff > 0) {
    const additionalX = Math.ceil(widthDiff / 2);
    element.style.paddingLeft = `${parseFloat(computed.paddingLeft) + additionalX}px`;
    element.style.paddingRight = `${parseFloat(computed.paddingRight) + additionalX}px`;
  }
  
  if (heightDiff > 0) {
    const additionalY = Math.ceil(heightDiff / 2);
    element.style.paddingTop = `${parseFloat(computed.paddingTop) + additionalY}px`;
    element.style.paddingBottom = `${parseFloat(computed.paddingBottom) + additionalY}px`;
  }
  
  console.log(`✅ Fixed touch target: ${getUniqueSelector(element)}`);
}

/**
 * Auto-fix all touch target violations on the page
 */
export function autoFixTouchTargets(): void {
  const violations = scanTouchTargets();
  violations.forEach(v => fixTouchTarget(v.element));
  console.log(`✅ Fixed ${violations.length} touch target violations`);
}

/**
 * Monitor for new elements and validate touch targets
 */
export function monitorTouchTargets(): () => void {
  if (process.env.NODE_ENV !== 'development') {
    return () => {}; // No-op in production
  }
  
  let timeoutId: NodeJS.Timeout;
  
  const observer = new MutationObserver(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      logTouchTargetViolations();
    }, 1000);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  // Initial scan
  setTimeout(logTouchTargetViolations, 2000);
  
  return () => {
    observer.disconnect();
    clearTimeout(timeoutId);
  };
}
