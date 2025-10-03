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
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from "date-fns";
import { DashboardLayout } from "@/components/DashboardLayout";
import avatarMale from "@/assets/avatar-male-lego.png";
import avatarFemale from "@/assets/avatar-female-lego.png";
import avatarNeutral from "@/assets/avatar-neutral-lego.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

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
        .select("full_name, gender")
        .eq("id", session.user.id)
        .single();

      setUserProfile(profileData);

      // CRITICAL: Profile completion is MANDATORY - block all features until complete
      if (!profileData?.full_name) {
        setShowProfileCompletion(true);
        return; // Stop loading dashboard data until profile is complete
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
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      title: "Schedule Management",
      description: "Control your calendar—set weekly hours, block vacation days, and manage your availability all in one place",
      icon: Settings,
      route: "/schedule",
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      title: "💬 AI Chat Assistant",
      description: "Ask questions, troubleshoot issues, learn techniques—your personal color expert for quick advice and guidance (nothing saved)",
      icon: Sparkles,
      route: "/ai-assistant",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "📋 Formula Generator",
      description: "Create complete client formulas with exact measurements, step-by-step instructions, and save them to your client's history",
      icon: Scissors,
      route: "/formulas",
      gradient: "from-red-400 to-orange-500",
    },
    {
      title: "Payment Tracking",
      description: "See every dollar earned at a glance—never lose track of client payments",
      icon: DollarSign,
      route: "/payments",
      gradient: "from-yellow-300 to-orange-400",
    },
    {
      title: "Commissions",
      description: "Turn product recommendations into income—track your earnings effortlessly",
      icon: DollarSign,
      route: "/commissions",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      title: "Knowledge Base",
      description: "Master your craft with curated color techniques, trends, and pro tips",
      icon: BookOpen,
      route: "/knowledge",
      gradient: "from-indigo-400 to-blue-500",
    },
  ];

  const clientFeatures = [
    {
      title: "Find Your Stylist",
      description: "Discover top-rated stylists near you—browse portfolios, read reviews, and find your perfect match",
      icon: Users,
      route: "/stylists",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      title: "Book Appointment",
      description: "Schedule your next color session—pick your stylist, choose your service, and secure your spot",
      icon: Calendar,
      route: "/book-appointment",
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      title: "My Appointments",
      description: "Track all your bookings—view upcoming sessions, reschedule if needed, and never miss a color day",
      icon: Calendar,
      route: "/my-appointments",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "My Color Formulas",
      description: "Your custom formulas saved forever—bring them to any salon, anywhere",
      icon: Scissors,
      route: "/my-formulas",
      gradient: "from-red-400 to-orange-500",
    },
    {
      title: "Messages",
      description: "Stay connected with your stylist—chat about your next look, share inspiration, and get expert guidance",
      icon: MessageSquare,
      route: "/messages",
      gradient: "from-yellow-300 to-orange-400",
    },
    {
      title: "Hair Care Library",
      description: "Master your hair care routine—learn techniques, discover trends, and unlock pro tips for gorgeous hair",
      icon: BookOpen,
      route: "/knowledge",
      gradient: "from-green-400 to-emerald-500",
    },
  ];

  const features = userRole === "stylist" ? stylistFeatures : clientFeatures;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 window-frame bg-gradient-to-br from-primary via-accent to-secondary relative">
          <div className="window-titlebar">
            <span className="text-background font-mono text-sm font-bold">
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </span>
            <div className="window-controls">
              <div className="window-control bg-background"></div>
              <div className="window-control bg-background"></div>
              <div className="window-control bg-background"></div>
            </div>
          </div>
          
          <div className="bg-primary p-8 md:p-12 relative min-h-[300px]">
            <div className="window-scrollbar"></div>
            
            <div className="max-w-3xl">
              <div className="flex items-center gap-6 mb-8">
                {userProfile?.gender && (
                  <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-secondary rounded-2xl overflow-hidden bg-accent shadow-[4px_4px_0px_0px_hsl(var(--secondary))] flex-shrink-0">
                    <img 
                      src={
                        userProfile.gender === 'male' ? avatarMale :
                        userProfile.gender === 'female' ? avatarFemale :
                        avatarNeutral
                      } 
                      alt="Your avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              
              <h2 className="text-4xl md:text-6xl font-display font-black mb-6 text-pink-400 uppercase leading-tight">
                Welcome back, {user?.user_metadata?.full_name || "there"}!
              </h2>
              
              <p className="text-lg md:text-xl font-medium text-primary-foreground/90 mb-8 max-w-2xl">
                {userRole === "stylist" 
                  ? "Ready to create some color magic today? Let's make beautiful hair transformations happen." 
                  : "Your hair journey continues. Discover new styles, book appointments, and keep track of your favorite looks."}
              </p>
              
              <div className="flex gap-4 flex-wrap">
                <Button 
                  size="lg"
                  className="px-8 py-6 bg-secondary text-secondary-foreground font-display font-bold text-lg border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 transition-all uppercase"
                  onClick={() => navigate("/formulas")}
                >
                  {userRole === "stylist" ? "Create Formula" : "View My Formulas"}
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 bg-transparent text-primary-foreground font-display font-bold text-lg border-4 border-secondary hover:bg-secondary hover:text-secondary-foreground transition-all uppercase"
                  onClick={() => navigate("/appointments")}
                >
                  {userRole === "stylist" ? "View Schedule" : "Book Appointment"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <QuickActions userRole={userRole || ""} />

        <DashboardStats stats={stats} userRole={userRole || ""} />

        <div className="grid lg:grid-cols-1 gap-6 mb-8">
          <RecentActivity activities={recentActivities} />
        </div>

        <div className="mb-8">
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

        <ProfileCompletionDialog
          open={showProfileCompletion}
          onOpenChange={setShowProfileCompletion}
          userRole={userRole}
          userId={user?.id}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
