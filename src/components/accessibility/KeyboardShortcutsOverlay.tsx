/**
 * Keyboard Shortcuts Overlay
 * Shows keyboard shortcuts help when user presses '?'
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { KeyboardShortcutHint } from '@/components/KeyboardShortcutHint';
import { Command, Navigation, Search } from 'lucide-react';

export const KeyboardShortcutsOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with '?'
      if (e.key === '?' && !isInputFocused()) {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        aria-labelledby="shortcuts-title"
        aria-describedby="shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle id="shortcuts-title" className="flex items-center gap-2">
            <Command className="h-5 w-5" aria-hidden="true" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription id="shortcuts-description">
            Use these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Navigation Shortcuts */}
          <section aria-labelledby="nav-shortcuts">
            <h3
              id="nav-shortcuts"
              className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Navigation
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Go to Dashboard</span>
                <KeyboardShortcutHint keys={['G', 'D']} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Go to Clients</span>
                <KeyboardShortcutHint keys={['G', 'C']} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Go to Appointments</span>
                <KeyboardShortcutHint keys={['G', 'A']} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Go to Messages</span>
                <KeyboardShortcutHint keys={['G', 'M']} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Go to Portfolio</span>
                <KeyboardShortcutHint keys={['G', 'P']} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Go to Finance</span>
                <KeyboardShortcutHint keys={['G', 'F']} />
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section aria-labelledby="action-shortcuts">
            <h3
              id="action-shortcuts"
              className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Search</span>
                <KeyboardShortcutHint keys={['⌘', 'K']} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show this help</span>
                <KeyboardShortcutHint keys={['?']} />
              </div>
            </div>
          </section>

          {/* General Shortcuts */}
          <section aria-labelledby="general-shortcuts">
            <h3
              id="general-shortcuts"
              className="text-sm font-semibold mb-3 text-muted-foreground"
            >
              General
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Close dialog</span>
                <KeyboardShortcutHint keys={['Esc']} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Navigate forward</span>
                <KeyboardShortcutHint keys={['Tab']} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Navigate backward</span>
                <KeyboardShortcutHint keys={['Shift', 'Tab']} />
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    (activeElement as HTMLElement)?.isContentEditable
  );
}
