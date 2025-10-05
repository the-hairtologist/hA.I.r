import { useMemo, useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

export type NudgeTrigger = 
  | 'trial_day_5'
  | 'trial_day_13' 
  | 'client_limit'
  | 'value_proven'
  | 'appointments_limit'
  | null;

export const useSubscriptionNudges = () => {
  const { inTrial, subscribed, loading } = useSubscription();
  const [clientCount] = useState(0); // Will be populated from context/props in real implementation
  const [appointmentCount] = useState(0);
  const [trialDaysRemaining] = useState(10); // Default to 10 days, will be calculated from subscription context
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDismissedNudges();
  }, []);

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
