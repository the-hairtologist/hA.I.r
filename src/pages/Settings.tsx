import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerformance } from '@/hooks/usePerformance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Loader2,
  RefreshCw,
  Lock,
  ExternalLink,
  Image,
  DollarSign,
  Mail,
  Calendar,
  Eye,
  Sparkles,
  Brain,
  Code,
  Sliders,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validatePhone } from '@/lib/phoneValidation';
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter';
import { DataExport } from '@/components/DataExport';
import { AccountDeletion } from '@/components/AccountDeletion';
import { PrivacySettings } from '@/components/PrivacySettings';
import { HelpTooltip } from '@/components/HelpTooltip';
import { Switch } from '@/components/ui/switch';
import { ClientPreferenceCenter } from '@/components/email-sequences/ClientPreferenceCenter';
import { MobileNavCustomizer } from '@/components/MobileNavCustomizer';
import { FirstTimeTooltip } from '@/components/FirstTimeTooltip';
import { ZapierSettings } from '@/pages/Settings/ZapierSettings';
import { cn } from '@/lib/utils';
import { mobileFirst, touchButton } from '@/lib/responsive/mobile-first-utils';
import { FormFieldError } from '@/components/FormFieldError';
import { useDevMode } from '@/hooks/useDevMode';
import { SaveIndicator } from '@/components/SaveIndicator';
import { logger } from '@/lib/logger';
import { SettingsSkeleton } from '@/components/skeletons';
import {
  ProfileSettings,
  BusinessSettings,
  SecuritySettings,
  ClientSettings,
  NotificationSettings as PushNotificationSettings,
} from '@/components/settings';

