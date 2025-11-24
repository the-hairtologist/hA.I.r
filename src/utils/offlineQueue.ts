// Offline queue for mutations when no connection

interface QueuedMutation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineQueue {
  private queue: QueuedMutation[] = [];
  private dbName = 'hair-app-offline';
  private storeName = 'mutations';
  private db: IDBDatabase | null = null;
  private syncing = false;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadQueue();
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  private async loadQueue() {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      this.queue = request.result || [];
    };
  }

  async add(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retries'>) {
    const queuedMutation: QueuedMutation = {
      ...mutation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queuedMutation);

    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.add(queuedMutation);
    }

    return queuedMutation.id;
  }

  async sync() {
    if (this.syncing || this.queue.length === 0) return;

    this.syncing = true;
    const mutations = [...this.queue];

    for (const mutation of mutations) {
      try {
        // Attempt to sync mutation
        // In real implementation, would call supabase here
        console.log('Syncing mutation:', mutation);

        // Remove from queue on success
        await this.remove(mutation.id);
      } catch (error) {
        console.error('Sync failed for mutation:', mutation.id, error);

        // Increment retries
        mutation.retries++;

        // Remove if max retries exceeded
        if (mutation.retries > 3) {
          await this.remove(mutation.id);
        }
      }
    }

    this.syncing = false;
  }

  private async remove(id: string) {
    this.queue = this.queue.filter(m => m.id !== id);

    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.delete(id);
    }
  }

  getQueueSize() {
    return this.queue.length;
  }

  isSyncing() {
    return this.syncing;
  }
}

export const offlineQueue = new OfflineQueue();

// Initialize on load
if (typeof window !== 'undefined') {
  offlineQueue.init();
}
