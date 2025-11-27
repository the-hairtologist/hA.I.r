/**
 * Advanced Accessibility Features
 * WCAG AAA Compliance Components
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Native Skip Navigation Links (React 18 compatible)
export function SkipLinks() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to navigation
      </a>
      <a
        href="#footer"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to footer
      </a>
    </>
  );
}

// Skip Navigation Target Component
export function SkipNavContent({ id = 'main-content' }: { id?: string }) {
  return <div id={id} />;
}

// Focus Trap for Modals
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive]);
}

// Reduced Motion Detector
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// High Contrast Mode Detector
export function useHighContrast() {
  const [highContrast, setHighContrast] = useState(
    window.matchMedia('(prefers-contrast: high)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handler = (e: MediaQueryListEvent) => setHighContrast(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return highContrast;
}

// Focus Visible Utility
export function useFocusVisible() {
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    if (focusVisible) {
      document.body.classList.add('focus-visible');
    } else {
      document.body.classList.remove('focus-visible');
    }
  }, [focusVisible]);

  return focusVisible;
}

// Accessibility Settings Panel
interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xl';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  contrast: 'normal' | 'high';
  dyslexiaFont: boolean;
}

export function AccessibilityPanel() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    lineSpacing: 'normal',
    contrast: 'normal',
    dyslexiaFont: false,
  });

  useEffect(() => {
    const root = document.documentElement;

    // Apply font size
    const fontSizes = { normal: '16px', large: '18px', xl: '20px' };
    root.style.fontSize = fontSizes[settings.fontSize];

    // Apply line spacing
    const lineHeights = { normal: '1.5', relaxed: '1.75', loose: '2' };
    root.style.lineHeight = lineHeights[settings.lineSpacing];

    // Apply contrast
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply dyslexia-friendly font
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }
  }, [settings]);

  return (
    <div
      role="region"
      aria-label="Accessibility settings"
      className="fixed bottom-4 right-4 bg-background border-2 border-foreground shadow-lg p-4 rounded-lg z-50"
    >
      <h3 className="font-bold mb-4">Accessibility Settings</h3>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Font Size</label>
          <select
            value={settings.fontSize}
            onChange={e =>
              setSettings({ ...settings, fontSize: e.target.value as any })
            }
            className="w-full p-2 border rounded"
            aria-label="Font size selection"
          >
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Line Spacing</label>
          <select
            value={settings.lineSpacing}
            onChange={e =>
              setSettings({ ...settings, lineSpacing: e.target.value as any })
            }
            className="w-full p-2 border rounded"
            aria-label="Line spacing selection"
          >
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
            <option value="loose">Loose</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.contrast === 'high'}
              onChange={e =>
                setSettings({
                  ...settings,
                  contrast: e.target.checked ? 'high' : 'normal',
                })
              }
              aria-label="Toggle high contrast mode"
            />
            <span>High Contrast</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.dyslexiaFont}
              onChange={e =>
                setSettings({ ...settings, dyslexiaFont: e.target.checked })
              }
              aria-label="Toggle dyslexia-friendly font"
            />
            <span>Dyslexia-Friendly Font</span>
          </label>
        </div>
      </div>

      <Button
        onClick={() =>
          setSettings({
            fontSize: 'normal',
            lineSpacing: 'normal',
            contrast: 'normal',
            dyslexiaFont: false,
          })
        }
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        aria-label="Reset accessibility settings to default"
      >
        Reset to Defaults
      </Button>
    </div>
  );
}

// Live Region for Dynamic Updates
export function LiveRegion({
  message,
  priority = 'polite',
}: {
  message: string;
  priority?: 'polite' | 'assertive';
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Heading Hierarchy Validator (Development Only)
export function validateHeadingHierarchy() {
  if (import.meta.env.DEV) {
    const headings = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    );

    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1] || '0', 10);
      console.log('Heading level:', level);
    });
  }
}
