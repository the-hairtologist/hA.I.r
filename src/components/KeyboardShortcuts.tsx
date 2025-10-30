/**
 * Keyboard Shortcuts Reference
 * Press ? to open
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Search, Plus, Calendar, Users, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shortcut {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

const shortcuts: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      {
        keys: ['G', 'H'],
        description: 'Go to Dashboard',
        icon: <Home className="h-3 w-3" />,
      },
      {
        keys: ['G', 'A'],
        description: 'Go to Appointments',
        icon: <Calendar className="h-3 w-3" />,
      },
      {
        keys: ['G', 'C'],
        description: 'Go to Clients',
        icon: <Users className="h-3 w-3" />,
      },
      { keys: ['G', 'F'], description: 'Go to Formulas' },
      { keys: ['G', 'P'], description: 'Go to Products' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      {
        keys: ['/'],
        description: 'Focus search',
        icon: <Search className="h-3 w-3" />,
      },
      {
        keys: ['N'],
        description: 'New appointment',
        icon: <Plus className="h-3 w-3" />,
      },
      {
        keys: ['C'],
        description: 'Add client',
        icon: <Plus className="h-3 w-3" />,
      },
      { keys: ['Esc'], description: 'Close dialog' },
    ],
  },
  {
    title: 'Forms',
    shortcuts: [
      { keys: ['Tab'], description: 'Next field' },
      { keys: ['Shift', 'Tab'], description: 'Previous field' },
      { keys: ['Ctrl', 'Enter'], description: 'Submit form' },
    ],
  },
  {
    title: 'Help',
    shortcuts: [{ keys: ['?'], description: 'Show keyboard shortcuts' }],
  },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger on ? key when not in an input
      if (e.key === '?' && !isInputFocused()) {
        e.preventDefault();
        setOpen(true);
      }

      // Close on Escape
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl brutal-border brutal-shadow-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <DialogTitle className="font-pixel uppercase">
              Keyboard Shortcuts
            </DialogTitle>
          </div>
          <DialogDescription>
            Master these shortcuts to work faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcuts.map(group => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-bold font-pixel uppercase text-muted-foreground">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map(shortcut => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {shortcut.icon && (
                        <span className="text-muted-foreground">
                          {shortcut.icon}
                        </span>
                      )}
                      <span className="text-sm">{shortcut.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, j) => (
                        <span key={j} className="flex items-center gap-1">
                          <KeyBadge>{key}</KeyBadge>
                          {j < shortcut.keys.length - 1 && (
                            <span className="text-xs text-muted-foreground">
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-center text-muted-foreground pt-4 border-t">
          Press <KeyBadge>?</KeyBadge> anytime to view shortcuts
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'px-2 py-0.5 font-mono text-xs font-bold',
        'brutal-border bg-muted hover:bg-muted',
        'min-w-[24px] justify-center'
      )}
    >
      {children}
    </Badge>
  );
}

function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  return (
    activeElement?.tagName === 'INPUT' ||
    activeElement?.tagName === 'TEXTAREA' ||
    activeElement?.getAttribute('contenteditable') === 'true'
  );
}
