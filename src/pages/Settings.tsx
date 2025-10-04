import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Shield, Bell, Loader2, Download, Trash2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);
  
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Profile data
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [colorLine, setColorLine] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  // Account data
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedGender, setSelectedGender] = useState("");

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

    if (bio.length > 500) {
      toast.error("Bio must be less than 500 characters");
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
        const { error: stylistError } = await supabase
          .from("stylist_profiles")
          .update({
            business_name: businessName.trim() || null,
            bio: bio.trim() || null,
            specialty: specialty.trim() || null,
            color_line: colorLine.trim() || null,
            location: location.trim() || null,
            years_experience: yearsExp || null
          })
          .eq("user_id", session.user.id);

        if (stylistError) throw stylistError;
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account">
              <Shield className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Bell className="h-4 w-4 mr-2" />
              Preferences
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
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => { setBusinessName(e.target.value); setHasChanges(true); }}
                        placeholder="Your salon or business name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => { setBio(e.target.value); setHasChanges(true); }}
                        placeholder="Tell clients about yourself"
                        rows={4}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="specialty">Specialty</Label>
                        <Input
                          id="specialty"
                          value={specialty}
                          onChange={(e) => { setSpecialty(e.target.value); setHasChanges(true); }}
                          placeholder="e.g., Balayage, Color Correction"
                        />
                      </div>

                      <div>
                        <Label htmlFor="colorLine">Color Line</Label>
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
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => { setLocation(e.target.value); setHasChanges(true); }}
                          placeholder="City, State"
                        />
                      </div>

                      <div>
                        <Label htmlFor="yearsExperience">Years of Experience</Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          value={yearsExperience}
                          onChange={(e) => { setYearsExperience(e.target.value); setHasChanges(true); }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button onClick={handleSaveProfile} disabled={!hasChanges}>
                  Save Profile
                </Button>
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

                <div className="pt-4 space-y-3">
                  <Button variant="outline" onClick={handleExportData} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>

                  <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
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

                <Button variant="outline" onClick={() => navigate("/help")} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Tutorial
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {hasChanges && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] rounded-lg p-4 flex items-center gap-4 z-50">
            <p className="text-sm font-medium">You have unsaved changes</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { 
                if (user && roles.length > 0) {
                  const primaryRole = roles.includes('stylist') ? 'stylist' : roles[0];
                  loadUser(user, primaryRole);
                }
                setHasChanges(false); 
              }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveProfile}>
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
