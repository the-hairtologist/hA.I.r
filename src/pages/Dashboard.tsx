import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";
import { StylistSubscriptionPrompt } from "@/components/StylistSubscriptionPrompt";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WeeklyOverview } from "@/components/dashboard/WeeklyOverview";
import { QuickTasks } from "@/components/dashboard/QuickTasks";
import { WeeklyScheduleView } from "@/components/WeeklyScheduleView";
import { QuickAppointmentDialog } from "@/components/QuickAppointmentDialog";
import { LiveKPICards } from "@/components/dashboard/LiveKPICards";
import { NotificationManager } from "@/components/NotificationManager";
import { DashboardFullSkeleton } from "@/components/LoadingSkeleton";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NotificationEnhancer } from "@/components/NotificationEnhancer";
import { useAnalytics } from "@/hooks/useAnalytics";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { HelpButton } from "@/components/HelpButton";
import { WelcomeChecklist } from "@/components/WelcomeChecklist";
import { EmptyStateGuidance } from "@/components/dashboard/EmptyStateGuidance";
import { useDashboardLayout, DashboardSection } from "@/hooks/useDashboardLayout";
import { RebookingPrompt } from "@/components/RebookingPrompt";
import { DraggableSection } from "@/components/dashboard/DraggableSection";
import { ClientSentimentTracker } from "@/components/dashboard/ClientSentimentTracker";
import { RevenueTrends } from "@/components/dashboard/RevenueTrends";
import { TopServices } from "@/components/dashboard/TopServices";
import { ClientRetention } from "@/components/dashboard/ClientRetention";
import { QuickNotes } from "@/components/dashboard/QuickNotes";
import { FavoriteStylists } from "@/components/dashboard/FavoriteStylists";
import { ClientMilestones } from "@/components/dashboard/ClientMilestones";
import { Button } from "@/components/ui/button";
import { Edit3, RotateCcw, Save } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser, loading: authLoading } = useAuth();
  const { roles, isAdmin, loading: roleLoading } = useUserRole(authUser?.id);
  const { subscribed, inTrial, loading: subscriptionLoading, checkSubscription } = useSubscription();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [weekAppointments, setWeekAppointments] = useState<any[]>([]);
  const [quickAppointmentOpen, setQuickAppointmentOpen] = useState(false);
  const [quickAppointmentData, setQuickAppointmentData] = useState<{
    date: Date;
    hour: number;
    minute: number;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Enable analytics tracking
  useAnalytics();

  // Stylist dashboard sections - business management focus
  const defaultStylistSections: DashboardSection[] = [
    { id: "kpi-cards", title: "Today's Overview", component: "LiveKPICards", enabled: true },
    { id: "quick-actions", title: "Quick Actions", component: "QuickActions", enabled: true },
    { id: "weekly-schedule", title: "My Schedule", component: "WeeklySchedule", enabled: true },
    { id: "weekly-overview", title: "This Week", component: "WeeklyOverview", enabled: true },
    { id: "recent-activity", title: "Recent Activity", component: "RecentActivity", enabled: true },
    { id: "quick-tasks", title: "My Tasks", component: "QuickTasks", enabled: true },
    { id: "quick-notes", title: "Quick Notes", component: "QuickNotes", enabled: true },
    { id: "revenue-trends", title: "Revenue Trends", component: "RevenueTrends", enabled: false },
    { id: "top-services", title: "Popular Services", component: "TopServices", enabled: false },
    { id: "client-sentiment", title: "Client Feedback", component: "ClientSentimentTracker", enabled: false },
    { id: "client-retention", title: "Client Retention", component: "ClientRetention", enabled: false },
  ];

  // Client dashboard sections - focused on booking and service experience
  const defaultClientSections: DashboardSection[] = [
    { id: "quick-actions", title: "Quick Actions", component: "QuickActions", enabled: true },
    { id: "upcoming-appointments", title: "My Appointments", component: "UpcomingAppointments", enabled: true },
    { id: "client-milestones", title: "Rewards & Perks", component: "ClientMilestones", enabled: true },
    { id: "favorite-stylists", title: "My Stylists", component: "FavoriteStylists", enabled: true },
    { id: "recent-activity", title: "Recent Activity", component: "RecentActivity", enabled: true },
  ];

  // Admin sections - comprehensive platform oversight
  const defaultAdminSections: DashboardSection[] = [
    { id: "kpi-cards", title: "Platform Overview", component: "LiveKPICards", enabled: true },
    { id: "quick-actions", title: "Quick Actions", component: "QuickActions", enabled: true },
    { id: "weekly-schedule", title: "Platform Schedule", component: "WeeklySchedule", enabled: true },
    { id: "weekly-overview", title: "Platform Stats", component: "WeeklyOverview", enabled: true },
    { id: "recent-activity", title: "Platform Activity", component: "RecentActivity", enabled: true },
    { id: "quick-tasks", title: "Admin Tasks", component: "QuickTasks", enabled: true },
    { id: "quick-notes", title: "Admin Notes", component: "QuickNotes", enabled: true },
    { id: "revenue-trends", title: "Revenue Analytics", component: "RevenueTrends", enabled: true },
    { id: "top-services", title: "Service Analytics", component: "TopServices", enabled: true },
    { id: "client-sentiment", title: "Feedback Analytics", component: "ClientSentimentTracker", enabled: true },
    { id: "client-retention", title: "Retention Analytics", component: "ClientRetention", enabled: true },
  ];

  // Determine sections based on role - admins get comprehensive view
  const defaultSections = isAdmin 
    ? defaultAdminSections 
    : userRole === "stylist" 
      ? defaultStylistSections 
      : defaultClientSections;
  
  const { sections, isLoading: layoutLoading, saveDashboardLayout, resetDashboardLayout, toggleSection } = 
    useDashboardLayout(defaultSections);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (helps with clicks on mobile)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 150ms hold before drag starts on touch
        tolerance: 5,
      },
    }),
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
      
      // Check if we should show onboarding - only OnboardingWizard
      const onboardingComplete = localStorage.getItem('onboarding_completed');
      if (!onboardingComplete && user) {
        setTimeout(() => setShowOnboardingWizard(true), 500);
      }
      
      // Check profile completion
      checkProfileCompletion();
      
      // Delayed subscription prompt (after user gets value - 25 appointments)
      if (userRole === "stylist" && !subscriptionLoading && !subscribed && !inTrial) {
        const promptDismissed = localStorage.getItem('subscription_prompt_dismissed');
        if (!promptDismissed) {
          // Check appointment count before showing (increased from 5 to 25)
          supabase
            .from("appointments")
            .select("id", { count: "exact" })
            .eq("stylist_id", profile.id)
            .then(({ count }) => {
              if ((count || 0) >= 25) {
                setTimeout(() => setShowSubscriptionPrompt(true), 5000);
              }
            });
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
        // Delay showing by 3 seconds to let user see dashboard first
        setTimeout(() => setShowProfileCompletion(true), 3000);
      }
    } else if (basicIncomplete) {
      // Delay showing by 3 seconds to let user see dashboard first
      setTimeout(() => setShowProfileCompletion(true), 3000);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);
      const newOrder = arrayMove(sections, oldIndex, newIndex);
      saveDashboardLayout(newOrder);
      toast.success("Dashboard layout updated");
    }
  };

  const handleReset = async () => {
    await resetDashboardLayout();
    setIsEditMode(false);
    toast.success("Dashboard layout reset to default");
  };

  const handleSave = () => {
    setIsEditMode(false);
    toast.success("Dashboard layout saved");
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

    // PERFORMANCE FIX: Parallel queries with Promise.all
    const [
      { data: todayAppts },
      { data: weekAppts },
      { data: messages },
      { data: appointments }
    ] = await Promise.all([
      supabase
        .from("appointments")
        .select("*")
        .eq("stylist_id", profile.id)
        .gte("appointment_date", startOfDay(today).toISOString())
        .lte("appointment_date", endOfDay(today).toISOString())
        .neq("status", "cancelled"),
      
      supabase
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
        .neq("status", "cancelled"),
      
      supabase
        .from("messages")
        .select("*")
        .eq("recipient_id", user.id)
        .eq("is_read", false),
      
      supabase
        .from("appointments")
        .select("client_id")
        .eq("stylist_id", profile.id)
    ]);

    setWeekAppointments(weekAppts || []);

    const uniqueClients = new Set(appointments?.map(a => a.client_id) || []).size;

    setStats({
      todayAppointments: todayAppts?.length || 0,
      upcomingAppointments: weekAppts?.length || 0,
      unreadMessages: messages?.length || 0,
      totalClients: uniqueClients,
    });

    // Load recent activity (can be loaded after initial render)
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
      <DashboardLayout>
        <div className="p-4 md:p-6 lg:p-8">
          <DashboardFullSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  const renderSection = (section: DashboardSection) => {
    if (!section.enabled) return null;

    switch (section.component) {
      case "LiveKPICards":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <LiveKPICards stylistId={profile.id} />
        ) : null;
      case "QuickActions":
        return <QuickActions userRole={userRole || ""} />;
      case "WeeklyOverview":
        return (userRole === "stylist" || isAdmin) ? <WeeklyOverview /> : null;
      case "ClientSentimentTracker":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <ClientSentimentTracker stylistId={profile.id} />
        ) : null;
      case "RevenueTrends":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <RevenueTrends stylistId={profile.id} />
        ) : null;
      case "TopServices":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <TopServices stylistId={profile.id} />
        ) : null;
      case "ClientRetention":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <ClientRetention stylistId={profile.id} />
        ) : null;
      case "QuickNotes":
        return (userRole === "stylist" || isAdmin) ? <QuickNotes /> : null;
      case "WeeklySchedule":
        return (userRole === "stylist" || isAdmin) && weekAppointments.length > 0 ? (
          <WeeklyScheduleView
            appointments={weekAppointments}
            onAppointmentClick={(appt) => navigate(`/appointments/${appt.id}`)}
            onTimeSlotClick={(date, hour) => {
              setQuickAppointmentData({ date, hour, minute: 0 });
              setQuickAppointmentOpen(true);
            }}
          />
        ) : null;
      case "RecentActivity":
        return ((userRole === "stylist" || userRole === "client" || isAdmin) && recentActivities.length > 0) ? (
          <RecentActivity activities={recentActivities} />
        ) : null;
      case "QuickTasks":
        return (userRole === "stylist" || isAdmin) ? <QuickTasks /> : null;
      case "FavoriteStylists":
        return (userRole === "client" || isAdmin) && profile?.id ? (
          <FavoriteStylists clientId={profile.id} />
        ) : null;
      case "ClientMilestones":
        return (userRole === "client" || isAdmin) && profile?.id ? (
          <ClientMilestones clientId={profile.id} />
        ) : null;
      case "UpcomingAppointments":
        return (userRole === "client" || isAdmin) && stats ? (
          stats.upcomingAppointments > 0 ? (
            <RecentActivity activities={recentActivities} />
          ) : (
            <EmptyStateGuidance type="appointments" />
          )
        ) : null;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      {/* Enhanced notification system */}
      {user && userRole && (
        <NotificationEnhancer userId={user.id} userRole={userRole as "stylist" | "client"} />
      )}
      
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Skip to main content
      </a>
      <main id="main-content" role="main" aria-label="Dashboard" className="pl-12 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 window-frame bg-gradient-to-br from-blue-400 via-cyan-300 to-green-300 relative animate-fade-in-fast">
          <div className="window-titlebar">
            <span className="text-background font-mono text-xs sm:text-sm font-bold">
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </span>
            <div className="window-controls">
              <div className="window-control bg-background"></div>
              <div className="window-control bg-background"></div>
              <div className="window-control bg-background"></div>
            </div>
          </div>
          
          <div className="bg-blue-600 p-4 md:p-6 relative overflow-hidden">
            <div className="window-scrollbar"></div>
            
            <div className="max-w-4xl pr-4 sm:pr-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black mb-4 text-pink-400 uppercase leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || "there"}!
              </h2>
              
              {/* Weekly Schedule View for Stylists */}
              {userRole === "stylist" && (
                <div className="bg-card rounded-lg overflow-hidden border-2 border-secondary shadow-[4px_4px_0px_0px_hsl(var(--secondary)_/_0.6)] mt-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
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
                <p className="text-sm sm:text-base md:text-lg font-medium text-pink-200 mt-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  Ready to book your next transformation? ✨
                </p>
              )}

              {/* Quick Notes - Compact Notepad */}
              {(userRole === "stylist" || isAdmin) && (
                <div className="mt-6 max-w-md animate-fade-in" style={{ animationDelay: '250ms' }}>
                  <div className="bg-yellow-100 rounded-lg shadow-lg border-t-8 border-yellow-400 relative">
                    {/* Simple header */}
                    <div className="px-4 py-2 border-b border-yellow-300/50 bg-yellow-200/30">
                      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        📝 Quick Notes
                      </h3>
                    </div>
                    
                    {/* Notes content - simplified */}
                    <div className="p-4">
                      <QuickNotes compact />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customize Dashboard Controls */}
        {isEditMode && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/5 border-2 border-primary/20 rounded-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                  <Edit3 className="h-3.5 w-3.5 text-primary" />
                  Customize Your Dashboard
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Drag sections to reorder • Click eye icon to show/hide sections</span>
                  <span className="sm:hidden">Long-press to drag • Tap eye to toggle</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="text-xs"
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {!isEditMode && stats && (
          <>
            {/* Stylist Welcome Checklist */}
            {userRole === "stylist" && stats.todayAppointments === 0 && stats.totalClients === 0 && (
              <div className="mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <WelcomeChecklist 
                  userRole="stylist"
                  profileComplete={!!userProfile?.full_name && !!profile?.business_name && !!profile?.color_line}
                  hasClients={stats.totalClients > 0}
                  hasAppointments={stats.upcomingAppointments > 0}
                  hasPortfolio={false}
                />
              </div>
            )}
            
            {/* Client Welcome Checklist */}
            {userRole === "client" && stats.upcomingAppointments === 0 && (
              <div className="mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <WelcomeChecklist 
                  userRole="client"
                  profileComplete={!!userProfile?.full_name}
                  hasAppointments={stats.upcomingAppointments > 0}
                />
              </div>
            )}
            
            {/* Rebooking Prompt for Clients */}
            {userRole === "client" && (
              <div className="animate-fade-in" style={{ animationDelay: '320ms' }}>
                <RebookingPrompt />
              </div>
            )}
            
            <div className="mb-6 p-4 rounded-xl border-2 border-white/50 dark:border-white/30 bg-white/40 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-primary" />
                    Personalize Your Dashboard
                  </p>
                  <p className="text-sm text-foreground">
                    Add, remove, or rearrange sections to match your workflow
                  </p>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setIsEditMode(true)}
                  className="gap-2 shrink-0 w-full sm:w-auto shadow-sm"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Customize</span>
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Dashboard Sections */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 sm:space-y-6">
              {sections.map((section, index) => (
                <DraggableSection
                  key={section.id}
                  section={section}
                  isEditMode={isEditMode}
                  onToggle={() => toggleSection(section.id)}
                  animationDelay={`${350 + index * 50}ms`}
                >
                  {renderSection(section)}
                </DraggableSection>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <ProfileCompletionDialog
          open={showProfileCompletion}
          onOpenChange={setShowProfileCompletion}
          userRole={userRole}
          userId={user?.id}
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

        {/* New Onboarding Wizard */}
        {userRole && (
          <OnboardingWizard
            open={showOnboardingWizard}
            onComplete={() => setShowOnboardingWizard(false)}
            userRole={userRole as "stylist" | "client"}
          />
        )}

        {/* Help Button */}
        <HelpButton />
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Dashboard;
