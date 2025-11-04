/**
 * Global Keyboard Shortcuts Hook
 * Manages app-wide keyboard shortcuts for navigation and actions
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ShortcutHandler {
  keys: string[];
  handler: () => void;
  description: string;
  preventDefault?: boolean;
}

export const useGlobalKeyboardShortcuts = (userRole?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const shortcuts: ShortcutHandler[] = [
    // Navigation shortcuts (G + key)
    {
      keys: ['g', 'd'],
      handler: () => navigate('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      keys: ['g', 'c'],
      handler: () => navigate('/clients'),
      description: 'Go to Clients',
    },
    {
      keys: ['g', 'a'],
      handler: () => navigate('/appointments'),
      description: 'Go to Appointments',
    },
    {
      keys: ['g', 'm'],
      handler: () => navigate('/messages'),
      description: 'Go to Messages',
    },
    {
      keys: ['g', 'p'],
      handler: () => navigate('/portfolio'),
      description: 'Go to Portfolio',
    },
    {
      keys: ['g', 'f'],
      handler: () => navigate('/finance'),
      description: 'Go to Finance',
    },
    {
      keys: ['g', 's'],
      handler: () => navigate('/settings'),
      description: 'Go to Settings',
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Track key sequence
      const key = event.key.toLowerCase();
      const isModified = event.ctrlKey || event.metaKey || event.altKey;

      // Handle '?' for help
      if (key === '?' && !isModified) {
        event.preventDefault();
        toast({
          title: 'Keyboard Shortcuts',
          description: 'Press G+D for Dashboard, G+C for Clients, G+A for Appointments',
        });
        return;
      }

      // Handle command/ctrl + K for search
      if (key === 'k' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        // Trigger search (can be expanded with actual search functionality)
        toast({
          title: 'Search',
          description: 'Search functionality triggered',
        });
        return;
      }

      // Store previous key for sequences
      const prevKey = (window as any).__lastShortcutKey;
      (window as any).__lastShortcutKey = key;
      (window as any).__lastShortcutTime = Date.now();

      // Clear after 1 second
      setTimeout(() => {
        if (Date.now() - (window as any).__lastShortcutTime >= 1000) {
          (window as any).__lastShortcutKey = null;
        }
      }, 1000);

      // Check for sequence shortcuts
      for (const shortcut of shortcuts) {
        if (shortcut.keys.length === 2) {
          if (prevKey === shortcut.keys[0] && key === shortcut.keys[1]) {
            if (Date.now() - (window as any).__lastShortcutTime < 1000) {
              event.preventDefault();
              shortcut.handler();
              (window as any).__lastShortcutKey = null;
              break;
            }
          }
        }
      }
    },
    [navigate, toast, shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { shortcuts };
};
