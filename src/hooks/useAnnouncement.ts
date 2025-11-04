/**
 * Announcement Hook for Screen Readers
 * Dynamically announce messages to assistive technologies
 */

import { useEffect, useRef, useState } from 'react';

interface AnnouncementOptions {
  politeness?: 'polite' | 'assertive';
  clearAfter?: number; // milliseconds
}

export const useAnnouncement = () => {
  const [message, setMessage] = useState<string>('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const announce = (
    text: string,
    options: AnnouncementOptions = {}
  ) => {
    const { politeness: level = 'polite', clearAfter = 1000 } = options;

    // Clear previous announcement
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setPoliteness(level);
    setMessage(text);

    // Auto-clear after specified time
    if (clearAfter > 0) {
      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, clearAfter);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { announce, message, politeness };
};
