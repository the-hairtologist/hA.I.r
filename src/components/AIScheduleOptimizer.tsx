/**
 * AI Schedule Optimizer Component
 * Suggests optimal appointment times using AI prediction
 */

import { useState } from 'react';
import { useSchedulePredictor } from '@/hooks/useSchedulePredictor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AIScheduleOptimizerProps {
  clientId: string;
  lastAppointmentDate?: string;
  preferredDays?: string[];
  preferredTimeOfDay?: string;
  serviceHistory?: string[];
  onSuggestionSelect?: (date: string, time: string) => void;
}

export const AIScheduleOptimizer = ({
  clientId,
  lastAppointmentDate,
  preferredDays,
  preferredTimeOfDay,
  serviceHistory,
  onSuggestionSelect,
}: AIScheduleOptimizerProps) => {
  const { predicting, prediction, predictNextAppointment } = useSchedulePredictor();
  const [showPredictions, setShowPredictions] = useState(false);

  const handlePredict = async () => {
    const result = await predictNextAppointment({
      clientId,
      lastAppointmentDate,
      preferredDays,
      preferredTimeOfDay,
      serviceHistory,
    });

    if (result) {
      setShowPredictions(true);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Schedule Optimizer
          </CardTitle>
          <CardDescription>
            Get AI-powered suggestions for optimal appointment timing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handlePredict}
            disabled={predicting || !clientId}
            className="w-full"
          >
            {predicting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing schedule patterns...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Optimal Schedule
              </>
            )}
          </Button>

          {showPredictions && prediction && (
            <div className="space-y-4 pt-4 border-t">
              {/* Primary Suggestion */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Recommended Time</span>
                    <Badge variant={getConfidenceColor(prediction.confidence)}>
                      {Math.round(prediction.confidence * 100)}% confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(parseISO(prediction.suggested_date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{prediction.suggested_time}</span>
                  </div>
                  {prediction.reasoning && (
                    <p className="text-sm text-muted-foreground mt-2">{prediction.reasoning}</p>
                  )}
                  {onSuggestionSelect && (
                    <Button
                      onClick={() =>
                        onSuggestionSelect(prediction.suggested_date, prediction.suggested_time)
                      }
                      className="w-full mt-2"
                    >
                      Use This Time
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Alternative Suggestions */}
              {prediction.alternative_dates && prediction.alternative_dates.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Alternative Times</h4>
                  <div className="space-y-2">
                    {prediction.alternative_dates.map((alt, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-3 w-3" />
                                {format(parseISO(alt.date), 'MMM d, yyyy')} at {alt.time}
                              </div>
                              <Badge
                                variant={getConfidenceColor(alt.confidence)}
                                className="text-xs"
                              >
                                {Math.round(alt.confidence * 100)}% match
                              </Badge>
                            </div>
                            {onSuggestionSelect && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onSuggestionSelect(alt.date, alt.time)}
                              >
                                Select
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
