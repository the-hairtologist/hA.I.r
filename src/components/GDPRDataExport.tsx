import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const GDPRDataExport = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      // Gather all user data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      }

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .or(`client_id.eq.${clientProfile?.id},stylist_id.eq.${stylistProfile?.id}`);

      const { data: formulas } = await supabase
        .from('formulas')
        .select('*')
        .or(`client_id.eq.${clientProfile?.id},stylist_id.eq.${stylistProfile?.id}`);

      const exportData = {
        export_date: new Date().toISOString(),
        user_id: user?.id,
        email: user?.email,
        profile,
        client_profile: clientProfile,
        stylist_profile: stylistProfile,
        appointments: appointments || [],
        formulas: formulas || [],
      };

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hair-ai-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Your data has been exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Call edge function to handle account deletion
      const { error } = await supabase.functions.invoke('delete-user-account');
      
      if (error) throw error;

      toast.success('Your account deletion request has been submitted. You will be logged out.');
      
      // Sign out user
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="brutal-border brutal-shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Data Privacy & GDPR
        </CardTitle>
        <CardDescription>
          Manage your personal data and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Data */}
        <div className="p-4 border-2 border-border rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Export Your Data</h4>
          <p className="text-xs text-muted-foreground">
            Download a complete copy of all your personal data stored in Hair A.I.
          </p>
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={exporting}
            className="w-full"
          >
            {exporting ? (
              <>
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Download My Data
              </>
            )}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="p-4 border-2 border-destructive/30 bg-destructive/5 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm text-destructive">Delete Account</h4>
          <p className="text-xs text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={deleting}
                className="w-full"
              >
                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers, including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Personal profile information</li>
                    <li>Appointment history</li>
                    <li>Hair formulas and notes</li>
                    <li>Photos and files</li>
                    <li>All other associated data</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, delete my account'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
