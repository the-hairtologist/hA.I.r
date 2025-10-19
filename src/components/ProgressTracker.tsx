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
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="truncate">Your Progress</span>
          </CardTitle>
          <Badge variant="default" className="text-sm sm:text-lg px-3 sm:px-4 shrink-0">
            Level {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold shrink-0">{completedCount}/{milestones.length} milestones</span>
          </div>
          <Progress value={progressPercentage} className="h-2 sm:h-3" />
        </div>

        {/* Points to Next Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
            <span className="text-muted-foreground truncate">Points to Level {level + 1}</span>
            <span className="font-semibold shrink-0">{totalPoints}/{nextLevelPoints}</span>
          </div>
          <Progress value={(totalPoints % 50) * 2} className="h-2" />
        </div>

        {/* Milestones List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Milestones</h3>
            <div className="flex items-center gap-1 text-primary shrink-0">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-semibold">{totalPoints} pts</span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[60vh] sm:max-h-80 overflow-y-auto pr-1">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  "flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border transition-all touch-manipulation",
                  milestone.completed
                    ? "bg-success/10 border-success/20"
                    : "bg-card hover:bg-muted/50 active:bg-muted"
                )}
              >
                <div className="flex-shrink-0 text-xl sm:text-2xl" aria-hidden="true">{milestone.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      "font-medium text-xs sm:text-sm flex-1",
                      milestone.completed && "line-through text-muted-foreground"
                    )}>
                      {milestone.title}
                    </h4>
                    {milestone.completed ? (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">{milestone.description}</p>
                </div>
                <Badge variant="secondary" className="flex-shrink-0 text-[10px] sm:text-xs px-2 sm:px-2.5">
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
