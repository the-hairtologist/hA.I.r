import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { NotificationDot } from "./NotificationDot";
import {
  stylistNavigationItems,
  clientNavigationItems,
  getAdminNavigationItems,
  stylistGroupLabels,
  clientGroupLabels,
  type NavigationItem,
} from "@/config/navigationConfig";
import { mobileFirst, touchButton } from "@/lib/responsive/mobile-first-utils";

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

const CollapsibleGroup = ({ title, items, onNavigate, unreadCount }: CollapsibleGroupProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => {
          haptic.tap();
          setIsOpen(!isOpen);
        }}
        className={cn(
          touchButton.md,
          "flex items-center justify-between w-full",
          mobileFirst.text.sm,
          "font-semibold text-muted-foreground hover:text-foreground transition-colors"
        )}
        aria-expanded={isOpen}
      >
        <span className={cn(mobileFirst.text.xs, "font-pixel tracking-wide uppercase break-words")}>{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
      </button>
      
      {isOpen && (
        <div className="space-y-1 px-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.url)}
              disabled={item.comingSoon}
              className={cn(
                touchButton.lg,
                "relative w-full flex items-center gap-3",
                "rounded-lg transition-all duration-200",
                "hover:bg-accent/50 active:scale-98",
                "brutal-border border-muted",
                item.comingSoon && "opacity-50 cursor-not-allowed"
              )}
              aria-label={`Navigate to ${item.title}`}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0",
                  item.gradient
                )}
              >
                <item.icon className="h-5 w-5 text-on-surface-primary" />
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <div className={cn(mobileFirst.text.sm, "font-medium break-words")}>{item.title}</div>
                {item.description && (
                  <div className={cn(mobileFirst.text.xs, "text-muted-foreground truncate")}>{item.description}</div>
                )}
              </div>

              {item.id === 'messages' && unreadCount !== undefined && unreadCount > 0 && (
                <NotificationDot count={unreadCount} size="sm" className="flex-shrink-0" />
              )}

              {item.comingSoon && (
                <span className={cn(mobileFirst.text.xs, "text-muted-foreground px-2 py-1 rounded bg-muted flex-shrink-0")}>
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

export const MoreMenu = ({ open, onOpenChange, excludePaths }: MoreMenuProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, isStylist } = useEnhancedAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id);
  const [searchQuery, setSearchQuery] = useState("");

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
    
    allNavItems.forEach((item) => {
      // Skip items in bottom nav
      if (excludePaths.includes(item.url)) return;
      
      // Skip parent items that only exist for grouping
      if (item.url === '#' && item.children) {
        // Add all children
        item.children.forEach((child) => {
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
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [availableItems, searchQuery]);

  // Group items
  const groupedItems = useMemo(() => {
    const groups: Record<string, NavigationItem[]> = {};
    
    filteredItems.forEach((item) => {
      const groupKey = item.group;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return groups;
  }, [filteredItems]);

  // Get group labels based on role
  const groupLabels = isAdmin ? stylistGroupLabels : isStylist ? stylistGroupLabels : clientGroupLabels;

  const handleNavigation = (path: string) => {
    haptic.tap();
    onOpenChange(false);
    navigate(path);
  };

  const handleClose = () => {
    haptic.tap();
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] p-0 flex flex-col bg-background"
        onInteractOutside={handleClose}
      >
        <SheetHeader className={cn(mobileFirst.padding.md, "pt-6 pb-4 border-b")}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SheetTitle className={cn(mobileFirst.text.xl, "font-pixel break-words")}>More</SheetTitle>
              <SheetDescription className={cn(mobileFirst.text.sm, "text-muted-foreground break-words")}>
                All features & settings
              </SheetDescription>
            </div>
            <button
              onClick={handleClose}
              className={cn(touchButton.md, "rounded-lg hover:bg-accent transition-colors flex items-center justify-center flex-shrink-0")}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        {/* Search Bar */}
        <div className={cn(mobileFirst.padding.md, "py-3 border-b bg-muted/20")}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(mobileFirst.text.base, "pl-10 h-12 bg-background")}
              aria-label="Search features"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-2">
          <div className="py-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className={cn(mobileFirst.text.sm, "text-muted-foreground")}>No features found</p>
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
                    title={groupLabels.main || "Main"}
                    items={groupedItems.main}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.scheduling && (
                  <CollapsibleGroup
                    title={groupLabels.scheduling || "Scheduling"}
                    items={groupedItems.scheduling}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.business && (
                  <CollapsibleGroup
                    title={groupLabels.business || "Business"}
                    items={groupedItems.business}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.growth && (
                  <CollapsibleGroup
                    title={groupLabels.growth || "Growth"}
                    items={groupedItems.growth}
                    onNavigate={handleNavigation}
                    unreadCount={unreadCount}
                  />
                )}
                {groupedItems.tools && (
                  <CollapsibleGroup
                    title={groupLabels.tools || "Tools"}
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
        <div className={cn("border-t bg-muted/10", mobileFirst.padding.md)}>
          <button
            onClick={() => handleNavigation("/settings")}
            className={cn(
              touchButton.lg,
              "w-full flex items-center gap-3 rounded-lg bg-gradient-to-br from-blue-start to-blue-end text-white font-medium shadow-lg hover:shadow-xl transition-all"
            )}
            aria-label="Navigate to Settings"
          >
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            <span className={cn(mobileFirst.text.base, "break-words")}>Settings</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
