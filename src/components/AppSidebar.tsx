import { useState, useEffect } from "react";
import { Edit3, RotateCcw } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useSidebarOrder, SidebarItem } from "@/hooks/useSidebarOrder";
import { SortableNavItem } from "@/components/sidebar/SortableNavItem";
import { TodaysScheduleWidget } from "@/components/sidebar/TodaysScheduleWidget";
import {
  stylistNavigationItems,
  clientNavigationItems,
  getAdminNavigationItems,
  stylistGroupLabels,
  clientGroupLabels,
  adminFullAccessGroupLabels,
  type NavigationItem,
} from "@/config/navigationConfig";

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const { isAdmin, isStylist, isClient } = useUserRole(user?.id);
  const collapsed = state === "collapsed";
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
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
        ? "bg-primary/10 text-primary font-medium"
        : "text-foreground hover:bg-muted/50"
    }`;
  };

  // Get navigation items based on role
  const adminItems = getAdminNavigationItems(isAdmin);
  
  // Admin sees EVERYTHING - Prioritized order: Admin first, then Stylist, then Client
  const baseItems: NavigationItem[] = (() => {
    if (isAdmin) {
      // Prefix client items with "client-" group to differentiate
      const clientItemsWithPrefix = clientNavigationItems.map(item => ({
        ...item,
        group: `client-${item.group}`
      }));
      
      // Admin gets all items in priority order: ADMIN → STYLIST → CLIENT
      return [...adminItems, ...stylistNavigationItems, ...clientItemsWithPrefix];
    }
    
    // Stylist gets only stylist items
    if (isStylist) {
      return stylistNavigationItems;
    }
    
    // Client gets only client items
    return clientNavigationItems;
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
  
  const { items, groupedItems, groupLabels: labels, isLoading, saveSidebarOrder, resetSidebarOrder } = useSidebarOrder(baseItems as SidebarItem[], groupLabels);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
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
      <Sidebar collapsible="icon" className="border-r">
        <SidebarContent className="flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading menu...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="pb-4">
        {/* Today's Schedule Widget - Only for stylists and admins */}
        {(isStylist || isAdmin) && !collapsed && <TodaysScheduleWidget />}
        
        {/* Customize Controls - Only for stylists and admins */}
        {!collapsed && (isStylist || isAdmin) && !isClient && (
          <div className="px-3 py-2 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant={isEditMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex-1 h-9"
                title={isEditMode ? "Finish customizing" : "Drag to prioritize your most-used tools"}
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                {isEditMode ? "Done" : "Customize"}
              </Button>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-9 px-2"
                  title="Reset to recommended order"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {isEditMode && (
              <p className="text-xs text-foreground/70 mt-2">
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
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {Object.entries(groupedItems).map(([groupKey, groupItems], index) => {
              const isGroupCollapsed = collapsedGroups.has(groupKey);
              const showSeparator = isAdmin && index > 0;
              
              return (
                <div key={groupKey}>
                  {showSeparator && <div className="border-t my-2 mx-3" />}
                  <SidebarGroup className="mb-2">
                    <SidebarGroupLabel 
                      className={`${collapsed ? "sr-only" : "cursor-pointer hover:bg-muted/50 rounded px-2 py-1 flex items-center justify-between transition-colors"}`}
                      onClick={() => !collapsed && toggleGroupCollapsed(groupKey)}
                    >
                      <span>{labels[groupKey]}</span>
                      {!collapsed && (
                        <span className="text-xs transition-transform" style={{ transform: isGroupCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                          ▼
                        </span>
                      )}
                    </SidebarGroupLabel>
                    {!isGroupCollapsed && (
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {groupItems.map((item) => (
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
            })}
          </SortableContext>
        </DndContext>

      </SidebarContent>
    </Sidebar>
  );
}
