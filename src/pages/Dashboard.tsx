import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Scissors, Calendar, MessageSquare, DollarSign, BookOpen, User, LogOut, Users, Sparkles } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

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
    } catch (error: any) {
      toast.error("Error loading dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      title: "Formulas & History",
      description: "View and manage client formulas with AI assistance",
      icon: Scissors,
      route: "/formulas",
    },
    {
      title: "Appointments",
      description: "Manage your schedule and bookings",
      icon: Calendar,
      route: "/appointments",
    },
    {
      title: "Messages",
      description: "Chat with clients and view videos",
      icon: MessageSquare,
      route: "/messages",
    },
    {
      title: "Payment Tracking",
      description: "Track service payments from clients",
      icon: DollarSign,
      route: "/payments",
    },
    {
      title: "Commissions",
      description: "Track your product commissions",
      icon: DollarSign,
      route: "/commissions",
    },
    {
      title: "Knowledge Base",
      description: "Learn color theory and techniques",
      icon: BookOpen,
      route: "/knowledge",
    },
  ];

  const clientFeatures = [
    {
      title: "Find Stylists",
      description: "Discover and book with professional stylists",
      icon: Users,
      route: "/stylists",
    },
    {
      title: "My Formulas",
      description: "View your hair color history",
      icon: Sparkles,
      route: "/my-formulas",
    },
    {
      title: "Book Appointment",
      description: "Schedule your next salon visit",
      icon: Calendar,
      route: "/book-appointment",
    },
    {
      title: "Messages",
      description: "Chat with your stylist",
      icon: MessageSquare,
      route: "/messages",
    },
    {
      title: "My Appointments",
      description: "View and manage bookings",
      icon: Calendar,
      route: "/my-appointments",
    },
  ];

  const features = userRole === "stylist" ? stylistFeatures : clientFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">hA.I.r</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || "there"}!
          </h2>
          <p className="text-muted-foreground">
            {userRole === "stylist" 
              ? "Manage your clients and grow your business" 
              : "Book appointments and stay beautiful"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.route} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(feature.route)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Open
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
