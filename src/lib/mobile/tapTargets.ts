import { safeConsole } from '@/lib/safeLogger';

/**
 * Tap Target Validator
 * Ensures all interactive elements meet minimum tap target size (44x44px)
 */

const MIN_TAP_TARGET_SIZE = 44; // Apple and Material Design recommendation

interface TapTarget {
  element: HTMLElement;
  width: number;
  height: number;
  isTooSmall: boolean;
}

/**
 * Check if an element meets minimum tap target size
 */
export const validateTapTarget = (element: HTMLElement): TapTarget => {
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  // Account for padding in tap target
  const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
  const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
  
  const effectiveWidth = rect.width + paddingX;
  const effectiveHeight = rect.height + paddingY;

  return {
    element,
    width: effectiveWidth,
    height: effectiveHeight,
    isTooSmall: effectiveWidth < MIN_TAP_TARGET_SIZE || effectiveHeight < MIN_TAP_TARGET_SIZE,
  };
};

/**
 * Scan all interactive elements on the page
 */
export const scanTapTargets = (): TapTarget[] => {
  const interactiveSelectors = [
    'button',
    'a',
    'input[type="button"]',
    'input[type="submit"]',
    '[role="button"]',
    '[onclick]',
  ];

  const elements = document.querySelectorAll<HTMLElement>(
    interactiveSelectors.join(', ')
  );

  return Array.from(elements).map(validateTapTarget);
};

/**
 * Log tap target violations to console
 */
export const logTapTargetViolations = () => {
  if (!import.meta.env.DEV) return;

  const targets = scanTapTargets();
  const violations = targets.filter(t => t.isTooSmall);

  if (violations.length > 0) {
    safeConsole.log(`Found ${violations.length} elements smaller than ${MIN_TAP_TARGET_SIZE}x${MIN_TAP_TARGET_SIZE}px:`);
    violations.forEach((violation) => {
      safeConsole.log(
        `${violation.element.tagName.toLowerCase()}: ${Math.round(violation.width)}x${Math.round(violation.height)}px`,
        violation.element
      );
    });
  }
};

/**
 * Fix tap targets by adding minimum padding
 */
export const fixTapTarget = (element: HTMLElement) => {
  const validation = validateTapTarget(element);
  
  if (validation.isTooSmall) {
    const neededWidth = Math.max(0, MIN_TAP_TARGET_SIZE - validation.width) / 2;
    const neededHeight = Math.max(0, MIN_TAP_TARGET_SIZE - validation.height) / 2;
    
    element.style.paddingLeft = `${neededWidth}px`;
    element.style.paddingRight = `${neededWidth}px`;
    element.style.paddingTop = `${neededHeight}px`;
    element.style.paddingBottom = `${neededHeight}px`;
  }
};
