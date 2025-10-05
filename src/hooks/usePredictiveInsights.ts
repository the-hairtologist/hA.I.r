import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, addDays } from "date-fns";

interface ClientInsight {
  clientId: string;
  clientName: string;
  dueForVisit: boolean;
  daysSinceLastVisit: number;
  suggestedDate: Date;
  confidence: "high" | "medium" | "low";
}

export const usePredictiveInsights = (stylistId?: string) => {
  const [clientInsights, setClientInsights] = useState<ClientInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stylistId) {
      analyzeClientPatterns();
    }
  }, [stylistId]);

  const analyzeClientPatterns = async () => {
    if (!stylistId) return;
    
    setLoading(true);
    try {
      // Get all appointments for this stylist
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:client_profiles(
            id,
            user:profiles(full_name)
          )
        `)
        .eq('stylist_id', stylistId)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      // Analyze patterns per client
      const clientMap = new Map<string, any[]>();
      
      appointments?.forEach(apt => {
        const clientId = apt.client_id;
        if (!clientMap.has(clientId)) {
          clientMap.set(clientId, []);
        }
        clientMap.get(clientId)!.push(apt);
      });

      const insights: ClientInsight[] = [];

      clientMap.forEach((clientApts, clientId) => {
        if (clientApts.length < 2) return; // Need at least 2 appointments to predict

        // Sort by date
        clientApts.sort((a, b) => 
          new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
        );

        // Calculate average days between appointments
        const intervals: number[] = [];
        for (let i = 0; i < clientApts.length - 1; i++) {
          const diff = differenceInDays(
            new Date(clientApts[i].appointment_date),
            new Date(clientApts[i + 1].appointment_date)
          );
          intervals.push(diff);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const lastVisit = new Date(clientApts[0].appointment_date);
        const daysSince = differenceInDays(new Date(), lastVisit);
        
        // Predict if due for visit
        const dueThreshold = avgInterval * 0.9; // 90% of average interval
        const isDue = daysSince >= dueThreshold;

        if (isDue) {
          insights.push({
            clientId,
            clientName: clientApts[0].client?.user?.full_name || 'Unknown',
            dueForVisit: true,
            daysSinceLastVisit: daysSince,
            suggestedDate: addDays(new Date(), 7), // Suggest a week from now
            confidence: intervals.length >= 3 ? "high" : intervals.length >= 2 ? "medium" : "low"
          });
        }
      });

      // Sort by confidence and days since last visit
      insights.sort((a, b) => {
        if (a.confidence !== b.confidence) {
          const confOrder = { high: 3, medium: 2, low: 1 };
          return confOrder[b.confidence] - confOrder[a.confidence];
        }
        return b.daysSinceLastVisit - a.daysSinceLastVisit;
      });

      setClientInsights(insights.slice(0, 5)); // Top 5 insights
    } catch (error) {
      console.error('Error analyzing client patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  return { clientInsights, loading, refresh: analyzeClientPatterns };
};