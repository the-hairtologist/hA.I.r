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
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';

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
    id: 'dashboard',
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    gradient: 'bg-gradient-purple-pink',
    group: 'main',
    color: 'text-purple-400 dark:text-purple-300',
  },
  {
    id: 'calendar',
    title: 'Appointments',
    url: '/appointments',
    icon: Calendar,
    gradient: 'bg-gradient-cyan-blue',
    group: 'main',
    color: 'text-cyan-400 dark:text-cyan-300',
  },
  {
    id: 'clients',
    title: 'Clients',
    url: '/clients',
    icon: Users,
    gradient: 'bg-gradient-green-emerald',
    group: 'main',
    color: 'text-emerald-400 dark:text-emerald-300',
  },
  // REMOVED: CRM Dashboard - feature removed per user request
  {
    id: 'sales',
    title: 'Sales Dashboard',
    url: '/sales-dashboard',
    icon: TrendingUp,
    gradient: 'bg-gradient-green-emerald',
    group: 'business',
    color: 'text-emerald-400 dark:text-emerald-300',
    description: 'Revenue analytics',
  },
  {
    id: 'support-chat',
    title: 'AI Support Chat',
    url: '/support-chat',
    icon: MessageCircle,
    gradient: 'bg-gradient-cyan-blue',
    group: 'tools',
    color: 'text-cyan-400 dark:text-cyan-300',
    description: '24/7 client support bot',
  },
  {
    id: 'formulas',
    title: 'Formulas',
    url: '/formulas',
    icon: Beaker,
    gradient: 'bg-gradient-purple-pink',
    group: 'main',
    color: 'text-purple-400 dark:text-purple-300',
    description: 'Client hair formulas',
  },
  // REMOVED: "Find Clients" - feature not implemented (was comingSoon: true)
  {
    id: 'messages',
    title: 'Messages',
    url: '/messages',
    icon: MessageSquare,
    gradient: 'bg-gradient-pink-rose',
    group: 'main',
    color: 'text-pink-400 dark:text-pink-300',
  },
  {
    id: 'business',
    title: 'Business',
    url: '#',
    icon: DollarSign,
    gradient: 'bg-gradient-amber-orange',
    group: 'business',
    color: 'text-amber-400 dark:text-amber-300',
    children: [
      {
        id: 'finance',
        title: 'Finance Hub',
        url: '/finance',
        icon: DollarSign,
        gradient: 'bg-gradient-amber-orange',
        group: 'business',
        color: 'text-amber-400 dark:text-amber-300',
      },
      {
        id: 'services',
        title: 'Services & Pricing',
        url: '/services',
        icon: Scissors,
        gradient: 'bg-gradient-emerald-teal',
        group: 'business',
        color: 'text-emerald-400 dark:text-emerald-300',
      },
      {
        id: 'reviews',
        title: 'Client Reviews',
        url: '/stylist/reviews',
        icon: Star,
        gradient: 'bg-gradient-amber-orange',
        group: 'business',
        color: 'text-amber-400 dark:text-amber-300',
      },
    ],
  },
  {
    id: 'availability',
    title: 'Availability',
    url: '/schedule',
    icon: Clock,
    gradient: 'bg-gradient-blue-indigo',
    group: 'scheduling',
    color: 'text-blue-400 dark:text-blue-300',
    description: 'Set your working hours',
  },
  {
    id: 'booking-page',
    title: 'Booking Page',
    url: '/booking-page',
    icon: Link2,
    gradient: 'bg-gradient-purple-pink',
    group: 'scheduling',
    color: 'text-purple-400 dark:text-purple-300',
  },
  {
    id: 'growth',
    title: 'Growth & Marketing',
    url: '#',
    icon: TrendingUp,
    gradient: 'bg-gradient-green-emerald',
    group: 'growth',
    color: 'text-emerald-400 dark:text-emerald-300',
    children: [
      {
        id: 'retention',
        title: 'Client Retention',
        url: '/client-retention',
        icon: Heart,
        gradient: 'bg-gradient-pink-rose',
        group: 'growth',
        color: 'text-pink-400 dark:text-pink-300',
        description: 'AI-powered client retention insights',
      },
      {
        id: 'analytics',
        title: 'Analytics',
        url: '/analytics',
        icon: Activity,
        gradient: 'bg-gradient-green-emerald',
        group: 'growth',
        color: 'text-emerald-400 dark:text-emerald-300',
      },
      {
        id: 'referrals',
        title: 'Referrals',
        url: '/referrals',
        icon: Gift,
        gradient: 'bg-gradient-purple-pink',
        group: 'growth',
        color: 'text-purple-400 dark:text-purple-300',
      },
      {
        id: 'portfolio',
        title: 'Portfolio',
        url: '/portfolio',
        icon: Palette,
        gradient: 'bg-gradient-orange-red',
        group: 'growth',
        color: 'text-orange-400 dark:text-orange-300',
      },
      {
        id: 'email-campaigns',
        title: 'Email Campaigns',
        url: '/email-campaigns',
        icon: Mail,
        gradient: 'bg-gradient-purple-pink',
        group: 'growth',
        color: 'text-purple-400 dark:text-purple-300',
      },
      {
        id: 'email-sequences',
        title: 'Email Sequences',
        url: '/email-sequences',
        icon: Mail,
        gradient: 'bg-gradient-cyan-blue',
        group: 'growth',
        color: 'text-cyan-400 dark:text-cyan-300',
        description: 'Automated email campaigns',
      },
      {
        id: 'intake-forms',
        title: 'Client Forms',
        url: '/intake-forms',
        icon: FileText,
        gradient: 'bg-gradient-purple-blue',
        group: 'growth',
        color: 'text-purple-400 dark:text-purple-300',
        description: 'Client intake forms',
      },
      {
        id: 'aftercare-guides',
        title: 'Care Guides',
        url: '/aftercare-guides',
        icon: Sparkles,
        gradient: 'bg-gradient-green-teal',
        group: 'growth',
        color: 'text-green-400 dark:text-green-300',
        description: 'Aftercare instructions',
      },
      {
        id: 'ad-generator',
        title: 'Ad Generator',
        url: '/ad-generator',
        icon: Sparkles,
        gradient: 'bg-gradient-purple-pink',
        group: 'growth',
        color: 'text-purple-400 dark:text-purple-300',
        description: 'Create marketing content with AI',
      },
    ],
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    url: '/ai-assistant',
    icon: Sparkles,
    gradient: 'bg-gradient-purple-pink',
    group: 'tools',
    color: 'text-purple-400 dark:text-purple-300',
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    url: '/knowledge',
    icon: BookOpen,
    gradient: 'bg-gradient-cyan-blue',
    group: 'tools',
    color: 'text-cyan-400 dark:text-cyan-300',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    url: '/integrations',
    icon: Building2,
    gradient: 'bg-gradient-amber-orange',
    group: 'tools',
    color: 'text-amber-400 dark:text-amber-300',
  },
  {
    id: 'settings',
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    gradient: 'bg-gradient-blue-indigo',
    group: 'tools',
    color: 'text-blue-400 dark:text-blue-300',
  },
  {
    id: 'help',
    title: 'Support Center',
    url: '/help',
    icon: HelpCircle,
    gradient: 'bg-gradient-cyan-blue',
    group: 'tools',
    color: 'text-cyan-400 dark:text-cyan-300',
    description: 'Help docs, FAQs & feedback',
  },
];

