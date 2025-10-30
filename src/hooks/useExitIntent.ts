import { useEffect, useState, useCallback } from 'react';
import { App } from '@capacitor/app';
import { Platform } from '@/platform';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'hair_exit_intent_shown';
const MIN_PAGE_TIME = 2000; // 2 seconds minimum before showing

interface UseExitIntentOptions {
  onExitIntent: () => void;
  enabled?: boolean;
}

export const useExitIntent = ({
  onExitIntent,
  enabled = true,
}: UseExitIntentOptions) => {
  const [pageStartTime] = useState(Date.now());
  const [hasShown, setHasShown] = useState(false);

  const checkEligibility = useCallback(async () => {
    // Check if already shown
    const shown = sessionStorage.getItem(STORAGE_KEY);
    if (shown) return false;

    // Check minimum time on page
    if (Date.now() - pageStartTime < MIN_PAGE_TIME) return false;

    // Check if user is logged in
    const { data } = await supabase.auth.getUser();
    if (data.user) return false; // Don't show to logged-in users

    return true;
  }, [pageStartTime]);

  const handleExitIntent = useCallback(async () => {
    if (!enabled || hasShown) return;

    const isEligible = await checkEligibility();
    if (!isEligible) return;

    setHasShown(true);
    sessionStorage.setItem(STORAGE_KEY, 'true');
    onExitIntent();
  }, [enabled, hasShown, checkEligibility, onExitIntent]);

  useEffect(() => {
    if (!enabled) return;

    // Desktop: Mouse exit detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 5) {
        handleExitIntent();
      }
    };

    // Mobile: Back button detection (Android)
    let backButtonListener: any;
    if (!Platform.isWeb) {
      backButtonListener = App.addListener('backButton', () => {
        handleExitIntent();
      });
    }

    // Web: Browser back button (popstate)
    const handlePopState = () => {
      handleExitIntent();
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [enabled, handleExitIntent]);

  return { hasShown };
};
