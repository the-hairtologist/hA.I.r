import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ServicePopularity() {
  const services = [
    { name: "Full Color", bookings: 45, revenue: 6750, trend: "+12%" },
    { name: "Balayage", bookings: 38, revenue: 6080, trend: "+8%" },
    { name: "Cut & Style", bookings: 52, revenue: 3120, trend: "+15%" },
    { name: "Highlights", bookings: 28, revenue: 3360, trend: "-5%" },
  ];

  const maxBookings = Math.max(...services.map(s => s.bookings));

  return (
    <Card className="brutal-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Service Popularity
        </CardTitle>
        <CardDescription>
          Most requested services and revenue contribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{service.name}</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{service.bookings} bookings</span>
                  <span className="font-semibold text-foreground">${service.revenue}</span>
                  <span className={service.trend.startsWith("+") ? "text-success" : "text-destructive"}>
                    {service.trend}
                  </span>
                </div>
              </div>
              <Progress value={(service.bookings / maxBookings) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
