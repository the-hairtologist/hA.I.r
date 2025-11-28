import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type QueuedActionStatus =
  | 'pending'
  | 'processing'
  | 'failed'
  | 'completed';

interface BaseQueuedAction {
  id: string;
  table: string;
  userId: string;
  timestamp: number;
  retryCount: number;
  status: QueuedActionStatus;
  error?: string;
}

export type InsertAction = BaseQueuedAction & {
  type: 'insert';
  data: Record<string, unknown>;
};

export type UpdateAction = BaseQueuedAction & {
  type: 'update';
  data: Record<string, unknown> & { id: string | number };
};

export type DeleteAction = BaseQueuedAction & {
  type: 'delete';
  data: { id: string | number };
};

export interface UploadActionData {
  bucket: string;
  path: string;
  file: string;
}

export type UploadAction = BaseQueuedAction & {
  type: 'upload';
  data: UploadActionData;
};

export type QueuedAction =
  | InsertAction
  | UpdateAction
  | DeleteAction
  | UploadAction;

export type EnqueuePayload =
  | Pick<InsertAction, 'type' | 'table' | 'data' | 'userId'>
  | Pick<UpdateAction, 'type' | 'table' | 'data' | 'userId'>
  | Pick<DeleteAction, 'type' | 'table' | 'data' | 'userId'>
  | Pick<UploadAction, 'type' | 'table' | 'data' | 'userId'>;

const QUEUE_KEY = 'offline_action_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MAX_QUEUE_AGE_DAYS = 30;

const isQueuedActionArray = (value: unknown): value is QueuedAction[] => {
  return Array.isArray(value);
};

const toError = (possibleError: unknown): Error => {
  if (possibleError instanceof Error) {
    return possibleError;
  }
  return new Error(String(possibleError));
};

class OfflineQueue {
  private queue: QueuedAction[] = [];
  private processing = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    this.loadQueue();
    this.setupOnlineListener();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isQueuedActionArray(parsed)) {
          this.queue = parsed;
          this.cleanupOldItems();
          logger.info(
            `Loaded ${this.queue.length} queued actions`,
            'offlineQueue'
          );
        } else {
          logger.warn(
            'Stored offline queue had unexpected shape; clearing queue',
            'offlineQueue'
          );
          this.queue = [];
          this.saveQueue();
        }
      }
    } catch (error) {
      logger.error(
        'Failed to load offline queue',
        'offlineQueue',
        toError(error)
      );
    }
  }

  private cleanupOldItems() {
    const cutoffTime = Date.now() - MAX_QUEUE_AGE_DAYS * 24 * 60 * 60 * 1000;
    const originalLength = this.queue.length;
    this.queue = this.queue.filter(item => item.timestamp > cutoffTime);

    if (originalLength !== this.queue.length) {
      logger.info(
        `Cleaned up ${originalLength - this.queue.length} old queued items`,
        'offlineQueue'
      );
      this.saveQueue();
    }
  }

  public clearOnLogout() {
    logger.info('Clearing offline queue on logout', 'offlineQueue');
    this.queue = [];
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch (error) {
      logger.error(
        'Failed to clear offline queue',
        'offlineQueue',
        toError(error)
      );
    }
    this.notifyListeners();
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      logger.error(
        'Failed to save offline queue',
        'offlineQueue',
        toError(error)
      );
    }
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      logger.info('Network restored, processing queue...', 'offlineQueue');
      void this.processQueue();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  enqueue(action: EnqueuePayload) {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    this.queue.push(queuedAction);
    this.saveQueue();

    logger.debug(
      `Enqueued ${action.type} action for ${action.table}`,
      'offlineQueue',
      {
        id: queuedAction.id,
        type: action.type,
        table: action.table,
      }
    );

    if (navigator.onLine) {
      void this.processQueue();
    }

    return queuedAction.id;
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.processing = true;
    logger.info(
      `Processing ${this.queue.length} queued actions...`,
      'offlineQueue'
    );

    const pendingActions = this.queue.filter(
      action => action.status === 'pending'
    );

    for (const action of pendingActions) {
      try {
        action.status = 'processing';
        this.saveQueue();

        await this.executeAction(action);

        action.status = 'completed';
        logger.debug(`Completed action ${action.id}`, 'offlineQueue');
      } catch (error) {
        const err = toError(error);
        action.retryCount += 1;

        if (action.retryCount >= MAX_RETRIES) {
          action.status = 'failed';
          action.error = err.message;
          logger.error(
            `Action ${action.id} failed after ${MAX_RETRIES} retries`,
            'offlineQueue',
            err
          );
        } else {
          action.status = 'pending';
          logger.warn(
            `Action ${action.id} failed, retry ${action.retryCount}/${MAX_RETRIES}`,
            'offlineQueue'
          );
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }

      this.saveQueue();
    }

    this.queue = this.queue.filter(action => action.status !== 'completed');
    this.saveQueue();

    this.processing = false;
    logger.info(
      `Queue processing complete. ${this.queue.length} actions remaining.`,
      'offlineQueue'
    );
  }

  private executeAction(action: QueuedAction) {
    switch (action.type) {
      case 'insert':
        return this.executeInsert(action);
      case 'update':
        return this.executeUpdate(action);
      case 'delete':
        return this.executeDelete(action);
      case 'upload':
        return this.executeUpload(action);
      default: {
        const exhaustiveCheck: never = action;
        throw new Error(`Unknown action type: ${exhaustiveCheck}`);
      }
    }
  }

  private async executeInsert(action: InsertAction) {
    const { error } = await supabase
      .from(action.table as any)
      .insert(action.data as any);

    if (error) throw error;
  }

  private async executeUpdate(action: UpdateAction) {
    const { id, ...updateData } = action.data;

    const { error } = await supabase
      .from(action.table as any)
      .update(updateData as any)
      .eq('id', String(id));

    if (error) throw error;
  }

  private async executeDelete(action: DeleteAction) {
    const { error } = await supabase
      .from(action.table as any)
      .delete()
      .eq('id', String(action.data.id));

    if (error) throw error;
  }

  private async executeUpload(action: UploadAction) {
    const { bucket, path, file } = action.data;

    const response = await fetch(file);
    const blob = await response.blob();

    const { error } = await supabase.storage.from(bucket).upload(path, blob, {
      upsert: true,
    });

    if (error) throw error;
  }

  getQueue() {
    return [...this.queue];
  }

  getPendingCount() {
    return this.queue.filter(action => action.status === 'pending').length;
  }

  getFailedCount() {
    return this.queue.filter(action => action.status === 'failed').length;
  }

  clearCompleted() {
    this.queue = this.queue.filter(action => action.status !== 'completed');
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
          status: 'pending',
          retryCount: 0,
          error: undefined,
        };
      }
      return action;
    });
    this.saveQueue();
    void this.processQueue();
  }
}

export const offlineQueue = new OfflineQueue();
