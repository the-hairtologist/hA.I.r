/**
 * Performance utilities for data fetching
 */

/**
 * Batch multiple async operations with a delay between each
 * Prevents overwhelming the server with simultaneous requests
 */
export async function batchFetch<T>(
  operations: (() => Promise<T>)[],
  delayMs = 50
): Promise<T[]> {
  const results: T[] = [];
  
  for (const operation of operations) {
    const result = await operation();
    results.push(result);
    
    // Small delay between requests
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), waitMs);
  };
}

/**
 * Simple in-memory cache for expensive operations
 */
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number;

  constructor(ttlMinutes = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}

export const dataCache = new DataCache();

/**
 * Memoize expensive function results
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getCacheKey: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = getCacheKey(...args);
    const cached = dataCache.get(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const result = fn(...args);
    dataCache.set(key, result);
    return result;
  }) as T;
}
