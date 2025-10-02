import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, User, Save, Loader2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // User profile state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Stylist-specific state
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [colorLine, setColorLine] = useState("");

  // Client-specific state
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

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setEmail(profile.email || "");
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
        } else {
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update main profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl,
        })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      // Update role-specific profile
      if (userRole === "stylist") {
        const { error: stylistError } = await supabase
          .from("stylist_profiles")
          .update({
            business_name: businessName,
            bio: bio,
            specialty: specialty,
            location: location,
            years_experience: yearsExperience ? parseInt(yearsExperience) : null,
            color_line: colorLine,
          })
          .eq("user_id", session.user.id);

        if (stylistError) throw stylistError;
      } else {
        const { error: clientError } = await supabase
          .from("client_profiles")
          .update({
            hair_type: hairType,
            allergies: allergies,
            notes: notes,
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
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">My Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="text-2xl">
                  {fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{fullName || "Your Profile"}</CardTitle>
                <CardDescription className="capitalize">{userRole} Account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile}>
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="specific">
                    {userRole === "stylist" ? "Business Info" : "Hair Info"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
                    <Input
                      id="avatarUrl"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="specific" className="space-y-4">
                  {userRole === "stylist" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Salon Name or Your Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell clients about yourself..."
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
                            placeholder="e.g., Color Specialist"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="yearsExperience">Years of Experience</Label>
                          <Input
                            id="yearsExperience"
                            type="number"
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
                          placeholder="City, State"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="colorLine">Preferred Color Line</Label>
                        <Input
                          id="colorLine"
                          value={colorLine}
                          onChange={(e) => setColorLine(e.target.value)}
                          placeholder="e.g., Redken, Wella"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="hairType">Hair Type</Label>
                        <Input
                          id="hairType"
                          value={hairType}
                          onChange={(e) => setHairType(e.target.value)}
                          placeholder="e.g., Fine, Thick, Curly"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies</Label>
                        <Textarea
                          id="allergies"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          placeholder="List any product allergies..."
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
                    </>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
