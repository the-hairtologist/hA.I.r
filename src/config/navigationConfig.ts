/**
 * Navigation Configuration
 * Centralized navigation items for sidebar and mobile nav
 */
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
  Command,
  Gift,
  Shield,
  Crown,
  FileText,
  Activity,
  Book as BookIcon,
  Bell,
  Star,
  Link2,
  UserCircle,
  Clock,
  Mail,
  TrendingUp,
  MessageCircle,
  Plus,
  Beaker,
  Heart,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  title: string;
  url: string;
  icon: LucideIcon;
  gradient: string;
  group: string;
  color?: string;
  description?: string;
  comingSoon?: boolean;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  [key: string]: string;
}

// Stylist Navigation Items
export const stylistNavigationItems: NavigationItem[] = [
  { 
    id: "dashboard", 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard, 
    gradient: "bg-[image:var(--gradient-purple-pink)]", 
    group: "main", 
    color: "text-purple-400 dark:text-purple-300" 
  },
  { 
    id: "calendar", 
    title: "Appointments", 
    url: "/appointments", 
    icon: Calendar, 
    gradient: "bg-[image:var(--gradient-cyan-blue)]", 
    group: "main", 
    color: "text-cyan-400 dark:text-cyan-300" 
  },
  { 
    id: "clients", 
    title: "Clients", 
    url: "/clients", 
    icon: Users, 
    gradient: "bg-[image:var(--gradient-green-emerald)]", 
    group: "main", 
    color: "text-emerald-400 dark:text-emerald-300" 
  },
  { 
    id: "find-clients", 
    title: "Find Clients", 
    url: "/client-discovery", 
    icon: Search, 
    gradient: "bg-[image:var(--gradient-cyan-blue)]", 
    group: "main", 
    color: "text-cyan-400 dark:text-cyan-300",
    comingSoon: true,
    description: "Browse client requests"
  },
  { 
    id: "messages", 
    title: "Messages", 
    url: "/messages", 
    icon: MessageSquare, 
    gradient: "bg-[image:var(--gradient-pink-rose)]", 
    group: "main", 
    color: "text-pink-400 dark:text-pink-300" 
  },
  { 
    id: "business", 
    title: "Business", 
    url: "#", 
    icon: DollarSign, 
    gradient: "bg-[image:var(--gradient-amber-orange)]", 
    group: "business", 
    color: "text-amber-400 dark:text-amber-300",
    children: [
      { 
        id: "finance", 
        title: "Finance Hub", 
        url: "/finance", 
        icon: DollarSign, 
        gradient: "bg-[image:var(--gradient-amber-orange)]", 
        group: "business",
        color: "text-amber-400 dark:text-amber-300" 
      },
      { 
        id: "services", 
        title: "Services & Pricing", 
        url: "/services", 
        icon: Scissors, 
        gradient: "bg-[image:var(--gradient-emerald-teal)]", 
        group: "business",
        color: "text-emerald-400 dark:text-emerald-300" 
      },
      { 
        id: "reviews", 
        title: "Client Reviews", 
        url: "/stylist/reviews", 
        icon: Star,
        gradient: "bg-[image:var(--gradient-amber-orange)]", 
        group: "business",
        color: "text-amber-400 dark:text-amber-300" 
      },
    ]
  },
  { 
    id: "availability", 
    title: "Availability", 
    url: "/schedule", 
    icon: Clock, 
    gradient: "bg-[image:var(--gradient-blue-indigo)]", 
    group: "scheduling", 
    color: "text-blue-400 dark:text-blue-300",
    description: "Set your working hours"
  },
  { 
    id: "booking-page", 
    title: "Booking Page", 
    url: "/booking-page", 
    icon: Link2, 
    gradient: "bg-[image:var(--gradient-purple-pink)]", 
    group: "scheduling", 
    color: "text-purple-400 dark:text-purple-300" 
  },
  { 
    id: "growth", 
    title: "Growth & Marketing", 
    url: "#", 
    icon: TrendingUp, 
    gradient: "bg-[image:var(--gradient-green-emerald)]", 
    group: "growth", 
    color: "text-emerald-400 dark:text-emerald-300",
    children: [
      { 
        id: "analytics", 
        title: "Analytics", 
        url: "/analytics", 
        icon: Activity, 
        gradient: "bg-[image:var(--gradient-green-emerald)]", 
        group: "growth",
        color: "text-emerald-400 dark:text-emerald-300" 
      },
      { 
        id: "referrals", 
        title: "Referrals", 
        url: "/referrals", 
        icon: Gift, 
        gradient: "bg-[image:var(--gradient-purple-pink)]", 
        group: "growth",
        color: "text-purple-400 dark:text-purple-300" 
      },
      { 
        id: "portfolio", 
        title: "Portfolio", 
        url: "/portfolio", 
        icon: Palette, 
        gradient: "bg-[image:var(--gradient-orange-red)]", 
        group: "growth",
        color: "text-orange-400 dark:text-orange-300" 
      },
      { 
        id: "email-campaigns", 
        title: "Email Campaigns", 
        url: "/email-campaigns", 
        icon: Mail, 
        gradient: "bg-[image:var(--gradient-purple-pink)]", 
        group: "growth",
        color: "text-purple-400 dark:text-purple-300" 
      },
      { 
        id: "email-sequences", 
        title: "Email Sequences", 
        url: "/email-sequences", 
        icon: Mail, 
        gradient: "bg-[image:var(--gradient-cyan-blue)]", 
        group: "growth",
        color: "text-cyan-400 dark:text-cyan-300",
        description: "Automated email campaigns"
      },
      { 
        id: "ad-generator", 
        title: "Ad Generator", 
        url: "/ad-generator", 
        icon: Sparkles, 
        gradient: "bg-[image:var(--gradient-purple-pink)]", 
        group: "growth",
        color: "text-purple-400 dark:text-purple-300",
        description: "Create marketing content with AI"
      },
    ]
  },
  { 
    id: "ai-assistant", 
    title: "AI Assistant", 
    url: "/ai-assistant", 
    icon: Sparkles, 
    gradient: "bg-[image:var(--gradient-purple-pink)]", 
    group: "tools", 
    color: "text-purple-400 dark:text-purple-300" 
  },
  { 
    id: "knowledge", 
    title: "Knowledge", 
    url: "/knowledge", 
    icon: BookOpen, 
    gradient: "bg-[image:var(--gradient-cyan-blue)]", 
    group: "tools", 
    color: "text-cyan-400 dark:text-cyan-300" 
  },
  { 
    id: "integrations", 
    title: "Integrations", 
    url: "/integrations", 
    icon: Building2, 
    gradient: "bg-[image:var(--gradient-amber-orange)]", 
    group: "tools", 
    color: "text-amber-400 dark:text-amber-300" 
  },
  { 
    id: "settings", 
    title: "Settings", 
    url: "/settings", 
    icon: Settings, 
    gradient: "bg-[image:var(--gradient-blue-indigo)]", 
    group: "tools", 
    color: "text-blue-400 dark:text-blue-300" 
  },
  { 
    id: "help", 
    title: "Help", 
    url: "/help", 
    icon: HelpCircle, 
    gradient: "bg-[image:var(--gradient-cyan-blue)]", 
    group: "tools", 
    color: "text-cyan-400 dark:text-cyan-300" 
  },
  { 
    id: "feedback", 
    title: "Feedback", 
    url: "/feedback", 
    icon: MessageCircle, 
    gradient: "bg-[image:var(--gradient-orange-red)]", 
    group: "tools", 
    color: "text-orange-400 dark:text-orange-300",
    description: "Share ideas & report issues"
  },
];

