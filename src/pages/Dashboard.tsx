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
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Schedule Management",
      description: "Control your calendar—set weekly hours, block vacation days, and manage your availability all in one place",
      icon: Settings,
      route: "/schedule",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "💬 AI Chat Assistant",
      description: "Ask questions, troubleshoot issues, learn techniques—your personal color expert for quick advice and guidance (nothing saved)",
      icon: Sparkles,
      route: "/ai-assistant",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "📋 Formula Generator",
      description: "Create complete client formulas with exact measurements, step-by-step instructions, and save them to your client's history",
      icon: Scissors,
      route: "/formulas",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "Payment Tracking",
      description: "See every dollar earned at a glance—never lose track of client payments",
      icon: DollarSign,
      route: "/payments",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Commissions",
      description: "Turn product recommendations into income—track your earnings effortlessly",
      icon: DollarSign,
      route: "/commissions",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Knowledge Base",
      description: "Master your craft with curated color techniques, trends, and pro tips",
      icon: BookOpen,
      route: "/knowledge",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  const clientFeatures = [
    {
      title: "My Color Formulas",
      description: "Your custom formulas saved forever—bring them to any salon, anywhere",
      icon: Sparkles,
      route: "/my-formulas",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Hair Care Library",
      description: "Unlock expert tips on maintaining your color and keeping your hair healthy",
      icon: BookOpen,
      route: "/knowledge",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  const features = userRole === "stylist" ? stylistFeatures : clientFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Navigation 
        userRole={userRole || undefined} 
        userName={profile?.user?.full_name || user?.user_metadata?.full_name}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3 animate-fade-in bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Welcome back, {user?.user_metadata?.full_name || "there"}!
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "100ms" }}>
            {userRole === "stylist" 
              ? "Manage your clients and grow your business" 
              : "Book appointments and stay beautiful"}
          </p>
        </div>

        <QuickActions userRole={userRole || ""} />

        <DashboardStats stats={stats} userRole={userRole || ""} />

        <div className="grid lg:grid-cols-1 gap-6 mb-8">
          <RecentActivity activities={recentActivities} />
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
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
