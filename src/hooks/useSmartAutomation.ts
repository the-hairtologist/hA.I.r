/**
 * ✨ ENHANCEMENT: Smart Automation Hook
 * Makes automation timing and content intelligent based on patterns
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface AutomationTiming {
  clientId: string;
  optimalHour: number; // 0-23
  optimalDay: number; // 0-6 (Sun-Sat)
  timezone: string;
  confidence: number;
}

interface SmartReminder {
  clientId: string;
  clientName: string;
  type: 'rebook' | 'followup' | 'retention';
  suggestedTime: Date;
  message: string;
  urgency: 'low' | 'medium' | 'high';
}

export const useSmartAutomation = (stylistId?: string) => {
  const [timingProfiles, setTimingProfiles] = useState<Record<string, AutomationTiming>>({});
  const [smartReminders, setSmartReminders] = useState<SmartReminder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stylistId) {
      learnClientTimingPatterns();
      generateSmartReminders();
    }
  }, [stylistId]);

  /**
   * ✨ Learn when each client is most likely to engage
   * Based on past message open rates, appointment booking times, etc.
   */
  const learnClientTimingPatterns = async () => {
    if (!stylistId) return;

    setLoading(true);
    try {
      // Get all client appointments to detect timing patterns
      const { data: appointments } = await supabase
        .from('appointments')
        .select('client_id, appointment_date, created_at')
        .eq('stylist_id', stylistId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (!appointments) return;

      // Group by client and analyze booking patterns
      const clientPatterns: Record<string, AutomationTiming> = {};

      const clientGroups = appointments.reduce((acc, apt) => {
        if (!acc[apt.client_id]) acc[apt.client_id] = [];
        acc[apt.client_id].push(apt);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(clientGroups).forEach(([clientId, apts]) => {
        if (apts.length < 2) return; // Need multiple data points

        // Detect preferred booking hour
        const hours = apts.map(a => new Date(a.created_at).getHours());
        const optimalHour = mode(hours);

        // Detect preferred day of week for appointments
        const days = apts.map(a => new Date(a.appointment_date).getDay());
        const optimalDay = mode(days);

        const confidence = Math.min((apts.length / 5) * 100, 100);

        clientPatterns[clientId] = {
          clientId,
          optimalHour,
          optimalDay,
          timezone: 'America/Los_Angeles', // TODO: Detect from client
          confidence
        };
      });

      setTimingProfiles(clientPatterns);
      logger.info('Learned timing patterns', 'SmartAutomation', { 
        clientCount: Object.keys(clientPatterns).length 
      });
    } catch (error) {
      console.error('Error learning timing patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✨ Generate smart reminders with optimal timing
   * Not just "send in 6 weeks" but "send Tuesday at 2pm when they're most likely to book"
   */
  const generateSmartReminders = async () => {
    if (!stylistId) return;

    try {
      const { data: clients } = await supabase
        .from('client_retention_scores')
        .select(`
          *,
          client:client_profiles(
            id,
            user:profiles(full_name)
          )
        `)
        .eq('stylist_id', stylistId)
        .order('churn_probability', { ascending: false })
        .limit(20);

      if (!clients) return;

      const reminders: SmartReminder[] = [];

      clients.forEach(score => {
        const timing = timingProfiles[score.client_id];
        const urgency = score.churn_probability >= 0.7 ? 'high' : 
                       score.churn_probability >= 0.4 ? 'medium' : 'low';

        // Calculate optimal send time
        const now = new Date();
        let suggestedTime = new Date();

        if (timing && timing.confidence >= 50) {
          // Use learned timing
          suggestedTime = findNextOccurrence(now, timing.optimalDay, timing.optimalHour);
        } else {
          // Default to Tuesday at 2pm (statistically best for salon bookings)
          suggestedTime = findNextOccurrence(now, 2, 14);
        }

        const clientName = score.client?.user?.full_name || 'Client';

        reminders.push({
          clientId: score.client_id,
          clientName,
          type: urgency === 'high' ? 'retention' : 'rebook',
          suggestedTime,
          message: generatePersonalizedMessage(clientName, score, urgency),
          urgency
        });
      });

      setSmartReminders(reminders);
    } catch (error) {
      console.error('Error generating smart reminders:', error);
    }
  };

  /**
   * ✨ Helper: Find statistical mode (most common value)
   */
  const mode = (arr: number[]): number => {
    const freq: Record<number, number> = {};
    arr.forEach(val => freq[val] = (freq[val] || 0) + 1);
    return parseInt(Object.keys(freq).reduce((a, b) => freq[parseInt(a)] > freq[parseInt(b)] ? a : b));
  };

  /**
   * ✨ Helper: Find next occurrence of specific day/hour
   */
  const findNextOccurrence = (from: Date, targetDay: number, targetHour: number): Date => {
    const result = new Date(from);
    
    // Move to target day
    const currentDay = result.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    result.setDate(result.getDate() + daysToAdd);
    
    // Set target hour
    result.setHours(targetHour, 0, 0, 0);
    
    return result;
  };

  /**
   * ✨ Helper: Generate personalized message based on client state
   */
  const generatePersonalizedMessage = (clientName: string, score: any, urgency: string): string => {
    const daysSince = score.days_since_last_visit || 0;
    
    if (urgency === 'high') {
      return `Hi ${clientName}! It's been ${daysSince} days - we miss you! Your usual time slot is available this week. Book now for 10% off! 💇`;
    } else if (urgency === 'medium') {
      return `${clientName}, it's been ${daysSince} days since your last visit! Ready to refresh your look? I have some great availability this week.`;
    } else {
      return `Hi ${clientName}! Just checking in - let me know when you'd like to come in next. Your hair must be looking great! ✨`;
    }
  };

  return {
    timingProfiles,
    smartReminders,
    loading,
    refreshTimingProfiles: learnClientTimingPatterns,
    refreshReminders: generateSmartReminders
  };
};
