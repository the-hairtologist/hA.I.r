import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Scissors, Calendar, MessageSquare, DollarSign, BookOpen, User, LogOut, Users, Sparkles, Settings } from "lucide-react";
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { Navigation } from "@/components/Navigation";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userRole && profile) {
      loadDashboardData();
    }
  }, [userRole, profile]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData) {
        console.log('👤 User role detected:', roleData.role);
        setUserRole(roleData.role);

        // Get appropriate profile
        if (roleData.role === "stylist") {
          const { data: stylistProfile } = await supabase
            .from("stylist_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          setProfile(stylistProfile);
        } else {
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          setProfile(clientProfile);
        }
      }

      // Check if profile needs completion
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

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
      .select("*")
      .eq("stylist_id", profile.id)
      .gte("appointment_date", weekStart.toISOString())
      .lte("appointment_date", weekEnd.toISOString())
      .neq("status", "cancelled");

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Scissors className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const stylistFeatures = [
    {
      title: "Services & Pricing",
      description: "Showcase what you do best—set your prices, durations, and watch bookings roll in",
      icon: DollarSign,
      route: "/services",
      isPrimary: true,
    },
    {
      title: "Availability",
      description: "Take control of your calendar—set hours, block dates, and never miss a beat",
      icon: Settings,
      route: "/availability",
      isPrimary: true,
    },
    {
      title: "AI Hair Assistant",
      description: "Get instant expert guidance—ask anything about color formulation, troubleshooting, or techniques",
      icon: Sparkles,
      route: "/ai-assistant",
      isPrimary: true,
    },
    {
      title: "AI Formula Generator",
      description: "Create flawless color formulas in seconds—just upload a photo and let AI do the work",
      icon: Scissors,
      route: "/formulas",
      isPrimary: false,
    },
    {
      title: "Payment Tracking",
      description: "See every dollar earned at a glance—never lose track of client payments",
      icon: DollarSign,
      route: "/payments",
      isPrimary: false,
    },
    {
      title: "Commissions",
      description: "Turn product recommendations into income—track your earnings effortlessly",
      icon: DollarSign,
      route: "/commissions",
      isPrimary: false,
    },
    {
      title: "Knowledge Base",
      description: "Master your craft with curated color techniques, trends, and pro tips",
      icon: BookOpen,
      route: "/knowledge",
      isPrimary: false,
    },
    {
      title: "Blocked Dates",
      description: "Protect your time off—schedule vacations and holidays with zero stress",
      icon: Calendar,
      route: "/blocked-dates",
      isPrimary: false,
    },
  ];

  const clientFeatures = [
    {
      title: "My Color Formulas",
      description: "Your custom formulas saved forever—bring them to any salon, anywhere",
      icon: Sparkles,
      route: "/my-formulas",
      isPrimary: false,
    },
    {
      title: "Hair Care Library",
      description: "Unlock expert tips on maintaining your color and keeping your hair healthy",
      icon: BookOpen,
      route: "/knowledge",
      isPrimary: false,
    },
  ];

  const features = userRole === "stylist" ? stylistFeatures : clientFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navigation 
        userRole={userRole || undefined} 
        userName={profile?.user?.full_name || user?.user_metadata?.full_name}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 animate-fade-in">
            Welcome back, {user?.user_metadata?.full_name || "there"}!
          </h2>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "100ms" }}>
            {userRole === "stylist" 
              ? "Manage your clients and grow your business" 
              : "Book appointments and stay beautiful"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Account type: <span className="font-semibold capitalize">{userRole || "loading..."}</span>
          </p>
        </div>

        <QuickActions userRole={userRole || ""} />

        <DashboardStats stats={stats} userRole={userRole || ""} />

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivities} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            {features.slice(0, 4).map((feature, index) => (
              <FeatureCard
                key={feature.route}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                route={feature.route}
                isPrimary={feature.isPrimary}
                index={index}
              />
            ))}
          </div>
        </div>

        {features.length > 4 && (
          <>
            <h3 className="text-lg font-semibold mb-4">More Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.slice(4).map((feature, index) => (
                <FeatureCard
                  key={feature.route}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  route={feature.route}
                  index={index + 4}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <ProfileCompletionDialog
        open={showProfileCompletion}
        onOpenChange={setShowProfileCompletion}
        userRole={userRole}
        userId={user?.id}
      />
    </div>
  );
};

export default Dashboard;