// Admin Navigation Items
export const getAdminNavigationItems = (isAdmin: boolean): NavigationItem[] => {
  if (!isAdmin) return [];

  return [
    {
      id: 'admin-command',
      title: 'Command Center',
      url: '/admin/command',
      icon: Crown,
      gradient: 'bg-gradient-to-br from-amber-500 to-yellow-600',
      group: 'admin',
      color: 'text-amber-400 dark:text-amber-300',
      description: 'Full platform control',
    },
    {
      id: 'admin-revenue',
      title: 'Revenue Analytics',
      url: '/admin/revenue',
      icon: TrendingUp,
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-600',
      group: 'admin',
      color: 'text-emerald-400 dark:text-emerald-300',
      description: 'Financial intelligence & profits',
    },
    {
      id: 'admin-users',
      title: 'User Management',
      url: '/admin/users',
      icon: Users,
      gradient: 'bg-gradient-cyan-blue',
      group: 'admin',
      color: 'text-cyan-400 dark:text-cyan-300',
      description: 'Users, roles & profiles',
    },
    {
      id: 'audit-logs',
      title: 'Audit Logs',
      url: '/admin/audit-logs',
      icon: FileText,
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
      group: 'admin',
      color: 'text-purple-400 dark:text-purple-300',
      description: 'Security & compliance logs',
    },
    {
      id: 'audit-report',
      title: 'Audit Report',
      url: '/admin/audit-report',
      icon: ClipboardCheck,
      gradient: 'bg-gradient-green-emerald',
      group: 'admin',
      color: 'text-emerald-400 dark:text-emerald-300',
      description: 'Comprehensive platform audit',
    },
    {
      id: 'system-health',
      title: 'System Health',
      url: '/system-health',
      icon: Activity,
      gradient: 'bg-gradient-green-emerald',
      group: 'admin',
      color: 'text-emerald-400 dark:text-emerald-300',
      description: 'Monitor performance',
    },
    {
      id: 'automation-monitoring',
      title: 'Automation Monitor',
      url: '/admin/automation',
      icon: Clock,
      gradient: 'bg-gradient-purple-pink',
      group: 'admin',
      color: 'text-purple-400 dark:text-purple-300',
      description: 'Track automated systems',
    },
  ];
};

