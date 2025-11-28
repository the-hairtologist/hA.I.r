import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logging/productionLogger';
import { clientSchema, type ClientInput } from '@/lib/validation';
import { StandardFormField } from '@/components/forms/StandardFormField';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { cn } from '@/lib/utils';

interface QuickAddClientFABProps {
  onClientAdded?: (clientId: string) => void;
}

export const QuickAddClientFAB = ({
  onClientAdded,
}: QuickAddClientFABProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

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
      if (!user?.id) {
        throw new Error('No user ID');
      }

      const { data: newClient, error } = await supabase
        .from('client_profiles')
        .insert([
          {
            full_name: data.full_name,
            email: data.email || null,
            phone: data.phone || null,
            notes: data.notes || null,
            preferred_stylist_id: user.id,
          },
        ])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!newClient) throw new Error('Failed to create client');

      logger.info('Client added successfully', { clientId: newClient.id });

      if (onClientAdded) {
        onClientAdded(newClient.id);
      }
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
        reset();
        setOpen(false);
      },
    }
  );

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className={cn(
          'fixed bottom-20 right-6 z-[45] h-14 w-14 rounded-full shadow-lg',
          'lg:bottom-6 lg:right-6',
          'bg-gradient-to-br from-emerald-500 to-green-600',
          'hover:from-emerald-600 hover:to-green-700',
          'transition-all duration-200 hover:scale-110 active:scale-95',
          'group touch-manipulation'
        )}
        aria-label="Quick add client"
      >
        <Plus className="h-7 w-7 transition-transform group-hover:rotate-90" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add Client</DialogTitle>
            <DialogDescription>
              Add a new client quickly to your roster
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                setFieldValue('email', value ? String(value) : undefined)
              }
              onBlur={() => setFieldTouched('email')}
              error={errors.email}
              touched={touched.email}
              placeholder="e.g., sarah@example.com"
              maxLength={255}
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
              placeholder="Any special notes..."
              maxLength={500}
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !values.full_name?.trim()}
                className="flex-1 gap-2 bg-gradient-to-br from-emerald-500 to-green-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Client
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
