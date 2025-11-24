import { useEffect, useCallback } from 'react';

interface KeyboardShortcutOptions {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
}

/**
 * Hook for registering keyboard shortcuts
 * @param callback - Function to call when shortcut is triggered
 * @param options - Shortcut configuration
 */
export const useKeyboardShortcut = (
  callback: () => void,
  options: KeyboardShortcutOptions
) => {
  const {
    key,
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
    preventDefault = true,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = ctrl
        ? event.ctrlKey || event.metaKey
        : !event.ctrlKey && !event.metaKey;
      const matchesShift = shift ? event.shiftKey : !event.shiftKey;
      const matchesAlt = alt ? event.altKey : !event.altKey;
      const matchesMeta = meta
        ? event.metaKey
        : !event.metaKey && !event.ctrlKey;

      if (
        matchesKey &&
        matchesCtrl &&
        matchesShift &&
        matchesAlt &&
        matchesMeta
      ) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [key, ctrl, shift, alt, meta, preventDefault, enabled, callback]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
};

/**
 * Common keyboard shortcuts for the app
 */
export const SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: 'Save' },
  NEW: { key: 'n', ctrl: true, description: 'New' },
  SEARCH: { key: 'k', ctrl: true, description: 'Search' },
  CLOSE: { key: 'Escape', description: 'Close' },
  HELP: { key: '?', shift: true, description: 'Help' },
} as const;
