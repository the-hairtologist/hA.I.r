/**
 * Phase 2: Bundle Size Optimization
 * Tree-shaking, dependency analysis, unused code elimination
 */

/**
 * Lucide Icons - Tree-shakeable imports
 * ALWAYS import individually, NEVER from main package
 */

// ❌ BAD: Imports entire icon library (~500KB)
// import { Icon1, Icon2 } from 'lucide-react';

// ✅ GOOD: Tree-shakeable individual imports
// import Icon1 from 'lucide-react/dist/esm/icons/icon-1';
// import Icon2 from 'lucide-react/dist/esm/icons/icon-2';

/**
 * Date-fns - Tree-shakeable imports
 * ALWAYS import specific functions
 */

// ❌ BAD: Imports entire library
// import * as dateFns from 'date-fns';

// ✅ GOOD: Specific function imports
// import { format, addDays, startOfWeek } from 'date-fns';

/**
 * Lodash - Use lodash-es for tree-shaking
 */

// ❌ BAD: Imports entire library
// import _ from 'lodash';

// ✅ GOOD: Individual function imports
// import debounce from 'lodash-es/debounce';
// import throttle from 'lodash-es/throttle';

/**
 * Analyze bundle size
 */
export function analyzeBundleImpact() {
  if (process.env.NODE_ENV !== 'production') {
    console.info('📦 Bundle Analysis:');
    console.info('- Run `npm run build` to generate stats.html');
    console.info('- Check dist/stats.html for visual bundle analysis');
    console.info('- Look for large chunks and optimize imports');
  }
}

/**
 * Dependency audit checklist
 */
export const dependencyAudit = {
  // Heavy dependencies to watch
  heavy: [
    '@huggingface/transformers', // ~50MB - OK for AI features
    'recharts', // ~400KB - Charts only for analytics
    '@radix-ui/*', // ~200KB total - UI components
  ],
  
  // Tree-shakeable libraries
  treeShakeable: [
    'lucide-react', // Use individual imports
    'date-fns', // Use specific functions
    'lodash-es', // Use specific functions
  ],
  
  // Bundle size targets
  targets: {
    main: '< 200KB', // Main bundle
    vendor: '< 500KB', // Vendor chunk
    total: '< 1MB', // Total initial load
  },
};

/**
 * Dead code elimination patterns
 */
export const deadCodePatterns = {
  // Unused imports
  unusedImports: [
    'Check for imports never used',
    'Remove commented-out code',
    'Delete unused utility functions',
  ],
  
  // Duplicate code
  duplicates: [
    'Consolidate similar components',
    'Extract common logic to hooks',
    'Reuse existing utility functions',
  ],
  
  // Over-engineering
  unnecessary: [
    'Remove premature abstractions',
    'Delete unused feature flags',
    'Remove experimental code',
  ],
};

/**
 * Compression recommendations
 */
export const compressionSettings = {
  // Vite build compression
  build: {
    minify: 'esbuild',
    cssMinify: 'esbuild',
    target: 'es2020',
    sourcemap: false,
  },
  
  // Server compression (nginx/cloudflare)
  server: {
    gzip: true,
    brotli: true, // Better compression than gzip
    level: 6, // Balance between speed and size
  },
};

/**
 * Module preloading strategy
 */
export function preloadCriticalModules() {
  // Preload critical chunks
  const criticalChunks = [
    '/assets/react-[hash].js',
    '/assets/react-dom-[hash].js',
    '/assets/react-router-[hash].js',
  ];
  
  if ('modulepreload' in HTMLLinkElement.prototype) {
    criticalChunks.forEach(chunk => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = chunk;
      document.head.appendChild(link);
    });
  }
}

/**
 * Bundle size monitoring
 */
export class BundleSizeMonitor {
  private static maxSize = 1024 * 1024; // 1MB
  
  static check() {
    if (process.env.NODE_ENV === 'production') {
      const performanceEntry = performance.getEntriesByType('resource')
        .filter(r => r.name.includes('.js'));
      
      const totalSize = performanceEntry.reduce((sum, entry) => {
        return sum + (entry as any).transferSize || 0;
      }, 0);
      
      if (totalSize > this.maxSize) {
        console.warn(`⚠️ Bundle size (${Math.round(totalSize / 1024)}KB) exceeds target (${Math.round(this.maxSize / 1024)}KB)`);
      }
    }
  }
}
