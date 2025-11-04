/**
 * Profile Settings Component
 * Handles basic profile information for both stylists and clients
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter';
import { HelpTooltip } from '@/components/HelpTooltip';
import { cn } from '@/lib/utils';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';
import { ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileSettingsProps {
  fullName: string;
  setFullName: (value: string) => void;
  businessName: string;
  setBusinessName: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  specialty: string;
  setSpecialty: (value: string) => void;
  colorLine: string;
  setColorLine: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  yearsExperience: string;
  setYearsExperience: (value: string) => void;
  instagramHandle: string;
  setInstagramHandle: (value: string) => void;
  tiktokHandle: string;
  setTiktokHandle: (value: string) => void;
  facebookUrl: string;
  setFacebookUrl: (value: string) => void;
  birthday?: string;
  setBirthday?: (value: string) => void;
  hairGoals?: string;
  setHairGoals?: (value: string) => void;
  preferredTimeOfDay?: string;
  setPreferredTimeOfDay?: (value: string) => void;
  referralSource?: string;
  setReferralSource?: (value: string) => void;
  userRole: string;
  onFieldChange: () => void;
}

export const ProfileSettings = ({
  fullName,
  setFullName,
  businessName,
  setBusinessName,
  bio,
  setBio,
  specialty,
  setSpecialty,
  colorLine,
  setColorLine,
  location,
  setLocation,
  yearsExperience,
  setYearsExperience,
  instagramHandle,
  setInstagramHandle,
  tiktokHandle,
  setTiktokHandle,
  facebookUrl,
  setFacebookUrl,
  birthday,
  setBirthday,
  hairGoals,
  setHairGoals,
  preferredTimeOfDay,
  setPreferredTimeOfDay,
  referralSource,
  setReferralSource,
  userRole,
  onFieldChange,
}: ProfileSettingsProps) => {
  return (
    <Card className="border-brutal">
      <CardHeader className={mobileFirst.padding.md}>
        <CardTitle className={mobileFirst.text.lg}>Profile Information</CardTitle>
        <CardDescription className={mobileFirst.text.sm}>
          {userRole === 'stylist'
            ? 'Manage your business profile and professional details'
            : 'Manage your personal profile'}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(mobileFirst.padding.md, 'space-y-4')}>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={e => {
              setFullName(e.target.value);
              onFieldChange();
            }}
            placeholder="Your full name"
          />
        </div>

        {userRole === 'stylist' && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="businessName">Business Name</Label>
                <HelpTooltip
                  title="Business Name"
                  content={{
                    stylist:
                      'Your salon or studio name that clients will see. If you work independently, you can use your name or create a brand name.',
                  }}
                  examples={[
                    'The Color Studio',
                    "Sarah's Hair Lounge",
                    'Mane Street Salon',
                  ]}
                />
              </div>
              <Input
                id="businessName"
                value={businessName}
                onChange={e => {
                  setBusinessName(e.target.value);
                  onFieldChange();
                }}
                placeholder="Your salon or business name"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="bio">Bio</Label>
                <HelpTooltip
                  title="Professional Bio"
                  content={{
                    stylist:
                      'Your bio is your first impression. Share your experience, what you love about hair, and what makes you unique. Keep it friendly and authentic!',
                  }}
                  tips={[
                    'Mention your years of experience',
                    'Share what you specialize in',
                    'Add a personal touch - why do you love hair?',
                    'Keep it conversational, not formal',
                  ]}
                />
              </div>
              <TextareaWithCounter
                id="bio"
                value={bio}
                onValueChange={value => {
                  setBio(value);
                  onFieldChange();
                }}
                placeholder="e.g., I'm a color specialist with 8 years behind the chair. I love creating natural-looking highlights and helping clients maintain healthy hair!"
                maxLength={1000}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <HelpTooltip
                    title="Your Specialty"
                    content={{
                      stylist:
                        'What do you do best? This helps clients find you when searching for specific services.',
                    }}
                    examples={[
                      'Balayage & Dimensional Color',
                      'Color Correction Specialist',
                      'Curly Hair Expert',
                      'Extensions & Length',
                      "Men's Cuts & Styling",
                    ]}
                  />
                </div>
                <Input
                  id="specialty"
                  value={specialty}
                  onChange={e => {
                    setSpecialty(e.target.value);
                    onFieldChange();
                  }}
                  placeholder="e.g., Balayage, Color Correction"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="colorLine">Color Line</Label>
                  <HelpTooltip
                    title="Preferred Color Line"
                    content={{
                      stylist:
                        'The professional color brand you use. This matters to clients who have preferences or allergies to certain brands.',
                    }}
                    examples={[
                      'Redken',
                      'Wella Professionals',
                      'Schwarzkopf',
                      "L'Oréal Professional",
                      'Pulp Riot',
                    ]}
                  />
                </div>
                <Input
                  id="colorLine"
                  value={colorLine}
                  onChange={e => {
                    setColorLine(e.target.value);
                    onFieldChange();
                  }}
                  placeholder="e.g., Redken, Wella"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="location">Location</Label>
                  <HelpTooltip
                    title="Your Location"
                    content={{
                      stylist:
                        'Where you work. This helps clients nearby find you. You can include neighborhood or general area - no need for full address.',
                    }}
                    examples={[
                      'Downtown Seattle, WA',
                      'Brooklyn, NY',
                      'Austin, TX - Domain Area',
                    ]}
                  />
                </div>
                <Input
                  id="location"
                  value={location}
                  onChange={e => {
                    setLocation(e.target.value);
                    onFieldChange();
                  }}
                  placeholder="City, State"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <HelpTooltip
                    title="Experience Level"
                    content={{
                      stylist:
                        "How long you've been doing hair professionally. Be honest - all experience levels are valuable!",
                    }}
                    tips={[
                      'Count from when you got licensed',
                      'New stylists (0-2 years) often attract clients looking for good prices',
                      'Experienced stylists (5+ years) can charge premium rates',
                    ]}
                  />
                </div>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={yearsExperience}
                  onChange={e => {
                    setYearsExperience(e.target.value);
                    onFieldChange();
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                Social Media (Optional)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={instagramHandle}
                    onChange={e => {
                      setInstagramHandle(e.target.value);
                      onFieldChange();
                    }}
                    placeholder="@yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={tiktokHandle}
                    onChange={e => {
                      setTiktokHandle(e.target.value);
                      onFieldChange();
                    }}
                    placeholder="@yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={facebookUrl}
                    onChange={e => {
                      setFacebookUrl(e.target.value);
                      onFieldChange();
                    }}
                    placeholder="Profile URL"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Client-specific fields */}
        {userRole === 'client' && (
          <>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Personal Preferences</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Help stylists provide you with the best experience
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthday">Birthday (Optional)</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={birthday}
                    onChange={e => {
                      setBirthday?.(e.target.value);
                      onFieldChange();
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    🎉 We'll send you a birthday treat!
                  </p>
                </div>

                <div>
                  <Label htmlFor="preferredTimeOfDay">
                    Preferred Appointment Time
                  </Label>
                  <Select
                    value={preferredTimeOfDay}
                    onValueChange={value => {
                      setPreferredTimeOfDay?.(value);
                      onFieldChange();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">
                        Morning (9 AM - 12 PM)
                      </SelectItem>
                      <SelectItem value="afternoon">
                        Afternoon (12 PM - 5 PM)
                      </SelectItem>
                      <SelectItem value="evening">
                        Evening (5 PM - 8 PM)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Label htmlFor="hairGoals">Hair Goals (Optional)</Label>
              <TextareaWithCounter
                id="hairGoals"
                value={hairGoals || ''}
                onValueChange={value => {
                  setHairGoals?.(value);
                  onFieldChange();
                }}
                placeholder="What are your hair goals? (e.g., grow it long, maintain healthy color, try a new style)"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Share your hair journey! This helps stylists understand your
                vision.
              </p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">How Did You Find Us?</h3>
              <div>
                <Label htmlFor="referralSource">
                  Referral Source (Optional)
                </Label>
                <Input
                  id="referralSource"
                  value={referralSource}
                  onChange={e => {
                    setReferralSource?.(e.target.value);
                    onFieldChange();
                  }}
                  placeholder="e.g., Instagram, Friend, Google"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
