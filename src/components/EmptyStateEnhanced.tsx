/**
 * Enhanced Empty States
 * Actionable empty states that guide users to their next step
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionButton {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "secondary";
  icon?: LucideIcon;
}

interface EmptyStateEnhancedProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  illustrationUrl?: string;
  tips?: string[];
}

export function EmptyStateEnhanced({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  illustrationUrl,
  tips,
}: EmptyStateEnhancedProps) {
  const navigate = useNavigate();

  const handleActionClick = (action: ActionButton) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <Card className="p-8 md:p-12">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Icon or Illustration */}
        {illustrationUrl ? (
          <img
            src={illustrationUrl}
            alt={title}
            className="h-48 w-auto mx-auto opacity-80"
          />
        ) : (
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Icon className="h-10 w-10 text-primary" />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
          <p className="text-muted-foreground text-lg">{description}</p>
        </div>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            {primaryAction && (
              <Button
                onClick={() => handleActionClick(primaryAction)}
                variant={primaryAction.variant || "default"}
                size="lg"
                className="gap-2 min-w-[200px]"
              >
                {primaryAction.icon && <primaryAction.icon className="h-5 w-5" />}
                {primaryAction.label}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={() => handleActionClick(secondaryAction)}
                variant={secondaryAction.variant || "outline"}
                size="lg"
                className="gap-2 min-w-[200px]"
              >
                {secondaryAction.icon && <secondaryAction.icon className="h-5 w-5" />}
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}

        {/* Tips */}
        {tips && tips.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm font-semibold text-muted-foreground mb-4">
              💡 Quick Tips to Get Started:
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-primary font-bold min-w-[20px]">{index + 1}.</span>
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Pre-configured empty states for common scenarios
export const EmptyStates = {
  NoClients: {
    title: "No Clients Yet",
    description: "Start building your clientele by adding your first client or sending invitations",
    tips: [
      "Add clients manually with their contact information",
      "Send invitation links via email or SMS",
      "Import clients from your existing contacts",
    ],
  },
  NoAppointments: {
    title: "No Appointments Scheduled",
    description: "Your schedule is clear! Time to book some appointments and grow your business",
    tips: [
      "Share your booking link with clients",
      "Reach out to past clients for rebooking",
      "Enable online booking to let clients self-schedule",
    ],
  },
  NoReviews: {
    title: "No Reviews Yet",
    description: "Start collecting reviews to build trust and attract new clients",
    tips: [
      "Send review requests after completed appointments",
      "Make it easy with direct links to review forms",
      "Follow up with satisfied clients personally",
    ],
  },
  NoFormulas: {
    title: "No Formulas Created",
    description: "Document your custom color formulas to ensure consistent, beautiful results",
    tips: [
      "Start with your most-used color combinations",
      "Take photos to track results over time",
      "Add detailed notes for reference",
    ],
  },
  NoServices: {
    title: "No Services Added",
    description: "Define your services and pricing to start accepting bookings",
    tips: [
      "List all services you offer (cuts, color, treatments)",
      "Set competitive prices based on your market",
      "Include service duration for accurate scheduling",
    ],
  },
};
