import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mail, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

export const WeeklyDigestEmail = () => {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("email_digest_enabled")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      setEmailEnabled(profile.email_digest_enabled || false);
    }
  };

  const toggleEmailDigest = async (enabled: boolean) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ email_digest_enabled: enabled })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update email preferences");
    } else {
      setEmailEnabled(enabled);
      toast.success(enabled ? "Weekly digest enabled" : "Weekly digest disabled");
    }
    
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Weekly Digest Email</CardTitle>
        </div>
        <CardDescription>
          Receive a weekly summary of your stats, upcoming appointments, and insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="digest-toggle" className="flex flex-col gap-1">
            <span className="font-semibold">Enable Weekly Digest</span>
            <span className="text-sm text-muted-foreground font-normal">
              Sent every Monday at 9:00 AM
            </span>
          </Label>
          <Switch
            id="digest-toggle"
            checked={emailEnabled}
            onCheckedChange={toggleEmailDigest}
            disabled={loading}
            aria-label="Toggle weekly digest email"
          />
        </div>

        {emailEnabled && (
          <div className="space-y-3 p-4 bg-muted rounded-lg animate-fade-in">
            <p className="text-sm font-semibold">Your digest will include:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Weekly performance metrics</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Upcoming appointments</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Revenue summary</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>Client feedback</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
