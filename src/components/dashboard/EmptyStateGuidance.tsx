import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, MessageSquare, Sparkles, ArrowRight } from "lucide-react";

interface EmptyStateGuidanceProps {
  type: "appointments" | "clients" | "messages";
}

export const EmptyStateGuidance = ({ type }: EmptyStateGuidanceProps) => {
  const navigate = useNavigate();

  const configs = {
    appointments: {
      icon: Calendar,
      title: "No appointments yet",
      description: "Get started by adding your first client and scheduling an appointment",
      cta: "Add Your First Client",
      action: () => navigate("/clients"),
      gradient: "from-blue-400 to-cyan-400"
    },
    clients: {
      icon: Users,
      title: "No clients yet",
      description: "Start building your clientele by adding clients or inviting them to connect",
      cta: "Add Your First Client",
      action: () => navigate("/clients"),
      gradient: "from-purple-400 to-pink-400"
    },
    messages: {
      icon: MessageSquare,
      title: "No messages yet",
      description: "Once you connect with clients, your conversations will appear here",
      cta: "View Clients",
      action: () => navigate("/clients"),
      gradient: "from-green-400 to-blue-400"
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card className={`border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br ${config.gradient}`}>
      <CardContent className="py-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-background border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-pixel font-bold text-foreground mb-2">
          {config.title}
        </h3>
        <p className="font-sans text-foreground/80 font-medium mb-6 max-w-md mx-auto">
          {config.description}
        </p>
        <Button 
          onClick={config.action}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {config.cta}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
