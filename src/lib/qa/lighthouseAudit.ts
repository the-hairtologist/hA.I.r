/**
 * Lighthouse CI Integration - Phase 5: Maintenance & QA
 * Automated performance and quality monitoring
 */

export interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
}

export interface LighthouseBudget {
  metric: keyof LighthouseScore;
  threshold: number;
}

export const LIGHTHOUSE_BUDGETS: LighthouseBudget[] = [
  { metric: 'performance', threshold: 90 },
  { metric: 'accessibility', threshold: 95 },
  { metric: 'bestPractices', threshold: 90 },
  { metric: 'seo', threshold: 95 },
  { metric: 'pwa', threshold: 85 }
];

/**
 * Check if scores meet budgets
 */
export function checkBudgets(scores: LighthouseScore): {
  passing: boolean;
  violations: Array<{ metric: string; score: number; threshold: number; delta: number }>;
} {
  const violations: Array<{ metric: string; score: number; threshold: number; delta: number }> = [];

  LIGHTHOUSE_BUDGETS.forEach(budget => {
    const score = scores[budget.metric];
    if (score < budget.threshold) {
      violations.push({
        metric: budget.metric,
        score,
        threshold: budget.threshold,
        delta: budget.threshold - score
      });
    }
  });

  return {
    passing: violations.length === 0,
    violations
  };
}

/**
 * Format Lighthouse report for console
 */
export function formatLighthouseReport(scores: LighthouseScore): void {
  console.group('🏆 Lighthouse Scores');
  
  const metrics: Array<{ name: string; key: keyof LighthouseScore; emoji: string }> = [
    { name: 'Performance', key: 'performance', emoji: '⚡' },
    { name: 'Accessibility', key: 'accessibility', emoji: '♿' },
    { name: 'Best Practices', key: 'bestPractices', emoji: '✅' },
    { name: 'SEO', key: 'seo', emoji: '🔍' },
    { name: 'PWA', key: 'pwa', emoji: '📱' }
  ];

  metrics.forEach(({ name, key, emoji }) => {
    const score = scores[key];
    const budget = LIGHTHOUSE_BUDGETS.find(b => b.metric === key);
    const status = budget && score >= budget.threshold ? '✅' : '⚠️';
    
    console.log(`${emoji} ${name}: ${score}/100 ${status}`);
  });

  const result = checkBudgets(scores);
  
  if (!result.passing) {
    console.group('❌ Budget Violations');
    result.violations.forEach(v => {
      console.log(`${v.metric}: ${v.score}/100 (needs ${v.threshold}, ${v.delta} points short)`);
    });
    console.groupEnd();
  }

  console.groupEnd();
}

/**
 * Generate Lighthouse audit script for CI/CD
 */
export function generateLighthouseCI(): string {
  return `# Lighthouse CI Configuration
# Add this to your CI/CD pipeline (GitHub Actions, GitLab CI, etc.)

name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:8080
            http://localhost:8080/dashboard
            http://localhost:8080/appointments
          budgetPath: .lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true

# .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:8080"]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:pwa": ["warn", { "minScore": 0.85 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}`;
}

/**
 * Simulate Lighthouse audit (dev tool)
 */
export async function simulateLighthouseAudit(): Promise<LighthouseScore> {
  // Simulate audit by checking various metrics
  const scores: LighthouseScore = {
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
    pwa: 0
  };

  // Performance checks
  const perfEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (perfEntry) {
    const lcp = perfEntry.loadEventEnd - perfEntry.fetchStart;
    scores.performance = Math.max(0, Math.min(100, 100 - (lcp / 50))); // Simple approximation
  }

  // Accessibility checks
  const hasAlt = document.querySelectorAll('img:not([alt])').length === 0;
  const hasLang = document.documentElement.hasAttribute('lang');
  const hasAriaLabels = document.querySelectorAll('button, a').length === 
                       document.querySelectorAll('button[aria-label], a[aria-label]').length;
  scores.accessibility = (hasAlt ? 33 : 0) + (hasLang ? 33 : 0) + (hasAriaLabels ? 34 : 0);

  // Best practices checks
  const hasHttps = window.location.protocol === 'https:';
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
  scores.bestPractices = (hasHttps ? 33 : 0) + (hasServiceWorker ? 33 : 0) + (hasManifest ? 34 : 0);

  // SEO checks
  const hasTitle = document.title.length > 0;
  const hasMetaDesc = document.querySelector('meta[name="description"]') !== null;
  const hasViewport = document.querySelector('meta[name="viewport"]') !== null;
  scores.seo = (hasTitle ? 33 : 0) + (hasMetaDesc ? 33 : 0) + (hasViewport ? 34 : 0);

  // PWA checks
  const hasSW = 'serviceWorker' in navigator && await navigator.serviceWorker.getRegistration();
  const hasManifestPWA = hasManifest;
  const hasIcons = document.querySelectorAll('link[rel="icon"]').length > 0;
  scores.pwa = (hasSW ? 33 : 0) + (hasManifestPWA ? 33 : 0) + (hasIcons ? 34 : 0);

  return scores;
}

/**
 * Initialize Lighthouse monitoring
 */
export async function initLighthouseMonitoring(): Promise<void> {
  if (import.meta.env.PROD) return;

  // Run audit after page load
  window.addEventListener('load', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for metrics
    
    const scores = await simulateLighthouseAudit();
    formatLighthouseReport(scores);
    
    const result = checkBudgets(scores);
    if (!result.passing) {
      console.warn('⚠️ Lighthouse budgets not met - see violations above');
    }
  });

  (window as any).__lighthouse = async () => {
    const scores = await simulateLighthouseAudit();
    formatLighthouseReport(scores);
    return scores;
  };
  
  (window as any).__lighthouseCI = () => {
    console.log(generateLighthouseCI());
  };
  
  console.log('💡 Run __lighthouse() for audit or __lighthouseCI() for CI config');
}
