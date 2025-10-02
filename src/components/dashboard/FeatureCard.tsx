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

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all hover-scale animate-fade-in border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm relative overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => navigate(route)}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity",
        gradient
      )} />
      <CardHeader className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "p-2.5 rounded-lg bg-gradient-to-br",
            gradient
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">{title}</CardTitle>
        </div>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <Button variant="outline" className="w-full group-hover:border-primary/50">
          Open
        </Button>
      </CardContent>
    </Card>
  );
};
