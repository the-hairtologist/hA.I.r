/**
 * Accessibility Testing Utility (Development Only)
 * Helps developers identify and fix accessibility issues
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface A11yIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  element: string;
  message: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export const A11yTester = () => {
  const [issues, setIssues] = useState<A11yIssue[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Define all hooks before any conditional returns
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  const runA11yAudit = () => {
    setIsScanning(true);
    const foundIssues: A11yIssue[] = [];

    // Check for images without alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt || img.alt.trim() === '') {
        foundIssues.push({
          id: `img-${index}`,
          type: 'error',
          element: `<img src="${img.src.substring(0, 50)}...">`,
          message: 'Image missing alt text',
          wcagLevel: 'A',
        });
      }
    });

    // Check for buttons without accessible names
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, index) => {
      const hasText = btn.textContent?.trim() !== '';
      const hasAriaLabel = btn.getAttribute('aria-label');
      const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');

      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
        foundIssues.push({
          id: `btn-${index}`,
          type: 'error',
          element: `<button class="${btn.className}">`,
          message: 'Button missing accessible name',
          wcagLevel: 'A',
        });
      }
    });

    // Check for links without accessible names
    const links = document.querySelectorAll('a');
    links.forEach((link, index) => {
      const hasText = link.textContent?.trim() !== '';
      const hasAriaLabel = link.getAttribute('aria-label');

      if (!hasText && !hasAriaLabel) {
        foundIssues.push({
          id: `link-${index}`,
          type: 'error',
          element: `<a href="${link.href}">`,
          message: 'Link missing accessible name',
          wcagLevel: 'A',
        });
      }
    });

    // Check for form inputs without labels
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        foundIssues.push({
          id: `input-${index}`,
          type: 'error',
          element: `<${input.tagName.toLowerCase()} type="${input.getAttribute('type')}">`,
          message: 'Form control missing label',
          wcagLevel: 'A',
        });
      }
    });

    // Check for headings hierarchy
    const headings = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    );
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      if (lastLevel && level > lastLevel + 1) {
        foundIssues.push({
          id: `heading-${index}`,
          type: 'warning',
          element: `<${heading.tagName.toLowerCase()}>`,
          message: `Heading hierarchy skipped from H${lastLevel} to H${level}`,
          wcagLevel: 'A',
        });
      }
      lastLevel = level;
    });

    // Check for touch target sizes (mobile)
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea'
    );
    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // WCAG 2.2 AA requirement

      if (rect.width < minSize || rect.height < minSize) {
        foundIssues.push({
          id: `touch-${index}`,
          type: 'warning',
          element: `<${element.tagName.toLowerCase()}>`,
          message: `Touch target too small (${Math.round(rect.width)}x${Math.round(rect.height)}px). Should be at least 44x44px`,
          wcagLevel: 'AA',
        });
      }
    });

    setIssues(foundIssues);
    setIsScanning(false);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50"
        variant="outline"
        size="icon"
        title="Open A11y Tester (Ctrl+Shift+A)"
      >
        <Eye className="h-4 w-4" />
      </Button>
    );
  }

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-96 max-h-[80vh] overflow-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">A11y Tester</CardTitle>
            <CardDescription>WCAG 2.2 AA Compliance Check</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={runA11yAudit}
            disabled={isScanning}
            className="flex-1"
          >
            {isScanning ? 'Scanning...' : 'Run Audit'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIssues([])}
            disabled={issues.length === 0}
          >
            Clear
          </Button>
        </div>

        {issues.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                {errorCount} Errors
              </Badge>
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {warningCount} Warnings
              </Badge>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-auto">
              {issues.map(issue => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-md border ${
                    issue.type === 'error'
                      ? 'border-destructive bg-destructive/10'
                      : 'border-warning bg-warning/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-mono text-xs mb-1 text-muted-foreground">
                        {issue.element}
                      </div>
                      <div className="text-sm">{issue.message}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {issue.wcagLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {issues.length === 0 && !isScanning && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>Click "Run Audit" to scan for issues</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
