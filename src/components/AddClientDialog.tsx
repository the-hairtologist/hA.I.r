import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';
import { trackSelect, trackInsert } from '@/lib/logging/supabaseTracker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';
import { clientSchema, type ClientInput } from '@/lib/validation';
import { StandardFormField } from '@/components/forms/StandardFormField';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { dataErrors } from '@/lib/errorMessages';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stylistId: string;
  onClientAdded: (clientId: string) => void;
}

export const AddClientDialog = ({
  open,
  onOpenChange,
  stylistId,
  onClientAdded,
}: AddClientDialogProps) => {
  const [allergies, setAllergies] = useState('');
  const [medicalConsent, setMedicalConsent] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    reset,
  } = useFormSubmit<ClientInput>(
    async data => {
      // Check if email already exists (only if email provided)
      if (data.email && data.email.trim()) {
        const emailToCheck = data.email.trim();
        const result = await trackSelect(
          async () =>
            await supabase
              .from('client_profiles')
              .select('id, user:profiles(full_name)')
              .eq('email', emailToCheck)
              .maybeSingle(),
          'client_profiles',
          'AddClientDialog',
          { email: emailToCheck }
        );

        if (result.error) {
          logger.error('Error checking email', result.error, {
            component: 'AddClientDialog',
          });
        }

        if (result.data) {
          toast.error('Email already exists', {
            description: `This email is already registered for ${result.data.user?.full_name || 'another client'}`,
          });
          throw new Error('Email already exists');
        }
      }

      // Create the client profile
      const clientResult = await trackInsert(
        async () =>
          await supabase
            .from('client_profiles')
            .insert({
              full_name: data.full_name,
              email: data.email || null,
              phone: data.phone || null,
              notes: data.notes || null,
              allergies: allergies || null,
              medical_info_consent: medicalConsent,
              preferred_stylist_id: stylistId,
            })
            .select()
            .maybeSingle(),
        'client_profiles',
        'AddClientDialog',
        { clientName: data.full_name }
      );

      if (clientResult.error) throw clientResult.error;
      const newClient = clientResult.data as any;

      userJourney.trackAction('Client Added', {
        clientId: newClient.id,
        clientName: data.full_name,
      });

      // Trigger Zapier webhook
      try {
        const { triggerNewClient } = await import('@/lib/zapierTriggers');
        await triggerNewClient(stylistId, {
          client_id: newClient.id,
          client_name: data.full_name,
          client_email: data.email,
          client_phone: data.phone,
        });
      } catch (error) {
        logger.error('[Zapier] Failed to trigger new client webhook', error, {
          component: 'AddClientDialog',
          clientId: newClient.id,
        });
      }

      // Notify parent
      onClientAdded(newClient.id);
    },
    {
      schema: clientSchema,
      initialValues: {
        full_name: '',
        email: '',
        phone: '',
        notes: '',
        allergies: '',
        medical_info_consent: false,
      },
      successMessage: 'Client added successfully! ✨',
      onSuccess: () => {
        setAllergies('');
        setMedicalConsent(false);
        reset();
        onOpenChange(false);
      },
    }
  );

  const resetForm = () => {
    setAllergies('');
    setMedicalConsent(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) {
          resetForm();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-lg brutal-border brutal-shadow-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Client
          </DialogTitle>
          <DialogDescription>
            Create a new client profile to save formulas for
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <StandardFormField
            name="full_name"
            label="Full Name"
            type="text"
            value={values.full_name}
            onChange={value => setFieldValue('full_name', String(value))}
            onBlur={() => setFieldTouched('full_name')}
            error={errors.full_name}
            touched={touched.full_name}
            required
            placeholder="e.g., Sarah Johnson"
            maxLength={100}
          />

          <StandardFormField
            name="email"
            label="Email"
            type="email"
            value={values.email || ''}
            onChange={value =>
              setFieldValue('email', value ? String(value) : '')
            }
            onBlur={() => setFieldTouched('email')}
            error={errors.email}
            touched={touched.email}
            placeholder="e.g., sarah@example.com"
            maxLength={255}
            description="Optional - useful for walk-ins or phone bookings"
          />

          <StandardFormField
            name="phone"
            label="Phone"
            type="tel"
            value={values.phone || ''}
            onChange={value =>
              setFieldValue('phone', value ? String(value) : undefined)
            }
            onBlur={() => setFieldTouched('phone')}
            error={errors.phone}
            touched={touched.phone}
            placeholder="e.g., (555) 123-4567"
            maxLength={20}
          />

          <StandardFormField
            name="notes"
            label="Notes"
            type="textarea"
            value={values.notes || ''}
            onChange={value =>
              setFieldValue('notes', value ? String(value) : undefined)
            }
            onBlur={() => setFieldTouched('notes')}
            error={errors.notes}
            touched={touched.notes}
            placeholder="Add any special notes about this client..."
            maxLength={500}
            rows={3}
          />

          <MedicalDisclaimer context="allergies" className="mb-4" />

          <StandardFormField
            name="allergies"
            label="Allergies"
            type="textarea"
            value={allergies}
            onChange={value => setAllergies(String(value))}
            placeholder="Any hair product allergies or sensitivities..."
            maxLength={500}
            rows={2}
          />

          {/* Medical Consent */}
          {allergies.trim() && (
            <div className="flex items-start space-x-2 p-3 border rounded-lg bg-muted/50">
              <Checkbox
                id="medical-consent"
                checked={medicalConsent}
                onCheckedChange={checked =>
                  setMedicalConsent(checked as boolean)
                }
              />
              <div className="space-y-1">
                <Label
                  htmlFor="medical-consent"
                  className="text-sm font-normal cursor-pointer leading-none"
                >
                  I consent to sharing allergy information with my stylist
                </Label>
                <p className="text-xs text-muted-foreground">
                  This information will only be visible to your assigned stylist
                  for safety purposes
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !values.full_name?.trim()}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Client
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
