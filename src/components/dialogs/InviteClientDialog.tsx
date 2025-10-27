import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Loader2 } from 'lucide-react';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { invitationSchema, type InvitationInput } from '@/lib/validation';
import { StandardFormField } from '@/components/forms/StandardFormField';

interface InviteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientEmail: string;
  clientName?: string;
  stylistName: string;
}

export function InviteClientDialog({
  open, onOpenChange, clientEmail, clientName, stylistName,
}: InviteClientDialogProps) {
  const {
    values, errors, touched, isSubmitting, setFieldValue, setFieldTouched, handleSubmit, reset,
  } = useFormSubmit<InvitationInput>(
    async (data) => {
      const { error } = await supabase.functions.invoke('send-client-invite', {
        body: {
          clientEmail: data.clientEmail,
          clientName: clientName || '',
          stylistName,
          customMessage: data.customMessage || undefined,
        },
      });

      if (error) throw error;
    },
    {
      schema: invitationSchema,
      initialValues: {
        clientEmail: clientEmail,
        customMessage: '',
      },
      successMessage: "Invitation sent successfully.",
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    }
  );

  // Keep the form in sync if the parent changes clientEmail after mount
  useEffect(() => {
    setFieldValue('clientEmail', clientEmail);
    setFieldValue('customMessage', '');
  }, [clientEmail, setFieldValue]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Client Invitation
          </DialogTitle>
          <DialogDescription>
            Invite {clientName || 'your client'} to create their account and access their personalized formulas and appointment history.
          </DialogDescription>
        </DialogHeader>
        {!clientEmail && (
          <div className="text-red-500 mb-4">
            Please provide a client email to send an invitation.
          </div>
        )}
        <form
          className="space-y-4 py-4"
          onSubmit={handleSubmit}
        >
          <StandardFormField
            name="clientEmail"
            label="Client Email"
            type="email"
            value={values.clientEmail}
            onChange={(value) => setFieldValue('clientEmail', String(value))}
            onBlur={() => setFieldTouched('clientEmail')}
            error={errors.clientEmail}
            touched={touched.clientEmail}
            placeholder="client@example.com"
            disabled={isSubmitting || !clientEmail}
            required />

          <StandardFormField
            name="customMessage"
            label="Personal Message"
            type="textarea"
            value={values.customMessage}
            onChange={(value) => setFieldValue('customMessage', String(value))}
            onBlur={() => setFieldTouched('customMessage')}
            error={errors.customMessage}
            touched={touched.customMessage}
            placeholder="Add a personal note to your invitation..."
            maxLength={500}
            rows={4}
            disabled={isSubmitting || !clientEmail} />

          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !values.clientEmail || !clientEmail}
              className="flex-1 min-h-[44px]"
            >
              {isSubmitting ? (
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
        </form>
      </DialogContent>
    </Dialog>
  );
}