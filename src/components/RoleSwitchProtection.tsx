import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";

export const RoleSwitchProtection = () => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();
  const { subscribed, inTrial, loading: subscriptionLoading } = useSubscription();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Don't run on public pages or when no user is logged in
    if (!user) {
      setHasChecked(false);
      return;
    }

    const checkRoleSwitch = async () => {
      if (hasChecked || subscriptionLoading) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get all user roles
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (!rolesData || rolesData.length === 0) return;

        // Check if user has stylist role or admin role
        const isStylist = rolesData.some(r => r.role === "stylist");
        const isAdmin = rolesData.some(r => r.role === "admin");
        
        // Admins are exempt from subscription requirements
        if (isStylist && !isAdmin && !subscriptionLoading) {
          // If they're a stylist but don't have a subscription or trial, downgrade them
          if (!subscribed && !inTrial) {
            // Remove stylist role and profile
            await supabase
              .from("user_roles")
              .delete()
              .eq("user_id", session.user.id)
              .eq("role", "stylist");

            await supabase
              .from("stylist_profiles")
              .delete()
              .eq("user_id", session.user.id);

            // Make sure they have client role
            const hasClientRole = rolesData.some(r => r.role === "client");
            if (!hasClientRole) {
              await supabase.rpc('assign_user_role', {
                _user_id: session.user.id,
                _role: 'client',
              });

              await supabase
                .from("client_profiles")
                .insert({ user_id: session.user.id });
            }

            toast.error("Stylist access requires an active subscription. You've been switched to a client account.");
            navigate("/dashboard");
          }
        }

        setHasChecked(true);
      } catch (error) {
        console.error("Role switch protection error:", error);
      }
    };

    checkRoleSwitch();
  }, [user, subscribed, inTrial, subscriptionLoading, hasChecked, navigate]);

  return null;
};
