import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, Navigate } from "react-router-dom";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Crown, Shield, Users, Calendar, MessageSquare, Palette, Image,
  FileText, DollarSign, Settings, Brain, TrendingUp, Share2,
  Lock, Bell, Clock, Gift, Star, Sparkles, Book, BarChart3,
  Activity, Database, Zap, Mail, Bot, Heart, CheckCircle2,
  MapPin, Search, Video, Camera, Package, CreditCard
} from "lucide-react";

export default function AppDirectory() {
  const navigate = useNavigate();
  const { user, roles, loading: authLoading } = useEnhancedAuth();
  const isAdmin = roles.includes('admin');

  // Redirect non-admins
  if (!authLoading && (!user || !isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while checking permissions
  if (authLoading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  const adminFeatures = [
    {
      title: "Command Center",
      description: "Full platform control with live metrics and system management",
      icon: Crown,
      path: "/admin/command",
      color: "text-amber-500"
    },
    {
      title: "User Management",
      description: "View, search, filter, and manage all users and roles",
      icon: Shield,
      path: "/admin/users",
      color: "text-red-500"
    },
    {
      title: "System Health",
      description: "Monitor errors, performance, database integrity, AI systems",
      icon: Activity,
      path: "/system-health",
      color: "text-green-500"
    },
    {
      title: "Design System",
      description: "Visual design tokens, components showcase, style guide",
      icon: Palette,
      path: "/design-system",
      color: "text-purple-500"
    },
    {
      title: "Access Codes",
      description: "Generate and manage platform access codes",
      icon: Lock,
      path: "/access-codes",
      color: "text-blue-500"
    }
  ];

  const stylistFeatures = [
    {
      title: "Dashboard",
      description: "KPIs, quick actions, recent activity, todos",
      icon: BarChart3,
      path: "/dashboard",
      color: "text-primary"
    },
    {
      title: "Appointments",
      description: "Calendar view, schedule management, booking system",
      icon: Calendar,
      path: "/appointments",
      color: "text-blue-500"
    },
    {
      title: "Clients",
      description: "Client profiles, hair history, preferences, notes",
      icon: Users,
      path: "/clients",
      color: "text-green-500"
    },
    {
      title: "Messages",
      description: "Client communication, video messages",
      icon: MessageSquare,
      path: "/messages",
      color: "text-purple-500"
    },
    {
      title: "Formulas",
      description: "Hair color formulas, recipes, client history",
      icon: FileText,
      path: "/formulas",
      color: "text-orange-500"
    },
    {
      title: "Portfolio",
      description: "Before/after photos, showcase work",
      icon: Image,
      path: "/portfolio",
      color: "text-pink-500"
    },
    {
      title: "Services",
      description: "Service types, pricing, duration management",
      icon: Package,
      path: "/services",
      color: "text-teal-500"
    },
    {
      title: "Finance",
      description: "Revenue tracking, payments, commissions",
      icon: DollarSign,
      path: "/finance",
      color: "text-emerald-500"
    },
    {
      title: "Schedule Management",
      description: "Working hours, blocked dates, calendar sync",
      icon: Clock,
      path: "/schedule",
      color: "text-indigo-500"
    },
    {
      title: "Referrals",
      description: "Referral codes, tracking, rewards",
      icon: Share2,
      path: "/referrals",
      color: "text-yellow-500"
    },
    {
      title: "Growth Analytics",
      description: "Track bookings, page views, conversions",
      icon: TrendingUp,
      path: "/analytics",
      color: "text-green-500"
    },
    {
      title: "Reviews",
      description: "Client feedback, ratings management",
      icon: Star,
      path: "/dashboard",
      color: "text-amber-500"
    },
    {
      title: "AI Assistant",
      description: "AI-powered chat, formula generation, insights",
      icon: Brain,
      path: "/ai-assistant",
      color: "text-violet-500"
    },
    {
      title: "Client Discovery",
      description: "View and respond to client hair requests",
      icon: Search,
      path: "/client-discovery",
      color: "text-cyan-500"
    },
    {
      title: "Knowledge Base",
      description: "Educational resources, tutorials, guides",
      icon: Book,
      path: "/knowledge",
      color: "text-rose-500"
    },
    {
      title: "Integrations",
      description: "Calendar sync, payment processing, third-party tools",
      icon: Zap,
      path: "/integrations",
      color: "text-fuchsia-500"
    }
  ];

  const clientFeatures = [
    {
      title: "Book Appointment",
      description: "Find stylists, book appointments, manage bookings",
      icon: Calendar,
      path: "/book",
      color: "text-blue-500"
    },
    {
      title: "My Appointments",
      description: "Upcoming and past appointments, rebook, review",
      icon: CheckCircle2,
      path: "/appointments",
      color: "text-green-500"
    },
    {
      title: "Messages",
      description: "Chat with your stylist, receive updates",
      icon: MessageSquare,
      path: "/messages",
      color: "text-purple-500"
    },
    {
      title: "Hair History",
      description: "View formulas, before/after photos, notes",
      icon: FileText,
      path: "/formulas",
      color: "text-orange-500"
    },
    {
      title: "Stylist Discovery",
      description: "Browse and discover stylists in your area",
      icon: MapPin,
      path: "/stylists",
      color: "text-pink-500"
    },
    {
      title: "Hair Requests",
      description: "Post hair inspiration, get stylist responses",
      icon: Camera,
      path: "/client-requests",
      color: "text-cyan-500"
    },
    {
      title: "Reviews",
      description: "Leave reviews for stylists",
      icon: Star,
      path: "/dashboard",
      color: "text-amber-500"
    }
  ];

  const backendFeatures = [
    {
      title: "Automated Appointment Followup",
      description: "Sends automated followup messages after appointments",
      icon: Mail,
      type: "Edge Function"
    },
    {
      title: "Check Subscription",
      description: "Validates user subscription status",
      icon: CreditCard,
      type: "Edge Function"
    },
    {
      title: "Appointment Checkout",
      description: "Creates Stripe checkout sessions for appointments",
      icon: DollarSign,
      type: "Edge Function"
    },
    {
      title: "Customer Portal",
      description: "Stripe customer portal access",
      icon: Settings,
      type: "Edge Function"
    },
    {
      title: "User Data Management",
      description: "Export and delete user data (GDPR compliance)",
      icon: Database,
      type: "Edge Function"
    },
    {
      title: "AI Formula Generator",
      description: "AI-powered hair formula generation",
      icon: Brain,
      type: "Edge Function"
    },
    {
      title: "Hair Assistant Chat",
      description: "AI chatbot for hair-related questions",
      icon: Bot,
      type: "Edge Function"
    },
    {
      title: "Stylist Search",
      description: "Advanced search and filtering for stylists",
      icon: Search,
      type: "Edge Function"
    },
    {
      title: "Appointment Notifications",
      description: "Confirmation, reminder emails and SMS",
      icon: Bell,
      type: "Edge Function"
    },
    {
      title: "Client Invitations",
      description: "Email invitations for new clients",
      icon: Mail,
      type: "Edge Function"
    },
    {
      title: "Smart Reminders",
      description: "AI-powered appointment reminders",
      icon: Brain,
      type: "Edge Function"
    },
    {
      title: "Smart Scheduling",
      description: "AI-suggested optimal appointment times",
      icon: Calendar,
      type: "Edge Function"
    },
    {
      title: "Stripe Webhook",
      description: "Handles Stripe payment events",
      icon: Zap,
      type: "Edge Function"
    },
    {
      title: "Voice to Text",
      description: "Converts voice messages to text",
      icon: Video,
      type: "Edge Function"
    }
  ];

  const aiFeatures = [
    {
      title: "AI Chat Assistant",
      description: "Conversational AI for hair advice and support",
      icon: Bot,
      path: "/ai-assistant"
    },
    {
      title: "AI Formula Generation",
      description: "Generate custom hair color formulas with AI",
      icon: Sparkles,
      path: "/formulas"
    },
    {
      title: "Predictive Client Insights",
      description: "AI predictions for client retention and behavior",
      icon: TrendingUp,
      path: "/dashboard"
    },
    {
      title: "Smart Scheduling Suggestions",
      description: "AI-optimized appointment scheduling",
      icon: Calendar,
      path: "/appointments"
    },
    {
      title: "Client Retention AI",
      description: "Identifies at-risk clients and suggests actions",
      icon: Heart,
      path: "/dashboard"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-pixel flex items-center gap-3 mb-2">
            <Book className="h-10 w-10 text-primary" />
            Complete App Directory
          </h1>
          <p className="font-sans text-muted-foreground text-lg">
            Your comprehensive guide to every feature, page, and function in the platform
          </p>
        </div>

        {/* Admin Features */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-7 w-7 text-purple-500" />
            <h2 className="text-3xl font-pixel">Admin Features</h2>
            <Badge className="bg-purple-500">God Mode</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {adminFeatures.map((feature) => (
              <Card key={feature.path} className="border-4 border-foreground shadow-brutal hover:shadow-brutal-lg transition-all cursor-pointer" onClick={() => navigate(feature.path)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    <Button size="sm" variant="ghost">View →</Button>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Stylist Features */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-pixel">Stylist Features</h2>
            <Badge variant="secondary">{stylistFeatures.length} Features</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {stylistFeatures.map((feature) => (
              <Card key={feature.path} className="border-2 border-foreground hover:border-primary transition-all cursor-pointer" onClick={() => navigate(feature.path)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    <Button size="sm" variant="ghost">Go →</Button>
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Client Features */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-7 w-7 text-blue-500" />
            <h2 className="text-3xl font-pixel">Client Features</h2>
            <Badge variant="outline">{clientFeatures.length} Features</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {clientFeatures.map((feature) => (
              <Card key={feature.path} className="border-2 border-foreground hover:border-blue-500 transition-all cursor-pointer" onClick={() => navigate(feature.path)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    <Button size="sm" variant="ghost">Visit →</Button>
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Features */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-7 w-7 text-violet-500" />
            <h2 className="text-3xl font-pixel">AI-Powered Features</h2>
            <Badge className="bg-violet-500">Intelligent</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {aiFeatures.map((feature) => (
              <Card key={feature.path} className="border-2 border-foreground hover:border-violet-500 transition-all cursor-pointer bg-gradient-to-br from-violet-500/5 to-transparent" onClick={() => navigate(feature.path)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <feature.icon className="h-7 w-7 text-violet-500" />
                    <Button size="sm" variant="ghost">Try →</Button>
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Backend & Functions */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-7 w-7 text-yellow-500" />
            <h2 className="text-3xl font-pixel">Backend Functions</h2>
            <Badge variant="secondary">{backendFeatures.length} Functions</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {backendFeatures.map((feature) => (
              <Card key={feature.title} className="border-2 border-foreground bg-muted/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <feature.icon className="h-6 w-6 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">{feature.type}</Badge>
                  </div>
                  <CardTitle className="text-sm">{feature.title}</CardTitle>
                  <CardDescription className="text-xs">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <Card className="border-4 border-foreground shadow-brutal bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-2xl">Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-500">{adminFeatures.length}</div>
                <div className="text-sm text-muted-foreground">Admin Features</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{stylistFeatures.length}</div>
                <div className="text-sm text-muted-foreground">Stylist Features</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500">{clientFeatures.length}</div>
                <div className="text-sm text-muted-foreground">Client Features</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">{backendFeatures.length}</div>
                <div className="text-sm text-muted-foreground">Backend Functions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
