import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import {
  stylistNavigationItems,
  clientNavigationItems,
  getAdminNavigationItems,
  stylistGroupLabels,
  clientGroupLabels,
  adminFullAccessGroupLabels,
  type NavigationItem,
  type NavigationGroup,
} from "@/config/navigationConfig";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer = ({ isOpen, onClose }: MobileDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isStylist, isClient } = useEnhancedAuth();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Get navigation items based on role
  const getNavigationItems = (): NavigationItem[] => {
    if (isAdmin) {
      return [...getAdminNavigationItems(true), ...stylistNavigationItems];
    }
    if (isStylist) {
      return stylistNavigationItems;
    }
    return clientNavigationItems;
  };

  // Get group labels based on role
  const getGroupLabels = (): NavigationGroup => {
    if (isAdmin) {
      return adminFullAccessGroupLabels;
    }
    if (isStylist) {
      return stylistGroupLabels;
    }
    return clientGroupLabels;
  };

  const navigationItems = getNavigationItems();
  const groupLabels = getGroupLabels();

  // Group items by their group property
  const groupedItems = navigationItems.reduce((acc, item) => {
    const group = item.group || "main";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  // Auto-expand all groups on mount for better discoverability
  useEffect(() => {
    if (isOpen) {
      // Expand all groups by default for mobile-friendly browsing
      const allGroups = Object.keys(groupedItems);
      setExpandedGroups(new Set(allGroups));
    }
  }, [isOpen, groupedItems]);

  const toggleGroup = (groupKey: string) => {
    haptic.tap();
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const handleNavigation = (url: string) => {
    if (url === "#") return;
    haptic.tap();
    navigate(url);
    onClose();
  };

  const isActive = (item: NavigationItem): boolean => {
    if (location.pathname === item.url) return true;
    if (item.children?.some(child => location.pathname === child.url)) return true;
    return false;
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm z-50",
          "bg-background border-r-[3px] border-foreground shadow-brutal-lg",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
        aria-label="Navigation menu"
        role="navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b-[3px] border-foreground">
          <h2 className="text-lg font-bold font-pixel">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] touch-manipulation hover:bg-destructive/10"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation Content */}
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="px-2 py-4 space-y-1">
            {Object.entries(groupedItems).length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p>No navigation items available</p>
              </div>
            ) : (
              Object.entries(groupedItems).map(([groupKey, items]) => {
                const isExpanded = expandedGroups.has(groupKey);
                const groupLabel = groupLabels[groupKey] || groupKey;

                return (
                  <div key={groupKey} className="mb-4">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg",
                        "text-xs font-bold uppercase tracking-wider",
                        "text-muted-foreground hover:text-foreground",
                        "transition-all duration-200 touch-manipulation",
                        "hover:bg-accent/50 active:scale-98"
                      )}
                    >
                      <span>{groupLabel}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="mt-1 space-y-1">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        const hasChildren = item.children && item.children.length > 0;

                        return (
                          <div key={item.id}>
                            {/* Parent Item */}
                            <button
                              onClick={() => handleNavigation(item.url)}
                              disabled={item.comingSoon || hasChildren}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-lg",
                                "text-sm font-medium transition-all duration-200",
                                "touch-manipulation active:scale-98",
                                active && [
                                  "bg-primary/10 text-primary",
                                  "ring-2 ring-primary/20",
                                  "shadow-sm"
                                ],
                                !active && "hover:bg-accent/50 text-foreground",
                                (item.comingSoon || hasChildren) && "cursor-default"
                              )}
                            >
                              {/* Icon with gradient background */}
                              <div
                                className={cn(
                                  "flex items-center justify-center w-9 h-9 rounded-lg",
                                  "transition-all duration-200",
                                  active ? item.gradient : "bg-accent/50"
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "h-5 w-5",
                                    active ? "text-on-surface-primary" : "text-muted-foreground"
                                  )}
                                  strokeWidth={active ? 2.5 : 2}
                                />
                              </div>

                              {/* Label */}
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span>{item.title}</span>
                                  {item.comingSoon && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                                      Soon
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              {/* Chevron for parent items */}
                              {hasChildren && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>

                            {/* Child Items */}
                            {hasChildren && (
                              <div className="ml-6 mt-1 space-y-1 border-l-2 border-accent pl-3">
                                {item.children!.map((child) => {
                                  const ChildIcon = child.icon;
                                  const childActive = location.pathname === child.url;

                                  return (
                                    <button
                                      key={child.id}
                                      onClick={() => handleNavigation(child.url)}
                                      disabled={child.comingSoon}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2 py-2 rounded-lg",
                                        "text-sm transition-all duration-200",
                                        "touch-manipulation active:scale-98",
                                        childActive && "bg-primary/10 text-primary font-medium",
                                        !childActive && "hover:bg-accent/30 text-muted-foreground",
                                        child.comingSoon && "cursor-default opacity-60"
                                      )}
                                    >
                                      <ChildIcon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                                      <span className="truncate">{child.title}</span>
                                      {child.comingSoon && (
                                        <span className="text-xs px-1 py-0.5 rounded bg-accent ml-auto">
                                          Soon
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};
