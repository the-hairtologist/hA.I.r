/**
 * Global Keyboard Shortcuts Hook
 * Manages app-wide keyboard shortcuts
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useGlobalKeyboardShortcuts = (
  shortcuts: ShortcutConfig[] = [],
  enabled: boolean = true
) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to work in inputs/textareas
        if (e.key !== 'Escape') return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

// Default global shortcuts
export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Quick search',
    action: () => {
      // Trigger search focus
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      searchInput?.focus();
    },
  },
  {
    key: '/',
    description: 'Focus search',
    action: () => {
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      searchInput?.focus();
    },
  },
  {
    key: 'Escape',
    description: 'Close dialogs',
    action: () => {
      // Close any open dialogs
      const closeButtons = document.querySelectorAll('[data-dialog-close]');
      if (closeButtons.length > 0) {
        (closeButtons[0] as HTMLButtonElement).click();
      }
    },
  },
];
