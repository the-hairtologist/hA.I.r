import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Scissors, Calendar, MessageSquare, DollarSign, BookOpen, User, LogOut, Users, Sparkles, Settings, GripVertical } from "lucide-react";
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";
import { OnboardingTour } from "@/components/OnboardingTour";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentReviews } from "@/components/dashboard/RecentReviews";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { WelcomeChecklist } from "@/components/WelcomeChecklist";
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
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-4 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([
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
    checkUser();
  }, []);

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
    }
  }, [userRole, profile]);

  const checkProfileCompletion = () => {
    if (!profile || !user || !userProfile) return;
    
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

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Get user roles (may have multiple)
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (rolesData && rolesData.length > 0) {
        // Prioritize stylist role if user has both roles
        const stylistRole = rolesData.find(r => r.role === "stylist");
        const primaryRole = stylistRole ? "stylist" : rolesData[0].role;
        setUserRole(primaryRole);

        // Get appropriate profile
        if (primaryRole === "stylist") {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="text-center bg-white p-8 rounded-xl border-[3px] border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] animate-fade-in">
          <div className="relative mb-4">
            <Scissors className="h-12 w-12 text-primary animate-pulse mx-auto" aria-hidden="true" />
            <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium" role="status" aria-live="polite">Loading your dashboard...</p>
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
      title: "My Color Formulas",
      description: "Your custom formulas saved forever—bring them to any salon, anywhere",
      icon: Sparkles,
      route: "/my-formulas",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "Hair Care Library",
      description: "Unlock expert tips on maintaining your color and keeping your hair healthy",
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
      case "quick-actions":
        return <QuickActions key={sectionId} userRole={userRole || ""} />;
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
      <div className="container mx-auto px-4 py-8 pl-12">
        <div className="mb-12 window-frame bg-gradient-to-br from-blue-400 via-cyan-300 to-green-300 relative">
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
          
          <div className="bg-blue-600 p-6 md:p-8 relative">
            <div className="window-scrollbar"></div>
            
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-4">
                {userProfile?.gender && (
                  <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-pink-400 rounded-2xl overflow-hidden bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(244,114,182,0.8)] flex-shrink-0">
                    <img 
                      src={
                        userProfile.gender === 'male' ? avatarMale :
                        userProfile.gender === 'female' ? avatarFemale :
                        avatarNeutral
                      } 
                      alt="Your Lego avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-display font-black mb-4 text-pink-400 uppercase leading-tight">
                Welcome back, {user?.user_metadata?.full_name || "there"}!
              </h2>
              
              <p className="text-base md:text-lg font-medium text-pink-200 mb-6 max-w-2xl">
                {welcomeMessage}
              </p>
              
              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={() => {
                    if (userRole === "stylist") {
                      navigate("/appointments");
                    } else {
                      navigate("/stylists");
                    }
                  }}
                  className="px-6 py-3 bg-pink-500 text-white font-display font-bold text-lg border-4 border-pink-400 hover:translate-x-1 hover:translate-y-1 transition-transform"
                >
                  LET'S GO!
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/knowledge")}
                  className="px-6 py-3 bg-transparent text-pink-300 font-display font-bold text-lg border-4 border-pink-400 hover:bg-pink-500 hover:text-white transition-colors"
                >
                  MAYBE LATER
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-secondary border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] p-4 rounded-lg animate-fade-in">
          <p className="text-base font-display font-bold text-secondary-foreground text-center flex items-center justify-center gap-2">
            <GripVertical className="h-5 w-5 animate-pulse" />
            Hover over sections and drag the handle to rearrange your dashboard!
            <GripVertical className="h-5 w-5 animate-pulse" />
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
            <div className="space-y-8">
              {sectionOrder.map((sectionId) => {
                const content = renderSection(sectionId);
                if (!content) return null;
                
                return (
                  <SortableSection key={sectionId} id={sectionId}>
                    {content}
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
