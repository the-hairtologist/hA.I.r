import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  MessageSquare,
  Sparkles,
  BookOpen,
  DollarSign,
  Settings,
  Users,
  Scissors,
  LayoutDashboard,
  User,
  PiggyBank,
} from "lucide-react";
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

  const stylistItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "from-purple-500 to-pink-500" },
    { title: "Appointments", url: "/appointments", icon: Calendar, gradient: "from-blue-500 to-cyan-500" },
    { title: "Formulas", url: "/formulas", icon: Sparkles, gradient: "from-violet-500 to-purple-500" },
    { title: "Messages", url: "/messages", icon: MessageSquare, gradient: "from-pink-500 to-rose-500" },
    { title: "Services", url: "/services", icon: Scissors, gradient: "from-emerald-500 to-teal-500" },
    { title: "Schedule", url: "/schedule", icon: Settings, gradient: "from-blue-500 to-indigo-500" },
  ];

  const stylistSecondaryItems = [
    { title: "Payments", url: "/payments", icon: DollarSign, gradient: "from-amber-500 to-orange-500" },
    { title: "Commissions", url: "/commissions", icon: PiggyBank, gradient: "from-green-500 to-emerald-500" },
    { title: "Knowledge", url: "/knowledge", icon: BookOpen, gradient: "from-indigo-500 to-purple-500" },
    { title: "AI Assistant", url: "/ai-assistant", icon: Sparkles, gradient: "from-violet-500 to-fuchsia-500" },
  ];

  const clientItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, gradient: "from-purple-500 to-pink-500" },
    { title: "Find Stylists", url: "/stylists", icon: Users, gradient: "from-blue-500 to-cyan-500" },
    { title: "My Appointments", url: "/my-appointments", icon: Calendar, gradient: "from-pink-500 to-rose-500" },
    { title: "Messages", url: "/messages", icon: MessageSquare, gradient: "from-violet-500 to-purple-500" },
    { title: "My Formulas", url: "/my-formulas", icon: Sparkles, gradient: "from-emerald-500 to-teal-500" },
    { title: "Knowledge", url: "/knowledge", icon: BookOpen, gradient: "from-indigo-500 to-purple-500" },
  ];

  const mainItems = userRole === "stylist" ? stylistItems : clientItems;
  const secondaryItems = userRole === "stylist" ? stylistSecondaryItems : [];

  const isActive = (path: string) => location.pathname === path;

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return active
      ? "bg-yellow-400 text-foreground font-bold border-l-4 border-pink-500 shadow-[3px_0_0_0_rgb(236,72,153)]"
      : "hover:bg-orange-400/90 border-l-4 border-transparent hover:border-orange-500 text-foreground bg-orange-500";
  };

  return (
    <Sidebar collapsible="icon" className="border-r-4 border-foreground bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-500">
      <SidebarContent className="gap-0">
        {/* Main Navigation */}
        <SidebarGroup className="border-b-4 border-white/20 pb-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : "text-foreground font-bold text-xs uppercase tracking-wider px-3 py-2 bg-orange-500 rounded-md mx-2"}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation (Stylist Only) */}
        {userRole === "stylist" && secondaryItems.length > 0 && (
          <SidebarGroup className="border-b-4 border-white/20 pb-4">
            <SidebarGroupLabel className={collapsed ? "sr-only" : "text-foreground font-bold text-xs uppercase tracking-wider px-3 py-2 bg-orange-500 rounded-md mx-2"}>
              Business Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={getNavClassName(item.url)}>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span className="ml-2">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Account Section */}
        <SidebarGroup className="mt-auto border-t-4 border-white/30 pt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile">
                  <NavLink to="/profile" className={getNavClassName("/profile")}>
                    <User className="h-5 w-5" />
                    {!collapsed && <span className="ml-2">Profile</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <NavLink to="/settings" className={getNavClassName("/settings")}>
                    <Settings className="h-5 w-5" />
                    {!collapsed && <span className="ml-2">Settings</span>}
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
