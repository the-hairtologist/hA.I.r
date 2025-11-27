import { useState, useEffect } from 'react';
import { Edit3, RotateCcw } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useSidebarOrder, SidebarItem } from '@/hooks/useSidebarOrder';
import { SortableNavItem } from '@/components/sidebar/SortableNavItem';
import { TodaysScheduleWidget } from '@/components/sidebar/TodaysScheduleWidget';
import { CalendarSyncIndicator } from '@/components/CalendarSyncIndicator';
import { NextAppointmentBanner } from '@/components/sidebar/NextAppointmentBanner';
import {
  stylistNavigationItems,
  clientNavigationItems,
  getAdminNavigationItems,
  stylistGroupLabels,
  clientGroupLabels,
  adminFullAccessGroupLabels,
  type NavigationItem,
} from '@/config/navigationConfig';

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, isAdmin, isStylist, isClient } = useEnhancedAuth();
  const collapsed = state === 'collapsed';
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const { unreadCount } = useRealtimeNotifications(user?.id);
  const [notifications, setNotifications] = useState<Record<string, number>>({
    messages: unreadCount || 0,
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleGroupCollapsed = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  // Update notifications when unread count changes
  useEffect(() => {
    setNotifications(prev => ({
      ...prev,
      messages: unreadCount || 0,
    }));
  }, [unreadCount]);

  const getNavClassName = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center gap-3 w-full transition-colors duration-200 px-2 py-2 rounded-md ${
      isActive
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-foreground hover:bg-muted/50'
    }`;
  };

  // Get navigation items based on role
  const adminItems = getAdminNavigationItems(isAdmin);

  // Filter out "Coming Soon" items universally
  const filterComingSoon = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter(item => !item.comingSoon)
      .map(item => ({
        ...item,
        children: item.children
          ? item.children.filter(child => !child.comingSoon)
          : undefined,
      }));
  };

  // Admin sees EVERYTHING - Prioritized order: Admin first, then Stylist, then Client
  const baseItems: NavigationItem[] = (() => {
    if (isAdmin) {
      // Prefix client items with "client-" group to differentiate
      const clientItemsWithPrefix = filterComingSoon(clientNavigationItems).map(
        item => ({
          ...item,
          group: `client-${item.group}`,
        })
      );

      // Admin gets all items in priority order: ADMIN → STYLIST → CLIENT (no "Coming Soon")
      return [
        ...filterComingSoon(adminItems),
        ...filterComingSoon(stylistNavigationItems),
        ...clientItemsWithPrefix,
      ];
    }

    // Stylist gets only stylist items (no "Coming Soon")
    if (isStylist) {
      return filterComingSoon(stylistNavigationItems);
    }

    // Client gets only client items (no "Coming Soon")
    return filterComingSoon(clientNavigationItems);
  })();

  // Get group labels based on role
  const groupLabels = (() => {
    if (isAdmin) {
      return adminFullAccessGroupLabels;
    }
    if (isStylist) {
      return stylistGroupLabels;
    }
    return clientGroupLabels;
  })();

  const {
    items,
    groupedItems,
    groupLabels: labels,
    isLoading,
    saveSidebarOrder,
    resetSidebarOrder,
  } = useSidebarOrder(baseItems as SidebarItem[], groupLabels);

  // Keep groups collapsed by default - user can expand what they need
  // This prevents overwhelming the sidebar

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      saveSidebarOrder(newOrder);
    }
  };

  const handleReset = () => {
    resetSidebarOrder();
    setIsEditMode(false);
  };

  if (isLoading) {
    return (
      <Sidebar
        collapsible="icon"
        className="brutal-border-r border-foreground/10"
      >
        <SidebarContent className="flex flex-col gap-3 p-4">
          {/* Skeleton loaders with brutal styling */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-muted/50 brutal-border border-foreground/10 brutal-shadow-xs animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted/50 brutal-border border-foreground/5 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted/30 brutal-border border-foreground/5 rounded animate-pulse" />
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-8 w-8 rounded-md bg-muted/40 brutal-border border-foreground/10 brutal-shadow-xs animate-pulse" />
              <div className="h-4 w-2/3 bg-muted/40 brutal-border border-foreground/5 rounded animate-pulse" />
            </div>
          ))}
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      collapsible="icon"
      className="brutal-border-r border-foreground/10 brutal-grid-subtle bg-sidebar"
    >
      <SidebarContent className="pb-4 gap-2 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        {/* Next Appointment Banner - Shows time until next appointment */}
        {(isStylist || isAdmin) && !collapsed && <NextAppointmentBanner />}

        {/* Today's Schedule Widget - Only for stylists and admins */}
        {(isStylist || isAdmin) && !collapsed && <TodaysScheduleWidget />}

        {/* Customize Controls - Only for stylists and admins */}
        {!collapsed && (isStylist || isAdmin) && !isClient && (
          <div className="px-3 py-3 brutal-border-b border-foreground/10">
            <div className="flex items-center gap-2">
              <Button
                variant={isEditMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex-1 h-9 font-bold brutal-border brutal-shadow-sm hover:brutal-shadow-md brutal-hover transition-all"
                title={
                  isEditMode
                    ? 'Finish customizing'
                    : 'Drag to prioritize your most-used tools'
                }
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                {isEditMode ? 'Done' : 'Customize'}
              </Button>
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-9 px-2 brutal-border brutal-shadow-sm hover:brutal-shadow-md brutal-hover transition-all"
                  title="Reset to recommended order"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {isEditMode && (
              <p className="text-[10px] font-sans text-foreground/70 mt-2 leading-tight">
                Drag items to prioritize your most-used tools
              </p>
            )}
          </div>
        )}

        {/* Navigation Items - Grouped */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {Object.entries(groupedItems).map(
              ([groupKey, groupItems], index) => {
                const isGroupCollapsed = collapsedGroups.has(groupKey);
                const showSeparator = isAdmin && index > 0;

                return (
                  <div key={groupKey}>
                    {showSeparator && (
                      <div className="relative my-4 mx-3">
                        <div className="border-t-[3px] border-foreground/20" />
                        {groupKey.startsWith('admin-') && (
                          <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent shadow-[0_2px_8px_rgba(251,191,36,0.3)]" />
                        )}
                      </div>
                    )}
                    <SidebarGroup className="mb-2">
                      <SidebarGroupLabel
                        className={`${collapsed ? 'sr-only' : 'cursor-pointer hover:bg-muted/80 px-2 py-2 flex items-center justify-between transition-all border-l-[3px] border-transparent hover:border-primary/50'}`}
                        onClick={() =>
                          !collapsed && toggleGroupCollapsed(groupKey)
                        }
                      >
                        <span className="drop-shadow-sm">
                          {labels[groupKey]}
                        </span>
                        {!collapsed && (
                          <span
                            className="text-[10px] transition-transform duration-200 font-bold"
                            style={{
                              transform: isGroupCollapsed
                                ? 'rotate(-90deg)'
                                : 'rotate(0deg)',
                            }}
                          >
                            ▼
                          </span>
                        )}
                      </SidebarGroupLabel>
                      {!isGroupCollapsed && (
                        <SidebarGroupContent>
                          <SidebarMenu>
                            {groupItems.map(item => (
                              <SortableNavItem
                                key={item.id}
                                item={item}
                                collapsed={collapsed}
                                getNavClassName={getNavClassName}
                                isEditMode={isEditMode}
                                expandedItems={expandedItems}
                                toggleExpanded={toggleExpanded}
                                notificationCount={notifications[item.id]}
                              />
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      )}
                    </SidebarGroup>
                  </div>
                );
              }
            )}
          </SortableContext>
        </DndContext>

        {/* Calendar Sync Indicator - Only for stylists and admins */}
        {(isStylist || isAdmin) && !collapsed && <CalendarSyncIndicator />}
      </SidebarContent>
    </Sidebar>
  );
}
