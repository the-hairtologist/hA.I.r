import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Star, DollarSign, Scissors } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

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
      <Card className="animate-fade-in brutal-card">
        <CardHeader>
          <CardTitle className="font-display text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 text-center py-8 font-medium">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in brutal-card">
      <CardHeader className="p-4 sm:p-5 md:p-6 pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-display text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="space-y-3 sm:space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 sm:p-4 rounded-lg brutal-border bg-card hover:bg-card/90 transition-all cursor-pointer animate-fade-in brutal-shadow-xs hover:brutal-shadow-sm hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  if (activity.type === "appointment") navigate("/appointments");
                  if (activity.type === "message") navigate("/messages");
                  if (activity.type === "formula") navigate("/formulas");
                }}
              >
                <div className={`p-2 rounded-lg ${colorClass} brutal-border shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-display font-semibold truncate">{activity.title}</p>
                      <p className="text-[11px] sm:text-xs text-foreground/70 truncate">
                        {activity.description}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge variant="secondary" className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-foreground/60 mt-1">
                    {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
