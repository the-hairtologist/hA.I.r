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

  // Enable analytics tracking
  useAnalytics();

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
      
      // Delayed subscription prompt (after user gets value - 5 appointments)
      if (userRole === "stylist" && !subscriptionLoading && !subscribed && !inTrial) {
        const promptDismissed = localStorage.getItem('subscription_prompt_dismissed');
        if (!promptDismissed) {
          // Check appointment count before showing
          supabase
            .from("appointments")
            .select("id", { count: "exact" })
            .eq("stylist_id", profile.id)
            .then(({ count }) => {
              if ((count || 0) >= 5) {
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
        setShowProfileCompletion(true);
      }
    } else if (basicIncomplete) {
      setShowProfileCompletion(true);
    }
  };

  const loadLayoutPreferences = async () => {
    // Removed - dashboard now has fixed layout for simplicity
  };

  const saveLayoutPreferences = async (newOrder: string[]) => {
    // Removed - dashboard now has fixed layout for simplicity
  };

  const handleDragEnd = (event: any) => {
    // Removed - drag and drop disabled for simplicity
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

  const renderSection = (sectionId: string) => {
    // Removed - sections now rendered inline for simplicity
    return null;
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
            </div>
          </div>
        </div>

        <div className="mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground text-center">
            Simplified for speed and clarity
          </p>
        </div>

        <div className="space-y-8">
          {/* KPI Cards */}
          {userRole === "stylist" && profile?.id && (
            <div className="animate-fade-in" style={{ animationDelay: '350ms' }}>
              <LiveKPICards stylistId={profile.id} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <QuickActions userRole={userRole || ""} />
          </div>

          {/* Weekly Overview & Tasks */}
          {userRole === "stylist" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '450ms' }}>
              <WeeklyOverview />
              <QuickTasks />
            </div>
          )}
        </div>

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
