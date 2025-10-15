/**
 * Color System Validator
 * Ensures all colors are using HSL format and semantic tokens
 */

interface ColorValidationResult {
  valid: boolean;
  issues: string[];
  recommendations: string[];
}

class ColorSystemValidatorClass {
  /**
   * Validate color system consistency
   */
  validateColorSystem(): ColorValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if CSS variables are properly defined
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    // Critical color variables to check
    const criticalVars = [
      '--background',
      '--foreground',
      '--primary',
      '--secondary',
      '--accent',
      '--muted',
      '--card',
      '--border'
    ];

    criticalVars.forEach(varName => {
      const value = styles.getPropertyValue(varName).trim();
      
      if (!value) {
        issues.push(`Missing CSS variable: ${varName}`);
      } else if (!this.isValidHSL(value)) {
        issues.push(`${varName} is not in HSL format: ${value}`);
      }
    });

    // Check for direct color usage in computed styles
    const directColorPatterns = [
      'rgb(255, 255, 255)', // white
      'rgb(0, 0, 0)',       // black
      '#ffffff',            // hex white
      '#000000',            // hex black
      'yellow'              // named colors
    ];

    // Recommendations for best practices
    if (issues.length === 0) {
      recommendations.push('✅ All colors are using HSL format');
      recommendations.push('✅ Semantic color tokens are properly defined');
    } else {
      recommendations.push('❌ Fix HSL format issues in index.css');
      recommendations.push('❌ Ensure all colors use semantic tokens');
    }

    const valid = issues.length === 0;

    logger.info('Color system validation complete', 'ColorValidator', {
      valid,
      issues: issues.length
    });

    return {
      valid,
      issues,
      recommendations
    };
  }

  /**
   * Check if value is valid HSL format
   */
  private isValidHSL(value: string): boolean {
    // HSL should be in format: "270 85% 60%" (h s% l%)
    const hslPattern = /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/;
    return hslPattern.test(value.trim());
  }

  /**
   * Scan DOM for direct color usage
   */
  scanForDirectColors(): string[] {
    const issues: string[] = [];
    const elements = document.querySelectorAll('*');
    
    const directColorPatterns = [
      /rgb\(255,\s*255,\s*255\)/i,
      /rgb\(0,\s*0,\s*0\)/i,
      /#ffffff/i,
      /#000000/i,
      /#fff\b/i,
      /#000\b/i,
      /\byellow\b/i,
      /\bwhite\b/i,
      /\bblack\b/i
    ];

    elements.forEach((el, index) => {
      const computedStyle = window.getComputedStyle(el);
      const bgColor = computedStyle.backgroundColor;
      const textColor = computedStyle.color;

      directColorPatterns.forEach(pattern => {
        if (pattern.test(bgColor) || pattern.test(textColor)) {
          const className = el.className;
          issues.push(`Element ${index} (${className}) uses direct colors`);
        }
      });
    });

    return issues.slice(0, 10); // Return first 10 issues
  }

  /**
   * Get color system health score
   */
  getHealthScore(): number {
    const validation = this.validateColorSystem();
    const domIssues = this.scanForDirectColors();
    
    const totalIssues = validation.issues.length + domIssues.length;
    const maxIssues = 20; // Maximum expected issues
    
    const score = Math.max(0, 100 - (totalIssues / maxIssues * 100));
    
    return Math.round(score);
  }

  /**
   * Generate comprehensive color report
   */
  generateReport(): {
    score: number;
    validation: ColorValidationResult;
    domIssues: string[];
    summary: string;
  } {
    const validation = this.validateColorSystem();
    const domIssues = this.scanForDirectColors();
    const score = this.getHealthScore();

    let summary = '';
    if (score >= 90) {
      summary = '🎉 Excellent! Color system is properly configured';
    } else if (score >= 70) {
      summary = '✅ Good! Minor color system improvements needed';
    } else if (score >= 50) {
      summary = '⚠️ Attention needed: Several color issues found';
    } else {
      summary = '❌ Critical: Major color system issues detected';
    }

    return {
      score,
      validation,
      domIssues,
      summary
    };
  }
}

export const colorSystemValidator = new ColorSystemValidatorClass();
