/**
 * Offline Write Queue - Phase 2: Intelligence Layer
 * Saves user actions offline and syncs when connection restored
 */

import { supabase } from "@/integrations/supabase/client";

export interface QueuedOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  userId?: string;
}

export interface QueueStatus {
  pending: number;
  failed: number;
  synced: number;
  lastSyncAttempt?: Date;
}

class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueuedOperation[] = [];
  private storageKey = 'hair_ai_offline_queue';
  private syncing = false;
  private listeners: Set<(status: QueueStatus) => void> = new Set();

  private constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  /**
   * Add operation to queue
   */
  add(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): void {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: operation.maxRetries || 3
    };

    this.queue.push(queuedOp);
    this.saveQueue();
    this.notifyListeners();

    console.log('📝 Queued offline operation:', queuedOp.type, queuedOp.table);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.sync();
    }
  }

  /**
   * Subscribe to queue status changes
   */
  subscribe(callback: (status: QueueStatus) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStatus());
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current queue status
   */
  getStatus(): QueueStatus {
    return {
      pending: this.queue.length,
      failed: this.queue.filter(op => op.retryCount >= op.maxRetries).length,
      synced: 0,
      lastSyncAttempt: undefined
    };
  }

  /**
   * Sync queue with server
   */
  async sync(): Promise<void> {
    if (this.syncing || this.queue.length === 0) return;
    if (!navigator.onLine) {
      console.log('⚠️ Offline - skipping sync');
      return;
    }

    this.syncing = true;
    console.log('🔄 Syncing offline queue...', this.queue.length, 'operations');

    const operations = [...this.queue];
    const results: { success: boolean; operation: QueuedOperation }[] = [];

    for (const op of operations) {
      try {
        const success = await this.executeOperation(op);
        results.push({ success, operation: op });

        if (success) {
          // Remove from queue
          this.queue = this.queue.filter(q => q.id !== op.id);
        } else {
          // Increment retry count
          const queuedOp = this.queue.find(q => q.id === op.id);
          if (queuedOp) {
            queuedOp.retryCount++;
          }
        }
      } catch (error) {
        console.error('❌ Sync failed for operation:', op, error);
        const queuedOp = this.queue.find(q => q.id === op.id);
        if (queuedOp) {
          queuedOp.retryCount++;
        }
      }
    }

    this.saveQueue();
    this.syncing = false;
    this.notifyListeners();

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Sync complete: ${successCount}/${operations.length} operations synced`);
  }

  /**
   * Execute a single operation
   */
  private async executeOperation(op: QueuedOperation): Promise<boolean> {
    try {
      let result;

      switch (op.type) {
        case 'insert':
          result = await (supabase as any).from(op.table).insert(op.data);
          break;
        case 'update':
          result = await (supabase as any).from(op.table).update(op.data).eq('id', op.data.id);
          break;
        case 'delete':
          result = await (supabase as any).from(op.table).delete().eq('id', op.data.id);
          break;
      }

      if (result.error) {
        console.error('Operation failed:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Execute operation error:', error);
      return false;
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log('📂 Loaded offline queue:', this.queue.length, 'operations');
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Setup online/offline listeners
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Back online - syncing queue');
      this.sync();
    });

    window.addEventListener('offline', () => {
      console.log('📡 Offline - operations will be queued');
    });
  }

  /**
   * Notify status listeners
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Clear all failed operations
   */
  clearFailed(): void {
    this.queue = this.queue.filter(op => op.retryCount < op.maxRetries);
    this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Clear entire queue
   */
  clearAll(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyListeners();
  }
}

export const offlineQueue = OfflineQueue.getInstance();

/**
 * Helper to wrap Supabase operations with offline support
 */
export function withOfflineSupport<T>(
  operation: () => Promise<T>,
  fallback: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>
): Promise<T> {
  if (navigator.onLine) {
    return operation();
  } else {
    offlineQueue.add(fallback);
    return Promise.resolve(null as T);
  }
}
