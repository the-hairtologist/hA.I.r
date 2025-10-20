import { Badge } from "@/components/ui/badge";
import { Crown, Scissors, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RoleVisibilityBadgeProps {
  roles: ("admin" | "stylist" | "client")[];
  size?: "sm" | "md";
  showTooltip?: boolean;
}

export const RoleVisibilityBadge = ({ 
  roles, 
  size = "sm",
  showTooltip = true 
}: RoleVisibilityBadgeProps) => {
  const roleConfig = {
    admin: {
      label: "Admin",
      icon: Crown,
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      emoji: "🛡️"
    },
    stylist: {
      label: "Stylist",
      icon: Scissors,
      color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      emoji: "✂️"
    },
    client: {
      label: "Client",
      icon: User,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      emoji: "👤"
    }
  };

  const badgeContent = (
    <div className="flex items-center gap-1">
      {roles.map((role, index) => {
        const config = roleConfig[role];
        const Icon = config.icon;
        return (
          <Badge 
            key={role}
            variant="outline" 
            className={`${config.color} text-[10px] px-1.5 py-0.5 font-bold uppercase ${
              size === "md" ? "text-xs px-2 py-1" : ""
            }`}
          >
            {size === "md" && <Icon className="h-3 w-3 mr-1" />}
            {config.emoji}
          </Badge>
        );
      })}
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-card border-2 border-foreground/10">
          <div className="space-y-1">
            <p className="font-bold text-xs">Visible to:</p>
            <div className="flex flex-col gap-0.5">
              {roles.map(role => {
                const config = roleConfig[role];
                return (
                  <div key={role} className="flex items-center gap-1.5 text-xs">
                    {config.emoji} {config.label}
                  </div>
                );
              })}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
