/**
 * Command Palette (Cmd+K / Ctrl+K)
 * Quick navigation for Admin and Stylist users
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import {
  stylistNavigationItems,
  clientNavigationItems,
  getAdminNavigationItems,
} from '@/config/navigationConfig';
import { cn } from '@/lib/utils';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { isAdmin, isStylist } = useEnhancedAuth();
  const [search, setSearch] = useState('');

  // Get all navigation items based on role
  const allItems = useMemo(() => {
    let items: any[] = [];

    if (isAdmin) {
      items = [
        ...getAdminNavigationItems(true),
        ...stylistNavigationItems,
        ...clientNavigationItems.map(item => ({
          ...item,
          group: `client-${item.group}`,
        })),
      ];
    } else if (isStylist) {
      items = stylistNavigationItems;
    } else {
      items = clientNavigationItems;
    }

    // Flatten items with children
    const flattened: any[] = [];
    items.forEach(item => {
      flattened.push(item);
      if (item.children) {
        flattened.push(...item.children);
      }
    });

    return flattened;
  }, [isAdmin, isStylist]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!search) return allItems;

    const searchLower = search.toLowerCase();
    return allItems.filter(
      item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.url.toLowerCase().includes(searchLower)
    );
  }, [search, allItems]);

  // Handle item selection
  const handleSelect = (url: string) => {
    navigate(url);
    onOpenChange(false);
    setSearch('');
  };

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <Command className="h-4 w-4" />
            Quick Navigation
            <kbd className={cn(mobileFirst.text.xs, "ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium text-muted-foreground")}>
              <span className="text-xs">⌘</span>K
            </kbd>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4">
          <Input
            placeholder="Type to search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-[min(60vh,400px)] overflow-y-auto">
          <div className="px-2 pb-4">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.url)}
                      disabled={item.comingSoon}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                        'hover:bg-muted/80',
                        item.comingSoon && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className={cn('flex-shrink-0', item.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs sm:text-sm">
                            {item.title}
                          </span>
                          {item.comingSoon && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              SOON
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-[11px] sm:text-xs text-muted-foreground">
                        {item.url}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
