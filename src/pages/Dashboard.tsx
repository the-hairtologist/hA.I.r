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
import { DashboardSkeleton } from "@/components/loading/PageSkeleton";
import { NextAppointmentWidget } from "@/components/dashboard/NextAppointmentWidget";
import { LoyaltyProgressWidget } from "@/components/dashboard/LoyaltyProgressWidget";
import { CommissionTrackerWidget } from "@/components/dashboard/CommissionTrackerWidget";
import { QuickAddClientFAB } from "@/components/QuickAddClientFAB";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NotificationEnhancer } from "@/components/NotificationEnhancer";
import { useAnalytics } from "@/hooks/useAnalytics";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { AppointmentTimerWidget } from "@/components/AppointmentTimerWidget";
import { BirthdayAlertsWidget } from "@/components/BirthdayAlertsWidget";
import { StatsToggleButton } from "@/components/admin/StatsToggleButton";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { useResponsive } from "@/hooks/useResponsive";
import { MobileDashboardDrawer } from "@/components/dashboard/MobileDashboardDrawer";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import { playHapticForAction } from "@/lib/mobile/HapticPatterns";
import { useRef } from "react";

import { WelcomeChecklist } from "@/components/WelcomeChecklist";
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
import { PredictiveSuggestions } from "@/components/PredictiveSuggestions";
import { AIFeatureErrorBoundary } from "@/components/AIFeatureErrorBoundary";
import { useAIAnalytics } from "@/hooks/useAIAnalytics";
import { useFeatureFlag } from "@/lib/featureFlags";
import { Button } from "@/components/ui/button";
import { Edit3, RotateCcw, Save, StickyNote, MessageCircle, Sparkles, BookOpen } from "lucide-react";
import { ProgressTracker } from "@/components/ProgressTracker";
import { VoiceInterface } from "@/components/VoiceInterface";
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
  const { isMobile } = useResponsive();
  
  // Swipe gestures for mobile navigation
  const swipeRef = useSwipeGestures({
    onSwipeRight: () => {
      if (isMobile) {
        navigate(-1); // Go back
      }
    },
    onSwipeDown: () => {
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        playHapticForAction('refresh');
      }
    },
  });
  
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
  
  // AI Features
  const analytics = useAIAnalytics();
  const predictiveInsightsEnabled = useFeatureFlag('PREDICTIVE_INSIGHTS');
  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);

  // Enable analytics tracking
  useAnalytics();

  // Stylist dashboard sections - business management focus
  const defaultStylistSections: DashboardSection[] = [
    { id: "voice-assistant", title: "Voice Assistant", component: "VoiceInterface", enabled: true },
    { id: "progress-tracker", title: "Your Progress", component: "ProgressTracker", enabled: true },
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
    { id: "rebooking-prompt", title: "Time for a Touch-Up", component: "RebookingPrompt", enabled: true },
    { id: "next-appointment", title: "Upcoming", component: "NextAppointment", enabled: true },
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
  
  // CRITICAL FIX: Always pass defaultSections, let the hook handle loading internally
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
      
      // Mark dashboard as loaded for coordinating other components
      sessionStorage.setItem('dashboard_loaded', 'true');
      
      // Check if we should show onboarding - only OnboardingWizard
      const onboardingComplete = localStorage.getItem('onboarding_completed');
      const profileComplete = localStorage.getItem('profile_completed');
      
      if (!onboardingComplete && user) {
        setTimeout(() => setShowOnboardingWizard(true), 500);
      }
      
      // Only check profile completion if not already marked complete AND onboarding is done
      if (profileComplete || !onboardingComplete) {
        return; // Skip profile completion check
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
    
    // Cleanup: Clear dashboard_loaded flag on unmount
    return () => {
      sessionStorage.removeItem('dashboard_loaded');
    };
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
      console.warn('Failed to load predictive insights:', error);
    }
  };

  const checkUser = async (sessionUser: any, primaryRole: string) => {
    try {
      if (!sessionUser) {
        navigate("/auth");
        return;
      }

      console.log('[Dashboard] Loading profile for role:', primaryRole);

      // Get appropriate profile based on role
      if (primaryRole === "stylist") {
        const { data: stylistProfile, error: stylistError } = await supabase
          .from("stylist_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();
        
        if (stylistError && stylistError.code !== 'PGRST116') {
          console.error('Error loading stylist profile:', stylistError);
          // Don't throw - just log and continue without profile
        }
        
        console.log('[Dashboard] Stylist profile loaded:', !!stylistProfile);
        setProfile(stylistProfile);
      } else if (primaryRole === "client") {
        const { data: clientProfile, error: clientError } = await supabase
          .from("client_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();
        
        if (clientError && clientError.code !== 'PGRST116') {
          console.error('Error loading client profile:', clientError);
          // Don't throw - just log and continue without profile
        }
        
        console.log('[Dashboard] Client profile loaded:', !!clientProfile);
        setProfile(clientProfile);
      } else if (primaryRole === "admin" || isAdmin) {
        // For admins, try to get stylist profile first, then client profile
        const { data: stylistProfile, error: stylistError } = await supabase
          .from("stylist_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();
        
        if (stylistError && stylistError.code !== 'PGRST116') {
          console.error('Error loading admin stylist profile:', stylistError);
          // Don't throw - just log and continue
        }
        
        if (stylistProfile) {
          console.log('[Dashboard] Admin stylist profile loaded');
          setProfile(stylistProfile);
        } else {
          const { data: clientProfile, error: clientError } = await supabase
            .from("client_profiles")
            .select("*")
            .eq("user_id", sessionUser.id)
            .maybeSingle();
          
          if (clientError && clientError.code !== 'PGRST116') {
            console.error('Error loading admin client profile:', clientError);
            // Don't throw - just log and continue
          }
          
          console.log('[Dashboard] Admin client profile loaded');
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

  // CRITICAL: Wait for ALL loading states to complete before rendering dashboard
  // This prevents crashes from premature database queries or null references
  if (authLoading || roleLoading || loading || layoutLoading || !user || !userRole) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 lg:p-8">
          <DashboardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  const renderSection = (section: DashboardSection) => {
    if (!section.enabled) return null;

    switch (section.component) {
      case "VoiceInterface":
        return <VoiceInterface />;
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
        return (userRole === "stylist" || isAdmin) ? <CommissionTrackerWidget /> : null;
      case "LiveKPICards":
        return (userRole === "stylist" || isAdmin) && profile?.id ? (
          <LiveKPICards stylistId={profile.id} />
        ) : null;
      case "QuickActions":
        return <QuickActions userRole={userRole || ""} isAdmin={isAdmin} />;
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
      case "RebookingPrompt":
        return (userRole === "client" || isAdmin) ? (
          <RebookingPrompt />
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
      
      {/* Quick Add Client FAB - Only for stylists */}
      {userRole === "stylist" && !isAdmin && <QuickAddClientFAB />}
      
      <div ref={swipeRef as any} className="w-full space-y-4 sm:space-y-6">
        
        <div className="mb-6 sm:mb-8 window-frame bg-gradient-to-br from-blue-400 via-cyan-300 to-green-300 relative animate-fade-in-fast">
          <div className="window-titlebar">
            <span className="text-background font-mono text-[11px] sm:text-xs md:text-sm font-bold">
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </span>
            <div className="window-controls">
              <div className="window-control bg-background"></div>
              <div className="window-control bg-background"></div>
              <div className="window-control bg-background"></div>
            </div>
          </div>
          
          <div className="bg-blue-600 p-2 sm:p-3 md:p-5 relative overflow-hidden">
            <div className="window-scrollbar"></div>
            
            <div className="w-full">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-pixel font-bold mb-2 sm:mb-3 text-pink-400 uppercase leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
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
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 md:p-6 bg-primary/5 border-2 border-primary/20 rounded-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-pixel text-foreground mb-1 flex items-center gap-2">
                  <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Customize Dashboard
                </h3>
                <p className="text-[11px] sm:text-xs font-sans text-muted-foreground">
                  <span className="hidden sm:inline">Drag sections to reorder • Click eye icon to show/hide sections</span>
                  <span className="sm:hidden">Long-press to drag • Tap eye to toggle</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="text-xs font-bold uppercase tracking-wide"
                >
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="text-xs font-bold uppercase tracking-wide"
                >
                  <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {!isEditMode && stats && (
          <>
            {/* Stylist Welcome Checklist - Show only for new stylists */}
            {userRole === "stylist" && !isAdmin && stats.todayAppointments === 0 && stats.totalClients === 0 && (
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
            
            {/* Client Welcome Checklist - Show only for clients, not admins */}
            {userRole === "client" && !isAdmin && stats.upcomingAppointments === 0 && (
              <div className="mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <WelcomeChecklist 
                  userRole="client"
                  profileComplete={!!userProfile?.full_name}
                  hasAppointments={stats.upcomingAppointments > 0}
                />
              </div>
            )}
            
            {/* Rebooking Prompt - Clients only, not admins */}
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
                      <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
            {isMobile && !isEditMode ? (
              // Mobile 3-tier layout
              <>
                {/* Tier 1: Primary sections - always visible */}
                <div className="space-y-3">
                  {sections
                    .filter(s => 
                      ['appointment-timer', 'next-appointment', 'kpi-cards', 'quick-actions', 'recent-activity'].includes(s.id)
                    )
                    .slice(0, 4)
                    .map((section, index) => (
                      <DraggableSection
                        key={section.id}
                        section={section}
                        isEditMode={false}
                        onToggle={() => toggleSection(section.id)}
                        animationDelay={`${350 + index * 50}ms`}
                      >
                        {renderSection(section)}
                      </DraggableSection>
                    ))}
                </div>

                {/* Tier 2: Secondary sections - collapsible */}
                {sections.filter(s => 
                  ['weekly-overview', 'commission-tracker', 'progress-tracker', 'loyalty-progress'].includes(s.id)
                ).length > 0 && (
                  <div className="space-y-3 mt-4">
                    {sections
                      .filter(s => 
                        ['weekly-overview', 'commission-tracker', 'progress-tracker', 'loyalty-progress'].includes(s.id)
                      )
                      .map((section, index) => (
                        <DraggableSection
                          key={section.id}
                          section={section}
                          isEditMode={false}
                          onToggle={() => toggleSection(section.id)}
                          animationDelay={`${550 + index * 50}ms`}
                        >
                          {renderSection(section)}
                        </DraggableSection>
                      ))}
                  </div>
                )}

                {/* Tier 3: Drawer sections - "More Stats" */}
                {sections.filter(s => 
                  !['appointment-timer', 'next-appointment', 'kpi-cards', 'quick-actions', 'recent-activity',
                    'weekly-overview', 'commission-tracker', 'progress-tracker', 'loyalty-progress'].includes(s.id)
                ).length > 0 && (
                  <MobileDashboardDrawer
                    sections={sections.filter(s => 
                      !['appointment-timer', 'next-appointment', 'kpi-cards', 'quick-actions', 'recent-activity',
                        'weekly-overview', 'commission-tracker', 'progress-tracker', 'loyalty-progress'].includes(s.id)
                    )}
                    renderSection={(section) => (
                      <div key={section.id}>
                        {renderSection(section)}
                      </div>
                    )}
                  />
                )}
              </>
            ) : (
              // Desktop or Edit Mode: Show all sections
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
            )}
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

        {/* New Onboarding Wizard */}
        {userRole && (
          <OnboardingWizard
            open={showOnboardingWizard}
            onComplete={() => {
              setShowOnboardingWizard(false);
              // Reload dashboard data after onboarding completes
              setTimeout(() => {
                if (userRole && profile) {
                  loadDashboardData();
                }
              }, 100);
            }}
            userRole={userRole as "stylist" | "client" | "admin"}
          />
        )}

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
