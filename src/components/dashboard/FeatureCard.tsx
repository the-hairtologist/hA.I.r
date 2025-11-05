import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  gradient = 'from-primary to-secondary',
  index = 0,
}: FeatureCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <Card
      className="group relative transition-all animate-fade-in brutal-border bg-card overflow-hidden brutal-shadow-xs hover:shadow-brutal-2xl hover:-translate-y-2 hover:scale-[1.02] active:brutal-shadow-sm active:translate-y-0 active:scale-100"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-15 group-hover:opacity-20 transition-opacity',
          gradient
        )}
      />
      <CardHeader className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={cn(
              'p-3 rounded-lg bg-gradient-to-br brutal-border brutal-shadow-xs group-hover:brutal-shadow-sm transition-shadow',
              gradient
            )}
          >
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-pixel group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <Button
          variant="outline"
          className="w-full font-bold uppercase tracking-wide brutal-border brutal-shadow-xs hover:brutal-shadow-sm hover:-translate-y-0.5 transition-all group-hover:border-primary group-hover:text-primary"
          onClick={handleClick}
        >
          Open →
        </Button>
      </CardContent>
    </Card>
  );
};
