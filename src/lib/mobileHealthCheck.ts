/**
 * Mobile Health Check Utility
 * Validates mobile optimizations are properly applied
 * Only runs in development mode
 */

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

const runHealthChecks = (): HealthCheckResult[] => {
  const results: HealthCheckResult[] = [];

  // Check Service Worker support
  results.push({
    name: 'Service Worker',
    status: 'serviceWorker' in navigator ? 'pass' : 'fail',
    details: 'serviceWorker' in navigator 
      ? 'Service Worker API available' 
      : 'Service Worker not supported'
  });

  // Check viewport height variable
  const vh = getComputedStyle(document.documentElement).getPropertyValue('--vh');
  results.push({
    name: 'Viewport Height',
    status: vh ? 'pass' : 'warning',
    details: vh ? `--vh is set to ${vh}` : '--vh custom property not set'
  });

  // Check safe area support
  const hasSafeArea = CSS.supports('padding-top: env(safe-area-inset-top)');
  results.push({
    name: 'Safe Area',
    status: hasSafeArea ? 'pass' : 'warning',
    details: hasSafeArea 
      ? 'Safe area insets supported' 
      : 'Safe area insets not supported (iOS only)'
  });

  // Check touch optimization
  const touchAction = getComputedStyle(document.body).touchAction;
  results.push({
    name: 'Touch Optimization',
    status: touchAction.includes('manipulation') ? 'pass' : 'warning',
    details: `touch-action: ${touchAction}`
  });

  // Check connection speed
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (connection) {
    results.push({
      name: 'Connection Speed',
      status: 'pass',
      details: `${connection.effectiveType?.toUpperCase() || 'Unknown'} - ${connection.downlink || 'N/A'} Mbps`
    });
  } else {
    results.push({
      name: 'Connection Speed',
      status: 'warning',
      details: 'Network Information API not available'
    });
  }

  // Check online status
  results.push({
    name: 'Online Status',
    status: navigator.onLine ? 'pass' : 'fail',
    details: navigator.onLine ? 'Online' : 'Offline'
  });

  // Check overscroll behavior
  const overscrollBehavior = getComputedStyle(document.body).overscrollBehavior;
  results.push({
    name: 'Overscroll',
    status: overscrollBehavior === 'none' ? 'pass' : 'warning',
    details: `overscroll-behavior: ${overscrollBehavior}`
  });

  return results;
};

export const displayHealthCheckResults = () => {
  // Only run in development
  if (!import.meta.env.DEV) return;

  setTimeout(() => {
    const results = runHealthChecks();
    
    console.group('📱 Mobile Health Check');
    console.table(results);
    
    const failCount = results.filter(r => r.status === 'fail').length;
    const warnCount = results.filter(r => r.status === 'warning').length;
    
    if (failCount > 0) {
      console.error(`❌ ${failCount} critical issue(s) found`);
    } else if (warnCount > 0) {
      console.warn(`⚠️ ${warnCount} warning(s) found`);
    } else {
      console.log('✅ All checks passed!');
    }
    
    console.groupEnd();
  }, 2000);
};

// Auto-run in dev mode
if (import.meta.env.DEV) {
  displayHealthCheckResults();
}
