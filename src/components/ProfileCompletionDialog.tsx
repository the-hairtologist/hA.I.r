import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { CheckCircle, ArrowRight, Sparkles, Upload } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';

interface ProfileCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: string | null;
  userId: string;
}

export const ProfileCompletionDialog = ({
  open,
  onOpenChange,
  userRole,
  userId,
}: ProfileCompletionDialogProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Stylist fields
  const [businessName, setBusinessName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [colorLine, setColorLine] = useState('');
  const [bio, setBio] = useState('');

  const totalSteps = userRole === 'stylist' ? 3 : 2;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (open) {
      loadExistingData();
    }
  }, [open]);

  const loadExistingData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setAvatarUrl(profile.avatar_url || '');
      }

      if (userRole === 'stylist') {
        const { data: stylistProfile } = await supabase
          .from('stylist_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (stylistProfile) {
          setBusinessName(stylistProfile.business_name || '');
          setSpecialty(stylistProfile.specialty || '');
          setLocation(stylistProfile.location || '');
          setYearsExperience(stylistProfile.years_experience?.toString() || '');
          setColorLine(stylistProfile.color_line || '');
          setBio(stylistProfile.bio || '');
        }
      }
    } catch (error) {
      logger.error('Error loading profile data', error, {
        component: 'ProfileCompletionDialog',
        userId,
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (10MB limit before compression)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Import image utility
      const { ImagePresets } = await import('@/lib/imageUtils');

      // Optimize image automatically
      toast.info('Optimizing image...', { duration: 2000 });
      const compressedFile = await ImagePresets.avatar(file);

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      userJourney.trackAction('Avatar uploaded');
      toast.success('Photo uploaded!');
    } catch (error: any) {
      logger.error('Error uploading photo', error, {
        component: 'ProfileCompletionDialog',
        userId,
      });
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!fullName.trim()) {
        toast.error('Please enter your full name');
        return;
      }
      setStep(2);
    } else if (step === 2 && userRole === 'stylist') {
      if (!colorLine.trim()) {
        toast.error(
          'Please specify your preferred color line for accurate formula generation'
        );
        return;
      }
      setStep(3);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
          avatar_url: avatarUrl || null,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update role-specific profile
      if (userRole === 'stylist') {
        const { error: stylistError } = await supabase
          .from('stylist_profiles')
          .update({
            business_name: businessName || null,
            specialty: specialty || null,
            location: location || null,
            years_experience: yearsExperience
              ? parseInt(yearsExperience)
              : null,
            color_line: colorLine || null,
            bio: bio || null,
          })
          .eq('user_id', userId);

        if (stylistError) throw stylistError;
      }

      // Mark profile as completed in localStorage to prevent repeated prompts
      localStorage.setItem('profile_completed', 'true');
      localStorage.setItem('profile_completed_at', new Date().toISOString());

      userJourney.trackAction('Profile completed', { userRole });
      toast.success('Profile completed! Welcome to hA.I.r!', {
        description: 'Your profile has been saved successfully',
        duration: 4000,
      });
      onOpenChange(false);
      navigate('/dashboard');
    } catch (error: any) {
      logger.error('Error completing profile', error, {
        component: 'ProfileCompletionDialog',
        userId,
        userRole,
      });
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('profile_setup_dismissed', 'true');
    localStorage.setItem(
      'profile_setup_dismissed_at',
      new Date().toISOString()
    );
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        if (!newOpen) {
          handleDismiss();
        }
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto brutal-border brutal-shadow-md"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Let's Get You Set Up
          </DialogTitle>
          <DialogDescription>
            Just a few quick details to unlock the full power of hA.I.r
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Let's Start With the Basics
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Help us personalize your experience
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <OptimizedImage
                      src={avatarUrl}
                      alt="User avatar"
                      priority={true}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-primary hover:underline">
                    <Upload className="h-4 w-4" />
                    {uploading
                      ? 'Uploading...'
                      : avatarUrl
                        ? 'Change Photo'
                        : 'Upload Photo'}
                  </div>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  maxLength={100}
                  className={!fullName.trim() ? 'border-destructive/50' : ''}
                />
                {!fullName.trim() && (
                  <p className="text-[11px] sm:text-xs text-destructive">
                    This field is required
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number{' '}
                  <span className="text-muted-foreground text-[11px] sm:text-xs">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => {
                    // Basic phone formatting
                    const cleaned = e.target.value.replace(/\D/g, '');
                    if (cleaned.length <= 10) {
                      setPhone(cleaned);
                    }
                  }}
                  placeholder="5551234567"
                  maxLength={10}
                />
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  {phone.length}/10 - Clients can reach you at this number
                </p>
              </div>
            </div>
          )}

          {step === 2 && userRole === 'stylist' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Showcase Your Expertise
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Stand out and attract more clients
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business/Salon Name{' '}
                    <span className="text-muted-foreground text-[11px] sm:text-xs">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g., Salon Elite"
                    maxLength={100}
                  />
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Helps clients find you
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">
                    Specialty{' '}
                    <span className="text-muted-foreground text-[11px] sm:text-xs">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    placeholder="e.g., Color Correction, Balayage"
                    maxLength={50}
                  />
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Your primary expertise
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location{' '}
                    <span className="text-muted-foreground text-[11px] sm:text-xs">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g., Los Angeles, CA"
                    maxLength={100}
                  />
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    City and state
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">
                    Years Experience{' '}
                    <span className="text-muted-foreground text-[11px] sm:text-xs">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    max="70"
                    value={yearsExperience}
                    onChange={e => setYearsExperience(e.target.value)}
                    placeholder="5"
                  />
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Years of professional experience
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="colorLine"
                  className="text-sm sm:text-base font-semibold"
                >
                  Preferred Color Line <span className="text-primary">*</span>
                </Label>
                <Input
                  id="colorLine"
                  value={colorLine}
                  onChange={e => setColorLine(e.target.value)}
                  placeholder="e.g., Redken, Wella, Schwarzkopf, Goldwell, Matrix"
                  maxLength={100}
                  className={!colorLine.trim() ? 'border-primary/50' : ''}
                />
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-primary">
                    🎨 Important for Formula Accuracy
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Specifying your color line ensures AI-generated formulas
                    match your exact products and mixing ratios. This
                    dramatically improves formula reliability and consistency.
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                    Popular brands: Redken, Wella, Schwarzkopf, Goldwell,
                    Matrix, Pravana, Pulp Riot, Joico, L'Oréal Professional
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && userRole === 'stylist' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Share Your Story
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Connect with clients on a personal level
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">
                  Professional Bio{' '}
                  <span className="text-muted-foreground text-[11px] sm:text-xs">
                    (Optional)
                  </span>
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Example: I specialize in lived-in color and dimensional balayage. With 10+ years of experience, I love creating natural, low-maintenance looks that enhance your natural beauty..."
                  rows={6}
                  maxLength={500}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
                  <span>Visible on your profile and in stylist discovery</span>
                  <span className={bio.length > 450 ? 'text-warning' : ''}>
                    {bio.length}/500
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && userRole === 'client' && (
            <div className="space-y-4 animate-fade-in text-center py-8">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold">You're All Set!</h3>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                Your profile is complete. You can now discover stylists and book
                appointments.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={saving}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={saving || uploading}
              className="flex-1"
            >
              {saving ? (
                'Saving...'
              ) : step === totalSteps ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Profile
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
