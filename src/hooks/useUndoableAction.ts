/**
 * Undoable Action Hook
 * Provides undo functionality with toast notification
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Undo } from 'lucide-react';
import { logger } from '@/lib/logger';

interface UndoableActionOptions<T> {
  action: () => Promise<void>;
  undoAction: () => Promise<void>;
  successMessage: string;
  undoMessage?: string;
  undoTimeout?: number; // milliseconds
}

export const useUndoableAction = <T = void>() => {
  const [isUndoing, setIsUndoing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const executeWithUndo = useCallback(
    async <T>({
      action,
      undoAction,
      successMessage,
      undoMessage = 'Action undone',
      undoTimeout = 5000,
    }: UndoableActionOptions<T>) => {
      try {
        // Execute the main action
        await action();

        let undoTriggered = false;

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Show toast with undo button
        toast.success(successMessage, {
          duration: undoTimeout,
          action: {
            label: 'Undo',
            onClick: async () => {
              undoTriggered = true;
              setIsUndoing(true);

              try {
                await undoAction();
                toast.success(undoMessage);
              } catch (error) {
                logger.error('Undo failed', 'useUndoableAction', error as Error);
                toast.error('Failed to undo action');
              } finally {
                setIsUndoing(false);
              }
            },
          },
        });

        // Auto-dismiss after timeout
        const timeout = setTimeout(() => {
          if (!undoTriggered) {
            // Action is now permanent
            timeoutRef.current = undefined;
          }
        }, undoTimeout);
        timeoutRef.current = timeout;
      } catch (error) {
        logger.error('Action failed', 'useUndoableAction', error as Error);
        toast.error('Action failed');
        throw error;
      }
    },
    []
  );

  return {
    executeWithUndo,
    isUndoing,
  };
};
