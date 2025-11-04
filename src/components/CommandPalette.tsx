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
      <DialogContent className="max-w-2xl p-0 gap-0 bg-background/95 backdrop-blur-md">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Command className="h-5 w-5 text-primary" />
              Quick Navigation
            </DialogTitle>
            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
              <span>⌘</span>K
            </kbd>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 border-b">
          <Input
            placeholder="Search features, pages, tools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-11 bg-muted/50 border-0 focus-visible:ring-1"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-[min(60vh,500px)]">
          <div className="px-3 py-3">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try searching for something else
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.url)}
                      disabled={item.comingSoon}
                      className={cn(
                        'w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-all text-left group',
                        'hover:bg-accent hover:shadow-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        item.comingSoon && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                      )}
                    >
                      <div className={cn(
                        'flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110',
                        item.color
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm group-hover:text-primary transition-colors">
                            {item.title}
                          </span>
                          {item.comingSoon && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              SOON
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
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
