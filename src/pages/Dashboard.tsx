import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Scissors, Calendar, MessageSquare, DollarSign, BookOpen, User, LogOut, Users, Sparkles, Settings, GripVertical, CreditCard } from "lucide-react";
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";
import { OnboardingTour } from "@/components/OnboardingTour";
import { StylistSubscriptionPrompt } from "@/components/StylistSubscriptionPrompt";
import { SubscriptionManagementCard } from "@/components/SubscriptionManagementCard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentReviews } from "@/components/dashboard/RecentReviews";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { WelcomeChecklist } from "@/components/WelcomeChecklist";
import { WeeklyScheduleView } from "@/components/WeeklyScheduleView";
import { QuickAppointmentDialog } from "@/components/QuickAppointmentDialog";
import { LiveKPICards } from "@/components/dashboard/LiveKPICards";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { WeeklySummaryCard } from "@/components/WeeklySummaryCard";
import { NotificationManager } from "@/components/NotificationManager";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import avatarMale from "@/assets/avatar-male-lego.png";
import avatarFemale from "@/assets/avatar-female-lego.png";
import avatarNeutral from "@/assets/avatar-neutral-lego.png";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IntegrationSuggestions } from "@/components/IntegrationSuggestions";
import { PredictiveClientInsights } from "@/components/PredictiveClientInsights";

interface SortableSectionProps {
  id: string;
  children: React.ReactNode;
}

