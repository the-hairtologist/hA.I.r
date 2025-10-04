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
  ChevronRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AppSidebarProps {
  userRole?: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const getNavClassName = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
      : "hover:bg-muted/50 border-l-4 border-transparent";
  };

  // Stylist Navigation
  const stylistMainItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "from-purple-500 to-pink-500" },
    { title: "Clients", url: "/clients", icon: Users, gradient: "from-green-500 to-emerald-500" },
    { title: "Messages", url: "/messages", icon: MessageSquare, gradient: "from-pink-500 to-rose-500" },
  ];

  const stylistSchedulingItems = [
    { 
      title: "Appointments", 
      url: "/appointments", 
      icon: Calendar, 
      gradient: "from-blue-500 to-cyan-500",
      description: "View & manage bookings"
    },
    { 
      title: "Schedule", 
      url: "/schedule", 
      icon: CalendarRange, 
      gradient: "from-blue-500 to-indigo-500",
      description: "Set working hours"
    },
  ];

  const stylistBusinessItems = [
    { title: "Services", url: "/services", icon: Scissors, gradient: "from-emerald-500 to-teal-500" },
    { title: "Finance", url: "/finance", icon: DollarSign, gradient: "from-amber-500 to-orange-500" },
    { title: "Portfolio", url: "/portfolio", icon: Palette, gradient: "from-orange-500 to-red-500" },
  ];

  const stylistToolsItems = [
    { 
      title: "AI Assistant", 
      icon: Sparkles, 
      gradient: "from-purple-500 to-pink-500",
      subItems: [
        { title: "Chat Assistant", url: "/knowledge" },
        { title: "Formula Generator", url: "/formulas" },
      ]
    },
    { title: "Integrations", url: "/integrations", icon: Building2, gradient: "from-orange-500 to-amber-500" },
  ];

  // Client Navigation
  const clientMainItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "from-purple-500 to-pink-500" },
    { title: "Find Stylists", url: "/stylists", icon: Search, gradient: "from-blue-500 to-cyan-500" },
    { title: "Appointments", url: "/appointments", icon: Calendar, gradient: "from-pink-500 to-rose-500" },
    { title: "Messages", url: "/messages", icon: MessageSquare, gradient: "from-violet-500 to-purple-500" },
  ];

  const clientToolsItems = [
    { title: "My Formulas", url: "/formulas", icon: Scissors, gradient: "from-emerald-500 to-teal-500" },
    { title: "AI Assistant", url: "/knowledge", icon: Sparkles, gradient: "from-purple-500 to-pink-500" },
  ];

  // Determine which items to show based on role
  const mainItems = userRole === "stylist" ? stylistMainItems : clientMainItems;
  const schedulingItems = userRole === "stylist" ? stylistSchedulingItems : [];
  const businessItems = userRole === "stylist" ? stylistBusinessItems : [];
  const toolsItems = userRole === "stylist" ? stylistToolsItems : clientToolsItems;

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={getNavClassName}>
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Scheduling Section (Stylist Only) - Always Visible */}
        {userRole === "stylist" && schedulingItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
              Scheduling
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {schedulingItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={getNavClassName}>
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        {!collapsed && (
                          <div className="ml-2 flex flex-col">
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="text-[10px] text-muted-foreground">{item.description}</span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Business Tools (Stylist Only) */}
        {userRole === "stylist" && businessItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
              Business
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {businessItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={getNavClassName}>
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        {!collapsed && <span className="ml-2">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                item.subItems ? (
                  <Collapsible key={item.title} asChild defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                            <item.icon className="h-4 w-4 text-white" />
                          </div>
                          {!collapsed && <span className="ml-2">{item.title}</span>}
                          {!collapsed && (
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!collapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((subItem: any) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <NavLink to={subItem.url} className={getNavClassName}>
                                    <span>{subItem.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={getNavClassName}>
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        {!collapsed && <span className="ml-2">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <Separator className="my-2" />

        {/* Account Section - Sticky Footer */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <NavLink to="/settings" className={getNavClassName}>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && <span className="ml-2">Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help & Support">
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
