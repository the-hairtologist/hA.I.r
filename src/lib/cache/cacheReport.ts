/**
 * Cache Report Generator - Phase 2: Intelligence Layer
 * Generates detailed cache analytics and cleanup recommendations
 */

export interface CacheEntry {
  name: string;
  type: 'cache-storage' | 'service-worker' | 'localStorage' | 'indexedDB';
  size: number;
  entries: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

export interface CacheReport {
  total: {
    caches: number;
    totalSize: number;
    totalEntries: number;
  };
  breakdown: CacheEntry[];
  recommendations: string[];
  timestamp: Date;
  version?: string;
}

/**
 * Get size of localStorage
 */
function getLocalStorageSize(): number {
  let size = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      size += localStorage[key].length + key.length;
    }
  }
  return size * 2; // UTF-16 encoding
}

/**
 * Get Cache API details
 */
async function getCacheStorageDetails(): Promise<CacheEntry[]> {
  if (!('caches' in window)) return [];

  const cacheNames = await caches.keys();
  const entries: CacheEntry[] = [];

  for (const name of cacheNames) {
    try {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      // Estimate size (rough calculation)
      let estimatedSize = 0;
      const responses = await Promise.all(
        keys.slice(0, 10).map(req => cache.match(req))
      );
      
      for (const response of responses) {
        if (response) {
          const blob = await response.blob();
          estimatedSize += blob.size;
        }
      }

      // Extrapolate for all entries
      const avgSize = estimatedSize / responses.length || 0;
      const totalSize = avgSize * keys.length;

      entries.push({
        name,
        type: 'cache-storage',
        size: totalSize,
        entries: keys.length
      });
    } catch (error) {
      console.error(`Failed to analyze cache ${name}:`, error);
    }
  }

  return entries;
}

/**
 * Generate comprehensive cache report
 */
export async function generateCacheReport(): Promise<CacheReport> {
  const breakdown: CacheEntry[] = [];
  const recommendations: string[] = [];

  // Cache Storage
  const cacheStorageEntries = await getCacheStorageDetails();
  breakdown.push(...cacheStorageEntries);

  // localStorage
  const localStorageSize = getLocalStorageSize();
  breakdown.push({
    name: 'localStorage',
    type: 'localStorage',
    size: localStorageSize,
    entries: Object.keys(localStorage).length
  });

  // Calculate totals
  const totalSize = breakdown.reduce((sum, entry) => sum + entry.size, 0);
  const totalEntries = breakdown.reduce((sum, entry) => sum + entry.entries, 0);

  // Generate recommendations
  if (totalSize > 50 * 1024 * 1024) { // 50MB
    recommendations.push('Total cache exceeds 50MB - consider aggressive cleanup');
  }

  if (localStorageSize > 5 * 1024 * 1024) { // 5MB
    recommendations.push('localStorage approaching limit - archive old data');
  }

  const oldCaches = cacheStorageEntries.filter(c => 
    c.name.includes('workbox-precache') || 
    c.name.includes('google-fonts')
  );
  
  if (oldCaches.length > 3) {
    recommendations.push(`Found ${oldCaches.length} versioned caches - cleanup old versions`);
  }

  // Check for stale data
  if (breakdown.some(e => e.entries > 500)) {
    recommendations.push('Some caches have 500+ entries - enable auto-cleanup');
  }

  return {
    total: {
      caches: breakdown.length,
      totalSize,
      totalEntries
    },
    breakdown,
    recommendations,
    timestamp: new Date(),
    version: '1.0'
  };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Log cache report to console
 */
export async function logCacheReport(): Promise<void> {
  const report = await generateCacheReport();

  console.group('💾 Cache Storage Report');
  console.log(`Total Caches: ${report.total.caches}`);
  console.log(`Total Size: ${formatBytes(report.total.totalSize)}`);
  console.log(`Total Entries: ${report.total.totalEntries}`);
  console.log(`Generated: ${report.timestamp.toLocaleString()}`);

  console.group('📊 Breakdown');
  report.breakdown.forEach(entry => {
    console.log(`${entry.name}:`);
    console.log(`  Type: ${entry.type}`);
    console.log(`  Size: ${formatBytes(entry.size)}`);
    console.log(`  Entries: ${entry.entries}`);
  });
  console.groupEnd();

  if (report.recommendations.length > 0) {
    console.group('💡 Recommendations');
    report.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  }

  console.groupEnd();
}

/**
 * Initialize cache reporting
 */
export function initCacheReporting(): void {
  if (import.meta.env.PROD) return;

  (window as any).__cacheReport = logCacheReport;
  console.log('💡 Run __cacheReport() to see cache analytics');
}

/**
 * Clean up old caches
 */
export async function cleanupOldCaches(keepLatest = 2): Promise<number> {
  if (!('caches' in window)) return 0;

  const cacheNames = await caches.keys();
  const grouped = new Map<string, string[]>();

  // Group by base name (remove version suffix)
  cacheNames.forEach(name => {
    const baseName = name.replace(/-v?\d+$/, '');
    if (!grouped.has(baseName)) {
      grouped.set(baseName, []);
    }
    grouped.get(baseName)!.push(name);
  });

  let deleted = 0;

  // Keep only latest versions
  for (const [baseName, versions] of grouped) {
    if (versions.length <= keepLatest) continue;

    versions.sort().reverse(); // Newest first
    const toDelete = versions.slice(keepLatest);

    for (const cacheName of toDelete) {
      await caches.delete(cacheName);
      deleted++;
      console.log(`🗑️ Deleted old cache: ${cacheName}`);
    }
  }

  return deleted;
}
