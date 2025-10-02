import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  isPrimary?: boolean;
  index?: number;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  route,
  isPrimary = false,
  index = 0,
}: FeatureCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all hover-scale animate-fade-in ${
        isPrimary ? "border-primary/50 bg-primary/5" : ""
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => navigate(route)}
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${isPrimary ? "bg-primary text-primary-foreground" : "bg-primary/10"}`}>
            <Icon className={`h-6 w-6 ${isPrimary ? "" : "text-primary"}`} />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant={isPrimary ? "default" : "outline"} className="w-full">
          Open
        </Button>
      </CardContent>
    </Card>
  );
};
