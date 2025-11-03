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
    const announcerNode = announcerRef.current;
    if (announcerNode && message) {
      announcerNode.textContent = '';
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, 100);
    }

    // Capture the node for cleanup to avoid ref changes
    const cleanupNode = announcerNode;
    return () => {
      if (clearOnUnmount && cleanupNode) {
        cleanupNode.textContent = '';
      }
    };
  }, [message, clearOnUnmount]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live={priority === 'assertive' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

// useAnnouncer hook moved to src/hooks/useAnnouncer.ts

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
