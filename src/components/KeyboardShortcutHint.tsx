/**
 * Keyboard Shortcut Hint Component
 * Displays keyboard shortcuts for better discoverability
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface KeyboardShortcutHintProps {
  keys: string[];
  description?: string;
  className?: string;
}

export const KeyboardShortcutHint = memo(
  ({ keys, description, className }: KeyboardShortcutHintProps) => {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 text-xs text-muted-foreground',
          className
        )}
        aria-label={description || `Keyboard shortcut: ${keys.join(' + ')}`}
      >
        {keys.map((key, index) => (
          <span
            key={`${key}-${index}`}
            className="inline-flex items-center gap-1"
          >
            <kbd className="px-2 py-0.5 bg-muted rounded text-[11px] font-mono border border-border min-h-[24px] flex items-center justify-center">
              {key}
            </kbd>
            {index < keys.length - 1 && (
              <span className="text-muted-foreground">+</span>
            )}
          </span>
        ))}
      </div>
    );
  }
);

KeyboardShortcutHint.displayName = 'KeyboardShortcutHint';
