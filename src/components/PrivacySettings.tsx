import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Shield, Eye, EyeOff, Users, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PrivacySettingsProps {
  userId: string;
  userRole: string;
}

export const PrivacySettings = ({ userId, userRole }: PrivacySettingsProps) => {
  const [loading, setLoading] = useState(true);
  const [isPublicListing, setIsPublicListing] = useState(false);
  const [shareWithStylists, setShareWithStylists] = useState(false);
  const [shareWithClients, setShareWithClients] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadPrivacySettings();
  }, [userId]);

  const loadPrivacySettings = async () => {
    try {
      // Load profile privacy settings
      const { data: profile } = await supabase
        .from("profiles")
        .select("share_contact_with_stylists, share_contact_with_clients")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        setShareWithStylists(profile.share_contact_with_stylists || false);
        setShareWithClients(profile.share_contact_with_clients || false);
      }

      // Load stylist-specific settings if applicable
      if (userRole === "stylist") {
        const { data: stylistProfile } = await supabase
          .from("stylist_profiles")
          .select("is_public_listing")
          .eq("user_id", userId)
          .maybeSingle();

        if (stylistProfile) {
          setIsPublicListing(stylistProfile.is_public_listing || false);
        }
      }
    } catch (error) {
      console.error("Error loading privacy settings:", error);
      toast.error("Failed to load privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublicListing = async (checked: boolean) => {
    setSaving("public_listing");
    try {
      const { error } = await supabase
        .from("stylist_profiles")
        .update({ is_public_listing: checked })
        .eq("user_id", userId);

      if (error) throw error;
      
      setIsPublicListing(checked);
      toast.success(
        checked 
          ? "Your profile is now visible in the public directory" 
          : "Your profile has been removed from the public directory"
      );
    } catch (error) {
      console.error("Error updating public listing:", error);
      toast.error("Failed to update public listing setting");
    } finally {
      setSaving(null);
    }
  };

  const handleToggleContactSharing = async (type: 'stylists' | 'clients', checked: boolean) => {
    setSaving(type);
    try {
      const updateData = type === 'stylists' 
        ? { share_contact_with_stylists: checked }
        : { share_contact_with_clients: checked };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;
      
      if (type === 'stylists') {
        setShareWithStylists(checked);
      } else {
        setShareWithClients(checked);
      }
      
      toast.success("Contact sharing preference updated");
    } catch (error) {
      console.error("Error updating contact sharing:", error);
      toast.error("Failed to update contact sharing");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Privacy & Visibility</CardTitle>
        </div>
        <CardDescription>
          Control who can see your profile and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {userRole === "stylist" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-4 p-4 border-2 border-foreground/10 rounded-lg bg-muted/50">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {isPublicListing ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="public-listing" className="font-semibold">
                    Public Directory Listing
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow new clients to discover you through the stylist directory
                </p>
              </div>
              <Switch
                id="public-listing"
                checked={isPublicListing}
                onCheckedChange={handleTogglePublicListing}
                disabled={saving === 'public_listing'}
              />
            </div>

            {isPublicListing && (
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Your business name, location, bio, and portfolio are visible to anyone browsing the directory.
                  Contact information is only shared when you enable the options below.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Contact Information Sharing</h4>
          
          {userRole === "stylist" && (
            <div className="flex items-center justify-between space-x-4 p-4 border-2 border-foreground/10 rounded-lg">
              <div className="flex-1 space-y-1">
                <Label htmlFor="share-with-clients" className="font-medium">
                  Share with Clients
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow clients with appointments to see your email and phone
                </p>
              </div>
              <Switch
                id="share-with-clients"
                checked={shareWithClients}
                onCheckedChange={(checked) => handleToggleContactSharing('clients', checked)}
                disabled={saving === 'clients'}
              />
            </div>
          )}

          {userRole === "client" && (
            <div className="flex items-center justify-between space-x-4 p-4 border-2 border-foreground/10 rounded-lg">
              <div className="flex-1 space-y-1">
                <Label htmlFor="share-with-stylists" className="font-medium">
                  Share with Stylists
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow your stylist to see your email and phone number
                </p>
              </div>
              <Switch
                id="share-with-stylists"
                checked={shareWithStylists}
                onCheckedChange={(checked) => handleToggleContactSharing('stylists', checked)}
                disabled={saving === 'stylists'}
              />
            </div>
          )}
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Privacy Note:</strong> Even when contact sharing is disabled, you can still communicate 
            through our secure messaging system. Your contact information is never sold to third parties.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
