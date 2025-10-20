import { useEffect, useState } from "react";
import { Users, Calendar, Scissors } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "signup" | "booking" | "service";
  message: string;
  time: string;
}

const mockActivities: Activity[] = [
  { id: "1", type: "signup", message: "Sarah from Miami just joined", time: "2m ago" },
  { id: "2", type: "booking", message: "Alex booked a consultation", time: "5m ago" },
  { id: "3", type: "service", message: "Jamie completed a color service", time: "8m ago" },
  { id: "4", type: "signup", message: "Chris from Austin just joined", time: "12m ago" },
];

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Simulate live feed
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockActivities.length) {
        setActivities(prev => [mockActivities[index], ...prev].slice(0, 3));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!visible || activities.length === 0) return null;

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "signup": return Users;
      case "booking": return Calendar;
      case "service": return Scissors;
    }
  };

  return (
    <Card className="brutal-border brutal-shadow-sm bg-secondary/10">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2">
          {activities.map((activity, idx) => {
            const Icon = getIcon(activity.type);
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-center gap-2 text-xs sm:text-sm animate-slide-in-right p-2 rounded bg-background/50",
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="flex-1 truncate">{activity.message}</span>
                <span className="text-muted-foreground flex-shrink-0">{activity.time}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
