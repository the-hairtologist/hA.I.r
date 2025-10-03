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
      color: "bg-green-100 text-green-700 border-green-300",
    },
    "top-rated": {
      icon: Star,
      text: "Top Rated",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    experienced: {
      icon: Award,
      text: "Experienced",
      color: "bg-blue-100 text-blue-700 border-blue-300",
    },
    responsive: {
      icon: Shield,
      text: "Quick Responder",
      color: "bg-purple-100 text-purple-700 border-purple-300",
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