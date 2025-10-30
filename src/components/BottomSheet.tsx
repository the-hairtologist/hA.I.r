/**
 * Bottom Sheet for Mobile
 * Native iOS/Android-style modal for mobile devices
 */

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: BottomSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-hidden',
          'bg-background border-t-4 border-foreground rounded-t-2xl',
          'shadow-[0_-8px_24px_rgba(0,0,0,0.15)]',
          'animate-slide-in-bottom',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        aria-describedby={description ? 'bottom-sheet-description' : undefined}
      >
        {/* Handle */}
        <div className="flex justify-center py-3 border-b">
          <div
            className="w-12 h-1 bg-muted-foreground/30 rounded-full"
            aria-hidden="true"
          />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="px-4 py-3 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    id="bottom-sheet-title"
                    className="text-lg font-bold font-pixel uppercase truncate"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="bottom-sheet-description"
                    className="text-sm text-muted-foreground mt-1"
                  >
                    {description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="flex-shrink-0 -mr-2"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto overscroll-contain"
          style={{ maxHeight: 'calc(90vh - 120px)' }}
        >
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
