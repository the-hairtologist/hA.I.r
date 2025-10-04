import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

interface InviteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientEmail: string;
  clientName: string;
  stylistName: string;
}

export const InviteClientDialog = ({
  open,
  onOpenChange,
  clientEmail,
  clientName,
  stylistName,
}: InviteClientDialogProps) => {
  const [sending, setSending] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const handleSendInvite = async () => {
    // Validate email format
    if (!clientEmail || !clientEmail.includes('@')) {
      toast.error("Valid client email is required");
      return;
    }

    // Validate custom message length
    if (customMessage && customMessage.length > 500) {
      toast.error("Message must be less than 500 characters");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-client-invite", {
        body: {
          clientEmail,
          clientName,
          stylistName,
          customMessage: customMessage || undefined,
        },
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${clientEmail}`);
      onOpenChange(false);
      setCustomMessage("");
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Client Invitation
          </DialogTitle>
          <DialogDescription>
            Invite {clientName || "your client"} to create their account and access their personalized formulas and appointment history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Client Email</Label>
            <Input value={clientEmail} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-message">Personal Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder="Add a personal note to your invitation"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={sending || !clientEmail}
              className="flex-1"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
