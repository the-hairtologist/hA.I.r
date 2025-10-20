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
import { NextAppointmentWidget } from "@/components/dashboard/NextAppointmentWidget";
import { LoyaltyProgressWidget } from "@/components/dashboard/LoyaltyProgressWidget";
import { CommissionTrackerWidget } from "@/components/dashboard/CommissionTrackerWidget";
import { QuickAddClientFAB } from "@/components/QuickAddClientFAB";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NotificationEnhancer } from "@/components/NotificationEnhancer";
import { useAnalytics } from "@/hooks/useAnalytics";

import { AppointmentTimerWidget } from "@/components/AppointmentTimerWidget";
import { logger } from "@/lib/logging/productionLogger";
import { BirthdayAlertsWidget } from "@/components/BirthdayAlertsWidget";
import { StatsToggleButton } from "@/components/admin/StatsToggleButton";
import { WaitlistDialog } from "@/components/WaitlistDialog";


import { EmptyStateGuidance } from "@/components/dashboard/EmptyStateGuidance";
import { useDashboardLayout, DashboardSection } from "@/hooks/useDashboardLayout";
import { FirstTimeTooltip } from "@/components/FirstTimeTooltip";
import { RebookingPrompt } from "@/components/RebookingPrompt";
import { DraggableSection } from "@/components/dashboard/DraggableSection";
import { ClientSentimentTracker } from "@/components/dashboard/ClientSentimentTracker";
import { RevenueTrends } from "@/components/dashboard/RevenueTrends";
import { TopServices } from "@/components/dashboard/TopServices";
import { ClientRetention } from "@/components/dashboard/ClientRetention";
import { QuickNotes } from "@/components/dashboard/QuickNotes";
import { FavoriteStylists } from "@/components/dashboard/FavoriteStylists";
import { ClientMilestones } from "@/components/dashboard/ClientMilestones";
import { SupportChatWidget } from "@/components/dashboard/SupportChatWidget";
import { PredictiveSuggestions } from "@/components/PredictiveSuggestions";
import { AIFeatureErrorBoundary } from "@/components/AIFeatureErrorBoundary";
import { FeatureErrorBoundary } from "@/components/errors/FeatureErrorBoundary";
import { useAIAnalytics } from "@/hooks/useAIAnalytics";
import { useFeatureFlag } from "@/lib/featureFlags";
import { Button } from "@/components/ui/button";
import { Edit3, RotateCcw, Save, StickyNote, MessageCircle, Sparkles, BookOpen } from "lucide-react";
import { ProgressTracker } from "@/components/ProgressTracker";
import { ChurnRiskWidget } from "@/components/ChurnRiskWidget";
import { ProactiveInsightsPanel } from "@/components/ProactiveInsightsPanel";
import { LiveBookingToast } from "@/components/LiveBookingToast";
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
  
  // AI Features
  const analytics = useAIAnalytics();
  const predictiveInsightsEnabled = useFeatureFlag('PREDICTIVE_INSIGHTS');
  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);

  // Enable analytics tracking
  useAnalytics();

  // Stylist dashboard sections - business management focus
  const defaultStylistSections: DashboardSection[] = [
    { id: "progress-tracker", title: "Your Progress", component: "ProgressTracker", enabled: true },
    { id: "churn-risk", title: "At-Risk Clients", component: "ChurnRisk", enabled: true },
    { id: "proactive-insights", title: "AI Recommendations", component: "ProactiveInsights", enabled: true },
    { id: "predictive-insights", title: "AI Predictions", component: "PredictiveInsights", enabled: true },
    { id: "kpi-cards", title: "Today's Overview", component: "LiveKPICards", enabled: true },
    { id: "appointment-timer", title: "Session Timer", component: "AppointmentTimer", enabled: true },
    { id: "birthday-alerts", title: "Client Birthdays", component: "BirthdayAlerts", enabled: true },
    { id: "commission-tracker", title: "Commission Earnings", component: "CommissionTracker", enabled: true },
    { id: "quick-actions", title: "Quick Actions", component: "QuickActions", enabled: true },
    { id: "weekly-schedule", title: "Weekly Schedule", component: "WeeklySchedule", enabled: false },
    { id: "weekly-overview", title: "This Week's Stats", component: "WeeklyOverview", enabled: true },
    { id: "recent-activity", title: "Recent Activity", component: "RecentActivity", enabled: true },
    { id: "quick-tasks", title: "My Tasks", component: "QuickTasks", enabled: true },
    { id: "quick-notes", title: "Quick Notes", component: "QuickNotes", enabled: true },
    { id: "revenue-trends", title: "Revenue Analytics", component: "RevenueTrends", enabled: false },
    { id: "top-services", title: "Service Performance", component: "TopServices", enabled: false },
    { id: "client-sentiment", title: "Client Feedback", component: "ClientSentimentTracker", enabled: false },
    { id: "client-retention", title: "Retention Metrics", component: "ClientRetention", enabled: false },
  ];

  // Client dashboard sections - optimized for client needs
  const defaultClientSections: DashboardSection[] = [
    { id: "next-appointment", title: "Upcoming", component: "NextAppointment", enabled: true },
    { id: "support-chat-widget", title: "AI Support", component: "SupportChatWidget", enabled: true },
    { id: "loyalty-progress", title: "Rewards", component: "LoyaltyProgress", enabled: true },
    { id: "quick-actions", title: "Quick Actions", component: "QuickActions", enabled: true },
    { id: "favorite-stylists", title: "My Stylists", component: "FavoriteStylists", enabled: true },
    { id: "client-milestones", title: "Rewards & Loyalty", component: "ClientMilestones", enabled: true },
  ];

  // Admin sections - comprehensive platform oversight
  const defaultAdminSections: DashboardSection[] = [
    { id: "kpi-cards", title: "Platform Overview", component: "LiveKPICards", enabled: true },
    { id: "quick-actions", title: "Admin Controls", component: "QuickActions", enabled: true },
    { id: "weekly-schedule", title: "All Appointments", component: "WeeklySchedule", enabled: false },
    { id: "weekly-overview", title: "Platform Metrics", component: "WeeklyOverview", enabled: true },
    { id: "recent-activity", title: "System Activity", component: "RecentActivity", enabled: true },
    { id: "quick-tasks", title: "Admin Tasks", component: "QuickTasks", enabled: true },
    { id: "quick-notes", title: "Platform Notes", component: "QuickNotes", enabled: true },
    { id: "revenue-trends", title: "Platform Revenue", component: "RevenueTrends", enabled: true },
    { id: "top-services", title: "Service Insights", component: "TopServices", enabled: true },
    { id: "client-sentiment", title: "User Feedback", component: "ClientSentimentTracker", enabled: true },
    { id: "client-retention", title: "User Retention", component: "ClientRetention", enabled: true },
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
      
      // GuidedTour handles onboarding automatically via useTour hook
      
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
  
  const loadPredictiveInsights = async (stylistId: string) => {
    try {
      const { data, error } = await supabase
        .from('predictive_insights')
        .select('*')
        .eq('stylist_id', stylistId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (!error && data) {
        setPredictiveInsights(data);
      }
    } catch (error) {
      logger.warn('Failed to load predictive insights', { error });
    }
  };

  const checkUser = async (sessionUser: any, primaryRole: string) => {
    try {
      if (!sessionUser) {
        navigate("/auth");
        return;
      }

      // Get appropriate profile based on role
      if (primaryRole === "stylist") {
        const { data: stylistProfile } = await supabase
          .from("stylist_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();
        setProfile(stylistProfile);
      } else if (primaryRole === "client") {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();
        setProfile(clientProfile);
      } else if (primaryRole === "admin" || isAdmin) {
        // For admins, try to get stylist profile first, then client profile
        const { data: stylistProfile } = await supabase
          .from("stylist_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();
        
        if (stylistProfile) {
          setProfile(stylistProfile);
        } else {
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("*")
            .eq("user_id", sessionUser.id)
            .maybeSingle();
          setProfile(clientProfile);
        }
      }

      // Check if profile needs completion
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, gender")
        .eq("id", sessionUser.id)
        .maybeSingle();

      setUserProfile(profileData);
      
      // Load predictive insights for stylists
      if (primaryRole === "stylist" && predictiveInsightsEnabled && profile?.id) {
        loadPredictiveInsights(profile.id);
      }

      // Only show profile completion if not already marked as complete
      const profileComplete = localStorage.getItem('profile_completed');
      if (!profileData?.full_name && !profileComplete) {
        setShowProfileCompletion(true);
      }
    } catch (error: any) {
      toast.error("Unable to load your dashboard. Please refresh the page.");
      logger.error("Dashboard load failed", error);
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
      logger.error("Error loading dashboard data", error);
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
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    // Get upcoming appointments (including for calendar view)
    const { data: upcomingAppts } = await supabase
      .from("appointments")
      .select(`
        *,
        stylist:stylist_profiles(
          user:profiles(full_name),
          weekly_schedule
        )
      `)
      .eq("client_id", profile.id)
      .gte("appointment_date", today.toISOString())
      .neq("status", "cancelled")
      .order("appointment_date", { ascending: true });

    // Get week appointments for calendar view
    const { data: weekAppts } = await supabase
      .from("appointments")
      .select(`
        *,
        stylist:stylist_profiles(
          user:profiles(full_name)
        )
      `)
      .eq("client_id", profile.id)
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
      case "NextAppointment":
        return (userRole === "client" || isAdmin) ? (
          <NextAppointmentWidget />
        ) : null;
      case "LoyaltyProgress":
        return (userRole === "client" || isAdmin) ? <LoyaltyProgressWidget /> : null;
      case "AppointmentTimer":
        return (userRole === "stylist" || isAdmin) ? <AppointmentTimerWidget /> : null;
      case "ProgressTracker":
        return (userRole === "stylist" || isAdmin) ? <ProgressTracker /> : null;
      case "BirthdayAlerts":
        return (userRole === "stylist" || isAdmin) ? <BirthdayAlertsWidget /> : null;
      case "CommissionTracker":
        return (userRole === "stylist" || isAdmin) ? (
          <FeatureErrorBoundary featureName="Commission Tracker">
            <CommissionTrackerWidget />
          </FeatureErrorBoundary>
        ) : null;
      case "LiveKPICards":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Live KPIs">
            <LiveKPICards stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;
      case "QuickActions":
        return <QuickActions userRole={userRole || ""} isAdmin={isAdmin} />;
      case "WeeklyOverview":
        return (userRole === "stylist" || isAdmin) ? (
          <FeatureErrorBoundary featureName="Weekly Overview">
            <WeeklyOverview />
          </FeatureErrorBoundary>
        ) : null;
      case "ClientSentimentTracker":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Client Sentiment">
            <ClientSentimentTracker stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;
      case "RevenueTrends":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Revenue Analytics">
            <RevenueTrends stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;
      case "TopServices":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Service Performance">
            <TopServices stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;
      case "ClientRetention":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <FeatureErrorBoundary featureName="Retention Metrics">
            <ClientRetention stylistId={profile.id} />
          </FeatureErrorBoundary>
        ) : null;
      case "QuickNotes":
        return (userRole === "stylist" || isAdmin) ? <QuickNotes /> : null;
      case "ChurnRisk":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <AIFeatureErrorBoundary featureName="Churn Prediction">
            <ChurnRiskWidget stylistId={profile.id} variant="full" />
          </AIFeatureErrorBoundary>
        ) : null;
      case "ProactiveInsights":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <AIFeatureErrorBoundary featureName="Proactive Insights">
            <ProactiveInsightsPanel stylistId={profile.id} />
          </AIFeatureErrorBoundary>
        ) : null;
      case "PredictiveInsights":
        return (userRole === "stylist" || isAdmin) && predictiveInsightsEnabled && predictiveInsights.length > 0 ? (
          <AIFeatureErrorBoundary featureName="Predictive Insights">
            <PredictiveSuggestions 
              insights={predictiveInsights}
              onAction={(insightId) => {
                toast.success("Action taken on prediction");
                analytics.trackPrediction(predictiveInsights.length);
              }}
            />
          </AIFeatureErrorBoundary>
        ) : null;
      case "WeeklySchedule":
        return null; // Now rendered in welcome box
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
      case "SupportChatWidget":
        return <SupportChatWidget />;
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
      {/* Live Booking Notifications - Real-time toasts for new appointments */}
      {userRole === "stylist" && profile?.id && (
        <LiveBookingToast stylistId={profile.id} onNewBooking={loadDashboardData} />
      )}
      
      {/* Enhanced notification system */}
      {user && userRole && (
        <NotificationEnhancer userId={user.id} userRole={userRole as "stylist" | "client"} />
      )}
      
      {/* Quick Add Client FAB - Only for stylists */}
      {/* Quick Add Client FAB - Only for stylists in their own view (not admin god-mode) */}
      {userRole === "stylist" && !isAdmin && <QuickAddClientFAB />}
      
      <div className="w-full space-y-4 sm:space-y-6">
        
        <div className="mb-4 sm:mb-6 md:mb-8 window-frame bg-gradient-to-br from-blue-400 via-cyan-300 to-green-300 relative animate-fade-in-fast">
          <div className="window-titlebar">
            <span className="text-background font-mono text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-bold truncate max-w-[70vw]">
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </span>
            <div className="window-controls">
              <div className="window-control bg-background"></div>
              <div className="window-control bg-background"></div>
              <div className="window-control bg-background"></div>
            </div>
          </div>
          
          <div className="bg-blue-600 p-3 xs:p-4 sm:p-5 md:p-6 relative overflow-hidden">
            <div className="window-scrollbar"></div>
            
            <div className="w-full">
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-pixel font-bold mb-2 sm:mb-3 text-pink-400 uppercase leading-tight animate-fade-in break-words" style={{ animationDelay: '100ms' }}>
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || "there"}!
              </h2>
              
              {/* Stylists and Admins */}
              {(userRole === "stylist" || isAdmin) && (
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg font-sans font-medium text-pink-200 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    Your schedule at a glance 📅
                  </p>
                  <div className="bg-card rounded-lg border-2 border-secondary shadow-[4px_4px_0px_0px_hsl(var(--secondary)_/_0.6)] animate-fade-in overflow-hidden" style={{ animationDelay: '250ms' }}>
                    <WeeklyScheduleView
                        appointments={weekAppointments}
                        stylistSchedule={profile?.weekly_schedule}
                        stylistId={profile?.id}
                        onAppointmentClick={(apt) => navigate("/appointments")}
                        onTimeSlotClick={(date, hour, minute) => {
                          setQuickAppointmentData({ date, hour, minute });
                          setQuickAppointmentOpen(true);
                        }}
                        compact={true}
                      />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Customize Dashboard Controls */}
        {isEditMode && (
          <div className="mb-4 sm:mb-6 p-3 xs:p-4 sm:p-5 md:p-6 bg-primary/5 border-2 border-primary/20 rounded-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-pixel text-foreground mb-1 flex items-center gap-2">
                  <Edit3 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">Customize Dashboard</span>
                </h3>
                <p className="text-[10px] xs:text-[11px] sm:text-xs font-sans text-muted-foreground">
                  <span className="hidden sm:inline">Drag sections to reorder • Click eye icon to show/hide sections</span>
                  <span className="sm:hidden">Long-press to drag • Tap eye to toggle</span>
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="text-[10px] xs:text-xs font-bold uppercase tracking-wide flex-1 sm:flex-none min-h-[44px]"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden xs:inline">Reset</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="text-[10px] xs:text-xs font-bold uppercase tracking-wide flex-1 sm:flex-none min-h-[44px]"
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden xs:inline">Done</span>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {!isEditMode && stats && (
          <>
            {userRole === "client" && !isAdmin && (
              <div className="animate-fade-in" style={{ animationDelay: '320ms' }}>
                <RebookingPrompt />
              </div>
            )}
            
            {/* Dashboard Customization Prompt - Stylists & Admins only, not clients */}
            {(userRole === "stylist" || isAdmin) && (
              <div className="mb-4 p-4 sm:p-5 md:p-6 rounded-xl border-2 border-border/50 bg-card/40 backdrop-blur-sm brutal-shadow-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                      <Edit3 className="h-3.5 w-3.5 text-primary" />
                      {isAdmin ? "Customize Platform Dashboard" : "Personalize Your Dashboard"}
                    </p>
                    <p className="text-[10px] xs:text-xs text-muted-foreground">
                      {isAdmin 
                        ? "Configure platform monitoring sections to match your oversight needs" 
                        : "Add, remove, or rearrange sections to match your workflow"
                      }
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isAdmin && (
                      <StatsToggleButton />
                    )}
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => setIsEditMode(true)}
                      className="gap-1.5 shrink-0 w-full sm:w-auto shadow-sm h-8 text-[10px] xs:text-xs"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Customize</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
            <div className="space-y-6 md:space-y-8">
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
        
        {/* Quick Appointment Dialog - Stylist/Admin Only */}
        {(userRole === "stylist" || isAdmin) && quickAppointmentData && (
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


      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
