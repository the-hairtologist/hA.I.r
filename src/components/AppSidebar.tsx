import { useState } from "react";
import {
  Calendar,
  Users,
  MessageSquare,
  Palette,
  DollarSign,
  Sparkles,
  Settings,
  HelpCircle,
  Home,
  CalendarRange,
  Scissors,
  Building2,
  Search,
  LayoutDashboard,
  BookOpen,
  UserPlus,
  Megaphone,
  GripVertical,
  Edit3,
  RotateCcw,
  Package,
  Tag,
  ChevronDown,
  ChevronRight,
  Command,
  Gift,
  Shield,
  Crown,
  Activity,
  Book as BookIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { NotificationDot } from "@/components/NotificationDot";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSidebarOrder, SidebarItem } from "@/hooks/useSidebarOrder";

interface AppSidebarProps {
  userRole?: string;
}

interface SortableNavItemProps {
  item: SidebarItem;
  collapsed: boolean;
  getNavClassName: (props: { isActive: boolean }) => string;
  isEditMode: boolean;
  expandedItems: Set<string>;
  toggleExpanded: (id: string) => void;
  notificationCount?: number;
}

function SortableNavItem({
  item,
  collapsed,
  getNavClassName,
  isEditMode,
  expandedItems,
  toggleExpanded,
  notificationCount,
}: SortableNavItemProps) {
  const location = useLocation();
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
  const isAnyChildActive = hasChildren && item.children?.some(child => 
    location.pathname + location.hash === child.url || location.pathname === child.url.split('#')[0]
  );

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <SidebarMenuButton 
        asChild={!hasChildren} 
        tooltip={item.title} 
        className="min-h-[44px] group relative p-0"
        onClick={hasChildren ? (e) => {
          e.preventDefault();
          toggleExpanded(item.id);
        } : undefined}
      >
        {hasChildren ? (
          <div className={`flex items-center gap-3 w-full cursor-pointer transition-colors duration-200 px-2 py-2 rounded-md ${
            isParentActive || isAnyChildActive
              ? 'bg-primary/10' 
              : 'hover:bg-muted/50'
          }`}>
            {isEditMode && !collapsed && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="relative flex-shrink-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${item.gradient}`}>
                <item.icon className="h-5 w-5 text-on-surface-primary" />
              </div>
              {notificationCount !== undefined && notificationCount > 0 && (
                <NotificationDot count={notificationCount} size="sm" />
              )}
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={`text-sm font-medium truncate ${item.color || 'text-foreground'}`}>
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="text-[10px] text-muted-foreground leading-tight truncate">
                      {item.description}
                    </span>
                  )}
                </div>
                <div className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className={`h-4 w-4 ${item.color || 'text-muted-foreground'}`} />
                </div>
              </>
            )}
          </div>
        ) : (
          <NavLink to={item.url} className={getNavClassName}>
            {isEditMode && !collapsed && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
                onClick={(e) => e.preventDefault()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="relative flex-shrink-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${item.gradient}`}>
                <item.icon className="h-5 w-5 text-on-surface-primary" />
              </div>
              {notificationCount !== undefined && notificationCount > 0 && (
                <NotificationDot count={notificationCount} size="sm" />
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className={`text-sm font-medium truncate ${item.color || 'text-foreground'}`}>
                  {item.title}
                </span>
                {item.description && (
                  <span className="text-[10px] text-muted-foreground leading-tight truncate">
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
            isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <SidebarMenuSub className="mt-1 mb-2 ml-4 space-y-1">
            {item.children!.map((child) => {
              const isChildActive = location.pathname + location.hash === child.url;
              return (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton asChild>
                    <NavLink 
                      to={child.url} 
                      className={`group relative pl-3 pr-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3 ${
                        isChildActive 
                          ? 'bg-primary/10' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${child.gradient} ${
                          isChildActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                        }`}>
                          <child.icon className="h-4 w-4 text-on-surface-primary" />
                        </div>
                      </div>
                      <span className={`text-sm truncate ${child.color || 'text-foreground'}`}>
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

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useUserRole(user?.id);
  const collapsed = state === "collapsed";
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Record<string, number>>({
    messages: 0,
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

  const getNavClassName = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center gap-3 w-full transition-colors duration-200 px-2 py-2 rounded-md ${
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "text-foreground hover:bg-muted/50"
    }`;
  };

  // Stylist Navigation with unique IDs
  const stylistBaseItems: SidebarItem[] = [
    { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "bg-[image:var(--gradient-purple-pink)]", group: "main", color: "text-purple-400 dark:text-purple-300" },
    { id: "find-clients", title: "Find Clients", url: "/client-discovery", icon: UserPlus, gradient: "bg-[image:var(--gradient-cyan-blue)]", group: "main", color: "text-cyan-400 dark:text-cyan-300" },
    { id: "clients", title: "Clients & Formulas", url: "/clients", icon: Users, gradient: "bg-[image:var(--gradient-green-emerald)]", group: "main", color: "text-emerald-400 dark:text-emerald-300" },
    { id: "messages", title: "Messages", url: "/messages", icon: MessageSquare, gradient: "bg-[image:var(--gradient-pink-rose)]", group: "main", color: "text-pink-400 dark:text-pink-300" },
    { id: "appointments", title: "Appointments", url: "/appointments", icon: Calendar, gradient: "bg-[image:var(--gradient-cyan-blue)]", description: "View & manage bookings", group: "scheduling", color: "text-cyan-400 dark:text-cyan-300" },
    { id: "schedule", title: "Schedule", url: "/schedule", icon: CalendarRange, gradient: "bg-[image:var(--gradient-blue-indigo)]", description: "Set working hours", group: "scheduling", color: "text-blue-400 dark:text-blue-300" },
    { id: "services", title: "Services", url: "/services", icon: Scissors, gradient: "bg-[image:var(--gradient-emerald-teal)]", group: "business", color: "text-emerald-400 dark:text-emerald-300" },
    { id: "referrals", title: "Referrals", url: "/referrals", icon: Gift, gradient: "bg-[image:var(--gradient-purple-pink)]", group: "business", color: "text-purple-400 dark:text-purple-300" },
    { 
      id: "finance", 
      title: "Finance", 
      url: "/finance", 
      icon: DollarSign, 
      gradient: "bg-[image:var(--gradient-amber-orange)]", 
      group: "business",
      color: "text-amber-400 dark:text-amber-300",
      children: [
        { id: "finance-commissions", title: "Product Commissions", url: "/finance#commissions", icon: Package, gradient: "bg-[image:var(--gradient-amber-orange)]", group: "business", color: "text-amber-400 dark:text-amber-300" },
        { id: "finance-affiliate", title: "Affiliate Code", url: "/finance#affiliate", icon: Tag, gradient: "bg-[image:var(--gradient-amber-orange)]", group: "business", color: "text-amber-400 dark:text-amber-300" },
      ]
    },
    { id: "portfolio", title: "Portfolio", url: "/portfolio", icon: Palette, gradient: "bg-[image:var(--gradient-orange-red)]", group: "business", color: "text-orange-400 dark:text-orange-300" },
    { id: "knowledge", title: "Knowledge Base", url: "/knowledge", icon: BookOpen, gradient: "bg-[image:var(--gradient-cyan-blue)]", group: "tools", color: "text-cyan-400 dark:text-cyan-300" },
    { id: "ai-assistant", title: "AI Assistant", url: "/ai-assistant", icon: Sparkles, gradient: "bg-[image:var(--gradient-purple-pink)]", group: "tools", color: "text-purple-400 dark:text-purple-300" },
    { id: "integrations", title: "Integrations", url: "/integrations", icon: Building2, gradient: "bg-[image:var(--gradient-amber-orange)]", group: "tools", color: "text-amber-400 dark:text-amber-300" },
  ];

  // Admin-only items
  const adminItems: SidebarItem[] = isAdmin ? [
    { id: "app-directory", title: "App Directory", url: "/app-directory", icon: BookIcon, gradient: "bg-[image:var(--gradient-cyan-blue)]", group: "admin", color: "text-cyan-400 dark:text-cyan-300" },
    { id: "admin-dashboard", title: "Admin Dashboard", url: "/admin/dashboard", icon: Crown, gradient: "bg-[image:var(--gradient-warning)]", group: "admin", color: "text-warning" },
    { id: "admin-users", title: "User Management", url: "/admin/users", icon: Shield, gradient: "bg-[image:var(--gradient-purple-pink)]", group: "admin", color: "text-purple-400 dark:text-purple-300" },
    { id: "system-health", title: "System Health", url: "/system-health", icon: Activity, gradient: "bg-[image:var(--gradient-green-emerald)]", group: "admin", color: "text-green-400 dark:text-green-300" },
  ] : [];

  const stylistAllItems = [...stylistBaseItems, ...adminItems];

  // Client Navigation with unique IDs
  const clientAllItems: SidebarItem[] = [
    { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "bg-[image:var(--gradient-purple-pink)]", group: "main", color: "text-purple-400 dark:text-purple-300" },
    { id: "my-requests", title: "My Requests", url: "/client-requests", icon: Megaphone, gradient: "bg-[image:var(--gradient-amber-orange)]", group: "main", color: "text-amber-400 dark:text-amber-300" },
    { id: "find-stylists", title: "Find Stylists", url: "/stylists", icon: Search, gradient: "bg-[image:var(--gradient-cyan-blue)]", group: "main", color: "text-cyan-400 dark:text-cyan-300" },
    { id: "appointments", title: "Appointments", url: "/appointments", icon: Calendar, gradient: "bg-[image:var(--gradient-pink-rose)]", group: "main", color: "text-pink-400 dark:text-pink-300" },
    { id: "messages", title: "Messages", url: "/messages", icon: MessageSquare, gradient: "bg-[image:var(--gradient-violet-purple)]", group: "main", color: "text-violet-400 dark:text-violet-300" },
    { id: "my-formulas", title: "My Formulas", url: "/formulas", icon: Scissors, gradient: "bg-[image:var(--gradient-emerald-teal)]", group: "tools", color: "text-emerald-400 dark:text-emerald-300" },
    { id: "knowledge", title: "Knowledge Base", url: "/knowledge", icon: BookOpen, gradient: "bg-[image:var(--gradient-cyan-blue)]", group: "tools", color: "text-cyan-400 dark:text-cyan-300" },
    { id: "ai-assistant", title: "AI Assistant", url: "/ai-assistant", icon: Sparkles, gradient: "bg-[image:var(--gradient-purple-pink)]", group: "tools", color: "text-purple-400 dark:text-purple-300" },
  ];

  const defaultItems = userRole === "stylist" ? stylistAllItems : clientAllItems;
  
  const groupLabels = userRole === "stylist" 
    ? isAdmin 
      ? { main: "Main", scheduling: "Scheduling", business: "Business", tools: "Tools", admin: "Admin" }
      : { main: "Main", scheduling: "Scheduling", business: "Business", tools: "Tools" }
    : { main: "Main", tools: "Tools" };
  
  const { items, groupedItems, groupLabels: labels, isLoading, saveSidebarOrder, resetSidebarOrder } = useSidebarOrder(defaultItems, groupLabels);

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
      <SidebarContent>
        {/* Customize Controls */}
        {!collapsed && (
          <div className="px-3 py-2 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant={isEditMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex-1 h-9"
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
                  title="Reset to default"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {isEditMode && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Drag items to reorder
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
            {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
              <SidebarGroup key={groupKey}>
                <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
                  {labels[groupKey]}
                </SidebarGroupLabel>
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
              </SidebarGroup>
            ))}
          </SortableContext>
        </DndContext>

        {/* Separator */}
        <Separator className="my-2" />

        {/* Keyboard Shortcuts - Stylist Only */}
        {!collapsed && userRole === 'stylist' && (
          <div className="px-3 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Trigger keyboard shortcuts dialog by dispatching shift+?
                const event = new KeyboardEvent('keydown', { 
                  key: '?', 
                  shiftKey: true,
                  bubbles: true 
                });
                window.dispatchEvent(event);
              }}
              className="w-full justify-center gap-2 text-xs h-8 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all animate-fade-in"
              aria-label="View keyboard shortcuts"
            >
              <Command className="h-3.5 w-3.5" />
              <span className="font-medium">Keyboard Shortcuts</span>
            </Button>
          </div>
        )}

        {/* Account Section - Sticky Footer */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" className="min-h-[44px]">
                  <NavLink to="/settings" className={getNavClassName}>
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-lg bg-[image:var(--gradient-gray-slate)] flex items-center justify-center transition-opacity hover:opacity-90">
                        <Settings className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                    {!collapsed && <span className="text-sm font-medium">Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help & Support" className="min-h-[44px]">
                  <NavLink to="/resources" className={getNavClassName}>
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-lg bg-[image:var(--gradient-cyan-blue)] flex items-center justify-center transition-opacity hover:opacity-90">
                        <HelpCircle className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                    {!collapsed && <span className="text-sm font-medium">Help & Support</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
