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
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  userRole?: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return active
      ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
      : "hover:bg-muted/50 border-l-4 border-transparent";
  };

  // Stylist Navigation
  const stylistMainItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "from-purple-500 to-pink-500" },
    { title: "Appointments", url: "/appointments", icon: Calendar, gradient: "from-blue-500 to-cyan-500" },
    { title: "Clients", url: "/clients", icon: Users, gradient: "from-green-500 to-emerald-500" },
    { title: "Messages", url: "/messages", icon: MessageSquare, gradient: "from-pink-500 to-rose-500" },
  ];

  const stylistBusinessItems = [
    { title: "Schedule", url: "/schedule", icon: CalendarRange, gradient: "from-blue-500 to-indigo-500" },
    { title: "Services", url: "/services", icon: Scissors, gradient: "from-emerald-500 to-teal-500" },
    { title: "Formulas", url: "/formulas", icon: Sparkles, gradient: "from-violet-500 to-purple-500" },
    { title: "Finance", url: "/finance", icon: DollarSign, gradient: "from-amber-500 to-orange-500" },
    { title: "Portfolio", url: "/portfolio", icon: Palette, gradient: "from-orange-500 to-red-500" },
  ];

  const stylistToolsItems = [
    { title: "Knowledge Base", url: "/knowledge", icon: BookOpen, gradient: "from-blue-500 to-indigo-500" },
    { title: "Resources", url: "/resources", icon: Sparkles, gradient: "from-violet-500 to-fuchsia-500" },
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
    { title: "Knowledge Base", url: "/knowledge", icon: BookOpen, gradient: "from-blue-500 to-indigo-500" },
    { title: "Resources", url: "/resources", icon: Sparkles, gradient: "from-indigo-500 to-purple-500" },
  ];

  // Determine which items to show based on role
  const mainItems = userRole === "stylist" ? stylistMainItems : clientMainItems;
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
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
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
                      <NavLink to={item.url} className={getNavClassName(item.url)}>
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
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
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

        {/* Account Section - Sticky Footer */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <NavLink to="/settings" className={getNavClassName("/settings")}>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && <span className="ml-2">Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help">
                  <NavLink to="/resources" className={getNavClassName("/resources")}>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                      <HelpCircle className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && <span className="ml-2">Help</span>}
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