// Admin Navigation Items
export const getAdminNavigationItems = (isAdmin: boolean): NavigationItem[] => {
  if (!isAdmin) return [];
  
  return [
    { 
      id: "admin-command", 
      title: "Command Center", 
      url: "/admin/command", 
      icon: Crown, 
      gradient: "bg-gradient-to-br from-amber-500 to-yellow-600", 
      group: "admin", 
      color: "text-amber-400 dark:text-amber-300", 
      description: "Full platform control" 
    },
    { 
      id: "admin-users", 
      title: "User Management", 
      url: "/admin/users", 
      icon: Users, 
      gradient: "bg-[image:var(--gradient-cyan-blue)]", 
      group: "admin", 
      color: "text-cyan-400 dark:text-cyan-300",
      description: "Users, roles & profiles" 
    },
    { 
      id: "audit-logs", 
      title: "Audit Logs", 
      url: "/admin/audit-logs", 
      icon: FileText, 
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600", 
      group: "admin", 
      color: "text-purple-400 dark:text-purple-300",
      description: "Security & compliance logs" 
    },
    { 
      id: "system-health", 
      title: "System Health", 
      url: "/system-health", 
      icon: Activity,
      gradient: "bg-[image:var(--gradient-green-emerald)]", 
      group: "admin", 
      color: "text-emerald-400 dark:text-emerald-300",
      description: "Monitor performance" 
    },
  ];
};

