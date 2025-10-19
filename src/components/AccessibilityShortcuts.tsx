/**
 * Accessibility Keyboard Shortcuts
 * Provides keyboard navigation hints and shortcuts for power users
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Keyboard } from 'lucide-react';

export const AccessibilityShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show keyboard shortcuts help (?)
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShowHints(true);
        toast.info('Keyboard Shortcuts', {
          description: (
            <div className="space-y-2 text-sm">
              <div><kbd>Ctrl/Cmd+K</kbd> - Quick search</div>
              <div><kbd>Alt+D</kbd> - Dashboard</div>
              <div><kbd>Alt+F</kbd> - Formulas</div>
              <div><kbd>Alt+C</kbd> - Clients</div>
              <div><kbd>Alt+A</kbd> - Appointments</div>
              <div><kbd>Shift+?</kbd> - Show shortcuts</div>
            </div>
          ),
          duration: 8000,
          icon: <Keyboard className="h-4 w-4" />,
        });
        return;
      }

      // Only handle shortcuts if not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Navigation shortcuts (Alt + Key)
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            navigate('/dashboard');
            toast.success('Navigated to Dashboard');
            break;
          case 'f':
            e.preventDefault();
            navigate('/formulas');
            toast.success('Navigated to Formulas');
            break;
          case 'c':
            e.preventDefault();
            navigate('/clients');
            toast.success('Navigated to Clients');
            break;
          case 'a':
            e.preventDefault();
            navigate('/appointments');
            toast.success('Navigated to Appointments');
            break;
          case 's':
            e.preventDefault();
            navigate('/settings');
            toast.success('Navigated to Settings');
            break;
          case 'h':
            e.preventDefault();
            navigate('/help');
            toast.success('Navigated to Help');
            break;
        }
      }

      // ESC to close modals/dialogs
      if (e.key === 'Escape') {
        // Let React components handle this
        const event = new CustomEvent('app:close-modals');
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  // Announce route changes to screen readers
  useEffect(() => {
    const pageName = location.pathname.split('/')[1] || 'home';
    const announcement = `Navigated to ${pageName} page`;
    
    // Create live region announcement
    const announcer = document.getElementById('route-announcer');
    if (announcer) {
      announcer.textContent = announcement;
    }
  }, [location]);

  return (
    <>
      {/* Screen reader announcements for route changes */}
      <div
        id="route-announcer"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );
};
