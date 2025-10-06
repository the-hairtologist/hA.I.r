import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  gradient?: string;
  index?: number;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  route,
  gradient = "from-primary to-secondary",
  index = 0,
}: FeatureCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <Card
      className="group transition-all animate-fade-in brutal-card relative overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-20",
        gradient
      )} />
      <CardHeader className="relative pb-3 lg:pb-4">
        <div className="flex items-center gap-2.5 lg:gap-3 mb-1.5 lg:mb-2">
          <div className={cn(
            "p-2 lg:p-3 rounded-lg bg-gradient-to-br border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
            gradient
          )}>
            <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-base lg:text-xl font-display group-hover:text-primary transition-colors leading-tight">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="text-sm lg:text-base leading-snug lg:leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative pt-0">
        <Button 
          variant="outline" 
          className="w-full font-display text-sm lg:text-base"
          onClick={handleClick}
        >
          Open →
        </Button>
      </CardContent>
    </Card>
  );
};