// Client Navigation Items - Optimized for key actions
export const clientNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Home',
    url: '/dashboard',
    icon: Home,
    gradient: 'bg-gradient-purple-pink',
    group: 'main',
    color: 'text-purple-400 dark:text-purple-300',
    description: 'Your dashboard',
  },
  {
    id: 'book-appointment',
    title: 'Book Appointment',
    url: '/book-appointment',
    icon: Plus,
    gradient: 'bg-gradient-green-emerald',
    group: 'main',
    color: 'text-emerald-400 dark:text-emerald-300',
    description: 'Schedule a service',
  },
  {
    id: 'my-appointments',
    title: 'My Appointments',
    url: '/appointments',
    icon: Calendar,
    gradient: 'bg-gradient-cyan-blue',
    group: 'main',
    color: 'text-cyan-400 dark:text-cyan-300',
    description: 'View bookings',
  },
  {
    id: 'messages',
    title: 'Messages',
    url: '/messages',
    icon: MessageSquare,
    gradient: 'bg-gradient-blue-indigo',
    group: 'main',
    color: 'text-blue-400 dark:text-blue-300',
    description: 'Chat with stylist',
  },
  {
    id: 'my-formulas',
    title: 'Hair History',
    url: '/client-formulas',
    icon: Beaker,
    gradient: 'bg-gradient-purple-pink',
    group: 'info',
    color: 'text-purple-400 dark:text-purple-300',
    description: 'Your formulas',
  },
  {
    id: 'profile',
    title: 'My Profile',
    url: '/profile',
    icon: UserCircle,
    gradient: 'bg-gradient-blue-indigo',
    group: 'account',
    color: 'text-blue-400 dark:text-blue-300',
    description: 'Your info',
  },
  {
    id: 'settings',
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    gradient: 'bg-gradient-blue-indigo',
    group: 'account',
    color: 'text-blue-400 dark:text-blue-300',
    description: 'Preferences',
  },
];

// REMOVED ITEMS (Coming Soon - will be re-added when implemented):
// - Book Appointment (broken primary action)
// - Favorites (broken feature)
// These will be added back once the features are built

// Group Labels - Action-oriented naming
export const stylistGroupLabels: NavigationGroup = {
  main: 'Daily Tasks',
  marketplace: 'Marketplace',
  scheduling: 'Calendar & Bookings',
  business: 'Client Management',
  growth: 'Business Growth',
  tools: 'Business Tools',
  account: 'Account',
  help: 'Support',
};

export const stylistAdminGroupLabels: NavigationGroup = {
  ...stylistGroupLabels,
  admin: 'Platform Administration',
};

export const clientGroupLabels: NavigationGroup = {
  main: 'Quick Actions',
  info: 'My Records',
  account: 'My Account',
};

export const clientAdminGroupLabels: NavigationGroup = {
  ...clientGroupLabels,
  admin: 'Platform Administration',
};

// Full Admin Access - Prioritizes admin tools, then stylist operations, then client view
export const adminFullAccessGroupLabels: NavigationGroup = {
  // Admin features FIRST (power user priority)
  admin: '🛡️ Platform Administration',

  // Stylist features (operational tools)
  main: '✂️ Daily Operations',
  scheduling: '✂️ Calendar & Bookings',
  business: '✂️ Client Management',
  growth: '✂️ Business Growth',
  tools: '✂️ Business Tools',

  // Client features (informational view)
  'client-main': '👤 Client Quick Actions',
  'client-info': '👤 Client Records',
  'client-account': '👤 Client Account',

  // Shared resources
  help: '📚 Support & Resources',
};
