/**
 * Global Keyboard Shortcuts Hook
 * Manages app-wide keyboard shortcuts
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnouncer } from '@/components/AccessibilityAnnouncer';

export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();
  const { announce } = useAnnouncer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput =
          document.querySelector<HTMLInputElement>('[role="searchbox"]');
        if (searchInput) {
          searchInput.focus();
          announce('Search focused');
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        announce(
          'Keyboard shortcuts: Press Alt+D for Dashboard, Alt+A for Appointments, Alt+C for Clients, Alt+M for Messages'
        );
      }

      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        navigate('/dashboard');
        announce('Navigated to Dashboard');
      }

      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        navigate('/appointments');
        announce('Navigated to Appointments');
      }

      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        navigate('/clients');
        announce('Navigated to Clients');
      }

      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        navigate('/messages');
        announce('Navigated to Messages');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, announce]);
}
