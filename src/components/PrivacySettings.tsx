import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Users, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';
import { trackSelect, trackUpdate } from '@/lib/logging/supabaseTracker';

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
      const profileResult = await trackSelect(
        async () =>
          await supabase
            .from('profiles')
            .select('share_contact_with_stylists, share_contact_with_clients')
            .eq('id', userId)
            .maybeSingle(),
        'profiles',
        'PrivacySettings'
      );

      if (profileResult.data) {
        setShareWithStylists(
          profileResult.data.share_contact_with_stylists || false
        );
        setShareWithClients(
          profileResult.data.share_contact_with_clients || false
        );
      }

      // Load stylist-specific settings if applicable
      if (userRole === 'stylist') {
        const stylistResult = await trackSelect(
          async () =>
            await supabase
              .from('stylist_profiles')
              .select('is_public_listing')
              .eq('user_id', userId)
              .maybeSingle(),
          'stylist_profiles',
          'PrivacySettings'
        );

        if (stylistResult.data) {
          setIsPublicListing(stylistResult.data.is_public_listing || false);
        }
      }
    } catch (error) {
      logger.error('Error loading privacy settings', error, {
        component: 'PrivacySettings',
        userId,
      });
      toast.error('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublicListing = async (checked: boolean) => {
    setSaving('public_listing');
    try {
      await trackUpdate(
        async () =>
          await supabase
            .from('stylist_profiles')
            .update({ is_public_listing: checked })
            .eq('user_id', userId),
        'stylist_profiles',
        'PrivacySettings',
        { checked, userId }
      );

      setIsPublicListing(checked);
      userJourney.trackAction(
        `Public listing ${checked ? 'enabled' : 'disabled'}`
      );
      toast.success(
        checked
          ? 'Your profile is now visible in the public directory'
          : 'Your profile has been removed from the public directory'
      );
    } catch (error) {
      logger.error('Error updating public listing', error, {
        component: 'PrivacySettings',
        userId,
        checked,
      });
      toast.error('Failed to update public listing setting');
    } finally {
      setSaving(null);
    }
  };

  const handleToggleContactSharing = async (
    type: 'stylists' | 'clients',
    checked: boolean
  ) => {
    setSaving(type);
    try {
      const updateData =
        type === 'stylists'
          ? { share_contact_with_stylists: checked }
          : { share_contact_with_clients: checked };

      await trackUpdate(
        async () =>
          await supabase.from('profiles').update(updateData).eq('id', userId),
        'profiles',
        'PrivacySettings',
        { type, checked, userId }
      );

      if (type === 'stylists') {
        setShareWithStylists(checked);
      } else {
        setShareWithClients(checked);
      }

      userJourney.trackAction(
        `Contact sharing with ${type} ${checked ? 'enabled' : 'disabled'}`
      );
      toast.success('Contact sharing preference updated');
    } catch (error) {
      logger.error('Error updating contact sharing', error, {
        component: 'PrivacySettings',
        type,
        checked,
        userId,
      });
      toast.error('Failed to update contact sharing');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Card className="brutal-border brutal-shadow-xs">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="brutal-border brutal-shadow-xs">
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
        {userRole === 'stylist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-4 p-4 brutal-border border-foreground/10 rounded-lg bg-muted/50">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {isPublicListing ? (
                    <Eye className="h-4 w-4 text-success" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="public-listing" className="font-semibold">
                    Public Directory Listing
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow new clients to discover you through the stylist
                  directory
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
                  Your business name, location, bio, and portfolio are visible
                  to anyone browsing the directory. Contact information is only
                  shared when you enable the options below.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Contact Information Sharing</h4>

          {userRole === 'stylist' && (
            <div className="flex items-center justify-between space-x-4 p-4 brutal-border border-foreground/10 rounded-lg">
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
                onCheckedChange={checked =>
                  handleToggleContactSharing('clients', checked)
                }
                disabled={saving === 'clients'}
              />
            </div>
          )}

          {userRole === 'client' && (
            <div className="flex items-center justify-between space-x-4 p-4 brutal-border border-foreground/10 rounded-lg">
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
                onCheckedChange={checked =>
                  handleToggleContactSharing('stylists', checked)
                }
                disabled={saving === 'stylists'}
              />
            </div>
          )}
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Privacy Note:</strong> Even when contact sharing is
            disabled, you can still communicate through our secure messaging
            system. Your contact information is never sold to third parties.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
