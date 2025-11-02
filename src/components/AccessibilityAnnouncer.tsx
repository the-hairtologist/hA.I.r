/**
 * Accessibility Announcer Component
 * Provides screen reader announcements for dynamic content changes
 */

import { useEffect, useRef } from 'react';

interface AccessibilityAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearOnUnmount?: boolean;
}

export function AccessibilityAnnouncer({
  message,
  priority = 'polite',
  clearOnUnmount = true,
}: AccessibilityAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announcerRef.current && message) {
      announcerRef.current.textContent = '';
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, 100);
    }

    return () => {
      if (clearOnUnmount && announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    };
  }, [message, clearOnUnmount]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

export function useAnnouncer() {
  const announce = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const announcer = document.getElementById('global-announcer');
    if (announcer) {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  };

  return { announce };
}

export function GlobalAnnouncer() {
  return (
    <div
      id="global-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