const SortableSection = ({ id, children }: SortableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle - Hidden on mobile */}
      <div
        {...attributes}
        {...listeners}
        className="hidden lg:block absolute -left-8 top-4 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <div className="w-6 h-6 rounded bg-secondary/20 hover:bg-secondary/40 flex items-center justify-center border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
          <GripVertical className="h-4 w-4 text-secondary" />
        </div>
      </div>
      {children}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(authUser?.id);
  const { subscribed, inTrial, loading: subscriptionLoading, checkSubscription } = useSubscription();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [weekAppointments, setWeekAppointments] = useState<any[]>([]);
  const [quickAppointmentOpen, setQuickAppointmentOpen] = useState(false);
  const [quickAppointmentData, setQuickAppointmentData] = useState<{
    date: Date;
    hour: number;
    minute: number;
  } | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "subscription",
    "client-insights",
    "kpi-cards",
    "weekly-summary",
    "checklist",
    "quick-actions",
    "stats", 
    "todos",
    "activity",
    "reviews",
    "features"
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Wait for auth and roles to be fully loaded
    if (!authLoading && !roleLoading && authUser && roles.length > 0) {
      // Prioritize stylist role if user has both roles
      const primaryRole = roles.includes('stylist') ? 'stylist' : roles[0];
      setUserRole(primaryRole);
      setUser(authUser);
      checkUser(authUser, primaryRole);
      
      // Preload role-specific pages
      import("@/lib/preload").then(({ preloadRolePages }) => {
        preloadRolePages(primaryRole as "stylist" | "client");
      });
    } else if (!authLoading && !authUser) {
      navigate("/auth");
    }
  }, [authLoading, roleLoading, authUser, roles]);

  useEffect(() => {
    if (userRole && profile) {
      loadDashboardData();
      loadLayoutPreferences();
      
      // Check if we should show onboarding
      const onboardingComplete = localStorage.getItem('onboarding_complete');
      if (!onboardingComplete && user) {
        setTimeout(() => setShowOnboarding(true), 1000);
      }
      
      // Check profile completion
      checkProfileCompletion();
      
      // Show subscription prompt for stylists without subscription
      if (userRole === "stylist" && !subscriptionLoading && !subscribed && !inTrial) {
        const promptDismissed = localStorage.getItem('subscription_prompt_dismissed');
        if (!promptDismissed) {
          setTimeout(() => setShowSubscriptionPrompt(true), 2000);
        }
      }
    }
  }, [userRole, profile, subscribed, inTrial, subscriptionLoading]);

  useEffect(() => {
    // Handle subscription callback
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      toast.success("Subscription activated! Welcome to Stylist Pro 🎉");
      checkSubscription();
      searchParams.delete('subscription');
    } else if (subscriptionStatus === 'cancelled') {
      toast.info("Subscription cancelled. You can subscribe anytime!");
      searchParams.delete('subscription');
    }
  }, [searchParams]);

  const checkProfileCompletion = () => {
    if (!profile || !user || !userProfile) return;
    
    // Don't show if already completed before
    const profileCompleted = localStorage.getItem('profile_completed');
    if (profileCompleted === 'true') return;
    
    // Check basic profile from profiles table
    const basicIncomplete = !userProfile.full_name;
    
    if (userRole === "stylist") {
      // Check stylist-specific fields
      const stylistIncomplete = !profile.business_name || 
                                !profile.color_line;
      if (basicIncomplete || stylistIncomplete) {
        setShowProfileCompletion(true);
      }
    } else if (basicIncomplete) {
      setShowProfileCompletion(true);
    }
  };

  const loadLayoutPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("dashboard_layout")
        .select("section_order")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.section_order) {
        setSectionOrder(data.section_order as string[]);
      }
    } catch (error: any) {
      console.error("Error loading layout:", error);
    }
  };

  const saveLayoutPreferences = async (newOrder: string[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("dashboard_layout")
        .upsert({
          user_id: session.user.id,
          section_order: newOrder,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving layout:", error);
      toast.error("Failed to save layout");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        saveLayoutPreferences(newOrder);
        toast.success("Layout saved!");
        return newOrder;
      });
    }
  };

  const checkUser = async (sessionUser: any, primaryRole: string) => {
    try {
      if (!sessionUser) {
        navigate("/auth");
        return;
      }

      // Get appropriate profile
      if (primaryRole === "stylist") {
        const { data: stylistProfile } = await supabase
          .from("stylist_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();
        setProfile(stylistProfile);
      } else {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();
        setProfile(clientProfile);
      }

      // Check if profile needs completion
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, gender")
        .eq("id", sessionUser.id)
        .maybeSingle();

      setUserProfile(profileData);

      if (!profileData?.full_name) {
        setShowProfileCompletion(true);
      }
    } catch (error: any) {
      toast.error("Error loading dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      if (userRole === "stylist") {
        await loadStylistDashboard();
      } else {
        await loadClientDashboard();
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const loadStylistDashboard = async () => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    // Get today's appointments
    const { data: todayAppts } = await supabase
      .from("appointments")
      .select("*")
      .eq("stylist_id", profile.id)
      .gte("appointment_date", startOfDay(today).toISOString())
      .lte("appointment_date", endOfDay(today).toISOString())
      .neq("status", "cancelled");

    // Get week's appointments
    const { data: weekAppts } = await supabase
      .from("appointments")
      .select(`
        *,
        client:client_profiles(
          user:profiles(full_name, email, phone)
        )
      `)
      .eq("stylist_id", profile.id)
      .gte("appointment_date", weekStart.toISOString())
      .lte("appointment_date", weekEnd.toISOString())
      .neq("status", "cancelled");

    setWeekAppointments(weekAppts || []);

    // Get unread messages
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    // Get total unique clients
    const { data: appointments } = await supabase
      .from("appointments")
      .select("client_id")
      .eq("stylist_id", profile.id);

    const uniqueClients = new Set(appointments?.map(a => a.client_id) || []).size;

    setStats({
      todayAppointments: todayAppts?.length || 0,
      upcomingAppointments: weekAppts?.length || 0,
      unreadMessages: messages?.length || 0,
      totalClients: uniqueClients,
    });

    // Load recent activity
    const { data: recentAppts } = await supabase
      .from("appointments")
      .select(`
        *,
        client:client_profiles(user:profiles(full_name))
      `)
      .eq("stylist_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const activities = (recentAppts || []).map(appt => ({
      id: appt.id,
      type: "appointment" as const,
      title: `Appointment with ${appt.client?.user?.full_name || "Client"}`,
      description: `${appt.service_type} - ${format(new Date(appt.appointment_date), "MMM d, h:mm a")}`,
      timestamp: appt.created_at,
      status: appt.status,
    }));

    setRecentActivities(activities);

    // Load recent reviews
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select(`
        *,
        client:client_profiles(
          user:profiles(full_name)
        )
      `)
      .eq("stylist_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentReviews(reviewsData || []);
  };

  const loadClientDashboard = async () => {
    const today = new Date();

    // Get upcoming appointments
    const { data: upcomingAppts } = await supabase
      .from("appointments")
      .select("*")
      .eq("client_id", profile.id)
      .gte("appointment_date", today.toISOString())
      .neq("status", "cancelled")
      .order("appointment_date", { ascending: true });

    // Get unread messages
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    // Get appointments that need reviews
    const { data: completedAppts } = await supabase
      .from("appointments")
      .select(`
        *,
        reviews(id)
      `)
      .eq("client_id", profile.id)
      .eq("status", "completed")
      .is("reviews.id", null);

    setStats({
      upcomingAppointments: upcomingAppts?.length || 0,
      unreadMessages: messages?.length || 0,
      pendingReviews: completedAppts?.length || 0,
    });

    // Load recent activity
    const { data: recentAppts } = await supabase
      .from("appointments")
      .select(`
        *,
        stylist:stylist_profiles(
          user:profiles(full_name)
        )
      `)
      .eq("client_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const activities = (recentAppts || []).map(appt => ({
      id: appt.id,
      type: "appointment" as const,
      title: `Appointment with ${appt.stylist?.user?.full_name || "Stylist"}`,
      description: `${appt.service_type} - ${format(new Date(appt.appointment_date), "MMM d, h:mm a")}`,
      timestamp: appt.created_at,
      status: appt.status,
    }));

    setRecentActivities(activities);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error("Error signing out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4">
        <div className="text-center bg-card p-8 rounded-xl border-[3px] border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] animate-fade-in-fast max-w-md w-full">
          <div className="relative mb-4 flex items-center justify-center">
            <Scissors className="h-12 w-12 text-primary animate-pulse" aria-hidden="true" />
            <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium text-center" role="status" aria-live="polite">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stylistFeatures = [
    {
      title: "Services & Pricing",
      description: "Set your prices, showcase your specialties, and watch clients book the services they need—effortlessly",
      icon: DollarSign,
      route: "/services",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      title: "Schedule Management",
      description: "Set your hours, block vacation days, and manage availability in seconds—your time, your rules",
      icon: Settings,
      route: "/schedule",
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      title: "💬 AI Chat Assistant",
      description: "Your 24/7 color expert: Ask anything—technique tips, troubleshooting, product advice—get instant answers (nothing is saved)",
      icon: Sparkles,
      route: "/ai-assistant",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "📋 Formula Generator",
      description: "Generate professional formulas with precise measurements and step-by-step instructions—automatically saved to each client's profile",
      icon: Scissors,
      route: "/formulas",
      gradient: "from-red-400 to-orange-500",
    },
    {
      title: "Payment Tracking",
      description: "See every dollar you've earned at a glance—no spreadsheets, no confusion, just clarity on your income",
      icon: DollarSign,
      route: "/payments",
      gradient: "from-yellow-300 to-orange-400",
    },
    {
      title: "Commissions",
      description: "Turn product recommendations into profit—track every commission you've earned from brand partnerships",
      icon: DollarSign,
      route: "/commissions",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      title: "Knowledge Base",
      description: "Level up with curated tutorials, trending techniques, and insider tips from master colorists",
      icon: BookOpen,
      route: "/knowledge",
      gradient: "from-indigo-400 to-blue-500",
    },
  ];

  const clientFeatures = [
    {
      title: "My Color Formulas",
      description: "Your custom formulas stored forever—take them to any salon, anywhere, anytime. Your color, your control",
      icon: Sparkles,
      route: "/my-formulas",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "Hair Care Library",
      description: "Expert tips on maintaining vibrant color, preventing damage, and keeping your hair healthy between appointments",
      icon: BookOpen,
      route: "/knowledge",
      gradient: "from-blue-400 to-cyan-500",
    },
  ];

  const stylistMessages = [
    "Every masterpiece starts with a vision—grab your brush, trust your instincts, and let's turn some heads today! 💫",
    "Your chair is your canvas, your client is your muse—time to create something they'll absolutely love! 🎨",
    "Coffee's brewing, creativity's flowing—let's make today unforgettable, one transformation at a time! ☕✨",
    "Behind every great hairstyle is a stylist who dared to dream bigger. That's you. Now go make magic happen! 🌟",
    "The world needs your artistry today—ready to blend, highlight, and slay? Let's do this! 💅",
    "Some days you change hair, other days you change lives. Today? Let's aim for both! 🚀",
    "Your scissors are sharp, your vision is clear, your talent is undeniable—let's create some jaw-dropping looks! ⚡"
  ];

  const clientMessages = [
    "Your next iconic look is just a booking away. Ready to discover the transformation you've been dreaming of? ✨",
    "Great hair isn't just styled—it's crafted with care. Find your perfect stylist and let the transformation begin! 💫",
    "Today's a great day to treat yourself to something fabulous. Your dream hair is waiting! 🌟",
    "Life's too short for boring hair. Ready to turn heads and feel amazing? Let's find your look! 💁‍♀️",
    "Every great style starts with a great stylist. Your perfect match is just a click away! 🎨",
    "You deserve to feel confident and gorgeous. Time to book that appointment you've been thinking about! ✨",
    "Your hair journey is a story worth telling. Let's write the next beautiful chapter together! 📖"
  ];

  const welcomeMessage = userRole === "stylist" 
    ? stylistMessages[Math.floor(Math.random() * stylistMessages.length)]
    : clientMessages[Math.floor(Math.random() * clientMessages.length)];

  const features = userRole === "stylist" ? stylistFeatures : clientFeatures;

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "subscription":
        // Only show subscription card for stylists
        if (userRole === "stylist") {
          return <SubscriptionManagementCard key={sectionId} />;
        }
        return null;
      case "client-insights":
        if (userRole === "stylist" && profile?.id) {
          return <PredictiveClientInsights key={sectionId} stylistId={profile.id} />;
        }
        return null;
      case "quick-actions":
        return (
          <div key={sectionId} className="space-y-4">
            {/* Integration Suggestions */}
            <IntegrationSuggestions
              context="dashboard"
              userStats={{
                appointmentCount: stats.upcomingAppointments || stats.todayAppointments,
                clientCount: stats.totalClients,
                messageCount: stats.unreadMessages,
              }}
            />
            <QuickActions userRole={userRole || ""} />
          </div>
        );
      case "stats":
        return <DashboardStats key={sectionId} stats={stats} userRole={userRole || ""} />;
      case "checklist":
        return (
          <WelcomeChecklist
            key={sectionId}
            userRole={userRole as "stylist" | "client"}
            profileComplete={!!userProfile?.full_name}
            hasClients={stats.totalClients > 0}
            hasAppointments={stats.totalAppointments > 0}
            hasPortfolio={false}
          />
        );
      case "todos":
        return null; // TodoList component will be added in the future
      case "activity":
        return (
          <div key={sectionId} className="mb-8">
            <RecentActivity activities={recentActivities} />
          </div>
        );
      case "reviews":
        return userRole === "stylist" ? (
          <div key={sectionId} className="mb-8">
            <RecentReviews reviews={recentReviews} />
          </div>
        ) : null;
      case "features":
        return (
          <div key={sectionId} className="mb-8">
            <h3 className="text-3xl font-display font-bold mb-6 flex items-center gap-3 text-foreground">
              <Sparkles className="h-7 w-7 text-primary" />
              Explore More Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.route}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  route={feature.route}
                  gradient={feature.gradient}
                  index={index}
                />
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Skip to main content
      </a>
      <main id="main-content" role="main" aria-label="Dashboard" className="max-w-full overflow-x-hidden">
        {/* Mobile: Compact Hero | Desktop: Full Window Frame */}
        <div className="mb-3 sm:mb-4 lg:mb-12 lg:window-frame bg-gradient-to-br from-blue-400 via-cyan-300 to-green-300 relative animate-fade-in-fast w-full rounded-lg sm:rounded-xl lg:rounded-none border-2 lg:border-4 border-foreground">
          {/* Window titlebar - Desktop only */}
          <div className="window-titlebar hidden lg:flex">
            <span className="text-background font-mono text-sm font-bold">
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </span>
            <div className="window-controls">
              <div className="window-control" style={{ backgroundColor: '#ef4444' }}></div>
              <div className="window-control" style={{ backgroundColor: '#eab308' }}></div>
              <div className="window-control" style={{ backgroundColor: '#22c55e' }}></div>
            </div>
          </div>
          
          <div className="bg-blue-600 p-3 sm:p-4 md:p-6 relative overflow-hidden">
            <div className="window-scrollbar hidden lg:block"></div>
            
            <div className="max-w-4xl pr-0 sm:pr-4 md:pr-8 w-full">
              <h2 className="text-base sm:text-lg md:text-2xl lg:text-4xl font-display font-black mb-2 sm:mb-3 lg:mb-4 text-pink-400 uppercase leading-tight animate-fade-in break-words" style={{ animationDelay: '100ms' }}>
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || "there"}!
              </h2>
              
              {/* Weekly Schedule View for Stylists */}
              {userRole === "stylist" && (
                <div className="bg-card rounded-lg overflow-hidden border-2 border-pink-400 shadow-[4px_4px_0px_0px_rgba(244,114,182,0.6)] mt-2 sm:mt-3 animate-fade-in max-w-full" style={{ animationDelay: '200ms' }}>
                  <WeeklyScheduleView
                    appointments={weekAppointments}
                    stylistSchedule={profile?.weekly_schedule}
                    stylistId={profile?.id}
                    onAppointmentClick={(apt) => navigate("/appointments")}
                    onTimeSlotClick={(date, hour, minute) => {
                      setQuickAppointmentData({ date, hour, minute });
                      setQuickAppointmentOpen(true);
                    }}
                  />
                </div>
              )}

              {userRole === "client" && (
                <p className="text-sm sm:text-base lg:text-lg font-medium text-pink-200 mt-2 animate-fade-in leading-relaxed" style={{ animationDelay: '200ms' }}>
                  Ready to book your next transformation? ✨
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Drag instruction - Desktop/Tablet only */}
        <div className="mb-4 sm:mb-6 bg-muted/50 border border-border/50 shadow-sm p-2.5 sm:p-3 rounded-lg animate-fade-in overflow-x-hidden max-w-full hidden sm:block" style={{ animationDelay: '300ms' }}>
          <p className="text-xs font-medium text-muted-foreground text-center flex items-center justify-center gap-2 flex-wrap">
            <GripVertical className="h-4 w-4 opacity-50" />
            <span className="text-xs">Hover over sections and drag the handle to rearrange your dashboard</span>
            <GripVertical className="h-4 w-4 opacity-50" />
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sectionOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6 lg:space-y-8 w-full max-w-full overflow-x-hidden pb-8 sm:pb-0">
              {sectionOrder.map((sectionId, index) => {
                const content = renderSection(sectionId);
                if (!content) return null;
                
                return (
                  <SortableSection key={sectionId} id={sectionId}>
                    <div 
                      className="animate-fade-in w-full max-w-full" 
                      style={{ animationDelay: `${(index + 4) * 50}ms` }}
                    >
                      {content}
                    </div>
                  </SortableSection>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <ProfileCompletionDialog
          open={showProfileCompletion}
          onOpenChange={setShowProfileCompletion}
          userRole={userRole}
          userId={user?.id}
        />

        <OnboardingTour
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
          userRole={userRole as "stylist" | "client"}
        />

        <StylistSubscriptionPrompt
          open={showSubscriptionPrompt}
          onOpenChange={(open) => {
            setShowSubscriptionPrompt(open);
            if (!open) {
              localStorage.setItem('subscription_prompt_dismissed', 'true');
            }
          }}
        />
        
        {/* Quick Appointment Dialog */}
        {userRole === "stylist" && quickAppointmentData && (
          <QuickAppointmentDialog
            open={quickAppointmentOpen}
            onOpenChange={setQuickAppointmentOpen}
            selectedDate={quickAppointmentData.date}
            selectedHour={quickAppointmentData.hour}
            selectedMinute={quickAppointmentData.minute}
            stylistId={profile?.id}
            onSuccess={loadDashboardData}
          />
        )}

        {/* Notification Manager */}
        {user && userRole && (
          <NotificationManager userId={user.id} userRole={userRole as "stylist" | "client"} />
        )}
      </main>
    </DashboardLayout>
  );
};

export default Dashboard;
