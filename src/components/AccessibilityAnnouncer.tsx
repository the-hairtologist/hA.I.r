/**
 * Accessibility Announcer Component
 * Provides live region announcements for dynamic content changes
 */

import { useEffect, useState } from 'react';

interface AccessibilityAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export const AccessibilityAnnouncer = ({ message, priority = 'polite' }: AccessibilityAnnouncerProps) => {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

// Global announcer hook
export const useAnnouncer = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(''); // Clear first to ensure re-announcement
    setTimeout(() => setAnnouncement(message), 100);
  };

  return { announcement, announce };
};
