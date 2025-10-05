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
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { NotificationDot } from "@/components/NotificationDot";
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
        className="min-h-[44px] group relative"
        onClick={hasChildren ? (e) => {
          e.preventDefault();
          toggleExpanded(item.id);
        } : undefined}
      >
        {hasChildren ? (
          <div className={`flex items-center w-full cursor-pointer transition-all duration-200 ${
            isParentActive || isAnyChildActive
              ? 'bg-primary/10 text-primary font-medium border-l-4 border-primary' 
              : 'text-primary hover:bg-muted/50 border-l-4 border-transparent hover:border-primary/20'
          }`}>
            {isEditMode && !collapsed && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing mr-1 -ml-1"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="relative">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient} transition-transform group-hover:scale-110`}>
                <item.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              {notificationCount !== undefined && notificationCount > 0 && (
                <NotificationDot count={notificationCount} size="sm" />
              )}
            </div>
            {!collapsed && (
              <>
                <div className="ml-2 flex flex-col flex-1">
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.description && (
                    <span className="text-[10px] text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                className="cursor-grab active:cursor-grabbing mr-1 -ml-1"
                onClick={(e) => e.preventDefault()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="relative">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                <item.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              {notificationCount !== undefined && notificationCount > 0 && (
                <NotificationDot count={notificationCount} size="sm" />
              )}
            </div>
            {!collapsed && (
              <div className="ml-2 flex flex-col">
                <span className="text-sm font-medium">{item.title}</span>
                {item.description && (
                  <span className="text-[10px] text-muted-foreground">
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
                      className={`group relative pl-3 py-2 rounded-md transition-all duration-200 ${
                        isChildActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-200 ${
                        isChildActive ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/30'
                      }`} />
                      <child.icon className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${
                        isChildActive ? 'text-primary' : ''
                      }`} />
                      <span className="ml-2 text-sm">{child.title}</span>
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
    return isActive
      ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
      : "hover:bg-muted/50 border-l-4 border-transparent";
  };

  // Stylist Navigation with unique IDs
  const stylistAllItems: SidebarItem[] = [
    { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "from-purple-500 to-pink-500", group: "main" },
    { id: "find-clients", title: "Find Clients", url: "/client-discovery", icon: UserPlus, gradient: "from-cyan-500 to-blue-500", group: "main" },
    { id: "clients", title: "Clients & Formulas", url: "/clients", icon: Users, gradient: "from-green-500 to-emerald-500", group: "main" },
    { id: "messages", title: "Messages", url: "/messages", icon: MessageSquare, gradient: "from-pink-500 to-rose-500", group: "main" },
    { id: "appointments", title: "Appointments", url: "/appointments", icon: Calendar, gradient: "from-blue-500 to-cyan-500", description: "View & manage bookings", group: "scheduling" },
    { id: "schedule", title: "Schedule", url: "/schedule", icon: CalendarRange, gradient: "from-blue-500 to-indigo-500", description: "Set working hours", group: "scheduling" },
    { id: "services", title: "Services", url: "/services", icon: Scissors, gradient: "from-emerald-500 to-teal-500", group: "business" },
    { 
      id: "finance", 
      title: "Finance", 
      url: "/finance", 
      icon: DollarSign, 
      gradient: "from-amber-500 to-orange-500", 
      group: "business",
      children: [
        { id: "finance-commissions", title: "Product Commissions", url: "/finance#commissions", icon: Package, gradient: "from-amber-500 to-orange-500", group: "business" },
        { id: "finance-affiliate", title: "Affiliate Code", url: "/finance#affiliate", icon: Tag, gradient: "from-amber-500 to-orange-500", group: "business" },
      ]
    },
    { id: "portfolio", title: "Portfolio", url: "/portfolio", icon: Palette, gradient: "from-orange-500 to-red-500", group: "business" },
    { id: "knowledge", title: "Knowledge Base", url: "/knowledge", icon: BookOpen, gradient: "from-blue-500 to-cyan-500", group: "tools" },
    { id: "ai-assistant", title: "AI Assistant", url: "/ai-assistant", icon: Sparkles, gradient: "from-purple-500 to-pink-500", group: "tools" },
    { id: "integrations", title: "Integrations", url: "/integrations", icon: Building2, gradient: "from-orange-500 to-amber-500", group: "tools" },
  ];

  // Client Navigation with unique IDs
  const clientAllItems: SidebarItem[] = [
    { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "from-purple-500 to-pink-500", group: "main" },
    { id: "my-requests", title: "My Requests", url: "/client-requests", icon: Megaphone, gradient: "from-orange-500 to-amber-500", group: "main" },
    { id: "find-stylists", title: "Find Stylists", url: "/stylists", icon: Search, gradient: "from-blue-500 to-cyan-500", group: "main" },
    { id: "appointments", title: "Appointments", url: "/appointments", icon: Calendar, gradient: "from-pink-500 to-rose-500", group: "main" },
    { id: "messages", title: "Messages", url: "/messages", icon: MessageSquare, gradient: "from-violet-500 to-purple-500", group: "main" },
    { id: "my-formulas", title: "My Formulas", url: "/formulas", icon: Scissors, gradient: "from-emerald-500 to-teal-500", group: "tools" },
    { id: "knowledge", title: "Knowledge Base", url: "/knowledge", icon: BookOpen, gradient: "from-blue-500 to-cyan-500", group: "tools" },
    { id: "ai-assistant", title: "AI Assistant", url: "/ai-assistant", icon: Sparkles, gradient: "from-purple-500 to-pink-500", group: "tools" },
  ];

  const defaultItems = userRole === "stylist" ? stylistAllItems : clientAllItems;
  
  const groupLabels = userRole === "stylist" 
    ? { main: "Main", scheduling: "Scheduling", business: "Business", tools: "Tools" }
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
          <div className="text-muted-foreground">Loading...</div>
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
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500">
                      <Settings className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {!collapsed && <span className="ml-2">Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help & Support" className="min-h-[44px]">
                  <NavLink to="/resources" className={getNavClassName}>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                      <HelpCircle className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {!collapsed && <span className="ml-2">Help & Support</span>}
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
