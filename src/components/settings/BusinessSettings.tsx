/**
 * Business Settings Component
 * Manages stylist business contact, booking preferences, and policies
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter';
import { HelpTooltip } from '@/components/HelpTooltip';
import { FormFieldError } from '@/components/FormFieldError';
import { validatePhone } from '@/lib/phoneValidation';
import { cn } from '@/lib/utils';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';
import { FormErrorBoundary } from '@/components/errors/FormErrorBoundary';

interface BusinessSettingsProps {
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
  businessEmail: string;
  setBusinessEmail: (value: string) => void;
  timezone: string;
  setTimezone: (value: string) => void;
  preferredComm: string;
  setPreferredComm: (value: string) => void;
  maxClientsPerDay: string;
  setMaxClientsPerDay: (value: string) => void;
  acceptsNewClients: boolean;
  setAcceptsNewClients: (value: boolean) => void;
  depositRequired: boolean;
  setDepositRequired: (value: boolean) => void;
  depositPercentage: string;
  setDepositPercentage: (value: string) => void;
  cancellationPolicy: string;
  setCancellationPolicy: (value: string) => void;
  parkingInstructions: string;
  setParkingInstructions: (value: string) => void;
  specialAccommodations: string;
  setSpecialAccommodations: (value: string) => void;
  phoneError?: string;
  setPhoneError: (error?: string) => void;
  onFieldChange: () => void;
}

export const BusinessSettings = ({
  businessPhone,
  setBusinessPhone,
  businessEmail,
  setBusinessEmail,
  timezone,
  setTimezone,
  preferredComm,
  setPreferredComm,
  maxClientsPerDay,
  setMaxClientsPerDay,
  acceptsNewClients,
  setAcceptsNewClients,
  depositRequired,
  setDepositRequired,
  depositPercentage,
  setDepositPercentage,
  cancellationPolicy,
  setCancellationPolicy,
  parkingInstructions,
  setParkingInstructions,
  specialAccommodations,
  setSpecialAccommodations,
  phoneError,
  setPhoneError,
  onFieldChange,
}: BusinessSettingsProps) => {
  return (
    <Card className="border-brutal">
      <CardHeader className={mobileFirst.padding.md}>
        <CardTitle className={mobileFirst.text.lg}>Business Settings</CardTitle>
        <CardDescription className={mobileFirst.text.sm}>
          Manage your business contact info, booking preferences, and policies
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(mobileFirst.padding.md, 'space-y-6')}>
        <FormErrorBoundary fallbackMessage="An error occurred while editing business settings. Your changes have been preserved.">
          {/* Business Contact */}
          <div>
          <h3 className="font-semibold mb-3">Business Contact</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Contact info for client inquiries and booking confirmations
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input
                id="businessPhone"
                type="tel"
                value={businessPhone}
                onChange={e => {
                  const value = e.target.value;
                  setBusinessPhone(value);
                  onFieldChange();

                  // Validate phone if provided
                  if (value.trim()) {
                    const validation = validatePhone(value);
                    setPhoneError(
                      validation.valid ? undefined : validation.error
                    );
                  } else {
                    setPhoneError(undefined);
                  }
                }}
                placeholder="(555) 123-4567"
                aria-invalid={phoneError ? true : undefined}
              />
              {phoneError && <FormFieldError message={phoneError} />}
            </div>
            <div>
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                id="businessEmail"
                type="email"
                value={businessEmail}
                onChange={e => {
                  setBusinessEmail(e.target.value);
                  onFieldChange();
                }}
                placeholder="business@example.com"
              />
            </div>
          </div>
        </div>

        {/* Booking Preferences */}
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Booking Preferences</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Control how clients can book with you and manage your availability
          </p>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <HelpTooltip
                    content={{
                      stylist:
                        'Your timezone ensures appointment times are shown correctly to clients in different locations.',
                    }}
                  />
                </div>
                <Select
                  value={timezone}
                  onValueChange={value => {
                    setTimezone(value);
                    onFieldChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">
                      Eastern (ET)
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central (CT)
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain (MT)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific (PT)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferredComm">Communication Preference</Label>
                <Select
                  value={preferredComm}
                  onValueChange={value => {
                    setPreferredComm(value);
                    onFieldChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">In-App Messages</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text/SMS</SelectItem>
                    <SelectItem value="call">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="maxClientsPerDay">
                    Max Clients Per Day
                  </Label>
                  <HelpTooltip
                    content={{
                      stylist:
                        'Set a realistic limit to avoid burnout. Most stylists handle 4-8 clients per day.',
                    }}
                  />
                </div>
                <Input
                  id="maxClientsPerDay"
                  type="number"
                  value={maxClientsPerDay}
                  onChange={e => {
                    setMaxClientsPerDay(e.target.value);
                    onFieldChange();
                  }}
                  min="1"
                  max="20"
                  placeholder="8"
                />
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="acceptsNewClients" className="font-semibold">
                    Accepting New Clients
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle when your books are full
                  </p>
                </div>
                <Switch
                  id="acceptsNewClients"
                  checked={acceptsNewClients}
                  onCheckedChange={checked => {
                    setAcceptsNewClients(checked);
                    onFieldChange();
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border-2 border-foreground/10 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    id="depositRequired"
                    checked={depositRequired}
                    onCheckedChange={checked => {
                      setDepositRequired(checked);
                      onFieldChange();
                    }}
                  />
                  <Label htmlFor="depositRequired" className="font-semibold">
                    Require Deposit
                  </Label>
                  <HelpTooltip
                    content={{
                      stylist:
                        'Deposits reduce no-shows. Typical range is 25-50% for most services.',
                    }}
                  />
                </div>
                {depositRequired && (
                  <div className="ml-8">
                    <Label htmlFor="depositPercentage" className="text-sm">
                      Deposit Percentage (%)
                    </Label>
                    <Input
                      id="depositPercentage"
                      type="number"
                      value={depositPercentage}
                      onChange={e => {
                        setDepositPercentage(e.target.value);
                        onFieldChange();
                      }}
                      placeholder="50"
                      min="0"
                      max="100"
                      className="mt-1 max-w-[120px]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Policies & Instructions */}
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Policies & Client Information</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Help clients prepare for their visit and set clear expectations
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="cancellationPolicy">
                  Cancellation Policy
                </Label>
                <HelpTooltip
                  content={{
                    stylist:
                      'Clear policies protect your time and income. Be specific about notice requirements and fees.',
                  }}
                />
              </div>
              <TextareaWithCounter
                id="cancellationPolicy"
                value={cancellationPolicy}
                onValueChange={value => {
                  setCancellationPolicy(value);
                  onFieldChange();
                }}
                placeholder="e.g., 24-hour cancellation notice required. No-shows will be charged 50%."
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="parkingInstructions">
                Parking Instructions (Optional)
              </Label>
              <TextareaWithCounter
                id="parkingInstructions"
                value={parkingInstructions}
                onValueChange={value => {
                  setParkingInstructions(value);
                  onFieldChange();
                }}
                placeholder="e.g., Free street parking available. Parking garage entrance on 5th Avenue."
                maxLength={300}
              />
            </div>

            <div>
              <Label htmlFor="specialAccommodations">
                Special Accommodations (Optional)
              </Label>
              <TextareaWithCounter
                id="specialAccommodations"
                value={specialAccommodations}
                onValueChange={value => {
                  setSpecialAccommodations(value);
                  onFieldChange();
                }}
                placeholder="e.g., Wheelchair accessible, quiet space available for sensory-sensitive clients."
                maxLength={300}
              />
            </div>
          </div>
        </div>
        </FormErrorBoundary>
      </CardContent>
    </Card>
  );
};
