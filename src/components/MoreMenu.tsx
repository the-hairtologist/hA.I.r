import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { NotificationDot } from './NotificationDot';
import {
  stylistNavigationItems,
  clientNavigationItems,
  getAdminNavigationItems,
  stylistGroupLabels,
  type NavigationItem,
} from '@/config/navigationConfig';

interface MoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludePaths: string[]; // Paths already in bottom nav
}

interface CollapsibleGroupProps {
  title: string;
  items: NavigationItem[];
  onNavigate: (path: string) => void;
  unreadCount?: number;
}

const CollapsibleGroup = ({
  title,
  items,
  onNavigate,
  unreadCount,
}: CollapsibleGroupProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => {
          haptic.tap();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
        aria-expanded={isOpen}
      >
        <span className="font-pixel text-xs tracking-wide uppercase">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-1 px-2">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.url)}
              disabled={item.comingSoon}
              className={cn(
                'relative w-full flex items-center gap-3 px-4 py-3',
                'min-h-[60px] rounded-lg transition-all duration-200',
                'hover:bg-accent/50 active:scale-98 touch-manipulation',
                'brutal-border border-muted',
                item.comingSoon && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={`Navigate to ${item.title}`}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg',
                  item.gradient
                )}
              >
                <item.icon className="h-5 w-5 text-white" />
              </div>

              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{item.title}</div>
                {item.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                )}
              </div>

              {item.id === 'messages' &&
                unreadCount !== undefined &&
                unreadCount > 0 && (
                  <NotificationDot count={unreadCount} size="sm" />
                )}

              {item.comingSoon && (
                <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const MoreMenu = ({
  open,
  onOpenChange,
  excludePaths,
}: MoreMenuProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, isStylist } = useEnhancedAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all navigation items based on role
  const allNavItems = useMemo(() => {
    if (isAdmin) {
      return [...getAdminNavigationItems(true), ...stylistNavigationItems];
    }
    if (isStylist) {
      return stylistNavigationItems;
    }
    return clientNavigationItems;
  }, [isAdmin, isStylist]);

  // Filter out items already in bottom nav and flatten children
  const availableItems = useMemo(() => {
    const flatItems: NavigationItem[] = [];

    allNavItems.forEach(item => {
      // Skip items in bottom nav
      if (excludePaths.includes(item.url)) return;

      // Skip parent items that only exist for grouping
      if (item.url === '#' && item.children) {
        // Add all children
        item.children.forEach(child => {
          if (!excludePaths.includes(child.url)) {
            flatItems.push(child);
          }
        });
      } else {
        flatItems.push(item);
      }
    });

    return flatItems;
  }, [allNavItems, excludePaths]);

  // Filter by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return availableItems;

    const query = searchQuery.toLowerCase();
    return availableItems.filter(
      item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [availableItems, searchQuery]);

  // Group items
  const groupedItems = useMemo(() => {
    const groups: Record<string, NavigationItem[]> = {};

    filteredItems.forEach(item => {
      const groupKey = item.group;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
  }, [filteredItems]);

  const handleNavigation = (path: string) => {
    haptic.tap();
    onOpenChange(false);
    navigate(path);
  };

  const handleClose = () => {
    haptic.tap();
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] p-0 flex flex-col bg-background"
        onInteractOutside={handleClose}
      >
        <SheetHeader className="px-4 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl font-pixel">More</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                All features & settings
              </SheetDescription>
            </div>
            <button
              onClick={handleClose}
              className="h-10 w-10 rounded-lg hover:bg-accent transition-colors flex items-center justify-center touch-manipulation"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search features..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-background"
              aria-label="Search features"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-2">
          <div className="py-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No features found</p>
              </div>
            ) : (
              <>
                {isAdmin && groupedItems.admin && (
                  <CollapsibleGroup
                    title="Admin Tools"
                    items={groupedItems.admin}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.main && (
                  <CollapsibleGroup
                    title={stylistGroupLabels.main ?? 'Main'}
                    items={groupedItems.main}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.scheduling && (
                  <CollapsibleGroup
                    title={stylistGroupLabels.scheduling ?? 'Scheduling'}
                    items={groupedItems.scheduling}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.business && (
                  <CollapsibleGroup
                    title={stylistGroupLabels.business ?? 'Business'}
                    items={groupedItems.business}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.growth && (
                  <CollapsibleGroup
                    title={stylistGroupLabels.growth ?? 'Growth'}
                    items={groupedItems.growth}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.tools && (
                  <CollapsibleGroup
                    title={stylistGroupLabels.tools ?? 'Tools'}
                    items={groupedItems.tools}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.info && (
                  <CollapsibleGroup
                    title="My Info"
                    items={groupedItems.info}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.account && (
                  <CollapsibleGroup
                    title="Account"
                    items={groupedItems.account}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Settings at bottom - Always visible */}
        <div className="border-t bg-muted/10 p-4">
          <button
            onClick={() => handleNavigation('/settings')}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-lg bg-gradient-to-br from-blue-start to-blue-end text-white font-medium shadow-lg hover:shadow-xl transition-all active:scale-98 touch-manipulation"
            aria-label="Navigate to Settings"
          >
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Settings className="h-5 w-5" />
            </div>
            <span className="text-base">Settings</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
