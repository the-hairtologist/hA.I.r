import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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
      const { data, error } = await supabase
        .from("user_dashboard_preferences")
        .select("dashboard_layout")
        .eq("user_id", user!.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading dashboard layout:", error);
        setSections(defaultSections);
        setIsLoading(false);
        return;
      }

      if (data?.dashboard_layout && Array.isArray(data.dashboard_layout)) {
        const savedSections = data.dashboard_layout as unknown as DashboardSection[];
        
        // Merge saved preferences with any new default sections
        const savedIds = savedSections.map(s => s.id);
        const newSections = defaultSections.filter(s => !savedIds.includes(s.id));
        
        setSections([...savedSections, ...newSections]);
      } else {
        setSections(defaultSections);
      }
    } catch (error) {
      console.error("Error loading dashboard layout:", error);
      setSections(defaultSections);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDashboardLayout = async (newLayout: DashboardSection[]) => {
    if (!user) return;

    setSections(newLayout);

    try {
      const { error } = await supabase
        .from("user_dashboard_preferences")
        .upsert({
          user_id: user.id,
          dashboard_layout: newLayout as any,
          updated_at: new Date().toISOString(),
        } as any);

      if (error) {
        console.error("Error saving dashboard layout:", error);
      }
    } catch (error) {
      console.error("Error saving dashboard layout:", error);
    }
  };

  const resetDashboardLayout = async () => {
    if (!user) return;

    setSections(defaultSections);

    try {
      const { error } = await supabase
        .from("user_dashboard_preferences")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error resetting dashboard layout:", error);
      }
    } catch (error) {
      console.error("Error resetting dashboard layout:", error);
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
