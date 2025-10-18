/**
 * WCAG 2.2 AA/AAA Contrast Validator
 * Automated accessibility compliance checking
 */

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  foreground: string;
  background: string;
  element?: HTMLElement;
}

export interface ContrastReport {
  totalChecked: number;
  violations: ContrastResult[];
  warnings: ContrastResult[];
  passes: ContrastResult[];
  timestamp: Date;
}

/**
 * Convert RGB to relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse color string to RGB
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Create temporary element to compute color
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  
  const computed = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);
  
  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  };
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsWCAG(ratio: number, isLargeText = false): { aa: boolean; aaa: boolean } {
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;
  
  return {
    aa: ratio >= aaThreshold,
    aaa: ratio >= aaaThreshold
  };
}

/**
 * Check if text is considered "large" by WCAG standards
 */
function isLargeText(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = parseInt(style.fontWeight);
  
  // Large text is 18pt+ (24px) or 14pt+ (18.5px) bold (700+)
  return fontSize >= 24 || (fontSize >= 18.5 && fontWeight >= 700);
}

/**
 * Scan page for contrast violations
 */
export function scanPageContrast(): ContrastReport {
  const results: ContrastResult[] = [];
  
  // Target text elements
  const selectors = [
    'p', 'span', 'a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'label', 'li', 'td', 'th', 'div[role="button"]'
  ];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      if (el.offsetParent === null) return; // Skip hidden elements
      
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = style.backgroundColor;
      
      // Skip transparent backgrounds - walk up DOM tree
      let bg = bgColor;
      let parent = el.parentElement;
      while (bg === 'rgba(0, 0, 0, 0)' && parent) {
        bg = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
      
      if (bg === 'rgba(0, 0, 0, 0)') {
        bg = 'rgb(255, 255, 255)'; // Assume white background
      }
      
      const ratio = getContrastRatio(color, bg);
      const large = isLargeText(el);
      const wcag = meetsWCAG(ratio, large);
      
      results.push({
        ratio,
        passesAA: wcag.aa,
        passesAAA: wcag.aaa,
        foreground: color,
        background: bg,
        element: el
      });
    });
  });
  
  const violations = results.filter(r => !r.passesAA);
  const warnings = results.filter(r => r.passesAA && !r.passesAAA);
  const passes = results.filter(r => r.passesAAA);
  
  return {
    totalChecked: results.length,
    violations,
    warnings,
    passes,
    timestamp: new Date()
  };
}

/**
 * Log contrast report to console (dev only)
 */
export function logContrastReport(): void {
  if (import.meta.env.PROD) return;
  
  const report = scanPageContrast();
  
  console.group('🎨 Contrast Accessibility Report');
  console.log(`Total elements checked: ${report.totalChecked}`);
  console.log(`✅ Passes AAA: ${report.passes.length}`);
  console.log(`⚠️ Passes AA only: ${report.warnings.length}`);
  console.log(`❌ Violations: ${report.violations.length}`);
  
  if (report.violations.length > 0) {
    console.group('❌ WCAG AA Violations');
    report.violations.forEach((v, i) => {
      console.log(`${i + 1}. Ratio: ${v.ratio.toFixed(2)} (needs 4.5+)`);
      console.log(`   Foreground: ${v.foreground}`);
      console.log(`   Background: ${v.background}`);
      if (v.element) console.log('   Element:', v.element);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Initialize contrast validation
 */
export function initContrastValidator(): void {
  if (import.meta.env.PROD) return;
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(logContrastReport, 1000);
    });
  } else {
    setTimeout(logContrastReport, 1000);
  }
  
  // Add global function for manual testing
  (window as any).__checkContrast = logContrastReport;
  console.log('💡 Run __checkContrast() to check page contrast');
}
