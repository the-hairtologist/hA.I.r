import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to check for uncelebrated milestones and show celebration
 */
export const useMilestoneCheck = (clientId?: string, enabled: boolean = true) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || !clientId) return;

    const checkMilestones = async () => {
      try {
        const { data: milestones } = await supabase
          .from("client_milestones")
          .select("*")
          .eq("client_id", clientId)
          .eq("celebrated", false)
          .order("created_at", { ascending: false });

        if (milestones && milestones.length > 0) {
          // Show toast notification for uncelebrated milestones
          const milestone = milestones[0];
          const message =
            milestone.milestone_type === "anniversary"
              ? `🎂 ${milestone.milestone_value} Year Anniversary!`
              : `⭐ ${milestone.milestone_value} Appointments Milestone!`;

          toast({
            title: "Celebration Time! 🎉",
            description: `${message} - Check your rewards!`,
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Error checking milestones:", error);
      }
    };

    // Check on mount
    checkMilestones();

    // Set up realtime subscription
    const channel = supabase
      .channel("milestone-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "client_milestones",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          logger.info("New milestone detected:", payload);
          checkMilestones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, enabled]);
};
