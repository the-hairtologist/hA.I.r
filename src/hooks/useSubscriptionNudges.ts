import { useMemo, useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";

export type NudgeTrigger = 
  | 'trial_day_5'
  | 'trial_day_13' 
  | 'client_limit'
  | 'value_proven'
  | 'appointments_limit'
  | null;

export const useSubscriptionNudges = () => {
  const { inTrial, subscribed, loading } = useSubscription();
  const [clientCount, setClientCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(10);
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDismissedNudges();
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get stylist profile
      const { data: stylistData } = await supabase
        .from("stylist_profiles")
        .select("id, trial_end_date")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!stylistData) return;

      // Calculate trial days remaining
      if (stylistData.trial_end_date) {
        const trialEnd = new Date(stylistData.trial_end_date);
        const now = new Date();
        const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        setTrialDaysRemaining(daysLeft);
      }

      // Get client count
      const { count: clients } = await supabase
        .from("client_profiles")
        .select("*", { count: 'exact', head: true })
        .eq("preferred_stylist_id", stylistData.id);

      setClientCount(clients || 0);

      // Get appointment count
      const { count: appointments } = await supabase
        .from("appointments")
        .select("*", { count: 'exact', head: true })
        .eq("stylist_id", stylistData.id)
        .eq("status", "completed");

      setAppointmentCount(appointments || 0);
    } catch (error) {
      console.error('Error loading subscription nudge data:', error);
    }
  };

  const loadDismissedNudges = () => {
    const dismissed = localStorage.getItem('dismissed_nudges');
    if (dismissed) {
      try {
        setDismissedNudges(new Set(JSON.parse(dismissed)));
      } catch (error) {
        console.error('Error loading dismissed nudges:', error);
      }
    }
  };

  const shouldShowNudge = useMemo<NudgeTrigger>(() => {
    // Don't show if already subscribed or not in trial
    if (loading || subscribed || !inTrial) return null;

    // Check dismissals
    const checkDismissed = (trigger: string) => {
      return dismissedNudges.has(trigger);
    };

    // Priority order (highest to lowest urgency)

    // 1. Client limit reached (URGENT - blocking workflow)
    if (clientCount >= 10 && !checkDismissed('client_limit')) {
      return 'client_limit';
    }

    // 2. Trial ending soon (last 2 days) - URGENCY
    if (trialDaysRemaining <= 2 && !checkDismissed('trial_day_13')) {
      return 'trial_day_13';
    }

    // 3. Value proven (3+ appointments, still in trial)
    if (appointmentCount >= 3 && trialDaysRemaining >= 3 && !checkDismissed('value_proven')) {
      return 'value_proven';
    }

    // 4. Mid-trial nudge (day 5-6)
    if ((trialDaysRemaining === 9 || trialDaysRemaining === 8) && !checkDismissed('trial_day_5')) {
      return 'trial_day_5';
    }

    return null;
  }, [inTrial, subscribed, loading, trialDaysRemaining, clientCount, appointmentCount, dismissedNudges]);

  const dismissNudge = (trigger: NudgeTrigger) => {
    if (!trigger) return;
    
    const newDismissed = new Set(dismissedNudges);
    newDismissed.add(trigger);
    setDismissedNudges(newDismissed);
    
    localStorage.setItem('dismissed_nudges', JSON.stringify([...newDismissed]));
  };

  const resetDismissals = () => {
    setDismissedNudges(new Set());
    localStorage.removeItem('dismissed_nudges');
  };

  return {
    shouldShowNudge,
    dismissNudge,
    resetDismissals,
    trialDaysRemaining,
    clientCount,
    appointmentCount
  };
};
