import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VideoAnalysis {
  texture: string;
  movement: string;
  condition: string;
  damage_level: 'minimal' | 'moderate' | 'severe';
  recommendations: string[];
  detailed_notes?: string;
}

interface VideoInsightsProps {
  analysis: VideoAnalysis;
}

export const VideoInsights = ({ analysis }: VideoInsightsProps) => {
  const getDamageLevelColor = (level: string) => {
    switch (level) {
      case 'minimal':
        return 'bg-success/10 text-success';
      case 'moderate':
        return 'bg-warning/10 text-warning';
      case 'severe':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getDamageLevelIcon = (level: string) => {
    switch (level) {
      case 'minimal':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'moderate':
      case 'severe':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Video Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Hair Texture</p>
            <Badge variant="secondary" className="capitalize">
              {analysis.texture}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Damage Level</p>
            <Badge className={getDamageLevelColor(analysis.damage_level)}>
              <span className="flex items-center gap-1">
                {getDamageLevelIcon(analysis.damage_level)}
                <span className="capitalize">{analysis.damage_level}</span>
              </span>
            </Badge>
          </div>
        </div>

        {/* Movement & Condition */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Movement</p>
            <p className="text-sm text-muted-foreground">{analysis.movement}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Overall Condition</p>
            <p className="text-sm text-muted-foreground">
              {analysis.condition}
            </p>
          </div>
        </div>

        {/* Detailed Notes */}
        {analysis.detailed_notes && (
          <div>
            <p className="text-sm font-medium mb-1">Detailed Assessment</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.detailed_notes}
            </p>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Recommendations</p>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