const Settings = () => {
  // Performance tracking
  usePerformance({
    componentName: 'Settings',
    trackRenders: true,
    trackMounts: true,
    reportThreshold: 16,
  });

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);

  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const { isDevMode, toggleDevMode } = useDevMode();
  
  // Save state tracking
  const [profileSaveState, setProfileSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [passwordSaveState, setPasswordSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Security - Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [rebookingReminders, setRebookingReminders] = useState(true);

  // Profile data
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [colorLine, setColorLine] = useState('');
  const [location, setLocation] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');

  // New stylist fields
  const [instagramHandle, setInstagramHandle] = useState('');
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [preferredComm, setPreferredComm] = useState('app');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState('0');
  const [acceptsNewClients, setAcceptsNewClients] = useState(true);
  const [maxClientsPerDay, setMaxClientsPerDay] = useState('8');
  const [parkingInstructions, setParkingInstructions] = useState('');
  const [specialAccommodations, setSpecialAccommodations] = useState('');

  // New client fields
  const [birthday, setBirthday] = useState('');
  const [hairGoals, setHairGoals] = useState('');
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [sensitivityNotes, setSensitivityNotes] = useState('');
  const [communicationPref, setCommunicationPref] = useState('app');
  const [specialRequests, setSpecialRequests] = useState('');

  // AI Systems
  const [aiEnabled, setAiEnabled] = useState(true); // Default enabled
  const [aiLoading, setAiLoading] = useState(false);

  // Account data
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [phoneError, setPhoneError] = useState<string>();

  useEffect(() => {
    // Wait for auth and roles to be fully loaded
    if (!authLoading && !roleLoading && user && roles.length > 0) {
      const primaryRole = roles.includes('stylist') ? 'stylist' : roles[0];
      setUserRole(primaryRole);
      loadUser(user, primaryRole);
    } else if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, roleLoading, user, roles]);

  const loadUser = async (sessionUser: any, primaryRole: string) => {
    try {
      setUserEmail(sessionUser.email || '');

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || '');
        setAvatarUrl(profile.avatar_url || '');
        setSelectedGender(profile.gender || '');
      }

      // Get stylist-specific data
      if (primaryRole === 'stylist') {
        const { data: stylistProfile } = await supabase
          .from('stylist_profiles')
          .select('*')
          .eq('user_id', sessionUser.id)
          .maybeSingle();

        if (stylistProfile) {
          setBusinessName(stylistProfile.business_name || '');
          setBio(stylistProfile.bio || '');
          setSpecialty(stylistProfile.specialty || '');
          setColorLine(stylistProfile.color_line || '');
          setLocation(stylistProfile.location || '');
          setYearsExperience(stylistProfile.years_experience?.toString() || '');
          setInstagramHandle(stylistProfile.social_media_instagram || '');
          setTiktokHandle(stylistProfile.social_media_tiktok || '');
          setFacebookUrl(stylistProfile.social_media_facebook || '');
          setBusinessPhone(stylistProfile.business_phone || '');
          setBusinessEmail(stylistProfile.business_email || '');
          setTimezone(stylistProfile.timezone || 'America/New_York');
          setPreferredComm(stylistProfile.preferred_communication || 'app');
          setCancellationPolicy(stylistProfile.cancellation_policy || '');
          setDepositRequired(stylistProfile.deposit_required || false);
          setDepositPercentage(
            stylistProfile.deposit_percentage?.toString() || '0'
          );
          setAcceptsNewClients(stylistProfile.accepts_new_clients ?? true);
          setMaxClientsPerDay(
            stylistProfile.max_clients_per_day?.toString() || '8'
          );
          setParkingInstructions(stylistProfile.parking_instructions || '');
          setSpecialAccommodations(stylistProfile.special_accommodations || '');
        }
      }

      // Get client-specific data
      if (primaryRole === 'client') {
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', sessionUser.id)
          .maybeSingle();

        if (clientProfile) {
          setBirthday(clientProfile.birthday || '');
          setHairGoals(clientProfile.hair_goals || '');
          setPreferredTimeOfDay(clientProfile.preferred_time_of_day || '');
          setReferralSource(clientProfile.referral_source || '');
          setSensitivityNotes(clientProfile.sensitivity_notes || '');
          setCommunicationPref(clientProfile.communication_preference || 'app');
          setSpecialRequests(clientProfile.special_requests || '');
        }
      }
    } catch (error: any) {
      logger.error('Error loading user', 'Settings', error as Error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const { handleSubmit: handleSaveProfile, isSubmitting: isSavingProfile } =
    useFormSubmit(
      async () => {
        setProfileSaveState('saving');
        
        try {
          // Validation
          if (!fullName?.trim()) {
            throw new Error('Name is required');
          }

          if (fullName.trim().length > 100) {
            throw new Error('Name must be less than 100 characters');
          }

          // Validate phone if provided
          if (phoneError) {
            throw new Error('Please fix phone number error');
          }

          if (bio.length > 1000) {
            throw new Error('Bio must be less than 1000 characters');
          }

          if (businessName.length > 100) {
            throw new Error('Business name must be less than 100 characters');
          }

          if (location.length > 200) {
            throw new Error('Location must be less than 200 characters');
          }

          const yearsExp = yearsExperience ? parseInt(yearsExperience) : 0;
          if (yearsExp < 0 || yearsExp > 100) {
            throw new Error('Years of experience must be between 0 and 100');
          }

          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) throw new Error('Not authenticated');

          // Update profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              full_name: fullName.trim(),
              avatar_url: avatarUrl,
              gender: selectedGender,
            })
            .eq('id', session.user.id);

          if (profileError) throw profileError;

          // Update stylist profile if applicable
          if (userRole === 'stylist') {
            const depositPct = depositPercentage
              ? parseFloat(depositPercentage)
              : 0;
            const maxClients = maxClientsPerDay ? parseInt(maxClientsPerDay) : 8;

            const { error: stylistError } = await supabase
              .from('stylist_profiles')
              .update({
                business_name: businessName.trim() || null,
                bio: bio.trim() || null,
                specialty: specialty.trim() || null,
                color_line: colorLine.trim() || null,
                location: location.trim() || null,
                years_experience: yearsExp || null,
                social_media_instagram: instagramHandle.trim() || null,
                social_media_tiktok: tiktokHandle.trim() || null,
                social_media_facebook: facebookUrl.trim() || null,
                business_phone: businessPhone.trim() || null,
                business_email: businessEmail.trim() || null,
                timezone: timezone,
                preferred_communication: preferredComm,
                cancellation_policy: cancellationPolicy.trim() || null,
                deposit_required: depositRequired,
                deposit_percentage: depositPct,
                accepts_new_clients: acceptsNewClients,
                max_clients_per_day: maxClients,
                parking_instructions: parkingInstructions.trim() || null,
                special_accommodations: specialAccommodations.trim() || null,
              })
              .eq('user_id', session.user.id);

            if (stylistError) throw stylistError;
          }

          // Update client profile if applicable
          if (userRole === 'client') {
            const { error: clientError } = await supabase
              .from('client_profiles')
              .update({
                birthday: birthday || null,
                hair_goals: hairGoals.trim() || null,
                preferred_time_of_day: preferredTimeOfDay || null,
                referral_source: referralSource.trim() || null,
                sensitivity_notes: sensitivityNotes.trim() || null,
                communication_preference: communicationPref,
                special_requests: specialRequests.trim() || null,
              })
              .eq('user_id', session.user.id);

            if (clientError) throw clientError;
          }

          // Flash save button with success state
          const saveButton = document.querySelector('[data-save-profile]');
          if (saveButton) {
            saveButton.classList.add('animate-pulse', 'bg-green-500');
            setTimeout(() => {
              saveButton.classList.remove('animate-pulse', 'bg-green-500');
            }, 2000);
          }

          setHasChanges(false);
          setProfileSaveState('saved');
          setTimeout(() => setProfileSaveState('idle'), 3000);
        } catch (error) {
          setProfileSaveState('error');
          setTimeout(() => setProfileSaveState('idle'), 5000);
          throw error;
        }
      },
      {
        successMessage: 'Profile saved successfully',
        errorMessage: 'Failed to save profile',
      }
    );

  const handleGenderChange = (value: string) => {
    setSelectedGender(value);
    setHasChanges(true);
  };

  const handleExportData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const exportData = {
        email: userEmail,
        full_name: fullName,
        business_name: businessName,
        bio,
        specialty,
        color_line: colorLine,
        location,
        years_experience: yearsExperience,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hair-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error: any) {
      logger.error('Error exporting data', 'Settings', error as Error);
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ Delete Account Permanently?\n\nThis action CANNOT be undone.\n\nAll your data including:\n• Client profiles\n• Formulas\n• Appointments\n• Settings\n\nWill be permanently deleted.\n\nType DELETE to confirm.'
    );
    if (!confirmed) return;

    try {
      await supabase.auth.signOut();
      toast.success('Please contact support to complete account deletion');
      navigate('/auth');
    } catch (error: any) {
      logger.error('Error deleting account', 'Settings', error as Error);
      toast.error('Failed to delete account');
    }
  };

  const {
    handleSubmit: handlePasswordChange,
    isSubmitting: isChangingPassword,
  } = useFormSubmit(
    async () => {
      setPasswordSaveState('saving');
      
      try {
        const errors: {
          currentPassword?: string;
          newPassword?: string;
          confirmPassword?: string;
        } = {};

        if (!currentPassword) {
          errors.currentPassword = 'Current password is required';
        }

        if (!newPassword) {
          errors.newPassword = 'New password is required';
        } else if (newPassword.length < 8) {
          errors.newPassword = 'Password must be at least 8 characters';
        }

        if (!confirmPassword) {
          errors.confirmPassword = 'Please confirm your new password';
        } else if (newPassword !== confirmPassword) {
          errors.confirmPassword = "Passwords don't match";
        }

        if (Object.keys(errors).length > 0) {
          setPasswordErrors(errors);
          throw new Error('Validation failed');
        }

        setPasswordErrors({});

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordErrors({});
        
        setPasswordSaveState('saved');
        setTimeout(() => setPasswordSaveState('idle'), 3000);
      } catch (error) {
        setPasswordSaveState('error');
        setTimeout(() => setPasswordSaveState('idle'), 5000);
        throw error;
      }
    },
    {
      successMessage: 'Password changed successfully',
      errorMessage: 'Failed to change password',
    }
  );

  const handlePreviewProfile = () => {
    if (userRole === 'stylist') {
      // Open stylist profile in new tab
      window.open(`/stylist/${user?.id}`, '_blank');
    } else {
      toast.info('Profile preview is available for stylists');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PageHeader
        title="Settings"
        icon={<SettingsIcon className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList
            className={cn(
              'grid w-full',
              userRole === 'stylist' ? 'grid-cols-7' : 'grid-cols-6'
            )}
          >
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="ai-systems" className="text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            {userRole === 'stylist' && (
              <TabsTrigger value="zapier" className="text-xs sm:text-sm">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Zapier</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="preferences" className="text-xs sm:text-sm">
              <Sliders className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Prefs</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Developer Mode Toggle - Prominent Position */}
            <Card className="border-brutal">
              <CardHeader className={mobileFirst.padding.md}>
                <CardTitle className={cn(mobileFirst.text.lg, "flex items-center gap-2")}>
                  <Code className="h-5 w-5" />
                  Developer Mode
                </CardTitle>
                <CardDescription className={mobileFirst.text.sm}>
                  Enable debug tools and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className={mobileFirst.padding.md}>
                <div className={cn("flex items-center justify-between border-2 border-foreground/10 rounded-lg bg-muted/30", mobileFirst.padding.md)}>
                  <div className="space-y-0.5">
                    <Label htmlFor="dev-mode-top" className={cn(mobileFirst.text.sm, "font-semibold break-words")}>
                      Show Debug Tools
                    </Label>
                    <p className={cn(mobileFirst.text.xs, "text-muted-foreground break-words")}>
                      Display performance metrics, error tracking, and testing
                      utilities
                    </p>
                  </div>
                  <Switch
                    id="dev-mode-top"
                    checked={isDevMode}
                    onCheckedChange={toggleDevMode}
                  />
                </div>
              </CardContent>
            </Card>

            <ProfileSettings
              fullName={fullName}
              setFullName={setFullName}
              businessName={businessName}
              setBusinessName={setBusinessName}
              bio={bio}
              setBio={setBio}
              specialty={specialty}
              setSpecialty={setSpecialty}
              colorLine={colorLine}
              setColorLine={setColorLine}
              location={location}
              setLocation={setLocation}
              yearsExperience={yearsExperience}
              setYearsExperience={setYearsExperience}
              instagramHandle={instagramHandle}
              setInstagramHandle={setInstagramHandle}
              tiktokHandle={tiktokHandle}
              setTiktokHandle={setTiktokHandle}
              facebookUrl={facebookUrl}
              setFacebookUrl={setFacebookUrl}
              birthday={birthday}
              setBirthday={setBirthday}
              hairGoals={hairGoals}
              setHairGoals={setHairGoals}
              preferredTimeOfDay={preferredTimeOfDay}
              setPreferredTimeOfDay={setPreferredTimeOfDay}
              referralSource={referralSource}
              setReferralSource={setReferralSource}
              userRole={userRole}
              onFieldChange={() => setHasChanges(true)}
            />

            {userRole === 'stylist' && (
              <BusinessSettings
                businessPhone={businessPhone}
                setBusinessPhone={setBusinessPhone}
                businessEmail={businessEmail}
                setBusinessEmail={setBusinessEmail}
                timezone={timezone}
                setTimezone={setTimezone}
                preferredComm={preferredComm}
                setPreferredComm={setPreferredComm}
                maxClientsPerDay={maxClientsPerDay}
                setMaxClientsPerDay={setMaxClientsPerDay}
                acceptsNewClients={acceptsNewClients}
                setAcceptsNewClients={setAcceptsNewClients}
                depositRequired={depositRequired}
                setDepositRequired={setDepositRequired}
                depositPercentage={depositPercentage}
                setDepositPercentage={setDepositPercentage}
                cancellationPolicy={cancellationPolicy}
                setCancellationPolicy={setCancellationPolicy}
                parkingInstructions={parkingInstructions}
                setParkingInstructions={setParkingInstructions}
                specialAccommodations={specialAccommodations}
                setSpecialAccommodations={setSpecialAccommodations}
                phoneError={phoneError}
                setPhoneError={setPhoneError}
                onFieldChange={() => setHasChanges(true)}
              />
            )}

            {userRole === 'client' && (
              <ClientSettings
                communicationPref={communicationPref}
                setCommunicationPref={setCommunicationPref}
                sensitivityNotes={sensitivityNotes}
                setSensitivityNotes={setSensitivityNotes}
                specialRequests={specialRequests}
                setSpecialRequests={setSpecialRequests}
                onFieldChange={() => setHasChanges(true)}
              />
            )}

            <Card className="brutal-border shadow-brutal-md">
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-semibold capitalize">{userRole}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    To change your account type, please contact support
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate('/help')}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Tutorial
                </Button>
              </CardContent>
            </Card>

            {/* Debug Tools - Only visible in dev mode */}
            {isDevMode && (
              <Card className="brutal-border shadow-brutal-md border-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Debug & Testing Tools
                  </CardTitle>
                  <CardDescription>
                    Development and testing utilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sentry Error Monitoring</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Test error tracking by triggering a sample error
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        // Trigger test error for Sentry
                        throw new Error(
                          'Test error from Settings - Sentry is working! 🎉'
                        );
                      }}
                      className="w-full"
                    >
                      Trigger Test Error
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySettings
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              passwordErrors={passwordErrors}
              isChangingPassword={isChangingPassword}
              passwordSaveState={passwordSaveState}
              onPasswordChange={handlePasswordChange}
            />
            <PrivacySettings userId={user?.id || ''} userRole={userRole} />
            <DataExport />
            <AccountDeletion />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <PushNotificationSettings />
            <Card className="border-brutal">
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Manage communication preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg">
                  <Label>Email Notifications</Label>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Systems Tab */}
          <TabsContent value="ai-systems" className="space-y-6">
            <Card className="border-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Systems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
              </CardContent>
            </Card>
          </TabsContent>

          {userRole === 'stylist' && (
            <TabsContent value="zapier"><ZapierSettings /></TabsContent>
          )}

          <TabsContent value="preferences"><MobileNavCustomizer userRole={userRole} /></TabsContent>
        </Tabs>

        {hasChanges && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card brutal-border shadow-brutal-md rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 z-50 max-w-[90vw] sm:max-w-none min-h-[56px]">
            <p className="text-xs sm:text-sm font-medium text-center sm:text-left">
              You have unsaved changes
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-xs sm:text-sm"
                onClick={() => {
                  if (user && roles.length > 0) {
                    const primaryRole = roles.includes('stylist')
                      ? 'stylist'
                      : roles[0];
                    loadUser(user, primaryRole);
                  }
                  setHasChanges(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 sm:flex-none text-xs sm:text-sm"
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
