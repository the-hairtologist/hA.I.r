import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface SchedulePrediction {
  suggested_date: string;
  suggested_time: string;
  confidence: number;
  reasoning: string;
  alternative_dates?: Array<{
    date: string;
    time: string;
    confidence: number;
  }>;
}

interface ClientContext {
  clientId: string;
  lastAppointmentDate?: string;
  preferredDays?: string[];
  preferredTimeOfDay?: string;
  serviceHistory?: string[];
}

export function useSchedulePredictor() {
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<SchedulePrediction | null>(null);

  const predictNextAppointment = async (context: ClientContext) => {
    setPredicting(true);

    try {
      logger.info('Predicting appointment schedule', 'SchedulePredictor', {
        clientId: context.clientId,
      });

      const { data, error } = await supabase.functions.invoke(
        'ai-schedule-predictor',
        {
          body: context,
        }
      );

      if (error) throw error;

      if (data) {
        setPrediction(data);
        logger.info('Schedule prediction complete', 'SchedulePredictor', {
          confidence: data.confidence,
        });
        return data;
      }

      return null;
    } catch (error) {
      logger.error(
        'Schedule prediction failed',
        'SchedulePredictor',
        error as any
      );
      toast.error('Failed to predict schedule');
      return null;
    } finally {
      setPredicting(false);
    }
  };

  return {
    predicting,
    prediction,
    predictNextAppointment,
  };
}
