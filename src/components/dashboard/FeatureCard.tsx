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
      className="group transition-all animate-fade-in border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 relative overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-20",
        gradient
      )} />
      <CardHeader className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "p-3 rounded-lg bg-gradient-to-br border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
            gradient
          )}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">{title}</CardTitle>
        </div>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <Button 
          variant="outline" 
          className="w-full font-display"
          onClick={handleClick}
        >
          Open →
        </Button>
      </CardContent>
    </Card>
  );
};
