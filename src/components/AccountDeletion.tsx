import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const AccountDeletion = () => {
  const [confirmText, setConfirmText] = useState("");
  const [understand, setUnderstand] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Call edge function to handle account deletion
      const { error } = await supabase.functions.invoke('delete-user-data', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Account Deletion Requested",
        description: "Your account deletion request has been submitted. You will receive a confirmation email within 72 hours.",
      });

      // Sign out user
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion Failed",
        description: "Unable to process your deletion request. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmValid = confirmText === "DELETE" && understand;

  return (
    <Card className="p-6 border-destructive/50">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-destructive">Delete Account</h3>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
              Permanently delete your account and all associated data.
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Your Account?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 text-left">
                <p className="font-semibold text-foreground">
                  This action cannot be undone. This will permanently delete:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                  <li>Your profile and account information</li>
                  <li>All appointments and scheduling history</li>
                  <li>Hair formulas and client notes (for stylists)</li>
                  <li>Messages and conversations</li>
                  <li>Portfolio photos and uploaded content</li>
                  <li>Reviews and ratings</li>
                </ul>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-foreground">What will be retained:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    <li>Financial records (7 years for tax compliance)</li>
                    <li>Anonymized analytics data</li>
                    <li>Legal records if involved in disputes</li>
                  </ul>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="confirm-delete" className="text-xs sm:text-sm">
                      Type <strong>DELETE</strong> to confirm:
                    </Label>
                    <Input
                      id="confirm-delete"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type DELETE here"
                      className="font-mono"
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="understand"
                      checked={understand}
                      onCheckedChange={(checked) => setUnderstand(checked as boolean)}
                    />
                    <Label
                      htmlFor="understand"
                      className="text-xs sm:text-sm font-normal cursor-pointer leading-tight"
                    >
                      I understand that this action is permanent and cannot be reversed. 
                      I will receive a confirmation email within 72 hours.
                    </Label>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setConfirmText("");
                setUnderstand(false);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={!isConfirmValid || isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete My Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};
