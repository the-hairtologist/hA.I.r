import { Badge } from "@/components/ui/badge";
import { CheckCircle, Award, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  type: "verified" | "top-rated" | "experienced" | "responsive";
  className?: string;
}

export const TrustBadge = ({ type, className }: TrustBadgeProps) => {
  const badges = {
    verified: {
      icon: CheckCircle,
      text: "Verified",
      color: "bg-success/10 text-success border-success",
    },
    "top-rated": {
      icon: Star,
      text: "Top Rated",
      color: "bg-warning/10 text-warning border-warning",
    },
    experienced: {
      icon: Award,
      text: "Experienced",
      color: "bg-info/10 text-info border-info",
    },
    responsive: {
      icon: Shield,
      text: "Quick Responder",
      color: "bg-accent/10 text-accent border-accent",
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "gap-1 border-2 shadow-sm",
        badge.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {badge.text}
    </Badge>
  );
};