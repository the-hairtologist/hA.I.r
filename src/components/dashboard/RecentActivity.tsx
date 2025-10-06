import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Star, DollarSign, Scissors, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Activity {
  id: string;
  type: "appointment" | "message" | "review" | "payment" | "formula";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  // Show only 3 items on mobile, all on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const displayActivities = (isMobile && !showAll) ? activities.slice(0, 3) : activities;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return Calendar;
      case "message":
        return MessageSquare;
      case "review":
        return Star;
      case "payment":
        return DollarSign;
      case "formula":
        return Scissors;
      default:
        return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "text-blue-500 bg-blue-500/10";
      case "message":
        return "text-green-500 bg-green-500/10";
      case "review":
        return "text-yellow-500 bg-yellow-500/10";
      case "payment":
        return "text-purple-500 bg-purple-500/10";
      case "formula":
        return "text-pink-500 bg-pink-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-500";
      case "confirmed":
        return "bg-green-500/10 text-green-500";
      case "completed":
        return "bg-gray-500/10 text-gray-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="animate-fade-in brutal-card bg-red-400">
        <CardHeader>
          <CardTitle className="font-display text-foreground text-base lg:text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 text-center py-6 lg:py-8 font-medium text-sm">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in brutal-card bg-red-400">
      <CardHeader>
        <CardTitle className="font-display text-foreground text-base lg:text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 lg:space-y-3">
          {displayActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg border-2 border-foreground bg-card hover:bg-card/90 transition-all cursor-pointer animate-fade-in shadow-[2px_2px_0px_0px_hsl(var(--foreground))] lg:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--primary))] hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  if (activity.type === "appointment") navigate("/appointments");
                  if (activity.type === "message") navigate("/messages");
                  if (activity.type === "formula") navigate("/formulas");
                }}
              >
                <div className={`p-1.5 lg:p-2 rounded-lg ${colorClass} border-2 border-foreground`}>
                  <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-display font-semibold truncate text-sm lg:text-base">{activity.title}</p>
                      <p className="text-xs lg:text-sm text-foreground/70 truncate">
                        {activity.description}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge variant="secondary" className={`${getStatusColor(activity.status)} text-xs`}>
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">
                    {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Show More/Less button - Mobile only */}
        {activities.length > 3 && (
          <Button
            variant="ghost"
            className="w-full mt-3 md:hidden text-sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Show All ({activities.length - 3} more) <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
