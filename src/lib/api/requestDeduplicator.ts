/**
 * Request Deduplicator
 * Prevents duplicate simultaneous requests by sharing pending promises
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly timeout = 30000; // 30 second timeout

  /**
   * Execute a request, or return existing promise if already in flight
   */
  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    const existing = this.pendingRequests.get(key);

    if (existing) {
      // Check if request hasn't timed out
      if (Date.now() - existing.timestamp < this.timeout) {
        return existing.promise;
      } else {
        // Request timed out, remove it
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    const promise = requestFn()
      .then(result => {
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Clear a specific request from cache
   */
  clear(key: string): void {
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    this.pendingRequests.clear();
  }

  /**
   * Get number of pending requests
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Clean up timed out requests
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp >= this.timeout) {
        this.pendingRequests.delete(key);
      }
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Clean up timed out requests every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestDeduplicator.cleanup();
  }, 60000);
}
