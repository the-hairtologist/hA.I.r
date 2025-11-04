/**
 * Focus Trap Component
 * Traps focus within a container (for modals, dialogs, dropdowns)
 */

import React, { useEffect, useRef } from 'react';
import { FocusTrap as FocusTrapUtil } from '@/lib/accessibility/focusManagement';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  onEscape?: () => void;
  restoreFocus?: boolean;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  onEscape,
  restoreFocus = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<FocusTrapUtil | null>(null);

  useEffect(() => {
    if (!containerRef.current || !active) return;

    const focusTrap = new FocusTrapUtil(containerRef.current);
    focusTrapRef.current = focusTrap;

    focusTrap.activate();

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    if (onEscape) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      if (restoreFocus) {
        focusTrap.deactivate();
      }
      if (onEscape) {
        document.removeEventListener('keydown', handleEscape);
      }
    };
  }, [active, onEscape, restoreFocus]);

  return <div ref={containerRef}>{children}</div>;
};
