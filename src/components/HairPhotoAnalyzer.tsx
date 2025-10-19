/**
 * Hair Photo Analyzer Component
 * Uses AI visual analysis to assess hair condition from photos
 */

import { useState } from 'react';
import { useVisualAnalysis } from '@/hooks/useVisualAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HairPhotoAnalyzerProps {
  clientId: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export const HairPhotoAnalyzer = ({ clientId, onAnalysisComplete }: HairPhotoAnalyzerProps) => {
  const { analyzing, analysis, analyzeHairPhoto } = useVisualAnalysis();
  const [photoUrl, setPhotoUrl] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = async () => {
    if (!photoUrl.trim()) {
      return;
    }

    const result = await analyzeHairPhoto(photoUrl, clientId, additionalContext || undefined);

    if (result) {
      setShowResults(true);
      onAnalysisComplete?.(result);
    }
  };

  const getDamageLevelColor = (level: string) => {
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

  const getPorosityColor = (porosity: string) => {
    switch (porosity) {
      case 'low':
        return 'text-blue-600';
      case 'normal':
        return 'text-green-600';
      case 'high':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          AI Hair Photo Analysis
        </CardTitle>
        <CardDescription>
          Upload a photo for AI-powered hair condition analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo URL Input */}
        <div className="space-y-2">
          <Label htmlFor="photo-url">Photo URL</Label>
          <Input
            id="photo-url"
            type="url"
            placeholder="https://example.com/hair-photo.jpg"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>

        {/* Additional Context */}
        <div className="space-y-2">
          <Label htmlFor="context">Additional Context (Optional)</Label>
          <Input
            id="context"
            placeholder="e.g., After color treatment, before consultation..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={analyzing || !photoUrl.trim()}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing photo...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Hair Condition
            </>
          )}
        </Button>

        {/* Analysis Results */}
        {showResults && analysis && (
          <div className="space-y-4 pt-4 border-t">
            {/* Overall Condition Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Hair Condition Score</Label>
                <Badge variant="outline">{analysis.condition_score}/100</Badge>
              </div>
              <Progress value={analysis.condition_score} className="h-2" />
            </div>

            {/* Damage Level */}
            <div className="flex items-center justify-between">
              <Label>Damage Level</Label>
              <Badge variant={getDamageLevelColor(analysis.damage_level)}>
                {analysis.damage_level}
              </Badge>
            </div>

            {/* Color Fade */}
            {analysis.color_fade_percentage !== undefined && (
              <div className="flex items-center justify-between">
                <Label>Color Fade</Label>
                <span className="text-sm font-medium">{analysis.color_fade_percentage}%</span>
              </div>
            )}

            {/* Texture & Porosity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Texture</Label>
                <p className="font-medium capitalize">{analysis.texture}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Porosity</Label>
                <p className={`font-medium capitalize ${getPorosityColor(analysis.porosity)}`}>
                  {analysis.porosity}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="space-y-3">
                <Label>Recommendations</Label>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec: any, idx: number) => (
                    <Alert key={`${rec.category}-${rec.priority}-${idx}`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {rec.category}
                            </Badge>
                            <Badge
                              variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {rec.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm mt-1">{rec.recommendation}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
