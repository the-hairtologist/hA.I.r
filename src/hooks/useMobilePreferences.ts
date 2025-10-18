/**
 * Mobile User Preferences Hook with Lovable Cloud Sync
 * Manages haptic feedback, animations, offline mode, and theme preferences
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MobilePreferences {
  haptic_feedback_enabled: boolean;
  reduce_animations: boolean;
  offline_mode_enabled: boolean;
  preferred_theme: 'light' | 'dark' | 'system';
}

const DEFAULT_PREFERENCES: MobilePreferences = {
  haptic_feedback_enabled: true,
  reduce_animations: false,
  offline_mode_enabled: true,
  preferred_theme: 'system',
};

export const useMobilePreferences = () => {
  const [preferences, setPreferences] = useState<MobilePreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // Load preferences from Cloud
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_mobile_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPreferences({
            haptic_feedback_enabled: data.haptic_feedback_enabled,
            reduce_animations: data.reduce_animations,
            offline_mode_enabled: data.offline_mode_enabled,
            preferred_theme: data.preferred_theme as 'light' | 'dark' | 'system',
          });
        }
      } catch (error) {
        console.error('Failed to load mobile preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Update preferences in Cloud
  const updatePreferences = useCallback(async (updates: Partial<MobilePreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      const { error } = await supabase
        .from('user_mobile_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update mobile preferences:', error);
    }
  }, [preferences]);

  return {
    preferences,
    loading,
    updatePreferences,
    setHapticEnabled: (enabled: boolean) => updatePreferences({ haptic_feedback_enabled: enabled }),
    setReduceAnimations: (enabled: boolean) => updatePreferences({ reduce_animations: enabled }),
    setOfflineMode: (enabled: boolean) => updatePreferences({ offline_mode_enabled: enabled }),
    setTheme: (theme: 'light' | 'dark' | 'system') => updatePreferences({ preferred_theme: theme }),
  };
};

export default useMobilePreferences;