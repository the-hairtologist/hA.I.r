import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
  icon: string;
}

const STYLIST_MILESTONES = [
  { id: "first-client", title: "Add Your First Client", description: "Build your client base", points: 10, icon: "👤" },
  { id: "first-appointment", title: "Complete First Appointment", description: "Deliver great service", points: 15, icon: "📅" },
  { id: "5-clients", title: "Reach 5 Clients", description: "Growing your business", points: 25, icon: "👥" },
  { id: "first-formula", title: "Save a Formula", description: "Track your work", points: 10, icon: "🧪" },
  { id: "setup-services", title: "Add Your Services", description: "Define your offerings", points: 15, icon: "✂️" },
  { id: "complete-profile", title: "Complete Your Profile", description: "Stand out to clients", points: 20, icon: "⭐" },
  { id: "10-appointments", title: "Complete 10 Appointments", description: "Building momentum", points: 50, icon: "🚀" },
  { id: "enable-booking", title: "Enable Online Booking", description: "Automate scheduling", points: 30, icon: "🔗" },
];

export const ProgressTracker = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [level, setLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: stylistData } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!stylistData) return;

      // Check each milestone
      const completionStatus = await Promise.all(
        STYLIST_MILESTONES.map(async (milestone) => {
          const completed = await checkMilestone(milestone.id, stylistData.id);
          return { ...milestone, completed };
        })
      );

      setMilestones(completionStatus);

      // Calculate points and level
      const points = completionStatus
        .filter((m) => m.completed)
        .reduce((sum, m) => sum + m.points, 0);
      
      setTotalPoints(points);
      setLevel(Math.floor(points / 50) + 1);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkMilestone = async (milestoneId: string, stylistId: string): Promise<boolean> => {
    try {
      switch (milestoneId) {
        case "first-client": {
          const { count } = await supabase
            .from("client_profiles")
            .select("*", { count: "exact", head: true })
            .eq("preferred_stylist_id", stylistId);
          return (count || 0) >= 1;
        }
        case "5-clients": {
          const { count } = await supabase
            .from("client_profiles")
            .select("*", { count: "exact", head: true })
            .eq("preferred_stylist_id", stylistId);
          return (count || 0) >= 5;
        }
        case "first-appointment": {
          const { count } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("stylist_id", stylistId)
            .eq("status", "completed");
          return (count || 0) >= 1;
        }
        case "10-appointments": {
          const { count } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("stylist_id", stylistId)
            .eq("status", "completed");
          return (count || 0) >= 10;
        }
        case "first-formula": {
          const { count } = await supabase
            .from("formulas")
            .select("*", { count: "exact", head: true })
            .eq("stylist_id", stylistId);
          return (count || 0) >= 1;
        }
        case "setup-services": {
          const { count } = await supabase
            .from("stylist_services")
            .select("*", { count: "exact", head: true })
            .eq("stylist_id", stylistId);
          return (count || 0) >= 1;
        }
        case "complete-profile": {
          const { data } = await supabase
            .from("stylist_profiles")
            .select("business_name, specialty, bio")
            .eq("id", stylistId)
            .maybeSingle();
          return !!(data?.business_name && data?.specialty && data?.bio);
        }
        case "enable-booking": {
          const { data } = await supabase
            .from("stylist_profiles")
            .select("booking_page_active")
            .eq("id", stylistId)
            .maybeSingle();
          return data?.booking_page_active === true;
        }
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error checking milestone ${milestoneId}:`, error);
      return false;
    }
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercentage = (completedCount / milestones.length) * 100;
  const maxPoints = STYLIST_MILESTONES.reduce((sum, m) => sum + m.points, 0);
  const nextLevelPoints = level * 50;

  if (loading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <Card className="brutal-border brutal-shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Progress
          </CardTitle>
          <Badge variant="default" className="text-lg px-4">
            Level {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{completedCount}/{milestones.length} milestones</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Points to Next Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Points to Level {level + 1}</span>
            <span className="font-semibold">{totalPoints}/{nextLevelPoints}</span>
          </div>
          <Progress value={(totalPoints % 50) * 2} className="h-2" />
        </div>

        {/* Milestones List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Milestones</h3>
            <div className="flex items-center gap-1 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">{totalPoints} pts</span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all",
                  milestone.completed
                    ? "bg-success/10 border-success/20"
                    : "bg-card hover:bg-muted/50"
                )}
              >
                <div className="flex-shrink-0 text-2xl">{milestone.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      "font-medium text-sm",
                      milestone.completed && "line-through text-muted-foreground"
                    )}>
                      {milestone.title}
                    </h4>
                    {milestone.completed ? (
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                </div>
                <Badge variant="secondary" className="flex-shrink-0">
                  +{milestone.points}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
