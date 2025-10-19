import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Mail, Phone } from "lucide-react";

export function FollowUpTracker() {
  const followUps = [
    {
      client: "Sample Client 1",
      type: "Appointment reminder",
      dueDate: "Today",
      priority: "high",
      status: "pending",
      method: "SMS"
    },
    {
      client: "Sample Client 2",
      type: "Review request",
      dueDate: "Tomorrow",
      priority: "medium",
      status: "pending",
      method: "Email"
    },
    {
      client: "Sample Client 3",
      type: "Birthday message",
      dueDate: "In 3 days",
      priority: "low",
      status: "scheduled",
      method: "Email"
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      default: return "secondary";
    }
  };

  return (
    <Card className="brutal-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Automated Follow-Ups
        </CardTitle>
        <CardDescription>
          Track and manage automated client communications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {followUps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>All caught up! No pending follow-ups.</p>
            </div>
          ) : (
            followUps.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{item.client}</h3>
                    <Badge variant={getPriorityBadge(item.priority) as any}>
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.type}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      {item.method === "Email" ? (
                        <Mail className="h-3 w-3" />
                      ) : (
                        <Phone className="h-3 w-3" />
                      )}
                      {item.method}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Send Now
                  </Button>
                  <Button size="sm" variant="ghost">
                    Skip
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
