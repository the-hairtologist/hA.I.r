import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, Calendar, MessageSquare, Scissors } from "lucide-react";
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

  const stylistActions: ActionButton[] = [
    {
      label: "💬 Chat with AI Expert",
      description: "Ask questions & get instant advice",
      icon: Sparkles,
      route: "/ai-assistant",
      variant: "default" as const,
      featured: true,
    },
    {
      label: "📋 Create Client Formula",
      description: "Generate & save detailed formulas",
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
    <Card className="mb-8 animate-fade-in shadow-md border-primary/10">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Jump to your most-used features
        </p>
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
                  h-auto flex flex-col items-start gap-2 p-4 transition-all
                  ${isFeatured ? 'ring-2 ring-primary/50 shadow-lg hover:shadow-xl hover:ring-primary' : 'hover:shadow-md'}
                `}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-5 w-5 ${isFeatured ? 'text-primary' : ''}`} />
                  <span className="font-semibold text-sm">{action.label}</span>
                </div>
                {'description' in action && action.description && (
                  <span className="text-xs opacity-80 text-left leading-snug">
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
