/**
 * Client Settings Component
 * Manages client-specific communication preferences and special requests
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter';
import { cn } from '@/lib/utils';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';

interface ClientSettingsProps {
  communicationPref: string;
  setCommunicationPref: (value: string) => void;
  sensitivityNotes: string;
  setSensitivityNotes: (value: string) => void;
  specialRequests: string;
  setSpecialRequests: (value: string) => void;
  onFieldChange: () => void;
}

export const ClientSettings = ({
  communicationPref,
  setCommunicationPref,
  sensitivityNotes,
  setSensitivityNotes,
  specialRequests,
  setSpecialRequests,
  onFieldChange,
}: ClientSettingsProps) => {
  return (
    <Card className="border-brutal">
      <CardHeader className={mobileFirst.padding.md}>
        <CardTitle className={mobileFirst.text.lg}>
          Client Preferences
        </CardTitle>
        <CardDescription className={mobileFirst.text.sm}>
          Help us provide you with the best service
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(mobileFirst.padding.md, 'space-y-6')}>
        {/* Communication Preference */}
        <div>
          <h3 className="font-semibold mb-3">Communication & Contact</h3>
          <div>
            <Label htmlFor="communicationPref">
              How Should We Reach You?
            </Label>
            <Select
              value={communicationPref}
              onValueChange={value => {
                setCommunicationPref(value);
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

        {/* Health & Sensitivity Notes */}
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Health & Sensitivity Notes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Help us keep you safe and comfortable. Share any allergies,
            sensitivities, or medical conditions that might affect hair
            treatments.
          </p>
          <div>
            <Label htmlFor="sensitivityNotes">
              Allergies & Sensitivities (Optional)
            </Label>
            <TextareaWithCounter
              id="sensitivityNotes"
              value={sensitivityNotes}
              onValueChange={value => {
                setSensitivityNotes(value);
                onFieldChange();
              }}
              placeholder="e.g., Allergic to PPD in hair color, sensitive scalp, avoid certain fragrances"
              maxLength={500}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              ⚕️ This information is confidential and helps us provide safe
              service
            </p>
          </div>
        </div>

        {/* Special Requests */}
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Special Requests</h3>
          <div>
            <Label htmlFor="specialRequests">
              Any Special Needs or Preferences? (Optional)
            </Label>
            <TextareaWithCounter
              id="specialRequests"
              value={specialRequests}
              onValueChange={value => {
                setSpecialRequests(value);
                onFieldChange();
              }}
              placeholder="e.g., Need quiet environment, prefer morning appointments, extra time needed"
              maxLength={500}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💬 Share anything that would make your visit more comfortable
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
