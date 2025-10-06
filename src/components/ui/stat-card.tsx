import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "brutal" | "glass" | "elevated" | "gradient";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
  gradient?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, icon: Icon, variant = "brutal", trend, trendValue, delay = 0, gradient }, ref) => {
    return (
      <Card
        ref={ref}
        variant={variant === "gradient" ? "brutal" : variant}
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_hsl(var(--primary))]",
          variant === "glass" && "hover:bg-background/90",
          gradient && `bg-gradient-to-br ${gradient}`
        )}
        style={{ animationDelay: `${delay}ms` }}
      >
        {variant === "gradient" && (
          <div className="absolute inset-0 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity" />
        )}
        
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300",
              "border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
              "group-hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
              "group-hover:-translate-y-0.5",
              variant === "glass" ? "bg-background/80" : "bg-card"
            )}>
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-300",
                "group-hover:scale-110",
                gradient ? "text-primary-foreground" : "text-primary"
              )} />
            </div>
            
            {trend && trendValue && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md",
                trend === "up" && "text-success bg-success/10",
                trend === "down" && "text-destructive bg-destructive/10",
                trend === "neutral" && "text-muted-foreground bg-muted"
              )}>
                <span>{trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}</span>
                {trendValue}
              </div>
            )}
          </div>
          
          <div>
            <p className={cn(
              "text-sm font-display font-semibold mb-1",
              gradient ? "text-primary-foreground/90" : "text-muted-foreground"
            )}>
              {label}
            </p>
            <p className={cn(
              "text-3xl font-display font-bold transition-all duration-300",
              "group-hover:scale-105 origin-left",
              gradient ? "text-primary-foreground" : "text-foreground"
            )}>
              {value}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";
