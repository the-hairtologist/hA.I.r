import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Shield, Bell, Loader2, RefreshCw, Lock, ExternalLink, Image, DollarSign, Mail, Calendar, Sun, Moon, Monitor, Eye } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validatePhone } from "@/lib/phoneValidation";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import { DataExport } from "@/components/DataExport";
import { AccountDeletion } from "@/components/AccountDeletion";
import { PrivacySettings } from "@/components/PrivacySettings";
import { HelpTooltip } from "@/components/HelpTooltip";
import { useTheme } from "next-themes";
import { Switch as ThemeSwitch } from "@/components/ui/switch";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);
  
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  // Security - Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [rebookingReminders, setRebookingReminders] = useState(true);

  // Profile data
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [colorLine, setColorLine] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  // New stylist fields
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [preferredComm, setPreferredComm] = useState("app");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState("0");
  const [acceptsNewClients, setAcceptsNewClients] = useState(true);
  const [maxClientsPerDay, setMaxClientsPerDay] = useState("8");
  const [parkingInstructions, setParkingInstructions] = useState("");
  const [specialAccommodations, setSpecialAccommodations] = useState("");

  // New client fields
  const [birthday, setBirthday] = useState("");
  const [hairGoals, setHairGoals] = useState("");
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [sensitivityNotes, setSensitivityNotes] = useState("");
  const [communicationPref, setCommunicationPref] = useState("app");
  const [specialRequests, setSpecialRequests] = useState("");

  // Account data
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [phoneError, setPhoneError] = useState<string>();

  useEffect(() => {
    // Wait for auth and roles to be fully loaded
    if (!authLoading && !roleLoading && user && roles.length > 0) {
      const primaryRole = roles.includes('stylist') ? 'stylist' : roles[0];
      setUserRole(primaryRole);
      loadUser(user, primaryRole);
    } else if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, roleLoading, user, roles]);

  const loadUser = async (sessionUser: any, primaryRole: string) => {
    try {
      setUserEmail(sessionUser.email || "");

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || "");
        setAvatarUrl(profile.avatar_url || "");
        setSelectedGender(profile.gender || "");
      }

      // Get stylist-specific data
      if (primaryRole === "stylist") {
        const { data: stylistProfile } = await supabase
          .from("stylist_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();

        if (stylistProfile) {
          setBusinessName(stylistProfile.business_name || "");
          setBio(stylistProfile.bio || "");
          setSpecialty(stylistProfile.specialty || "");
          setColorLine(stylistProfile.color_line || "");
          setLocation(stylistProfile.location || "");
          setYearsExperience(stylistProfile.years_experience?.toString() || "");
          setInstagramHandle(stylistProfile.social_media_instagram || "");
          setTiktokHandle(stylistProfile.social_media_tiktok || "");
          setFacebookUrl(stylistProfile.social_media_facebook || "");
          setBusinessPhone(stylistProfile.business_phone || "");
          setBusinessEmail(stylistProfile.business_email || "");
          setTimezone(stylistProfile.timezone || "America/New_York");
          setPreferredComm(stylistProfile.preferred_communication || "app");
          setCancellationPolicy(stylistProfile.cancellation_policy || "");
          setDepositRequired(stylistProfile.deposit_required || false);
          setDepositPercentage(stylistProfile.deposit_percentage?.toString() || "0");
          setAcceptsNewClients(stylistProfile.accepts_new_clients ?? true);
          setMaxClientsPerDay(stylistProfile.max_clients_per_day?.toString() || "8");
          setParkingInstructions(stylistProfile.parking_instructions || "");
          setSpecialAccommodations(stylistProfile.special_accommodations || "");
        }
      }

      // Get client-specific data
      if (primaryRole === "client") {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();

        if (clientProfile) {
          setBirthday(clientProfile.birthday || "");
          setHairGoals(clientProfile.hair_goals || "");
          setPreferredTimeOfDay(clientProfile.preferred_time_of_day || "");
          setReferralSource(clientProfile.referral_source || "");
          setSensitivityNotes(clientProfile.sensitivity_notes || "");
          setCommunicationPref(clientProfile.communication_preference || "app");
          setSpecialRequests(clientProfile.special_requests || "");
        }
      }
    } catch (error: any) {
      console.error("Error loading user:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // Prevent double submission
    if (isSaving) {
      return;
    }

    // Validate required fields
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }

    if (fullName.trim().length > 100) {
      toast.error("Name must be less than 100 characters");
      return;
    }

    // Validate phone if provided
    if (phoneError) {
      toast.error("Please fix phone number error");
      return;
    }

    if (bio.length > 1000) {
      toast.error("Bio must be less than 1000 characters");
      return;
    }

    if (businessName.length > 100) {
      toast.error("Business name must be less than 100 characters");
      return;
    }

    if (location.length > 200) {
      toast.error("Location must be less than 200 characters");
      return;
    }

    const yearsExp = yearsExperience ? parseInt(yearsExperience) : 0;
    if (yearsExp < 0 || yearsExp > 100) {
      toast.error("Years of experience must be between 0 and 100");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
          gender: selectedGender
        })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      // Update stylist profile if applicable
      if (userRole === "stylist") {
        const depositPct = depositPercentage ? parseFloat(depositPercentage) : 0;
        const maxClients = maxClientsPerDay ? parseInt(maxClientsPerDay) : 8;

        const { error: stylistError } = await supabase
          .from("stylist_profiles")
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
            special_accommodations: specialAccommodations.trim() || null
          })
          .eq("user_id", session.user.id);

        if (stylistError) throw stylistError;
      }

      // Update client profile if applicable
      if (userRole === "client") {
        const { error: clientError } = await supabase
          .from("client_profiles")
          .update({
            birthday: birthday || null,
            hair_goals: hairGoals.trim() || null,
            preferred_time_of_day: preferredTimeOfDay || null,
            referral_source: referralSource.trim() || null,
            sensitivity_notes: sensitivityNotes.trim() || null,
            communication_preference: communicationPref,
            special_requests: specialRequests.trim() || null
          })
          .eq("user_id", session.user.id);

        if (clientError) throw clientError;
      }

      toast.success("Profile updated successfully");
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenderChange = (value: string) => {
    setSelectedGender(value);
    const genderAvatars: Record<string, string> = {
      male: "/src/assets/avatar-male-lego.png",
      female: "/src/assets/avatar-female-lego.png",
      neutral: "/src/assets/avatar-neutral-lego.png",
    };
    if (genderAvatars[value]) {
      setAvatarUrl(genderAvatars[value]);
    }
    setHasChanges(true);
  };

  const handleExportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
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
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hair-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

    try {
      await supabase.auth.signOut();
      toast.success("Please contact support to complete account deletion");
      navigate("/auth");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePreviewProfile = () => {
    if (userRole === "stylist") {
      // Open stylist profile in new tab
      window.open(`/stylist/${user?.id}`, '_blank');
    } else {
      toast.info("Profile preview is available for stylists");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="preferences" className="text-xs sm:text-sm">
              <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Prefs</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {userRole === "stylist" 
                    ? "Manage your business profile and professional details"
                    : "Manage your personal profile"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setHasChanges(true); }}
                    placeholder="Your full name"
                  />
                </div>

                {userRole === "stylist" && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <HelpTooltip
                          title="Business Name"
                          content={{
                            stylist: "Your salon or studio name that clients will see. If you work independently, you can use your name or create a brand name."
                          }}
                          examples={[
                            "The Color Studio",
                            "Sarah's Hair Lounge",
                            "Mane Street Salon"
                          ]}
                        />
                      </div>
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => { setBusinessName(e.target.value); setHasChanges(true); }}
                        placeholder="Your salon or business name"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="bio">Bio</Label>
                        <HelpTooltip
                          title="Professional Bio"
                          content={{
                            stylist: "Your bio is your first impression. Share your experience, what you love about hair, and what makes you unique. Keep it friendly and authentic!"
                          }}
                          tips={[
                            "Mention your years of experience",
                            "Share what you specialize in",
                            "Add a personal touch - why do you love hair?",
                            "Keep it conversational, not formal"
                          ]}
                        />
                      </div>
                      <TextareaWithCounter
                        id="bio"
                        value={bio}
                        onValueChange={(value) => {
                          setBio(value);
                          setHasChanges(true);
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
                              stylist: "What do you do best? This helps clients find you when searching for specific services."
                            }}
                            examples={[
                              "Balayage & Dimensional Color",
                              "Color Correction Specialist",
                              "Curly Hair Expert",
                              "Extensions & Length",
                              "Men's Cuts & Styling"
                            ]}
                          />
                        </div>
                        <Input
                          id="specialty"
                          value={specialty}
                          onChange={(e) => { setSpecialty(e.target.value); setHasChanges(true); }}
                          placeholder="e.g., Balayage, Color Correction"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="colorLine">Color Line</Label>
                          <HelpTooltip
                            title="Preferred Color Line"
                            content={{
                              stylist: "The professional color brand you use. This matters to clients who have preferences or allergies to certain brands."
                            }}
                            examples={[
                              "Redken",
                              "Wella Professionals",
                              "Schwarzkopf",
                              "L'Oréal Professional",
                              "Pulp Riot"
                            ]}
                          />
                        </div>
                        <Input
                          id="colorLine"
                          value={colorLine}
                          onChange={(e) => { setColorLine(e.target.value); setHasChanges(true); }}
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
                              stylist: "Where you work. This helps clients nearby find you. You can include neighborhood or general area - no need for full address."
                            }}
                            examples={[
                              "Downtown Seattle, WA",
                              "Brooklyn, NY",
                              "Austin, TX - Domain Area"
                            ]}
                          />
                        </div>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => { setLocation(e.target.value); setHasChanges(true); }}
                          placeholder="City, State"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="yearsExperience">Years of Experience</Label>
                          <HelpTooltip
                            title="Experience Level"
                            content={{
                              stylist: "How long you've been doing hair professionally. Be honest - all experience levels are valuable!"
                            }}
                            tips={[
                              "Count from when you got licensed",
                              "New stylists (0-2 years) often attract clients looking for good prices",
                              "Experienced stylists (5+ years) can charge premium rates"
                            ]}
                          />
                        </div>
                        <Input
                          id="yearsExperience"
                          type="number"
                          value={yearsExperience}
                          onChange={(e) => { setYearsExperience(e.target.value); setHasChanges(true); }}
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
                            onChange={(e) => { setInstagramHandle(e.target.value); setHasChanges(true); }}
                            placeholder="@yourhandle"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tiktok">TikTok</Label>
                          <Input
                            id="tiktok"
                            value={tiktokHandle}
                            onChange={(e) => { setTiktokHandle(e.target.value); setHasChanges(true); }}
                            placeholder="@yourhandle"
                          />
                        </div>
                        <div>
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            value={facebookUrl}
                            onChange={(e) => { setFacebookUrl(e.target.value); setHasChanges(true); }}
                            placeholder="Profile URL"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Business Contact */}
                    <div className="pt-4 border-t">
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
                            onChange={(e) => { setBusinessPhone(e.target.value); setHasChanges(true); }}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="businessEmail">Business Email</Label>
                          <Input
                            id="businessEmail"
                            type="email"
                            value={businessEmail}
                            onChange={(e) => { setBusinessEmail(e.target.value); setHasChanges(true); }}
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
                                  stylist: "Your timezone ensures appointment times are shown correctly to clients in different locations."
                                }}
                              />
                            </div>
                            <Select value={timezone} onValueChange={(value) => { setTimezone(value); setHasChanges(true); }}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                                <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                                <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="preferredComm">Communication Preference</Label>
                            <Select value={preferredComm} onValueChange={(value) => { setPreferredComm(value); setHasChanges(true); }}>
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
                              <Label htmlFor="maxClientsPerDay">Max Clients Per Day</Label>
                              <HelpTooltip
                                content={{
                                  stylist: "Set a realistic limit to avoid burnout. Most stylists handle 4-8 clients per day."
                                }}
                              />
                            </div>
                            <Input
                              id="maxClientsPerDay"
                              type="number"
                              value={maxClientsPerDay}
                              onChange={(e) => { setMaxClientsPerDay(e.target.value); setHasChanges(true); }}
                              min="1"
                              max="20"
                              placeholder="8"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg">
                            <div className="space-y-0.5">
                              <Label htmlFor="acceptsNewClients" className="font-semibold">Accepting New Clients</Label>
                              <p className="text-xs text-muted-foreground">Toggle when your books are full</p>
                            </div>
                            <ThemeSwitch
                              id="acceptsNewClients"
                              checked={acceptsNewClients}
                              onCheckedChange={(checked) => { setAcceptsNewClients(checked); setHasChanges(true); }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 border-2 border-foreground/10 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <ThemeSwitch
                                id="depositRequired"
                                checked={depositRequired}
                                onCheckedChange={(checked) => { setDepositRequired(checked); setHasChanges(true); }}
                              />
                              <Label htmlFor="depositRequired" className="font-semibold">Require Deposit</Label>
                              <HelpTooltip
                                content={{
                                  stylist: "Deposits reduce no-shows. Typical range is 25-50% for most services."
                                }}
                              />
                            </div>
                            {depositRequired && (
                              <div className="ml-8">
                                <Label htmlFor="depositPercentage" className="text-sm">Deposit Percentage (%)</Label>
                                <Input
                                  id="depositPercentage"
                                  type="number"
                                  value={depositPercentage}
                                  onChange={(e) => { setDepositPercentage(e.target.value); setHasChanges(true); }}
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
                            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                            <HelpTooltip
                              content={{
                                stylist: "Clear policies protect your time and income. Be specific about notice requirements and fees."
                              }}
                            />
                          </div>
                          <TextareaWithCounter
                            id="cancellationPolicy"
                            value={cancellationPolicy}
                            onValueChange={(value) => {
                              setCancellationPolicy(value);
                              setHasChanges(true);
                            }}
                            placeholder="e.g., 24-hour cancellation notice required. No-shows will be charged 50%."
                            maxLength={500}
                          />
                        </div>

                        <div>
                          <Label htmlFor="parkingInstructions">Parking Instructions (Optional)</Label>
                          <TextareaWithCounter
                            id="parkingInstructions"
                            value={parkingInstructions}
                            onValueChange={(value) => {
                              setParkingInstructions(value);
                              setHasChanges(true);
                            }}
                            placeholder="e.g., Free street parking available. Parking garage entrance on 5th Avenue."
                            maxLength={300}
                          />
                        </div>

                        <div>
                          <Label htmlFor="specialAccommodations">Special Accommodations (Optional)</Label>
                          <TextareaWithCounter
                            id="specialAccommodations"
                            value={specialAccommodations}
                            onValueChange={(value) => {
                              setSpecialAccommodations(value);
                              setHasChanges(true);
                            }}
                            placeholder="e.g., Wheelchair accessible, quiet space available for sensory-sensitive clients."
                            maxLength={300}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Client-specific fields */}
                {userRole === "client" && (
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
                            onChange={(e) => { setBirthday(e.target.value); setHasChanges(true); }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">🎉 We'll send you a birthday treat!</p>
                        </div>

                        <div>
                          <Label htmlFor="preferredTimeOfDay">Preferred Appointment Time</Label>
                          <Select value={preferredTimeOfDay} onValueChange={(value) => { setPreferredTimeOfDay(value); setHasChanges(true); }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time preference" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                              <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Label htmlFor="hairGoals">Hair Goals (Optional)</Label>
                      <TextareaWithCounter
                        id="hairGoals"
                        value={hairGoals}
                        onValueChange={(value) => {
                          setHairGoals(value);
                          setHasChanges(true);
                        }}
                        placeholder="What are your hair goals? (e.g., grow it long, maintain healthy color, try a new style)"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Share your hair journey! This helps stylists understand your vision.
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3">Communication & Contact</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="communicationPref">How Should We Reach You?</Label>
                          <Select value={communicationPref} onValueChange={(value) => { setCommunicationPref(value); setHasChanges(true); }}>
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

                        <div>
                          <Label htmlFor="referralSource">How Did You Find Us? (Optional)</Label>
                          <Input
                            id="referralSource"
                            value={referralSource}
                            onChange={(e) => { setReferralSource(e.target.value); setHasChanges(true); }}
                            placeholder="e.g., Instagram, Friend, Google"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3">Important Information for Your Stylist</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor="sensitivityNotes">Allergies & Sensitivities (Optional)</Label>
                            <HelpTooltip
                              content={{
                                client: "List any allergies, product sensitivities, or scalp conditions. This keeps you safe!"
                              }}
                            />
                          </div>
                          <TextareaWithCounter
                            id="sensitivityNotes"
                            value={sensitivityNotes}
                            onValueChange={(value) => {
                              setSensitivityNotes(value);
                              setHasChanges(true);
                            }}
                            placeholder="Any product sensitivities, allergies, or things your stylist should know?"
                            maxLength={500}
                          />
                        </div>

                        <div>
                          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                          <TextareaWithCounter
                            id="specialRequests"
                            value={specialRequests}
                            onValueChange={(value) => {
                              setSpecialRequests(value);
                              setHasChanges(true);
                            }}
                            placeholder="Any preferences for your appointments? (e.g., quiet time, love chatting, need childcare nearby)"
                            maxLength={500}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={!hasChanges || isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                  {userRole === "stylist" && (
                    <Button 
                      variant="outline"
                      onClick={handlePreviewProfile}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Public Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account details and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={userEmail} disabled />
                </div>

                <div>
                  <Label htmlFor="gender">Avatar</Label>
                  <Select value={selectedGender} onValueChange={handleGenderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select avatar style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male Avatar</SelectItem>
                      <SelectItem value="female">Female Avatar</SelectItem>
                      <SelectItem value="neutral">Neutral Avatar</SelectItem>
                    </SelectContent>
                  </Select>
                  {avatarUrl && (
                    <img src={avatarUrl} alt="Avatar preview" className="mt-2 w-20 h-20 rounded-full" />
                  )}
                </div>

                <div className="pt-4 space-y-4">
                  <DataExport />
                  <AccountDeletion />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full sm:w-auto"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Password Requirements
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>At least 8 characters long</li>
                    <li>Mix of uppercase and lowercase recommended</li>
                    <li>Include numbers and special characters for stronger security</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <ThemeSwitch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="appointment-reminders" className="font-semibold">Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming appointments</p>
                    </div>
                    <ThemeSwitch
                      id="appointment-reminders"
                      checked={appointmentReminders}
                      onCheckedChange={setAppointmentReminders}
                    />
                  </div>

                  {userRole === "client" && (
                    <div className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="rebooking-reminders" className="font-semibold">Rebooking Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get notified when it's time to book again</p>
                      </div>
                      <ThemeSwitch
                        id="rebooking-reminders"
                        checked={rebookingReminders}
                        onCheckedChange={setRebookingReminders}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails" className="font-semibold">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive tips, offers, and updates</p>
                    </div>
                    <ThemeSwitch
                      id="marketing-emails"
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg opacity-50">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications" className="font-semibold">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive text message alerts (Coming Soon)</p>
                    </div>
                    <ThemeSwitch
                      id="sms-notifications"
                      checked={smsNotifications}
                      disabled
                    />
                  </div>
                </div>

                {userRole === "stylist" && (
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/email-settings")}
                      className="w-full"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Advanced Email Settings
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <PrivacySettings userId={user?.id || ''} userRole={userRole} />
            
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex flex-col items-center gap-2 h-auto py-3"
                    >
                      <Sun className="h-5 w-5" />
                      <span className="text-xs">Light</span>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex flex-col items-center gap-2 h-auto py-3"
                    >
                      <Moon className="h-5 w-5" />
                      <span className="text-xs">Dark</span>
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex flex-col items-center gap-2 h-auto py-3"
                    >
                      <Monitor className="h-5 w-5" />
                      <span className="text-xs">System</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
                <CardDescription>Jump to other settings and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userRole === "stylist" && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/portfolio")}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span>Portfolio Management</span>
                      </div>
                      <ExternalLink className="h-3 w-3" />
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/services")}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Services & Pricing</span>
                      </div>
                      <ExternalLink className="h-3 w-3" />
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/booking-page")}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <span>My Booking Page</span>
                      </div>
                      <ExternalLink className="h-3 w-3" />
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/email-settings")}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email Campaigns</span>
                      </div>
                      <ExternalLink className="h-3 w-3" />
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/integrations")}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Calendar Integration</span>
                      </div>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
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
                  onClick={() => navigate("/help")} 
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Tutorial
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {hasChanges && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 z-50 max-w-[90vw] sm:max-w-none min-h-[56px]">
            <p className="text-xs sm:text-sm font-medium text-center sm:text-left">You have unsaved changes</p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-none text-xs sm:text-sm"
                onClick={() => { 
                  if (user && roles.length > 0) {
                    const primaryRole = roles.includes('stylist') ? 'stylist' : roles[0];
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
