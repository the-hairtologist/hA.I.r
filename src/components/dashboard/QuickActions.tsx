import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Scissors, MessageSquare, Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  userRole: string;
}

interface ActionButton {
  label: string;
  icon: any;
  route: string;
  variant: "default" | "secondary" | "outline";
  description?: string;
  featured?: boolean;
}

export const QuickActions = ({ userRole }: QuickActionsProps) => {
  const navigate = useNavigate();

  console.log('🎯 QuickActions rendering for role:', userRole);

  const stylistActions: ActionButton[] = [
    {
      label: "🌟 Ask AI Assistant",
      description: "Get instant hair color advice",
      icon: Sparkles,
      route: "/ai-assistant",
      variant: "default" as const,
      featured: true,
    },
    {
      label: "Generate Formula",
      icon: Scissors,
      route: "/formulas",
      variant: "secondary" as const,
    },
    {
      label: "Today's Schedule",
      icon: Calendar,
      route: "/appointments",
      variant: "outline" as const,
    },
    {
      label: "Messages",
      icon: MessageSquare,
      route: "/messages",
      variant: "outline" as const,
    },
  ];

  const clientActions: ActionButton[] = [
    {
      label: "Book My Next Visit",
      icon: Calendar,
      route: "/book-appointment",
      variant: "default" as const,
    },
    {
      label: "Discover Stylists",
      icon: Users,
      route: "/stylists",
      variant: "secondary" as const,
    },
    {
      label: "Chat with Stylist",
      icon: MessageSquare,
      route: "/messages",
      variant: "outline" as const,
    },
  ];

  const actions = userRole === "stylist" ? stylistActions : clientActions;

  return (
    <Card className="mb-8 animate-fade-in shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const isFeatured = 'featured' in action && action.featured;
            
            return (
              <Button
                key={action.label}
                variant={action.variant}
                size="lg"
                onClick={() => navigate(action.route)}
                className={`
                  hover-scale h-auto flex flex-col items-start gap-2 p-4
                  ${isFeatured ? 'ring-2 ring-primary ring-offset-2 shadow-xl' : ''}
                `}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-5 w-5 ${isFeatured ? 'animate-pulse' : ''}`} />
                  <span className="font-semibold">{action.label}</span>
                </div>
                {'description' in action && action.description && (
                  <span className="text-xs opacity-90 text-left">
                    {action.description}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
