/**
 * Keyboard Shortcuts Help Dialog
 * Shows available keyboard shortcuts to users
 */

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KeyboardShortcut } from "./KeyboardShortcut";
import { Command } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsDialog = ({ open, onOpenChange }: KeyboardShortcutsDialogProps) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" aria-hidden="true" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Navigation</h3>
            <div className="space-y-2">
              <KeyboardShortcut keys={[modKey, 'K']} action="Focus search" />
              <KeyboardShortcut keys={['/']} action="Focus search" />
              <KeyboardShortcut keys={['Esc']} action="Close dialogs" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <KeyboardShortcut keys={['Tab']} action="Navigate between fields" />
              <KeyboardShortcut keys={['Enter']} action="Submit forms" />
              <KeyboardShortcut keys={['Space']} action="Toggle checkboxes" />
            </div>
          </div>

          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border">?</kbd> to show this help anytime</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
