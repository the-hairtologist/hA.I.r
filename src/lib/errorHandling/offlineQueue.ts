/**
 * Offline Queue System
 * Queues failed operations and retries them when connection is restored
 */

import { logger } from '@/lib/logger';

export interface QueuedOperation {
  id: string;
  operation: () => Promise<any>;
  timestamp: number;
  retryCount: number;
  priority: number;
  metadata?: Record<string, any>;
}

class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private maxRetries = 3;
  private storageKey = 'offline_queue';

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Add operation to queue
   */
  enqueue(
    operation: () => Promise<any>,
    priority: number = 5,
    metadata?: Record<string, any>
  ): string {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedOp: QueuedOperation = {
      id,
      operation,
      timestamp: Date.now(),
      retryCount: 0,
      priority,
      metadata,
    };

    this.queue.push(queuedOp);
    this.sortQueue();
    this.saveQueue();
    
    logger.info('Operation queued for offline processing', 'OfflineQueue', {
      id,
      priority,
      queueSize: this.queue.length,
    });

    return id;
  }

  /**
   * Process the queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    if (!navigator.onLine) {
      logger.debug('Waiting for online connection to process queue', 'OfflineQueue');
      return;
    }

    this.isProcessing = true;
    logger.info('Starting offline queue processing', 'OfflineQueue', {
      queueSize: this.queue.length,
    });

    while (this.queue.length > 0) {
      const item = this.queue[0];

      try {
        await item.operation();
        
        // Success - remove from queue
        this.queue.shift();
        this.saveQueue();
        
        logger.info('Offline operation completed', 'OfflineQueue', {
          id: item.id,
          remaining: this.queue.length,
        });
      } catch (error) {
        logger.warn('Offline operation failed', 'OfflineQueue', {
          id: item.id,
          retryCount: item.retryCount,
          error,
        });

        item.retryCount++;

        if (item.retryCount >= this.maxRetries) {
          // Max retries reached - remove from queue
          this.queue.shift();
          logger.error('Offline operation failed permanently', 'OfflineQueue', {
            id: item.id,
          });
        } else {
          // Move to end of queue and try again later
          this.queue.shift();
          this.queue.push(item);
        }

        this.saveQueue();
      }

      // Small delay between operations
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
    logger.info('Offline queue processing complete', 'OfflineQueue');
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      size: this.queue.length,
      isProcessing: this.isProcessing,
      isOnline: navigator.onLine,
      oldestOperation: this.queue[0]?.timestamp,
    };
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
    logger.info('Offline queue cleared', 'OfflineQueue');
  }

  /**
   * Sort queue by priority (higher priority first)
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      // Store metadata only, not the actual functions
      const serializable = this.queue.map((item) => ({
        id: item.id,
        timestamp: item.timestamp,
        retryCount: item.retryCount,
        priority: item.priority,
        metadata: item.metadata,
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(serializable));
    } catch (error) {
      logger.error('Failed to save offline queue', 'OfflineQueue', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        // Note: Functions can't be serialized, so this just loads metadata
        // Actual operations need to be re-registered by the app
        logger.debug('Offline queue metadata loaded', 'OfflineQueue');
      }
    } catch (error) {
      logger.error('Failed to load offline queue', 'OfflineQueue', error);
    }
  }

  /**
   * Setup listener for online/offline events
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      logger.info('Connection restored, processing offline queue', 'OfflineQueue');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      logger.info('Connection lost, operations will be queued', 'OfflineQueue');
    });
  }
}

export const offlineQueue = new OfflineQueue();
