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
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
}

function SortableNavItem({
  item,
  collapsed,
  getNavClassName,
  isEditMode,
}: SortableNavItemProps) {
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

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <SidebarMenuButton asChild tooltip={item.title} className="min-h-[44px]">
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
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
            <item.icon className="h-4 w-4 text-white" />
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
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const [isEditMode, setIsEditMode] = useState(false);

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
    { id: "finance", title: "Finance", url: "/finance", icon: DollarSign, gradient: "from-amber-500 to-orange-500", group: "business" },
    { id: "portfolio", title: "Portfolio", url: "/portfolio", icon: Palette, gradient: "from-orange-500 to-red-500", group: "business" },
    { id: "ai-assistant", title: "AI Assistant", url: "/knowledge", icon: Sparkles, gradient: "from-purple-500 to-pink-500", group: "tools" },
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
    { id: "ai-assistant", title: "AI Assistant", url: "/knowledge", icon: Sparkles, gradient: "from-purple-500 to-pink-500", group: "tools" },
  ];

  const defaultItems = userRole === "stylist" ? stylistAllItems : clientAllItems;
  const { items, isLoading, saveSidebarOrder, resetSidebarOrder } = useSidebarOrder(defaultItems);

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

        {/* Navigation Items */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <SidebarMenu>
                  {items.map((item) => (
                    <SortableNavItem
                      key={item.id}
                      item={item}
                      collapsed={collapsed}
                      getNavClassName={getNavClassName}
                      isEditMode={isEditMode}
                    />
                  ))}
                </SidebarMenu>
              </SortableContext>
            </SidebarGroupContent>
          </SidebarGroup>
        </DndContext>

        {/* Separator */}
        <Separator className="my-2" />

        {/* Account Section - Sticky Footer */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" className="min-h-[44px]">
                  <NavLink to="/settings" className={getNavClassName}>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && <span className="ml-2">Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help & Support" className="min-h-[44px]">
                  <NavLink to="/resources" className={getNavClassName}>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                      <HelpCircle className="h-4 w-4 text-white" />
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
