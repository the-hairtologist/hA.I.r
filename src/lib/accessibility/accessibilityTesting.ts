/**
 * Accessibility Testing Utilities
 * Tools for testing and validating accessibility compliance
 */

/**
 * Check color contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const sRGB = [r, g, b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsContrastRequirement(
  ratio: number,
  level: 'AA' | 'AAA',
  isLargeText: boolean = false
): boolean {
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Audit element for accessibility issues
 */
export interface A11yIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  element: string;
  wcagCriterion?: string;
}

export function auditElement(element: HTMLElement): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const tagName = element.tagName.toLowerCase();

  // Check images
  if (tagName === 'img') {
    const alt = element.getAttribute('alt');
    if (alt === null) {
      issues.push({
        severity: 'error',
        message: 'Image missing alt attribute',
        element: tagName,
        wcagCriterion: '1.1.1',
      });
    } else if (alt === '' && element.getAttribute('role') !== 'presentation') {
      issues.push({
        severity: 'warning',
        message: 'Image has empty alt text but no role="presentation"',
        element: tagName,
        wcagCriterion: '1.1.1',
      });
    }
  }

  // Check buttons
  if (tagName === 'button') {
    const ariaLabel = element.getAttribute('aria-label');
    const text = element.textContent?.trim();
    if (!ariaLabel && !text) {
      issues.push({
        severity: 'error',
        message: 'Button has no accessible name',
        element: tagName,
        wcagCriterion: '4.1.2',
      });
    }
  }

  // Check form inputs
  if (['input', 'select', 'textarea'].includes(tagName)) {
    const id = element.getAttribute('id');
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    
    if (!id && !ariaLabel && !ariaLabelledBy) {
      issues.push({
        severity: 'error',
        message: 'Form input has no associated label',
        element: tagName,
        wcagCriterion: '1.3.1',
      });
    }
  }

  // Check links
  if (tagName === 'a') {
    const href = element.getAttribute('href');
    if (!href || href === '#') {
      issues.push({
        severity: 'warning',
        message: 'Link has no valid href',
        element: tagName,
        wcagCriterion: '2.4.4',
      });
    }
  }

  // Check interactive elements for size
  if (['button', 'a', 'input'].includes(tagName)) {
    const rect = element.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      issues.push({
        severity: 'warning',
        message: 'Interactive element smaller than 44x44px (touch target)',
        element: tagName,
        wcagCriterion: '2.5.8',
      });
    }
  }

  return issues;
}

/**
 * Run accessibility audit on container
 */
export function runAccessibilityAudit(
  container: HTMLElement = document.body
): A11yIssue[] {
  const allIssues: A11yIssue[] = [];
  
  // Check all interactive elements
  const interactiveElements = container.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"], img'
  );

  interactiveElements.forEach(element => {
    const issues = auditElement(element as HTMLElement);
    allIssues.push(...issues);
  });

  return allIssues;
}

/**
 * Check keyboard navigation
 */
export function testKeyboardNavigation(
  container: HTMLElement = document.body
): {
  focusableElements: number;
  unreachableElements: number;
  tabOrder: string[];
} {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const focusableElements = Array.from(
    container.querySelectorAll(focusableSelector)
  ) as HTMLElement[];

  const tabOrder = focusableElements
    .filter(el => !el.hasAttribute('aria-hidden'))
    .map(el => {
      const tabIndex = el.getAttribute('tabindex') || '0';
      const label =
        el.getAttribute('aria-label') ||
        el.textContent?.trim() ||
        el.tagName;
      return `${tabIndex}: ${label}`;
    });

  const unreachableElements = Array.from(
    container.querySelectorAll('[onclick], [role="button"]')
  ).filter(
    el =>
      !focusableElements.includes(el as HTMLElement) &&
      !el.hasAttribute('aria-hidden')
  ).length;

  return {
    focusableElements: focusableElements.length,
    unreachableElements,
    tabOrder,
  };
}

/**
 * Generate accessibility report
 */
export interface AccessibilityReport {
  score: number; // 0-100
  issues: A11yIssue[];
  keyboardNav: ReturnType<typeof testKeyboardNavigation>;
  summary: {
    errors: number;
    warnings: number;
    passed: boolean;
  };
}

export function generateAccessibilityReport(
  container: HTMLElement = document.body
): AccessibilityReport {
  const issues = runAccessibilityAudit(container);
  const keyboardNav = testKeyboardNavigation(container);

  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;

  // Calculate score (100 - penalties)
  let score = 100;
  score -= errors * 10; // -10 per error
  score -= warnings * 2; // -2 per warning
  score -= keyboardNav.unreachableElements * 5; // -5 per unreachable element
  score = Math.max(0, score);

  return {
    score,
    issues,
    keyboardNav,
    summary: {
      errors,
      warnings,
      passed: errors === 0 && keyboardNav.unreachableElements === 0,
    },
  };
}

/**
 * Log accessibility report to console
 */
export function logAccessibilityReport(report: AccessibilityReport) {
  console.group('♿ Accessibility Report');
  console.log(`Score: ${report.score}/100`);
  console.log(`Status: ${report.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Errors: ${report.summary.errors}`);
  console.log(`Warnings: ${report.summary.warnings}`);
  console.log(`Focusable Elements: ${report.keyboardNav.focusableElements}`);
  console.log(`Unreachable Elements: ${report.keyboardNav.unreachableElements}`);
  
  if (report.issues.length > 0) {
    console.group('Issues:');
    console.table(report.issues);
    console.groupEnd();
  }

  if (report.keyboardNav.tabOrder.length > 0) {
    console.group('Tab Order:');
    report.keyboardNav.tabOrder.forEach(item => console.log(item));
    console.groupEnd();
  }

  console.groupEnd();
}
