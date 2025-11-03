import { Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

interface UpsellSuggestion {
  service: string;
  addon: string;
  incomeBoost: number;
  reasoning: string;
}

interface SmartUpsellProps {
  currentService: string;
  clientId?: string;
  stylistId?: string;
  onAddUpsell?: (addon: string) => void;
  className?: string;
}

interface AISuggestion {
  addon: string;
  reasoning: string;
  incomeBoost: number;
  confidence: number;
  fallback?: boolean;
}

const upsellMap: Record<string, UpsellSuggestion> = {
  Haircut: {
    service: 'Haircut',
    addon: 'Color Consultation',
    incomeBoost: 20,
    reasoning: 'Clients love a fresh color with their new cut',
  },
  Color: {
    service: 'Color',
    addon: 'Deep Conditioning Treatment',
    incomeBoost: 15,
    reasoning: 'Protect color investment with premium conditioning',
  },
  Highlights: {
    service: 'Highlights',
    addon: 'Toner + Gloss',
    incomeBoost: 25,
    reasoning: 'Enhance dimension and add stunning shine',
  },
  Blowout: {
    service: 'Blowout',
    addon: 'Hair Treatment',
    incomeBoost: 30,
    reasoning: 'Make the style last longer with professional treatment',
  },
};

export const SmartUpsell = ({
  currentService,
  clientId,
  stylistId,
  onAddUpsell,
  className,
}: SmartUpsellProps) => {
  const { user } = useAuth();
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAISuggestion();
  }, [currentService, clientId, stylistId]);

  const loadAISuggestion = async () => {
    setLoading(true);
    try {
      // Gather context data
      let clientHistory: string[] = [];
      let clientProfile: any = null;
      let availableServices: string[] = [];

      if (clientId) {
        const { data: appointments } = await supabase
          .from('appointments')
          .select('service_type')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(10);

        clientHistory = appointments?.map(a => a.service_type) || [];

        const { data: profile } = await supabase
          .from('client_profiles')
          .select('hair_type, hair_concerns, hair_goals')
          .eq('id', clientId)
          .maybeSingle();

        clientProfile = profile;
      }

      if (stylistId) {
        const { data: services } = await supabase
          .from('stylist_services')
          .select('service_name')
          .eq('stylist_id', stylistId)
          .limit(20);

        availableServices = services?.map(s => s.service_name) || [];
      }

      const { data, error } = await supabase.functions.invoke(
        'ai-smart-upsell',
        {
          body: {
            currentService,
            clientHistory,
            clientProfile,
            availableServices,
          },
        }
      );

      if (error) throw error;

      logger.debug('AI Upsell Suggestion:', data);
      setAiSuggestion(data);
    } catch (error) {
      logger.error('Error loading AI suggestion', 'SmartUpsell', error);
      // Fallback to static suggestion
      const fallbackSuggestion = upsellMap[currentService];
      if (fallbackSuggestion) {
        setAiSuggestion({
          addon: fallbackSuggestion.addon,
          reasoning: fallbackSuggestion.reasoning,
          incomeBoost: fallbackSuggestion.incomeBoost,
          confidence: 50,
          fallback: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    haptic.tap();
    if (aiSuggestion) {
      onAddUpsell?.(aiSuggestion.addon);
    }
  };

  if (loading) {
    return (
      <Card
        className={cn(
          'brutal-border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5',
          className
        )}
      >
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Getting smart suggestions...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!aiSuggestion) return null;

  return (
    <Card
      className={cn(
        'brutal-border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5',
        'animate-fade-in',
        aiSuggestion.fallback && 'border-warning/30',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 mt-0.5">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <p className="text-xs font-semibold text-primary">
                {aiSuggestion.fallback ? 'Smart' : 'AI-Powered'} Upsell
                Suggestion
              </p>
              {aiSuggestion.confidence >= 75 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">
                  High Match
                </span>
              )}
            </div>

            <p className="text-sm font-medium">
              Add{' '}
              <span className="gradient-text font-bold">
                {aiSuggestion.addon}
              </span>
            </p>

            <p className="text-xs text-muted-foreground">
              {aiSuggestion.reasoning}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-success">
                  +{aiSuggestion.incomeBoost}%
                </span>
                <span className="text-xs text-muted-foreground">
                  income boost
                </span>
              </div>

              <Button
                size="sm"
                variant="default"
                onClick={handleAdd}
                className="h-7 text-xs gap-1 brutal-shadow-xs brutal-hover"
              >
                <Sparkles className="h-3 w-3" />
                Add Service
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
