import { supabase } from "@/integrations/supabase/client";

export interface QueuedAction {
  id: string;
  type: 'insert' | 'update' | 'delete' | 'upload';
  table: string;
  data: any;
  userId: string;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

const QUEUE_KEY = 'offline_action_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MAX_QUEUE_AGE_DAYS = 30; // Auto-cleanup old items

class OfflineQueue {
  private queue: QueuedAction[] = [];
  private processing = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        this.cleanupOldItems();
        logger.info(`Loaded ${this.queue.length} queued actions`);
...
      logger.info(`Cleaned up ${originalLength - this.queue.length} old queued items`);
      this.saveQueue();
    }
  }

  /**
   * Clear all queue data (call on logout)
   */
  public clearOnLogout() {
    console.log('Clearing offline queue on logout');
    this.queue = [];
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
    this.notifyListeners();
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('Network restored, processing queue...');
      this.processQueue();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  enqueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>) {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    this.queue.push(queuedAction);
    this.saveQueue();

    console.log(`Enqueued ${action.type} action for ${action.table}`, queuedAction);

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return queuedAction.id;
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.processing = true;
    console.log(`Processing ${this.queue.length} queued actions...`);

    const pendingActions = this.queue.filter(a => a.status === 'pending');

    for (const action of pendingActions) {
      try {
        action.status = 'processing';
        this.saveQueue();

        await this.executeAction(action);

        action.status = 'completed';
        console.log(`✓ Completed action ${action.id}`);
      } catch (error: any) {
        action.retryCount++;
        
        if (action.retryCount >= MAX_RETRIES) {
          action.status = 'failed';
          action.error = error.message;
          console.error(`✗ Action ${action.id} failed after ${MAX_RETRIES} retries:`, error);
        } else {
          action.status = 'pending';
          console.warn(`⚠ Action ${action.id} failed, retry ${action.retryCount}/${MAX_RETRIES}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }

      this.saveQueue();
    }

    // Remove completed actions
    this.queue = this.queue.filter(a => a.status !== 'completed');
    this.saveQueue();

    this.processing = false;
    console.log(`Queue processing complete. ${this.queue.length} actions remaining.`);
  }

  private async executeAction(action: QueuedAction) {
    switch (action.type) {
      case 'insert':
        return this.executeInsert(action);
      case 'update':
        return this.executeUpdate(action);
      case 'delete':
        return this.executeDelete(action);
      case 'upload':
        return this.executeUpload(action);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeInsert(action: QueuedAction) {
    const { error } = await supabase
      .from(action.table as any)
      .insert(action.data);

    if (error) throw error;
  }

  private async executeUpdate(action: QueuedAction) {
    const { id, ...updateData } = action.data;
    
    const { error } = await supabase
      .from(action.table as any)
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  }

  private async executeDelete(action: QueuedAction) {
    const { error } = await supabase
      .from(action.table as any)
      .delete()
      .eq('id', action.data.id);

    if (error) throw error;
  }

  private async executeUpload(action: QueuedAction) {
    const { bucket, path, file } = action.data;
    
    // Convert base64 back to blob
    const response = await fetch(file);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, {
        upsert: true
      });

    if (error) throw error;
  }

  getQueue() {
    return [...this.queue];
  }

  getPendingCount() {
    return this.queue.filter(a => a.status === 'pending').length;
  }

  getFailedCount() {
    return this.queue.filter(a => a.status === 'failed').length;
  }

  clearCompleted() {
    this.queue = this.queue.filter(a => a.status !== 'completed');
    this.saveQueue();
  }

  clearAll() {
    this.queue = [];
    localStorage.removeItem(QUEUE_KEY);
    this.notifyListeners();
  }

  retryFailed() {
    this.queue = this.queue.map(action => {
      if (action.status === 'failed') {
        return {
          ...action,
          status: 'pending' as const,
          retryCount: 0,
          error: undefined
        };
      }
      return action;
    });
    this.saveQueue();
    this.processQueue();
  }
}

export const offlineQueue = new OfflineQueue();
