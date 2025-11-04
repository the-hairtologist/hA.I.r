/**
 * Floating Action Menu - Always-visible menu access
 * Provides quick access to command palette and key actions
 */

import { useState } from 'react';
import { Menu, Sparkles, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';

interface FloatingMenuProps {
  className?: string;
}

export function FloatingMenu({ className }: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    haptic.tap();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: 'menu' | 'search' | 'ai') => {
    haptic.tap();
    setIsOpen(false);
    
    switch (action) {
      case 'menu':
      case 'search':
        window.dispatchEvent(new CustomEvent('open-command-palette'));
        break;
      case 'ai':
        window.location.href = '/ai-assistant';
        break;
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-50 lg:bottom-6',
        'flex flex-col-reverse items-end gap-3',
        className
      )}
    >
      {/* Quick Actions - Only show when open */}
      {isOpen && (
        <div className="flex flex-col gap-2 animate-scale-in">
          {/* Search */}
          <Button
            size="icon"
            variant="secondary"
            onClick={() => handleAction('search')}
            className={cn(
              'h-12 w-12 rounded-full shadow-brutal-md',
              'hover:scale-110 transition-transform duration-200',
              'border-2 border-foreground'
            )}
            aria-label="Quick search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* AI Assistant */}
          <Button
            size="icon"
            variant="secondary"
            onClick={() => handleAction('ai')}
            className={cn(
              'h-12 w-12 rounded-full shadow-brutal-md',
              'hover:scale-110 transition-transform duration-200',
              'border-2 border-foreground',
              'bg-gradient-to-br from-primary to-primary/60'
            )}
            aria-label="AI Assistant"
          >
            <Sparkles className="h-5 w-5 text-on-surface-primary" />
          </Button>

          {/* All Menu */}
          <Button
            size="icon"
            variant="secondary"
            onClick={() => handleAction('menu')}
            className={cn(
              'h-12 w-12 rounded-full shadow-brutal-md',
              'hover:scale-110 transition-transform duration-200',
              'border-2 border-foreground'
            )}
            aria-label="All features"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Main Floating Button */}
      <Button
        size="icon"
        onClick={handleToggle}
        className={cn(
          'h-14 w-14 rounded-full shadow-brutal-lg',
          'hover:scale-105 active:scale-95',
          'transition-all duration-200',
          'border-[3px] border-foreground',
          'bg-gradient-to-br from-accent to-accent/80',
          'relative overflow-hidden group'
        )}
        aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
      >
        {/* Rotating icon */}
        <div
          className={cn(
            'transition-transform duration-300',
            isOpen && 'rotate-90'
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-on-surface-primary" strokeWidth={2.5} />
          ) : (
            <Plus className="h-6 w-6 text-on-surface-primary" strokeWidth={2.5} />
          )}
        </div>

        {/* Pulsing ring indicator */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full border-2 border-primary/60 animate-ping" aria-hidden="true" />
        )}

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" aria-hidden="true" />
      </Button>
    </div>
  );
}
