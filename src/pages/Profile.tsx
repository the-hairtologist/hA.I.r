import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, User, Loader2, Save, Upload } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Profile fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Stylist-specific fields
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [colorLine, setColorLine] = useState("");
  
  // Client-specific fields
  const [hairType, setHairType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get basic profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setEmail(profile.email);
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        setAvatarUrl(profile.avatar_url || "");
      }

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);

        // Load role-specific profile
        if (roleData.role === "stylist") {
          const { data: stylistProfile } = await supabase
            .from("stylist_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (stylistProfile) {
            setBusinessName(stylistProfile.business_name || "");
            setBio(stylistProfile.bio || "");
            setSpecialty(stylistProfile.specialty || "");
            setLocation(stylistProfile.location || "");
            setYearsExperience(stylistProfile.years_experience?.toString() || "");
            setColorLine(stylistProfile.color_line || "");
          }
        } else if (roleData.role === "client") {
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (clientProfile) {
            setHairType(clientProfile.hair_type || "");
            setAllergies(clientProfile.allergies || "");
            setNotes(clientProfile.notes || "");
          }
        }
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update basic profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
        })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      // Update role-specific profile
      if (userRole === "stylist") {
        const { error: stylistError } = await supabase
          .from("stylist_profiles")
          .update({
            business_name: businessName || null,
            bio: bio || null,
            specialty: specialty || null,
            location: location || null,
            years_experience: yearsExperience ? parseInt(yearsExperience) : null,
            color_line: colorLine || null,
          })
          .eq("user_id", session.user.id);

        if (stylistError) throw stylistError;
      } else if (userRole === "client") {
        const { error: clientError } = await supabase
          .from("client_profiles")
          .update({
            hair_type: hairType || null,
            allergies: allergies || null,
            notes: notes || null,
          })
          .eq("user_id", session.user.id);

        if (clientError) throw clientError;
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navigation userRole={userRole || undefined} userName={fullName} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Photo"}
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                  <p className="text-xs text-muted-foreground">Optional - for appointment reminders</p>
              </div>
            </CardContent>
          </Card>

          {/* Stylist-specific fields */}
          {userRole === "stylist" && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
                <CardDescription>Information visible to clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business/Salon Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Salon Elite"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients about your experience and specialties..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Color, Balayage, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      min="0"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Los Angeles, CA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorLine" className="text-base font-semibold">
                    Preferred Color Line <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="colorLine"
                    value={colorLine}
                    onChange={(e) => setColorLine(e.target.value)}
                    placeholder="e.g., Redken, Wella, Schwarzkopf, Goldwell, Matrix"
                    className={!colorLine.trim() ? "border-primary/50" : ""}
                  />
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">Critical for accuracy:</span> Your color line ensures AI formulas match your exact products and mixing ratios. Popular brands: Redken, Wella, Schwarzkopf, Goldwell, Matrix, Pravana, Pulp Riot, Joico, L'Oréal Professional
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client-specific fields */}
          {userRole === "client" && (
            <Card>
              <CardHeader>
                <CardTitle>Hair Information</CardTitle>
                <CardDescription>Help your stylist provide the best service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hairType">Hair Type</Label>
                  <Input
                    id="hairType"
                    value={hairType}
                    onChange={(e) => setHairType(e.target.value)}
                    placeholder="Fine, Medium, Thick, Curly, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies or Sensitivities</Label>
                  <Textarea
                    id="allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="List any known allergies to hair products or ingredients..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any other information your stylist should know..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Button type="submit" disabled={saving} className="w-full" size="lg">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Profile;
