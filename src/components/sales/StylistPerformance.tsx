import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StylistPerformance() {
  const stylists = [
    { name: "You", bookings: 45, revenue: 6750, rating: 4.9, growth: "+15%" },
  ];

  return (
    <Card className="brutal-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Individual stylist performance and comparisons
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stylists.map((stylist, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg border-2 border-border"
            >
              <div>
                <h3 className="font-semibold mb-1">{stylist.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{stylist.bookings} bookings</span>
                  <span className="font-semibold text-foreground">${stylist.revenue}</span>
                  <Badge variant="secondary">⭐ {stylist.rating}</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${stylist.growth.startsWith("+") ? "text-success" : "text-destructive"}`}>
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  {stylist.growth}
                </div>
                <div className="text-xs text-muted-foreground">vs last period</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
