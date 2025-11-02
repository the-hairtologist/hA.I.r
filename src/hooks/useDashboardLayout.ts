import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logging/productionLogger';
import {
  trackSelect,
  trackUpdate,
  trackDelete,
} from '@/lib/logging/supabaseTracker';

export interface DashboardSection {
  id: string;
  title: string;
  component: string;
  enabled: boolean;
}

export function useDashboardLayout(defaultSections: DashboardSection[]) {
  const { user } = useAuth();
  const [sections, setSections] = useState<DashboardSection[]>(defaultSections);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSections(defaultSections);
      setIsLoading(false);
      return;
    }

    loadDashboardLayout();
  }, [user?.id]);

  const loadDashboardLayout = async () => {
    try {
      const result = await trackSelect(
        async () => {
          const { data, error } = await supabase
            .from('user_dashboard_preferences')
            .select('dashboard_layout')
            .eq('user_id', user!.id)
            .maybeSingle();
          return { data, error };
        },
        'user_dashboard_preferences',
        'useDashboardLayout'
      );

      if (result.error && result.error.code !== 'PGRST116') {
        logger.error('Error loading dashboard layout', result.error, {
          component: 'useDashboardLayout',
        });
        setSections(defaultSections);
        setIsLoading(false);
        return;
      }

      if (
        result.data?.dashboard_layout &&
        Array.isArray(result.data.dashboard_layout)
      ) {
        const savedSections = result.data
          .dashboard_layout as unknown as DashboardSection[];

        // Merge saved preferences with any new default sections
        const savedIds = savedSections.map(s => s.id);
        const newSections = defaultSections.filter(
          s => !savedIds.includes(s.id)
        );

        setSections([...savedSections, ...newSections]);
      } else {
        setSections(defaultSections);
      }
    } catch (error) {
      logger.error('Error loading dashboard layout', error, {
        component: 'useDashboardLayout',
      });
      setSections(defaultSections);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDashboardLayout = async (newLayout: DashboardSection[]) => {
    if (!user) return;

    setSections(newLayout);

    try {
      await trackUpdate(
        async () => {
          const { error } = await supabase
            .from('user_dashboard_preferences')
            .upsert(
              {
                user_id: user.id,
                dashboard_layout: newLayout as any,
                updated_at: new Date().toISOString(),
              } as any,
              {
                onConflict: 'user_id',
              }
            );
          return { data: null, error };
        },
        'user_dashboard_preferences',
        'useDashboardLayout'
      );
    } catch (error) {
      logger.error('Error saving dashboard layout', error, {
        component: 'useDashboardLayout',
      });
    }
  };

  const resetDashboardLayout = async () => {
    if (!user) return;

    setSections(defaultSections);

    try {
      await trackDelete(
        async () => {
          const { error } = await supabase
            .from('user_dashboard_preferences')
            .delete()
            .eq('user_id', user.id);
          return { data: null, error };
        },
        'user_dashboard_preferences',
        'useDashboardLayout'
      );
    } catch (error) {
      logger.error('Error resetting dashboard layout', error, {
        component: 'useDashboardLayout',
      });
    }
  };

  const toggleSection = async (sectionId: string) => {
    const newLayout = sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    await saveDashboardLayout(newLayout);
  };

  return {
    sections,
    isLoading,
    saveDashboardLayout,
    resetDashboardLayout,
    toggleSection,
  };
}
