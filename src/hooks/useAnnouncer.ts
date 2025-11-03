/**
 * useAnnouncer Hook
 * Provides screen reader announcements for dynamic content
 */

import { useCallback } from 'react';

export function useAnnouncer() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcerElement = document.getElementById('global-announcer');
    if (announcerElement) {
      announcerElement.textContent = '';
      announcerElement.setAttribute('aria-live', priority);
      setTimeout(() => {
        if (announcerElement) {
          announcerElement.textContent = message;
        }
      }, 100);
    }
  }, []);

  return { announce };
}
