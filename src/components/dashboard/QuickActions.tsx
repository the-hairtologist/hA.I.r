import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Scissors, MessageSquare, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  userRole: string;
}

export const QuickActions = ({ userRole }: QuickActionsProps) => {
  const navigate = useNavigate();

  const stylistActions = [
    {
      label: "View Today's Schedule",
      icon: Calendar,
      route: "/appointments",
      variant: "default" as const,
    },
    {
      label: "Create Formula",
      icon: Scissors,
      route: "/formulas",
      variant: "secondary" as const,
    },
    {
      label: "Message Clients",
      icon: MessageSquare,
      route: "/messages",
      variant: "outline" as const,
    },
  ];

  const clientActions = [
    {
      label: "Book Appointment",
      icon: Calendar,
      route: "/book-appointment",
      variant: "default" as const,
    },
    {
      label: "Find Stylists",
      icon: Users,
      route: "/stylists",
      variant: "secondary" as const,
    },
    {
      label: "Message Stylist",
      icon: MessageSquare,
      route: "/messages",
      variant: "outline" as const,
    },
  ];

  const actions = userRole === "stylist" ? stylistActions : clientActions;

  return (
    <Card className="mb-8 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                size="lg"
                onClick={() => navigate(action.route)}
                className="hover-scale"
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
