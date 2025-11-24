/**
 * Keyboard Shortcuts Hook
 * Provides centralized keyboard shortcut management
 */

import { useEffect, RefObject } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Global shortcuts available across the app
export const useGlobalShortcuts = (searchRef?: RefObject<HTMLInputElement>) => {
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        if (searchRef?.current) {
          searchRef.current.focus();
        }
      },
      description: 'Focus search',
    },
    {
      key: '/',
      action: () => {
        if (searchRef?.current) {
          searchRef.current.focus();
        }
      },
      description: 'Focus search',
    },
  ]);
};
