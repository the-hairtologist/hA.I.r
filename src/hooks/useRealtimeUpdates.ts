import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRealtimeUpdates = (
  table: string,
  onUpdate: () => void,
  userId?: string
) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`${table}-changes-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        (payload) => {
          // Show notifications for specific events
          if (payload.eventType === "INSERT") {
            if (table === "messages") {
              toast.info("New message received");
            } else if (table === "appointments") {
              toast.info("New appointment created");
            }
          }
          
          // Trigger refresh
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, userId, onUpdate]);
};
