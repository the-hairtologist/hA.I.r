import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const ClientPreferenceCenter = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch client's email preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["client_email_preferences"],
    queryFn: async () => {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!clientProfile) return null;

      const { data, error } = await supabase
        .from("email_preferences")
        .select("*")
        .eq("client_id", clientProfile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Return defaults if no preferences exist
      return data || {
        appointment_reminders_enabled: true,
        rebooking_reminders_enabled: true,
        marketing_emails_enabled: true,
      };
    },
    enabled: !!user,
  });

  const [localPrefs, setLocalPrefs] = useState(preferences);

  // Update preferences
  const updateMutation = useMutation({
    mutationFn: async (newPrefs: any) => {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id, email")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!clientProfile) throw new Error("Client profile not found");

      const { error } = await supabase
        .from("email_preferences")
        .upsert({
          client_id: clientProfile.id,
          email: clientProfile.email,
          ...newPrefs,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Preferences updated", "Your email preferences have been saved");
      queryClient.invalidateQueries({ queryKey: ["client_email_preferences"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to update preferences", error.message);
    },
  });

  const handleToggle = (field: string, value: boolean) => {
    const updated = { ...localPrefs, [field]: value };
    setLocalPrefs(updated);
    updateMutation.mutate(updated);
  };

  if (isLoading) {
    return (
      <Card className="p-12 text-center border-2">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Email Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Control which emails you receive from your stylists
        </p>
      </div>

      <Card className="p-6 border-2 space-y-6">
        <div className="flex items-start gap-4">
          <Mail className="h-6 w-6 text-primary mt-1" />
          <div className="flex-1 space-y-6">
            {/* Appointment Reminders */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="space-y-1 flex-1">
                <Label htmlFor="appointment-reminders" className="text-base font-semibold cursor-pointer">
                  Appointment Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming appointments
                </p>
              </div>
              <Switch
                id="appointment-reminders"
                checked={localPrefs?.appointment_reminders_enabled ?? true}
                onCheckedChange={(checked) => handleToggle("appointment_reminders_enabled", checked)}
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Rebooking Reminders */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="space-y-1 flex-1">
                <Label htmlFor="rebooking-reminders" className="text-base font-semibold cursor-pointer">
                  Rebooking Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders to book your next appointment
                </p>
              </div>
              <Switch
                id="rebooking-reminders"
                checked={localPrefs?.rebooking_reminders_enabled ?? true}
                onCheckedChange={(checked) => handleToggle("rebooking_reminders_enabled", checked)}
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Marketing Emails */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="marketing-emails" className="text-base font-semibold cursor-pointer">
                  Promotional Emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Special offers, tips, and updates from your stylist
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={localPrefs?.marketing_emails_enabled ?? true}
                onCheckedChange={(checked) => handleToggle("marketing_emails_enabled", checked)}
                disabled={updateMutation.isPending}
              />
            </div>
          </div>
        </div>

        {updateMutation.isSuccess && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            Preferences saved successfully
          </div>
        )}
      </Card>

      <Card className="p-6 border-2 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> You can always update these preferences or unsubscribe from individual email
          sequences using the unsubscribe link at the bottom of any email.
        </p>
      </Card>
    </div>
  );
};