// Client Navigation Items - Minimal working features only
// Coming Soon features removed until implementation
export const clientNavigationItems: NavigationItem[] = [
  // MAIN (Core working features)
  { 
    id: "dashboard", 
    title: "Home", 
    url: "/dashboard", 
    icon: Home, 
    gradient: "bg-[image:var(--gradient-purple-pink)]", 
    group: "main", 
    color: "text-purple-400 dark:text-purple-300",
    description: "Your dashboard"
  },
  { 
    id: "my-appointments", 
    title: "Appointments", 
    url: "/appointments", 
    icon: Calendar, 
    gradient: "bg-[image:var(--gradient-cyan-blue)]", 
    group: "main", 
    color: "text-cyan-400 dark:text-cyan-300",
    description: "View bookings"
  },
  { 
    id: "messages", 
    title: "Messages", 
    url: "/messages", 
    icon: MessageSquare, 
    gradient: "bg-[image:var(--gradient-blue-indigo)]", 
    group: "main", 
    color: "text-blue-400 dark:text-blue-300",
    description: "Chat with stylist"
  },
  
  // INFO (Client records - working)
  { 
    id: "my-formulas", 
    title: "Hair History", 
    url: "/client-formulas", 
    icon: Beaker, 
    gradient: "bg-[image:var(--gradient-purple-pink)]", 
    group: "info", 
    color: "text-purple-400 dark:text-purple-300",
    description: "Your formulas"
  },
  { 
    id: "notifications", 
    title: "Notifications", 
    url: "/notifications", 
    icon: Bell, 
    gradient: "bg-[image:var(--gradient-orange-red)]", 
    group: "info", 
    color: "text-orange-400 dark:text-orange-300",
    description: "Updates"
  },
  
  // ACCOUNT (Settings & profile - working)
  { 
    id: "profile", 
    title: "Profile", 
    url: "/profile", 
    icon: UserCircle, 
    gradient: "bg-[image:var(--gradient-blue-indigo)]", 
    group: "account", 
    color: "text-blue-400 dark:text-blue-300",
    description: "Your info"
  },
  { 
    id: "settings", 
    title: "Settings", 
    url: "/settings", 
    icon: Settings, 
    gradient: "bg-[image:var(--gradient-blue-indigo)]", 
    group: "account", 
    color: "text-blue-400 dark:text-blue-300",
    description: "Preferences"
  },
  
  // HELP (Support resources - working)
  { 
    id: "knowledge", 
    title: "Hair Tips", 
    url: "/knowledge", 
    icon: BookOpen, 
    gradient: "bg-[image:var(--gradient-cyan-blue)]", 
    group: "help", 
    color: "text-cyan-400 dark:text-cyan-300",
    description: "Learn more"
  },
  { 
    id: "help", 
    title: "Help", 
    url: "/help", 
    icon: HelpCircle, 
    gradient: "bg-[image:var(--gradient-purple-pink)]", 
    group: "help", 
    color: "text-purple-400 dark:text-purple-300",
    description: "Support"
  },
];

// REMOVED ITEMS (Coming Soon - will be re-added when implemented):
// - Book Appointment (broken primary action)
// - Favorites (broken feature)
// These will be added back once the features are built

// Group Labels
export const stylistGroupLabels: NavigationGroup = {
  main: "Main",
  marketplace: "Marketplace",
  scheduling: "Scheduling",
  business: "Business",
  growth: "Growth & Marketing",
  tools: "Tools",
  account: "Account",
  help: "Support",
};

export const stylistAdminGroupLabels: NavigationGroup = {
  ...stylistGroupLabels,
  admin: "Platform Administration",
};

export const clientGroupLabels: NavigationGroup = {
  main: "Main",
  info: "My Info",
  account: "Account",
  help: "Resources",
};

export const clientAdminGroupLabels: NavigationGroup = {
  ...clientGroupLabels,
  admin: "Platform Administration",
};
