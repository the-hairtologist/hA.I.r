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
        
        // ✨ ENHANCEMENT: Multi-factor prediction with smarter confidence scoring
        const dueThreshold = avgInterval * 0.9; // 90% of average interval
        const isDue = daysSince >= dueThreshold;

        // Calculate confidence based on multiple factors
        const consistencyScore = calculateConsistency(intervals);
        const recencyScore = calculateRecencyScore(daysSince, avgInterval);
        const frequencyScore = clientApts.length >= 5 ? 1.0 : clientApts.length / 5;
        
        // Weighted confidence calculation
        const confidenceScore = (
          consistencyScore * 0.4 + 
          recencyScore * 0.3 + 
          frequencyScore * 0.3
        );

        const confidence: "high" | "medium" | "low" = 
          confidenceScore >= 0.75 ? "high" :
          confidenceScore >= 0.5 ? "medium" : "low";

        // ✨ ENHANCEMENT: Smarter date suggestion based on day-of-week preferences
        const preferredDays = detectPreferredDays(clientApts);
        const smartSuggestedDate = findNextPreferredDay(preferredDays, avgInterval);

        if (isDue) {
          insights.push({
            clientId,
            clientName: clientApts[0].client?.user?.full_name || 'Unknown',
            dueForVisit: true,
            daysSinceLastVisit: daysSince,
            suggestedDate: smartSuggestedDate,
            confidence
          });
        }
      });

      // ✨ ENHANCEMENT: Helper functions for smarter predictions
      const calculateConsistency = (intervals: number[]): number => {
        if (intervals.length < 2) return 0.5;
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        // Lower standard deviation = higher consistency
        return Math.max(0, 1 - (stdDev / avg));
      };

      const calculateRecencyScore = (daysSince: number, avgInterval: number): number => {
        const ratio = daysSince / avgInterval;
        // Score highest when just past due date
        if (ratio >= 0.9 && ratio <= 1.2) return 1.0;
        if (ratio >= 0.8 && ratio <= 1.4) return 0.7;
        return 0.4;
      };

      const detectPreferredDays = (appointments: any[]): number[] => {
        const dayCount: Record<number, number> = {};
        appointments.forEach(apt => {
          const day = new Date(apt.appointment_date).getDay();
          dayCount[day] = (dayCount[day] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(dayCount));
        return Object.keys(dayCount)
          .filter(day => dayCount[parseInt(day)] >= maxCount * 0.7)
          .map(d => parseInt(d));
      };

      const findNextPreferredDay = (preferredDays: number[], avgInterval: number): Date => {
        if (preferredDays.length === 0) {
          return addDays(new Date(), Math.round(avgInterval));
        }

        let targetDate = addDays(new Date(), Math.round(avgInterval));
        const targetDay = targetDate.getDay();
        
        if (preferredDays.includes(targetDay)) {
          return targetDate;
        }

        // Find next preferred day within 3 days
        for (let i = 1; i <= 3; i++) {
          const nextDate = addDays(targetDate, i);
          if (preferredDays.includes(nextDate.getDay())) {
            return nextDate;
          }
        }

        return targetDate; // Fallback to calculated date
      };

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