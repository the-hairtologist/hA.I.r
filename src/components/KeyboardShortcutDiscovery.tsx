import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Keyboard } from "lucide-react";
import { KeyboardShortcutHint } from "./KeyboardShortcutHint";
import { cn } from "@/lib/utils";

interface Shortcut {
  key: string;
  description: string;
  ctrl?: boolean;
  shift?: boolean;
}

const SHORTCUTS: Shortcut[] = [
  { key: "N", ctrl: true, description: "Create new item" },
  { key: "S", ctrl: true, description: "Save current form" },
  { key: "K", ctrl: true, description: "Search" },
  { key: "?", shift: true, description: "Show all shortcuts" },
  { key: "/", description: "Focus search" },
];

export const KeyboardShortcutDiscovery = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // CRITICAL: Never show on landing page (/) or auth pages
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/auth' || currentPath === '/install') {
      return;
    }

    // Show hint after 5 seconds if not dismissed
    const hasSeenHint = localStorage.getItem("keyboard-hint-seen");
    if (hasSeenHint || dismissed) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("keyboard-hint-seen", "true");
  };

  if (!show) return null;

  return (
    <Card className={cn(
      "fixed bottom-24 left-4 z-40 max-w-sm lg:bottom-6 lg:left-auto lg:right-24",
      "brutal-border brutal-shadow-md",
      "animate-slide-in-right"
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          {SHORTCUTS.slice(0, 3).map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.ctrl && <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">Ctrl</kbd>}
                {shortcut.ctrl && <span>+</span>}
                {shortcut.shift && <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">Shift</kbd>}
                {shortcut.shift && <span>+</span>}
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">{shortcut.key}</kbd>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Shift</kbd>+<kbd className="px-1 py-0.5 text-xs bg-muted rounded">?</kbd> to see all shortcuts
        </p>
      </CardContent>
    </Card>
  );
};
