import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Palette, Info } from 'lucide-react';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';
import { cn } from '@/lib/utils';

interface AIFormulaQuickStartProps {
  onSelectTemplate: (prompt: string) => void;
}

export const AIFormulaQuickStart = ({
  onSelectTemplate,
}: AIFormulaQuickStartProps) => {
  const templates = [
    {
      icon: Sparkles,
      title: 'Quick Formula',
      description: 'Fast color formula',
      prompt:
        'I need a formula for warm blonde balayage on level 5 natural hair with medium texture. Budget is moderate, time available is 2 hours.',
      color: 'from-amber-500 to-yellow-500',
    },
    {
      icon: Zap,
      title: 'Color Correction',
      description: 'Fix brassy tones',
      prompt:
        'Client has brassy orange tones from previous lightening. Hair is level 7-8, porous ends, needs to be cooled down to natural-looking blonde. Multi-session okay if needed for hair health.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Palette,
      title: 'Custom Color',
      description: 'Detailed formula',
      prompt:
        'Create a custom ash brown formula for covering 50% gray on level 6 hair. Client is sensitive to ammonia and prefers low-damage options. Processing time should be under 45 minutes.',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className={cn(mobileFirst.text.lg, "flex items-center gap-2")}>
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Start Templates
          </CardTitle>
          <CardDescription className="space-y-1">
            <div>Click a template to get professional formulas instantly</div>
            <Badge
              variant="outline"
              className="text-xs border-primary/30 bg-primary/5 mt-2"
            >
              <Info className="h-3 w-3 mr-1" />
              AI-generated • Always verify with strand tests
            </Badge>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {templates.map((template, idx) => {
            const Icon = template.icon;
            return (
              <Button
                key={idx}
                variant="outline"
                className={cn(
                  mobileFirst.touchTarget.comfortable,
                  "flex flex-col items-start gap-3 p-4 sm:p-6",
                  "hover:border-primary/50 hover:scale-[1.02] transition-all",
                  "active:scale-95"
                )}
                onClick={() => onSelectTemplate(template.prompt)}
              >
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${template.color} text-primary-foreground`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-left space-y-1">
                  <div className={cn(mobileFirst.text.base, "font-semibold")}>
                    {template.title}
                  </div>
                  <div className={cn(mobileFirst.text.xs, "text-muted-foreground")}>
                    {template.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
