import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertCircle } from 'lucide-react';

interface HairHealthScoreProps {
  conditionScore: number;
  damageLevel: 'minimal' | 'moderate' | 'severe';
  texture: 'fine' | 'medium' | 'coarse';
  porosity: 'low' | 'normal' | 'high';
  colorFadePercentage?: number;
  recommendations?: Array<{
    category: string;
    recommendation: string;
    priority: string;
  }>;
}

export function HairHealthScore({
  conditionScore,
  damageLevel,
  texture,
  porosity,
  colorFadePercentage,
  recommendations = [],
}: HairHealthScoreProps) {
  const healthScore = conditionScore * 10; // Convert 1-10 to 10-100

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDamageBadgeVariant = (level: string) => {
    switch (level) {
      case 'minimal':
        return 'default';
      case 'moderate':
        return 'secondary';
      case 'severe':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Hair Health Analysis
        </h3>
        <span className={`text-3xl font-bold ${getScoreColor(healthScore)}`}>
          {healthScore}/100
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Health</span>
            <span className="font-medium">{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Damage Level</p>
            <Badge variant={getDamageBadgeVariant(damageLevel)}>
              {damageLevel}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Texture</p>
            <Badge variant="outline">{texture}</Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Porosity</p>
            <Badge variant="outline">{porosity}</Badge>
          </div>

          {colorFadePercentage !== undefined && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Color Fade</p>
              <Badge variant="outline">{colorFadePercentage}%</Badge>
            </div>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Recommendations
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{rec.category}</span>
                  <Badge variant="outline" className="text-xs">
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{rec.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
