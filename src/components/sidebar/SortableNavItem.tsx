import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocation, NavLink } from 'react-router-dom';
import { ChevronDown, GripVertical } from 'lucide-react';
import { NavigationItem } from '@/config/navigationConfig';
import { NotificationDot } from '@/components/NotificationDot';
import { usePrefetch } from '@/hooks/usePrefetch';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';

interface SortableNavItemProps {
  item: NavigationItem;
  collapsed: boolean;
  getNavClassName: (props: { isActive: boolean }) => string;
  isEditMode: boolean;
  expandedItems: Set<string>;
  toggleExpanded: (id: string) => void;
  notificationCount?: number;
}

export function SortableNavItem({
  item,
  collapsed,
  getNavClassName,
  isEditMode,
  expandedItems,
  toggleExpanded,
  notificationCount,
}: SortableNavItemProps) {
  const location = useLocation();
  const { prefetchRelated } = usePrefetch();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isParentActive = location.pathname === item.url.split('#')[0];
  const isAnyChildActive =
    hasChildren &&
    item.children?.some(
      child =>
        location.pathname + location.hash === child.url ||
        location.pathname === child.url.split('#')[0]
    );

  // Smart prefetch on hover
  const handleMouseEnter = () => {
    if (!isEditMode) {
      prefetchRelated(item.url, 'user-id'); // Will prefetch related data
    }
  };

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <SidebarMenuButton
        asChild={!hasChildren}
        tooltip={item.title}
        className={`min-h-[44px] group relative p-0 ${collapsed ? 'flex justify-center items-center' : ''}`}
        onClick={
          hasChildren
            ? e => {
                e.preventDefault();
                toggleExpanded(item.id);
              }
            : undefined
        }
        onMouseEnter={handleMouseEnter}
      >
        {hasChildren ? (
          <div
            className={`flex items-center gap-3 w-full cursor-pointer transition-colors duration-200 px-2 py-2 rounded-md ${
              isParentActive || isAnyChildActive
                ? 'bg-primary/10'
                : 'hover:bg-muted/50'
            }`}
          >
            {isEditMode && !collapsed && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
                onClick={e => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="relative flex-shrink-0">
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 brutal-border-subtle border-foreground/20 shadow-brutal-xs hover:shadow-brutal-sm hover:border-foreground/30 hover:-translate-y-0.5 active:shadow-none active:translate-y-0 ${item.gradient}`}
              >
                <item.icon className="h-5 w-5 text-on-surface-primary" />
              </div>
              {notificationCount !== undefined && notificationCount > 0 && (
                <NotificationDot count={notificationCount} size="sm" />
              )}
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium truncate ${item.color || 'text-foreground'}`}
                    >
                      {item.title}
                    </span>
                    {item.comingSoon && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-on-surface-primary shadow-sm whitespace-nowrap">
                        Soon
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <span className="text-xs text-muted-foreground leading-tight truncate">
                      {item.description}
                    </span>
                  )}
                </div>
                <div
                  className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <ChevronDown
                    className={`h-4 w-4 ${item.color || 'text-muted-foreground'}`}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <NavLink
            to={item.url}
            className={getNavClassName}
            onMouseEnter={handleMouseEnter}
          >
            {isEditMode && !collapsed && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
                onClick={e => e.preventDefault()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="relative flex-shrink-0">
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 brutal-border-subtle border-foreground/20 shadow-brutal-xs hover:shadow-brutal-sm hover:border-foreground/30 hover:-translate-y-0.5 active:shadow-none active:translate-y-0 ${item.gradient}`}
              >
                <item.icon className="h-5 w-5 text-on-surface-primary" />
              </div>
              {notificationCount !== undefined && notificationCount > 0 && (
                <NotificationDot count={notificationCount} size="sm" />
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium truncate ${item.color || 'text-foreground'}`}
                  >
                    {item.title}
                  </span>
                  {item.comingSoon && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-on-surface-primary shadow-sm whitespace-nowrap">
                      Soon
                    </span>
                  )}
                </div>
                {item.description && (
                  <span className="text-xs text-muted-foreground leading-tight truncate">
                    {item.description}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        )}
      </SidebarMenuButton>
      {hasChildren && !collapsed && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <SidebarMenuSub className="mt-1 mb-2 ml-4 space-y-1">
            {item.children!.map(child => {
              const isChildActive =
                location.pathname + location.hash === child.url;
              return (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton asChild>
                    <NavLink
                      to={child.url}
                      className={`group relative pl-3 pr-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3 ${
                        isChildActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 brutal-border-subtle border-foreground/15 shadow-[1px_1px_0px_0px_hsl(var(--foreground)/0.1)] hover:shadow-brutal-xs hover:border-foreground/25 ${child.gradient} ${
                            isChildActive
                              ? 'opacity-100'
                              : 'opacity-70 group-hover:opacity-100'
                          }`}
                        >
                          <child.icon className="h-4 w-4 text-on-surface-primary" />
                        </div>
                      </div>
                      <span
                        className={`text-sm truncate ${child.color || 'text-foreground'}`}
                      >
                        {child.title}
                      </span>
                    </NavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </div>
      )}
    </SidebarMenuItem>
  );
}
